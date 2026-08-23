import React, { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { App as CapApp } from '@capacitor/app';
import { isNative, triggerHaptic } from '../lib/capacitor';
import { useToast } from '../context/ToastContext';

export type BackButtonHandlerCallback = () => boolean | void | Promise<boolean | void>;

interface RegisteredBackHandler {
  id: string;
  callback: BackButtonHandlerCallback;
  priority: number;
}

// Global registry for custom back handlers (allows any modal/component to register)
const backHandlersRegistry: RegisteredBackHandler[] = [];

/**
 * Register a custom back button handler with a given priority (higher number = runs first).
 * If the callback returns `false`, execution will continue down the priority chain.
 */
export function registerBackButtonHandler(callback: BackButtonHandlerCallback, priority: number = 50): () => void {
  const id = `back_handler_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  const entry: RegisteredBackHandler = { id, callback, priority };
  
  backHandlersRegistry.push(entry);
  // Sort descending by priority
  backHandlersRegistry.sort((a, b) => b.priority - a.priority);

  return () => {
    const idx = backHandlersRegistry.findIndex((h) => h.id === id);
    if (idx !== -1) {
      backHandlersRegistry.splice(idx, 1);
    }
  };
}

/**
 * Custom React Hook for components to cleanly register back button interceptors
 */
export function useAndroidBackButton(
  callback: BackButtonHandlerCallback,
  priority: number = 50,
  enabled: boolean = true
) {
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  useEffect(() => {
    if (!enabled) return;

    const unregister = registerBackButtonHandler(() => {
      return callbackRef.current();
    }, priority);

    return () => {
      unregister();
    };
  }, [priority, enabled]);
}

/**
 * AndroidBackButtonHandler
 *
 * Dedicated controller that listens for native Android hardware back button presses
 * using the Capacitor App plugin (App.addListener('backButton')).
 *
 * Execution Hierarchy (Consistent with Google Material & Android Design Patterns):
 * 1. Registered Component Interceptors (e.g. active image zooms, custom drawer states).
 * 2. Mobile navigation drawer or sidebar overlay dismissal.
 * 3. Open modal dialogs / command palette / comparisons / feedback sheets.
 * 4. Active text input / search field blur (dismisses virtual keyboard without popping route).
 * 5. React Router navigation stack backwards step (`navigate(-1)`).
 * 6. Root route double-tap exit with haptic pulse & confirmation toast.
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
      // Bound the stack size to avoid unbounded memory growth
      if (stack.length > 50) {
        stack.shift();
      }
    }
  }, [location.pathname, location.search, location.hash]);

  useEffect(() => {
    if (!isNative) return;

    const backListenerPromise = CapApp.addListener('backButton', async ({ canGoBack }) => {
      // -----------------------------------------------------------------------
      // Tier 1: Execute registered hook handlers in priority order
      // -----------------------------------------------------------------------
      if (backHandlersRegistry.length > 0) {
        // Clone array to avoid mutation during iteration
        const handlers = [...backHandlersRegistry];
        for (const handler of handlers) {
          try {
            const result = await handler.callback();
            // If handler did not explicitly return false, consider event handled
            if (result !== false) {
              triggerHaptic('light');
              return;
            }
          } catch (err) {
            console.warn('[AndroidBackButtonHandler] Error in registered handler:', err);
          }
        }
      }

      // -----------------------------------------------------------------------
      // Tier 2: Check for mobile navigation drawer / overlay
      // -----------------------------------------------------------------------
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

      // -----------------------------------------------------------------------
      // Tier 3: Check for active modals, search palettes, dialogs & lightboxes
      // -----------------------------------------------------------------------
      const openModalCloseBtn = document.querySelector<HTMLButtonElement>(
        '[data-modal-close="true"], .modal-close-btn, button[aria-label="Close modal"], button[aria-label="Close"], button[aria-label="Close search"], button[aria-label="Close details modal"], button[aria-label="Close comparison"], button[aria-label="Close filters"], button[aria-label="Close lightbox"], [role="dialog"] button[aria-label*="close" i]'
      );

      if (openModalCloseBtn) {
        triggerHaptic('light');
        openModalCloseBtn.click();
        return;
      }

      // Check for any open dialog elements without an explicit close button
      const openDialog = document.querySelector('[role="dialog"], [aria-modal="true"], dialog[open]');
      if (openDialog) {
        triggerHaptic('light');
        window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', code: 'Escape', bubbles: true }));
        return;
      }

      // -----------------------------------------------------------------------
      // Tier 4: Blur focused input / search bar if user is currently typing
      // -----------------------------------------------------------------------
      const activeEl = document.activeElement;
      if (activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA' || activeEl.getAttribute('contenteditable') === 'true')) {
        (activeEl as HTMLElement).blur();
        triggerHaptic('light');
        return;
      }

      // -----------------------------------------------------------------------
      // Tier 5: History Navigation Stack
      // -----------------------------------------------------------------------
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

      // -----------------------------------------------------------------------
      // Tier 6: Double-Tap App Exit at Root Route
      // -----------------------------------------------------------------------
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

