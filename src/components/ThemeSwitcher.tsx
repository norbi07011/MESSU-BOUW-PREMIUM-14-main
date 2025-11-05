/**
 * THEME SWITCHER - Ultra Premium Przycisk Zmiany Motywu
 * 
 * Funkcje:
 * - Toggle Light/Dark
 * - Świecące obramowanie (Dark mode)
 * - Płynna animacja
 * - Ikony Słońce/Księżyc
 */

import React from 'react';
import { Sun, Moon } from '@phosphor-icons/react';
import { useTheme } from '@/contexts/ThemeContext';

export function ThemeSwitcher() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme.startsWith('dark-');

  return (
    <button
      onClick={toggleTheme}
      className={`
        relative group
        w-14 h-14 rounded-xl
        flex items-center justify-center
        transition-all duration-300
        ${isDark 
          ? 'bg-gradient-to-br from-blue-500/10 to-blue-600/10 border border-blue-500/30 hover:border-blue-400/60 shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:shadow-[0_0_30px_rgba(59,130,246,0.5)]' 
          : 'bg-white border border-sky-200 hover:border-sky-400 shadow-sm hover:shadow-md'
        }
      `}
      title={isDark ? 'Przełącz na jasny motyw' : 'Przełącz na ciemny motyw'}
    >
      {/* GLOW EFFECT (tylko dark mode) */}
      {isDark && (
        <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-purple-500/20 to-purple-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm" />
      )}
      
      {/* IKONA */}
      <div className="relative z-10">
        {isDark ? (
          <Moon 
            size={24} 
            weight="fill"
            className="text-purple-400 group-hover:text-purple-300 transition-colors duration-300"
          />
        ) : (
          <Sun 
            size={24} 
            weight="fill"
            className="text-sky-500 group-hover:text-sky-600 transition-colors duration-300"
          />
        )}
      </div>
      
      {/* ROTATING RING (animacja obrotu) */}
      <div 
        className={`
          absolute inset-0 rounded-xl border-2 
          ${isDark ? 'border-blue-500/20' : 'border-sky-200/50'}
          transition-transform duration-500 group-hover:rotate-180
        `}
      />
    </button>
  );
}

/**
 * COMPACT VERSION - dla małych ekranów/mobile
 */
export function ThemeSwitcherCompact() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme.startsWith('dark-');

  return (
    <button
      onClick={toggleTheme}
      className={`
        p-2 rounded-lg
        transition-all duration-300
        ${isDark 
          ? 'bg-cyan-500/10 border border-cyan-500/30 hover:border-cyan-400 text-cyan-400' 
          : 'bg-sky-50 border border-sky-200 hover:border-sky-400 text-sky-600'
        }
      `}
      title={isDark ? 'Jasny motyw' : 'Ciemny motyw'}
    >
      {isDark ? <Moon size={20} weight="fill" /> : <Sun size={20} weight="fill" />}
    </button>
  );
}

/**
 * WITH LABEL - z tekstem
 */
export function ThemeSwitcherWithLabel() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme.startsWith('dark-');

  return (
    <button
      onClick={toggleTheme}
      className={`
        flex items-center gap-3 px-4 py-2.5 rounded-xl
        transition-all duration-300
        ${isDark 
          ? 'bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/30 hover:border-cyan-400 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.2)]' 
          : 'bg-white border border-sky-200 hover:border-sky-400 text-sky-600 shadow-sm hover:shadow-md'
        }
      `}
    >
      {isDark ? (
        <>
          <Moon size={20} weight="fill" />
          <span className="text-sm font-medium">Ciemny motyw</span>
        </>
      ) : (
        <>
          <Sun size={20} weight="fill" />
          <span className="text-sm font-medium">Jasny motyw</span>
        </>
      )}
    </button>
  );
}

/**
 * TOGGLE SWITCH - slider style
 */
export function ThemeSwitcherToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme.startsWith('dark-');

  return (
    <div 
      onClick={toggleTheme}
      className={`
        relative w-16 h-8 rounded-full cursor-pointer
        transition-all duration-300
        ${isDark 
          ? 'bg-gradient-to-r from-cyan-600 to-blue-600 shadow-[0_0_20px_rgba(6,182,212,0.4)]' 
          : 'bg-sky-200'
        }
      `}
    >
      {/* Slider */}
      <div 
        className={`
          absolute top-1 left-1 w-6 h-6 rounded-full
          bg-white shadow-md
          transition-transform duration-300
          ${isDark ? 'translate-x-8' : 'translate-x-0'}
        `}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          {isDark ? (
            <Moon size={14} weight="fill" className="text-cyan-600" />
          ) : (
            <Sun size={14} weight="fill" className="text-sky-600" />
          )}
        </div>
      </div>
    </div>
  );
}
