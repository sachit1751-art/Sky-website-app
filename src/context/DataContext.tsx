import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { RomItem, SpecCategory, TeamMember, CommunityChannel, FAQItem, CoreValue } from '../../shared/types';
import { apiFetch } from '../lib/api';
import { TEAM_MEMBERS, AOSP_ROMS, SPEC_CATEGORIES, CORE_VALUES, COMMUNITY_CHANNELS, COMMUNITY_FAQS } from '../data';
import { Network } from '@capacitor/network';
import { isNative } from '../lib/capacitor';

export interface AppConfig {
  appName: string;
  tagline: string;
  targetDevice: string;
  codename: string;
  chipset: string;
  gpu: string;
  githubOrg: string;
  telegramSupport: string;
  telegramChannel: string;
  version: string;
}

interface DataContextType {
  roms: RomItem[];
  specs: SpecCategory[];
  team: TeamMember[];
  faqs: FAQItem[];
  communityChannels: CommunityChannel[];
  coreValues: CoreValue[];
  config: AppConfig | null;
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
  refreshData: (force?: boolean) => Promise<void>;
  getRomByIdOrName: (idOrName: string) => RomItem | undefined;
}

const CACHE_KEY = 'sky_backend_data_cache_v1';
const CACHE_TTL_MS = 3 * 60 * 1000; // 3 minutes

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [roms, setRoms] = useState<RomItem[]>(AOSP_ROMS);
  const [specs, setSpecs] = useState<SpecCategory[]>(SPEC_CATEGORIES);
  const [team, setTeam] = useState<TeamMember[]>(TEAM_MEMBERS);
  const [faqs, setFaqs] = useState<FAQItem[]>(COMMUNITY_FAQS);
  const [communityChannels, setCommunityChannels] = useState<CommunityChannel[]>(COMMUNITY_CHANNELS);
  const [coreValues, setCoreValues] = useState<CoreValue[]>(CORE_VALUES);
  const [config, setConfig] = useState<AppConfig | null>({
    appName: 'SkyOS Hub',
    tagline: 'The Ultimate Custom ROM Portal for POCO M6 Pro 5G / Redmi 12 5G',
    targetDevice: 'POCO M6 Pro 5G / Redmi 12 5G',
    codename: 'sky / sky_in',
    chipset: 'Qualcomm Snapdragon 4 Gen 2',
    gpu: 'Adreno 613',
    githubOrg: 'skyroms',
    telegramSupport: 'https://t.me/Redmi125GSupport',
    telegramChannel: 'https://t.me/Redmi125gChannel',
    version: 'v3.5.0'
  });

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Load from local storage cache initially
  const loadFromCache = useCallback(() => {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed.data) {
          const { roms: cRoms, specs: cSpecs, team: cTeam, faqs: cFaqs, communityChannels: cChannels, coreValues: cValues, config: cConfig } = parsed.data;
          if (Array.isArray(cRoms) && cRoms.length > 0) setRoms(cRoms);
          if (Array.isArray(cSpecs) && cSpecs.length > 0) setSpecs(cSpecs);
          if (Array.isArray(cTeam) && cTeam.length > 0) setTeam(cTeam);
          if (Array.isArray(cFaqs) && cFaqs.length > 0) setFaqs(cFaqs);
          if (Array.isArray(cChannels) && cChannels.length > 0) setCommunityChannels(cChannels);
          if (Array.isArray(cValues) && cValues.length > 0) setCoreValues(cValues);
          if (cConfig) setConfig(cConfig);
          return parsed.timestamp || 0;
        }
      }
    } catch (err) {
      console.warn('[DataContext] Cache load error:', err);
    }
    return 0;
  }, []);

  const fetchData = useCallback(async (force = false) => {
    const cachedTime = loadFromCache();
    const isCacheFresh = Date.now() - cachedTime < CACHE_TTL_MS;

    if (!force && isCacheFresh && roms.length > 0) {
      setIsLoading(false);
      return;
    }

    if (roms.length > 0) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }

    setError(null);

    try {
      // 1. Try unified public dataset endpoint
      const response = await apiFetch('/api/public/data', { cache: 'no-cache' }, 8000);
      
      if (response.ok) {
        const payload = await response.json();
        if (payload.success) {
          const fetchedRoms: RomItem[] = payload.roms || [];
          const fetchedSpecs: SpecCategory[] = payload.specs || [];
          const fetchedTeam: TeamMember[] = payload.team || [];
          const fetchedFaqs: FAQItem[] = payload.faqs || [];
          const fetchedChannels: CommunityChannel[] = payload.communityChannels || [];
          const fetchedValues: CoreValue[] = payload.coreValues || [];
          const fetchedConfig: AppConfig = payload.config || null;

          setRoms(fetchedRoms);
          setSpecs(fetchedSpecs);
          setTeam(fetchedTeam);
          setFaqs(fetchedFaqs);
          setCommunityChannels(fetchedChannels);
          setCoreValues(fetchedValues);
          setConfig(fetchedConfig);

          // Save to cache
          try {
            localStorage.setItem(
              CACHE_KEY,
              JSON.stringify({
                timestamp: Date.now(),
                data: {
                  roms: fetchedRoms,
                  specs: fetchedSpecs,
                  team: fetchedTeam,
                  faqs: fetchedFaqs,
                  communityChannels: fetchedChannels,
                  coreValues: fetchedValues,
                  config: fetchedConfig
                }
              })
            );
          } catch (e) {}

          setIsLoading(false);
          setIsRefreshing(false);
          return;
        }
      }

      // 2. Fallback to individual endpoints if consolidated route fails
      const [romsRes, specsRes, teamRes, commRes] = await Promise.allSettled([
        apiFetch('/api/roms', {}, 6000).then(r => r.json()),
        apiFetch('/api/specs', {}, 6000).then(r => r.json()),
        apiFetch('/api/team', {}, 6000).then(r => r.json()),
        apiFetch('/api/community', {}, 6000).then(r => r.json())
      ]);

      if (romsRes.status === 'fulfilled' && romsRes.value?.roms) {
        setRoms(romsRes.value.roms);
      }
      if (specsRes.status === 'fulfilled' && specsRes.value?.categories) {
        setSpecs(specsRes.value.categories);
      }
      if (teamRes.status === 'fulfilled' && teamRes.value?.members) {
        setTeam(teamRes.value.members);
      }
      if (commRes.status === 'fulfilled') {
        if (commRes.value?.channels) setCommunityChannels(commRes.value.channels);
        if (commRes.value?.faqs) setFaqs(commRes.value.faqs);
        if (commRes.value?.values) setCoreValues(commRes.value.values);
      }
    } catch (err: any) {
      console.warn('[DataContext] Backend fetch warning:', err);
      setError(err?.message || 'Failed to sync with backend');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [loadFromCache, roms.length]);

  useEffect(() => {
    fetchData();

    // Listen for network reconnects on Android/Web
    let listenerHandle: any = null;
    if (isNative) {
      Network.addListener('networkStatusChange', (status) => {
        if (status.connected) {
          fetchData(true);
        }
      }).then(handle => {
        listenerHandle = handle;
      }).catch(() => {});
    }

    return () => {
      if (listenerHandle && listenerHandle.remove) {
        listenerHandle.remove();
      }
    };
  }, [fetchData]);

  const getRomByIdOrName = useCallback((idOrName: string): RomItem | undefined => {
    if (!idOrName) return undefined;
    const lower = idOrName.toLowerCase().trim();
    const slug = lower.replace(/\s+/g, '-');
    return roms.find(r => 
      (r.id && r.id.toLowerCase() === lower) ||
      (r.name && r.name.toLowerCase().trim() === lower) ||
      (r.name && r.name.toLowerCase().trim().replace(/\s+/g, '-') === slug)
    );
  }, [roms]);

  return (
    <DataContext.Provider
      value={{
        roms,
        specs,
        team,
        faqs,
        communityChannels,
        coreValues,
        config,
        isLoading,
        isRefreshing,
        error,
        refreshData: fetchData,
        getRomByIdOrName
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useBackendData = (): DataContextType => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useBackendData must be used within a DataProvider');
  }
  return context;
};
