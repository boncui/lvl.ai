'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from 'react';
import { useRouter } from 'next/navigation';
import { User } from '@/lib/types';
import apiClient from '@/lib/api/client';
import type { InternalAxiosRequestConfig } from 'axios';
import { isAxiosError } from 'axios';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isVerified: boolean;
  loading: boolean;
  accessToken: string | null;
  login: (email: string, password: string, nextUrl?: string) => Promise<void>;
  register: (name: string, email: string, password: string, nextUrl?: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  updateUser: (userData: Partial<User>) => void;
  verifyEmail?: (email: string, code: string) => Promise<string>;
  resendCode?: (email: string) => Promise<string>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/** Utilities */
const hasWindow = () => typeof window !== 'undefined';
const getSessionFlag = () =>
  hasWindow() ? localStorage.getItem('hasSession') === 'true' : false;
const setSessionFlag = (val: boolean) => {
  if (!hasWindow()) return;
  if (val) localStorage.setItem('hasSession', 'true');
  else localStorage.removeItem('hasSession');
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // timers & guards
  const refreshPromiseRef = useRef<Promise<boolean> | null>(null);
  const bcRef = useRef<BroadcastChannel | null>(null);
  const mountedRef = useRef(true);

  /** Call token refresh; return true if session refreshed */
  const doRefresh = useCallback(async (): Promise<boolean> => {
    try {
      // Check if we have a token to refresh
      const token = apiClient.getToken();
      if (!token || !apiClient.isAuthenticated()) {
        // No token available, clear everything
        setSessionFlag(false);
        apiClient.clearToken();
        return false;
      }

      // Try to get current user to validate token
      // Use fetch to avoid interceptor loops
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api'}/auth/me`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        // Token is invalid, clear everything
        setSessionFlag(false);
        apiClient.clearToken();
        if (mountedRef.current) {
          setUser(null);
          setAccessToken(null);
        }
        return false;
      }

      const data = await response.json();
      if (data.success && data.user && mountedRef.current) {
        setUser(data.user);
        setAccessToken(token);
        setSessionFlag(true); // Ensure flag is set
        return true;
      }
      
      // Invalid response, clear everything
      setSessionFlag(false);
      apiClient.clearToken();
      if (mountedRef.current) {
        setUser(null);
        setAccessToken(null);
      }
      return false;
    } catch (error) {
      console.error('Token refresh failed:', error);
      // On error, clear everything to ensure clean state
      setSessionFlag(false);
      apiClient.clearToken();
      if (mountedRef.current) {
        setUser(null);
        setAccessToken(null);
      }
      return false;
    } finally {
      refreshPromiseRef.current = null;
    }
  }, []);

  /** Refresh user data from database */
  const refreshUser = useCallback(async (): Promise<void> => {
    if (!user) return;

    try {
      const current = await apiClient.getCurrentUser();
      if (mountedRef.current) {
        setUser(current);
        // Broadcast user update to other tabs
        bcRef.current?.postMessage({ type: 'userUpdate', user: current });
      }
    } catch (err) {
      console.error('Failed to refresh user data:', err);
      // Don't logout on user refresh failure - might be temporary network issue
    }
  }, [user]);

  /** Update user data locally (optimistic update) */
  const updateUser = useCallback((userData: Partial<User>) => {
    setUser(prevUser => {
      if (!prevUser) return null;
      const updatedUser = { ...prevUser, ...userData };
      // Broadcast update to other tabs
      bcRef.current?.postMessage({ type: 'userUpdate', user: updatedUser });
      return updatedUser;
    });
  }, []);

  // init on mount
  useEffect(() => {
    mountedRef.current = true;

    // cross-tab sync
    if (hasWindow()) {
      bcRef.current = new BroadcastChannel('auth');
      bcRef.current.onmessage = (ev) => {
        if (ev?.data === 'logout') {
          setSessionFlag(false);
          setUser(null);
          setAccessToken(null);
          apiClient.clearToken();
        }
        if (ev?.data?.type === 'login') {
          setSessionFlag(true);
          // optional: lazily fetch user when this tab needs it
        }
        // Handle user updates from other tabs
        if (ev?.data?.type === 'userUpdate') {
          setUser(ev.data.user);
        }
      };
    }

    const init = async () => {
      // If we don't have a prior session flag, skip boot refresh
      if (!getSessionFlag()) {
        setLoading(false);
        return;
      }

      // Check if we actually have a token stored
      const storedToken = apiClient.getToken();
      if (!storedToken) {
        // Session flag exists but no token - clear stale flag
        setSessionFlag(false);
        setUser(null);
        setAccessToken(null);
        apiClient.clearToken();
        setLoading(false);
        return;
      }

      try {
        // Try to refresh session silently
        const ok = await doRefresh();
        if (!ok) {
          // doRefresh already cleared everything, just update state
          if (mountedRef.current) {
            setUser(null);
            setAccessToken(null);
          }
        }
      } catch (error) {
        // If refresh fails, clear session (doRefresh already handles this)
        console.debug('Init refresh failed:', error);
        if (mountedRef.current) {
          setUser(null);
          setAccessToken(null);
        }
      } finally {
        if (mountedRef.current) setLoading(false);
      }
    };

    init();

    return () => {
      mountedRef.current = false;
      if (bcRef.current) {
        bcRef.current.close();
        bcRef.current = null;
      }
    };
  }, [doRefresh]);

  /* ------------------------------- LOGIN ------------------------------- */
  const login = useCallback(
    async (email: string, password: string, nextUrl?: string) => {
      try {
        const response = await apiClient.login({ email, password });
        // apiClient.login already sets the token internally, just sync our state
        const token = response.data.token;
        const userData = response.data.user as User;
        
        setSessionFlag(true);
        setUser(userData);
        setAccessToken(token);
        bcRef.current?.postMessage({ type: 'login' });

        // caller decides where to go; fallback to home
        if (nextUrl) router.replace(nextUrl);
        else router.replace('/home');
      } catch (err: unknown) {
        // Normalize login errors to user-friendly messages
        if (isAxiosError(err)) {
          const status = err.response?.status;
          const apiMessage = err.response?.data?.message || err.response?.data?.error;
          
          if (status === 401) {
            throw new Error('Invalid email or password');
          }
          if (status === 404) {
            throw new Error('User not found');
          }
          if (status === 403 && (apiMessage?.toLowerCase() || '').includes('verify')) {
            // Preserve verify wording so the page can route accordingly
            throw new Error(apiMessage);
          }
          throw new Error(apiMessage || err.message || 'Login failed');
        }
        throw err;
      }
    },
    [router]
  );

  /* ------------------------------ REGISTER ------------------------------ */
  const register = useCallback(
    async (name: string, email: string, password: string, nextUrl?: string) => {
      try {
        const response = await apiClient.register({ name, email, password });
        // Don't automatically log in after registration - let user go to login page
        // setSessionFlag(true);
        // setUser(response.user);
        // setAccessToken(response.token);
        // bcRef.current?.postMessage({ type: 'login' });

        // caller decides where to go; fallback to login page
        if (nextUrl) router.replace(nextUrl);
        else router.replace('/login');
      } catch (err: unknown) {
        // Normalize registration errors to user-friendly messages
        if (isAxiosError(err)) {
          const status = err.response?.status;
          const apiMessage = err.response?.data?.message || err.response?.data?.error;
          
          if (status === 409) {
            throw new Error('Email already exists');
          }
          if (status === 400) {
            throw new Error(apiMessage || 'Invalid registration data');
          }
          throw new Error(apiMessage || err.message || 'Registration failed');
        }
        throw err;
      }
    },
    [router]
  );

  /* ------------------------------ LOGOUT ------------------------------ */
  const logout = useCallback(async () => {
    try {
      // Only call logout API if we have a valid token
      if (user && apiClient.isAuthenticated()) {
        await apiClient.logout();
      }
    } catch (err) {
      // Ignore logout API errors - we're logging out anyway
      console.debug('Logout API call failed (expected if session expired):', err);
    } finally {
      setUser(null);
      setAccessToken(null);
      setSessionFlag(false);
      apiClient.clearToken();
      bcRef.current?.postMessage('logout');
      router.push('/');
    }
  }, [user, router]);

  /* ----------------------- REQUEST interceptor ------------------------ */
  useEffect(() => {
    const reqId = apiClient.client.interceptors.request.use(
      async (config: InternalAxiosRequestConfig) => {
        // If a refresh is in-flight, wait for it to finish to avoid 401 loops
        if (refreshPromiseRef.current) {
          const ok = await refreshPromiseRef.current;
          if (!ok) {
            return Promise.reject(new Error('Session expired – request blocked'));
          }
        }
        return config;
      }
    );
    return () => apiClient.client.interceptors.request.eject(reqId);
  }, []);

  /* ----------------------- RESPONSE interceptor ----------------------- */
  useEffect(() => {
    const resId = apiClient.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest: InternalAxiosRequestConfig & { _retry?: boolean } = error.config || {};
        const url: string = String(originalRequest.url || '');
        
        if (
          error.response?.status === 401 &&
          !originalRequest._retry &&
          !url.includes('/auth/refresh') &&
          !url.includes('/auth/me') && // Don't retry /auth/me to avoid loops
          // Do NOT attempt refresh on explicit login failures
          !url.includes('/auth/login') &&
          !url.includes('/auth/register')
        ) {
          originalRequest._retry = true;
          
          // Try to refresh session
          if (!refreshPromiseRef.current) {
            refreshPromiseRef.current = doRefresh();
          }
          
          try {
            const ok = await refreshPromiseRef.current;
            if (ok) {
              // Refresh succeeded, retry original request
              return apiClient.client(originalRequest);
            }
          } catch (err) {
            console.debug('Refresh failed during interceptor', err);
          }
          
          // Refresh failed - logout and redirect
          await logout();
          return Promise.reject(new Error('Session expired'));
        }
        return Promise.reject(error);
      }
    );
    return () => apiClient.client.interceptors.response.eject(resId);
  }, [doRefresh, logout]);

  /* ----------------------- verification helpers ----------------------- */
  const verifyEmail = useCallback(
    async (email: string, code: string): Promise<string> => {
      try {
        const response = await apiClient.verifyEmail(code);
        return response.message || 'Email verified successfully';
      } catch (err: unknown) {
        if (isAxiosError(err)) {
          const apiMessage = err.response?.data?.message || err.response?.data?.error;
          throw new Error(apiMessage || 'Email verification failed');
        }
        throw err;
      }
    },
    []
  );

  const resendCode = useCallback(async (email: string): Promise<string> => {
    try {
      const response = await apiClient.resendVerificationEmail(email);
      return response.message || 'Verification code sent';
    } catch (err: unknown) {
      if (isAxiosError(err)) {
        const apiMessage = err.response?.data?.message || err.response?.data?.error;
        throw new Error(apiMessage || 'Failed to resend verification code');
      }
      throw err;
    }
  }, []);

  /* ------------------------------ context ----------------------------- */
  const value = useMemo<AuthContextType>(
    () => ({
      user,
      isAuthenticated: !!user,
      isVerified: !!user?.isEmailVerified,
      loading,
      accessToken,
      login,
      register,
      logout,
      refreshUser,
      updateUser,
      verifyEmail,
      resendCode,
    }),
    [user, loading, accessToken, login, register, logout, refreshUser, updateUser, verifyEmail, resendCode]
  );

  // Don't render children until auth initialization completes
  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
};