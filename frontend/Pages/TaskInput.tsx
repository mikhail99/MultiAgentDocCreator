import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Upload, X, Send } from 'lucide-react';

export default function TaskInput({ onSubmit, isProcessing }) {
    const [task, setTask] = useState('');
    const [files, setFiles] = useState([]);

    const handleFileChange = (e) => {
        const newFiles = Array.from(e.target.files).map(file => ({
            file,
            instructions: ''
        }));
        setFiles(prev => [...prev, ...newFiles]);
    };

    const removeFile = (index) => {
        setFiles(prev => prev.filter((_, i) => i !== index));
    };

    const updateFileInstructions = (index, instructions) => {
        setFiles(prev => prev.map((f, i) => i === index ? { ...f, instructions } : f));
    };

    const handleSubmit = () => {
        if (task.trim()) {
            onSubmit(task, files.map(f => ({ name: f.file.name, instructions: f.instructions })));
            setTask('');
            setFiles([]);
        }
    };

    return (
        <div className="p-6 space-y-4">
            <Textarea
                placeholder="Describe your task in detail... (e.g., 'Create a comprehensive literature review on machine learning applications in sensor data analysis')"
                value={task}
                onChange={(e) => setTask(e.target.value)}
                className="min-h-[120px] resize-none text-sm border-slate-200 focus:border-indigo-400 focus:ring-indigo-400"
                disabled={isProcessing}
            />

            {files.length > 0 && (
                <div className="space-y-3">
                    {files.map((fileObj, index) => (
                        <div key={index} className="bg-slate-50 rounded-lg p-3 space-y-2">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-slate-700 text-sm">
                                    <Upload className="h-4 w-4 text-slate-400" />
                                    {fileObj.file.name}
                                </div>
                                <button
                                    onClick={() => removeFile(index)}
                                    className="text-slate-400 hover:text-slate-600"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>
                            <Textarea
                                placeholder="How should agents use this file? (e.g., 'Use as reference for methodology', 'Extract key findings from this paper')"
                                value={fileObj.instructions}
                                onChange={(e) => updateFileInstructions(index, e.target.value)}
                                className="min-h-[60px] resize-none text-xs bg-white"
                            />
                        </div>
                    ))}
                </div>
            )}

            <div className="flex items-center justify-between">
                <label className="cursor-pointer">
                    <input
                        type="file"
                        multiple
                        className="hidden"
                        onChange={handleFileChange}
                        disabled={isProcessing}
                    />
                    <div className="flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors text-sm text-slate-600">
                        <Upload className="h-4 w-4" />
                        Attach files
                    </div>
                </label>

                <Button
                    onClick={handleSubmit}
                    disabled={!task.trim() || isProcessing}
                    className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white flex items-center gap-2"
                >
                    <Send className="h-4 w-4" />
                    Submit Task
                </Button>
            </div>
        </div>
    );
}