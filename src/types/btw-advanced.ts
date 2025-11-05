/**
 * ROZBUDOWANE TYPY BTW - 500% WIĘCEJ FUNKCJI
 * Includes: Annual declarations, KOR, ICL, Margin scheme, AI predictions, Analytics
 */

import { BTWDeclaration, BTWPeriod } from './btw';

// ============================================
// ROZLICZENIA ROCZNE (ANNUAL DECLARATIONS)
// ============================================

export type BTWAnnualPeriod = 'ANNUAL';

export interface BTWAnnualDeclaration extends Omit<BTWDeclaration, 'period'> {
  period: BTWAnnualPeriod;
  quarters: {
    Q1: BTWDeclaration;
    Q2: BTWDeclaration;
    Q3: BTWDeclaration;
    Q4: BTWDeclaration;
  };
  annual_adjustments: number; // Korekty roczne
  final_balance: number; // Ostateczne saldo po korektach
}

// ============================================
// KLEINEONDERNEMERSREGELING (KOR) - Ulga dla małych firm
// ============================================

export interface KORStatus {
  isEligible: boolean; // Czy kwalifikuje się do KOR
  year: number;
  annual_turnover: number; // Roczny obrót
  threshold: number; // Próg KOR (€20,000 w 2025)
  vat_exemption_amount: number; // Kwota zwolnienia z VAT
  notes: string;
}

export interface KORCalculation {
  previous_year_turnover: number;
  current_year_forecast: number;
  savings_estimate: number; // Szacunkowe oszczędności
  recommendation: 'apply' | 'not_applicable' | 'borderline';
  reasons: string[];
}

// ============================================
// ICL DECLARATION (Intracommunautaire Leveringen)
// ============================================

export interface ICLDeclaration {
  id: string;
  year: number;
  quarter: BTWPeriod;
  
  // EU transactions
  eu_supplies: Array<{
    country_code: string; // DE, BE, FR, etc.
    vat_number: string;
    amount: number;
    description: string;
  }>;
  
  // EU acquisitions
  eu_purchases: Array<{
    country_code: string;
    supplier_vat: string;
    amount: number;
    vat_rate: number;
    description: string;
  }>;
  
  total_eu_supplies: number;
  total_eu_purchases: number;
  
  status: 'draft' | 'submitted' | 'accepted';
  submission_date?: string;
  
  created_at: string;
  updated_at: string;
}

// ============================================
// MARGEREGELING (Margin Scheme)
// ============================================

export interface MarginSchemeTransaction {
  id: string;
  date: string;
  description: string;
  purchase_price: number; // Cena zakupu
  selling_price: number; // Cena sprzedaży
  margin: number; // Marża (selling - purchase)
  vat_on_margin: number; // VAT naliczony od marży
  goods_type: 'used_goods' | 'art' | 'antiques' | 'collectors_items';
  notes?: string;
}

export interface MarginSchemeDeclaration {
  id: string;
  year: number;
  quarter: BTWPeriod;
  transactions: MarginSchemeTransaction[];
  total_margin: number;
  total_vat: number;
  created_at: string;
  updated_at: string;
}

// ============================================
// VAT GROUPING (BTW-eenheid)
// ============================================

export interface VATGroup {
  id: string;
  group_name: string;
  parent_company_id: string;
  member_companies: Array<{
    company_id: string;
    company_name: string;
    vat_number: string;
    joined_date: string;
  }>;
  consolidated_declarations: boolean;
  created_at: string;
  updated_at: string;
}

// ============================================
// REVERSE CHARGE AUTOMATION
// ============================================

export interface ReverseChargeRule {
  id: string;
  rule_name: string;
  applies_to: 'services' | 'goods' | 'construction' | 'other';
  countries: string[]; // Kraje UE gdzie stosować
  auto_detect: boolean; // Czy automatycznie wykrywać
  conditions: {
    client_has_vat: boolean;
    client_in_eu: boolean;
    amount_threshold?: number;
  };
}

export interface ReverseChargeTransaction {
  invoice_id: string;
  client_country: string;
  client_vat_number: string;
  amount: number;
  reverse_charge_applied: boolean;
  rule_id: string;
  notes: string;
}

// ============================================
// AI PREDICTIONS & ANALYTICS
// ============================================

export interface BTWPrediction {
  year: number;
  quarter: BTWPeriod;
  
  predicted_revenue_21: number;
  predicted_revenue_9: number;
  predicted_expenses: number;
  predicted_vat_deductible: number;
  predicted_balance: number;
  
  confidence_level: number; // 0-100%
  based_on_months: number; // Ile miesięcy danych użyto
  
  trend: 'increasing' | 'decreasing' | 'stable';
  anomalies_detected: string[];
  
  recommendations: Array<{
    type: 'warning' | 'suggestion' | 'info';
    message: string;
    action?: string;
  }>;
}

export interface BTWHealthScore {
  overall_score: number; // 0-100
  components: {
    compliance: number; // Zgodność z przepisami
    accuracy: number; // Dokładność danych
    timeliness: number; // Terminowość
    optimization: number; // Optymalizacja podatkowa
  };
  
  issues: Array<{
    severity: 'critical' | 'warning' | 'info';
    category: string;
    description: string;
    fix_suggestion: string;
  }>;
  
