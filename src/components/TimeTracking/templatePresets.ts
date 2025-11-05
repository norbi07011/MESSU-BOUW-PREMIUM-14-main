/**
 * BIBLIOTEKA GOTOWYCH SZABLONÓW - Template Library
 * Predefiniowane układy dla różnych branż i potrzeb
 */

import type { WeekbriefTemplate, WeekbriefColumn } from '@/types/weekbrief';

// ============================================
// KATEGORIA: BUDOWA (Construction)
// ============================================

export const CLASSIC_5DAY_CONSTRUCTION: WeekbriefTemplate = {
  id: 'classic-5day-construction',
  name: 'Classic 5-Day (Pon-Pt)',
  description: 'Standardowy tydzień pracy (Pon-Pt) dla budowy z lokalizacją',
  employerId: 'default',
  isPublic: true,
  config: {
    size: 'A4',
    pageSize: 'A4',
    orientation: 'portrait',
    columns: [
      { id: 'project', label: 'Projekt', type: 'text', width: '25%', required: true },
      { id: 'location', label: 'Lokalizacja', type: 'text', width: '20%', required: false },
      { id: 'mon', label: 'Pon', type: 'number', width: '9%', required: false },
      { id: 'tue', label: 'Wt', type: 'number', width: '9%', required: false },
      { id: 'wed', label: 'Śr', type: 'number', width: '9%', required: false },
      { id: 'thu', label: 'Czw', type: 'number', width: '9%', required: false },
      { id: 'fri', label: 'Pt', type: 'number', width: '9%', required: false },
      { id: 'total', label: 'Suma', type: 'number', width: '10%', required: false }
    ],
    rows: 15,
    showLogo: true,
    showHeader: true,
    headerFields: [
      { label: 'Pracownik', field: 'employeeName', required: true },
      { label: 'Tydzień', field: 'weekNumber', required: true }
    ],
    showTotalRow: true,
    totalRowLabel: 'Suma godzin',
    showSignature: true,
    signatureLabel: 'Podpis kierownika',
    signatureRows: 1
  },
  styles: {
    headerColor: '#0ea5e9',
    borderColor: '#e5e7eb',
    fontSize: 10,
    fontFamily: 'Arial, sans-serif'
  },
  createdAt: new Date(),
  updatedAt: new Date()
};

export const FULL_WEEK_CONSTRUCTION: WeekbriefTemplate = {
  id: 'full-week-construction',
  name: 'Full Week (Pon-Niedz)',
  description: 'Pełny tydzień pracy z weekendem (7 dni) w orientacji poziomej',
  employerId: 'default',
  isPublic: true,
  config: {
    size: 'A4',
    pageSize: 'A4',
    orientation: 'landscape',
    columns: [
      { id: 'project', label: 'Projekt', type: 'text', width: '20%', required: true },
      { id: 'mon', label: 'Pon', type: 'number', width: '10%', required: false },
      { id: 'tue', label: 'Wt', type: 'number', width: '10%', required: false },
      { id: 'wed', label: 'Śr', type: 'number', width: '10%', required: false },
      { id: 'thu', label: 'Czw', type: 'number', width: '10%', required: false },
      { id: 'fri', label: 'Pt', type: 'number', width: '10%', required: false },
      { id: 'sat', label: 'Sob', type: 'number', width: '10%', required: false },
      { id: 'sun', label: 'Niedz', type: 'number', width: '10%', required: false },
      { id: 'total', label: 'Suma', type: 'number', width: '10%', required: false }
    ],
    rows: 12,
    showLogo: true,
    showHeader: true,
    headerFields: [
      { label: 'Pracownik', field: 'employeeName', required: true },
      { label: 'Okres', field: 'weekRange', required: true }
    ],
    showTotalRow: true,
    totalRowLabel: 'Razem godzin',
    showSignature: true,
    signatureLabel: 'Podpis',
    signatureRows: 1
  },
  styles: {
    headerColor: '#0ea5e9',
    borderColor: '#cbd5e1',
    fontSize: 9,
    fontFamily: 'Arial, sans-serif'
  },
  createdAt: new Date(),
  updatedAt: new Date()
};

// ============================================
// KATEGORIA: IT / Consulting
// ============================================

