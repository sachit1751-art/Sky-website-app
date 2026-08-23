import React, { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { App as CapApp } from '@capacitor/app';
import { Network } from '@capacitor/network';
import { SafeArea } from 'capacitor-plugin-safe-area';
import { isNative, configureStatusBar, hideSplashScreen, triggerHaptic, initializeSafeArea, applySafeAreaToDom } from '../lib/capacitor';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';

export const AndroidNativeBridge: React.FC = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const { showToast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();
  const lastBackPressTimeRef = useRef<number>(0);
  const routeHistoryStackRef = useRef<string[]>([]);

  // Track location changes in our custom route navigation stack
  useEffect(() => {
    const currentPath = location.pathname + location.search + location.hash;
    const stack = routeHistoryStackRef.current;
    if (stack.length === 0 || stack[stack.length - 1] !== currentPath) {
      stack.push(currentPath);
      // Cap stack to reasonable size to prevent unbounded memory growth
      if (stack.length > 50) {
        stack.shift();
      }
    }
  }, [location.pathname, location.search, location.hash]);

  // 1. Sync Status Bar theme, Safe Area insets & hide initial Splash Screen
  useEffect(() => {
    if (!isNative) return;

    // Apply status bar styling
    configureStatusBar(isDark);

    // Initialize Safe Area measurements for device notch / camera cutout
    initializeSafeArea();

    const timer = setTimeout(() => {
      hideSplashScreen();
    }, 150);

    return () => clearTimeout(timer);
  }, [isDark]);

  // 2. Safe Area Inset Change Listener (orientation changes, foldables, multi-window mode)
  useEffect(() => {
    if (!isNative) return;

    let listenerHandle: { remove: () => void } | null = null;

    try {
      SafeArea.addListener('safeAreaChanged', (data) => {
        if (data && data.insets) {
          applySafeAreaToDom(data.insets);
        }
      }).then((handle) => {
        listenerHandle = handle;
      }).catch((err) => {
        console.warn('Safe area listener failed to attach:', err);
      });
    } catch (err) {
      // Non-blocking fallback
    }

    const handleResizeOrOrientation = () => {
      initializeSafeArea();
    };

    window.addEventListener('resize', handleResizeOrOrientation);
    window.addEventListener('orientationchange', handleResizeOrOrientation);

    return () => {
      if (listenerHandle) {
        listenerHandle.remove();
      }
      window.removeEventListener('resize', handleResizeOrOrientation);
      window.removeEventListener('orientationchange', handleResizeOrOrientation);
    };
  }, []);

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
