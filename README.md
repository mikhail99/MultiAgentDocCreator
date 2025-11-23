# Multi-Agent Document Creator

A modern React-based application that demonstrates multi-agent document generation workflows. This interactive tool allows users to create professional documents through guided conversations with specialized AI agents.

## Features

- **Template-Based Generation**: Choose from multiple document templates including academic reviews, business reports, and technical documentation
- **Multi-Agent Workflow**: Experience simulated collaboration between specialized agents (Coordinator, Research, Writing, Quality Control)
- **Interactive Chat Interface**: Real-time conversation with agents showing their thinking process and tool usage
- **Live Document Preview**: See your document evolve as agents work on it
- **Refinement Capabilities**: Request changes and refinements after initial generation
- **Agent Configuration**: Customize agent settings for creativity, rigor, and analysis depth

## Technology Stack

- **Frontend**: React 18 with TypeScript
- **UI Framework**: Tailwind CSS with custom components
- **Icons**: Lucide React
- **Build Tool**: Vite (assumed based on modern React setup)

## Project Structure

```
frontend/
├── Components/
│   └── document-gen/
│       └── TemplateSelector.tsx
├── Pages/
│   ├── ChatArea.tsx
│   ├── ClarificationQuestions.tsx
│   ├── DocumentGenerator.tsx
│   ├── DocumentView.tsx
│   ├── MessageBubble.tsx
│   ├── mockBackend.tsx
│   ├── RefinementInput.tsx
│   └── TaskInput.tsx
```

## Key Components

- **DocumentGenerator**: Main application component managing the document creation workflow
- **ChatArea**: Interactive chat interface showing agent conversations and user inputs
- **DocumentView**: Live preview of the generated document
- **mockBackend**: Simulated multi-agent workflow with realistic agent interactions and tool usage

## Getting Started

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd MultiAgentDocCreator
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:5173` (or the port shown in your terminal)

## Usage

1. **Select a Template**: Choose from available document templates
2. **Describe Your Task**: Provide details about what you want to create
3. **Answer Clarification Questions**: Help agents understand your specific requirements
4. **Watch the Process**: Observe agents collaborating and using tools
5. **Review & Refine**: Make adjustments to the generated document as needed

## Document Templates

- **Academic Review**: Comprehensive literature reviews with citations and analysis
- **Business Report**: Professional business reports with metrics and recommendations
- **Technical Documentation**: API docs, guides, and technical specifications

## Agent Roles

- **Coordinator Agent**: Manages the overall workflow and delegates tasks
- **Research Agent**: Gathers and analyzes information from various sources
- **Writing Agent**: Composes the document content
- **Quality Control Agent**: Reviews and ensures document quality

## Contributing

This is a demonstration project showcasing multi-agent document generation concepts. The current implementation uses a mock backend to simulate agent interactions.

## License

[Add your license information here]

## Future Enhancements

- Integration with real AI models (OpenAI, Anthropic, etc.)
- Additional document templates
- File upload and processing capabilities
- Export to multiple formats (PDF, Word, etc.)
- Real-time collaboration features
- Custom template creation
