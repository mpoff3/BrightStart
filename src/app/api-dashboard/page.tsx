"use client";
import { useState, useEffect } from 'react';

// Add test UUID constant at the top
const TEST_CASE_ID = 'b5d5d21a-5b3b-4c62-a778-51f134904693'; // Example UUID - replace with a real one from your database

interface HealthStatus {
  status: string;
  timestamp: string;
  database: {
    connected: boolean;
    sampleSchema?: any[];
  };
  error?: string;
}

interface EndpointStatus {
  name: string;
  url: string;
  method: 'GET' | 'POST';
  status: 'healthy' | 'unhealthy' | 'loading';
  lastChecked: string;
  testPayload?: any;
  details?: any;
  error?: string;
}

export default function ApiDashboard() {
  const [endpoints, setEndpoints] = useState<EndpointStatus[]>([
    {
      name: 'Health Check',
      url: '/api/health',
      method: 'GET',
      status: 'loading',
      lastChecked: '-'
    },
    {
      name: 'Cases List',
      url: '/api/cases',
      method: 'GET',
      status: 'loading',
      lastChecked: '-'
    },
    {
      name: 'Messages List',
      url: `/api/messages?started_case_id=${TEST_CASE_ID}`,
      method: 'GET',
      status: 'loading',
      lastChecked: '-'
    },
    {
      name: 'Send Message',
      url: '/api/messages',
      method: 'POST',
      status: 'loading',
      lastChecked: '-',
      testPayload: {
        started_case_id: TEST_CASE_ID,
        content: 'Test message',
        is_human: true
      }
    },
    {
      name: 'Speech Input',
      url: '/api/speech-input',
      method: 'POST',
      status: 'loading',
      lastChecked: '-',
      testPayload: {
        audio: new Blob(['test audio content'], { type: 'audio/webm' }),
        started_case_id: TEST_CASE_ID,
        is_human: true
      }
    }
  ]);

  const checkEndpoint = async (endpoint: EndpointStatus) => {
    try {
      let response;
      
      if (endpoint.method === 'GET') {
        response = await fetch(endpoint.url);
      } else if (endpoint.method === 'POST') {
        if (endpoint.url.includes('speech-input')) {
          const formData = new FormData();
          Object.entries(endpoint.testPayload).forEach(([key, value]) => {
            formData.append(key, value);
          });
          
          response = await fetch(endpoint.url, {
            method: 'POST',
            body: formData
          });
        } else {
          response = await fetch(endpoint.url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(endpoint.testPayload)
          });
        }
      }

      const contentType = response.headers.get('content-type');
      let data;
      
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        data = { message: 'Non-JSON response received' };
      }
      
      return {
        ...endpoint,
        status: response.ok ? 'healthy' : 'unhealthy',
        lastChecked: new Date().toISOString(),
        details: data,
        error: response.ok ? undefined : data.error
      };
    } catch (error) {
      return {
        ...endpoint,
        status: 'unhealthy',
        lastChecked: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  };

  const checkAllEndpoints = async () => {
    const results = await Promise.all(endpoints.map(checkEndpoint));
    setEndpoints(results);
  };

  useEffect(() => {
    checkAllEndpoints();
    const interval = setInterval(checkAllEndpoints, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">API Status Dashboard</h1>
        
        <div className="grid gap-6">
          {endpoints.map((endpoint) => (
            <div 
              key={endpoint.url + endpoint.method}
              className="bg-gray-800 rounded-lg p-6 shadow-lg"
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-semibold">{endpoint.name}</h2>
                  <div className="text-sm text-gray-400">
                    <span className={`inline-block px-2 py-1 rounded mr-2 ${
                      endpoint.method === 'GET' ? 'bg-blue-900' : 'bg-green-900'
                    }`}>
                      {endpoint.method}
                    </span>
                    {endpoint.url}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`inline-block w-3 h-3 rounded-full ${
                    endpoint.status === 'healthy' ? 'bg-green-500' :
                    endpoint.status === 'unhealthy' ? 'bg-red-500' :
                    'bg-yellow-500 animate-pulse'
                  }`} />
                  <span className="text-sm font-medium capitalize">{endpoint.status}</span>
                </div>
              </div>

              <div className="text-sm text-gray-400 mb-4">
                Last checked: {new Date(endpoint.lastChecked).toLocaleString()}
              </div>

              {endpoint.testPayload && (
                <div className="bg-gray-900/50 border border-gray-700 rounded p-3 mb-4">
                  <p className="text-sm text-gray-400 mb-2">Test Payload:</p>
                  <pre className="text-sm">
                    {JSON.stringify(endpoint.testPayload, null, 2)}
                  </pre>
                </div>
              )}

              {endpoint.error && (
                <div className="bg-red-900/50 border border-red-700 rounded p-3 mb-4">
                  <p className="text-red-400">{endpoint.error}</p>
                </div>
              )}

              {endpoint.details && (
                <div className="bg-gray-900 rounded p-4 overflow-auto max-h-96">
                  <pre className="text-sm">
                    {JSON.stringify(endpoint.details, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-8 flex justify-end">
          <button
            onClick={checkAllEndpoints}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg
              hover:bg-blue-700 transition-colors"
          >
            Refresh All
          </button>
        </div>
      </div>
    </div>
  );
} 