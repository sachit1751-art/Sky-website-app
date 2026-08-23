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
 * Hide native splash screen once initial React view has mounted
 */
export async function hideSplashScreen() {
  if (!isNative) return;
  try {
    await SplashScreen.hide({ fadeOutDuration: 300 });
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
 * Persistent Storage Helper: uses Capacitor Preferences on native, localStorage on web
 */
export const persistentStorage = {
  async get(key: string): Promise<string | null> {
    if (isNative) {
      try {
        const { value } = await Preferences.get({ key });
        return value;
      } catch {
        // Fallback to localStorage
      }
    }
    if (typeof window !== 'undefined' && window.localStorage) {
      return localStorage.getItem(key);
    }
    return null;
  },

  async set(key: string, value: string): Promise<void> {
    if (isNative) {
      try {
        await Preferences.set({ key, value });
      } catch {}
    }
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(key, value);
    }
  },

  async remove(key: string): Promise<void> {
    if (isNative) {
      try {
        await Preferences.remove({ key });
      } catch {}
    }
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.removeItem(key);
    }
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
