import { useState } from 'react';
import { Sparkles, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ChatArea from '@/components/document-gen/ChatArea';
import DocumentViewer from '@/components/document-gen/DocumentViewer';
import TemplateSelector from '@/components/document-gen/TemplateSelector';
import AgentSettings from '@/components/document-gen/AgentSettings';
import { agentWorkflow } from '@/components/document-gen/agentWorkflow';

// Type definitions
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

interface AgentSettings {
    creativity: number;
    rigor: number;
    analysisDepth: number;
    customInstructions: string;
    enabledTools: string[];
    llmModel: string;
}

interface Template {
    id: string;
    name: string;
    description: string;
    icon: any;
    color: string;
    features: string[];
}

export default function DocumentGenerator() {
    const [stage, setStage] = useState<'template-selection' | 'task-input' | 'clarification' | 'processing' | 'complete'>('template-selection');
    const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
    const [task, setTask] = useState('');
    const [messages, setMessages] = useState<Message[]>([]);
    const [document, setDocument] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [pendingQuestions, setPendingQuestions] = useState<any>(null);
    const [sources, setSources] = useState<any[]>([]);
    const [messageIdCounter, setMessageIdCounter] = useState(0);
    const [agentSettings, setAgentSettings] = useState<AgentSettings>({
        creativity: 50,
        rigor: 70,
        analysisDepth: 60,
        customInstructions: '',
        enabledTools: ['web_search', 'web_visit', 'scholar_search', 'python_interpreter'],
        llmModel: 'gpt-4-turbo-preview'
    });

    const generateMessageId = () => {
        const newId = messageIdCounter + 1;
        setMessageIdCounter(newId);
        return `msg_${Date.now()}_${newId}`;
    };

    const handleTemplateSelect = (template: Template) => {
        setSelectedTemplate(template);
        setStage('task-input');
        setMessages([{
            id: generateMessageId(),
            type: 'system',
            content: `Template selected: **${template.name}**. Now describe your task.`
        }]);
    };

    const handleTaskSubmit = async (taskInput: string, files: { name: string; instructions: string }[]) => {
        // Store the task for later use in document generation
        setTask(taskInput);

        // Add user task to messages
        setMessages(prev => [...prev, {
            id: generateMessageId(),
            type: 'user',
            content: taskInput,
            files: files
        }]);

        setStage('clarification');
        setIsProcessing(true);

        // Get clarification questions
        (async () => {
            try {
                const questions = await agentWorkflow.generateClarificationQuestions(selectedTemplate, taskInput);
                setPendingQuestions(questions);
                setMessages(prev => [...prev, {
                    id: generateMessageId(),
                    type: 'agent',
                    content: 'I need to understand your requirements better. Please answer these questions:',
                    questions: questions
                }]);
            } catch (error) {
                console.error('Failed to get clarification questions:', error);
                // Fallback to empty questions
                setPendingQuestions([]);
                setMessages(prev => [...prev, {
                    id: generateMessageId(),
                    type: 'agent',
                    content: 'Ready to proceed with document generation.',
                    questions: []
                }]);
            } finally {
                setIsProcessing(false);
            }
        })();
    };

    const handleClarificationSubmit = async (answers: string[]) => {
        // Convert answers array to dictionary format expected by backend
        const answersDict: { [key: string]: string } = {};
        if (Array.isArray(answers)) {
            answers.forEach((answer, index) => {
                answersDict[`question_${index + 1}`] = answer;
            });
        }

        // Add answers to messages
        setMessages(prev => [...prev, {
            id: generateMessageId(),
            type: 'user',
            content: 'Clarification answers provided',
            answers: answersDict
        }]);

        setStage('processing');
        setIsProcessing(true);
        setPendingQuestions(null);

        // Simulate agent thinking and document generation
        await agentWorkflow.generateDocument(
            selectedTemplate,
            task,
            answersDict,
            (message: Message) => {
                setMessages(prev => [...prev, message]);
            },
            (doc: string) => {
                setDocument(doc);
            }
        );

        setIsProcessing(false);
        setStage('complete');
    };

    const handleRefinementRequest = async (request: string) => {
        setMessages(prev => [...prev, {
            id: generateMessageId(),
            type: 'user',
            content: request
        }]);

        setIsProcessing(true);

        // Simulate refinement
        await agentWorkflow.refineDocument(
            document,
            request,
            (message: Message) => {
                setMessages(prev => [...prev, message]);
            },
            (doc: string) => {
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
        setSources([]);
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
                                sources={sources}
                            />
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}