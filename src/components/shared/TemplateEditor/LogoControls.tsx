/**
 * SHARED LOGO CONTROLS - UPGRADED
 * Panel do zarządzania logo - upload, show/hide, pozycja, rozmiar
 */

import React from 'react';
import { Image as ImageIcon, Upload } from '@phosphor-icons/react';

interface LogoControlsProps {
  showLogo: boolean;
  onShowLogoChange: (show: boolean) => void;
  onLogoUpload?: (file: File) => void;
  logoUrl?: string;
  logoPosition?: 'left' | 'center' | 'right';
  onLogoPositionChange?: (position: 'left' | 'center' | 'right') => void;
  logoSize?: 'small' | 'medium' | 'large';
  onLogoSizeChange?: (size: 'small' | 'medium' | 'large') => void;
}

export const LogoControls: React.FC<LogoControlsProps> = ({
  showLogo,
  onShowLogoChange,
  onLogoUpload,
  logoUrl,
  logoPosition = 'left',
  onLogoPositionChange,
  logoSize = 'medium',
  onLogoSizeChange
}) => {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onLogoUpload) {
      onLogoUpload(file);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 border-2 border-sky-300">
      <div className="flex items-center gap-3 mb-4">
        <ImageIcon size={24} className="text-sky-600" />
        <h3 className="font-bold text-lg">Logo</h3>
      </div>
      
      <div className="space-y-3">
        {/* Show/Hide Toggle */}
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={showLogo}
            onChange={(e) => onShowLogoChange(e.target.checked)}
            className="w-5 h-5 rounded border-2 border-sky-300 text-sky-600 focus:ring-2 focus:ring-sky-200"
          />
          <span className="font-semibold">Pokaż logo</span>
        </label>

        {/* Logo Preview */}
        {logoUrl && showLogo && (
          <div className="p-3 bg-gray-50 rounded-lg border-2 border-gray-200">
            <img 
              src={logoUrl} 
              alt="Logo preview" 
              className={`mx-auto object-contain ${
                logoSize === 'small' ? 'max-h-12' :
                logoSize === 'large' ? 'max-h-32' :
                'max-h-20'
              }`}
            />
          </div>
        )}

        {/* Upload Button */}
        {onLogoUpload && (
          <div>
            <input
              type="file"
              id="logo-upload"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
            <label
              htmlFor="logo-upload"
              className="w-full px-4 py-3 bg-linear-to-r from-sky-100 to-blue-100 hover:from-sky-200 hover:to-blue-200 text-sky-700 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Upload size={20} />
              {logoUrl ? 'Zmień logo' : 'Upload Logo'}
            </label>
          </div>
        )}

        {/* Position Selector - NEW! */}
        {onLogoPositionChange && showLogo && (
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Pozycja logo</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => onLogoPositionChange('left')}
                className={`px-3 py-2 rounded-lg border-2 font-semibold transition-all ${
                  logoPosition === 'left'
                    ? 'bg-sky-500 text-white border-sky-500'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-sky-400'
                }`}
              >
                Lewo
              </button>
              <button
                onClick={() => onLogoPositionChange('center')}
                className={`px-3 py-2 rounded-lg border-2 font-semibold transition-all ${
                  logoPosition === 'center'
                    ? 'bg-sky-500 text-white border-sky-500'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-sky-400'
                }`}
              >
                Środek
              </button>
              <button
                onClick={() => onLogoPositionChange('right')}
                className={`px-3 py-2 rounded-lg border-2 font-semibold transition-all ${
                  logoPosition === 'right'
                    ? 'bg-sky-500 text-white border-sky-500'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-sky-400'
                }`}
              >
                Prawo
              </button>
            </div>
          </div>
        )}

        {/* Size Selector - NEW! */}
        {onLogoSizeChange && showLogo && (
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Rozmiar logo</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => onLogoSizeChange('small')}
                className={`px-3 py-2 rounded-lg border-2 font-semibold transition-all ${
                  logoSize === 'small'
                    ? 'bg-sky-500 text-white border-sky-500'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-sky-400'
                }`}
              >
                S
              </button>
              <button
                onClick={() => onLogoSizeChange('medium')}
                className={`px-3 py-2 rounded-lg border-2 font-semibold transition-all ${
                  logoSize === 'medium'
                    ? 'bg-sky-500 text-white border-sky-500'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-sky-400'
                }`}
              >
                M
              </button>
              <button
                onClick={() => onLogoSizeChange('large')}
                className={`px-3 py-2 rounded-lg border-2 font-semibold transition-all ${
                  logoSize === 'large'
                    ? 'bg-sky-500 text-white border-sky-500'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-sky-400'
                }`}
              >
                L
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
