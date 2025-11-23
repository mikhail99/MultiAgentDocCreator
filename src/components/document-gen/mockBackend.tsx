// Mock backend for document generation workflow

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const SAMPLE_DOCUMENTS = {
    'academic-review': `# Machine Learning Applications in Sensor Data Analysis: A Comprehensive Review

## Abstract

This literature review examines the current state of machine learning (ML) applications in sensor data analysis, spanning multiple domains including industrial IoT, environmental monitoring, and healthcare. We identify key methodologies, evaluate their effectiveness, and highlight emerging trends and research gaps.

## 1. Introduction

The proliferation of sensor technologies has generated unprecedented volumes of data, necessitating sophisticated analytical approaches. Machine learning has emerged as a powerful tool for extracting meaningful insights from complex sensor datasets. This review synthesizes recent advances in ML-based sensor data analysis, focusing on methodologies, applications, and future directions.

### 1.1 Scope and Objectives

This review covers literature published between 2020-2024, emphasizing:
- Deep learning architectures for time-series sensor data
- Feature engineering and preprocessing techniques
- Real-time processing frameworks
- Deployment considerations for edge devices

## 2. Methodological Approaches

### 2.1 Deep Learning Architectures

Recent research has demonstrated the effectiveness of various neural network architectures:

**Convolutional Neural Networks (CNNs)**: Particularly effective for spatial pattern recognition in multi-sensor arrays. Studies by Wang et al. (2023) showed 94% accuracy in fault detection using 1D-CNN on vibration sensor data.

**Long Short-Term Memory (LSTM) Networks**: Widely adopted for temporal pattern recognition. Zhang & Liu (2024) achieved superior performance in predicting equipment failures using bidirectional LSTM with attention mechanisms.

**Transformer Models**: Emerging as state-of-the-art for long-range dependencies. Recent work by Chen et al. (2024) demonstrated 15% improvement over LSTM in multi-variate sensor forecasting.

### 2.2 Feature Engineering

Despite the success of end-to-end learning, feature engineering remains crucial:
- Time-domain features (statistical moments, peak detection)
- Frequency-domain features (FFT, wavelet transforms)
- Information-theoretic measures (entropy, mutual information)

## 3. Application Domains

### 3.1 Industrial IoT and Predictive Maintenance

Machine learning has revolutionized predictive maintenance strategies. Key findings include:
- Reduced downtime by 30-45% through early fault detection
- Cost savings of 25-40% compared to traditional maintenance schedules
- Integration with digital twin frameworks for enhanced prediction accuracy

### 3.2 Environmental Monitoring

Applications in air quality prediction, water quality assessment, and climate monitoring demonstrate:
- Real-time anomaly detection with 92% precision
- Multi-modal sensor fusion improving prediction accuracy by 18%
- Edge computing deployment reducing latency by 60%

### 3.3 Healthcare and Wearable Devices

Wearable sensor analysis has enabled:
- Continuous health monitoring with 89% accuracy in arrhythmia detection
- Activity recognition using ensemble methods achieving 95% F1-score
- Privacy-preserving federated learning frameworks

## 4. Technical Challenges

### 4.1 Data Quality and Preprocessing

Key challenges identified:
- Missing data handling (average 15-20% in real deployments)
- Sensor drift and calibration issues
- Noise reduction while preserving signal characteristics

### 4.2 Model Deployment and Edge Computing

Constraints for edge deployment:
- Memory limitations (typically <100MB model size)
- Power consumption constraints
- Latency requirements (<50ms for critical applications)

Solutions include model compression, quantization, and knowledge distillation techniques.

## 5. Research Gaps and Future Directions

### 5.1 Identified Gaps

1. **Explainability**: Limited interpretability of deep learning models in critical applications
2. **Transfer Learning**: Insufficient research on cross-domain sensor model adaptation
3. **Multimodal Integration**: Need for better fusion techniques across heterogeneous sensors
4. **Real-world Validation**: Gap between laboratory and production performance

### 5.2 Emerging Trends

- **Self-supervised Learning**: Reducing dependency on labeled data
- **Neural Architecture Search**: Automated model design for specific sensor configurations
- **Continual Learning**: Adapting to changing sensor characteristics over time
- **Edge AI**: Specialized hardware accelerators for on-device inference

## 6. Conclusion

Machine learning has fundamentally transformed sensor data analysis, enabling real-time insights and predictive capabilities previously unattainable. While significant progress has been made, challenges in explainability, deployment, and generalization remain. Future research should focus on bridging the gap between theoretical advances and practical deployment, particularly in resource-constrained environments.

The field continues to evolve rapidly, with emerging techniques in self-supervised learning and edge AI showing particular promise for next-generation sensor systems.

## References

[A comprehensive list of 45+ academic references would be included here, formatted according to academic standards]`,

    'business-report': `# Quarterly Business Performance Report - Q4 2024

## Executive Summary

This report provides a comprehensive analysis of business performance for Q4 2024, highlighting key achievements, market trends, and strategic recommendations for the upcoming fiscal year.

## Key Metrics Overview

- **Revenue**: $12.4M (↑ 23% YoY)
- **Operating Margin**: 18.5% (↑ 3.2pp)
- **Customer Acquisition**: 2,847 new customers (↑ 31%)
- **Customer Retention**: 94.2% (↑ 1.8pp)

## Market Analysis

The market showed strong growth despite economic headwinds, with our core segments demonstrating resilience and expansion potential...

[Document continues with detailed business analysis]`,

    'technical-doc': `# API Documentation - Payment Processing Service

## Overview

The Payment Processing Service provides secure, scalable payment integration for modern applications.

## Authentication

All API requests require authentication using Bearer tokens...

[Document continues with technical specifications]`
};

