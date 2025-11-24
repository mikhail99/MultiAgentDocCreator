// API client for communicating with the Tongyi-DeepResearch backend
//
// Message Schema Alignment:
// This interface matches the backend Pydantic Message model for consistency.
// Backend Message model supports: system, user, agent, thinking, tool, document-update
// See backend/api/models.py for the complete schema definition.

/// <reference types="vite/client" />

const API_BASE_URL = (import.meta.env as any).VITE_API_URL || 'http://localhost:8000';

export interface Message {
  // Core message properties
  id: string;
  type: 'system' | 'user' | 'agent' | 'thinking' | 'tool' | 'document-update';
  content: string;

  // Optional agent/context information
  agent?: string;
  status?: 'processing' | 'complete';
  role?: string;  // For LangChain compatibility

  // Clarification and document generation
  questions?: string[];
  answers?: Record<string, string>;

  // File handling
  files?: Array<{
    name: string;
    size?: number;
    type?: string;
    lastModified?: number;
  }>;

  // Tool execution details
  toolName?: string;
  parameters?: Record<string, any>;
  result?: string;
  tool_calls?: Array<{
    id?: string;
    name: string;
    arguments: Record<string, any>;
  }>;

  // Source information
  sources?: Array<{
    url: string;
    title: string;
    type: string;
  }>;
}

export interface ResearchResponse {
  success: boolean;
  final_answer?: string;
  messages: Message[];
  tools_used: string[];
  iterations: number;
  is_complete: boolean;
  error?: string;
}

export interface ClarificationResponse {
  questions: string[];
}

export interface DocumentGenerationRequest {
  template_id: string;
  task: string;
  answers: Record<string, string>;
  agent_settings?: Record<string, any>;
}

class ApiClient {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;

    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;

        try {
          const errorData = await response.json();

          // Handle FastAPI validation errors
          if (response.status === 422 && errorData.detail) {
            if (Array.isArray(errorData.detail)) {
              // Validation errors array
              const validationErrors = errorData.detail.map((err: any) =>
                `${err.loc.join('.')}: ${err.msg}`
              ).join(', ');
              errorMessage = `Validation Error: ${validationErrors}`;
            } else {
              // Other detail formats
              errorMessage = errorData.detail;
            }
          } else if (errorData.message) {
            errorMessage = errorData.message;
          } else if (errorData.detail) {
            errorMessage = errorData.detail;
          }
        } catch (parseError) {
          // If JSON parsing fails, use the default error message
          console.warn('Failed to parse error response:', parseError);
        }

        throw new Error(errorMessage);
      }

      return await response.json();
    } catch (error) {
      console.error(`API request failed: ${endpoint}`, error);
      throw error;
    }
  }

  async performResearch(query: string, customInstructions: string = ""): Promise<ResearchResponse> {
    return this.request<ResearchResponse>('/api/research', {
      method: 'POST',
      body: JSON.stringify({
        query,
        custom_instructions: customInstructions,
      }),
    });
  }

  async *performResearchStream(query: string, customInstructions: string = ""): AsyncGenerator<Message | { type: 'complete', data: any } | { type: 'error', data: any }, void, unknown> {
    const url = `${API_BASE_URL}/api/research/stream`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
        custom_instructions: customInstructions,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();

    if (!reader) {
      throw new Error('Response body is not readable');
    }

    let buffer = '';

    try {
      while (true) {
        const { done, value } = await reader.read();

        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');

        // Keep the last incomplete line in buffer
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6)); // Remove 'data: ' prefix
              yield data;
            } catch (e) {
              console.warn('Failed to parse SSE data:', line, e);
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  }

  async getClarificationQuestions(templateId: string, task: string): Promise<ClarificationResponse> {
    return this.request<ClarificationResponse>('/api/clarification', {
      method: 'POST',
      body: JSON.stringify({
        template_id: templateId,
        task,
      }),
    });
  }

  async generateDocument(request: DocumentGenerationRequest): Promise<ResearchResponse> {
    return this.request<ResearchResponse>('/api/generate-document', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async healthCheck(): Promise<{ status: string; service: string }> {
    return this.request('/health', {
      method: 'GET',
    });
  }
}

export const apiClient = new ApiClient();
