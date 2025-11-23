import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Slider } from '../ui/slider';
import { Switch } from '../ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '../ui/sheet';
import { Settings, Sparkles, Zap, Brain, Database, Search, Code } from 'lucide-react';
import { Separator } from '../ui/separator';

const AVAILABLE_TOOLS = [
    { id: 'web_search', name: 'Web Search', icon: Search, description: 'Search the internet for information' },
    { id: 'database_query', name: 'Database Query', icon: Database, description: 'Query internal databases' },
    { id: 'code_analysis', name: 'Code Analysis', icon: Code, description: 'Analyze and generate code' },
    { id: 'data_processing', name: 'Data Processing', icon: Zap, description: 'Process and transform data' }
];

interface AgentSettingsProps {
    settings: {
        creativity: number;
        rigor: number;
        analysisDepth: number;
        customInstructions: string;
        enabledTools: string[];
        llmModel: string;
    };
    onSettingsChange: (settings: AgentSettingsProps['settings']) => void;
}

const LLM_MODELS = [
    { id: 'gpt-4-turbo', name: 'GPT-4 Turbo', description: 'Most capable, slower' },
    { id: 'gpt-4', name: 'GPT-4', description: 'Balanced performance' },
    { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', description: 'Fast and efficient' },
    { id: 'claude-3-opus', name: 'Claude 3 Opus', description: 'Advanced reasoning' },
    { id: 'claude-3-sonnet', name: 'Claude 3 Sonnet', description: 'Balanced capability' }
];

export default function AgentSettings({ settings, onSettingsChange }: AgentSettingsProps) {
    const [localSettings, setLocalSettings] = useState(settings);
    const [isOpen, setIsOpen] = useState(false);

    const handleSave = () => {
        onSettingsChange(localSettings);
        setIsOpen(false);
    };

    const handleReset = () => {
        const defaultSettings = {
            creativity: 50,
            rigor: 70,
            analysisDepth: 60,
            customInstructions: '',
            enabledTools: ['web_search', 'database_query', 'code_analysis', 'data_processing'],
            llmModel: 'gpt-4-turbo'
        };
        setLocalSettings(defaultSettings);
    };

    const updateSetting = (key: string, value: any) => {
        setLocalSettings(prev => ({ ...prev, [key]: value }));
    };

    const toggleTool = (toolId: string) => {
        setLocalSettings(prev => ({
            ...prev,
            enabledTools: prev.enabledTools.includes(toolId)
                ? prev.enabledTools.filter(id => id !== toolId)
                : [...prev.enabledTools, toolId]
        }));
    };

    return (
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="flex items-center gap-2">
                    <Settings className="h-4 w-4" />
                    Agent Settings
                </Button>
            </SheetTrigger>
            <SheetContent className="w-[500px] sm:max-w-[500px] overflow-y-auto">
                <SheetHeader>
                    <SheetTitle className="flex items-center gap-2">
                        <Brain className="h-5 w-5 text-indigo-600" />
                        Agent Configuration
                    </SheetTitle>
                    <SheetDescription>
                        Customize agent behavior, capabilities, and model selection
                    </SheetDescription>
                </SheetHeader>

                <div className="py-6 space-y-6">
                    {/* LLM Model Selection */}
                    <div className="space-y-3">
                        <Label className="text-sm font-semibold">Language Model</Label>
                        <Select value={localSettings.llmModel} onValueChange={(value: string) => updateSetting('llmModel', value)}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {LLM_MODELS.map(model => (
                                    <SelectItem key={model.id} value={model.id}>
                                        <div className="flex flex-col">
                                            <span className="font-medium">{model.name}</span>
                                            <span className="text-xs text-slate-500">{model.description}</span>
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <Separator />

                    {/* Creativity Level */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <Label className="text-sm font-semibold flex items-center gap-2">
                                <Sparkles className="h-4 w-4 text-purple-600" />
                                Creativity Level
                            </Label>
                            <span className="text-sm font-medium text-indigo-600">{localSettings.creativity}%</span>
                        </div>
                        <Slider
                            value={[localSettings.creativity]}
                            onValueChange={(value: number[]) => updateSetting('creativity', value[0])}
                            min={0}
                            max={100}
                            step={5}
                            className="py-4"
                        />
                        <p className="text-xs text-slate-500">
                            Higher creativity allows more innovative and diverse outputs
                        </p>
                    </div>

                    {/* Rigor Level */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <Label className="text-sm font-semibold flex items-center gap-2">
                                <Brain className="h-4 w-4 text-blue-600" />
                                Rigor Level
                            </Label>
                            <span className="text-sm font-medium text-indigo-600">{localSettings.rigor}%</span>
                        </div>
                        <Slider
                            value={[localSettings.rigor]}
                            onValueChange={(value: number[]) => updateSetting('rigor', value[0])}
                            min={0}
                            max={100}
                            step={5}
                            className="py-4"
                        />
                        <p className="text-xs text-slate-500">
                            Higher rigor ensures more thorough fact-checking and validation
                        </p>
                    </div>

                    {/* Analysis Depth */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <Label className="text-sm font-semibold flex items-center gap-2">
                                <Zap className="h-4 w-4 text-amber-600" />
                                Analysis Depth
                            </Label>
                            <span className="text-sm font-medium text-indigo-600">{localSettings.analysisDepth}%</span>
                        </div>
                        <Slider
                            value={[localSettings.analysisDepth]}
                            onValueChange={(value: number[]) => updateSetting('analysisDepth', value[0])}
                            min={0}
                            max={100}
                            step={5}
                            className="py-4"
                        />
                        <p className="text-xs text-slate-500">
                            Deeper analysis provides more comprehensive research and insights
                        </p>
                    </div>

                    <Separator />

                    {/* Custom Instructions */}
                    <div className="space-y-3">
                        <Label className="text-sm font-semibold">Custom Instructions</Label>
                        <Textarea
                            placeholder="Add specific instructions for the agent team... (e.g., 'Focus on peer-reviewed sources', 'Use formal academic tone', 'Include specific examples')"
                            value={localSettings.customInstructions}
                            onChange={(e) => updateSetting('customInstructions', e.target.value)}
                            className="min-h-[100px] resize-none text-sm"
                        />
                        <p className="text-xs text-slate-500">
                            These instructions will guide all agents in the workflow
                        </p>
                    </div>

                    <Separator />

                    {/* Tool Access */}
                    <div className="space-y-3">
                        <Label className="text-sm font-semibold">Available Tools</Label>
                        <p className="text-xs text-slate-500 mb-3">
                            Enable or disable specific tools that agents can use
                        </p>
                        <div className="space-y-3">
                            {AVAILABLE_TOOLS.map(tool => {
                                const Icon = tool.icon;
                                return (
                                    <div
                                        key={tool.id}
                                        className="flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="h-8 w-8 rounded-lg bg-indigo-100 flex items-center justify-center">
                                                <Icon className="h-4 w-4 text-indigo-600" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-slate-900">{tool.name}</p>
                                                <p className="text-xs text-slate-500">{tool.description}</p>
                                            </div>
                                        </div>
                                        <Switch
                                            checked={localSettings.enabledTools.includes(tool.id)}
                                            onCheckedChange={() => toggleTool(tool.id)}
                                        />
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="flex gap-3 pt-6 border-t">
                    <Button variant="outline" onClick={handleReset} className="flex-1">
                        Reset to Default
                    </Button>
                    <Button onClick={handleSave} className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700">
                        Apply Settings
                    </Button>
                </div>
            </SheetContent>
        </Sheet>
    );
}