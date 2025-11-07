/**
 * LiveInvoicePreview Component
 * 
 * Renders live preview of invoice template with all blocks, colors, fonts, and logo.
 * A4 dimensions: 595×842px (1px = 1pt at 72dpi)
 * Real-time updates from EditorState.
 */

import React, { useState, useEffect } from 'react';
import { 
  FacebookLogo, 
  LinkedinLogo, 
  InstagramLogo, 
  TwitterLogo,
  YoutubeLogo,
  TiktokLogo,
  WhatsappLogo,
  TelegramLogo,
  GithubLogo,
  EnvelopeSimple,
  Globe,
  Phone
} from '@phosphor-icons/react';
import { generateQRCode } from '@/lib/qrCodeGenerator';

interface InvoiceBlock {
  id: string;
  type: string;
  label: string;
  visible: boolean;
  order: number;
  align?: 'left' | 'center' | 'right';
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
  watermarkUrl?: string;
  watermarkOpacity: number;
  watermarkSize: number;
  watermarkRotation: number;
  qrCode: {
    enabled: boolean;
    position: 'payment-right' | 'payment-below' | 'top-right' | 'bottom-right'; // UPDATED: relative to payment
    size: number;
  };
  warningBox: {
    enabled: boolean;
    backgroundColor: string;
    textColor: string;
    icon: string;
  };
  socialMedia: {
    enabled: boolean;
    facebook?: string;
    linkedin?: string;
    instagram?: string;
    twitter?: string;
    youtube?: string;
    tiktok?: string;
    whatsapp?: string;
    telegram?: string;
    github?: string;
    email?: string;
    website?: string;
    phone?: string;
  };
  pageSize: 'A4' | 'Letter';
  orientation: 'portrait' | 'landscape';
  decorativeWaves: {
    enabled: boolean;
    position: 'top' | 'bottom' | 'both';
    opacity: number;
    color: string;
  };
  imageFrames: {
    borderStyle: 'none' | 'solid' | 'dashed' | 'dotted' | 'double';
    borderWidth: number;
    borderColor: string;
    borderRadius: number;
    shadow: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  };
}

interface LiveInvoicePreviewProps {
  state: EditorState;
  onBlockClick?: (blockId: string) => void; // NEW: Click to highlight callback
}

