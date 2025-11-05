/**
 * LiveInvoicePreview Component
 * 
 * Renders live preview of invoice template with all blocks, colors, fonts, and logo.
 * A4 dimensions: 595×842px (1px = 1pt at 72dpi)
 * Real-time updates from EditorState.
 */

import React, { useState, useEffect } from 'react';
import { generateQRCode } from '@/lib/qrCodeGenerator';

interface InvoiceBlock {
  id: string;
  type: string;
  label: string;
  visible: boolean;
  order: number;
  backgroundColor?: string;
  textColor?: string;
  fontSize?: number;
}

interface EditorState {
  templateName: string;
  blocks: InvoiceBlock[];
  headerGradientStart: string;
  headerGradientEnd: string;
  primaryColorStart: string;
  primaryColorEnd: string;
  accentColorStart: string;
  accentColorEnd: string;
  backgroundColor: string;
  textColor: string;
  borderColor: string;
  fontSize: { heading: number; body: number; small: number };
  fontFamily: { heading: string; body: string };
  logoUrl?: string;
  logoPosition: 'left' | 'center' | 'right';
  logoX: number;
  logoY: number;
  logoWidth: number;
  logoHeight: number;
  logoOpacity: number;
  showLogo: boolean;
  qrCode: {
    enabled: boolean;
    position: 'top-right' | 'bottom-right' | 'bottom-left';
    size: number;
    data: string;
  };
  warningBox: {
    enabled: boolean;
    text: string;
    backgroundColor: string;
    textColor: string;
    icon: string;
  };
  pageSize: 'A4' | 'Letter';
  orientation: 'portrait' | 'landscape';
}

interface LiveInvoicePreviewProps {
  state: EditorState;
}

