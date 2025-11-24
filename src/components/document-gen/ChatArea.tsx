import { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import MessageBubble from './MessageBubble';
import TaskInput from './TaskInput';
import ClarificationQuestions from './ClarificationQuestions';
import RefinementInput from './RefinementInput';

interface Message {
    id: string;
    type: 'system' | 'user' | 'agent' | 'thinking' | 'tool' | 'document-update';
    content: string;
    sources?: any[];
    questions?: any[];
    answers?: any;
    files?: any[];
    agent?: string;
    status?: string;
    toolName?: string;
    parameters?: any;
    result?: any;
}

interface Template {
    id: string;
    name: string;
    description: string;
    icon: any;
    color: string;
    features: string[];
}

interface ChatAreaProps {
    messages: Message[];
    isProcessing: boolean;
    stage: string;
    selectedTemplate: Template | null;
    pendingQuestions: string[] | null;
    onTaskSubmit: (task: string, files: any[]) => void;
    onClarificationSubmit: (answers: string[]) => void;
    onRefinementRequest: (request: string) => void;
}

export default function ChatArea({
    messages,
    isProcessing,
    stage,
    selectedTemplate,
    pendingQuestions,
    onTaskSubmit,
    onClarificationSubmit,
    onRefinementRequest
}: ChatAreaProps) {
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/50">
                <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
                    <span className="text-sm font-medium text-slate-700">
                        {selectedTemplate?.name || 'Conversation'}
                    </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                    {stage === 'task-input' && 'Describe your task'}
                    {stage === 'clarification' && 'Answering clarification questions'}
                    {stage === 'processing' && 'Agents are working on your document'}
                    {stage === 'complete' && 'Document ready - request refinements'}
                </p>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4">
                <AnimatePresence>
                    {messages.map((message: Message, index: number) => (
                        <motion.div
                            key={message.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ delay: index * 0.05 }}
                        >
                            <MessageBubble message={message} />
                        </motion.div>
                    ))}
                </AnimatePresence>
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="border-t border-slate-200 bg-white">
                {stage === 'task-input' && (
                    <TaskInput onSubmit={onTaskSubmit} isProcessing={isProcessing} />
                )}
                {stage === 'clarification' && pendingQuestions && !isProcessing && (
                    <ClarificationQuestions
                        questions={pendingQuestions}
                        onSubmit={onClarificationSubmit}
                    />
                )}
                {stage === 'complete' && (
                    <RefinementInput
                        onSubmit={onRefinementRequest}
                        isProcessing={isProcessing}
                    />
                )}
            </div>
        </div>
    );
}