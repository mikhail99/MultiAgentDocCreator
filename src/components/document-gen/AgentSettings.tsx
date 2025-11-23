import React from 'react';
import { Settings, Brain, Target, Lightbulb, Cog } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AgentSettings({ settings, onSettingsChange }) {
  const [isOpen, setIsOpen] = React.useState(false);

  const updateSetting = (key, value) => {
    onSettingsChange({
      ...settings,
      [key]: value
    });
  };

  return (
    <div className="relative">
      <Button
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2"
      >
        <Settings className="h-4 w-4" />
        Agent Settings
      </Button>

      {isOpen && (
        <div className="absolute right-0 top-12 w-80 bg-white rounded-xl border border-slate-200 shadow-xl z-50 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-slate-900">Agent Configuration</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-slate-600"
            >
              ✕
            </button>
          </div>

          <div className="space-y-6">
            {/* Creativity */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Lightbulb className="h-4 w-4 text-amber-500" />
                <label className="text-sm font-medium text-slate-700">Creativity</label>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={settings.creativity}
                onChange={(e) => updateSetting('creativity', parseInt(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-xs text-slate-500 mt-1">
                <span>Conservative</span>
                <span>Creative</span>
              </div>
            </div>

            {/* Rigor */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Target className="h-4 w-4 text-red-500" />
                <label className="text-sm font-medium text-slate-700">Rigor</label>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={settings.rigor}
                onChange={(e) => updateSetting('rigor', parseInt(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-xs text-slate-500 mt-1">
                <span>Flexible</span>
                <span>Strict</span>
              </div>
            </div>

            {/* Analysis Depth */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Brain className="h-4 w-4 text-blue-500" />
                <label className="text-sm font-medium text-slate-700">Analysis Depth</label>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={settings.analysisDepth}
                onChange={(e) => updateSetting('analysisDepth', parseInt(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-xs text-slate-500 mt-1">
                <span>Surface</span>
                <span>Deep</span>
              </div>
            </div>

            {/* LLM Model */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Cog className="h-4 w-4 text-slate-500" />
                <label className="text-sm font-medium text-slate-700">LLM Model</label>
              </div>
              <select
                value={settings.llmModel}
                onChange={(e) => updateSetting('llmModel', e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-indigo-400 focus:ring-indigo-400"
              >
                <option value="gpt-4-turbo">GPT-4 Turbo</option>
                <option value="gpt-4">GPT-4</option>
                <option value="claude-3">Claude 3</option>
                <option value="gemini-pro">Gemini Pro</option>
              </select>
            </div>

            {/* Custom Instructions */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Custom Instructions
              </label>
              <textarea
                value={settings.customInstructions}
                onChange={(e) => updateSetting('customInstructions', e.target.value)}
                placeholder="Additional instructions for agents..."
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:border-indigo-400 focus:ring-indigo-400 resize-none"
                rows={3}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
