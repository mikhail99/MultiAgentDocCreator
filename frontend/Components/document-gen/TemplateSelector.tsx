import React, { useState, useEffect } from 'react';
import { Send, FileText, Sparkles, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ChatArea from '@/components/document-gen/ChatArea';
import DocumentViewer from '@/components/document-gen/DocumentViewer';
import TemplateSelector from '@/components/document-gen/TemplateSelector';
import TaskInput from '@/components/document-gen/TaskInput';
import AgentSettings from '@/components/document-gen/AgentSettings';
import { mockAgentWorkflow } from '@/components/document-gen/mockBackend';

export default function DocumentGenerator() {
    const [stage, setStage] = useState('template-selection'); // template-selection, task-input, clarification, processing, complete
    const [selectedTemplate, setSelectedTemplate] = useState(null);
    const [messages, setMessages] = useState([]);
    const [document, setDocument] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [pendingQuestions, setPendingQuestions] = useState(null);
    const [agentSettings, setAgentSettings] = useState({
        creativity: 50,
        rigor: 70,
        analysisDepth: 60,
        customInstructions: '',
        enabledTools: ['web_search', 'database_query', 'code_analysis', 'data_processing'],
        llmModel: 'gpt-4-turbo'
    });

    const handleTemplateSelect = (template) => {
        setSelectedTemplate(template);
        setStage('task-input');
        setMessages([{
            id: Date.now(),
            type: 'system',
            content: `Template selected: **${template.name}**. Now describe your task.`
        }]);
    };

    const handleTaskSubmit = async (task, files) => {
        // Add user task to messages
        setMessages(prev => [...prev, {
            id: Date.now(),
            type: 'user',
            content: task,
            files: files
        }]);

        setStage('clarification');
        setIsProcessing(true);

        // Simulate asking clarification questions
        setTimeout(() => {
            const questions = mockAgentWorkflow.generateClarificationQuestions(selectedTemplate, task);
            setPendingQuestions(questions);
            setMessages(prev => [...prev, {
                id: Date.now(),
                type: 'agent',
                content: 'I need to understand your requirements better. Please answer these questions:',
                questions: questions
            }]);
            setIsProcessing(false);
        }, 1500);
    };

    const handleClarificationSubmit = async (answers) => {
        // Add answers to messages
        setMessages(prev => [...prev, {
            id: Date.now(),
            type: 'user',
            content: 'Clarification answers provided',
            answers: answers
        }]);

        setStage('processing');
        setIsProcessing(true);
        setPendingQuestions(null);

        // Simulate agent thinking and document generation
        await mockAgentWorkflow.generateDocument(
            selectedTemplate,
            answers,
            (message) => {
                setMessages(prev => [...prev, message]);
            },
            (doc) => {
                setDocument(doc);
            }
        );

        setIsProcessing(false);
        setStage('complete');
    };

    const handleRefinementRequest = async (request) => {
        setMessages(prev => [...prev, {
            id: Date.now(),
            type: 'user',
            content: request
        }]);

        setIsProcessing(true);

        // Simulate refinement
        await mockAgentWorkflow.refineDocument(
            document,
            request,
            (message) => {
                setMessages(prev => [...prev, message]);
            },
            (doc) => {
                setDocument(doc);
            }
        );

        setIsProcessing(false);
    };

    const handleReset = () => {
        setStage('template-selection');
        setSelectedTemplate(null);
        setMessages([]);
        setDocument('');
        setPendingQuestions(null);
    };

    return (
        <div className="h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 flex flex-col overflow-hidden">
            {/* Header */}
            <div className="bg-white/80 backdrop-blur-xl border-b border-slate-200 px-8 py-5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center">
                        <Sparkles className="h-5 w-5 text-white" />
                    </div>
                    <div>
                        <h1 className="text-xl font-semibold text-slate-900">Document Generator</h1>
                        <p className="text-sm text-slate-500">Multi-agent document creation</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <AgentSettings settings={agentSettings} onSettingsChange={setAgentSettings} />
                    <Button
                        variant="outline"
                        onClick={handleReset}
                        className="flex items-center gap-2"
                    >
                        <RotateCcw className="h-4 w-4" />
                        New Task
                    </Button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex overflow-hidden">
                {stage === 'template-selection' ? (
                    <TemplateSelector onSelect={handleTemplateSelect} />
                ) : (
                    <>
                        {/* Chat Area - Left Side */}
                        <div className="w-1/2 border-r border-slate-200 flex flex-col bg-white">
                            <ChatArea
                                messages={messages}
                                isProcessing={isProcessing}
                                stage={stage}
                                selectedTemplate={selectedTemplate}
                                pendingQuestions={pendingQuestions}
                                onTaskSubmit={handleTaskSubmit}
                                onClarificationSubmit={handleClarificationSubmit}
                                onRefinementRequest={handleRefinementRequest}
                            />
                        </div>

                        {/* Document Viewer - Right Side */}
                        <div className="w-1/2 bg-gradient-to-br from-slate-50 to-white">
                            <DocumentViewer
                                document={document}
                                selectedTemplate={selectedTemplate}
                                isGenerating={isProcessing && stage === 'processing'}
                            />
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}