  calculated_at: string;
}

// ============================================
// ANALYTICS & INSIGHTS
// ============================================

export interface BTWAnalytics {
  period: {
    start: string;
    end: string;
    type: 'monthly' | 'quarterly' | 'annual';
  };
  
  // Trendy
  trends: {
    revenue_trend: Array<{ date: string; amount: number }>;
    vat_trend: Array<{ date: string; vat: number }>;
    deductible_trend: Array<{ date: string; deductible: number }>;
  };
  
  // Porównania
  comparisons: {
    vs_previous_period: {
      revenue_change: number; // %
      vat_change: number; // %
      balance_change: number; // %
    };
    vs_previous_year: {
      revenue_change: number;
      vat_change: number;
      balance_change: number;
    };
  };
  
  // Top kategorie wydatków
  top_expense_categories: Array<{
    category: string;
    amount: number;
    vat: number;
    percentage: number;
  }>;
  
  // Anomalie
  anomalies: Array<{
    date: string;
    type: 'unusual_high' | 'unusual_low' | 'missing_data' | 'duplicate';
    description: string;
    value: number;
  }>;
  
  // Wskaźniki
  kpis: {
    effective_vat_rate: number; // Średnia efektywna stawka VAT
    vat_to_revenue_ratio: number;
    deduction_rate: number; // % odliczeń
    average_monthly_vat: number;
  };
}

// ============================================
// DEADLINE TRACKING & REMINDERS
// ============================================

export interface BTWDeadline {
  id: string;
  year: number;
  quarter: BTWPeriod;
  declaration_due: string; // Data złożenia deklaracji
  payment_due: string; // Data płatności
  
  status: 'upcoming' | 'due_soon' | 'overdue' | 'completed';
  days_remaining: number;
  
  reminders: Array<{
    date: string;
    type: 'email' | 'notification' | 'sms';
    sent: boolean;
  }>;
  
  penalties: {
    late_filing_fee: number;
    late_payment_interest: number;
    total_penalty: number;
  };
}

// ============================================
// EXPORT & INTEGRATIONS
// ============================================

export interface DigipoortExport {
  declaration_id: string;
  xml_content: string; // Generated XML for Digipoort
  validation_status: 'valid' | 'invalid' | 'pending';
  validation_errors: string[];
  submitted_at?: string;
  acknowledgment_received: boolean;
  reference_number?: string;
}

export interface BankIntegration {
  bank_name: string;
  account_iban: string;
  connected: boolean;
  last_sync: string;
  auto_categorization: boolean;
  matched_transactions: number;
  unmatched_transactions: number;
}

export interface OCRReceipt {
  id: string;
  image_url: string;
  scanned_at: string;
  
  extracted_data: {
    supplier: string;
    date: string;
    amount_net: number;
    vat_amount: number;
    vat_rate: number;
    category: string;
  };
  
  confidence: number; // 0-100%
  verified: boolean;
  linked_expense_id?: string;
}

// ============================================
// BENCHMARKING
// ============================================

export interface IndustryBenchmark {
  industry: string;
  company_size: 'micro' | 'small' | 'medium' | 'large';
  
  averages: {
    vat_rate: number;
    deduction_rate: number;
    monthly_vat_payment: number;
  };
  
  your_performance: {
    vat_rate: number;
    deduction_rate: number;
    monthly_vat_payment: number;
  };
  
  comparison: {
    better_than_average: boolean;
    percentile: number; // 0-100
    improvement_areas: string[];
  };
}

// ============================================
// CASH FLOW FORECAST
// ============================================

export interface BTWCashFlowForecast {
  period: string;
  
  forecast: Array<{
    month: string;
    expected_revenue: number;
    expected_vat_collected: number;
    expected_expenses: number;
    expected_vat_deductible: number;
    expected_vat_payment: number;
    cash_impact: number;
  }>;
  
  scenarios: {
    optimistic: { total_vat_payment: number };
    realistic: { total_vat_payment: number };
    pessimistic: { total_vat_payment: number };
  };
  
  liquidity_warnings: Array<{
    month: string;
    issue: string;
    suggested_action: string;
  }>;
}

// ============================================
// SETTINGS & CONFIGURATION
// ============================================

export interface BTWSettings {
  // Okresy rozliczeniowe
  filing_frequency: 'monthly' | 'quarterly' | 'annual';
  
  // KOR
  kor_enabled: boolean;
  kor_threshold_check: boolean;
  
  // Automatyzacja
  auto_calculate: boolean;
  auto_categorize_expenses: boolean;
  auto_detect_reverse_charge: boolean;
  
  // Przypomnienia
  reminders_enabled: boolean;
  reminder_days_before: number[];
  notification_channels: ('email' | 'push' | 'sms')[];
  
  // Integracje
  digipoort_enabled: boolean;
  bank_sync_enabled: boolean;
  ocr_enabled: boolean;
  
  // AI & Analytics
  ai_predictions_enabled: boolean;
  anomaly_detection_enabled: boolean;
  benchmarking_enabled: boolean;
  
  // Export
  auto_export_pdf: boolean;
  auto_backup: boolean;
  backup_frequency: 'daily' | 'weekly' | 'monthly';
}
