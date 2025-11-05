/**
 * AGREGATOR DANYCH DLA RAPORTÓW
 * 
 * Zbiera WSZYSTKIE dane finansowe z każdej podstrony:
 * - Faktury (przychody)
 * - Wydatki
 * - Kilometry
 * - Deklaracje BTW
 * - Zwroty VAT
 * 
 * Używane przez stronę Reports do generowania 15 wykresów.
 */

import type { Invoice } from '@/types';
import type { Expense } from '@/types/expenses';
import type { MileageEntry, MileageSummary } from '@/types/mileage';
import type { BTWDeclaration } from '@/types/btw';

// ============================================
// TYPY DLA AGREGOWANYCH DANYCH
// ============================================

export interface VATReturn {
  id: string;
  year: number;
  period: number; // Miesiąc lub kwartał
  
  // Kwoty
  vat_to_return: number;      // Kwota zwrotu (zawsze dodatnia)
  returned_amount: number;    // Faktycznie zwrócona kwota
  
  // Status
  status: 'pending' | 'processing' | 'completed' | 'rejected';
  requested_at: string;
  received_at?: string;
  
  // Powód zwrotu
  reason: 'excess_vat' | 'export_sales' | 'investment' | 'correction';
}

export interface FinancialSummary {
  // Przychody
  totalRevenue: number;
  totalRevenueGross: number;
  vatCollected: number;
  invoiceCount: number;
  
  // Wydatki
  totalExpenses: number;
  totalExpensesGross: number;
  vatDeductible: number;
  expenseCount: number;
  
  // Kilometry
  totalMileageKm: number;
  totalMileageReimbursement: number;
  mileageVATDeductible: number;
  mileageEntryCount: number;
  
  // VAT saldo
  netVAT: number;             // vatCollected - vatDeductible - mileageVATDeductible
  vatToPay: number;           // Jeśli dodatnie
  vatToReturn: number;        // Jeśli ujemne (bezwzględna wartość)
  
  // Deklaracje BTW
  btwDeclarationCount: number;
  totalVATPayments: number;
  totalVATReturns: number;
  
  // Zysk
  netProfit: number;          // totalRevenue - totalExpenses - totalMileageReimbursement
  grossProfit: number;        // totalRevenueGross - totalExpensesGross
  profitMargin: number;       // (netProfit / totalRevenue) * 100
  
  // Progi podatkowe (Holandia)
  korThresholdUsage: number;  // (totalRevenue / 20000) * 100
  quarterlyThresholdUsage: number; // (totalRevenue / 1500000) * 100
  isKorEligible: boolean;
  declarationFrequency: 'yearly' | 'quarterly' | 'monthly';
}

export interface MonthlyData {
  year: number;
  month: number;
  label: string; // "2025-01", "2025-02"
  
  // Przychody
  revenue: number;
  revenueGross: number;
  vatCollected: number;
  invoiceCount: number;
  
  // Wydatki
  expenses: number;
  expensesGross: number;
  vatDeductible: number;
  expenseCount: number;
  
  // Kilometry
  mileageKm: number;
  mileageReimbursement: number;
  mileageVAT: number;
  
  // Saldo
  netVAT: number;
  profit: number;
  cashFlow: number;
}

export interface AggregatedFinancialData {
  // Surowe dane
  invoices: Invoice[];
  expenses: Expense[];
  mileage: MileageEntry[];
  btwDeclarations: BTWDeclaration[];
  vatReturns: VATReturn[];
  
  // Podsumowania
  summary: FinancialSummary;
  monthlyData: MonthlyData[];
  
  // Metadata
  dateRange: {
    start: string;
    end: string;
  };
  lastUpdated: string;
}

// ============================================
// FUNKCJE POMOCNICZE
// ============================================

/**
 * Formatuje datę do YYYY-MM
 */
