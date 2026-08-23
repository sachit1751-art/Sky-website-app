import { Capacitor } from '@capacitor/core';
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';
import { StatusBar, Style } from '@capacitor/status-bar';
import { SplashScreen } from '@capacitor/splash-screen';
import { Share } from '@capacitor/share';
import { Network, ConnectionStatus } from '@capacitor/network';
import { Preferences } from '@capacitor/preferences';
import { SafeArea, SafeAreaInsets } from 'capacitor-plugin-safe-area';

export const isNative = Capacitor.isNativePlatform();
export const platform = Capacitor.getPlatform();

export interface DeviceSafeArea {
  top: number;
  bottom: number;
  left: number;
  right: number;
}

/**
 * Apply safe area insets to root DOM CSS custom properties
 */
export function applySafeAreaToDom(insets: DeviceSafeArea) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  root.style.setProperty('--safe-area-top', `${insets.top}px`);
  root.style.setProperty('--safe-area-bottom', `${insets.bottom}px`);
  root.style.setProperty('--safe-area-left', `${insets.left}px`);
  root.style.setProperty('--safe-area-right', `${insets.right}px`);
}

/**
 * Initialize system safe areas and notch/cutout insets
 */
export async function initializeSafeArea(): Promise<DeviceSafeArea> {
  const defaultInsets: DeviceSafeArea = { top: 0, bottom: 0, left: 0, right: 0 };
  if (!isNative) return defaultInsets;

  try {
    const data = await SafeArea.getSafeAreaInsets();
    if (data && data.insets) {
      applySafeAreaToDom(data.insets);
      return data.insets;
    }
  } catch (err) {
    console.warn('Could not fetch native safe area insets:', err);
  }
  return defaultInsets;
}

/**
 * Trigger subtle, high-quality native haptic feedback
 */
export async function triggerHaptic(type: 'light' | 'medium' | 'heavy' | 'selection' | 'success' | 'warning' | 'error' = 'light') {
  if (!isNative) return;
  try {
    switch (type) {
      case 'light':
        await Haptics.impact({ style: ImpactStyle.Light });
        break;
      case 'medium':
        await Haptics.impact({ style: ImpactStyle.Medium });
        break;
      case 'heavy':
        await Haptics.impact({ style: ImpactStyle.Heavy });
        break;
      case 'selection':
        await Haptics.selectionStart();
        await Haptics.selectionChanged();
        break;
      case 'success':
        await Haptics.notification({ type: NotificationType.Success });
        break;
      case 'warning':
        await Haptics.notification({ type: NotificationType.Warning });
        break;
      case 'error':
        await Haptics.notification({ type: NotificationType.Error });
        break;
    }
  } catch (err) {
    // Graceful fallback if haptics not supported on device
  }
}

/**
 * Configure Android status bar dynamically based on light/dark mode
 */
export async function configureStatusBar(isDark: boolean) {
  if (!isNative) return;
  try {
    await StatusBar.setStyle({
      style: isDark ? Style.Dark : Style.Light
    });
    
    if (platform === 'android') {
      await StatusBar.setOverlaysWebView({ overlay: true });
      await StatusBar.setBackgroundColor({
        color: isDark ? '#141416' : '#FFF8E1'
      });
    }
  } catch (err) {
    // Non-blocking on unsupported environments
  }
}

/**
 * Hide native splash screen once initial React view has mounted with smooth fade-out
 */
export async function hideSplashScreen(fadeOutDurationMs: number = 400) {
  if (!isNative) return;
  try {
    await SplashScreen.hide({ fadeOutDuration: fadeOutDurationMs });
  } catch (err) {
    // Non-blocking
  }
}

/**
 * Native Android Share Sheet with Web fallback
 */
export async function nativeShare(options: {
  title: string;
  text?: string;
  url?: string;
  dialogTitle?: string;
}): Promise<boolean> {
  if (isNative) {
    try {
      const canShare = await Share.canShare();
      if (canShare.value) {
        await Share.share({
          title: options.title,
          text: options.text,
          url: options.url,
          dialogTitle: options.dialogTitle || 'Share SKY ROM'
        });
        return true;
      }
    } catch (err) {
      console.warn('Native share failed or dismissed:', err);
    }
  }

  // Fallback to Web Share API or clipboard
  if (typeof navigator !== 'undefined' && navigator.share) {
    try {
      await navigator.share({
        title: options.title,
        text: options.text,
        url: options.url
      });
      return true;
    } catch (err) {
      // User cancelled or share failed
    }
  }

  // Clipboard fallback
  if (options.url && typeof navigator !== 'undefined' && navigator.clipboard) {
    try {
      await navigator.clipboard.writeText(options.url);
      return true;
    } catch (e) {}
  }

  return false;
}

