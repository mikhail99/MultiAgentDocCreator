import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, Loader2 } from 'lucide-react';

export default function ClarificationQuestions({ questions, onSubmit, isProcessing }) {
  const [answers, setAnswers] = useState(questions.map(() => ''));

  const handleAnswerChange = (index, value) => {
    const newAnswers = [...answers];
    newAnswers[index] = value;
    setAnswers(newAnswers);
  };

  const handleSubmit = () => {
    if (answers.every(answer => answer.trim())) {
      onSubmit(answers);
    }
  };

  const canSubmit = answers.every(answer => answer.trim()) && !isProcessing;

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-slate-900 mb-2">
          Clarification Needed
        </h3>
        <p className="text-sm text-slate-600">
          Please answer these questions to help our agents create the best document for you.
        </p>
      </div>

      <div className="space-y-4">
        {questions.map((question, index) => (
          <div key={index} className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">
              {question}
            </label>
            <Textarea
              value={answers[index]}
              onChange={(e) => handleAnswerChange(index, e.target.value)}
              placeholder="Your answer here..."
              className="min-h-[80px] resize-none"
              disabled={isProcessing}
            />
          </div>
        ))}
      </div>

      <div className="flex justify-end">
        <Button
          onClick={handleSubmit}
          disabled={!canSubmit}
          className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white flex items-center gap-2"
        >
          {isProcessing ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <Send className="h-4 w-4" />
              Submit Answers
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
