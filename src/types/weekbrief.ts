// Typy dla systemu Weekbrief - Godziny Pracy

export interface EmployerContactInfo {
  name: string;
  address: string;
  postalCode: string;
  city: string;
  country: string;
  phone: string;
  email: string;
  website?: string;
  kvkNumber?: string;
  btwNumber?: string;
}

export interface Employer {
  id: string;
  name: string;
  logo?: string;
  contactInfo: EmployerContactInfo;
  signatureSettings: {
    requireSignature: boolean;
    signaturePosition: 'bottom' | 'right' | 'custom';
    signatureText?: string;
  };
  defaultTemplate?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface WeekbriefColumn {
  id: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'time' | 'select';
  width?: string;
  required?: boolean;
  options?: string[];
}

export interface WeekbriefTemplateConfig {
  size: 'A4' | 'A5' | 'A3';
  pageSize?: string; // dla template library (np. "A4", "Letter")
  orientation: 'portrait' | 'landscape';
  columns: WeekbriefColumn[];
  rows: number;
  showLogo: boolean;
  showHeader: boolean;
  headerFields: Array<{
    label: string;
    field: string;
    required: boolean;
  }>;
  showTotalRow: boolean;
  totalRowLabel: string;
  showSignature: boolean;
  signatureLabel: string;
  signatureRows: number;
}

export interface WeekbriefTemplate {
  id: string;
  name: string;
  description?: string; // dla template library
  employerId?: string;
  isPublic: boolean;
  config: WeekbriefTemplateConfig;
  styles?: {
    headerColor?: string;
    borderColor?: string;
    fontSize?: number;
    fontFamily?: string;
    // NEW: Watermark logo (background)
    watermarkUrl?: string;
    watermarkOpacity?: number;
    watermarkSize?: number;
    watermarkRotation?: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface WeekbriefEntry {
  [columnId: string]: any;
}

export interface WeekbriefInstance {
  id: string;
  employerId: string;
  employer: Employer;
  templateId: string;
  employeeName: string;
  weekNumber: number | string;
  year: number;
  dateFrom: Date;
  dateTo: Date;
  weekStartDate?: string;
  entries: WeekbriefEntry[];
  totals?: {
    [columnId: string]: number;
  };
  signature?: {
    signedBy?: string;
    signedAt?: Date;
    signatureImage?: string;
  };
  status: 'draft' | 'completed' | 'signed' | 'submitted';
  pdfUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}