/**
 * Persistent Storage Helper: uses Capacitor Preferences on native Android/iOS,
 * and localStorage with memory fallbacks on Web.
 * 
 * Provides unified, asynchronous, type-safe persistence across application restarts,
 * specifically handling theme preferences, authentication sessions, search caches, and guide states.
 */
export const persistentStorage = {
  /**
   * Retrieve a string value by key
   */
  async get(key: string): Promise<string | null> {
    if (isNative) {
      try {
        const { value } = await Preferences.get({ key });
        if (value !== null && value !== undefined) {
          return value;
        }
      } catch (err) {
        console.warn(`[persistentStorage] Native Preferences.get failed for key "${key}":`, err);
      }
    }
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        return localStorage.getItem(key);
      } catch (err) {
        console.warn(`[persistentStorage] localStorage.getItem failed for key "${key}":`, err);
      }
    }
    return null;
  },

  /**
   * Set a string value for a given key
   */
  async set(key: string, value: string): Promise<void> {
    if (isNative) {
      try {
        await Preferences.set({ key, value: String(value) });
      } catch (err) {
        console.warn(`[persistentStorage] Native Preferences.set failed for key "${key}":`, err);
      }
    }
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        localStorage.setItem(key, String(value));
      } catch (err) {
        console.warn(`[persistentStorage] localStorage.setItem failed for key "${key}":`, err);
      }
    }
  },

  /**
   * Remove a key from persistent storage
   */
  async remove(key: string): Promise<void> {
    if (isNative) {
      try {
        await Preferences.remove({ key });
      } catch (err) {
        console.warn(`[persistentStorage] Native Preferences.remove failed for key "${key}":`, err);
      }
    }
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        localStorage.removeItem(key);
      } catch (err) {
        console.warn(`[persistentStorage] localStorage.removeItem failed for key "${key}":`, err);
      }
    }
  },

  /**
   * Clear all stored keys
   */
  async clear(): Promise<void> {
    if (isNative) {
      try {
        await Preferences.clear();
      } catch (err) {
        console.warn('[persistentStorage] Native Preferences.clear failed:', err);
      }
    }
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        localStorage.clear();
      } catch (err) {
        console.warn('[persistentStorage] localStorage.clear failed:', err);
      }
    }
  },

  /**
   * Helper: Retrieve JSON object
   */
  async getJSON<T = any>(key: string, fallback: T): Promise<T> {
    try {
      const raw = await this.get(key);
      if (raw) {
        return JSON.parse(raw) as T;
      }
    } catch (err) {
      console.warn(`[persistentStorage] getJSON parse error for key "${key}":`, err);
    }
    return fallback;
  },

  /**
   * Helper: Save JSON object
   */
  async setJSON<T = any>(key: string, value: T): Promise<void> {
    try {
      await this.set(key, JSON.stringify(value));
    } catch (err) {
      console.warn(`[persistentStorage] setJSON stringify error for key "${key}":`, err);
    }
  },

  // ---------------------------------------------------------------------------
  // Dedicated Secure Domain Methods (Theme & Session Tokens)
  // ---------------------------------------------------------------------------

  /**
   * Get user theme preference ('light' | 'dark')
   */
  async getThemePreference(): Promise<'light' | 'dark' | null> {
    const val = await this.get('sky-theme');
    if (val === 'light' || val === 'dark') {
      return val;
    }
    return null;
  },

  /**
   * Save user theme preference
   */
  async setThemePreference(theme: 'light' | 'dark'): Promise<void> {
    await this.set('sky-theme', theme);
  },

  /**
   * Get securely persisted session authentication token
   */
  async getAuthToken(): Promise<string | null> {
    return await this.get('sky_auth_access_token');
  },

  /**
   * Save authentication session token
   */
  async setAuthToken(token: string): Promise<void> {
    if (!token) {
      await this.remove('sky_auth_access_token');
    } else {
      await this.set('sky_auth_access_token', token);
    }
  },

  /**
   * Remove authentication session token on sign out
   */
  async removeAuthToken(): Promise<void> {
    await this.remove('sky_auth_access_token');
  }
};

/**
 * Get real-time Network Status
 */
export async function getNetworkStatus(): Promise<ConnectionStatus> {
  if (isNative) {
    try {
      return await Network.getStatus();
    } catch {}
  }
  return {
    connected: typeof navigator !== 'undefined' ? navigator.onLine : true,
    connectionType: 'unknown'
  };
}

// Re-export hardware back button hook and registration utilities
export { registerBackButtonHandler, useAndroidBackButton } from '../components/AndroidBackButtonHandler';
export type { BackButtonHandlerCallback } from '../components/AndroidBackButtonHandler';

