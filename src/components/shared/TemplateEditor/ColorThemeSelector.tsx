/**
 * COLOR THEME SELECTOR - Quick Apply Preset Themes
 * 
 * Funkcje:
 * - Galeria 5 gotowych themów
 * - One-click apply
 * - Live preview (small gradient preview)
 * - Save custom theme (wkrótce)
 */

import React from 'react';
import { Palette, Check } from '@phosphor-icons/react';
import { ALL_THEMES, type ColorTheme } from '@/components/TimeTracking/colorThemes';

interface ColorThemeSelectorProps {
  onSelectTheme: (theme: ColorTheme) => void;
  currentGradientStart?: string;
  currentGradientEnd?: string;
}

export const ColorThemeSelector: React.FC<ColorThemeSelectorProps> = ({
  onSelectTheme,
  currentGradientStart,
  currentGradientEnd,
}) => {
  const isThemeActive = (theme: ColorTheme) => {
    return (
      theme.colors.headerStart.toLowerCase() === currentGradientStart?.toLowerCase() &&
      theme.colors.headerEnd.toLowerCase() === currentGradientEnd?.toLowerCase()
    );
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Palette size={20} className="text-gray-700" weight="fill" />
        <h3 className="text-sm font-bold text-gray-900">Gotowe motywy kolorystyczne</h3>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {ALL_THEMES.map((theme) => {
          const isActive = isThemeActive(theme);
          
          return (
            <button
              key={theme.id}
              onClick={() => onSelectTheme(theme)}
              className={`relative group text-left rounded-xl border-2 p-3 transition-all hover:shadow-lg ${
                isActive 
                  ? 'border-sky-500 bg-sky-50' 
                  : 'border-gray-200 bg-white hover:border-sky-300'
              }`}
            >
              {/* Gradient Preview */}
              <div 
                className="h-12 rounded-lg mb-2 shadow-inner"
                style={{
                  background: `linear-gradient(to right, ${theme.colors.headerStart}, ${theme.colors.headerEnd})`
                }}
              />

              {/* Theme Info */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-gray-900">{theme.name}</h4>
                  {isActive && (
                    <Check size={16} className="text-sky-600" weight="bold" />
                  )}
                </div>
                <p className="text-[10px] text-gray-600 leading-tight">{theme.description}</p>
              </div>

              {/* Hover Effect */}
              <div className={`absolute inset-0 rounded-xl transition-opacity ${
                isActive ? 'opacity-0' : 'opacity-0 group-hover:opacity-10'
              } bg-sky-500 pointer-events-none`} />
            </button>
          );
        })}
      </div>

      <div className="mt-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
        <p className="text-xs text-blue-800">
          💡 <strong>Tip:</strong> Kliknij motyw aby od razu zastosować kolory, czcionkę i rozmiar. 
          Możesz później dostosować szczegóły w sekcji "Kolory nagłówka".
        </p>
      </div>
    </div>
  );
};