function getMonthLabel(date: string): string {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

/**
 * Sprawdza czy data mieści się w zakresie
 */
function isInDateRange(date: string, startDate: string, endDate: string): boolean {
  const d = new Date(date);
  const start = new Date(startDate);
  const end = new Date(endDate);
  return d >= start && d <= end;
}

/**
 * Oblicza VAT z kwoty netto (21%)
 */
function calculateVAT(netAmount: number, vatRate: number = 0.21): number {
  return Number((netAmount * vatRate).toFixed(2));
}

// ============================================
// GŁÓWNA FUNKCJA AGREGUJĄCA
// ============================================

/**
 * Zbiera WSZYSTKIE dane finansowe z każdej podstrony
 * 
 * @param startDate - Data początkowa (YYYY-MM-DD)
 * @param endDate - Data końcowa (YYYY-MM-DD)
 * @returns Zagregowane dane finansowe
 */
export function getAllFinancialData(
  startDate: string,
  endDate: string
): AggregatedFinancialData {
  
  // 1. POBIERZ DANE Z KAŻDEJ PODSTRONY
  // Uwaga: Te dane będą przekazywane z hooków, tutaj tylko struktura
  const invoices: Invoice[] = [];
  const expenses: Expense[] = [];
  const mileage: MileageEntry[] = [];
  const btwDeclarations: BTWDeclaration[] = [];
  const vatReturns: VATReturn[] = [];
  
  // 2. FILTRUJ WEDŁUG ZAKRESU DAT
  const filteredInvoices = invoices.filter(inv => 
    isInDateRange(inv.issue_date, startDate, endDate)
  );
  
  const filteredExpenses = expenses.filter(exp => 
    isInDateRange(exp.date, startDate, endDate)
  );
  
  const filteredMileage = mileage.filter(mil => 
    isInDateRange(mil.date, startDate, endDate)
  );
  
  // 3. OBLICZ PODSUMOWANIE
  const summary = calculateFinancialSummary(
    filteredInvoices,
    filteredExpenses,
    filteredMileage,
    btwDeclarations,
    vatReturns
  );
  
  // 4. GENERUJ DANE MIESIĘCZNE
  const monthlyData = generateMonthlyData(
    filteredInvoices,
    filteredExpenses,
    filteredMileage,
    startDate,
    endDate
  );
  
  // 5. ZWRÓĆ ZAGREGOWANE DANE
  return {
    invoices: filteredInvoices,
    expenses: filteredExpenses,
    mileage: filteredMileage,
    btwDeclarations,
    vatReturns,
    summary,
    monthlyData,
    dateRange: { start: startDate, end: endDate },
    lastUpdated: new Date().toISOString()
  };
}

/**
 * Oblicza podsumowanie finansowe
 */
function calculateFinancialSummary(
  invoices: Invoice[],
  expenses: Expense[],
  mileage: MileageEntry[],
  btwDeclarations: BTWDeclaration[],
  vatReturns: VATReturn[]
): FinancialSummary {
  
  // PRZYCHODY
  const totalRevenue = invoices.reduce((sum, inv) => sum + (inv.total_net || 0), 0);
  const vatCollected = invoices.reduce((sum, inv) => sum + (inv.total_vat || 0), 0);
  const totalRevenueGross = totalRevenue + vatCollected;
  
  // WYDATKI
  const totalExpenses = expenses.reduce((sum, exp) => sum + (exp.amount_net || 0), 0);
  const vatDeductible = expenses.reduce((sum, exp) => sum + (exp.vat_amount || 0), 0);
  const totalExpensesGross = totalExpenses + vatDeductible;
  
  // KILOMETRY
  const totalMileageKm = mileage.reduce((sum, mil) => sum + (mil.distance_km || 0), 0);
  const totalMileageReimbursement = mileage.reduce((sum, mil) => sum + (mil.total_reimbursement || 0), 0);
  const mileageVATDeductible = totalMileageReimbursement * 0.21; // 21% VAT z zwrotu
  
  // VAT SALDO
  const netVAT = vatCollected - vatDeductible - mileageVATDeductible;
  const vatToPay = netVAT > 0 ? netVAT : 0;
  const vatToReturn = netVAT < 0 ? Math.abs(netVAT) : 0;
  
  // DEKLARACJE BTW
  const totalVATPayments = btwDeclarations
    .filter(btw => btw.balance > 0)
    .reduce((sum, btw) => sum + btw.balance, 0);
  
  const totalVATReturns = vatReturns
    .filter(vat => vat.status === 'completed')
    .reduce((sum, vat) => sum + vat.returned_amount, 0);
  
  // ZYSK
  const netProfit = totalRevenue - totalExpenses - totalMileageReimbursement;
  const grossProfit = totalRevenueGross - totalExpensesGross;
  const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;
  
  // PROGI PODATKOWE (Holandia)
  const KOR_THRESHOLD = 20000;
  const QUARTERLY_THRESHOLD = 1500000;
  
  const korThresholdUsage = (totalRevenue / KOR_THRESHOLD) * 100;
  const quarterlyThresholdUsage = (totalRevenue / QUARTERLY_THRESHOLD) * 100;
  const isKorEligible = totalRevenue < KOR_THRESHOLD;
  
  let declarationFrequency: 'yearly' | 'quarterly' | 'monthly';
  if (isKorEligible) {
    declarationFrequency = 'yearly';
  } else if (totalRevenue < QUARTERLY_THRESHOLD) {
    declarationFrequency = 'quarterly';
  } else {
    declarationFrequency = 'monthly';
  }
  
  return {
    // Przychody
    totalRevenue: Number(totalRevenue.toFixed(2)),
    totalRevenueGross: Number(totalRevenueGross.toFixed(2)),
    vatCollected: Number(vatCollected.toFixed(2)),
    invoiceCount: invoices.length,
    
    // Wydatki
    totalExpenses: Number(totalExpenses.toFixed(2)),
    totalExpensesGross: Number(totalExpensesGross.toFixed(2)),
    vatDeductible: Number(vatDeductible.toFixed(2)),
    expenseCount: expenses.length,
    
    // Kilometry
    totalMileageKm: Number(totalMileageKm.toFixed(2)),
    totalMileageReimbursement: Number(totalMileageReimbursement.toFixed(2)),
    mileageVATDeductible: Number(mileageVATDeductible.toFixed(2)),
    mileageEntryCount: mileage.length,
    
    // VAT saldo
    netVAT: Number(netVAT.toFixed(2)),
    vatToPay: Number(vatToPay.toFixed(2)),
    vatToReturn: Number(vatToReturn.toFixed(2)),
    
    // Deklaracje BTW
    btwDeclarationCount: btwDeclarations.length,
    totalVATPayments: Number(totalVATPayments.toFixed(2)),
    totalVATReturns: Number(totalVATReturns.toFixed(2)),
    
    // Zysk
    netProfit: Number(netProfit.toFixed(2)),
    grossProfit: Number(grossProfit.toFixed(2)),
    profitMargin: Number(profitMargin.toFixed(2)),
    
    // Progi podatkowe
    korThresholdUsage: Number(korThresholdUsage.toFixed(2)),
    quarterlyThresholdUsage: Number(quarterlyThresholdUsage.toFixed(2)),
    isKorEligible,
    declarationFrequency
  };
}

/**
 * Generuje dane miesięczne dla wykresów
 */
function generateMonthlyData(
  invoices: Invoice[],
  expenses: Expense[],
  mileage: MileageEntry[],
  startDate: string,
  endDate: string
): MonthlyData[] {
  
  // Grupuj po miesiącach
  const monthlyMap = new Map<string, MonthlyData>();
  
  // Przetwórz faktury
  invoices.forEach(invoice => {
    const monthLabel = getMonthLabel(invoice.issue_date);
    
    if (!monthlyMap.has(monthLabel)) {
      const [year, month] = monthLabel.split('-').map(Number);
      monthlyMap.set(monthLabel, {
        year,
        month,
        label: monthLabel,
        revenue: 0,
        revenueGross: 0,
        vatCollected: 0,
        invoiceCount: 0,
        expenses: 0,
        expensesGross: 0,
        vatDeductible: 0,
        expenseCount: 0,
        mileageKm: 0,
        mileageReimbursement: 0,
        mileageVAT: 0,
        netVAT: 0,
        profit: 0,
        cashFlow: 0
      });
    }
    
    const data = monthlyMap.get(monthLabel)!;
    data.revenue += invoice.total_net || 0;
    data.vatCollected += invoice.total_vat || 0;
    data.revenueGross = data.revenue + data.vatCollected;
    data.invoiceCount++;
  });
  
  // Przetwórz wydatki
  expenses.forEach(expense => {
    const monthLabel = getMonthLabel(expense.date);
    
    if (!monthlyMap.has(monthLabel)) {
      const [year, month] = monthLabel.split('-').map(Number);
      monthlyMap.set(monthLabel, {
        year,
        month,
        label: monthLabel,
        revenue: 0,
        revenueGross: 0,
        vatCollected: 0,
        invoiceCount: 0,
        expenses: 0,
        expensesGross: 0,
        vatDeductible: 0,
        expenseCount: 0,
        mileageKm: 0,
        mileageReimbursement: 0,
        mileageVAT: 0,
        netVAT: 0,
        profit: 0,
        cashFlow: 0
      });
    }
    
    const data = monthlyMap.get(monthLabel)!;
    data.expenses += expense.amount_net || 0;
    data.vatDeductible += expense.vat_amount || 0;
    data.expensesGross = data.expenses + data.vatDeductible;
    data.expenseCount++;
  });
  
  // Przetwórz kilometry
  mileage.forEach(entry => {
    const monthLabel = getMonthLabel(entry.date);
    
    if (!monthlyMap.has(monthLabel)) {
      const [year, month] = monthLabel.split('-').map(Number);
      monthlyMap.set(monthLabel, {
        year,
        month,
        label: monthLabel,
        revenue: 0,
        revenueGross: 0,
        vatCollected: 0,
        invoiceCount: 0,
        expenses: 0,
        expensesGross: 0,
        vatDeductible: 0,
        expenseCount: 0,
        mileageKm: 0,
        mileageReimbursement: 0,
        mileageVAT: 0,
        netVAT: 0,
        profit: 0,
        cashFlow: 0
      });
    }
    
    const data = monthlyMap.get(monthLabel)!;
    data.mileageKm += entry.distance_km || 0;
    data.mileageReimbursement += entry.total_reimbursement || 0;
    data.mileageVAT = data.mileageReimbursement * 0.21;
  });
  
  // Oblicz salda dla każdego miesiąca
  const monthlyDataArray = Array.from(monthlyMap.values());
  monthlyDataArray.forEach(data => {
    data.netVAT = data.vatCollected - data.vatDeductible - data.mileageVAT;
    data.profit = data.revenue - data.expenses - data.mileageReimbursement;
    data.cashFlow = data.revenueGross - data.expensesGross;
    
    // Zaokrąglij wszystkie wartości
    Object.keys(data).forEach(key => {
      const value = data[key as keyof MonthlyData];
      if (typeof value === 'number') {
        (data as any)[key] = Number(value.toFixed(2));
      }
    });
  });
  
  // Sortuj chronologicznie
  return monthlyDataArray.sort((a, b) => {
    if (a.year !== b.year) return a.year - b.year;
    return a.month - b.month;
  });
}

/**
 * Eksportuj dane do CSV
 */
export function exportToCSV(data: AggregatedFinancialData): string {
  let csv = 'Miesiąc,Przychody,Wydatki,VAT należny,VAT naliczony,Kilometry,Zysk\n';
  
  data.monthlyData.forEach(month => {
    csv += `${month.label},${month.revenue},${month.expenses},${month.vatCollected},${month.vatDeductible},${month.mileageKm},${month.profit}\n`;
  });
  
  return csv;
}

/**
 * Eksportuj podsumowanie do JSON
 */
export function exportToJSON(data: AggregatedFinancialData): string {
  return JSON.stringify(data, null, 2);
}
