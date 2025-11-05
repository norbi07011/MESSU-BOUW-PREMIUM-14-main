/**
 * MILEAGE TYPES - Typy dla zarządzania kilometrami służbowymi
 * 
 * Obliczenia według stawek holenderskich (2025):
 * - Stawka kilometrowa: €0.21/km (belastingdienst.nl)
 * - VAT: Wliczony w obliczenia BTW (odliczenie proporcjonalne)
 */

export interface MileageEntry {
  id?: string;
  date: string;                    // Format: YYYY-MM-DD
  from_address: string;            // Adres początkowy
  to_address: string;              // Adres końcowy
  distance_km: number;             // Dystans w kilometrach
  purpose: MileagePurpose;         // Cel podróży
  client_id?: string;              // ID klienta (opcjonalnie)
  project_description?: string;    // Opis projektu/zlecenia
  vehicle_type: VehicleType;       // Typ pojazdu
  is_business: boolean;            // Czy podróż służbowa (true) czy prywatna (false)
  notes?: string;                  // Dodatkowe notatki
  reimbursement_rate: number;      // Stawka zwrotu (€/km) - domyślnie 0.21
  total_reimbursement: number;     // Łączny zwrot (km × stawka)
  created_at?: string;
  updated_at?: string;
}

// Cel podróży
export type MileagePurpose = 
  | 'client_visit'         // Wizyta u klienta
  | 'site_inspection'      // Inspekcja placu budowy
  | 'material_pickup'      // Odbiór materiałów
  | 'supplier_visit'       // Wizyta u dostawcy
  | 'office_commute'       // Dojazd do biura (zazwyczaj nie podlega zwrotowi)
  | 'business_meeting'     // Spotkanie biznesowe
  | 'training'             // Szkolenie
  | 'other';               // Inne

// Typ pojazdu
export type VehicleType =
  | 'car'                  // Samochód osobowy
  | 'van'                  // Van/Bus
  | 'motorcycle'           // Motocykl
  | 'bicycle';             // Rower (może mieć inną stawkę)

// Kategorie celów podróży z opisami
export const MILEAGE_PURPOSE_INFO: Record<MileagePurpose, {
  label: string;
  description: string;
  icon: string;
  deductible: boolean;   // Czy podlega odliczeniu VAT
}> = {
  client_visit: {
    label: 'Wizyta u klienta',
    description: 'Spotkanie z klientem, omówienie projektu',
    icon: '👤',
    deductible: true,
  },
  site_inspection: {
    label: 'Inspekcja placu budowy',
    description: 'Wizyta na placu budowy, nadzór',
    icon: '🏗️',
    deductible: true,
  },
  material_pickup: {
    label: 'Odbiór materiałów',
    description: 'Zakup lub odbiór materiałów budowlanych',
    icon: '📦',
    deductible: true,
  },
  supplier_visit: {
    label: 'Wizyta u dostawcy',
    description: 'Spotkanie z dostawcą, negocjacje',
    icon: '🏪',
    deductible: true,
  },
  office_commute: {
    label: 'Dojazd do biura',
    description: 'Regularne dojazdy dom-biuro (zazwyczaj NIE odliczalne)',
    icon: '🏢',
    deductible: false,
  },
  business_meeting: {
    label: 'Spotkanie biznesowe',
    description: 'Spotkanie z partnerami, doradcami',
    icon: '💼',
    deductible: true,
  },
  training: {
    label: 'Szkolenie',
    description: 'Szkolenia zawodowe, kursy',
    icon: '📚',
    deductible: true,
  },
  other: {
    label: 'Inne',
    description: 'Inna podróż służbowa',
    icon: '🚗',
    deductible: true,
  },
};

// Stawki kilometrowe (2025)
export const MILEAGE_RATES_NL = {
  car: 0.21,          // €0.21/km - samochód
  van: 0.21,          // €0.21/km - van (identyczna stawka)
  motorcycle: 0.15,   // €0.15/km - motocykl (niższa stawka)
  bicycle: 0.00,      // €0.00/km - rower (brak zwrotu, ale możliwy leasing)
} as const;

// Sumaryczne dane kilometrów dla okresu
export interface MileageSummary {
  period: {
    start: string;
    end: string;
    type: 'monthly' | 'quarterly' | 'yearly';
  };
  total_entries: number;              // Liczba wpisów
  total_distance_km: number;          // Łączny dystans
  business_distance_km: number;       // Dystans służbowy
  private_distance_km: number;        // Dystans prywatny
  total_reimbursement: number;        // Łączny zwrot €
  business_reimbursement: number;     // Zwrot za podróże służbowe
  vat_component: number;              // Komponent VAT (21% z business_reimbursement)
  by_purpose: Record<MileagePurpose, {
    count: number;
    distance_km: number;
    reimbursement: number;
  }>;
  by_vehicle: Record<VehicleType, {
    count: number;
    distance_km: number;
    reimbursement: number;
  }>;
}

// Dane dla BTW Aangifte
export interface MileageVATData {
  year: number;
  quarter: 'Q1' | 'Q2' | 'Q3' | 'Q4';
  total_business_km: number;          // Łączne km służbowe
  total_reimbursement: number;        // Łączny zwrot
  vat_deductible: number;             // VAT do odliczenia (21% × reimbursement)
  vat_deductible_percentage: number;  // % VAT do odliczenia (zazwyczaj 21%)
  included_in_btw: boolean;           // Czy uwzględniono w deklaracji BTW
  notes?: string;
}

// Eksport do różnych formatów
export interface MileageExportData {
  entries: MileageEntry[];
  summary: MileageSummary;
  format: 'csv' | 'excel' | 'pdf' | 'json';
  generated_at: string;
}

/**
 * PRZYKŁAD UŻYCIA:
 * 
 * const mileageEntry: MileageEntry = {
 *   date: '2025-11-03',
 *   from_address: 'Amsterdam, Damrak 1',
 *   to_address: 'Rotterdam, Blaak 10',
 *   distance_km: 78,
 *   purpose: 'client_visit',
 *   client_id: 'client-123',
 *   project_description: 'Konsultacja projekt IKEA',
 *   vehicle_type: 'car',
 *   is_business: true,
 *   reimbursement_rate: 0.21,
 *   total_reimbursement: 78 × 0.21 = 16.38€
 * };
 * 
 * VAT do odliczenia = 16.38€ × 21% = 3.44€
 */
