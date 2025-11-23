import React, { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, Loader2 } from 'lucide-react';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import MessageBubble from './MessageBubble';
import TaskInput from './TaskInput';
import ClarificationQuestions from './ClarificationQuestions';

export default function ChatArea({
  messages,
  isProcessing,
  stage,
  selectedTemplate,
  pendingQuestions,
  onTaskSubmit,
  onClarificationSubmit,
  onRefinementRequest
}) {
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleRefinementSubmit = (request) => {
    if (request.trim()) {
      onRefinementRequest(request);
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4">
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}

        {/* Current Stage Content */}
        {stage === 'task-input' && (
          <div className="mt-6">
            <TaskInput
              onSubmit={onTaskSubmit}
              isProcessing={isProcessing}
            />
          </div>
        )}

        {stage === 'clarification' && pendingQuestions && (
          <div className="mt-6">
            <ClarificationQuestions
              questions={pendingQuestions}
              onSubmit={onClarificationSubmit}
              isProcessing={isProcessing}
            />
          </div>
        )}

        {(stage === 'processing' || stage === 'complete') && (
          <div className="mt-6">
            <div className="bg-slate-50 rounded-xl p-6">
              <h3 className="text-sm font-medium text-slate-900 mb-3">
                Need changes? Request a refinement:
              </h3>
              <div className="flex gap-3">
                <Textarea
                  placeholder="Describe what you'd like to change..."
                  className="flex-1 min-h-[60px] resize-none"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleRefinementSubmit(e.target.value);
                      e.target.value = '';
                    }
                  }}
                />
                <Button
                  onClick={(e) => {
                    const textarea = e.target.closest('.flex').querySelector('textarea');
                    handleRefinementSubmit(textarea.value);
                    textarea.value = '';
                  }}
                  disabled={isProcessing}
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white"
                >
                  {isProcessing ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}