export const PROJECT_HOURS_IT: WeekbriefTemplate = {
  id: 'project-hours-it',
  name: 'Project Hours (IT/Consulting)',
  description: 'Rozliczanie godzin projektowych z klientem, zadaniem i stawką',
  employerId: 'default',
  isPublic: true,
  config: {
    size: 'A4',
    pageSize: 'A4',
    orientation: 'portrait',
    columns: [
      { id: 'client', label: 'Klient', type: 'text', width: '20%', required: true },
      { id: 'project', label: 'Projekt', type: 'text', width: '25%', required: true },
      { id: 'task', label: 'Zadanie', type: 'text', width: '25%', required: false },
      { id: 'hours', label: 'Godziny', type: 'number', width: '10%', required: true },
      { id: 'rate', label: 'Stawka €', type: 'number', width: '10%', required: false },
      { id: 'total', label: 'Wartość €', type: 'number', width: '10%', required: false }
    ],
    rows: 20,
    showLogo: true,
    showHeader: true,
    headerFields: [
      { label: 'Konsultant', field: 'employeeName', required: true },
      { label: 'Miesiąc', field: 'month', required: true }
    ],
    showTotalRow: true,
    totalRowLabel: 'Suma',
    showSignature: false,
    signatureLabel: '',
    signatureRows: 0
  },
  styles: {
    headerColor: '#3b82f6',
    borderColor: '#e5e7eb',
    fontSize: 10,
    fontFamily: 'Roboto, sans-serif'
  },
  createdAt: new Date(),
  updatedAt: new Date()
};

export const MULTI_PROJECT_IT: WeekbriefTemplate = {
  id: 'multi-project-it',
  name: 'Multi-Project (wiele projektów dziennie)',
  description: 'Dzienny timesheet z 3 projektami jednocześnie, orientacja pozioma',
  employerId: 'default',
  isPublic: true,
  config: {
    size: 'A4',
    pageSize: 'A4',
    orientation: 'landscape',
    columns: [
      { id: 'date', label: 'Data', type: 'date', width: '12%', required: true },
      { id: 'project1', label: 'Projekt A', type: 'text', width: '15%', required: false },
      { id: 'hours1', label: 'H', type: 'number', width: '7%', required: false },
      { id: 'project2', label: 'Projekt B', type: 'text', width: '15%', required: false },
      { id: 'hours2', label: 'H', type: 'number', width: '7%', required: false },
      { id: 'project3', label: 'Projekt C', type: 'text', width: '15%', required: false },
      { id: 'hours3', label: 'H', type: 'number', width: '7%', required: false },
      { id: 'daily_total', label: 'Suma dnia', type: 'number', width: '10%', required: false },
      { id: 'notes', label: 'Uwagi', type: 'text', width: '12%', required: false }
    ],
    rows: 31,
    showLogo: true,
    showHeader: true,
    headerFields: [
      { label: 'Pracownik', field: 'employeeName', required: true },
      { label: 'Miesiąc', field: 'month', required: true }
    ],
    showTotalRow: true,
    totalRowLabel: 'Suma miesiąca',
    showSignature: true,
    signatureLabel: 'Podpis',
    signatureRows: 1
  },
  styles: {
    headerColor: '#6366f1',
    borderColor: '#d1d5db',
    fontSize: 8,
    fontFamily: 'Arial, sans-serif'
  },
  createdAt: new Date(),
  updatedAt: new Date()
};

// ============================================
// KATEGORIA: Transport / Logistics
// ============================================

