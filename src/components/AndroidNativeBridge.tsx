import React, { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { App as CapApp } from '@capacitor/app';
import { Network } from '@capacitor/network';
import { StatusBar, Style } from '@capacitor/status-bar';
import { SplashScreen } from '@capacitor/splash-screen';
import { SafeArea } from 'capacitor-plugin-safe-area';
import { isNative, platform, configureStatusBar, hideSplashScreen, triggerHaptic, initializeSafeArea, applySafeAreaToDom } from '../lib/capacitor';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';

export const AndroidNativeBridge: React.FC = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const { showToast } = useToast();
  const navigate = useNavigate();
  const splashDismissedRef = useRef<boolean>(false);

  // 1. Initialize @capacitor/splash-screen: Dismiss only after main app content has finished mounting & rendered
  useEffect(() => {
    if (!isNative) return;

    let isMounted = true;

    const dismissSplashScreen = async () => {
      if (splashDismissedRef.current) return;

      // Wait for document ready state and next animation frame for full DOM layout
      if (document.readyState !== 'complete') {
        await new Promise<void>((resolve) => {
          window.addEventListener('load', () => resolve(), { once: true });
        });
      }

      // Allow paint cycle to complete before triggering fade-out
      requestAnimationFrame(() => {
        setTimeout(async () => {
          if (!isMounted) return;
          try {
            await SplashScreen.hide({
              fadeOutDuration: 400
            });
            splashDismissedRef.current = true;
          } catch (err) {
            console.warn('Could not dismiss splash screen:', err);
          }
        }, 120);
      });
    };

    dismissSplashScreen();

    return () => {
      isMounted = false;
    };
  }, []);

  // 2. Initialize & Synchronize Status Bar with the App Theme
  useEffect(() => {
    if (!isNative) return;

    const syncStatusBarWithTheme = async () => {
      try {
        // Set icon style based on theme:
        // Style.Dark -> Light foreground content (for dark backgrounds)
        // Style.Light -> Dark foreground content (for light backgrounds)
        await StatusBar.setStyle({
          style: isDark ? Style.Dark : Style.Light
        });

        if (platform === 'android') {
          // Enable edge-to-edge overlay so safe-area padding is respected seamlessly
          await StatusBar.setOverlaysWebView({ overlay: true });
          await StatusBar.setBackgroundColor({
            color: isDark ? '#141416' : '#FFF8E1'
          });
        }
      } catch (err) {
        console.warn('Status bar configuration error:', err);
      }
    };

    syncStatusBarWithTheme();
  }, [isDark]);

  // 3. Initialize Safe Area Insets & Listen for System Inset Changes (Notches, Cutouts, Rotations)
  useEffect(() => {
    if (!isNative) return;

    let listenerHandle: { remove: () => void } | null = null;

    const setupSafeArea = async () => {
      try {
        // Initial insets query from native hardware
        const insetsData = await SafeArea.getSafeAreaInsets();
        if (insetsData?.insets) {
          applySafeAreaToDom(insetsData.insets);
        }

        // Real-time listener for safe area changes (orientation, foldables, split-screen)
        listenerHandle = await SafeArea.addListener('safeAreaChanged', (data) => {
          if (data?.insets) {
            applySafeAreaToDom(data.insets);
          }
        });
      } catch (err) {
        console.warn('Safe area initialization error:', err);
        // Fallback initialization
        initializeSafeArea();
      }
    };

    setupSafeArea();

    // Secondary window event handlers for orientation & resizing
    const handleWindowChange = () => {
      initializeSafeArea();
    };

    window.addEventListener('resize', handleWindowChange);
    window.addEventListener('orientationchange', handleWindowChange);

    return () => {
      if (listenerHandle) {
        listenerHandle.remove();
      }
      window.removeEventListener('resize', handleWindowChange);
      window.removeEventListener('orientationchange', handleWindowChange);
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
