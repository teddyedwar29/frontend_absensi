import { useState, useEffect, useRef, useCallback } from 'react';
import { isAuthenticated, logout } from '../api/auth.js';
import Swal from 'sweetalert2';

// Durasi timeout sesi dalam menit
const SESSION_TIMEOUT_MINUTES = 10;

export const useSessionTimeout = () => {
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(isAuthenticated());
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const timeoutId = useRef(null);
  const listenersSetup = useRef(false);

  const handleAutoLogout = useCallback(async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);

    if (timeoutId.current) {
      clearTimeout(timeoutId.current);
      timeoutId.current = null;
    }
    listenersSetup.current = false;

    await Swal.fire({
      title: 'Sesi Berakhir',
      text: `Anda tidak aktif selama ${SESSION_TIMEOUT_MINUTES} menit. Sesi akan berakhir.`,
      icon: 'warning',
      confirmButtonText: 'OK',
      allowOutsideClick: false,
      allowEscapeKey: false
    });

    logout();
    setTimeout(() => {
      setIsUserLoggedIn(false);
      setIsLoggingOut(false);
    }, 100);
  }, [isLoggingOut]);

  const resetTimeout = useCallback(() => {
    if (isLoggingOut || !isUserLoggedIn) return;
    if (timeoutId.current) clearTimeout(timeoutId.current);
    timeoutId.current = setTimeout(handleAutoLogout, SESSION_TIMEOUT_MINUTES * 60 * 1000);
  }, [isLoggingOut, isUserLoggedIn, handleAutoLogout]);

  useEffect(() => {
    if (!isUserLoggedIn || isLoggingOut || listenersSetup.current) return;

    const events = ['mousedown', 'keydown', 'touchstart', 'scroll'];
    const addListeners = () => {
        events.forEach(event => {
            document.addEventListener(event, resetTimeout, { passive: true });
        });
        listenersSetup.current = true;
    };
    
    const removeListeners = () => {
        events.forEach(event => {
            document.removeEventListener(event, resetTimeout);
        });
        listenersSetup.current = false;
    }

    addListeners();
    resetTimeout();

    return () => {
      removeListeners();
      if (timeoutId.current) clearTimeout(timeoutId.current);
    };
  }, [isUserLoggedIn, isLoggingOut, resetTimeout]);

  useEffect(() => {
    const checkAuthStatus = () => {
      if (isLoggingOut) return;
      const currentAuthStatus = isAuthenticated();
      if (currentAuthStatus !== isUserLoggedIn) {
        setIsUserLoggedIn(currentAuthStatus);
      }
    };
    
    window.addEventListener('authStatusChanged', checkAuthStatus);
    return () => {
      window.removeEventListener('authStatusChanged', checkAuthStatus);
    };
  }, [isUserLoggedIn, isLoggingOut]);

  return { isUserLoggedIn, isLoggingOut };
};