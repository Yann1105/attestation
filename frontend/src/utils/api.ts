// Frontend API client - calls backend REST API

import { Participant, CertificateTemplate, Training, CertificateData } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

// Auth token management
let authToken: string | null = null;

export const setAuthToken = (token: string | null) => {
  authToken = token;
  if (token) {
    localStorage.setItem('auth_token', token);
  } else {
    localStorage.removeItem('auth_token');
  }
};

export const getAuthToken = (): string | null => {
  if (!authToken) {
    authToken = localStorage.getItem('auth_token');
  }
  return authToken;
};

// Helper function for API calls
const apiCall = async (endpoint: string, options: RequestInit = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = getAuthToken();

  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);

    // Handle 401 Unauthorized
    if (response.status === 401) {
      setAuthToken(null);
      throw new Error('Session expired. Please login again.');
    }

    let data;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      // Handle non-JSON responses (e.g., plain text error messages)
      const text = await response.text();
      data = { error: text || `HTTP error! status: ${response.status}` };
    }

    if (!response.ok) {
      const errorMessage = data.error || data.message || `HTTP error! status: ${response.status}`;
      if (data.details) {
        console.error('Validation details:', JSON.stringify(data.details, null, 2));
      }
      throw new Error(errorMessage);
    }

    return data;
  } catch (error) {
    console.error(`API call failed: ${endpoint}`, error);
    throw error;
  }
};

// Auth API
export const authApi = {
  async login(email: string, password: string) {
    const response = await apiCall('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    if (response.success && response.data?.token) {
      setAuthToken(response.data.token);
    }

    return response;
  },

  async verify() {
    return apiCall('/auth/verify');
  },

  logout() {
    setAuthToken(null);
  }
};

// Participants API
export const participantsApi = {
  async getAll(): Promise<Participant[]> {
    return apiCall('/participants');
  },

  async create(participant: Omit<Participant, 'id' | 'requestDate' | 'status' | 'createdAt' | 'updatedAt'>): Promise<Participant> {
    return apiCall('/participants', {
      method: 'POST',
      body: JSON.stringify(participant),
    });
  },

  async update(id: string, updates: Partial<Participant>): Promise<Participant> {
    return apiCall(`/participants/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  async delete(id: string): Promise<void> {
    return apiCall(`/participants/${id}`, {
      method: 'DELETE',
    });
  }
};

const normalizeTemplate = (data: any): CertificateTemplate => {
  return {
    ...data,
    aiGenerated: data.ai_generated !== undefined ? data.ai_generated : data.aiGenerated,
    aiPrompt: data.ai_prompt || data.aiPrompt,
    outputFormat: data.output_format || data.outputFormat || 'html',
    canvasData: typeof data.canvas_data === 'string' ? JSON.parse(data.canvas_data) : (data.canvas_data || data.canvasData)
  };
};

// Templates API
export const templatesApi = {
  async getAll(): Promise<CertificateTemplate[]> {
    const data = await apiCall('/templates');
    return Array.isArray(data) ? data.map(normalizeTemplate) : [];
  },

  async get(id: string): Promise<CertificateTemplate> {
    const data = await apiCall(`/templates/${id}`);
    return normalizeTemplate(data);
  },

  async create(template: Omit<CertificateTemplate, 'id' | 'createdAt' | 'updatedAt'>): Promise<CertificateTemplate> {
    const data = await apiCall('/templates', {
      method: 'POST',
      body: JSON.stringify(template),
    });
    return normalizeTemplate(data);
  },

  async update(id: string, updates: Partial<CertificateTemplate>): Promise<CertificateTemplate> {
    const data = await apiCall(`/templates/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
    return normalizeTemplate(data);
  },

  async delete(id: string): Promise<void> {
    return apiCall(`/templates/${id}`, {
      method: 'DELETE',
    });
  },

  async uploadImage(file: File): Promise<{ imageUrl: string }> {
    const formData = new FormData();
    formData.append('image', file);

    const url = `${API_BASE_URL}/templates/upload-image`;
    const token = getAuthToken();

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      },
      body: formData,
    });

    if (response.status === 401) {
      setAuthToken(null);
      throw new Error('Session expired. Please login again.');
    }

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || `HTTP error! status: ${response.status}`);
    }

    return data;
  },

  async previewTemplate(id: string): Promise<string> {
    const url = `${API_BASE_URL}/templates/${id}/preview`;
    const token = getAuthToken();

    const response = await fetch(url, {
      headers: {
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      },
    });

    if (response.status === 401) {
      setAuthToken(null);
      throw new Error('Session expired. Please login again.');
    }

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data.error || `HTTP error! status: ${response.status}`);
    }

    // Return HTML content for preview
    const htmlContent = await response.text();
    return htmlContent;
  },

  async downloadTemplate(id: string): Promise<void> {
    const url = `${API_BASE_URL}/templates/${id}/download`;
    const token = getAuthToken();

    const response = await fetch(url, {
      headers: {
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      },
    });

    if (response.status === 401) {
      setAuthToken(null);
      throw new Error('Session expired. Please login again.');
    }

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data.error || `HTTP error! status: ${response.status}`);
    }

    // Create download link
    const blob = await response.blob();
    const downloadUrl = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = `template_${id}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(downloadUrl);
  }
};

// Trainings API
export const trainingsApi = {
  async getAll(): Promise<Training[]> {
    return apiCall('/trainings');
  },

  async create(training: Omit<Training, 'id' | 'createdAt' | 'updatedAt'>): Promise<Training> {
    return apiCall('/trainings', {
      method: 'POST',
      body: JSON.stringify(training),
    });
  },

  async update(id: string, updates: Partial<Training>): Promise<Training> {
    return apiCall(`/trainings/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  async delete(id: string): Promise<void> {
    return apiCall(`/trainings/${id}`, {
      method: 'DELETE',
    });
  }
};

