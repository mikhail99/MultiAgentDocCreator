// API client for communicating with the Tongyi-DeepResearch backend
//
// Message Schema Alignment:
// This interface matches the backend Pydantic Message model for consistency.
// Backend Message model supports: system, user, agent, thinking, tool, document-update
// See backend/api/models.py for the complete schema definition.

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

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
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `HTTP ${response.status}: ${response.statusText}`);
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
