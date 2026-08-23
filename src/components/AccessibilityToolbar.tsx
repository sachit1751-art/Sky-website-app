import React, { useState } from 'react';
import { Eye, Type, Sliders, Check, X } from 'lucide-react';
import { useAccessibility } from '../context/AccessibilityContext';

export const AccessibilityToolbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { fontScale, setFontScale, highContrast, setHighContrast, dyslexiaFont, setDyslexiaFont } = useAccessibility();

  return (
    <div className="fixed bottom-20 sm:bottom-6 left-4 sm:left-6 z-40">
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          title="Accessibility & Display Settings"
          className="flex items-center gap-2 px-3.5 py-3 bg-[#FAF8F1] dark:bg-[#1C1B17] text-[#121212] dark:text-[#FAF3DD] rounded-full shadow-lg border border-[#EBE4CF] dark:border-[#36342A] hover:scale-105 transition-all duration-200 cursor-pointer"
        >
          <Eye className="w-5 h-5 text-[#C88A2B] dark:text-[#FDE694]" />
          <span className="text-xs font-medium hidden sm:inline">Accessibility</span>
        </button>
      ) : (
        <div className="bg-[#FAF8F1] dark:bg-[#1C1B17] border border-[#EBE4CF] dark:border-[#36342A] rounded-3xl p-4 shadow-2xl w-72 flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-3">
          <div className="flex items-center justify-between border-b border-[#EBE4CF] dark:border-[#36342A] pb-3">
            <div className="flex items-center gap-2">
              <Eye className="w-5 h-5 text-[#C88A2B] dark:text-[#FDE694]" />
              <h3 className="text-sm font-semibold text-[#121212] dark:text-[#FAF3DD]">Accessibility</h3>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-full hover:bg-black/5 dark:hover:bg-white/5 text-[#73705E] dark:text-[#A6A28C]"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Font Scaling */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-[#73705E] dark:text-[#A6A28C] flex items-center gap-1.5">
              <Type className="w-3.5 h-3.5" /> Text Size
            </label>
            <div className="grid grid-cols-3 gap-1.5 bg-[#F2ECE1] dark:bg-[#121212] p-1 rounded-xl">
              {(['normal', 'large', 'xlarge'] as const).map((scale) => (
                <button
                  key={scale}
                  onClick={() => setFontScale(scale)}
                  className={`py-1.5 text-xs font-medium rounded-lg capitalize transition-all ${
                    fontScale === scale
                      ? 'bg-[#FAF8F1] dark:bg-[#2A2822] text-[#121212] dark:text-[#FDE694] shadow-sm'
                      : 'text-[#73705E] dark:text-[#A6A28C] hover:text-[#121212] dark:hover:text-[#FAF3DD]'
                  }`}
                >
                  {scale === 'normal' ? 'Normal' : scale === 'large' ? 'Large' : 'XL'}
                </button>
              ))}
            </div>
          </div>

          {/* High Contrast */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#121212] dark:text-[#FAF3DD]">High Contrast Mode</span>
            <button
              onClick={() => setHighContrast((prev) => !prev)}
              className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
                highContrast ? 'bg-[#C88A2B] dark:bg-[#FDE694]' : 'bg-[#D6CEB8] dark:bg-[#36342A]'
              }`}
            >
              <div
                className={`bg-[#FAF8F1] dark:bg-[#121212] w-4 h-4 rounded-full shadow-md transform transition-transform ${
                  highContrast ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Dyslexia Font */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#121212] dark:text-[#FAF3DD]">Dyslexia-Friendly Font</span>
            <button
              onClick={() => setDyslexiaFont((prev) => !prev)}
              className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
                dyslexiaFont ? 'bg-[#C88A2B] dark:bg-[#FDE694]' : 'bg-[#D6CEB8] dark:bg-[#36342A]'
              }`}
            >
              <div
                className={`bg-[#FAF8F1] dark:bg-[#121212] w-4 h-4 rounded-full shadow-md transform transition-transform ${
                  dyslexiaFont ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
