/**
 * SHARED FONT CONTROLS - UPGRADED
 * Panel do kontroli czcionki - rozmiar, rodzina, grubość, styl
 */

import React from 'react';
import { TextAa, TextB, TextItalic } from '@phosphor-icons/react';

interface FontControlsProps {
  fontSize: number;
  onFontSizeChange: (size: number) => void;
  fontFamily?: string;
  onFontFamilyChange?: (family: string) => void;
  fontWeight?: 'normal' | 'bold';
  onFontWeightChange?: (weight: 'normal' | 'bold') => void;
  fontStyle?: 'normal' | 'italic';
  onFontStyleChange?: (style: 'normal' | 'italic') => void;
  minSize?: number;
  maxSize?: number;
}

const FONT_FAMILIES = [
  { value: 'Arial, sans-serif', label: 'Arial' },
  { value: 'Helvetica, sans-serif', label: 'Helvetica' },
  { value: 'Roboto, sans-serif', label: 'Roboto' },
  { value: 'Georgia, serif', label: 'Georgia' },
  { value: 'Times New Roman, serif', label: 'Times New Roman' },
  { value: 'Courier New, monospace', label: 'Courier New' }
];

export const FontControls: React.FC<FontControlsProps> = ({
  fontSize,
  onFontSizeChange,
  fontFamily,
  onFontFamilyChange,
  fontWeight,
  onFontWeightChange,
  fontStyle,
  onFontStyleChange,
  minSize = 8,
  maxSize = 16
}) => {
  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 border-2 border-sky-300">
      <div className="flex items-center gap-3 mb-4">
        <TextAa size={24} className="text-sky-600" />
        <h3 className="font-bold text-lg">Czcionka</h3>
      </div>
      
      <div className="space-y-4">
        {/* Font Size */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Rozmiar tekstu</label>
          <div className="flex items-center gap-3">
            <input
              type="range"
              min={minSize}
              max={maxSize}
              value={fontSize}
              onChange={(e) => onFontSizeChange(Number(e.target.value))}
              className="flex-1"
              title={`Rozmiar: ${fontSize}px`}
            />
            <span className="font-bold text-sky-600 w-12 text-center">{fontSize}px</span>
          </div>
        </div>

        {/* Font Family (optional) */}
        {onFontFamilyChange && (
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Rodzina czcionki</label>
            <select
              value={fontFamily || 'Arial, sans-serif'}
              onChange={(e) => onFontFamilyChange(e.target.value)}
              className="w-full px-3 py-2 border-2 border-sky-300 rounded-lg bg-white"
              title="Wybierz czcionkę"
            >
              {FONT_FAMILIES.map(font => (
                <option key={font.value} value={font.value}>
                  {font.label}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Bold & Italic Toggles - NEW! */}
        {(onFontWeightChange || onFontStyleChange) && (
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Styl tekstu</label>
            <div className="flex gap-2">
              {onFontWeightChange && (
                <button
                  onClick={() => onFontWeightChange(fontWeight === 'bold' ? 'normal' : 'bold')}
                  className={`flex-1 px-4 py-2 rounded-lg border-2 font-bold transition-all ${
                    fontWeight === 'bold'
                      ? 'bg-sky-500 text-white border-sky-500'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-sky-400'
                  }`}
                  title="Pogrubienie (Bold)"
                >
                  <TextB size={20} weight="bold" className="mx-auto" />
                </button>
              )}
              {onFontStyleChange && (
                <button
                  onClick={() => onFontStyleChange(fontStyle === 'italic' ? 'normal' : 'italic')}
                  className={`flex-1 px-4 py-2 rounded-lg border-2 font-bold transition-all ${
                    fontStyle === 'italic'
                      ? 'bg-sky-500 text-white border-sky-500'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-sky-400'
                  }`}
                  title="Kursywa (Italic)"
                >
                  <TextItalic size={20} weight="bold" className="mx-auto" />
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