export const HOURLY_RATE_TRANSPORT: WeekbriefTemplate = {
  id: 'hourly-rate-transport',
  name: 'Hourly Rate (stawka × godziny)',
  description: 'Rozliczanie transportu z trasą, czasem, stawką godzinową i kilometrami',
  employerId: 'default',
  isPublic: true,
  config: {
    size: 'A4',
    pageSize: 'A4',
    orientation: 'portrait',
    columns: [
      { id: 'route', label: 'Trasa', type: 'text', width: '30%', required: true },
      { id: 'start_time', label: 'Start', type: 'text', width: '10%', required: false },
      { id: 'end_time', label: 'Koniec', type: 'text', width: '10%', required: false },
      { id: 'hours', label: 'Godziny', type: 'number', width: '10%', required: true },
      { id: 'rate', label: 'Stawka €/h', type: 'number', width: '12%', required: true },
      { id: 'km', label: 'KM', type: 'number', width: '10%', required: false },
      { id: 'total', label: 'Kwota €', type: 'number', width: '18%', required: false }
    ],
    rows: 18,
    showLogo: true,
    showHeader: true,
    headerFields: [
      { label: 'Kierowca', field: 'employeeName', required: true },
      { label: 'Tydzień', field: 'weekNumber', required: true },
      { label: 'Samochód', field: 'vehicle', required: false }
    ],
    showTotalRow: true,
    totalRowLabel: 'Do wypłaty',
    showSignature: true,
    signatureLabel: 'Podpis kierowcy',
    signatureRows: 1
  },
  styles: {
    headerColor: '#f97316',
    borderColor: '#e5e7eb',
    fontSize: 10,
    fontFamily: 'Arial, sans-serif'
  },
  createdAt: new Date(),
  updatedAt: new Date()
};

// ============================================
// KATEGORIA: CONSULTING / USŁUGI
// ============================================

export const CONSULTING_BILLABLE: WeekbriefTemplate = {
  id: 'consulting-billable-hours',
  name: 'Consulting - Billable Hours',
  description: 'Śledzenie godzin fakturowanych wg klienta i typu aktywności',
  employerId: 'default',
  isPublic: true,
  config: {
    size: 'A4',
    pageSize: 'A4',
    orientation: 'portrait',
    columns: [
      { id: 'client', label: 'Klient', type: 'text', width: '20%', required: true },
      { id: 'activity', label: 'Rodzaj pracy', type: 'text', width: '20%', required: true },
      { id: 'rate', label: 'Stawka €/h', type: 'number', width: '10%', required: false },
      { id: 'hours', label: 'Godziny', type: 'number', width: '10%', required: false },
      { id: 'total', label: 'Suma €', type: 'number', width: '10%', required: false },
      { id: 'billable', label: 'Fakturowane', type: 'text', width: '10%', required: false },
      { id: 'notes', label: 'Notatki', type: 'text', width: '20%', required: false }
    ],
    rows: 20,
    showLogo: true,
    showHeader: true,
    headerFields: [
      { label: 'Konsultant', field: 'employeeName', required: true },
      { label: 'Okres', field: 'period', required: true }
    ],
    showTotalRow: true,
    totalRowLabel: 'Suma fakturowanych godzin',
    showSignature: true,
    signatureLabel: 'Podpis klienta',
    signatureRows: 1
  },
  styles: {
    headerColor: '#8b5cf6', // purple-500
    borderColor: '#e5e7eb',
    fontSize: 9,
    fontFamily: 'Arial, sans-serif'
  },
  createdAt: new Date(),
  updatedAt: new Date()
};

// ============================================
// KATEGORIA: SECURITY / OCHRONA
// ============================================

export const SECURITY_SHIFTS: WeekbriefTemplate = {
  id: 'security-shift-log',
  name: 'Security - Shift Log',
  description: 'Rejestr zmian dla ochrony z godziną rozpoczęcia/zakończenia',
  employerId: 'default',
  isPublic: true,
  config: {
    size: 'A4',
    pageSize: 'A4',
    orientation: 'portrait',
    columns: [
      { id: 'date', label: 'Data', type: 'date', width: '12%', required: true },
      { id: 'start', label: 'Początek', type: 'text', width: '10%', required: true },
      { id: 'end', label: 'Koniec', type: 'text', width: '10%', required: true },
      { id: 'location', label: 'Obiekt', type: 'text', width: '18%', required: true },
      { id: 'hours', label: 'Godziny', type: 'number', width: '10%', required: false },
      { id: 'night', label: 'Nocne', type: 'number', width: '10%', required: false },
      { id: 'incidents', label: 'Zdarzenia', type: 'text', width: '30%', required: false }
    ],
    rows: 15,
    showLogo: true,
    showHeader: true,
    headerFields: [
      { label: 'Ochroniarz', field: 'employeeName', required: true },
      { label: 'Tydzień', field: 'weekNumber', required: true }
    ],
    showTotalRow: true,
    totalRowLabel: 'Suma godzin',
    showSignature: true,
    signatureLabel: 'Podpis przełożonego',
    signatureRows: 1
  },
  styles: {
    headerColor: '#dc2626', // red-600
    borderColor: '#e5e7eb',
    fontSize: 9,
    fontFamily: 'Arial, sans-serif'
  },
  createdAt: new Date(),
  updatedAt: new Date()
};

