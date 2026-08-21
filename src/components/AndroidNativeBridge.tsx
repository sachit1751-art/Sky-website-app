import React, { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { App as CapApp } from '@capacitor/app';
import { Network } from '@capacitor/network';
import { isNative, configureStatusBar, hideSplashScreen, triggerHaptic } from '../lib/capacitor';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';

export const AndroidNativeBridge: React.FC = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const { showToast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();
  const lastBackPressTimeRef = useRef<number>(0);

  // 1. Sync Status Bar theme & hide initial Splash Screen on first mount
  useEffect(() => {
    if (!isNative) return;

    configureStatusBar(isDark);
    const timer = setTimeout(() => {
      hideSplashScreen();
    }, 150);

    return () => clearTimeout(timer);
  }, [isDark]);

  // 2. Hardware / Gesture Back Button Handling
  useEffect(() => {
    if (!isNative) return;

    const backListenerPromise = CapApp.addListener('backButton', ({ canGoBack }) => {
      // Check if any open modals exist in DOM to dismiss first
      const openModalCloseBtn = document.querySelector<HTMLButtonElement>(
        '[data-modal-close="true"], .modal-close-btn, button[aria-label="Close modal"], button[aria-label="Close"]'
      );
      
      if (openModalCloseBtn) {
        triggerHaptic('light');
        openModalCloseBtn.click();
        return;
      }

      // If we are on a nested route (e.g. /roms, /device, /team, /community, /admin/...), navigate back
      const isRoot = location.pathname === '/' || location.pathname === '';
      if (!isRoot) {
        triggerHaptic('selection');
        navigate(-1);
        return;
      }

      // If at root page: double-tap back within 2 seconds to exit
      const now = Date.now();
      if (now - lastBackPressTimeRef.current < 2000) {
        triggerHaptic('heavy');
        CapApp.exitApp();
      } else {
        lastBackPressTimeRef.current = now;
        triggerHaptic('light');
        showToast({
          title: 'Press back again to exit SKY',
          type: 'info'
        });
      }
    });

    return () => {
      backListenerPromise.then((handle) => handle.remove());
    };
  }, [location.pathname, navigate, showToast]);

  // 3. Deep Linking Listener (e.g. sky://roms or https://sky-roms.vercel.app/device)
  useEffect(() => {
    if (!isNative) return;

    const urlListenerPromise = CapApp.addListener('appUrlOpen', (data) => {
      try {
        const parsedUrl = new URL(data.url);
        // Extract pathname + search + hash
        const path = parsedUrl.pathname + parsedUrl.search + parsedUrl.hash;
        if (path) {
          triggerHaptic('medium');
          navigate(path);
        }
      } catch {
        // Fallback for custom schemes like sky://roms/123
        const relativePath = data.url.replace(/^[a-zA-Z]+:\/\//, '/');
        if (relativePath) {
          triggerHaptic('medium');
          navigate(relativePath);
        }
      }
    });

    return () => {
      urlListenerPromise.then((handle) => handle.remove());
    };
  }, [navigate]);

  // 4. Native Network Status Monitoring
  useEffect(() => {
    if (!isNative) return;

    const networkListenerPromise = Network.addListener('networkStatusChange', (status) => {
      if (!status.connected) {
        triggerHaptic('warning');
        showToast({
          title: 'No Internet Connection',
          message: 'Viewing cached specifications & ROM catalog.',
          type: 'info'
        });
      } else {
        triggerHaptic('success');
        showToast({
          title: 'Back Online',
          message: 'Connected to SKY network.',
          type: 'success'
        });
      }
    });

    return () => {
      networkListenerPromise.then((handle) => handle.remove());
    };
  }, [showToast]);

  return null;
};
