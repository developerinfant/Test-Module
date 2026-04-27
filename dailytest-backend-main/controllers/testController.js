// backend/controllers/testController.js
const TestAttempt = require('../models/TestAttempt');
const Question = require('../models/Question');
const Score = require('../models/Score');
const mongoose = require('mongoose');

// @desc    Submit worker test answers
// @route   POST /api/tests/submit/:testAttemptId
// @access  Private/Worker
const submitTest = async (req, res) => {
  const { testAttemptId } = req.params;
  const { answers: submittedAnswers } = req.body;

  if (!mongoose.Types.ObjectId.isValid(testAttemptId)) {
    return res.status(400).json({ message: 'Invalid Test Attempt ID.' });
  }

  try {
    // --- FIX: Fetch the latest version of the document right before updating ---
    // This prevents the VersionError by ensuring we have the most recent document state.
    const testAttempt = await TestAttempt.findById(testAttemptId);

    if (!testAttempt) {
      return res.status(404).json({ message: 'Test attempt not found.' });
    }
    if (testAttempt.status !== 'in-progress') {
      return res.status(400).json({ message: 'Test has already been submitted or is in an invalid state.' });
    }

    const questionIds = testAttempt.questions.map(id => id.toString());
    const questionsInTest = await Question.find({
      _id: { $in: questionIds }
    }).lean();

    const questionMap = new Map(
      questionsInTest.map(q => [q._id.toString(), q])
    );

    const recordedAnswers = submittedAnswers.map(({ questionId, selectedOption }) => {
      const q = questionMap.get(String(questionId));
      const isCorrect = !!q && (Number(selectedOption) === q.correctAnswer);
      return { questionId, selectedOption, isCorrect };
    });

    const score = recordedAnswers.filter(a => a.isCorrect).length;
    const totalQuestions = questionIds.length;

    // Update the attempt object
    testAttempt.answers = recordedAnswers;
    testAttempt.score = score;
    testAttempt.totalQuestions = totalQuestions;
    testAttempt.status = 'completed';
    // The `testEndTime` field is handled by Mongoose timestamps, so we don't need to set it manually.
    await testAttempt.save();

    // --- FIX: Update worker’s cumulative Score atomically ---
    // This is a more efficient and safer way to update the score.
    await Score.findOneAndUpdate(
      { worker: testAttempt.worker },
      { $inc: { totalScore: score } },
      { upsert: true, new: true } // Creates a new score doc if one doesn't exist
    );

    return res.status(200).json({
      message: 'Test submitted successfully!',
      score,
      totalQuestions,
      testAttemptId
    });
  } catch (err) {
    console.error('Error in submitTest:', err);
    return res.status(500).json({
      message: err.message || 'Server error submitting test.'
    });
  }
};


// @desc    Get scoreboard
// @route   GET /api/scores
// @access  Private/Admin, Private/Worker
const getScoreboard = async (req, res) => {
  const { date, workerId } = req.query; 

  try {
      let matchQuery = { status: 'completed' };
    
      if (workerId) {
          matchQuery.worker = new mongoose.Types.ObjectId(workerId);
      }

      if (date) {
          const startOfDay = new Date(date);
          startOfDay.setUTCHours(0, 0, 0, 0);

          const endOfDay = new Date(date);
          endOfDay.setUTCHours(23, 59, 59, 999);

          matchQuery.createdAt = {
              $gte: startOfDay,
              $lte: endOfDay
          };
      }

      let pipeline;

      if (date || workerId) { 
          pipeline = [
              { $match: matchQuery },
              { $lookup: { from: 'users', localField: 'worker', foreignField: '_id', as: 'workerInfo' }},
              { $unwind: '$workerInfo' },
              { $project: {
                  _id: '$_id',
                  worker: { _id: '$workerInfo._id', name: '$workerInfo.name', workerId: '$workerInfo.workerId' },
                  score: '$score',
                  totalQuestions: '$totalQuestions',
                  createdAt: '$createdAt',
                  topic: '$topic'
              }},
              { $sort: { score: -1, createdAt: -1 } }
          ];
      } else {
          pipeline = [
              { $match: { status: 'completed' } },
              { $group: {
                  _id: "$worker",
                  totalScore: { $sum: "$score" },
                  totalPossibleScore: { $sum: "$totalQuestions" },
              }},
              { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'workerInfo' }},
              { $unwind: '$workerInfo' },
              { $project: {
                  _id: '$_id',
                  worker: { _id: '$workerInfo._id', name: '$workerInfo.name', workerId: '$workerInfo.workerId' },
                  totalScore: '$totalScore',
                  totalPossibleScore: '$totalPossibleScore',
              }},
              { $sort: { totalScore: -1 } }
          ];
      }

      const scores = await TestAttempt.aggregate(pipeline);
      res.status(200).json(scores);
  } catch (error) {
      console.error("Error in getScoreboard:", error);
      res.status(500).json({ message: 'Server error fetching scoreboard.' });
  }
};

module.exports = {
    submitTest,
    getScoreboard,
};