// ============================================
// KATEGORIA: CATERING / GASTRO
// ============================================

export const CATERING_WEEKLY: WeekbriefTemplate = {
  id: 'catering-weekly-schedule',
  name: 'Catering - Weekly',
  description: 'Tygodniowy harmonogram dla gastronomii z podziałem na shift',
  employerId: 'default',
  isPublic: true,
  config: {
    size: 'A4',
    pageSize: 'A4',
    orientation: 'landscape',
    columns: [
      { id: 'shift', label: 'Zmiana', type: 'text', width: '12%', required: true },
      { id: 'mon', label: 'Pon', type: 'number', width: '11%', required: false },
      { id: 'tue', label: 'Wt', type: 'number', width: '11%', required: false },
      { id: 'wed', label: 'Śr', type: 'number', width: '11%', required: false },
      { id: 'thu', label: 'Czw', type: 'number', width: '11%', required: false },
      { id: 'fri', label: 'Pt', type: 'number', width: '11%', required: false },
      { id: 'sat', label: 'Sob', type: 'number', width: '11%', required: false },
      { id: 'sun', label: 'Niedz', type: 'number', width: '11%', required: false },
      { id: 'total', label: 'Suma', type: 'number', width: '11%', required: false }
    ],
    rows: 10,
    showLogo: true,
    showHeader: true,
    headerFields: [
      { label: 'Pracownik', field: 'employeeName', required: true },
      { label: 'Tydzień', field: 'weekNumber', required: true }
    ],
    showTotalRow: true,
    totalRowLabel: 'Suma godzin',
    showSignature: true,
    signatureLabel: 'Podpis managera',
    signatureRows: 1
  },
  styles: {
    headerColor: '#f97316', // orange-500
    borderColor: '#e5e7eb',
    fontSize: 9,
    fontFamily: 'Arial, sans-serif'
  },
  createdAt: new Date(),
  updatedAt: new Date()
};

// ============================================
// KATEGORIA: CLEANING / SPRZĄTANIE
// ============================================

export const CLEANING_OBJECTS: WeekbriefTemplate = {
  id: 'cleaning-multi-objects',
  name: 'Cleaning - Multi Objects',
  description: 'Rejestr czasu sprzątania wielu obiektów (biura, mieszkania)',
  employerId: 'default',
  isPublic: true,
  config: {
    size: 'A4',
    pageSize: 'A4',
    orientation: 'portrait',
    columns: [
      { id: 'object', label: 'Obiekt', type: 'text', width: '25%', required: true },
      { id: 'address', label: 'Adres', type: 'text', width: '25%', required: false },
      { id: 'date', label: 'Data', type: 'date', width: '12%', required: true },
      { id: 'hours', label: 'Godziny', type: 'number', width: '10%', required: false },
      { id: 'tasks', label: 'Wykonane prace', type: 'text', width: '28%', required: false }
    ],
    rows: 18,
    showLogo: true,
    showHeader: true,
    headerFields: [
      { label: 'Pracownik', field: 'employeeName', required: true },
      { label: 'Okres', field: 'period', required: true }
    ],
    showTotalRow: true,
    totalRowLabel: 'Suma godzin',
    showSignature: true,
    signatureLabel: 'Podpis koordynatora',
    signatureRows: 1
  },
  styles: {
    headerColor: '#10b981', // green-500
    borderColor: '#e5e7eb',
    fontSize: 9,
    fontFamily: 'Arial, sans-serif'
  },
  createdAt: new Date(),
  updatedAt: new Date()
};

// ============================================
// KATEGORIA: HEALTHCARE / OPIEKA ZDROWOTNA
// ============================================

