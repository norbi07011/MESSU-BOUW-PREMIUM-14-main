/**
 * SHARED GRADIENT COLOR PICKER
 * Używany przez TimesheetTemplateEditor + InvoiceTemplateEditor
 * 
 * Dual color picker dla gradientów (start → end)
 */

import React from 'react';
import { Palette } from '@phosphor-icons/react';

interface ColorPickerDualProps {
  startColor: string;
  endColor: string;
  onStartColorChange: (color: string) => void;
  onEndColorChange: (color: string) => void;
  label?: string;
}

export const ColorPickerDual: React.FC<ColorPickerDualProps> = ({
  startColor,
  endColor,
  onStartColorChange,
  onEndColorChange,
  label = 'Gradient'
}) => {
  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 border-2 border-sky-300">
      <div className="flex items-center gap-3 mb-4">
        <Palette size={24} className="text-sky-600" />
        <h3 className="font-bold text-lg">{label}</h3>
      </div>
      
      <div className="space-y-4">
        {/* Start Color */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Kolor początkowy</label>
          <div className="flex gap-3">
            <input
              type="color"
              value={startColor}
              onChange={(e) => onStartColorChange(e.target.value)}
              className="w-16 h-12 rounded-lg border-2 border-gray-300 cursor-pointer"
              title="Wybierz kolor początkowy gradientu"
            />
            <input
              type="text"
              value={startColor}
              onChange={(e) => onStartColorChange(e.target.value)}
              className="flex-1 px-3 py-2 border-2 border-sky-300 rounded-lg font-mono text-sm"
              placeholder="#0ea5e9"
            />
          </div>
        </div>

        {/* End Color */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Kolor końcowy</label>
          <div className="flex gap-3">
            <input
              type="color"
              value={endColor}
              onChange={(e) => onEndColorChange(e.target.value)}
              className="w-16 h-12 rounded-lg border-2 border-gray-300 cursor-pointer"
              title="Wybierz kolor końcowy gradientu"
            />
            <input
              type="text"
              value={endColor}
              onChange={(e) => onEndColorChange(e.target.value)}
              className="flex-1 px-3 py-2 border-2 border-sky-300 rounded-lg font-mono text-sm"
              placeholder="#2563eb"
            />
          </div>
        </div>

        {/* Gradient Preview */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Podgląd</label>
          <div 
            className="w-full h-12 rounded-lg border-2 border-gray-300"
            style={{ background: `linear-gradient(to right, ${startColor}, ${endColor})` }}
          />
        </div>
      </div>
    </div>
  );
};
