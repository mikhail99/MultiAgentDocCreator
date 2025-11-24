import React from 'react';
import ReactMarkdown from 'react-markdown';
import { FileText, Download, Copy, Loader2 } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

export default function DocumentViewer({ document, selectedTemplate, isGenerating, sources = [] }) {
    const handleCopy = () => {
        navigator.clipboard.writeText(document);
        toast.success('Document copied to clipboard');
    };

    const handleDownload = () => {
        const blob = new Blob([document], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = window.document.createElement('a');
        a.href = url;
        a.download = `${selectedTemplate?.name || 'document'}.md`;
        a.click();
        URL.revokeObjectURL(url);
        toast.success('Document downloaded');
    };

    if (!document && !isGenerating) {
        return (
            <div className="h-full flex items-center justify-center p-12">
                <div className="text-center max-w-md">
                    <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center mx-auto mb-6">
                        <FileText className="h-10 w-10 text-slate-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-slate-700 mb-2">
                        No Document Yet
                    </h3>
                    <p className="text-sm text-slate-500 leading-relaxed">
                        Your generated document will appear here. Complete the task input and 
                        clarification questions to begin the generation process.
                    </p>
                </div>
            </div>
        );
    }

    if (isGenerating) {
        return (
            <div className="h-full flex items-center justify-center p-12">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center max-w-md"
                >
                    <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-indigo-200 to-purple-200 flex items-center justify-center mx-auto mb-6">
                        <Loader2 className="h-10 w-10 text-indigo-600 animate-spin" />
                    </div>
                    <h3 className="text-xl font-semibold text-slate-700 mb-2">
                        Generating Document
                    </h3>
                    <p className="text-sm text-slate-500 leading-relaxed">
                        Our agents are collaborating to create your document. 
                        This may take a few moments...
                    </p>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col">
            {/* Header */}
            <div className="px-8 py-5 border-b border-slate-200 bg-white/80 backdrop-blur-sm flex items-center justify-between">
                <div>
                    <h2 className="text-lg font-semibold text-slate-900">Generated Document</h2>
                    <p className="text-xs text-slate-500 mt-0.5">{selectedTemplate?.name}</p>
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleCopy}
                        className="flex items-center gap-2"
                    >
                        <Copy className="h-3.5 w-3.5" />
                        Copy
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleDownload}
                        className="flex items-center gap-2"
                    >
                        <Download className="h-3.5 w-3.5" />
                        Download
                    </Button>
                </div>
            </div>

            {/* Document Content */}
            <div className="flex-1 overflow-y-auto px-8 py-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="max-w-4xl mx-auto"
                >
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-12">
                        <ReactMarkdown
                            className="prose prose-slate max-w-none prose-headings:font-semibold prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl prose-p:leading-relaxed prose-a:text-indigo-600 prose-a:no-underline hover:prose-a:underline prose-code:bg-slate-100 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-pre:bg-slate-900 prose-pre:text-slate-100"
                            components={{
                                h1: ({ children }) => (
                                    <h1 className="text-3xl font-bold text-slate-900 mb-6 pb-3 border-b border-slate-200">
                                        {children}
                                    </h1>
                                ),
                                h2: ({ children }) => (
                                    <h2 className="text-2xl font-semibold text-slate-800 mt-8 mb-4">
                                        {children}
                                    </h2>
                                ),
                                h3: ({ children }) => (
                                    <h3 className="text-xl font-semibold text-slate-700 mt-6 mb-3">
                                        {children}
                                    </h3>
                                ),
                                p: ({ children }) => (
                                    <p className="text-slate-700 leading-relaxed mb-4">
                                        {children}
                                    </p>
                                ),
                                ul: ({ children }) => (
                                    <ul className="list-disc list-inside space-y-2 mb-4 text-slate-700">
                                        {children}
                                    </ul>
                                ),
                                ol: ({ children }) => (
                                    <ol className="list-decimal list-inside space-y-2 mb-4 text-slate-700">
                                        {children}
                                    </ol>
                                ),
                                blockquote: ({ children }) => (
                                    <blockquote className="border-l-4 border-indigo-400 pl-4 py-2 my-4 italic text-slate-600 bg-indigo-50/50">
                                        {children}
                                    </blockquote>
                                ),
                                code: ({ inline, children }) => {
                                    if (inline) {
                                        return (
                                            <code className="bg-slate-100 px-1.5 py-0.5 rounded text-sm font-mono text-slate-800">
                                                {children}
                                            </code>
                                        );
                                    }
                                    return (
                                        <code className="block bg-slate-900 text-slate-100 p-4 rounded-lg overflow-x-auto text-sm font-mono">
                                            {children}
                                        </code>
                                    );
                                }
                            }}
                        >
                            {document}
                        </ReactMarkdown>

                        {sources && sources.length > 0 && (
                            <div className="mt-8 pt-6 border-t border-slate-200">
                                <h3 className="text-lg font-semibold text-slate-900 mb-4">Sources</h3>
                                <div className="grid gap-3 md:grid-cols-2">
                                    {sources.map((source, idx) => (
                                        <a
                                            key={idx}
                                            href={source.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="block bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg p-4 transition-colors"
                                        >
                                            <div className="flex items-start gap-3">
                                                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="text-sm font-medium text-slate-900 truncate">
                                                        {source.title}
                                                    </h4>
                                                    <p className="text-xs text-slate-500 truncate mt-1">
                                                        {source.url}
                                                    </p>
                                                </div>
                                            </div>
                                        </a>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>
        </div>
    );
}