const LiveInvoicePreview: React.FC<LiveInvoicePreviewProps> = ({ state, onBlockClick }) => {
  const [qrCodeImage, setQrCodeImage] = useState<string>('');

  // Generate QR code for DEMO purposes (in real invoice, data comes from Invoice.payment_qr_payload)
  const DEMO_QR_DATA = 'DEMO-PAYMENT-LINK-INV-001';
  
  useEffect(() => {
    if (state.qrCode.enabled) {
      generateQRCode(DEMO_QR_DATA, { size: state.qrCode.size })
        .then(setQrCodeImage)
        .catch(() => setQrCodeImage(''));
    } else {
      setQrCodeImage('');
    }
  }, [state.qrCode.enabled, state.qrCode.size]);

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
        // Helper: Get shadow CSS based on shadow setting
        const getShadowStyle = (shadow: string) => {
          const shadows = {
            none: 'none',
            sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
            md: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
            lg: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
            xl: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
          };
          return shadows[shadow as keyof typeof shadows] || shadows.none;
        };

        return (
          <div style={{ ...blockStyle, padding: 0 }} className="overflow-hidden">
            <table className="w-full text-sm">
              <thead style={{ 
                background: `linear-gradient(to right, ${state.primaryColorStart}, ${state.primaryColorEnd})`,
                color: '#ffffff',
              }}>
                <tr>
                  <th className="p-2 text-left">Zdjęcie</th>
                  <th className="p-2 text-left">Pozycja</th>
                  <th className="p-2 text-right">Ilość</th>
                  <th className="p-2 text-right">Cena</th>
                  <th className="p-2 text-right">Suma</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b" style={{ borderColor: state.borderColor }}>
                  <td className="p-2">
                    <div
                      style={{
                        width: '48px',
                        height: '48px',
                        borderStyle: state.imageFrames.borderStyle,
                        borderWidth: state.imageFrames.borderStyle !== 'none' ? `${state.imageFrames.borderWidth}px` : '0',
                        borderColor: state.imageFrames.borderColor,
                        borderRadius: `${state.imageFrames.borderRadius}px`,
                        boxShadow: getShadowStyle(state.imageFrames.shadow),
                        backgroundColor: '#f3f4f6',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <span className="text-xl">🏗️</span>
                    </div>
                  </td>
                  <td className="p-2">Roboty budowlane - tydzień 1</td>
                  <td className="p-2 text-right">40 godz.</td>
                  <td className="p-2 text-right">€45,00</td>
                  <td className="p-2 text-right">€1.800,00</td>
                </tr>
                <tr className="border-b" style={{ borderColor: state.borderColor }}>
                  <td className="p-2">
                    <div
                      style={{
                        width: '48px',
                        height: '48px',
                        borderStyle: state.imageFrames.borderStyle,
                        borderWidth: state.imageFrames.borderStyle !== 'none' ? `${state.imageFrames.borderWidth}px` : '0',
                        borderColor: state.imageFrames.borderColor,
                        borderRadius: `${state.imageFrames.borderRadius}px`,
                        boxShadow: getShadowStyle(state.imageFrames.shadow),
                        backgroundColor: '#f3f4f6',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <span className="text-xl">📦</span>
                    </div>
                  </td>
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
            {/* Payment Details + QR Code - NOWA LOGIKA! */}
            <div className="flex gap-4 items-start">
              {/* Payment Info (left/main) */}
              <div className={state.qrCode.enabled && state.qrCode.position === 'payment-right' ? 'flex-1' : 'w-full'}>
                <h4 className="font-semibold mb-2" style={{ fontSize: `${state.fontSize.heading - 2}px` }}>
                  Dane do przelewu:
                </h4>
                <p className="text-sm">Bank: ING Bank</p>
                <p className="text-sm">IBAN: NL12 INGB 0001 2345 67</p>
                <p className="text-sm">BIC: INGBNL2A</p>
                <p className="text-sm mt-2">Prosimy o przelew w ciągu 14 dni.</p>
              </div>

              {/* QR Code - OBOK payment info (right) */}
              {state.qrCode.enabled && state.qrCode.position === 'payment-right' && qrCodeImage && (
                <div className="flex-shrink-0">
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
                  <p className="text-xs text-center text-gray-500 mt-1">Zeskanuj aby zapłacić</p>
                </div>
              )}
            </div>

            {/* QR Code - POD payment info (below) */}
            {state.qrCode.enabled && state.qrCode.position === 'payment-below' && qrCodeImage && (
              <div className="mt-4 flex justify-center">
                <div className="text-center">
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
                      display: 'inline-block',
                    }}
                  />
                  <p className="text-xs text-gray-500 mt-2">Zeskanuj kod QR aby zapłacić</p>
                </div>
              </div>
            )}
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
          overflow: 'hidden',
        }}
        className="shadow-2xl bg-white"
      >
        {/* Watermark (logo w tle) - ZAWSZE WIDOCZNY */}
        {state.watermarkUrl && (
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: `translate(-50%, -50%) rotate(${state.watermarkRotation}deg)`,
              width: `${state.watermarkSize}px`,
              height: `${state.watermarkSize}px`,
              opacity: state.watermarkOpacity / 100,
              zIndex: 1,
              pointerEvents: 'none',
              filter: 'grayscale(100%)',
            }}
          >
            <img
              src={state.watermarkUrl}
              alt="Watermark"
              className="w-full h-full object-contain"
              style={{ userSelect: 'none' }}
            />
          </div>
        )}

        {/* Content Container - Scrollable */}
        <div 
          className="relative overflow-auto w-full h-full"
          style={{ zIndex: 2 }}
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

        {/* Invoice Blocks - INTERACTIVE: Click to highlight! */}
        <div className="relative z-0">
          {visibleBlocks.map((block) => (
            <div 
              key={block.id} 
              className="border-b cursor-pointer hover:bg-sky-50/30 transition-colors" 
              style={{ 
                borderColor: state.borderColor,
                textAlign: block.align || 'left',
              }}
              onClick={() => onBlockClick?.(block.id)}
              title={`Kliknij aby zaznaczyć blok: ${block.label}`}
            >
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
                <p className="text-sm font-bold flex-1">
                  ⚠️ REVERSE CHARGE: BTW verlegd naar de afnemer volgens artikel 12b Wet OB
                  <span className="block text-xs font-normal mt-1 opacity-70">
                    (W prawdziwej fakturze tekst pochodzi z pola "VAT Note")
                  </span>
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Decorative Waves - Top */}
        {state.decorativeWaves.enabled && (state.decorativeWaves.position === 'top' || state.decorativeWaves.position === 'both') && (
          <svg
            viewBox="0 0 1440 320"
            className="absolute top-0 left-0 w-full pointer-events-none"
            style={{ 
              opacity: state.decorativeWaves.opacity / 100,
              zIndex: 5,
              height: '80px',
            }}
          >
            <path
              fill={state.decorativeWaves.color}
              d="M0,192L48,197.3C96,203,192,213,288,229.3C384,245,480,267,576,250.7C672,235,768,181,864,181.3C960,181,1056,235,1152,234.7C1248,235,1344,181,1392,154.7L1440,128L1440,0L1392,0C1344,0,1248,0,1152,0C1056,0,960,0,864,0C768,0,672,0,576,0C480,0,384,0,288,0C192,0,96,0,48,0L0,0Z"
            />
          </svg>
        )}

        {/* Decorative Waves - Bottom */}
        {state.decorativeWaves.enabled && (state.decorativeWaves.position === 'bottom' || state.decorativeWaves.position === 'both') && (
          <svg
            viewBox="0 0 1440 320"
            className="absolute bottom-0 left-0 w-full pointer-events-none"
            style={{ 
              opacity: state.decorativeWaves.opacity / 100,
              zIndex: 5,
              height: '80px',
            }}
          >
            <path
              fill={state.decorativeWaves.color}
              d="M0,192L48,197.3C96,203,192,213,288,229.3C384,245,480,267,576,250.7C672,235,768,181,864,181.3C960,181,1056,235,1152,234.7C1248,235,1344,181,1392,154.7L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
            />
          </svg>
        )}

        {/* Social Media Icons - wyświetlane w jednej linii na dole faktury */}
        {state.socialMedia.enabled && (
          <div className="flex justify-center items-center gap-3 py-4 border-t" style={{ borderColor: state.borderColor }}>
            {state.socialMedia.facebook && <FacebookLogo size={20} weight="fill" className="text-blue-600" />}
            {state.socialMedia.linkedin && <LinkedinLogo size={20} weight="fill" className="text-blue-700" />}
            {state.socialMedia.instagram && <InstagramLogo size={20} weight="fill" className="text-pink-600" />}
            {state.socialMedia.twitter && <TwitterLogo size={20} weight="fill" className="text-sky-500" />}
            {state.socialMedia.youtube && <YoutubeLogo size={20} weight="fill" className="text-red-600" />}
            {state.socialMedia.tiktok && <TiktokLogo size={20} weight="fill" className="text-gray-900" />}
            {state.socialMedia.whatsapp && <WhatsappLogo size={20} weight="fill" className="text-green-600" />}
            {state.socialMedia.telegram && <TelegramLogo size={20} weight="fill" className="text-blue-500" />}
            {state.socialMedia.github && <GithubLogo size={20} weight="fill" className="text-gray-900" />}
            {state.socialMedia.email && <EnvelopeSimple size={20} weight="fill" className="text-gray-700" />}
            {state.socialMedia.phone && <Phone size={20} weight="fill" className="text-gray-700" />}
            {state.socialMedia.website && <Globe size={20} weight="fill" className="text-gray-700" />}
          </div>
        )}

        {/* QR Code - FLOATING (tylko dla top-right/bottom-right) */}
        {state.qrCode.enabled && 
         qrCodeImage && 
         (state.qrCode.position === 'top-right' || state.qrCode.position === 'bottom-right') && (
          <div
            style={{
              position: 'absolute',
              top: state.qrCode.position === 'top-right' ? '20px' : 'auto',
              bottom: state.qrCode.position === 'bottom-right' ? '20px' : 'auto',
              right: '20px',
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
        </div> {/* Close Content Container */}
      </div>
    </div>
  );
};

export default LiveInvoicePreview;
