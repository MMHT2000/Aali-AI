export interface ApiHealthResponse {
  status: 'ok' | 'degraded' | 'error';
  version: string;
  timestamp: string;
  uptime: number;
  environment: string;
  modes: {
    aiProvider: string;
    smsGateway: string;
    satellite: string;
    officialData: string;
    demoDataOnly: boolean;
  };
}

export interface ApiReadinessResponse {
  status: 'ready' | 'not_ready';
  timestamp: string;
  checks: {
    database: {
      status: 'up' | 'down' | 'unconfigured';
      message?: string;
    };
  };
}

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

export async function checkApiHealth(): Promise<ApiHealthResponse> {
  const response = await fetch(`${API_BASE_URL}/api/v1/health`, {
    headers: {
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`API health check failed with status ${response.status}`);
  }

  return response.json();
}

export async function checkApiReadiness(): Promise<ApiReadinessResponse> {
  const response = await fetch(`${API_BASE_URL}/api/v1/health/readiness`, {
    headers: {
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`API readiness check failed with status ${response.status}`);
  }

  return response.json();
}

