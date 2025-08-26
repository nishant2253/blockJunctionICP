import { useState, useEffect, useCallback } from 'react';
import authService from '../services/auth.js';

export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [principal, setPrincipal] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Handle authentication state changes
  const handleAuthStateChange = useCallback((event) => {
    const { isAuthenticated: authenticated, principal: userPrincipal } = event.detail;
    setIsAuthenticated(authenticated);
    setPrincipal(userPrincipal);
    setIsLoading(false);
    setError(null);
  }, []);

  useEffect(() => {
    // Listen for auth state changes
    window.addEventListener('authStateChanged', handleAuthStateChange);

    // Initialize auth state
    const initAuth = async () => {
      try {
        setIsLoading(true);
        
        // Wait for auth service to initialize
        await new Promise(resolve => {
          const checkInit = () => {
            if (authService.authClient) {
              resolve();
            } else {
              setTimeout(checkInit, 100);
            }
          };
          checkInit();
        });

        // Check current auth state
        const authenticated = authService.isLoggedIn();
        const userPrincipal = authService.getPrincipalText();
        
        setIsAuthenticated(authenticated);
        setPrincipal(userPrincipal);
      } catch (err) {
        console.error('Auth initialization error:', err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();

    return () => {
      window.removeEventListener('authStateChanged', handleAuthStateChange);
    };
  }, [handleAuthStateChange]);

  const login = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      await authService.login();
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message);
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      await authService.logout();
    } catch (err) {
      console.error('Logout error:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getActor = useCallback((actorName) => {
    return authService.getActor(actorName);
  }, []);

  const callCanister = useCallback(async (actorName, methodName, args = []) => {
    try {
      return await authService.authenticatedCall(actorName, methodName, args);
    } catch (err) {
      console.error(`Canister call error (${actorName}.${methodName}):`, err);
      throw err;
    }
  }, []);

  return {
    isAuthenticated,
    principal,
    isLoading,
    error,
    login,
    logout,
    getActor,
    callCanister,
  };
};