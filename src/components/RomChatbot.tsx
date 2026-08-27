import React, { useState, useEffect, useRef, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import Markdown from 'react-markdown';
import {
  Sparkles,
  Send,
  X,
  RotateCcw,
  Bot,
  User,
  Copy,
  Check,
  ChevronDown,
  Cpu,
  Flame,
  Zap,
  ShieldAlert,
  Maximize2,
  Minimize2,
  Trash2,
  HelpCircle,
  Smartphone,
  Layers,
  ArrowRight,
  RefreshCw,
  ExternalLink
} from 'lucide-react';
import { RomItem } from '../../shared/types';
import { useToast } from '../context/ToastContext';
import { getApiUrl } from '../lib/api';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  modelUsed?: string;
  isError?: boolean;
}

export type ChatRolePreset = 'advisor' | 'quick-finder' | 'troubleshooter';

interface RoleConfig {
  id: ChatRolePreset;
  title: string;
  shortName: string;
  description: string;
  defaultModel: 'gemini-3.5-flash' | 'gemini-3.1-flash-lite' | 'gemini-3.6-flash' | 'gemini-3.7-flash';
  badgeColor: string;
  icon: React.ComponentType<{ className?: string }>;
  systemInstruction: string;
}

const ROLE_PRESETS: RoleConfig[] = [
  {
    id: 'advisor',
    title: 'ROM Advisor & Comparison',
    shortName: 'ROM Advisor',
    description: 'Expert guidance on daily drivers, battery life, gaming performance, and customization.',
    defaultModel: 'gemini-3.5-flash',
    badgeColor: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
    icon: Sparkles,
    systemInstruction: `You are SKY AI ROM Advisor, an expert Android OS consultant specialized in Xiaomi Redmi 12 5G and POCO M6 Pro 5G (codename 'sky' / Snapdragon 4 Gen 2 - SM4450).
Your mission is to help users find the perfect custom ROM (e.g. PixelOS, crDroid, Evolution X, AxionOS, InfinityX, LineageOS, iodeOS, MistOS, VoltageOS) for their exact use case.
Analyze trade-offs between battery endurance, gaming smoothness, customization density, camera stability (Leica Cam/ANX), and banking app / Play Integrity compatibility.
Format your responses with clear markdown headers, comparison tables or bullet points, and actionable advice.`
  },
  {
    id: 'quick-finder',
    title: 'Fast ROM & Spec Lookup',
    shortName: 'Fast Finder',
    description: 'Lightning-fast lookup for Android versions, maintainers, changelogs, and download links.',
    defaultModel: 'gemini-3.1-flash-lite',
    badgeColor: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
    icon: Zap,
    systemInstruction: `You are SKY AI Quick Finder, a fast lookup tool for the Redmi 12 5G / POCO M6 Pro 5G (sky) ROM ecosystem.
Answer quickly and concisely. Provide direct facts, maintainer handles, Android versions, battery ratings, and relevant links from the catalog. Keep explanations minimal and direct.`
  },
  {
    id: 'troubleshooter',
    title: 'Deep Flashing & Kernel Specialist',
    shortName: 'Flashing Expert',
    description: 'Complex recovery errors, bootloop recovery, partition repairs, Magisk/KSU, and firmware scripts.',
    defaultModel: 'gemini-3.6-flash',
    badgeColor: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
    icon: Flame,
    systemInstruction: `You are SKY AI Deep Flashing & Kernel Specialist, a master engineer on Qualcomm Snapdragon 4 Gen 2 (SM4450) and Xiaomi 'sky' partition architecture.
You solve deep technical problems:
1. Bootloop recovery (Fastboot flash scripts, wiping userdata, dynamic partition issues).
2. Custom recoveries (OrangeFox vs TWRP, sideload vs fastbootd, decrypting /data).
3. Firmware compatibility (Global vs India vs China firmware base requirements before flashing A15/A16/A17 ROMs).
4. Kernel, GKI, KernelSU, APatch, and Magisk modules.
5. SafetyNet / Play Integrity Strong/Device verdict bypass techniques.
Always provide step-by-step terminal/fastboot commands in code blocks and emphasize safety precautions.`
  }
];

