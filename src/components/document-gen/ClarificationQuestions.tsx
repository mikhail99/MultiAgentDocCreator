import { useState } from 'react';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { CheckCircle2, Send } from 'lucide-react';

interface ClarificationQuestionsProps {
    questions: string[];
    onSubmit: (answers: string[]) => void;
}

export default function ClarificationQuestions({ questions, onSubmit }: ClarificationQuestionsProps) {
    const [answers, setAnswers] = useState(questions.map(() => ''));

    const handleAnswerChange = (index: number, value: string) => {
        const newAnswers = [...answers];
        newAnswers[index] = value;
        setAnswers(newAnswers);
    };

    const handleSubmit = () => {
        if (answers.every(a => a.trim())) {
            onSubmit(answers);
        }
    };

    const allAnswered = answers.every((a: string) => a.trim());

    return (
        <div className="p-6 space-y-4 bg-gradient-to-br from-indigo-50 to-purple-50">
            <div className="space-y-4">
                {questions.map((question: string, index: number) => (
                    <div key={index} className="space-y-2">
                        <div className="flex items-start gap-2">
                            <div className="flex-shrink-0 h-6 w-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-medium mt-0.5">
                                {index + 1}
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-medium text-slate-700 mb-2">{question}</p>
                                <Textarea
                                    placeholder="Your answer..."
                                    value={answers[index]}
                                    onChange={(e) => handleAnswerChange(index, e.target.value)}
                                    className="min-h-[80px] resize-none text-sm bg-white border-slate-200 focus:border-indigo-400 focus:ring-indigo-400"
                                />
                            </div>
                            {answers[index].trim() && (
                                <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                            )}
                        </div>
                    </div>
                ))}
            </div>

            <div className="flex justify-end pt-2">
                <Button
                    onClick={handleSubmit}
                    disabled={!allAnswered}
                    className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white flex items-center gap-2"
                >
                    <Send className="h-4 w-4" />
                    Submit Answers
                </Button>
            </div>
        </div>
    );
}