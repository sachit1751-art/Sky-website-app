import { SpotlightCard } from '../components/SpotlightCard';
import { Sparkline } from '../components/Sparkline';
import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { useWindowVirtualizer } from '@tanstack/react-virtual';
import { useSearchParams, useParams, useNavigate } from 'react-router-dom';
import PullToRefresh from 'react-pull-to-refresh';
import { RomItem } from '../../shared/types';
import { useBackendData } from '../context/DataContext';
import { ScrollReveal } from '../components/ScrollReveal';
import { SEO } from '../components/SEO';
import { FlashingGuide } from '../components/FlashingGuide';
import { RomDetailsModal } from '../components/RomDetailsModal';
import { RomCompareModal } from '../components/RomCompareModal';
import { RomCard } from '../components/RomCard';
import { TextLoop } from '../components/TextLoop';
import { RomChatbot } from '../components/RomChatbot';
import { useToast } from '../context/ToastContext';
import { useScrollManager } from '../hooks/useScrollManager';
import { supabase } from '../lib/supabase';

import { 
  ArrowUpRight, 
  Cpu, 
  X, 
  Copy, 
  Check, 
  FileText, 
  Sparkles, 
  Layers,
  Filter,
  ChevronDown,
  ChevronUp,
  Calendar,
  Send,
  ArrowUp,
  Share2,
  Battery,
  Star,
  ExternalLink,
  Bot,
  Zap,
  Flame,
  MessageSquare
} from 'lucide-react';
import {
  AnimatedSearch,
  AnimatedDownload,
  AnimatedExternalLink,
  AnimatedSmartphone,
  AnimatedChevronDown
} from '../components/icons';
import { motion, AnimatePresence } from 'motion/react';
import Fuse from 'fuse.js';
import { staggerItemVariants } from '../components/PageTransition';

import { useSavedRoms } from '../hooks/useSavedRoms';
import { useAndroidBackButton } from '../components/AndroidBackButtonHandler';

type FilterCategory = 'all' | 'android-17' | 'android-16' | 'official' | 'unofficial' | 'saved';
type StabilityType = 'Stable' | 'Beta';

// In-memory cache for Firestore ROMs
let cachedFirebaseRoms: RomItem[] | null = null;
let lastRomsFetchTime = 0;
const CACHE_TTL_MS = 5 * 60 * 1000;

