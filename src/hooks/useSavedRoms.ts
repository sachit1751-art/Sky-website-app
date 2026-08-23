import { useState, useEffect } from 'react';
import { persistentStorage } from '../lib/capacitor';

const SAVED_ROMS_KEY = 'sky_saved_roms';

export function useSavedRoms() {
  const [savedIds, setSavedIds] = useState<string[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const saved = localStorage.getItem(SAVED_ROMS_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Re-hydrate from native persistentStorage on mount
  useEffect(() => {
    let isMounted = true;
    persistentStorage.getJSON<string[]>(SAVED_ROMS_KEY, []).then((stored) => {
      if (isMounted && Array.isArray(stored) && stored.length > 0) {
        setSavedIds(stored);
      }
    }).catch(() => {});

    return () => {
      isMounted = false;
    };
  }, []);

  const toggleSave = (id: string) => {
    setSavedIds((prev) => {
      const isSaved = prev.includes(id);
      const next = isSaved ? prev.filter((i) => i !== id) : [...prev, id];
      persistentStorage.setJSON(SAVED_ROMS_KEY, next).catch(() => {});
      return next;
    });
  };

  const isSaved = (id: string) => savedIds.includes(id);

  return { savedIds, toggleSave, isSaved };
}

