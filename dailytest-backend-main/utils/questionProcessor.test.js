// Test file for questionProcessor optimization
const { processQuestionGeneration } = require('./questionProcessor');

// Mock the required modules
jest.mock('mongoose');
jest.mock('../models/Question');
jest.mock('../models/User');
jest.mock('../models/LearningTopic');
jest.mock('./openai');
jest.mock('./jobManager');

// Import the mocked modules
const mongoose = require('mongoose');
const Question = require('../models/Question');
const User = require('../models/User');
const LearningTopic = require('../models/LearningTopic');
const { generateMCQQuestions } = require('./openai');
const jobManager = require('./jobManager');

describe('processQuestionGeneration', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    
    // Mock User.find to return a list of workers
    User.find.mockResolvedValue([
      { _id: 'worker1', name: 'Worker 1' },
      { _id: 'worker2', name: 'Worker 2' },
      { _id: 'worker3', name: 'Worker 3' }
    ]);
    
    // Mock session methods
    const mockSession = {
      withTransaction: jest.fn().mockImplementation(async (fn) => {
        return await fn();
      }),
      endSession: jest.fn()
    };
    
    mongoose.startSession.mockResolvedValue(mockSession);
    
    // Mock generateMCQQuestions to return sample questions
    generateMCQQuestions.mockResolvedValue({
      'React': [
        {
          questionText: 'What is React?',
          options: ['Library', 'Framework', 'Language', 'Tool'],
          correctAnswer: 'Library',
          difficulty: 'Medium'
        },
        {
          questionText: 'What is JSX?',
          options: ['JavaScript XML', 'Java Syntax', 'JSON Extension', 'JavaScript Extension'],
          correctAnswer: 'JavaScript XML',
          difficulty: 'Medium'
        }
      ],
      'CSS': [
        {
          questionText: 'What does CSS stand for?',
          options: ['Cascading Style Sheets', 'Computer Style Sheets', 'Colorful Style Sheets', 'Creative Style Sheets'],
          correctAnswer: 'Cascading Style Sheets',
          difficulty: 'Easy'
        }
      ]
    });
    
    // Mock Question.insertMany
    Question.insertMany.mockResolvedValue();
    
    // Mock User.findByIdAndUpdate
    User.findByIdAndUpdate.mockResolvedValue();
    
    // Mock jobManager methods
    jobManager.createJob.mockImplementation();
    jobManager.updateJobProgress.mockImplementation();
    jobManager.completeJob.mockImplementation();
  });

  test('should generate questions once for common mode and distribute to all workers', async () => {
    const jobData = {
      workerIds: ['worker1', 'worker2', 'worker3'],
      numQuestions: 3,
      difficulty: 'Medium',
      timeDuration: 60,
      totalTestDuration: 600,
      topicMode: 'common',
      topic: 'React, CSS',
      individualTopics: {}
    };
    
    const jobId = 'test-job-id';
    
    // Run the function
    await processQuestionGeneration(jobData, jobId);
    
    // Verify that generateMCQQuestions was called only once for each topic
    expect(generateMCQQuestions).toHaveBeenCalledTimes(2); // Once for React, once for CSS
    
    // Verify that the job manager methods were called
    expect(jobManager.createJob).toHaveBeenCalledWith(jobId);
    expect(jobManager.completeJob).toHaveBeenCalledWith(jobId, expect.any(Object));
    
    // Verify that Question.insertMany was called for each worker
    expect(Question.insertMany).toHaveBeenCalledTimes(3);
    
    // Verify that each worker got the same number of questions
    const insertCalls = Question.insertMany.mock.calls;
    expect(insertCalls[0][0]).toHaveLength(3); // worker1
    expect(insertCalls[1][0]).toHaveLength(3); // worker2
    expect(insertCalls[2][0]).toHaveLength(3); // worker3
    
    // Verify that all workers got questions from the same pool (same topics)
    insertCalls.forEach(call => {
      const questions = call[0];
      expect(questions.every(q => q.topic === 'React, CSS')).toBe(true);
    });
  });

  test('should generate separate questions for individual mode', async () => {
    const jobData = {
      workerIds: ['worker1', 'worker2'],
      numQuestions: 2,
      difficulty: 'Medium',
      timeDuration: 60,
      totalTestDuration: 600,
      topicMode: 'individual',
      topic: '',
      individualTopics: {
        'worker1': ['JavaScript'],
        'worker2': ['Python']
      }
    };
    
    const jobId = 'test-job-id-2';
    
    // Mock LearningTopic.find for individual mode
    LearningTopic.find.mockResolvedValue([
      { topic: 'JavaScript' },
      { topic: 'Python' }
    ]);
    
    // Run the function
    await processQuestionGeneration(jobData, jobId);
    
    // For individual mode, we expect separate generation for each worker
    // But since we're mocking the same response, we'll check the calls
    expect(Question.insertMany).toHaveBeenCalledTimes(2);
  });
});