'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/lib/api/client';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';

export default function DebugAuthPage() {
  const { user, isAuthenticated, loading } = useAuth();
  const [apiStatus, setApiStatus] = useState<string>('Checking...');
  const [token, setToken] = useState<string | null>(null);
  const [hasSession, setHasSession] = useState<string | null>(null);
  const [currentUserTest, setCurrentUserTest] = useState<string>('Not tested');

  useEffect(() => {
    // Check localStorage
    const storedToken = localStorage.getItem('auth_token');
    const storedSession = localStorage.getItem('hasSession');
    setToken(storedToken);
    setHasSession(storedSession);

    // Check API connectivity
    checkApiStatus();
  }, []);

  const checkApiStatus = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/auth/me');
      if (response.ok) {
        setApiStatus('✅ Backend reachable (200)');
      } else if (response.status === 401) {
        setApiStatus('✅ Backend reachable (401 - expected without token)');
      } else {
        setApiStatus(`⚠️ Backend responded with ${response.status}`);
      }
    } catch (error: any) {
      setApiStatus(`❌ Backend NOT reachable: ${error.message}`);
    }
  };

  const testCurrentUser = async () => {
    setCurrentUserTest('Testing...');
    try {
      const user = await apiClient.getCurrentUser();
      setCurrentUserTest(`✅ Success: ${JSON.stringify(user)}`);
    } catch (error: any) {
      setCurrentUserTest(`❌ Failed: ${error.message} (Status: ${error.response?.status})`);
    }
  };

  const clearStorage = () => {
    localStorage.clear();
    sessionStorage.clear();
    window.location.reload();
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">🔍 Authentication Debug Panel</h1>

      {/* AuthContext State */}
      <Card className="mb-4">
        <CardContent className="p-6">
          <h2 className="text-xl font-semibold mb-4">AuthContext State</h2>
          <div className="space-y-2 font-mono text-sm">
            <div className="flex justify-between">
              <span>Loading:</span>
              <span className={loading ? 'text-yellow-600' : 'text-green-600'}>
                {loading ? '⏳ true' : '✅ false'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Authenticated:</span>
              <span className={isAuthenticated ? 'text-green-600' : 'text-red-600'}>
                {isAuthenticated ? '✅ true' : '❌ false'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>User:</span>
              <span className={user ? 'text-green-600' : 'text-red-600'}>
                {user ? `✅ ${user.email}` : '❌ null'}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* localStorage State */}
      <Card className="mb-4">
        <CardContent className="p-6">
          <h2 className="text-xl font-semibold mb-4">localStorage State</h2>
          <div className="space-y-2 font-mono text-sm">
            <div className="flex justify-between items-start">
              <span className="mr-4">auth_token:</span>
              <span className={`text-right flex-1 ${token ? 'text-green-600' : 'text-red-600'}`}>
                {token ? (
                  <>
                    ✅ Present
                    <br />
                    <span className="text-xs break-all">{token.substring(0, 50)}...</span>
                  </>
                ) : (
                  '❌ null'
                )}
              </span>
            </div>
            <div className="flex justify-between">
              <span>hasSession:</span>
              <span className={hasSession === 'true' ? 'text-green-600' : 'text-red-600'}>
                {hasSession === 'true' ? '✅ true' : '❌ false/null'}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Backend Status */}
      <Card className="mb-4">
        <CardContent className="p-6">
          <h2 className="text-xl font-semibold mb-4">Backend Connectivity</h2>
          <div className="space-y-3">
            <div className="font-mono text-sm">
              <strong>Base URL:</strong> {process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api'}
            </div>
            <div className="font-mono text-sm">
              <strong>Status:</strong> {apiStatus}
            </div>
            <Button onClick={checkApiStatus} size="sm" variant="outline">
              Recheck Backend
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* API Tests */}
      <Card className="mb-4">
        <CardContent className="p-6">
          <h2 className="text-xl font-semibold mb-4">API Tests</h2>
          <div className="space-y-3">
            <div>
              <Button onClick={testCurrentUser} size="sm" variant="outline" className="mr-2">
                Test getCurrentUser()
              </Button>
              <div className="mt-2 text-sm font-mono bg-gray-100 p-2 rounded">
                {currentUserTest}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <Card>
        <CardContent className="p-6">
          <h2 className="text-xl font-semibold mb-4">Actions</h2>
          <div className="space-x-3">
            <Button onClick={clearStorage} variant="destructive">
              Clear Storage & Reload
            </Button>
            <Button onClick={() => window.location.href = '/register'} variant="outline">
              Go to Register
            </Button>
            <Button onClick={() => window.location.href = '/login'} variant="outline">
              Go to Login
            </Button>
            <Button onClick={() => window.location.href = '/tasks'} variant="outline">
              Go to Tasks
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card className="mt-4 border-blue-300 bg-blue-50">
        <CardContent className="p-6">
          <h2 className="text-xl font-semibold mb-4">📋 Debugging Steps</h2>
          <ol className="list-decimal list-inside space-y-2 text-sm">
            <li>Check if backend is reachable (should see green checkmark above)</li>
            <li>Check if you have a token in localStorage</li>
            <li>Check if AuthContext shows isAuthenticated=true</li>
            <li>Test getCurrentUser() - should succeed if token is valid</li>
            <li>If token is invalid/expired, clear storage and register/login again</li>
            <li>After login, this page should show all green checkmarks</li>
          </ol>
        </CardContent>
      </Card>

      {/* Expected State */}
      <Card className="mt-4 border-green-300 bg-green-50">
        <CardContent className="p-6">
          <h2 className="text-xl font-semibold mb-4">✅ Expected State (After Login)</h2>
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li>Loading: ✅ false</li>
            <li>Authenticated: ✅ true</li>
            <li>User: ✅ email@example.com</li>
            <li>auth_token: ✅ Present</li>
            <li>hasSession: ✅ true</li>
            <li>Backend: ✅ Reachable</li>
            <li>getCurrentUser(): ✅ Success</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

