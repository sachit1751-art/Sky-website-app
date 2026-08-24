import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { RefreshCw, Smartphone } from 'lucide-react';
import { useBackendData } from '../context/DataContext';
import { useToast } from '../context/ToastContext';
import { listenToDeviceShake, triggerHaptic, isNative } from '../lib/capacitor';

export const ShakeRefreshHandler: React.FC = () => {
  const { refreshData, isRefreshing } = useBackendData();
  const { showToast } = useToast();
  const [isShakeActive, setIsShakeActive] = useState(false);
  const isRefreshingRef = useRef(isRefreshing);
  isRefreshingRef.current = isRefreshing;

  useEffect(() => {
    const unregister = listenToDeviceShake(async () => {
      if (isRefreshingRef.current) return;

      // 1. Tactile feedback for shake detection
      triggerHaptic('medium');

      // 2. Visual indicator in UI
      setIsShakeActive(true);
      showToast({
        title: 'Device Shake Detected',
        message: 'Synchronizing latest ROM repository in background...',
        type: 'info',
        duration: 3000
      });

      try {
        // 3. Force refresh data in background
        await refreshData(true);
        triggerHaptic('success');
        showToast({
          title: 'Repository Updated',
          message: 'ROM catalog and specifications are up to date.',
          type: 'success',
          duration: 3500
        });
      } catch (err) {
        triggerHaptic('error');
        showToast({
          title: 'Update Interrupted',
          message: 'Could not complete background repository refresh.',
          type: 'error',
          duration: 4000
        });
      } finally {
        setTimeout(() => {
          setIsShakeActive(false);
        }, 1200);
      }
    }, {
      threshold: 22, // Calibrated threshold for intentional shake gestures
      debounceMs: 2000 // 2s cooldown between consecutive shakes
    });

    return () => {
      unregister();
    };
  }, [refreshData, showToast]);

  return (
    <AnimatePresence>
      {isShakeActive && (
        <motion.div
          id="shake-refresh-banner"
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ type: 'spring', damping: 20, stiffness: 300 }}
          className="fixed top-20 left-1/2 -translate-x-1/2 z-[100] pointer-events-none"
        >
          <div className="flex items-center gap-3 px-4 py-2.5 rounded-full bg-[#1C1B17]/95 dark:bg-[#FAF3DD]/95 text-[#FAF3DD] dark:text-[#1C1B17] border border-[#EBE4CF]/20 dark:border-[#36342A]/20 shadow-2xl backdrop-blur-md">
            <div className="p-1 rounded-full bg-[#D4AF37]/20 text-[#D4AF37]">
              <Smartphone className="w-4 h-4 animate-bounce" />
            </div>
            <span className="text-xs font-bold tracking-wide uppercase">
              Gesture Refresh Active
            </span>
            <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#D4AF37]" />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
