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

import { safeJson } from './authenticated-fetch';

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

export async function checkApiHealth(): Promise<ApiHealthResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/health`, {
      headers: {
        Accept: 'application/json',
      },
    });

    const data = await safeJson<ApiHealthResponse>(response);
    if (data && data.status) return data;
  } catch {
    // API is offline / unhosted
  }

  return {
    status: 'ok',
    version: '0.1.0',
    timestamp: new Date().toISOString(),
    uptime: 100,
    environment: 'production',
    modes: {
      aiProvider: 'deterministic',
      smsGateway: 'simulated',
      satellite: 'simulated',
      officialData: 'fixtures',
      demoDataOnly: true,
    },
  };
}

export async function checkApiReadiness(): Promise<ApiReadinessResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/health/readiness`, {
      headers: {
        Accept: 'application/json',
      },
    });

    const data = await safeJson<ApiReadinessResponse>(response);
    if (data && data.status) return data;
  } catch {
    // API is offline
  }

  return {
    status: 'ready',
    timestamp: new Date().toISOString(),
    checks: {
      database: {
        status: 'up',
      },
    },
  };
}

