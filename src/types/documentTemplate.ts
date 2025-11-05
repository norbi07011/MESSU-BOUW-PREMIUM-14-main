/**
 * Document Template System - Types
 * System szablonów dokumentów biznesowych (umowy, CV, formularze, raporty, etc.)
 */

export type DocumentCategory =
  | 'employment'      // 💼 Zatrudnienie (umowy, CV, podania)
  | 'government'      // 🏛️ Rząd/KVK (rejestracja, zmiany, zamknięcie)
  | 'tax'            // 💰 Podatki (BTW, income tax, deklaracje)
  | 'business'       // 📧 Biznes (listy, oferty, umowy)
  | 'legal'          // ⚖️ Prawne (NDA, privacy, regulaminy)
  | 'hr'             // 👥 HR/Personel (opisy stanowisk, urlopy, oceny)
  | 'marketing'      // 📢 Marketing (reklamy, opisy produktów, prasówki)
  | 'reports';       // 📊 Raporty (projekty, finanse, roczne)

export type BlockType =
  | 'header'         // Nagłówek dokumentu (logo, dane firmy)
  | 'title'          // Tytuł główny
  | 'text'           // Blok tekstowy (paragrafy)
  | 'signature'      // Podpis
  | 'footer'         // Stopka
  | 'table'          // Tabela
  | 'list'           // Lista punktowana/numerowana
  | 'field';         // Pole dynamiczne [NAZWA], [DATA], etc.

export type TextAlignment = 'left' | 'center' | 'right' | 'justify';
export type FontWeight = 'normal' | 'bold';
export type FontStyle = 'normal' | 'italic';

export interface DocumentStyles {
  // Typography
  fontFamily: string;
  fontSize: number;
  lineHeight: number;
  
  // Colors
  textColor: string;
  backgroundColor: string;
  headerColor: string;
  accentColor: string;
  
  // Spacing
  marginTop: number;
  marginBottom: number;
  marginLeft: number;
  marginRight: number;
  
  // Page
  pageSize: 'A4' | 'Letter';
  orientation: 'portrait' | 'landscape';
}

export interface DocumentBlock {
  id: string;
  type: BlockType;
  content: string; // HTML lub tekst z placeholderami [NAZWA], [DATA], etc.
  
  // Styling
  alignment?: TextAlignment;
  fontWeight?: FontWeight;
  fontStyle?: FontStyle;
  fontSize?: number;
  color?: string;
  
  // Conditional
  isEditable: boolean;
  isRequired: boolean;
  placeholder?: string;
}

export interface TemplateField {
  key: string;           // np. "COMPANY_NAME", "DATE", "EMPLOYEE_NAME"
  label: string;         // "Nazwa firmy", "Data", "Imię i nazwisko pracownika"
  type: 'text' | 'date' | 'number' | 'email' | 'textarea';
  defaultValue?: string;
  isRequired: boolean;
}

export interface DocumentTemplate {
  id: string;
  name: string;
  category: DocumentCategory;
  description: string;
  language: 'nl' | 'pl' | 'en';
  
  // Content
  blocks: DocumentBlock[];
  fields: TemplateField[];
  
  // Styling
  styles: DocumentStyles;
  
  // Metadata
  tags: string[];
  createdAt: string;
  updatedAt: string;
  isCustom: boolean; // true jeśli użytkownik stworzył, false jeśli preset
}

export const DEFAULT_DOCUMENT_STYLES: DocumentStyles = {
  fontFamily: 'Arial',
  fontSize: 12,
  lineHeight: 1.5,
  textColor: '#000000',
  backgroundColor: '#ffffff',
  headerColor: '#1e40af',
  accentColor: '#0ea5e9',
  marginTop: 20,
  marginBottom: 20,
  marginLeft: 25,
  marginRight: 25,
  pageSize: 'A4',
  orientation: 'portrait',
};

// Helper function - generuj ID dla bloku
export function generateBlockId(): string {
  return `block-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Helper function - merge template fields z danymi użytkownika
export function mergeTemplateFields(
  content: string,
  fieldValues: Record<string, string>
): string {
  let merged = content;
  Object.entries(fieldValues).forEach(([key, value]) => {
    const regex = new RegExp(`\\[${key}\\]`, 'g');
    merged = merged.replace(regex, value);
  });
  return merged;
}

// Helper function - wyodrębnij wszystkie placeholder fields z contentu
export function extractPlaceholders(content: string): string[] {
  const regex = /\[([A-Z_]+)\]/g;
  const matches = content.matchAll(regex);
  return Array.from(matches, m => m[1]);
}
