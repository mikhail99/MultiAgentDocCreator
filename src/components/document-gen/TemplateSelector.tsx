import React from 'react';
import { Card } from '../ui/card';
import { FileText, GraduationCap, Briefcase, Code, BookOpen, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

interface Template {
    id: string;
    name: string;
    description: string;
    icon: any;
    color: string;
    features: string[];
}

interface TemplateSelectorProps {
    onSelect: (template: Template) => void;
}

const TEMPLATES: Template[] = [
    {
        id: 'academic-review',
        name: 'Academic Literature Review',
        description: 'Comprehensive research review with citations and analysis',
        icon: GraduationCap,
        color: 'from-blue-600 to-indigo-600',
        features: ['Citation tracking', 'Research synthesis', 'Gap analysis']
    },
    {
        id: 'business-report',
        name: 'Business Report',
        description: 'Professional business analysis with data-driven insights',
        icon: Briefcase,
        color: 'from-emerald-600 to-teal-600',
        features: ['Market analysis', 'Financial metrics', 'Strategic recommendations']
    },
    {
        id: 'technical-doc',
        name: 'Technical Documentation',
        description: 'Detailed technical specifications and implementation guides',
        icon: Code,
        color: 'from-purple-600 to-pink-600',
        features: ['API documentation', 'Code examples', 'Architecture diagrams']
    },
    {
        id: 'research-paper',
        name: 'Research Paper',
        description: 'Structured academic paper with methodology and findings',
        icon: BookOpen,
        color: 'from-orange-600 to-red-600',
        features: ['Methodology section', 'Data analysis', 'Peer-review ready']
    },
    {
        id: 'market-analysis',
        name: 'Market Analysis',
        description: 'Comprehensive market research and competitive analysis',
        icon: TrendingUp,
        color: 'from-cyan-600 to-blue-600',
        features: ['Competitor analysis', 'Trend identification', 'Market sizing']
    },
    {
        id: 'content-brief',
        name: 'Content Brief',
        description: 'Detailed content strategy and writing guidelines',
        icon: FileText,
        color: 'from-rose-600 to-pink-600',
        features: ['SEO keywords', 'Target audience', 'Content structure']
    }
];

export default function TemplateSelector({ onSelect }: TemplateSelectorProps) {
    return (
        <div className="flex-1 overflow-y-auto p-12">
            <div className="max-w-6xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-12"
                >
                    <h2 className="text-4xl font-bold text-slate-900 mb-4">
                        Choose Your Template
                    </h2>
                    <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                        Select a template to get started. Each template is optimized with specialized agents 
                        and workflows for your specific document type.
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {TEMPLATES.map((template, index) => {
                        const Icon = template.icon;
                        return (
                            <motion.div
                                key={template.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                            >
                                <Card
                                    className="group cursor-pointer border-2 border-slate-200 hover:border-indigo-400 transition-all duration-300 hover:shadow-xl bg-white overflow-hidden"
                                    onClick={() => onSelect(template)}
                                >
                                    <div className="p-6">
                                        <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${template.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                                            <Icon className="h-7 w-7 text-white" />
                                        </div>
                                        <h3 className="text-xl font-semibold text-slate-900 mb-2">
                                            {template.name}
                                        </h3>
                                        <p className="text-sm text-slate-600 mb-4 leading-relaxed">
                                            {template.description}
                                        </p>
                                        <div className="space-y-2">
                                            {template.features.map((feature, idx) => (
                                                <div key={idx} className="flex items-center gap-2 text-xs text-slate-500">
                                                    <div className="h-1.5 w-1.5 rounded-full bg-indigo-400"></div>
                                                    {feature}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div className={`h-1 bg-gradient-to-r ${template.color} transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left`}></div>
                                </Card>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}