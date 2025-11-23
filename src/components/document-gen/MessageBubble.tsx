import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Check, Loader2, Brain, Zap, FileText, Upload } from 'lucide-react';
import { cn } from '../../lib/utils';
import { motion } from 'framer-motion';

export default function MessageBubble({ message }) {
    const [expanded, setExpanded] = useState(true);

    if (message.type === 'user') {
        return (
            <div className="flex justify-end">
                <div className="max-w-[80%]">
                    <div className="bg-gradient-to-br from-indigo-600 to-purple-600 text-white rounded-2xl rounded-tr-md px-5 py-3 shadow-lg">
                        <p className="text-sm leading-relaxed">{message.content}</p>
                        {message.files && message.files.length > 0 && (
                            <div className="mt-3 pt-3 border-t border-white/20 space-y-1">
                                {message.files.map((file, idx) => (
                                    <div key={idx} className="flex items-center gap-2 text-xs text-white/90">
                                        <Upload className="h-3 w-3" />
                                        {file.name}
                                    </div>
                                ))}
                            </div>
                        )}
                        {message.answers && (
                            <div className="mt-3 pt-3 border-t border-white/20 space-y-2">
                                {message.answers.map((answer, idx) => (
                                    <div key={idx} className="text-xs">
                                        <span className="text-white/70">Q{idx + 1}:</span>
                                        <span className="ml-2 text-white/90">{answer}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    if (message.type === 'system') {
        return (
            <div className="flex justify-center">
                <div className="bg-slate-100 text-slate-700 rounded-full px-4 py-2 text-xs font-medium">
                    {message.content}
                </div>
            </div>
        );
    }

    if (message.type === 'agent') {
        return (
            <div className="flex gap-3">
                <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center flex-shrink-0">
                    <Brain className="h-4 w-4 text-indigo-600" />
                </div>
                <div className="flex-1">
                    <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-md px-5 py-3 shadow-sm">
                        <p className="text-sm text-slate-700 leading-relaxed">{message.content}</p>
                        {message.questions && (
                            <div className="mt-4 space-y-2">
                                {message.questions.map((q, idx) => (
                                    <div key={idx} className="bg-slate-50 rounded-lg px-3 py-2 text-sm text-slate-600">
                                        <span className="font-medium text-indigo-600">Q{idx + 1}:</span> {q}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    if (message.type === 'thinking') {
        return (
            <div className="flex gap-3">
                <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center flex-shrink-0">
                    <Brain className="h-4 w-4 text-amber-600 animate-pulse" />
                </div>
                <div className="flex-1">
                    <button
                        onClick={() => setExpanded(!expanded)}
                        className="w-full text-left bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 hover:bg-amber-100 transition-colors"
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-medium text-amber-900">
                                    {message.agent || 'System'} thinking
                                </span>
                                {message.status === 'complete' && (
                                    <Check className="h-4 w-4 text-green-600" />
                                )}
                                {message.status === 'processing' && (
                                    <Loader2 className="h-4 w-4 text-amber-600 animate-spin" />
                                )}
                            </div>
                            {expanded ? (
                                <ChevronDown className="h-4 w-4 text-amber-600" />
                            ) : (
                                <ChevronRight className="h-4 w-4 text-amber-600" />
                            )}
                        </div>
                    </button>
                    {expanded && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="mt-2 bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-600 leading-relaxed"
                        >
                            {message.content}
                        </motion.div>
                    )}
                </div>
            </div>
        );
    }

    if (message.type === 'tool') {
        return (
            <div className="flex gap-3">
                <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center flex-shrink-0">
                    <Zap className="h-4 w-4 text-emerald-600" />
                </div>
                <div className="flex-1">
                    <button
                        onClick={() => setExpanded(!expanded)}
                        className="w-full text-left bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 hover:bg-emerald-100 transition-colors"
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-medium text-emerald-900">
                                    {message.toolName || 'Tool Call'}
                                </span>
                                {message.status === 'complete' && (
                                    <Check className="h-4 w-4 text-green-600" />
                                )}
                                {message.status === 'processing' && (
                                    <Loader2 className="h-4 w-4 text-emerald-600 animate-spin" />
                                )}
                            </div>
                            {expanded ? (
                                <ChevronDown className="h-4 w-4 text-emerald-600" />
                            ) : (
                                <ChevronRight className="h-4 w-4 text-emerald-600" />
                            )}
                        </div>
                    </button>
                    {expanded && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="mt-2 space-y-2"
                        >
                            {message.parameters && (
                                <div className="bg-white border border-slate-200 rounded-xl px-4 py-3">
                                    <p className="text-xs text-slate-500 mb-2">Parameters:</p>
                                    <pre className="text-xs text-slate-700 whitespace-pre-wrap">
                                        {JSON.stringify(message.parameters, null, 2)}
                                    </pre>
                                </div>
                            )}
                            {message.result && (
                                <div className="bg-white border border-slate-200 rounded-xl px-4 py-3">
                                    <p className="text-xs text-slate-500 mb-2">Result:</p>
                                    <p className="text-sm text-slate-700">{message.result}</p>
                                </div>
                            )}
                        </motion.div>
                    )}
                </div>
            </div>
        );
    }

    if (message.type === 'document-update') {
        return (
            <div className="flex gap-3">
                <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center flex-shrink-0">
                    <FileText className="h-4 w-4 text-blue-600" />
                </div>
                <div className="flex-1">
                    <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3">
                        <p className="text-sm font-medium text-blue-900">{message.content}</p>
                    </div>
                </div>
            </div>
        );
    }

    return null;
}