// Email API
export const emailApi = {
  async sendCertificate(participantEmail: string, certificateData: Partial<CertificateData> & { template: CertificateTemplate; formData?: any; certificateResult?: any }) {
    return apiCall('/email/send-certificate', {
      method: 'POST',
      body: JSON.stringify({
        participantEmail,
        certificateData
      }),
    });
  }
};

// Certificate generation API
export const certificateApi = {
  async generateCertificate(templateId: string, participantData: { participantName: string; certificateNumber: string }, formData?: any, isQuickApproval: boolean = false) {
    return apiCall('/certificates/generate', {
      method: 'POST',
      body: JSON.stringify({
        templateId,
        participantData,
        formData,
        isQuickApproval
      }),
    });
  },

  async viewCertificate(participantId: string) {
    return apiCall(`/certificates/view/${participantId}`);
  }
};

// Canvas Feature API
export const canvasApi = {
  async getAllTemplates(): Promise<CertificateTemplate[]> {
    try {
      const response = await apiCall('/canvas/templates');
      const data = response.success ? response.data : response;
      const templates = Array.isArray(data) ? data : [];
      return templates.map(normalizeTemplate);
    } catch (error) {
      console.error('Failed to fetch canvas templates:', error);
      return [];
    }
  },

  async getTemplate(id: string): Promise<CertificateTemplate> {
    const response = await apiCall(`/canvas/templates/${id}`);
    const data = response.data || response;
    return normalizeTemplate(data);
  },

  async generate(prompt: string, options: any = {}): Promise<CertificateTemplate> {
    const response = await apiCall('/canvas/generate', {
      method: 'POST',
      body: JSON.stringify({ prompt, ...options }),
    });

    console.log('Canvas Generation Response:', response);

    // Normalize response
    const content = response.html || response.canvasData?.content || (typeof response.canvasData === 'string' ? response.canvasData : '');
    const format = response.outputFormat || response.canvasData?.format || 'html';

    const normalized = {
      ...response,
      name: response.name || `Design ${new Date().toLocaleString()}`,
      html: format === 'html' ? content : undefined,
      width: response.width,
      height: response.height,
      canvasData: response.canvasData || { content, format },
      outputFormat: format,
      aiGenerated: true,
      aiPrompt: prompt
    } as CertificateTemplate;

    console.log('Normalized Generate Template:', normalized);
    return normalized;
  },

  async create(template: any): Promise<CertificateTemplate> {
    const response = await apiCall('/canvas/templates', {
      method: 'POST',
      body: JSON.stringify(template),
    });
    const data = response.data || response;
    return normalizeTemplate(data);
  },

  async update(id: string, updates: any): Promise<CertificateTemplate> {
    const response = await apiCall(`/canvas/templates/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
    const data = response.data || response;
    return normalizeTemplate(data);
  },

  async delete(id: string): Promise<void> {
    await apiCall(`/canvas/templates/${id}`, {
      method: 'DELETE',
    });
  },

  async renderPDF(canvasData: any, variables: any = {}): Promise<Blob> {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/canvas/render/pdf`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ canvasData, variables }),
    });

    if (!response.ok) throw new Error('PDF Export failed');
    return response.blob();
  }
};

// AI Templates API
export const aiTemplatesApi = {
  async generate(request: {
    type: 'attestation' | 'certificat' | 'affiche';
    customPrompt?: string;
    save?: boolean;
    name?: string;
  }): Promise<{
    type: string;
    html: string;
    variables: string[];
    description: string;
    saved?: boolean;
    templateId?: string;
  }> {
    return apiCall('/templates/generate-ai', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  },

  async saveVersion(templateId: string, html: string, variables: any) {
    return apiCall(`/templates/${templateId}/version`, {
      method: 'POST',
      body: JSON.stringify({ html, variables }),
    });
  }
};

// Utility function to generate certificate numbers

export const generateCertificateNumber = async (): Promise<string> => {
  const response = await apiCall('/certificates/generate-number');
  return response.certificateNumber;
};