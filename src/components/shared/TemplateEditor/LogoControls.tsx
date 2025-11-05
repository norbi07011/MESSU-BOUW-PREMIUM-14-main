/**
 * SHARED LOGO CONTROLS - UPGRADED v2
 * Panel do zarządzania logo z LIVE PREVIEW + DRAG & DROP + TRANSPARENCY
 * 
 * NOWE FUNKCJE:
 * ✅ Live preview na fakturze
 * ✅ Drag & drop (position x/y z myszką)
 * ✅ Resize slider (width/height)
 * ✅ Transparency slider (0-100%)
 * ✅ Position presets (left/center/right)
 */

import React, { useState } from 'react';
import { Image as ImageIcon, Upload } from '@phosphor-icons/react';

interface LogoControlsProps {
  showLogo: boolean;
  onShowLogoChange: (show: boolean) => void;
  onLogoUpload?: (url: string) => void;  // Changed: pass URL string directly
  logoUrl?: string;
  logoPosition?: 'left' | 'center' | 'right';
  onLogoPositionChange?: (position: 'left' | 'center' | 'right') => void;
  // NEW PROPS for advanced control
  logoX?: number;  // X position in px
  logoY?: number;  // Y position in px
  logoWidth?: number;  // Width in px
  logoHeight?: number;  // Height in px
  logoOpacity?: number;  // 0-100%
  onLogoPositionXY?: (x: number, y: number) => void;
  onLogoResize?: (width: number, height: number) => void;
  onLogoOpacityChange?: (opacity: number) => void;
  // Preview mode
  showLivePreview?: boolean;
}

export const LogoControls: React.FC<LogoControlsProps> = ({
  showLogo,
  onShowLogoChange,
  onLogoUpload,
  logoUrl,
  logoPosition = 'left',
  onLogoPositionChange,
  logoX = 20,
  logoY = 20,
  logoWidth = 120,
  logoHeight = 60,
  logoOpacity = 100,
  onLogoPositionXY,
  onLogoResize,
  onLogoOpacityChange,
  showLivePreview = true
}) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onLogoUpload) {
      // Convert to base64 or object URL
      const reader = new FileReader();
      reader.onloadend = () => {
        onLogoUpload(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Drag & Drop handlers for logo preview
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!onLogoPositionXY) return;
    setIsDragging(true);
    e.preventDefault();
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !onLogoPositionXY) return;
    onLogoPositionXY(e.clientX, e.clientY);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 border-2 border-sky-300">
      <div className="flex items-center gap-3 mb-4">
        <ImageIcon size={24} className="text-sky-600" />
        <h3 className="font-bold text-lg">Logo</h3>
      </div>
      
      <div className="space-y-4">
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

        {/* LIVE PREVIEW with Drag & Drop */}
        {logoUrl && showLogo && showLivePreview && (
          <div className="relative">
            <div className="p-3 bg-gray-50 rounded-lg border-2 border-gray-200 overflow-hidden h-[200px] relative">
              <div className="absolute top-2 left-2 text-xs font-bold text-gray-500 bg-white px-2 py-1 rounded">
                ⬇️ Przeciągnij logo myszką
              </div>
              <img
                src={logoUrl}
                alt="Logo preview"
                draggable={false}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                className={`absolute cursor-move transition-opacity ${isDragging ? 'ring-4 ring-sky-400' : ''}`}
                style={{
                  left: `${logoX}px`,
                  top: `${logoY}px`,
                  width: `${logoWidth}px`,
                  height: `${logoHeight}px`,
                  opacity: logoOpacity / 100,
                  objectFit: 'contain',
                }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-1 text-center">
              Pozycja: X={logoX}px, Y={logoY}px | Rozmiar: {logoWidth}x{logoHeight}px
            </p>
          </div>
        )}

        {/* Simple Preview (no drag) */}
        {logoUrl && showLogo && !showLivePreview && (
          <div className="p-3 bg-gray-50 rounded-lg border-2 border-gray-200">
            <img
              src={logoUrl}
              alt="Logo preview"
              className="mx-auto object-contain"
              style={{
                maxHeight: '80px',
                opacity: logoOpacity / 100,
              }}
            />
          </div>
        )}

        {/* Width Slider */}
        {onLogoResize && showLogo && (
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Szerokość: {logoWidth}px
            </label>
            <input
              type="range"
              min="50"
              max="300"
              step="10"
              value={logoWidth}
              onChange={(e) => onLogoResize(parseInt(e.target.value), logoHeight)}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-sky-500"
              title={`Szerokość logo: ${logoWidth}px`}
              aria-label="Szerokość logo w pikselach"
            />
          </div>
        )}

        {/* Height Slider */}
        {onLogoResize && showLogo && (
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Wysokość: {logoHeight}px
            </label>
            <input
              type="range"
              min="30"
              max="200"
              step="10"
              value={logoHeight}
              onChange={(e) => onLogoResize(logoWidth, parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-sky-500"
              title={`Wysokość logo: ${logoHeight}px`}
              aria-label="Wysokość logo w pikselach"
            />
          </div>
        )}

        {/* Opacity Slider - NEW! */}
        {onLogoOpacityChange && showLogo && (
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Przezroczystość: {logoOpacity}% {logoOpacity < 50 ? '(prześwit przez tabelę)' : ''}
            </label>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={logoOpacity}
              onChange={(e) => onLogoOpacityChange(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-sky-500"
              title={`Przezroczystość logo: ${logoOpacity}%`}
              aria-label="Przezroczystość logo w procentach"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>0% (niewidoczne)</span>
              <span>100% (pełne)</span>
            </div>
          </div>
        )}

        {/* Position Presets */}
        {onLogoPositionChange && showLogo && (
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Pozycja (preset)</label>
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
      </div>
    </div>
  );
};
