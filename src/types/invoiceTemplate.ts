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