export const RomsPage: React.FC = () => {
  const { showDownloadToast, showToast } = useToast();
  const { savedIds, toggleSave, isSaved } = useSavedRoms();
  const { roms: backendRoms, isLoading: isBackendLoading, refreshData } = useBackendData();
  const [searchParams] = useSearchParams();
  const { id: routeId } = useParams();
  const navigate = useNavigate();
  
  const initialSearchParam = searchParams.get('search') || '';
  const [searchHistory, setSearchHistory] = useState<string[]>(() => {
    const saved = localStorage.getItem('aosp_roms_search_history');
    return saved ? JSON.parse(saved) : [];
  });
  const [roms, setRoms] = useState<RomItem[]>([]);

  useEffect(() => {
    if (backendRoms && backendRoms.length > 0) {
      setRoms(backendRoms);
    }
  }, [backendRoms]);

  const [searchQuery, setSearchQuery] = useState<string>(initialSearchParam);
  const [selectedFilter, setSelectedFilter] = useState<FilterCategory>('all');

  // New multi-select filters
  const [selectedAndroidVersions, setSelectedAndroidVersions] = useState<Set<string>>(new Set());
  const [selectedStabilities, setSelectedStabilities] = useState<Set<string>>(new Set());
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [sortBy, setSortBy] = useState<'newest' | 'name'>('newest');
  const [selectedRom, setSelectedRom] = useState<RomItem | null>(null);
  const [compareList, setCompareList] = useState<RomItem[]>([]);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState<boolean>(false);
  const [expandedRomId, setExpandedRomId] = useState<string | null>(null);
  const [isChatbotOpen, setIsChatbotOpen] = useState<boolean>(false);
  const [chatInitialPrompt, setChatInitialPrompt] = useState<string | undefined>(undefined);
  const [chatTargetRom, setChatTargetRom] = useState<RomItem | null>(null);

  // Android hardware back button handling for active overlays on RomsPage
  useAndroidBackButton(() => {
    if (isChatbotOpen) {
      setIsChatbotOpen(false);
      return true;
    }
    if (isSidebarOpen) {
      setIsSidebarOpen(false);
      return true;
    }
    if (isCompareModalOpen) {
      setIsCompareModalOpen(false);
      return true;
    }
    if (selectedRom) {
      setSelectedRom(null);
      return true;
    }
    return false;
  }, 70, isChatbotOpen || isSidebarOpen || isCompareModalOpen || selectedRom !== null);

  useEffect(() => {
    const param = searchParams.get('search');
    if (param !== null) {
      setSearchQuery(param);
    }
  }, [searchParams]);

  // Handle deep-linked ROM ID from route or query param
  useEffect(() => {
    const deepLinkId = routeId || searchParams.get('id');
    if (deepLinkId && roms.length > 0) {
      const rom = roms.find(r => (r.id === deepLinkId || r.name.toLowerCase() === deepLinkId.toLowerCase() || r.name.toLowerCase().replace(/\s+/g, '-') === deepLinkId.toLowerCase()));
      if (rom) {
        setSelectedRom(rom);
      }
    }
  }, [routeId, searchParams, roms]);

  const toggleCompare = useCallback((rom: RomItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setCompareList((prev) => {
      const exists = prev.some(r => r.name === rom.name);
      if (exists) {
        setTimeout(() => {
          showToast({ title: `Removed ${rom.name} from comparison`, type: 'info' });
        }, 0);
        return prev.filter(r => r.name !== rom.name);
      } else {
        if (prev.length >= 3) {
          setTimeout(() => {
            showToast({ title: 'Maximum 3 ROMs comparison limit reached', type: 'error' });
          }, 0);
          return prev;
        }
        setTimeout(() => {
          showToast({ title: `Added ${rom.name} to comparison`, type: 'success' });
        }, 0);
        return [...prev, rom];
      }
    });
  }, [showToast]);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const isFirebaseLoading = isBackendLoading;

  const fetchFirebaseRoms = async (forceRefresh = false) => {
    await refreshData(forceRefresh);
  };

  useEffect(() => {
    fetchFirebaseRoms();
  }, []);

  const saveToHistory = (query: string) => {
    if (!query.trim()) return;
    setSearchHistory((prev) => {
      const filtered = prev.filter(item => item !== query);
      const updated = [query, ...filtered].slice(0, 5);
      localStorage.setItem('aosp_roms_search_history', JSON.stringify(updated));
      return updated;
    });
  };

  useEffect(() => {
    if (backendRoms && backendRoms.length > 0) {
      localStorage.setItem('aosp_roms_timestamp', new Date().toISOString());
    }
  }, [backendRoms]);

  const lastUpdated = useMemo(() => {
    const savedTimestamp = localStorage.getItem('aosp_roms_timestamp');
    const latestRom = [...roms].sort((a, b) => new Date(b.createdAt || '0').getTime() - new Date(a.createdAt || '0').getTime())[0];
    return latestRom ? new Date(latestRom.createdAt || savedTimestamp || new Date()).toLocaleDateString() : 'N/A';
  }, [roms]);

  useScrollManager((scrollY) => {
    const isPastLimit = scrollY > 400;
    if (isPastLimit !== showBackToTop) {
      setShowBackToTop(isPastLimit);
    }
  });

  const toggleExpandRom = useCallback((id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedRomId((prev) => (prev === id ? null : id));
  }, []);

  const handleToggleSave = useCallback((id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    toggleSave(id);
  }, [toggleSave]);

  const handleSelectRom = useCallback((rom: RomItem) => {
    setSelectedRom(rom);
  }, []);

  const handleShowDownloadToast = useCallback((name: string, url: string) => {
    showDownloadToast(name, url);
  }, [showDownloadToast]);

  const handleAskAi = useCallback((rom?: RomItem, promptText?: string) => {
    if (rom) {
      setChatTargetRom(rom);
      setChatInitialPrompt(promptText || `Tell me about ${rom.name} (Android ${rom.androidVersion}) by ${rom.maintainer}. How is its battery endurance and daily driver stability?`);
    } else if (promptText) {
      setChatInitialPrompt(promptText);
      setChatTargetRom(null);
    } else {
      setChatInitialPrompt(undefined);
      setChatTargetRom(null);
    }
    setIsChatbotOpen(true);
  }, []);

  // Helper to determine mirror host name
  const getMirrorLabel = useCallback((url: string): string => {
    try {
      const parsed = new URL(url);
      if (parsed.hostname.includes('sourceforge')) return 'SourceForge';
      if (parsed.hostname.includes('t.me') || parsed.hostname.includes('telegram')) return 'Telegram';
      if (parsed.hostname.includes('luasup')) return 'CDN Mirror';
      if (parsed.hostname.includes('projectinfinity')) return 'Official Web';
      return 'Direct';
    } catch {
      return 'Direct';
    }
  }, []);

  // Copy Link Handler with feedback timer
  const handleCopyLink = useCallback((url: string, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    setTimeout(() => {
      setCopiedUrl((prev) => (prev === url ? null : prev));
    }, 2000);
  }, []);

  const handleShare = async (rom: RomItem, e: React.MouseEvent) => {
    e.stopPropagation();
    const shareUrl = `${window.location.origin}/roms/${rom.id || rom.name.toLowerCase().replace(/\s+/g, '-')}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${rom.name} for sky`,
          text: `Check out the latest ${rom.name} build for Redmi 12 5G / Poco M6 Pro 5G (sky).`,
          url: shareUrl,
        });
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          handleCopyLink(shareUrl);
        }
      }
    } else {
      handleCopyLink(shareUrl);
      showToast({
        title: "Link Copied",
        message: "ROM direct link copied to clipboard.",
        type: "success"
      });
    }
  };

  const availableAndroidVersions = useMemo(() => {
    const versions = new Set<string>();
    roms.forEach(r => {
      const v = r.androidVersion.replace('Android ', 'A');
      versions.add(v);
    });
    return Array.from(versions).sort((a, b) => b.localeCompare(a));
  }, [roms]);

  const toggleAndroidVersion = (version: string) => {
    setSelectedAndroidVersions(prev => {
      const next = new Set(prev);
      if (next.has(version)) next.delete(version);
      else next.add(version);
      return next;
    });
  };

  const toggleStability = (stability: string) => {
    setSelectedStabilities(prev => {
      const next = new Set(prev);
      if (next.has(stability)) next.delete(stability);
      else next.add(stability);
      return next;
    });
  };

  const isStabilityMatch = (rom: RomItem, stabilities: Set<string>) => {
    if (stabilities.size === 0) return true;
    const searchString = `${rom.name} ${rom.description || ''}`.toLowerCase();
    const isBeta = searchString.includes('beta');
    const romStability = isBeta ? 'Beta' : 'Stable';
    return stabilities.has(romStability);
  };

  const isAndroidVersionMatch = (rom: RomItem, versions: Set<string>) => {
    if (versions.size === 0) return true;
    const romV = (rom.androidVersion || '').replace(/Android\s*/i, 'A').trim().toUpperCase();
    return Array.from(versions).some(v => {
      const cleanV = v.replace(/Android\s*/i, 'A').trim().toUpperCase();
      return romV.includes(cleanV) || (rom.androidVersion || '').toUpperCase().includes(v.toUpperCase());
    });
  };

  // Filter and Sort calculations
  const sortedAndFilteredRoms = useMemo(() => {
    let baseRoms = roms;

    // Filter by category first (legacy top pills)
    if (selectedFilter !== 'all') {
      baseRoms = baseRoms.filter((rom) => {
        if (selectedFilter === 'saved') return isSaved(rom.id || rom.name);
        if (selectedFilter === 'android-17') return (rom.androidVersion || '').toLowerCase().includes('17');
        if (selectedFilter === 'android-16') return (rom.androidVersion || '').toLowerCase().includes('16');
        if (selectedFilter === 'official') {
          const st = (rom.status || '').toLowerCase();
          return st === 'official' || st === 'published' || st === 'approved';
        }
        if (selectedFilter === 'unofficial') {
          const st = (rom.status || '').toLowerCase();
          return st === 'unofficial' || st === 'draft' || st === 'pending' || st === 'beta';
        }
        return true;
      });
    }

    // Apply new sidebar filters
    baseRoms = baseRoms.filter(rom => 
      isAndroidVersionMatch(rom, selectedAndroidVersions) && 
      isStabilityMatch(rom, selectedStabilities)
    );

    let result = baseRoms;

    // Use Fuse.js for robust fuzzy search
    if (searchQuery.trim()) {
      const fuse = new Fuse(baseRoms, {
        keys: [
          { name: 'name', weight: 1 },
          { name: 'maintainer', weight: 0.7 },
          { name: 'androidVersion', weight: 0.5 },
          { name: 'description', weight: 0.4 },
          { name: 'changelog', weight: 0.3 }
        ],
        threshold: 0.3,
        distance: 100,
        ignoreLocation: true
      });
      result = fuse.search(searchQuery).map(r => r.item);
    }

    if (sortBy === 'newest') {
      result = [...result].sort((a, b) => new Date(b.createdAt || '0').getTime() - new Date(a.createdAt || '0').getTime());
    } else if (sortBy === 'name') {
      result = [...result].sort((a, b) => a.name.localeCompare(b.name));
    }
    
    return result;
  }, [searchQuery, selectedFilter, sortBy, roms, savedIds, selectedAndroidVersions, selectedStabilities]);

  const listParentRef = useRef<HTMLDivElement>(null);

  const rowVirtualizer = useWindowVirtualizer({
    count: sortedAndFilteredRoms.length,
    estimateSize: () => 180,
    scrollMargin: listParentRef.current?.offsetTop ?? 0,
    overscan: 5,
  });

  // Re-measure virtualized rows when dynamic list heights or filter states change to avoid overlaps
  useEffect(() => {
    rowVirtualizer.measure();
  }, [expandedRomId, sortedAndFilteredRoms, rowVirtualizer]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Escape to close
      if (e.key === 'Escape') {
        if (selectedRom) {
          setSelectedRom(null);
        } else if (expandedRomId) {
          setExpandedRomId(null);
        }
      }

      // Arrow Navigation
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault(); // Prevent page scroll

        const currentIndex = sortedAndFilteredRoms.findIndex(
          (r) => (r.id || r.name) === expandedRomId
        );

        let nextIndex;
        if (e.key === 'ArrowDown') {
          nextIndex = currentIndex === -1 ? 0 : Math.min(currentIndex + 1, sortedAndFilteredRoms.length - 1);
        } else {
          nextIndex = currentIndex === -1 ? sortedAndFilteredRoms.length - 1 : Math.max(currentIndex - 1, 0);
        }

        const nextRom = sortedAndFilteredRoms[nextIndex];
        if (nextRom) {
          setExpandedRomId(nextRom.id || nextRom.name);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedRom, expandedRomId, sortedAndFilteredRoms]);

  // Counts for filter pills
  const counts = useMemo(() => {
    return {
      all: roms.length,
      a17: roms.filter((r) => (r.androidVersion || '').toLowerCase().includes('17')).length,
      a16: roms.filter((r) => (r.androidVersion || '').toLowerCase().includes('16')).length,
      official: roms.filter((r) => {
        const st = (r.status || '').toLowerCase();
        return st === 'official' || st === 'published' || st === 'approved';
      }).length,
      unofficial: roms.filter((r) => {
        const st = (r.status || '').toLowerCase();
        return st === 'unofficial' || st === 'draft' || st === 'pending' || st === 'beta';
      }).length,
      saved: roms.filter((r) => isSaved(r.id || r.name)).length
    };
  }, [roms, savedIds]);

  // Dynamic SEO metadata calculation for maximum search indexing and relevancy
  const seoMeta = useMemo(() => {
    if (selectedRom) {
      const verString = selectedRom.version ? `v${selectedRom.version}` : '';
      const androidStr = selectedRom.androidVersion ? `Android ${selectedRom.androidVersion}` : 'Android';
      const statusStr = selectedRom.status ? `${selectedRom.status.toUpperCase()}` : 'Official';
      const title = `${selectedRom.name} ${verString} (${androidStr}) for POCO M6 Pro 5G / Redmi 12 5G`;
      const description = `Download ${selectedRom.name} ${verString} for POCO M6 Pro 5G & Redmi 12 5G (sky / sm4450) by ${selectedRom.maintainer}. ${androidStr}, ${statusStr} release. ${selectedRom.description ? selectedRom.description.slice(0, 140) : 'Includes latest security patches, kernel source, and installation guide.'}`;
      const canonicalUrl = `/roms/${selectedRom.id || selectedRom.name.toLowerCase().replace(/\s+/g, '-')}`;
      const keywords = [
        selectedRom.name,
        selectedRom.maintainer,
        'POCO M6 Pro 5G',
        'Redmi 12 5G',
        'sky',
        'sm4450',
        androidStr,
        'Custom ROM',
        'Fastboot',
        'Recovery',
        'Download'
      ];
      return {
        title,
        description,
        canonicalUrl,
        ogImage: selectedRom.logoUrl || '/screenshot3.jpg',
        ogImageAlt: `${selectedRom.name} Custom ROM for SKY`,
        keywords,
        ogType: 'article' as const
      };
    }

    if (searchQuery.trim()) {
      return {
        title: `Search "${searchQuery.trim()}" - ROMs & Firmware for POCO M6 Pro 5G / Redmi 12 5G`,
        description: `Explore search results for "${searchQuery.trim()}" custom ROMs, recoveries, and kernels for Xiaomi Redmi 12 5G & POCO M6 Pro 5G (sky). ${sortedAndFilteredRoms.length} builds available.`,
        canonicalUrl: `/roms?search=${encodeURIComponent(searchQuery.trim())}`,
        ogImage: '/screenshot3.jpg',
        ogImageAlt: `Search results for ${searchQuery}`,
        keywords: [searchQuery.trim(), 'POCO M6 Pro 5G ROMs', 'Redmi 12 5G AOSP', 'sky custom ROMs'],
        ogType: 'website' as const
      };
    }

    if (selectedFilter !== 'all') {
      const filterNames: Record<string, string> = {
        official: 'Official AOSP ROMs',
        unofficial: 'Community & Unofficial ROMs',
        port: 'Ported Firmware Builds',
        kernel: 'Custom Kernels & Performance Modules',
        recovery: 'Custom Recoveries (TWRP & OrangeFox)',
        saved: 'Your Saved Bookmarks'
      };
      const label = filterNames[selectedFilter] || `${selectedFilter} Builds`;
      return {
        title: `${label} - POCO M6 Pro 5G & Redmi 12 5G (sky)`,
        description: `Browse ${sortedAndFilteredRoms.length} tested ${label.toLowerCase()} for Xiaomi Redmi 12 5G and POCO M6 Pro 5G (sky / sm4450). High-speed download mirrors, full changelogs, and step-by-step guides.`,
        canonicalUrl: `/roms?filter=${selectedFilter}`,
        ogImage: '/screenshot3.jpg',
        ogImageAlt: `${label} for SKY`,
        keywords: [label, 'sky ROMs', 'POCO M6 Pro 5G', 'Redmi 12 5G', 'sm4450', 'Firmware'],
        ogType: 'website' as const
      };
    }

    if (selectedAndroidVersions.size > 0) {
      const versions = Array.from(selectedAndroidVersions).join(', ');
      return {
        title: `Android ${versions} Custom ROMs - POCO M6 Pro 5G / Redmi 12 5G`,
        description: `Download verified Android ${versions} custom ROMs for POCO M6 Pro 5G & Xiaomi Redmi 12 5G (sky). ${sortedAndFilteredRoms.length} builds with latest Android features and security updates.`,
        canonicalUrl: '/roms',
        ogImage: '/screenshot3.jpg',
        ogImageAlt: `Android ${versions} ROMs for SKY`,
        keywords: [`Android ${versions}`, 'AOSP', 'Custom ROMs', 'POCO M6 Pro 5G', 'Redmi 12 5G', 'sky'],
        ogType: 'website' as const
      };
    }

    return {
      title: `AOSP ROMs & Firmware Catalog (${roms.length} Builds) - POCO M6 Pro 5G / Redmi 12 5G`,
      description: `Browse ${roms.length} official and community custom ROMs, recoveries, and kernels for POCO M6 Pro 5G / Redmi 12 5G (sky / sm4450). Tested Android 14, 15, 16 & 17 releases with direct download links.`,
      canonicalUrl: '/roms',
      ogImage: '/screenshot3.jpg',
      ogImageAlt: 'SKY AOSP Custom ROMs & Firmware',
      keywords: ['AOSP ROMs', 'POCO M6 Pro 5G', 'Redmi 12 5G', 'sky', 'Android 16', 'Android 17', 'PixelOS', 'EvolutionX', 'crDroid', 'LineageOS', 'TWRP'],
      ogType: 'website' as const
    };
  }, [selectedRom, searchQuery, selectedFilter, selectedAndroidVersions, sortedAndFilteredRoms.length, roms.length]);

  const romJsonLd = selectedRom
    ? {
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        name: `${selectedRom.name} for SKY`,
        operatingSystem: `Android ${selectedRom.androidVersion}`,
        applicationCategory: 'OperatingSystem',
        softwareVersion: selectedRom.version,
        description: selectedRom.description || `${selectedRom.name} custom ROM build for Xiaomi Redmi 12 5G / POCO M6 Pro 5G (sky)`,
        downloadUrl: selectedRom.url,
        author: {
          '@type': 'Person',
          name: selectedRom.maintainer,
        },
      }
    : undefined;

  return (
    <div className="py-6 sm:py-10 md:py-20 px-4 sm:px-6 md:px-12 max-w-7xl mx-auto space-y-6 md:space-y-10 pb-28 w-full overflow-hidden">
      <SEO
        title={seoMeta.title}
        description={seoMeta.description}
        canonicalUrl={seoMeta.canonicalUrl}
        ogImage={seoMeta.ogImage}
        ogImageAlt={seoMeta.ogImageAlt}
        ogType={seoMeta.ogType}
        keywords={seoMeta.keywords}
        jsonLd={romJsonLd}
      />

      {/* Mobile Filter Drawer */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSidebarOpen(false)}
              className="fixed inset-0 bg-gradient-to-b from-black/80 to-black/60 z-[100] lg:hidden"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 w-[80%] max-w-[320px] bg-[#FAF8F1] dark:bg-[#0F0E0C] z-[101] p-8 lg:hidden shadow-2xl border-l border-[#EBE4CF] dark:border-[#1F1E18] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-10">
                <h2 className="text-xl font-black text-[#49473E] dark:text-[#F4EFE6] tracking-tighter uppercase">Filters</h2>
                <button 
                  onClick={() => setIsSidebarOpen(false)} 
                  data-modal-close="true"
                  aria-label="Close filters"
                  className="p-2 rounded-full bg-[#EBE4CF] dark:bg-[#1F1E18] text-[#787567] dark:text-[#BDB8A4] hover:text-[#121212] dark:hover:text-[#F4EFE6] transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-8">
                <div>
                  <h3 className="text-[10px] font-black text-[#787567] dark:text-[#BDB8A4] uppercase tracking-widest mb-4">Android Version</h3>
                  <div className="grid grid-cols-1 gap-2">
                    {availableAndroidVersions.map(version => (
                      <button
                        key={version}
                        onClick={() => toggleAndroidVersion(version)}
                        className={`flex items-center justify-between px-4 py-3 rounded-xl text-xs font-bold transition-all border ${
                          selectedAndroidVersions.has(version)
                            ? 'bg-[#49473E] text-[#FAF3DD] border-transparent dark:bg-[#FDE694] dark:text-[#121212]'
                            : 'bg-[#FAF3DD]/40 dark:bg-[#1F1E18]/40 text-[#787567] dark:text-[#BDB8A4] border-[#EBE4CF] dark:border-[#36342A]'
                        }`}
                      >
                        <span>{version.replace('A', 'Android ')}</span>
                        {selectedAndroidVersions.has(version) && <Check className="w-3 h-3" />}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-[10px] font-black text-[#787567] dark:text-[#BDB8A4] uppercase tracking-widest mb-4">ROM Stability</h3>
                  <div className="grid grid-cols-1 gap-2">
                    {['Stable', 'Beta'].map(type => (
                      <button
                        key={type}
                        onClick={() => toggleStability(type)}
                        className={`flex items-center justify-between px-4 py-3 rounded-xl text-xs font-bold transition-all border ${
                          selectedStabilities.has(type)
                            ? 'bg-[#49473E] text-[#FAF3DD] border-transparent dark:bg-[#FDE694] dark:text-[#121212]'
                            : 'bg-[#FAF3DD]/40 dark:bg-[#1F1E18]/40 text-[#787567] dark:text-[#BDB8A4] border-[#EBE4CF] dark:border-[#36342A]'
                        }`}
                      >
                        <span>{type}</span>
                        {selectedStabilities.has(type) && <Check className="w-3 h-3" />}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => {
                    setSelectedAndroidVersions(new Set());
                    setSelectedStabilities(new Set());
                    setIsSidebarOpen(false);
                  }}
                  className="w-full py-4 bg-[#FDE694] text-[#121212] font-black text-xs uppercase tracking-widest rounded-2xl shadow-lg cursor-pointer"
                >
                  Apply & Reset
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Page Header */}
      <div className="space-y-3 w-full">
        <h1 className="text-3xl xs:text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tighter uppercase text-[#121212] dark:text-[#F4EFE6]">
          <span className="shimmer-accent">AOSP ROMS</span>
        </h1>
        <div className="text-xs text-[#787567] dark:text-[#BDB8A4]">
          Last updated: {lastUpdated}
        </div>
        <p className="text-base sm:text-lg text-[#787567] dark:text-[#BDB8A4] max-w-3xl">
          Curated custom{' '}
          <TextLoop
            words={['Android 16 & 17 builds,', 'security patches,', 'daily driver ROMs,', 'AOSP distributions,']}
            className="text-[#49473E] dark:text-[#F4EFE6] font-semibold"
          />{' '}
          maintained for the <code className="px-1.5 py-0.5 rounded bg-[#FAF3DD] dark:bg-[#1F1E18] text-[#49473E] dark:text-[#F4EFE6] font-mono text-xs font-bold">sky</code> ecosystem.
        </p>
      </div>

      {/* Gemini AI ROM Assistant Interactive Banner */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-4 sm:p-5 rounded-3xl bg-gradient-to-br from-[#FAF3DD] via-[#FAF0CF]/60 to-[#FDE694]/20 dark:from-[#1A1914] dark:via-[#161511] dark:to-[#221F14] border border-[#EBE4CF] dark:border-[#36342A] shadow-xs relative overflow-hidden"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3.5 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-[#FDE694] dark:bg-[#FDE694] flex items-center justify-center text-[#121212] shadow-xs shrink-0">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-black text-[#121212] dark:text-[#F4EFE6] tracking-tight">
                  Need Help Choosing a ROM? Ask SKY AI
                </h3>
                <span className="px-2 py-0.5 text-[9px] font-mono font-bold uppercase rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20 shrink-0">
                  Gemini Multi-turn
                </span>
              </div>
              <p className="text-xs text-[#787567] dark:text-[#BDB8A4] mt-0.5 line-clamp-1 sm:line-clamp-none">
                Compare battery efficiency, get step-by-step flashing guides, or troubleshoot boot errors with tailored AI models.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => handleAskAi()}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-[#FDE694] text-[#121212] font-black text-xs uppercase tracking-wider hover:bg-amber-300 active:scale-95 transition-all shadow-xs cursor-pointer"
            >
              <Bot className="w-4 h-4" />
              <span>Launch AI Chat</span>
            </button>
          </div>
        </div>

        {/* Quick Question Chips */}
        <div className="mt-3 pt-3 border-t border-[#EBE4CF]/70 dark:border-[#36342A]/70 flex items-center gap-2 overflow-x-auto no-scrollbar">
          <span className="text-[10px] font-bold text-[#787567] dark:text-[#BDB8A4] uppercase shrink-0 flex items-center gap-1">
            <Zap className="w-3 h-3 text-amber-500" /> Quick Ask:
          </span>
          {[
            "Which ROM has the best battery life?",
            "Compare PixelOS vs crDroid",
            "How to flash Android 17 on sky?",
            "Fix bootloop after flashing"
          ].map((promptText, i) => (
            <button
              key={i}
              onClick={() => handleAskAi(undefined, promptText)}
              className="px-2.5 py-1 rounded-full text-xs font-medium bg-white/80 dark:bg-[#1F1E18] text-[#49473E] dark:text-[#F4EFE6] border border-[#EBE4CF] dark:border-[#36342A] hover:border-amber-400 hover:text-amber-600 dark:hover:text-amber-300 transition-all whitespace-nowrap shrink-0 cursor-pointer text-left"
            >
              {promptText}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Search & Filter Controls */}
      <div className="space-y-4 pt-2 w-full">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4 w-full">
          {/* Live Search Input */}
          <div className="relative flex-1 min-w-0">
            <AnimatedSearch size={16} className="text-[#787567] dark:text-[#BDB8A4] absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  saveToHistory(searchQuery);
                }
              }}
              placeholder="Search ROMs by name, maintainer, or features..."
              className="w-full pl-11 pr-10 py-3 rounded-2xl bg-[#FAF3DD]/60 dark:bg-[#1F1E18]/60 border border-[#EBE4CF] dark:border-[#36342A] text-sm text-[#49473E] dark:text-[#F4EFE6] placeholder-[#787567]/70 dark:placeholder-[#BDB8A4]/70 focus:outline-none focus:ring-2 focus:ring-[#FDE694] focus:border-transparent transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-[#787567] hover:text-[#49473E] dark:text-[#BDB8A4] dark:hover:text-[#F4EFE6] cursor-pointer"
                title="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          {searchHistory.length > 0 && (
            <div className="flex flex-wrap gap-2 text-xs px-1">
              <span className="text-[#787567] dark:text-[#BDB8A4]">Recent:</span>
              {searchHistory.map((query) => (
                <button
                  key={query}
                  onClick={() => setSearchQuery(query)}
                  className="text-[#49473E] dark:text-[#F4EFE6] underline decoration-dotted hover:text-[#FDE694] transition-colors cursor-pointer"
                >
                  {query}
                </button>
              ))}
            </div>
          )}
          {/* Sorting and Refresh Controls */}
          <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'newest' | 'name')}
              className="px-4 py-3 rounded-2xl bg-[#FAF3DD]/60 dark:bg-[#1F1E18]/60 border border-[#EBE4CF] dark:border-[#36342A] text-sm text-[#49473E] dark:text-[#F4EFE6] focus:outline-none focus:ring-2 focus:ring-[#FDE694] cursor-pointer"
            >
              <option value="newest">Newest First</option>
              <option value="name">Name (A-Z)</option>
            </select>
            
            <button
              onClick={() => window.location.reload()}
              className="p-3 rounded-2xl bg-[#FAF3DD]/60 dark:bg-[#1F1E18]/60 border border-[#EBE4CF] dark:border-[#36342A] text-[#787567] dark:text-[#BDB8A4] hover:text-[#49473E] dark:hover:text-[#F4EFE6] transition-all cursor-pointer"
              title="Refresh builds"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>
        </div>

        {/* Filter Pills Deck - Responsive auto-fitting grid that spans 100% of any screen width */}
        <div className="w-full grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-6 gap-2 sm:gap-2.5">
          <button
            onClick={() => setSelectedFilter('all')}
            className={`flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-2xl sm:rounded-full text-xs font-bold transition-all cursor-pointer w-full border ${
              selectedFilter === 'all'
                ? 'bg-[#49473E] text-[#FAF3DD] dark:bg-[#FDE694] dark:text-[#121212] border-transparent shadow-xs scale-[1.02]'
                : 'bg-[#FAF3DD]/70 dark:bg-[#1F1E18]/70 text-[#787567] dark:text-[#BDB8A4] border-[#EBE4CF] dark:border-[#36342A] hover:bg-[#FAF0CF] dark:hover:bg-[#2B2921]'
            }`}
          >
            <span className="truncate">All Builds</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/10 dark:bg-black/15 font-semibold shrink-0">
              {counts.all}
            </span>
          </button>

          <button
            onClick={() => setSelectedFilter('saved')}
            className={`flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-2xl sm:rounded-full text-xs font-bold transition-all cursor-pointer w-full border ${
              selectedFilter === 'saved'
                ? 'bg-[#49473E] text-[#FAF3DD] dark:bg-[#FDE694] dark:text-[#121212] border-transparent shadow-xs scale-[1.02]'
                : 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20 hover:bg-amber-500/20'
            }`}
          >
            <Star className={`w-3.5 h-3.5 shrink-0 ${selectedFilter === 'saved' ? 'fill-current' : ''}`} />
            <span className="truncate">Saved</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/10 dark:bg-black/15 font-semibold shrink-0">
              {counts.saved}
            </span>
          </button>

          <button
            onClick={() => setSelectedFilter('android-17')}
            className={`flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-2xl sm:rounded-full text-xs font-bold transition-all cursor-pointer w-full border ${
              selectedFilter === 'android-17'
                ? 'bg-[#49473E] text-[#FAF3DD] dark:bg-[#FDE694] dark:text-[#121212] border-transparent shadow-xs scale-[1.02]'
                : 'bg-[#FAF3DD]/70 dark:bg-[#1F1E18]/70 text-[#787567] dark:text-[#BDB8A4] border-[#EBE4CF] dark:border-[#36342A] hover:bg-[#FAF0CF] dark:hover:bg-[#2B2921]'
            }`}
          >
            <span className="truncate">Android 17</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/10 dark:bg-black/15 font-semibold shrink-0">
              {counts.a17}
            </span>
          </button>

          <button
            onClick={() => setSelectedFilter('android-16')}
            className={`flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-2xl sm:rounded-full text-xs font-bold transition-all cursor-pointer w-full border ${
              selectedFilter === 'android-16'
                ? 'bg-[#49473E] text-[#FAF3DD] dark:bg-[#FDE694] dark:text-[#121212] border-transparent shadow-xs scale-[1.02]'
                : 'bg-[#FAF3DD]/70 dark:bg-[#1F1E18]/70 text-[#787567] dark:text-[#BDB8A4] border-[#EBE4CF] dark:border-[#36342A] hover:bg-[#FAF0CF] dark:hover:bg-[#2B2921]'
            }`}
          >
            <span className="truncate">Android 16</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/10 dark:bg-black/15 font-semibold shrink-0">
              {counts.a16}
            </span>
          </button>

          <button
            onClick={() => setSelectedFilter('official')}
            className={`flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-2xl sm:rounded-full text-xs font-bold transition-all cursor-pointer w-full border ${
              selectedFilter === 'official'
                ? 'bg-[#49473E] text-[#FAF3DD] dark:bg-[#FDE694] dark:text-[#121212] border-transparent shadow-xs scale-[1.02]'
                : 'bg-[#FAF3DD]/70 dark:bg-[#1F1E18]/70 text-[#787567] dark:text-[#BDB8A4] border-[#EBE4CF] dark:border-[#36342A] hover:bg-[#FAF0CF] dark:hover:bg-[#2B2921]'
            }`}
          >
            <span className="truncate">Official</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/10 dark:bg-black/15 font-semibold shrink-0">
              {counts.official}
            </span>
          </button>

          <button
            onClick={() => setSelectedFilter('unofficial')}
            className={`flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-2xl sm:rounded-full text-xs font-bold transition-all cursor-pointer w-full border ${
              selectedFilter === 'unofficial'
                ? 'bg-[#49473E] text-[#FAF3DD] dark:bg-[#FDE694] dark:text-[#121212] border-transparent shadow-xs scale-[1.02]'
                : 'bg-[#FAF3DD]/70 dark:bg-[#1F1E18]/70 text-[#787567] dark:text-[#BDB8A4] border-[#EBE4CF] dark:border-[#36342A] hover:bg-[#FAF0CF] dark:hover:bg-[#2B2921]'
            }`}
          >
            <span className="truncate">Community</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/10 dark:bg-black/15 font-semibold shrink-0">
              {counts.unofficial}
            </span>
          </button>
        </div>
      </div>

      {/* Main Layout with Sidebar */}
      <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-start w-full">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:block w-60 xl:w-64 sticky top-28 space-y-6 shrink-0">
          <div className="space-y-6">
            <div>
              <h3 className="text-[10px] font-black text-[#787567] dark:text-[#BDB8A4] uppercase tracking-widest mb-4">Android Version</h3>
              <div className="space-y-2">
                {availableAndroidVersions.map(version => (
                  <button
                    key={version}
                    onClick={() => toggleAndroidVersion(version)}
                    className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-xs font-bold transition-all border ${
                      selectedAndroidVersions.has(version)
                        ? 'bg-[#49473E] text-[#FAF3DD] border-transparent dark:bg-[#FDE694] dark:text-[#121212]'
                        : 'bg-[#FAF3DD]/40 dark:bg-[#1F1E18]/40 text-[#787567] dark:text-[#BDB8A4] border-[#EBE4CF] dark:border-[#36342A] hover:bg-[#FAF0CF] dark:hover:bg-[#2B2921]'
                    }`}
                  >
                    <span>{version.replace('A', 'Android ')}</span>
                    {selectedAndroidVersions.has(version) && <Check className="w-3 h-3" />}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-[10px] font-black text-[#787567] dark:text-[#BDB8A4] uppercase tracking-widest mb-4">ROM Stability</h3>
              <div className="space-y-2">
                {['Stable', 'Beta'].map(type => (
                  <button
                    key={type}
                    onClick={() => toggleStability(type)}
                    className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-xs font-bold transition-all border ${
                      selectedStabilities.has(type)
                        ? 'bg-[#49473E] text-[#FAF3DD] border-transparent dark:bg-[#FDE694] dark:text-[#121212]'
                        : 'bg-[#FAF3DD]/40 dark:bg-[#1F1E18]/40 text-[#787567] dark:text-[#BDB8A4] border-[#EBE4CF] dark:border-[#36342A] hover:bg-[#FAF0CF] dark:hover:bg-[#2B2921]'
                    }`}
                  >
                    <span>{type}</span>
                    {selectedStabilities.has(type) && <Check className="w-3 h-3" />}
                  </button>
                ))}
              </div>
            </div>

            {(selectedAndroidVersions.size > 0 || selectedStabilities.size > 0) && (
              <button
                onClick={() => {
                  setSelectedAndroidVersions(new Set());
                  setSelectedStabilities(new Set());
                }}
                className="w-full py-2.5 text-[10px] font-black text-red-500 uppercase tracking-widest hover:underline cursor-pointer"
              >
                Clear Sidebar Filters
              </button>
            )}
          </div>

          <div className="p-5 rounded-2xl bg-[#FDE694]/10 border border-[#FDE694]/20 space-y-2">
            <h4 className="text-[10px] font-black text-[#49473E] dark:text-[#FDE694] uppercase tracking-widest">Sky Audit</h4>
            <p className="text-[10px] text-[#787567] dark:text-[#BDB8A4] leading-relaxed">
              All builds are verified by the SKY maintainer group before appearing in this list.
            </p>
          </div>
        </aside>

        <div className="flex-1 w-full min-w-0 space-y-6 md:space-y-8">
          {/* Results Header */}
          <div className="flex items-center justify-between text-xs text-[#787567] dark:text-[#BDB8A4] px-1">
            <span>
              Showing <strong className="text-[#49473E] dark:text-[#F4EFE6] font-semibold">{sortedAndFilteredRoms.length}</strong> {sortedAndFilteredRoms.length === 1 ? 'build' : 'builds'}
            </span>
            {(searchQuery || selectedFilter !== 'all' || selectedAndroidVersions.size > 0 || selectedStabilities.size > 0) && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedFilter('all');
                  setSortBy('newest');
                  setSelectedAndroidVersions(new Set());
                  setSelectedStabilities(new Set());
                }}
                className="font-semibold text-[#49473E] dark:text-[#FDE694] hover:underline cursor-pointer"
              >
                Reset All Filters
              </button>
            )}
          </div>

      {/* ROM List with Virtualized Rendering */}
      <div>
        {sortedAndFilteredRoms.length === 0 ? (
          <div className="text-center py-16 px-6 bg-[#FAF3DD]/40 dark:bg-[#1F1E18]/40 rounded-3xl border border-[#EBE4CF] dark:border-[#36342A] space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-[#FDE694]/50 flex items-center justify-center mx-auto text-[#49473E] dark:text-[#121212]">
              <Filter className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-[#49473E] dark:text-[#F4EFE6]">
              No ROM builds match your criteria
            </h3>
            <p className="text-xs sm:text-sm text-[#787567] dark:text-[#BDB8A4] max-w-sm mx-auto">
              Try adjusting your search terms or selecting 'All Builds' to browse the complete list.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedFilter('all');
              }}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-full text-xs font-bold bg-[#FDE694] text-[#121212] hover:bg-[#FDE694]/80 transition-all cursor-pointer mt-2"
            >
              Show All ROMs
            </button>
          </div>
        ) : (
          <div
            ref={listParentRef}
            className="relative w-full"
            style={{ height: `${rowVirtualizer.getTotalSize()}px` }}
          >
            {rowVirtualizer.getVirtualItems().map((virtualRow) => {
              const rom = sortedAndFilteredRoms[virtualRow.index];
              if (!rom) return null;
              const romId = rom.id || rom.name;
              return (
                <div
                  key={romId}
                  data-index={virtualRow.index}
                  ref={rowVirtualizer.measureElement}
                  className="absolute top-0 left-0 w-full pb-4"
                  style={{
                    transform: `translateY(${virtualRow.start - rowVirtualizer.options.scrollMargin}px)`,
                  }}
                >
                  <RomCard
                    rom={rom}
                    isSaved={isSaved(romId)}
                    isCompared={compareList.some((r) => r.name === rom.name)}
                    isThisCopied={copiedUrl === rom.url}
                    isExpanded={expandedRomId === romId}
                    mirrorLabel={getMirrorLabel(rom.url)}
                    staggerItemVariants={staggerItemVariants}
                    onToggleCompare={toggleCompare}
                    onToggleSave={handleToggleSave}
                    onSelectRom={handleSelectRom}
                    onCopyLink={handleCopyLink}
                    onToggleExpand={toggleExpandRom}
                    onShowDownloadToast={handleShowDownloadToast}
                    onAskAi={(rom, e) => {
                      e?.stopPropagation();
                      handleAskAi(rom);
                    }}
                  />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  </div>

  {/* Flashing Guide & Prerequisites Section (Bottom) */}
      <div className="pt-6 border-t border-[#EBE4CF] dark:border-[#36342A]">
        <FlashingGuide />
      </div>

      {/* Details & Changelog Modal */}
      <RomDetailsModal
        rom={selectedRom}
        onClose={() => setSelectedRom(null)}
        onCopyUrl={(url) => handleCopyLink(url)}
        isCopied={selectedRom ? copiedUrl === selectedRom.url : false}
        onAskAi={(rom) => {
          setSelectedRom(null);
          handleAskAi(rom);
        }}
      />

      {/* Multi-turn Gemini AI Chatbot Modal */}
      <RomChatbot
        roms={roms}
        isOpen={isChatbotOpen}
        onClose={() => {
          setIsChatbotOpen(false);
          setChatTargetRom(null);
          setChatInitialPrompt(undefined);
        }}
        initialPrompt={chatInitialPrompt}
        targetRom={chatTargetRom}
      />

      {/* Floating Gemini AI Trigger FAB */}
      <motion.button
        whileHover={{ scale: 1.06, y: -2 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => handleAskAi()}
        className="fixed bottom-36 sm:bottom-20 md:bottom-6 left-4 md:left-40 z-[75] flex items-center gap-2.5 px-4 py-3 bg-[#1C1B17] dark:bg-[#FDE694] text-[#FAF3DD] dark:text-[#121212] rounded-full shadow-2xl border border-[#36342A] dark:border-transparent cursor-pointer group"
        aria-label="Open Gemini AI Assistant"
      >
        <div className="w-6 h-6 rounded-full bg-[#FDE694] dark:bg-[#1C1B17] text-[#121212] dark:text-[#FDE694] flex items-center justify-center shrink-0">
          <Sparkles className="w-3.5 h-3.5 animate-pulse" />
        </div>
        <span className="text-xs font-black tracking-wide uppercase">
          Ask Gemini AI
        </span>
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
      </motion.button>

      {/* Side-by-Side ROM Comparison Modal */}
      {isCompareModalOpen && (
        <RomCompareModal
          roms={compareList}
          onClose={() => setIsCompareModalOpen(false)}
          onRemoveRom={(romName) => {
            setCompareList(prev => prev.filter(r => r.name !== romName));
            if (compareList.length <= 1) {
              setIsCompareModalOpen(false);
            }
          }}
        />
      )}

      {/* Floating Compare Dock Bar */}
      {compareList.length > 0 && (
        <div className="fixed bottom-24 sm:bottom-6 left-1/2 -translate-x-1/2 sm:translate-x-0 sm:left-auto sm:right-24 z-[80] flex items-center gap-3 p-3 pl-4 bg-[#1C1B17] border border-[#36342A] rounded-2xl shadow-2xl text-[#FAF3DD] animate-in fade-in slide-in-from-bottom-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#FDE694]" />
            <span className="text-xs font-bold">{compareList.length} ROMs selected</span>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setIsCompareModalOpen(true)}
              className="px-3.5 py-1.5 bg-[#FDE694] text-[#121210] font-bold text-xs rounded-xl hover:bg-[#F4D068] transition-all cursor-pointer shadow-md active:scale-95 flex items-center gap-1"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Compare Now</span>
            </button>
            <button
              onClick={() => setCompareList([])}
              className="p-1.5 text-[#9C9888] hover:text-[#FAF3DD] rounded-lg hover:bg-white/5 cursor-pointer"
              title="Clear comparison list"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Back to Top Button */}
      <AnimatePresence>
        {showBackToTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="fixed bottom-24 md:bottom-8 right-4 md:right-8 p-3 rounded-full bg-[#FDE694] text-[#121212] shadow-lg hover:scale-110 transition-all z-50"
            aria-label="Back to top"
          >
            <ArrowUp className="w-6 h-6" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
};

export default RomsPage;

