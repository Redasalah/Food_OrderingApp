import React, { useState } from 'react';
import axios from 'axios';

const ApiMethodTester = () => {
  const [endpoint, setEndpoint] = useState('/api/auth/login');
  const [method, setMethod] = useState('POST');
  const [requestBody, setRequestBody] = useState(JSON.stringify({
    email: 'test@example.com',
    password: 'password123'
  }, null, 2));
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      let data = null;
      try {
        data = JSON.parse(requestBody);
      } catch (err) {
        setError('Invalid JSON in request body');
        setLoading(false);
        return;
      }
      
      // Configure the request
      const config = {
        method: method,
        url: `http://localhost:8080${endpoint}`,
        headers: {
          'Content-Type': 'application/json'
        }
      };
      
      // Add request body for non-GET requests
      if (method !== 'GET' && method !== 'DELETE') {
        config.data = data;
      }
      
      console.log('Making request with config:', config);
      
      const result = await axios(config);
      
      setResponse({
        status: result.status,
        statusText: result.statusText,
        data: result.data,
        headers: result.headers
      });
    } catch (err) {
      console.error('API request failed:', err);
      setError({
        message: err.message,
        response: err.response ? {
          status: err.response.status,
          statusText: err.response.statusText,
          data: err.response.data
        } : 'No response received'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '20px auto', padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h2>API Method Tester</h2>
      <p>Use this tool to test API endpoints with different HTTP methods</p>
      
      <form onSubmit={handleSubmit} style={{ marginBottom: '20px' }}>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Endpoint:
          </label>
          <input
            type="text"
            value={endpoint}
            onChange={(e) => setEndpoint(e.target.value)}
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
          />
          <small style={{ color: '#666' }}>Example: /api/auth/login</small>
        </div>
        
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            HTTP Method:
          </label>
          <select
            value={method}
            onChange={(e) => setMethod(e.target.value)}
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
          >
            <option value="GET">GET</option>
            <option value="POST">POST</option>
            <option value="PUT">PUT</option>
            <option value="DELETE">DELETE</option>
            <option value="PATCH">PATCH</option>
            <option value="OPTIONS">OPTIONS</option>
          </select>
        </div>
        
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Request Body (JSON):
          </label>
          <textarea
            value={requestBody}
            onChange={(e) => setRequestBody(e.target.value)}
            style={{ 
              width: '100%', 
              height: '150px', 
              padding: '8px',
              fontFamily: 'monospace',
              boxSizing: 'border-box'
            }}
            disabled={method === 'GET' || method === 'DELETE'}
          />
          {(method === 'GET' || method === 'DELETE') && (
            <small style={{ color: '#666' }}>Body not used for {method} requests</small>
          )}
        </div>
        
        <button 
          type="submit" 
          disabled={loading}
          style={{
            padding: '10px 15px',
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.7 : 1
          }}
        >
          {loading ? 'Sending...' : 'Send Request'}
        </button>
      </form>
      
      {error && (
        <div style={{ 
          padding: '15px', 
          backgroundColor: '#f8d7da', 
          border: '1px solid #f5c6cb',
          borderRadius: '4px',
          marginBottom: '20px'
        }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#721c24' }}>Error</h3>
          <pre style={{ 
            margin: 0,
            whiteSpace: 'pre-wrap',
            backgroundColor: '#f8f9fa',
            padding: '10px',
            borderRadius: '4px'
          }}>
            {JSON.stringify(error, null, 2)}
          </pre>
        </div>
      )}
      
      {response && (
        <div style={{ 
          padding: '15px', 
          backgroundColor: '#d4edda', 
          border: '1px solid #c3e6cb',
          borderRadius: '4px'
        }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#155724' }}>Response</h3>
          <div style={{ marginBottom: '10px' }}>
            <strong>Status:</strong> {response.status} {response.statusText}
          </div>
          <div>
            <strong>Body:</strong>
            <pre style={{ 
              margin: '10px 0 0 0',
              whiteSpace: 'pre-wrap',
              backgroundColor: '#f8f9fa',
              padding: '10px',
              borderRadius: '4px'
            }}>
              {JSON.stringify(response.data, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApiMethodTester;