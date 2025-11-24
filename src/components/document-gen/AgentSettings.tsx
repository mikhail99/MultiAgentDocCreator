import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Slider } from '../ui/slider';
import { Switch } from '../ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '../ui/sheet';
import { Settings, Sparkles, Zap, Brain, Database, Search, Code, Save, Plus, Trash2, Edit2 } from 'lucide-react';
import { Separator } from '../ui/separator';
import { toast } from 'sonner';

const AVAILABLE_TOOLS = [
    { id: 'web_search', name: 'Web Search', icon: Search, description: 'Search the internet for information' },
    { id: 'database_query', name: 'Database Query', icon: Database, description: 'Query internal databases' },
    { id: 'code_analysis', name: 'Code Analysis', icon: Code, description: 'Analyze and generate code' },
    { id: 'data_processing', name: 'Data Processing', icon: Zap, description: 'Process and transform data' }
];

const LLM_MODELS = [
    { id: 'gpt-4-turbo', name: 'GPT-4 Turbo', description: 'Most capable, slower' },
    { id: 'gpt-4', name: 'GPT-4', description: 'Balanced performance' },
    { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', description: 'Fast and efficient' },
    { id: 'claude-3-opus', name: 'Claude 3 Opus', description: 'Advanced reasoning' },
    { id: 'claude-3-sonnet', name: 'Claude 3 Sonnet', description: 'Balanced capability' }
];

const AGENT_TYPES = [
    { id: 'coordinator', name: 'Coordinator Agent', description: 'Orchestrates the workflow' },
    { id: 'research', name: 'Research Agent', description: 'Gathers and synthesizes information' },
    { id: 'writing', name: 'Writing Agent', description: 'Creates and structures content' },
    { id: 'quality', name: 'Quality Control Agent', description: 'Reviews and refines output' }
];

interface AgentSettingsProps {
    settings: any;
    onSettingsChange: (settings: any) => void;
}

export default function AgentSettings({ settings, onSettingsChange }: AgentSettingsProps) {
    const [localSettings, setLocalSettings] = useState(settings);
    const [isOpen, setIsOpen] = useState(false);
    const [currentProfileId, setCurrentProfileId] = useState<string | null>(null);
    const [profileName, setProfileName] = useState('');
    const [showPromptEditor, setShowPromptEditor] = useState(false);
    const [profiles, setProfiles] = useState<any[]>([]);

    // Load profiles from localStorage on component mount
    useEffect(() => {
        const savedProfiles = localStorage.getItem('agentProfiles');
        if (savedProfiles) {
            try {
                setProfiles(JSON.parse(savedProfiles));
            } catch (error) {
                console.error('Failed to parse saved profiles:', error);
            }
        }
    }, []);

    const saveProfilesToStorage = (updatedProfiles: any[]) => {
        localStorage.setItem('agentProfiles', JSON.stringify(updatedProfiles));
        setProfiles(updatedProfiles);
    };

    const handleApply = () => {
        onSettingsChange(localSettings);
        setIsOpen(false);
    };

    const handleSaveProfile = () => {
        if (!profileName.trim()) {
            toast.error('Please enter a profile name');
            return;
        }

        const profileData = {
            id: currentProfileId || `profile_${Date.now()}`,
            name: profileName,
            creativity: localSettings.creativity,
            rigor: localSettings.rigor,
            analysisDepth: localSettings.analysisDepth,
            customInstructions: localSettings.customInstructions,
            agentPrompts: localSettings.agentPrompts || [],
            llmModel: localSettings.llmModel,
            enabledTools: localSettings.enabledTools
        };

        const updatedProfiles = currentProfileId
            ? profiles.map(p => p.id === currentProfileId ? profileData : p)
            : [...profiles, profileData];

        saveProfilesToStorage(updatedProfiles);
        toast.success(currentProfileId ? 'Profile updated' : 'Profile created');
        setProfileName('');
    };

    const handleLoadProfile = (profile: any) => {
        setLocalSettings({
            creativity: profile.creativity,
            rigor: profile.rigor,
            analysisDepth: profile.analysisDepth,
            customInstructions: profile.customInstructions || '',
            agentPrompts: profile.agentPrompts || [],
            llmModel: profile.llmModel,
            enabledTools: profile.enabledTools
        });
        setCurrentProfileId(profile.id);
        setProfileName(profile.name);
        toast.success(`Loaded profile: ${profile.name}`);
    };

    const handleDeleteProfile = (id: string, name: string) => {
        if (confirm(`Delete profile "${name}"?`)) {
            const updatedProfiles = profiles.filter(p => p.id !== id);
            saveProfilesToStorage(updatedProfiles);
            toast.success('Profile deleted');
            if (currentProfileId === id) {
                handleReset();
            }
        }
    };

    const handleReset = () => {
        const defaultSettings = {
            creativity: 50,
            rigor: 70,
            analysisDepth: 60,
            customInstructions: '',
            agentPrompts: AGENT_TYPES.map(agent => ({ agentName: agent.id, prompt: '' })),
            enabledTools: ['web_search', 'database_query', 'code_analysis', 'data_processing'],
            llmModel: 'gpt-4-turbo'
        };
        setLocalSettings(defaultSettings);
        setCurrentProfileId(null);
        setProfileName('');
    };

    const handleNewProfile = () => {
        handleReset();
        toast.info('Create a new profile');
    };

    useEffect(() => {
        if (!localSettings.agentPrompts) {
            setLocalSettings((prev: any) => ({
                ...prev,
                agentPrompts: AGENT_TYPES.map(agent => ({ agentName: agent.id, prompt: '' }))
            }));
        }
    }, []);

    const updateSetting = (key: string, value: any) => {
        setLocalSettings((prev: any) => ({ ...prev, [key]: value }));
    };

    const updateAgentPrompt = (agentName: string, prompt: string) => {
        setLocalSettings((prev: any) => ({
            ...prev,
            agentPrompts: prev.agentPrompts.map((ap: any) =>
                ap.agentName === agentName ? { ...ap, prompt } : ap
            )
        }));
    };

    const toggleTool = (toolId: string) => {
        setLocalSettings((prev: any) => ({
            ...prev,
            enabledTools: prev.enabledTools.includes(toolId)
                ? prev.enabledTools.filter((id: string) => id !== toolId)
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
                    {/* Profile Management */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <Label className="text-sm font-semibold">Agent Profiles</Label>
                            <Button variant="outline" size="sm" onClick={handleNewProfile} className="h-7 text-xs">
                                <Plus className="h-3 w-3 mr-1" />
                                New
                            </Button>
                        </div>

                        {profiles.length > 0 && (
                            <div className="space-y-2 max-h-32 overflow-y-auto">
                                {profiles.map(profile => (
                                    <div
                                        key={profile.id}
                                        className={`flex items-center justify-between p-2 rounded-lg border transition-colors ${
                                            currentProfileId === profile.id
                                                ? 'border-indigo-400 bg-indigo-50'
                                                : 'border-slate-200 hover:bg-slate-50'
                                        }`}
                                    >
                                        <button
                                            onClick={() => handleLoadProfile(profile)}
                                            className="flex-1 text-left text-sm font-medium text-slate-900"
                                        >
                                            {profile.name}
                                        </button>
                                        <button
                                            onClick={() => handleDeleteProfile(profile.id, profile.name)}
                                            className="text-slate-400 hover:text-red-600 ml-2"
                                        >
                                            <Trash2 className="h-3.5 w-3.5" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="flex gap-2">
                            <input
                                type="text"
                                placeholder="Profile name..."
                                value={profileName}
                                onChange={(e) => setProfileName(e.target.value)}
                                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                            />
                            <Button
                                onClick={handleSaveProfile}
                                size="sm"
                                disabled={!profileName.trim()}
                                className="h-9"
                            >
                                <Save className="h-3.5 w-3.5" />
                            </Button>
                        </div>
                    </div>

                    <Separator />
                    {/* LLM Model Selection */}
                    <div className="space-y-3">
                        <Label className="text-sm font-semibold">Language Model</Label>
                        <Select value={localSettings.llmModel} onValueChange={(value) => updateSetting('llmModel', value)}>
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
                            onValueChange={(value) => updateSetting('creativity', value[0])}
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
                            onValueChange={(value) => updateSetting('rigor', value[0])}
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
                            onValueChange={(value) => updateSetting('analysisDepth', value[0])}
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

                    {/* Agent Prompts Editor */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <Label className="text-sm font-semibold">Agent Prompts</Label>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setShowPromptEditor(!showPromptEditor)}
                                className="h-7 text-xs"
                            >
                                <Edit2 className="h-3 w-3 mr-1" />
                                {showPromptEditor ? 'Hide' : 'Edit'}
                            </Button>
                        </div>

                        {showPromptEditor && (
                            <div className="space-y-3">
                                {AGENT_TYPES.map(agent => {
                                    const agentPrompt = localSettings.agentPrompts?.find(
                                        (ap: any) => ap.agentName === agent.id
                                    );
                                    return (
                                        <div key={agent.id} className="space-y-2">
                                            <div>
                                                <p className="text-sm font-medium text-slate-900">{agent.name}</p>
                                                <p className="text-xs text-slate-500">{agent.description}</p>
                                            </div>
                                            <Textarea
                                                placeholder={`Custom prompt for ${agent.name}...`}
                                                value={agentPrompt?.prompt || ''}
                                                onChange={(e) => updateAgentPrompt(agent.id, e.target.value)}
                                                className="min-h-[80px] resize-none text-xs bg-white font-mono"
                                            />
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                        <p className="text-xs text-slate-500">
                            Customize individual agent behavior with specific prompts
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
                        Reset
                    </Button>
                    <Button onClick={handleApply} className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700">
                        Apply Settings
                    </Button>
                </div>
            </SheetContent>
        </Sheet>
    );
}