export const mockAgentWorkflow = {
    generateClarificationQuestions: (template, task) => {
        const questions = {
            'academic-review': [
                'What specific time period should the literature review cover? (e.g., last 5 years, 2020-2024)',
                'Are there particular research databases or sources you want prioritized? (e.g., IEEE, PubMed, arXiv)',
                'What level of technical depth is required? (e.g., suitable for experts, general audience, or mixed)'
            ],
            'business-report': [
                'What time period should this report cover? (e.g., Q4 2024, Full Year 2024)',
                'Who is the primary audience for this report? (e.g., board members, investors, internal team)',
                'Are there specific metrics or KPIs that must be included?'
            ],
            'technical-doc': [
                'What programming languages or frameworks should the documentation cover?',
                'Should the documentation include code examples and tutorials?',
                'What level of technical expertise should be assumed for the readers?'
            ]
        };

        return questions[template.id] || [
            'What is the primary goal of this document?',
            'Who is the intended audience?',
            'Are there specific sections or topics that must be included?'
        ];
    },

    generateDocument: async (template, answers, onMessage, onDocumentUpdate) => {
        // Simulate thinking process
        await sleep(800);
        onMessage({
            id: Date.now(),
            type: 'thinking',
            agent: 'Coordinator Agent',
            content: 'Analyzing task requirements and allocating work to specialized agents based on the template structure and clarification answers.',
            status: 'processing'
        });

        await sleep(1500);
        onMessage({
            id: Date.now() + 1,
            type: 'thinking',
            agent: 'Coordinator Agent',
            content: 'Task analysis complete. Identified 3 key sections requiring specialized expertise. Delegating to Research Agent, Writing Agent, and Quality Control Agent.',
            status: 'complete'
        });

        // Simulate tool calls
        await sleep(1000);
        onMessage({
            id: Date.now() + 2,
            type: 'tool',
            toolName: 'search_academic_databases',
            parameters: {
                query: 'machine learning sensor analysis',
                databases: ['IEEE', 'ACM', 'arXiv'],
                years: '2020-2024'
            },
            status: 'processing'
        });

        await sleep(2000);
        onMessage({
            id: Date.now() + 3,
            type: 'tool',
            toolName: 'search_academic_databases',
            parameters: {
                query: 'machine learning sensor analysis',
                databases: ['IEEE', 'ACM', 'arXiv'],
                years: '2020-2024'
            },
            result: 'Found 247 relevant papers. Extracted key findings from top 45 papers.',
            status: 'complete'
        });

        await sleep(1200);
        onMessage({
            id: Date.now() + 4,
            type: 'thinking',
            agent: 'Research Agent',
            content: 'Processing academic sources. Identified key themes: deep learning architectures (CNNs, LSTMs, Transformers), feature engineering techniques, and application domains. Extracting citations and methodologies.',
            status: 'processing'
        });

        await sleep(2000);
        onMessage({
            id: Date.now() + 5,
            type: 'thinking',
            agent: 'Research Agent',
            content: 'Research synthesis complete. Organized findings into 6 thematic categories with 45 supporting citations. Identified 4 major research gaps.',
            status: 'complete'
        });

        await sleep(800);
        onMessage({
            id: Date.now() + 6,
            type: 'tool',
            toolName: 'analyze_trends',
            parameters: {
                domain: 'machine_learning',
                focus: 'sensor_data_analysis',
                time_range: '2020-2024'
            },
            status: 'processing'
        });

        await sleep(1500);
        onMessage({
            id: Date.now() + 7,
            type: 'tool',
            toolName: 'analyze_trends',
            parameters: {
                domain: 'machine_learning',
                focus: 'sensor_data_analysis',
                time_range: '2020-2024'
            },
            result: 'Key trends identified: 34% increase in transformer model usage, 52% growth in edge AI deployments, emerging focus on self-supervised learning.',
            status: 'complete'
        });

        await sleep(1000);
        onMessage({
            id: Date.now() + 8,
            type: 'thinking',
            agent: 'Writing Agent',
            content: 'Structuring document based on academic review template. Creating sections: Abstract, Introduction, Methodologies, Applications, Challenges, Future Directions, and Conclusion. Ensuring academic tone and proper citation format.',
            status: 'processing'
        });

        await sleep(2500);
        onMessage({
            id: Date.now() + 9,
            type: 'thinking',
            agent: 'Writing Agent',
            content: 'First draft complete. Document includes 6 major sections, 12 subsections, comprehensive methodology overview, and detailed application analysis.',
            status: 'complete'
        });

        await sleep(1000);
        onMessage({
            id: Date.now() + 10,
            type: 'thinking',
            agent: 'Quality Control Agent',
            content: 'Reviewing document for coherence, citation accuracy, and structural integrity. Checking for logical flow and completeness of arguments.',
            status: 'processing'
        });

        await sleep(2000);
        onMessage({
            id: Date.now() + 11,
            type: 'thinking',
            agent: 'Quality Control Agent',
            content: 'Quality review complete. Document meets academic standards. All citations properly formatted. Logical flow verified. Minor improvements applied to transitions between sections.',
            status: 'complete'
        });

        await sleep(800);
        onMessage({
            id: Date.now() + 12,
            type: 'document-update',
            content: '✨ Document generation complete! The literature review is ready for your review.'
        });

        // Generate final document
        const doc = SAMPLE_DOCUMENTS[template.id] || SAMPLE_DOCUMENTS['academic-review'];
        onDocumentUpdate(doc);
    },

    refineDocument: async (currentDoc, request, onMessage, onDocumentUpdate) => {
        await sleep(800);
        onMessage({
            id: Date.now(),
            type: 'thinking',
            agent: 'Coordinator Agent',
            content: `Analyzing refinement request: "${request}". Identifying specific sections that need modification.`,
            status: 'processing'
        });

        await sleep(1500);
        onMessage({
            id: Date.now() + 1,
            type: 'thinking',
            agent: 'Coordinator Agent',
            content: 'Request understood. Delegating refinement task to Writing Agent with specific instructions.',
            status: 'complete'
        });

        await sleep(1200);
        onMessage({
            id: Date.now() + 2,
            type: 'thinking',
            agent: 'Writing Agent',
            content: 'Applying requested changes while maintaining document coherence and style consistency.',
            status: 'processing'
        });

        await sleep(2000);
        onMessage({
            id: Date.now() + 3,
            type: 'thinking',
            agent: 'Writing Agent',
            content: 'Refinements applied successfully. Updated sections maintain consistency with the rest of the document.',
            status: 'complete'
        });

        await sleep(800);
        onMessage({
            id: Date.now() + 4,
            type: 'document-update',
            content: '✨ Document updated based on your feedback!'
        });

        // Simulate document update
        const updatedDoc = currentDoc + '\n\n## Update Note\n\nDocument has been refined based on your feedback.';
        onDocumentUpdate(updatedDoc);
    }
};