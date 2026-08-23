import React, { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { App as CapApp } from '@capacitor/app';
import { isNative, triggerHaptic } from '../lib/capacitor';
import { useToast } from '../context/ToastContext';

/**
 * AndroidBackButtonHandler
 *
 * Dedicated component that listens for native Android back button presses
 * using Capacitor App plugin (App.addListener('backButton')).
 *
 * Handles:
 * 1. Active mobile navigation drawers and sidebars.
 * 2. Active modals, command palettes, and custom dialogs.
 * 3. React-Router DOM history navigation stack.
 * 4. Confirmation toast & double-tap app exit at root route.
 */
export const AndroidBackButtonHandler: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const lastBackPressTimeRef = useRef<number>(0);
  const routeHistoryStackRef = useRef<string[]>([]);

  // Track location changes in navigation stack
  useEffect(() => {
    const currentPath = location.pathname + location.search + location.hash;
    const stack = routeHistoryStackRef.current;
    if (stack.length === 0 || stack[stack.length - 1] !== currentPath) {
      stack.push(currentPath);
      // Bound the stack size to avoid memory growth
      if (stack.length > 50) {
        stack.shift();
      }
    }
  }, [location.pathname, location.search, location.hash]);

  useEffect(() => {
    if (!isNative) return;

    const backListenerPromise = CapApp.addListener('backButton', ({ canGoBack }) => {
      // 1. Check for mobile navigation drawer / overlay
      const mobileDrawer = document.getElementById('mobile-navigation-drawer');
      const mobileMenuToggle = document.getElementById('mobile-menu-toggle-btn');

      if (mobileDrawer || (mobileMenuToggle && mobileMenuToggle.getAttribute('aria-expanded') === 'true')) {
        triggerHaptic('light');
        if (mobileMenuToggle) {
          mobileMenuToggle.click();
        } else {
          window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', code: 'Escape', bubbles: true }));
        }
        return;
      }

      // 2. Check for active modals / command palette / details modal / comparison modal
      const openModalCloseBtn = document.querySelector<HTMLButtonElement>(
        '[data-modal-close="true"], .modal-close-btn, button[aria-label="Close modal"], button[aria-label="Close"], button[aria-label="Close search"], button[aria-label="Close details modal"], button[aria-label="Close comparison"], [role="dialog"] button[aria-label*="close" i]'
      );

      if (openModalCloseBtn) {
        triggerHaptic('light');
        openModalCloseBtn.click();
        return;
      }

      // 3. Check for any open dialog elements without an explicit close button
      const openDialog = document.querySelector('[role="dialog"], [aria-modal="true"], dialog[open]');
      if (openDialog) {
        triggerHaptic('light');
        window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', code: 'Escape', bubbles: true }));
        return;
      }

      // 4. History Navigation Check
      const isRoot = location.pathname === '/' || location.pathname === '';
      const hasActiveSubroute = !isRoot;
      const hasStackHistory = routeHistoryStackRef.current.length > 1;

      if (hasActiveSubroute || (canGoBack && hasStackHistory)) {
        triggerHaptic('selection');
        if (routeHistoryStackRef.current.length > 1) {
          routeHistoryStackRef.current.pop();
        }
        navigate(-1);
        return;
      }

      // 5. Exit Confirmation at Root Route
      const now = Date.now();
      if (now - lastBackPressTimeRef.current < 2000) {
        triggerHaptic('heavy');
        CapApp.exitApp();
      } else {
        lastBackPressTimeRef.current = now;
        triggerHaptic('light');
        showToast({
          title: 'Press back again to exit SKY',
          type: 'info',
          duration: 2000
        });
      }
    });

    return () => {
      backListenerPromise.then((handle) => handle.remove()).catch(() => {});
    };
  }, [location.pathname, navigate, showToast]);

  return null;
};
