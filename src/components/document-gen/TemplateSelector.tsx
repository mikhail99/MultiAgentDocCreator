import React from 'react';
import { FileText, BarChart3, Code, BookOpen, Sparkles } from 'lucide-react';

const templates = [
  {
    id: 'academic-review',
    name: 'Academic Literature Review',
    description: 'Comprehensive review of academic research with citations and methodology analysis',
    icon: BookOpen,
    color: 'from-blue-500 to-indigo-600'
  },
  {
    id: 'business-report',
    name: 'Business Performance Report',
    description: 'Professional business report with metrics, analysis, and strategic recommendations',
    icon: BarChart3,
    color: 'from-green-500 to-emerald-600'
  },
  {
    id: 'technical-doc',
    name: 'Technical Documentation',
    description: 'API documentation, guides, and technical specifications with code examples',
    icon: Code,
    color: 'from-purple-500 to-pink-600'
  }
];

export default function TemplateSelector({ onSelect }) {
  return (
    <div className="h-full flex items-center justify-center p-12">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-12">
          <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center mx-auto mb-6">
            <Sparkles className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-4">
            Choose Your Document Type
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Select a template to begin creating your professional document.
            Our multi-agent system will guide you through the process.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {templates.map((template) => {
            const Icon = template.icon;
            return (
              <button
                key={template.id}
                onClick={() => onSelect(template)}
                className="group bg-white rounded-2xl border border-slate-200 p-8 hover:border-indigo-300 hover:shadow-lg transition-all duration-200 text-left"
              >
                <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${template.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-3">
                  {template.name}
                </h3>
                <p className="text-slate-600 leading-relaxed">
                  {template.description}
                </p>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