const SUGGESTED_PROMPTS: Record<ChatRolePreset, string[]> = {
  advisor: [
    "Which ROM offers the best battery life for daily use on sky?",
    "Compare PixelOS vs crDroid for POCO M6 Pro 5G",
    "What are the best Android 17 ROMs available right now?",
    "Which ROM is best for heavy gaming and 90Hz smoothness?"
  ],
  'quick-finder': [
    "List all official Android 16 & 17 builds with maintainers",
    "Who maintains crDroid and what is the latest version?",
    "Show me ROMs with 5/5 battery efficiency rating",
    "Are there any vanilla (non-GApps) ROM builds available?"
  ],
  troubleshooter: [
    "My phone is stuck on the POCO/Mi logo after flashing ROM, how do I fix it?",
    "Step-by-step guide to flash ROM using OrangeFox Recovery",
    "How to flash the required firmware before installing Android 17?",
    "How to pass Play Integrity / SafetyNet with KernelSU on sky?"
  ]
};

interface RomChatbotProps {
  roms: RomItem[];
  isOpen: boolean;
  onClose: () => void;
  initialPrompt?: string;
  targetRom?: RomItem | null;
}

export const RomChatbot: React.FC<RomChatbotProps> = ({
  roms,
  isOpen,
  onClose,
  initialPrompt,
  targetRom
}) => {
  const { showToast } = useToast();
  const [activeRole, setActiveRole] = useState<ChatRolePreset>('advisor');
  const [selectedModel, setSelectedModel] = useState<string>(ROLE_PRESETS[0].defaultModel);
  const [inputMessage, setInputMessage] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);

  // Conversation history in local state & localStorage persistence
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const saved = localStorage.getItem('sky_rom_chat_history');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {}
    return [
      {
        id: 'welcome-1',
        role: 'assistant',
        content: `👋 Hello! I am **SKY AI**, your dedicated ROM & Android assistant for **Redmi 12 5G** and **POCO M6 Pro 5G** (\`sky\`).

I can help you:
- **Recommend ROMs** based on your priorities (battery, gaming, UI customization, camera)
- **Provide flashing instructions** and step-by-step recovery guides
- **Troubleshoot errors**, bootloops, or firmware compatibility

How can I assist your flashing journey today?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        modelUsed: 'gemini-3.5-flash'
      }
    ];
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Sync default model when role changes
  useEffect(() => {
    const currentPreset = ROLE_PRESETS.find(r => r.id === activeRole);
    if (currentPreset) {
      setSelectedModel(currentPreset.defaultModel);
    }
  }, [activeRole]);

  // Handle incoming initial prompt or target ROM
  useEffect(() => {
    if (initialPrompt && isOpen) {
      setInputMessage(initialPrompt);
      if (textareaRef.current) {
        textareaRef.current.focus();
      }
    }
  }, [initialPrompt, isOpen]);

  useEffect(() => {
    if (targetRom && isOpen) {
      const targetPrompt = `Can you give me an overview and recommendations for ${targetRom.name} (Android ${targetRom.androidVersion}) by ${targetRom.maintainer}?`;
      setInputMessage(targetPrompt);
    }
  }, [targetRom, isOpen]);

  // Persist history to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('sky_rom_chat_history', JSON.stringify(messages.slice(-30)));
    } catch {}
  }, [messages]);

  // Auto scroll to bottom
  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  };

  useEffect(() => {
    scrollToBottom('smooth');
  }, [messages, isGenerating]);

  // Format ROM catalog context
  const romsContext = useMemo(() => {
    if (!roms || roms.length === 0) return '';
    return roms.map((r, i) => (
      `${i + 1}. [${r.name}] (Android ${r.androidVersion}) - Status: ${r.status || 'Official'}, Maintainer: ${r.maintainer || 'Unknown'}, Battery Rating: ${r.batteryEfficiency || 3}/5, Download: ${r.url || 'N/A'}${r.description ? `, Summary: ${r.description.slice(0, 120)}...` : ''}`
    )).join('\n');
  }, [roms]);

  const handleClearHistory = () => {
    const welcomeMessage: ChatMessage = {
      id: 'welcome-reset',
      role: 'assistant',
      content: `Conversation reset. Choose a role above and ask me anything about ROMs, flashing, or device tweaks for \`sky\`!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      modelUsed: selectedModel
    };
    setMessages([welcomeMessage]);
    localStorage.removeItem('sky_rom_chat_history');
    showToast({ title: 'Chat history cleared', type: 'info' });
  };

  const handleCopyMessage = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedMessageId(id);
    setTimeout(() => setCopiedMessageId(null), 2000);
    showToast({ title: 'Message copied to clipboard', type: 'success' });
  };

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputMessage).trim();
    if (!query || isGenerating) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const updatedHistory = [...messages, userMessage];
    setMessages(updatedHistory);
    setInputMessage('');
    setIsGenerating(true);

    const assistantMessageId = `assistant-${Date.now()}`;
    const placeholderAssistantMessage: ChatMessage = {
      id: assistantMessageId,
      role: 'assistant',
      content: '',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      modelUsed: selectedModel
    };

    setMessages([...updatedHistory, placeholderAssistantMessage]);

    // Prepare history payload for server
    const historyPayload = updatedHistory
      .filter(m => !m.isError && m.content.trim())
      .slice(-10)
      .map(m => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        content: m.content
      }));

    const currentRoleConfig = ROLE_PRESETS.find(r => r.id === activeRole) || ROLE_PRESETS[0];

    try {
      abortControllerRef.current = new AbortController();

      const response = await fetch(getApiUrl('/api/gemini/chat'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: query,
          history: historyPayload,
          model: selectedModel,
          systemInstruction: currentRoleConfig.systemInstruction,
          romsContext,
          stream: true
        }),
        signal: abortControllerRef.current.signal
      });

      if (!response.ok) {
        let errMessage = 'Failed to generate response.';
        try {
          const errData = await response.json();
          errMessage = errData.error || errMessage;
        } catch {}
        throw new Error(errMessage);
      }

      // Check if response is SSE stream or direct JSON
      const contentType = response.headers.get('content-type') || '';
      if (contentType.includes('text/event-stream') && response.body) {
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let accumulatedText = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunkStr = decoder.decode(value, { stream: true });
          const lines = chunkStr.split('\n');

          for (const line of lines) {
            const trimmed = line.trim();
            if (trimmed.startsWith('data: ')) {
              const dataContent = trimmed.slice(6);
              if (dataContent === '[DONE]') {
                break;
              }
              try {
                const parsed = JSON.parse(dataContent);
                if (parsed.error) {
                  throw new Error(parsed.error);
                }
                if (parsed.text) {
                  accumulatedText += parsed.text;
                  setMessages(prev =>
                    prev.map(m =>
                      m.id === assistantMessageId
                        ? { ...m, content: accumulatedText }
                        : m
                    )
                  );
                }
              } catch (e) {
                // Ignore parse errors on partial chunks
              }
            }
          }
        }

        // If stream ended empty, perform a non-streaming fallback
        if (!accumulatedText.trim()) {
          const fallbackRes = await fetch(getApiUrl('/api/gemini/chat'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              message: query,
              history: historyPayload,
              model: selectedModel,
              systemInstruction: currentRoleConfig.systemInstruction,
              romsContext,
              stream: false
            }),
            signal: abortControllerRef.current.signal
          });
          const fbData = await fallbackRes.json();
          const outText = fbData.text || 'No response generated.';
          setMessages(prev =>
            prev.map(m =>
              m.id === assistantMessageId
                ? { ...m, content: outText, modelUsed: fbData.model || selectedModel }
                : m
            )
          );
        }
      } else {
        const data = await response.json();
        const outputText = data.text || 'No response generated.';
        setMessages(prev =>
          prev.map(m =>
            m.id === assistantMessageId
              ? { ...m, content: outputText, modelUsed: data.model || selectedModel }
              : m
          )
        );
      }
    } catch (err: any) {
      if (err.name === 'AbortError') {
        console.log('Gemini chat request cancelled.');
      } else {
        console.error('Chat error:', err);
        const errorMsg = err.message || 'An error occurred while contacting Gemini AI.';
        setMessages(prev =>
          prev.map(m =>
            m.id === assistantMessageId
              ? {
                  ...m,
                  content: `⚠️ **Error:** ${errorMsg}\n\n*Please ensure your Gemini API key is configured or try selecting a different model.*`,
                  isError: true
                }
              : m
          )
        );
        showToast({ title: 'AI response failed', message: errorMsg, type: 'error' });
      }
    } finally {
      setIsGenerating(false);
      abortControllerRef.current = null;
    }
  };

  const handleStopGenerating = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setIsGenerating(false);
      showToast({ title: 'Response generation stopped', type: 'info' });
    }
  };

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center p-0 sm:p-4 md:p-6 pointer-events-none">
          {/* Backdrop for mobile */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs pointer-events-auto"
        />

        {/* Chatbot Window */}
        <motion.div
          initial={{ y: '100%', opacity: 0, scale: 0.95 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: '100%', opacity: 0, scale: 0.95 }}
          transition={{ type: 'spring', damping: 26, stiffness: 260 }}
          className={`relative pointer-events-auto w-full flex flex-col bg-[#FAF8F1] dark:bg-[#12110D] border border-[#EBE4CF] dark:border-[#2A2820] shadow-2xl overflow-hidden transition-all duration-300 rounded-t-3xl sm:rounded-3xl ${
            isExpanded
              ? 'h-[95vh] sm:h-[90vh] sm:max-w-4xl'
              : 'h-[85vh] sm:h-[650px] sm:max-w-2xl'
          }`}
        >
          {/* Header Bar */}
          <div className="p-4 sm:px-6 sm:py-4 border-b border-[#EBE4CF] dark:border-[#2A2820] bg-[#FAF3DD]/80 dark:bg-[#1A1914]/90 backdrop-blur-md flex items-center justify-between gap-3 shrink-0">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#FDE694] to-amber-400 flex items-center justify-center text-[#121212] shadow-sm shrink-0">
                <Sparkles className="w-5 h-5 animate-pulse" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h2 className="text-base sm:text-lg font-black tracking-tight text-[#121212] dark:text-[#F4EFE6] truncate">
                    SKY AI Assistant
                  </h2>
                  <span className="px-2 py-0.5 text-[10px] font-mono font-bold uppercase rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20 shrink-0">
                    Gemini
                  </span>
                </div>
                <p className="text-xs text-[#787567] dark:text-[#BDB8A4] truncate">
                  Multi-turn custom ROM & flashing intelligence for <code className="font-mono font-bold">sky</code>
                </p>
              </div>
            </div>

            {/* Window Controls */}
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={handleClearHistory}
                title="Clear conversation"
                className="p-2 text-[#787567] hover:text-[#121212] dark:text-[#BDB8A4] dark:hover:text-[#F4EFE6] rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
                aria-label="Clear chat"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                title={isExpanded ? 'Minimize size' : 'Expand size'}
                className="hidden sm:flex p-2 text-[#787567] hover:text-[#121212] dark:text-[#BDB8A4] dark:hover:text-[#F4EFE6] rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
                aria-label="Toggle size"
              >
                {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>
              <button
                onClick={onClose}
                title="Close chat"
                className="p-2 text-[#787567] hover:text-[#121212] dark:text-[#BDB8A4] dark:hover:text-[#F4EFE6] rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Role Persona Tabs & Model Selector */}
          <div className="px-4 py-2.5 sm:px-6 bg-[#FAF3DD]/40 dark:bg-[#161511] border-b border-[#EBE4CF] dark:border-[#2A2820] flex flex-wrap items-center justify-between gap-2 shrink-0">
            {/* Persona Preset Buttons */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
              {ROLE_PRESETS.map((preset) => {
                const IconComp = preset.icon;
                const isActive = activeRole === preset.id;
                return (
                  <button
                    key={preset.id}
                    onClick={() => setActiveRole(preset.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap border ${
                      isActive
                        ? 'bg-[#49473E] text-[#FAF3DD] dark:bg-[#FDE694] dark:text-[#121212] border-transparent shadow-xs'
                        : 'bg-white/60 dark:bg-[#1E1D17]/80 text-[#787567] dark:text-[#BDB8A4] border-[#EBE4CF] dark:border-[#2E2C23] hover:border-amber-400/50'
                    }`}
                  >
                    <IconComp className="w-3.5 h-3.5" />
                    <span>{preset.shortName}</span>
                  </button>
                );
              })}
            </div>

            {/* Model Pill Switcher */}
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] uppercase font-bold text-[#787567] dark:text-[#BDB8A4] hidden xs:inline">
                Model:
              </span>
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="text-xs font-mono font-medium px-2.5 py-1 rounded-xl bg-white/80 dark:bg-[#1E1D17] border border-[#EBE4CF] dark:border-[#2E2C23] text-[#49473E] dark:text-[#F4EFE6] focus:outline-none focus:ring-1 focus:ring-amber-400 cursor-pointer"
              >
                <option value="gemini-3.5-flash">gemini-3.5-flash (Balanced)</option>
                <option value="gemini-3.6-flash">gemini-3.6-flash (High Precision)</option>
                <option value="gemini-3.7-flash">gemini-3.7-flash (Advanced)</option>
                <option value="gemini-3.1-flash-lite">gemini-3.1-flash-lite (Fast)</option>
              </select>
            </div>
          </div>

          {/* Active Role Description Banner */}
          <div className="px-4 py-1.5 sm:px-6 bg-amber-500/5 border-b border-amber-500/10 text-[11px] text-[#787567] dark:text-[#BDB8A4] flex items-center justify-between">
            <span className="truncate">
              <strong>{ROLE_PRESETS.find(r => r.id === activeRole)?.title}:</strong>{' '}
              {ROLE_PRESETS.find(r => r.id === activeRole)?.description}
            </span>
            <span className="text-[10px] font-mono opacity-75 shrink-0 ml-2 hidden sm:inline">
              Catalog: {roms.length} ROMs loaded
            </span>
          </div>

          {/* Scrollable Message Thread */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
            {messages.map((msg) => {
              const isUser = msg.role === 'user';
              return (
                <div
                  key={msg.id}
                  className={`flex gap-3 items-start ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  {/* Avatar Icon */}
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-xs ${
                      isUser
                        ? 'bg-[#49473E] text-[#FAF3DD] dark:bg-[#FDE694] dark:text-[#121212]'
                        : 'bg-gradient-to-br from-amber-400 to-amber-600 text-[#121212]'
                    }`}
                  >
                    {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                  </div>

                  {/* Message Bubble */}
                  <div className={`max-w-[85%] sm:max-w-[78%] space-y-1 ${isUser ? 'items-end' : 'items-start'}`}>
                    <div
                      className={`p-3.5 sm:p-4 rounded-2xl text-sm leading-relaxed ${
                        isUser
                          ? 'bg-[#49473E] text-[#FAF3DD] dark:bg-[#FDE694] dark:text-[#121212] rounded-tr-none font-medium'
                          : msg.isError
                          ? 'bg-red-500/10 text-red-700 dark:text-red-300 border border-red-500/20 rounded-tl-none'
                          : 'bg-[#FAF3DD]/70 dark:bg-[#1E1D17] text-[#121212] dark:text-[#F4EFE6] border border-[#EBE4CF] dark:border-[#2E2C23] rounded-tl-none'
                      }`}
                    >
                      {isUser ? (
                        <p className="whitespace-pre-wrap">{msg.content}</p>
                      ) : msg.content ? (
                        <div className="prose prose-sm dark:prose-invert max-w-none text-xs sm:text-sm prose-pre:bg-black/80 prose-pre:text-amber-300 prose-pre:rounded-xl prose-code:font-mono prose-headings:font-bold prose-headings:text-inherit break-words overflow-hidden prose-pre:overflow-x-auto">
                          <Markdown>{msg.content}</Markdown>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-xs text-[#787567] dark:text-[#BDB8A4] py-1">
                          <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-500" />
                          <span>Gemini is thinking and crafting response...</span>
                        </div>
                      )}
                    </div>

                    {/* Metadata & Actions */}
                    <div className={`flex items-center gap-2 px-1 text-[10px] text-[#787567] dark:text-[#BDB8A4] ${isUser ? 'justify-end' : 'justify-start'}`}>
                      <span>{msg.timestamp}</span>
                      {msg.modelUsed && !isUser && (
                        <>
                          <span>•</span>
                          <span className="font-mono text-[9px] uppercase">{msg.modelUsed}</span>
                        </>
                      )}
                      {!isUser && msg.content && (
                        <button
                          onClick={() => handleCopyMessage(msg.id, msg.content)}
                          className="hover:text-[#121212] dark:hover:text-[#F4EFE6] transition-colors p-0.5 rounded cursor-pointer"
                          title="Copy response"
                        >
                          {copiedMessageId === msg.id ? (
                            <Check className="w-3 h-3 text-emerald-500" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggested Prompts */}
          <div className="px-4 py-2 sm:px-6 bg-[#FAF3DD]/30 dark:bg-[#161511]/80 border-t border-[#EBE4CF] dark:border-[#2A2820] overflow-x-auto no-scrollbar flex items-center gap-2 shrink-0">
            <span className="text-[10px] font-bold text-[#787567] dark:text-[#BDB8A4] uppercase shrink-0 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-500" /> Suggestions:
            </span>
            {SUGGESTED_PROMPTS[activeRole].map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(prompt)}
                disabled={isGenerating}
                className="px-2.5 py-1 text-xs rounded-full bg-white dark:bg-[#1E1D17] text-[#49473E] dark:text-[#FAF3DD] border border-[#EBE4CF] dark:border-[#2E2C23] hover:border-amber-400 hover:text-amber-600 dark:hover:text-amber-300 transition-all text-left whitespace-nowrap shrink-0 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Input Box & Action Bar */}
          <div className="p-3 sm:p-4 bg-[#FAF3DD]/80 dark:bg-[#1A1914] border-t border-[#EBE4CF] dark:border-[#2A2820] shrink-0">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-end gap-2"
            >
              <div className="relative flex-1 min-w-0">
                <textarea
                  ref={textareaRef}
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  rows={2}
                  placeholder={`Ask SKY AI about ROMs, flashing guides, or troubleshooting (${ROLE_PRESETS.find(r => r.id === activeRole)?.shortName})...`}
                  disabled={isGenerating}
                  className="w-full resize-none px-4 py-2.5 rounded-2xl bg-white dark:bg-[#12110D] border border-[#EBE4CF] dark:border-[#2E2C23] text-sm text-[#121212] dark:text-[#F4EFE6] placeholder-[#787567]/70 dark:placeholder-[#BDB8A4]/70 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all disabled:opacity-60"
                />
              </div>

              {isGenerating ? (
                <button
                  type="button"
                  onClick={handleStopGenerating}
                  className="h-11 px-4 rounded-2xl bg-red-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 hover:bg-red-600 transition-all cursor-pointer shadow-md shrink-0"
                >
                  <X className="w-4 h-4" />
                  <span className="hidden xs:inline">Stop</span>
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={!inputMessage.trim()}
                  className="h-11 px-4 rounded-2xl bg-[#FDE694] text-[#121212] font-bold text-xs flex items-center justify-center gap-1.5 hover:bg-amber-300 active:scale-95 transition-all cursor-pointer shadow-md shrink-0 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Send className="w-4 h-4" />
                  <span className="hidden xs:inline">Send</span>
                </button>
              )}
            </form>
            <div className="flex items-center justify-between text-[10px] text-[#787567] dark:text-[#BDB8A4] mt-2 px-1">
              <span>Press <kbd className="px-1 py-0.2 rounded bg-black/10 dark:bg-white/10 font-mono">Enter</kbd> to send, <kbd className="px-1 py-0.2 rounded bg-black/10 dark:bg-white/10 font-mono">Shift+Enter</kbd> for new line</span>
              <span className="hidden sm:inline">Powered by Gemini on Google Cloud</span>
            </div>
          </div>
        </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
};