export const HEALTHCARE_SHIFTS: WeekbriefTemplate = {
  id: 'healthcare-shifts',
  name: 'Healthcare - Shifts',
  description: 'Rejestr zmian dla personelu medycznego (dzienne/nocne)',
  employerId: 'default',
  isPublic: true,
  config: {
    size: 'A4',
    pageSize: 'A4',
    orientation: 'portrait',
    columns: [
      { id: 'date', label: 'Data', type: 'date', width: '12%', required: true },
      { id: 'department', label: 'Oddział', type: 'text', width: '18%', required: true },
      { id: 'shift', label: 'Zmiana', type: 'text', width: '12%', required: true },
      { id: 'hours', label: 'Godziny', type: 'number', width: '10%', required: false },
      { id: 'overtime', label: 'Nadgodziny', type: 'number', width: '10%', required: false },
      { id: 'night', label: 'Nocne', type: 'number', width: '10%', required: false },
      { id: 'notes', label: 'Notatki', type: 'text', width: '28%', required: false }
    ],
    rows: 15,
    showLogo: true,
    showHeader: true,
    headerFields: [
      { label: 'Pracownik', field: 'employeeName', required: true },
      { label: 'Miesiąc', field: 'month', required: true }
    ],
    showTotalRow: true,
    totalRowLabel: 'Suma godzin',
    showSignature: true,
    signatureLabel: 'Podpis kierownika',
    signatureRows: 1
  },
  styles: {
    headerColor: '#06b6d4', // cyan-500
    borderColor: '#e5e7eb',
    fontSize: 9,
    fontFamily: 'Arial, sans-serif'
  },
  createdAt: new Date(),
  updatedAt: new Date()
};

// ============================================
// KATEGORIA: DELIVERY / KURIERZY
// ============================================

export const DELIVERY_ROUTES: WeekbriefTemplate = {
  id: 'delivery-daily-routes',
  name: 'Delivery - Daily Routes',
  description: 'Dziennik tras kurierskich z liczbą paczek i km',
  employerId: 'default',
  isPublic: true,
  config: {
    size: 'A4',
    pageSize: 'A4',
    orientation: 'portrait',
    columns: [
      { id: 'date', label: 'Data', type: 'date', width: '12%', required: true },
      { id: 'route', label: 'Trasa', type: 'text', width: '18%', required: true },
      { id: 'packages', label: 'Paczki', type: 'number', width: '10%', required: false },
      { id: 'km', label: 'KM', type: 'number', width: '10%', required: false },
      { id: 'hours', label: 'Godziny', type: 'number', width: '10%', required: false },
      { id: 'fuel', label: 'Paliwo €', type: 'number', width: '10%', required: false },
      { id: 'notes', label: 'Uwagi', type: 'text', width: '30%', required: false }
    ],
    rows: 15,
    showLogo: true,
    showHeader: true,
    headerFields: [
      { label: 'Kurier', field: 'employeeName', required: true },
      { label: 'Tydzień', field: 'weekNumber', required: true }
    ],
    showTotalRow: true,
    totalRowLabel: 'Suma tras',
    showSignature: true,
    signatureLabel: 'Podpis koordynatora',
    signatureRows: 1
  },
  styles: {
    headerColor: '#f59e0b', // amber-500
    borderColor: '#e5e7eb',
    fontSize: 9,
    fontFamily: 'Arial, sans-serif'
  },
  createdAt: new Date(),
  updatedAt: new Date()
};

// ============================================
// KATEGORIA: RETAIL / HANDEL
// ============================================

export const RETAIL_SHIFTS: WeekbriefTemplate = {
  id: 'retail-weekly-shifts',
  name: 'Retail - Weekly Shifts',
  description: 'Tygodniowy grafik dla sklepu z podziałem na shift (rano/popołudnie)',
  employerId: 'default',
  isPublic: true,
  config: {
    size: 'A4',
    pageSize: 'A4',
    orientation: 'landscape',
    columns: [
      { id: 'position', label: 'Stanowisko', type: 'text', width: '15%', required: true },
      { id: 'mon', label: 'Pon', type: 'number', width: '10%', required: false },
      { id: 'tue', label: 'Wt', type: 'number', width: '10%', required: false },
      { id: 'wed', label: 'Śr', type: 'number', width: '10%', required: false },
      { id: 'thu', label: 'Czw', type: 'number', width: '10%', required: false },
      { id: 'fri', label: 'Pt', type: 'number', width: '10%', required: false },
      { id: 'sat', label: 'Sob', type: 'number', width: '10%', required: false },
      { id: 'sun', label: 'Niedz', type: 'number', width: '10%', required: false },
      { id: 'total', label: 'Suma', type: 'number', width: '15%', required: false }
    ],
    rows: 12,
    showLogo: true,
    showHeader: true,
    headerFields: [
      { label: 'Pracownik', field: 'employeeName', required: true },
      { label: 'Tydzień', field: 'weekNumber', required: true }
    ],
    showTotalRow: true,
    totalRowLabel: 'Suma godzin',
    showSignature: true,
    signatureLabel: 'Podpis managera',
    signatureRows: 1
  },
  styles: {
    headerColor: '#ec4899', // pink-500
    borderColor: '#e5e7eb',
    fontSize: 9,
    fontFamily: 'Arial, sans-serif'
  },
  createdAt: new Date(),
  updatedAt: new Date()
};

