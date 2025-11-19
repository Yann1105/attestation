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

// Templates API
export const templatesApi = {
  async getAll(): Promise<CertificateTemplate[]> {
    return apiCall('/templates');
  },

  async get(id: string): Promise<CertificateTemplate> {
    return apiCall(`/templates/${id}`);
  },

  async create(template: Omit<CertificateTemplate, 'id' | 'createdAt' | 'updatedAt'>): Promise<CertificateTemplate> {
    return apiCall('/templates', {
      method: 'POST',
      body: JSON.stringify(template),
    });
  },

  async update(id: string, updates: Partial<CertificateTemplate>): Promise<CertificateTemplate> {
    return apiCall(`/templates/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
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

// Utility function to generate certificate numbers
export const generateCertificateNumber = async (): Promise<string> => {
  const response = await apiCall('/certificates/generate-number');
  return response.certificateNumber;
};