const LiveInvoicePreview: React.FC<LiveInvoicePreviewProps> = ({ state }) => {
  const [qrCodeImage, setQrCodeImage] = useState<string>('');

  // Generate QR code when enabled and data changes
  useEffect(() => {
    if (state.qrCode.enabled && state.qrCode.data) {
      generateQRCode(state.qrCode.data, { size: state.qrCode.size })
        .then(setQrCodeImage)
        .catch(() => setQrCodeImage(''));
    } else {
      setQrCodeImage('');
    }
  }, [state.qrCode.enabled, state.qrCode.data, state.qrCode.size]);

  // A4 dimensions (portrait: 595×842px, landscape: 842×595px)
  const dimensions = state.pageSize === 'A4' 
    ? state.orientation === 'portrait' 
      ? { width: 595, height: 842 }
      : { width: 842, height: 595 }
    : state.orientation === 'portrait'
      ? { width: 612, height: 792 } // Letter
      : { width: 792, height: 612 };

  // Logo position alignment
  const getLogoAlignment = () => {
    if (state.logoPosition === 'center') return 'center';
    if (state.logoPosition === 'right') return 'flex-end';
    return 'flex-start';
  };

  // Sort blocks by order and filter visible
  const visibleBlocks = state.blocks
    .filter(block => block.visible)
    .sort((a, b) => a.order - b.order);

  // Render individual block content based on type
  const renderBlockContent = (block: InvoiceBlock) => {
    const blockStyle = {
      backgroundColor: block.backgroundColor || 'transparent',
      color: block.textColor || state.textColor,
      fontSize: block.fontSize ? `${block.fontSize}px` : `${state.fontSize.body}px`,
      fontFamily: state.fontFamily.body,
    };

    switch (block.type) {
      case 'company-info':
        return (
          <div style={blockStyle} className="p-4">
            <h3 className="font-bold" style={{ fontSize: `${state.fontSize.heading}px`, fontFamily: state.fontFamily.heading }}>
              Twoja Firma B.V.
            </h3>
            <p className="text-sm mt-1">Adres: Hoofdstraat 123</p>
            <p className="text-sm">1234 AB Amsterdam</p>
            <p className="text-sm">BTW: NL123456789B01</p>
            <p className="text-sm">KVK: 12345678</p>
          </div>
        );

      case 'client-info':
        return (
          <div style={blockStyle} className="p-4">
            <h4 className="font-semibold" style={{ fontSize: `${state.fontSize.heading - 2}px` }}>
              Klient:
            </h4>
            <p className="text-sm mt-1">Klient XYZ B.V.</p>
            <p className="text-sm">Kerkstraat 456</p>
            <p className="text-sm">5678 CD Rotterdam</p>
          </div>
        );

      case 'invoice-header':
        return (
          <div 
            style={{ 
              background: `linear-gradient(to right, ${state.headerGradientStart}, ${state.headerGradientEnd})`,
              color: '#ffffff',
            }} 
            className="p-6"
          >
            <h1 className="text-3xl font-bold" style={{ fontFamily: state.fontFamily.heading }}>
              FAKTURA
            </h1>
            <div className="mt-2 text-sm">
              <p>Numer: INV-2025-001</p>
              <p>Data: {new Date().toLocaleDateString('pl-PL')}</p>
              <p>Termin płatności: {new Date(Date.now() + 14*24*60*60*1000).toLocaleDateString('pl-PL')}</p>
            </div>
          </div>
        );

      case 'items-table':
        return (
          <div style={{ ...blockStyle, padding: 0 }} className="overflow-hidden">
            <table className="w-full text-sm">
              <thead style={{ 
                background: `linear-gradient(to right, ${state.primaryColorStart}, ${state.primaryColorEnd})`,
                color: '#ffffff',
              }}>
                <tr>
                  <th className="p-2 text-left">Pozycja</th>
                  <th className="p-2 text-right">Ilość</th>
                  <th className="p-2 text-right">Cena</th>
                  <th className="p-2 text-right">Suma</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b" style={{ borderColor: state.borderColor }}>
                  <td className="p-2">Roboty budowlane - tydzień 1</td>
                  <td className="p-2 text-right">40 godz.</td>
                  <td className="p-2 text-right">€45,00</td>
                  <td className="p-2 text-right">€1.800,00</td>
                </tr>
                <tr className="border-b" style={{ borderColor: state.borderColor }}>
                  <td className="p-2">Materiały budowlane</td>
                  <td className="p-2 text-right">1 szt.</td>
                  <td className="p-2 text-right">€350,00</td>
                  <td className="p-2 text-right">€350,00</td>
                </tr>
              </tbody>
            </table>
          </div>
        );

      case 'totals':
        return (
          <div style={blockStyle} className="p-4">
            <div className="flex justify-end">
              <div className="w-64">
                <div className="flex justify-between py-1">
                  <span>Suma netto:</span>
                  <span>€2.150,00</span>
                </div>
                <div className="flex justify-between py-1">
                  <span>BTW 21%:</span>
                  <span>€451,50</span>
                </div>
                <div 
                  className="flex justify-between py-2 mt-2 font-bold text-lg border-t-2"
                  style={{ 
                    borderColor: state.borderColor,
                    background: `linear-gradient(to right, ${state.accentColorStart}, ${state.accentColorEnd})`,
                    color: '#ffffff',
                    padding: '8px',
                    borderRadius: '4px',
                  }}
                >
                  <span>SUMA BRUTTO:</span>
                  <span>€2.601,50</span>
                </div>
              </div>
            </div>
          </div>
        );

      case 'payment-info':
        return (
          <div style={blockStyle} className="p-4">
            <h4 className="font-semibold mb-2" style={{ fontSize: `${state.fontSize.heading - 2}px` }}>
              Dane do przelewu:
            </h4>
            <p className="text-sm">Bank: ING Bank</p>
            <p className="text-sm">IBAN: NL12 INGB 0001 2345 67</p>
            <p className="text-sm">BIC: INGBNL2A</p>
            <p className="text-sm mt-2">Prosimy o przelew w ciągu 14 dni.</p>
          </div>
        );

      case 'notes':
        return (
          <div style={blockStyle} className="p-4 italic text-sm">
            <p>Uwagi: Dziękujemy za współpracę!</p>
          </div>
        );

      case 'footer':
        return (
          <div 
            style={{ 
              ...blockStyle, 
              borderTop: `2px solid ${state.borderColor}`,
            }} 
            className="p-3 text-center text-xs"
          >
            <p>Twoja Firma B.V. | Hoofdstraat 123, 1234 AB Amsterdam</p>
            <p>Tel: +31 20 123 4567 | Email: info@twojafirma.nl | www.twojafirma.nl</p>
          </div>
        );

      default:
        return (
          <div style={blockStyle} className="p-4">
            <p className="text-sm text-gray-500">Blok: {block.label}</p>
          </div>
        );
    }
  };

  return (
    <div className="flex items-center justify-center p-4 min-h-full bg-gray-100">
      <div
        style={{
          width: `${dimensions.width}px`,
          height: `${dimensions.height}px`,
          backgroundColor: state.backgroundColor,
          color: state.textColor,
          position: 'relative',
        }}
        className="shadow-2xl bg-white overflow-auto"
      >
        {/* Logo */}
        {state.showLogo && state.logoUrl && (
          <div
            style={{
              position: 'absolute',
              top: `${state.logoY}px`,
              left: state.logoPosition === 'center' 
                ? '50%' 
                : state.logoPosition === 'right'
                  ? `${dimensions.width - state.logoWidth - 20}px`
                  : `${state.logoX}px`,
              transform: state.logoPosition === 'center' ? 'translateX(-50%)' : 'none',
              width: `${state.logoWidth}px`,
              height: `${state.logoHeight}px`,
              opacity: state.logoOpacity / 100,
              zIndex: 10,
            }}
          >
            <img
              src={state.logoUrl}
              alt="Logo"
              className="w-full h-full object-contain"
            />
          </div>
        )}

        {/* Invoice Blocks */}
        <div className="relative z-0">
          {visibleBlocks.map((block) => (
            <div key={block.id} className="border-b" style={{ borderColor: state.borderColor }}>
              {renderBlockContent(block)}
            </div>
          ))}

          {/* Warning Box (after all blocks, before footer) */}
          {state.warningBox.enabled && (
            <div
              style={{
                backgroundColor: state.warningBox.backgroundColor,
                color: state.warningBox.textColor,
                border: `2px solid ${state.warningBox.textColor}20`,
              }}
              className="p-4 mx-4 my-4 rounded-lg"
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl">{state.warningBox.icon}</span>
                <p className="text-sm font-bold flex-1">{state.warningBox.text}</p>
              </div>
            </div>
          )}
        </div>

        {/* QR Code */}
        {state.qrCode.enabled && qrCodeImage && (
          <div
            style={{
              position: 'absolute',
              top: state.qrCode.position.startsWith('top') ? '20px' : 'auto',
              bottom: state.qrCode.position.startsWith('bottom') ? '20px' : 'auto',
              left: state.qrCode.position.endsWith('left') ? '20px' : 'auto',
              right: state.qrCode.position.endsWith('right') ? '20px' : 'auto',
              zIndex: 15,
            }}
          >
            <img
              src={qrCodeImage}
              alt="QR Code"
              style={{
                width: `${state.qrCode.size}px`,
                height: `${state.qrCode.size}px`,
                border: '2px solid #e5e7eb',
                borderRadius: '8px',
                backgroundColor: '#ffffff',
                padding: '4px',
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default LiveInvoicePreview;