// ============================================
// KATEGORIA: EDUCATION / EDUKACJA
// ============================================

export const EDUCATION_TUTORING: WeekbriefTemplate = {
  id: 'education-tutoring-log',
  name: 'Education - Tutoring Log',
  description: 'Rejestr korepetycji z uczniami (godziny, temat, progress)',
  employerId: 'default',
  isPublic: true,
  config: {
    size: 'A4',
    pageSize: 'A4',
    orientation: 'portrait',
    columns: [
      { id: 'student', label: 'Uczeń', type: 'text', width: '18%', required: true },
      { id: 'subject', label: 'Przedmiot', type: 'text', width: '15%', required: true },
      { id: 'date', label: 'Data', type: 'date', width: '12%', required: true },
      { id: 'hours', label: 'Godziny', type: 'number', width: '10%', required: false },
      { id: 'topic', label: 'Temat lekcji', type: 'text', width: '25%', required: false },
      { id: 'progress', label: 'Postęp', type: 'text', width: '20%', required: false }
    ],
    rows: 18,
    showLogo: true,
    showHeader: true,
    headerFields: [
      { label: 'Korepetytor', field: 'employeeName', required: true },
      { label: 'Miesiąc', field: 'month', required: true }
    ],
    showTotalRow: true,
    totalRowLabel: 'Suma godzin',
    showSignature: true,
    signatureLabel: 'Podpis koordynatora',
    signatureRows: 1
  },
  styles: {
    headerColor: '#6366f1', // indigo-500
    borderColor: '#e5e7eb',
    fontSize: 9,
    fontFamily: 'Arial, sans-serif'
  },
  createdAt: new Date(),
  updatedAt: new Date()
};

// ============================================
// KATEGORIA: WAREHOUSE / MAGAZYN
// ============================================

export const WAREHOUSE_OPERATIONS: WeekbriefTemplate = {
  id: 'warehouse-operations',
  name: 'Warehouse - Operations',
  description: 'Rejestr operacji magazynowych (załadunek/rozładunek)',
  employerId: 'default',
  isPublic: true,
  config: {
    size: 'A4',
    pageSize: 'A4',
    orientation: 'landscape',
    columns: [
      { id: 'date', label: 'Data', type: 'date', width: '10%', required: true },
      { id: 'operation', label: 'Operacja', type: 'text', width: '15%', required: true },
      { id: 'orders', label: 'Zamówienia', type: 'number', width: '10%', required: false },
      { id: 'pallets', label: 'Palety', type: 'number', width: '10%', required: false },
      { id: 'hours', label: 'Godziny', type: 'number', width: '10%', required: false },
      { id: 'overtime', label: 'Nadgodziny', type: 'number', width: '10%', required: false },
      { id: 'forklift', label: 'Wózek', type: 'text', width: '10%', required: false },
      { id: 'notes', label: 'Notatki', type: 'text', width: '25%', required: false }
    ],
    rows: 15,
    showLogo: true,
    showHeader: true,
    headerFields: [
      { label: 'Pracownik', field: 'employeeName', required: true },
      { label: 'Tydzień', field: 'weekNumber', required: true }
    ],
    showTotalRow: true,
    totalRowLabel: 'Suma godzin',
    showSignature: true,
    signatureLabel: 'Podpis kierownika',
    signatureRows: 1
  },
  styles: {
    headerColor: '#64748b', // slate-500
    borderColor: '#e5e7eb',
    fontSize: 9,
    fontFamily: 'Arial, sans-serif'
  },
  createdAt: new Date(),
  updatedAt: new Date()
};

