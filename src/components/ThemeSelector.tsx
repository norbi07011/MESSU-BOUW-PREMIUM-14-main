/**
 * THEME SELECTOR - Wybór motywu kolorystycznego
 * 2 motywy: Jasny i Ciemny
 */

import React, { useState } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import type { Theme } from '@/lib/theme';
import { Sun, Moon, Palette } from 'lucide-react';

const themes: Array<{ id: Theme; name: string; color: string; description: string }> = [
  { 
    id: 'light', 
    name: 'Jasny', 
    color: '#3B82F6',
    description: 'Czarny tekst + niebieski akcent'
  },
  { 
    id: 'dark-blue', 
    name: 'Ciemny', 
    color: '#3B82F6',
    description: 'Czarny + niebieski neon'
  },
];

export function ThemeSelector() {
  const { theme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  const currentTheme = themes.find(t => t.id === theme);

  return (
    <div className="relative">
      {/* Przycisk otwierający selector */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/90 dark:bg-black/90 backdrop-blur-md border-2 border-black dark:border-0 dark:shadow-[0_6px_20px_rgba(var(--neon-color),0.6)] hover:shadow-lg transition-all duration-200"
        title="Zmień motyw"
      >
        <Palette className="w-5 h-5" style={{ color: currentTheme?.color }} />
        <span className="hidden md:inline text-sm font-medium text-black dark:text-white">
          {currentTheme?.name}
        </span>
      </button>

      {/* Dropdown z motywami */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Menu */}
          <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-black border-2 border-black dark:border-0 dark:shadow-[0_20px_60px_rgba(var(--neon-color),0.8)] rounded-2xl shadow-2xl z-50 overflow-hidden backdrop-blur-xl">
            <div className="p-4 border-b-2 border-gray-200 dark:border-white/10">
              <h3 className="text-lg font-bold text-black dark:text-white flex items-center gap-2">
                <Palette className="w-5 h-5" />
                Wybierz Motyw
              </h3>
              <p className="text-xs text-black dark:text-black mt-1">
                Wybierz jasny lub ciemny motyw
              </p>
            </div>

            <div className="p-2 max-h-96 overflow-y-auto">
              {themes.map((t) => (
                <button
                  key={t.id}
                  onClick={() => {
                    setTheme(t.id);
                    setIsOpen(false);
                  }}
                  className={`
                    w-full p-4 rounded-xl text-left transition-all duration-200 group
                    ${theme === t.id 
                      ? 'bg-gradient-to-r from-gray-100 to-gray-50 dark:from-white/10 dark:to-white/5 border-2' 
                      : 'hover:bg-gray-50 dark:hover:bg-white/5 border-2 border-transparent'
                    }
                  `}
                  style={{
                    borderColor: theme === t.id ? t.color : 'transparent'
                  }}
                >
                  <div className="flex items-start gap-3">
                    {/* Ikona motywu */}
                    <div 
                      className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg transition-all duration-200 group-hover:scale-110"
                      style={{
                        backgroundColor: t.id === 'light' ? '#fff' : '#000',
                        boxShadow: `0 8px 20px ${t.color}40, 0 0 15px ${t.color}30`
                      }}
                    >
                      {t.id === 'light' ? (
                        <Sun className="w-6 h-6" style={{ color: t.color }} />
                      ) : (
                        <Moon className="w-6 h-6" style={{ color: t.color }} />
                      )}
                    </div>

                    {/* Informacje o motywie */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-black dark:text-white">
                          {t.name}
                        </span>
                        {theme === t.id && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-white/20 dark:bg-white/10 text-black dark:text-white font-medium">
                            Aktywny
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-black dark:text-black mt-1">
                        {t.description}
                      </p>
                      
                      {/* Podgląd koloru */}
                      <div className="flex items-center gap-2 mt-2">
                        <div 
                          className="w-full h-2 rounded-full"
                          style={{
                            background: `linear-gradient(90deg, ${t.color}00, ${t.color}80, ${t.color})`
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {/* Footer */}
            <div className="p-3 bg-gray-50 dark:bg-white/5 border-t-2 border-gray-200 dark:border-white/10">
              <p className="text-xs text-center text-black dark:text-black">
                ✨ Kliknij dowolny motyw aby go zastosować
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
