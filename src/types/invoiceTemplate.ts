/**
 * INVOICE TEMPLATE TYPES
 * Typy dla wizualnego buildera layoutów faktur
 */

export type InvoiceBlockType = 
  | 'company-info'       // Logo + dane firmy
  | 'client-info'        // Dane klienta
  | 'invoice-header'     // Nr faktury, data, termin
  | 'items-table'        // Tabela pozycji (produkty/usługi)
  | 'totals'             // Podsumowanie (netto, VAT, brutto)
  | 'payment-info'       // Informacje o płatności
  | 'notes'              // Uwagi/notatki
  | 'footer';            // Stopka

export interface InvoiceBlock {
  id: string;
  type: InvoiceBlockType;
  label: string;
  visible: boolean;
  order: number;
  align?: 'left' | 'center' | 'right'; // NEW: Block alignment
  styles?: {
    backgroundColor?: string;
    textColor?: string;
    fontSize?: number;
    fontFamily?: string;
    padding?: string;
    borderColor?: string;
    borderWidth?: string;
  };
}

export interface InvoiceTemplateLayout {
  id: string;
  name: string;
  description?: string;
  blocks: InvoiceBlock[];
  pageSize: 'A4' | 'Letter';
  orientation: 'portrait' | 'landscape';
  colors: {
    primary: string;
    secondary: string;
    accent?: string;
    text: string;
    background: string;
    border?: string;
  };
  fonts: {
    heading: string;
    body: string;
    size: {
      heading: number;
      body: number;
      small: number;
    };
  };
  logo?: {
    url?: string;
    position: 'left' | 'center' | 'right';
    x?: number;  // X position for drag & drop (in px)
    y?: number;  // Y position for drag & drop (in px)
    size: { width: number; height: number };  // Changed from 'small' | 'medium' | 'large'
    opacity?: number;  // 0-100%
    showInHeader: boolean;
  };
  // NEW: Watermark (logo w tle jako tło pod całą fakturą)
  watermark?: {
    url?: string;
    opacity: number;  // 5-50%
    size: number;  // 100-600px
    rotation: number;  // -45 to 45 degrees
  };
  // NEW: QR Code settings (layout only, data from Invoice.payment_qr_payload)
  // UPDATED 2025-11-07: position now relative to Payment Details block!
  qrCode?: {
    enabled: boolean;
    position: 'payment-right' | 'payment-below' | 'top-right' | 'bottom-right'; // payment-* = relative to payment block
    size: number; // 80-200px
  };
  // NEW: Warning Box (styling only, text from Invoice.vat_note)
  warningBox?: {
    enabled: boolean;
    backgroundColor: string;
    textColor: string;
    icon: string; // emoji like ⚠️
  };
  // NEW: Social Media (TODO: move to Company - these are company-wide!)
  socialMedia?: {
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
  // NEW: Decorative Waves (2025-11-07)
  decorativeWaves?: {
    enabled: boolean;
    position: 'top' | 'bottom' | 'both';
    opacity: number; // 0-100
    color: string;
  };
  // NEW: Product Image Frames (2025-11-07)
  imageFrames?: {
    borderStyle: 'none' | 'solid' | 'dashed' | 'dotted' | 'double';
    borderWidth: number; // 1-5px
    borderColor: string;
    borderRadius: number; // 0-20px
    shadow: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface InvoiceTemplate {
  id: string;
  name: string;
  description?: string;
  layout: InvoiceTemplateLayout;
  isPublic: boolean;
  companyId?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Default blocks dla nowego szablonu
export const DEFAULT_INVOICE_BLOCKS: InvoiceBlock[] = [
  {
    id: 'company-info',
    type: 'company-info',
    label: 'Dane firmy',
    visible: true,
    order: 1
  },
  {
    id: 'client-info',
    type: 'client-info',
    label: 'Dane klienta',
    visible: true,
    order: 2
  },
  {
    id: 'invoice-header',
    type: 'invoice-header',
    label: 'Nagłówek faktury',
    visible: true,
    order: 3
  },
  {
    id: 'items-table',
    type: 'items-table',
    label: 'Tabela pozycji',
    visible: true,
    order: 4
  },
  {
    id: 'totals',
    type: 'totals',
    label: 'Podsumowanie',
    visible: true,
    order: 5
  },
  {
    id: 'payment-info',
    type: 'payment-info',
    label: 'Informacje o płatności',
    visible: true,
    order: 6
  },
  {
    id: 'notes',
    type: 'notes',
    label: 'Uwagi',
    visible: false,
    order: 7
  },
  {
    id: 'footer',
    type: 'footer',
    label: 'Stopka',
    visible: true,
    order: 8
  }
];