// ============================================
// KATEGORIA: FREELANCE / WOLNY STRZELEC
// ============================================

export const FREELANCE_PROJECT_TRACKING: WeekbriefTemplate = {
  id: 'freelance-project-tracking',
  name: 'Freelance - Project Tracking',
  description: 'Śledzenie czasu pracy dla freelancerów wg projektów',
  employerId: 'default',
  isPublic: true,
  config: {
    size: 'A4',
    pageSize: 'A4',
    orientation: 'portrait',
    columns: [
      { id: 'project', label: 'Projekt', type: 'text', width: '20%', required: true },
      { id: 'client', label: 'Klient', type: 'text', width: '18%', required: true },
      { id: 'task', label: 'Zadanie', type: 'text', width: '22%', required: true },
      { id: 'date', label: 'Data', type: 'date', width: '12%', required: true },
      { id: 'hours', label: 'Godziny', type: 'number', width: '10%', required: false },
      { id: 'status', label: 'Status', type: 'text', width: '18%', required: false }
    ],
    rows: 20,
    showLogo: true,
    showHeader: true,
    headerFields: [
      { label: 'Freelancer', field: 'employeeName', required: true },
      { label: 'Miesiąc', field: 'month', required: true }
    ],
    showTotalRow: true,
    totalRowLabel: 'Suma godzin',
    showSignature: false,
    signatureLabel: '',
    signatureRows: 0
  },
  styles: {
    headerColor: '#14b8a6', // teal-500
    borderColor: '#e5e7eb',
    fontSize: 9,
    fontFamily: 'Arial, sans-serif'
  },
  createdAt: new Date(),
  updatedAt: new Date()
};

// ============================================
// EKSPORT - wszystkie szablony pogrupowane
// ============================================

export const TEMPLATE_CATEGORIES = {
  construction: {
    name: 'Budowa',
    icon: '🏗️',
    templates: [CLASSIC_5DAY_CONSTRUCTION, FULL_WEEK_CONSTRUCTION]
  },
  it: {
    name: 'IT / Consulting',
    icon: '💻',
    templates: [PROJECT_HOURS_IT, MULTI_PROJECT_IT, CONSULTING_BILLABLE]
  },
  transport: {
    name: 'Transport',
    icon: '🚛',
    templates: [HOURLY_RATE_TRANSPORT, DELIVERY_ROUTES]
  },
  security: {
    name: 'Ochrona',
    icon: '🛡️',
    templates: [SECURITY_SHIFTS]
  },
  catering: {
    name: 'Gastronomia',
    icon: '🍽️',
    templates: [CATERING_WEEKLY]
  },
  cleaning: {
    name: 'Sprzątanie',
    icon: '🧹',
    templates: [CLEANING_OBJECTS]
  },
  healthcare: {
    name: 'Opieka zdrowotna',
    icon: '🏥',
    templates: [HEALTHCARE_SHIFTS]
  },
  retail: {
    name: 'Handel',
    icon: '🛒',
    templates: [RETAIL_SHIFTS]
  },
  education: {
    name: 'Edukacja',
    icon: '📚',
    templates: [EDUCATION_TUTORING]
  },
  warehouse: {
    name: 'Magazyn',
    icon: '📦',
    templates: [WAREHOUSE_OPERATIONS]
  },
  freelance: {
    name: 'Freelance',
    icon: '💼',
    templates: [FREELANCE_PROJECT_TRACKING]
  }
};

export const ALL_PRESET_TEMPLATES: WeekbriefTemplate[] = [
  CLASSIC_5DAY_CONSTRUCTION,
  FULL_WEEK_CONSTRUCTION,
  PROJECT_HOURS_IT,
  MULTI_PROJECT_IT,
  HOURLY_RATE_TRANSPORT,
  CONSULTING_BILLABLE,
  SECURITY_SHIFTS,
  CATERING_WEEKLY,
  CLEANING_OBJECTS,
  HEALTHCARE_SHIFTS,
  DELIVERY_ROUTES,
  RETAIL_SHIFTS,
  EDUCATION_TUTORING,
  WAREHOUSE_OPERATIONS,
  FREELANCE_PROJECT_TRACKING
];
