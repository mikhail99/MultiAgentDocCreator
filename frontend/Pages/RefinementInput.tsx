import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Sparkles, Send } from 'lucide-react';

export default function RefinementInput({ onSubmit, isProcessing }) {
    const [request, setRequest] = useState('');

    const handleSubmit = () => {
        if (request.trim()) {
            onSubmit(request);
            setRequest('');
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
            handleSubmit();
        }
    };

    return (
        <div className="p-6 space-y-3 bg-gradient-to-br from-green-50 to-emerald-50">
            <div className="flex items-center gap-2 text-sm text-green-700">
                <Sparkles className="h-4 w-4" />
                <span className="font-medium">Document is ready! Request refinements below</span>
            </div>
            
            <Textarea
                placeholder="How would you like to improve the document? (e.g., 'Add more details on the methodology section' or 'Make the introduction more concise')"
                value={request}
                onChange={(e) => setRequest(e.target.value)}
                onKeyDown={handleKeyDown}
                className="min-h-[100px] resize-none text-sm bg-white border-slate-200 focus:border-emerald-400 focus:ring-emerald-400"
                disabled={isProcessing}
            />

            <div className="flex justify-between items-center">
                <span className="text-xs text-slate-500">
                    Press Cmd/Ctrl + Enter to send
                </span>
                <Button
                    onClick={handleSubmit}
                    disabled={!request.trim() || isProcessing}
                    className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white flex items-center gap-2"
                >
                    <Send className="h-4 w-4" />
                    {isProcessing ? 'Processing...' : 'Send Request'}
                </Button>
            </div>
        </div>
    );
}