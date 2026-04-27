// frontend/src/components/worker/QuestionDisplay.jsx
import React from 'react';

function QuestionDisplay({ question, selectedOption, onOptionSelect, answerSelectedForCurrentQuestion, timerActive }) {
    if (!question) {
        return <p>Loading question...</p>;
    }

    // Determine if the options should be disabled based on game state
    const shouldDisableOptions = answerSelectedForCurrentQuestion || !timerActive;

    return (
        <div>
            <p className="text-lg font-medium text-gray-900 mb-4">{question.questionText}</p>
            <div className="space-y-3">
                {question.options.map((option, index) => (
                    <label
                        key={index}
                        // Apply styling based on selection and disabled state
                        className={`flex items-center p-3 border rounded-lg cursor-pointer transition-all duration-200
                            ${selectedOption === index
                                ? 'bg-green-200 border-green-600 text-green-900 font-semibold'
                                : 'bg-gray-50 hover:bg-gray-100 border-gray-200'
                            }
                            ${shouldDisableOptions ? 'opacity-70 cursor-not-allowed' : ''}
                        `}
                    >
                        <input
                            type="radio"
                            name={`question-${question._id}`} // Unique name for radio group
                            value={index} // The value is the index
                            checked={selectedOption === index} // Controlled component: reflects selectedOption state
                            onChange={() => onOptionSelect(index)} // ONLY use onChange here for selection logic
                            disabled={shouldDisableOptions} // Disable the radio input itself
                            className="form-radio h-5 w-5 text-green-600"
                        />
                        <span className="ml-3 text-lg">{option}</span>
                    </label>
                ))}
            </div>
        </div>
    );
}

export default QuestionDisplay;