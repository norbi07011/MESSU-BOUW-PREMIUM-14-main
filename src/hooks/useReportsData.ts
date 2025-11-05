/**
 * HOOK DO ZARZĄDZANIA DANYMI RAPORTÓW
 * 
 * Integruje wszystkie hooki (useInvoices, useExpenses, useMileage, useBTW)
 * i przekazuje dane do reports-aggregator.ts
 * 
 * Używany przez stronę Reports.tsx do wyświetlania 15 wykresów.
 */

import { useState, useEffect, useMemo } from 'react';
import { 
  getAllFinancialData, 
  type AggregatedFinancialData,
  type FinancialSummary,
  type MonthlyData
} from '@/lib/reports-aggregator';
import type { Invoice } from '@/types';
import type { Expense } from '@/types/expenses';
import type { MileageEntry } from '@/types/mileage';

// ============================================
// TYPY
// ============================================

interface UseReportsDataOptions {
  startDate?: string;  // YYYY-MM-DD
  endDate?: string;    // YYYY-MM-DD
  autoRefresh?: boolean; // Auto-odświeżanie co 30s
}

interface UseReportsDataReturn {
  // Dane
  data: AggregatedFinancialData | null;
  summary: FinancialSummary | null;
  monthlyData: MonthlyData[];
  
  // Surowe dane (dla custom wykresów)
  invoices: Invoice[];
  expenses: Expense[];
  mileage: MileageEntry[];
  
  // Stany
  loading: boolean;
  error: string | null;
  
  // Akcje
  refetch: () => Promise<void>;
  setDateRange: (start: string, end: string) => void;
  exportCSV: () => string;
  exportJSON: () => string;
}

// ============================================
// GŁÓWNY HOOK
// ============================================

export function useReportsData(options: UseReportsDataOptions = {}): UseReportsDataReturn {
  
  // Domyślne daty: bieżący rok
  const currentYear = new Date().getFullYear();
  const defaultStartDate = `${currentYear}-01-01`;
  const defaultEndDate = `${currentYear}-12-31`;
  
  const [startDate, setStartDate] = useState<string>(options.startDate || defaultStartDate);
  const [endDate, setEndDate] = useState<string>(options.endDate || defaultEndDate);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Surowe dane z bazy danych
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [mileage, setMileage] = useState<MileageEntry[]>([]);
  
  /**
   * POBIERZ DANE Z BAZY DANYCH
   */
  const fetchData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // 1. Pobierz faktury
      const invoicesData = await fetchInvoices(startDate, endDate);
      setInvoices(invoicesData);
      
      // 2. Pobierz wydatki
      const expensesData = await fetchExpenses(startDate, endDate);
      setExpenses(expensesData);
      
      // 3. Pobierz kilometry
      const mileageData = await fetchMileage(startDate, endDate);
      setMileage(mileageData);
      
      setLoading(false);
    } catch (err) {
      console.error('❌ Błąd pobierania danych raportów:', err);
      setError(err instanceof Error ? err.message : 'Nieznany błąd');
      setLoading(false);
    }
  };
  
  /**
   * POBIERZ FAKTURY Z BAZY DANYCH
   */
  async function fetchInvoices(start: string, end: string): Promise<Invoice[]> {
    try {
      // Electron (desktop)
      if ((window as any).electron?.database) {
        const result = await (window as any).electron.database.query(
          `SELECT * FROM invoices 
           WHERE issue_date >= ? AND issue_date <= ? 
           ORDER BY issue_date ASC`,
          [start, end]
        );
        return result || [];
      }
      
      // localStorage (web fallback)
      const stored = localStorage.getItem('invoices');
      if (stored) {
        const allInvoices: Invoice[] = JSON.parse(stored);
        return allInvoices.filter(inv => {
          const date = new Date(inv.issue_date);
          return date >= new Date(start) && date <= new Date(end);
        });
      }
      
      return [];
    } catch (err) {
      console.error('❌ Błąd pobierania faktur:', err);
      return [];
    }
  }
  
  /**
   * POBIERZ WYDATKI Z BAZY DANYCH
   */
  async function fetchExpenses(start: string, end: string): Promise<Expense[]> {
    try {
      // Electron (desktop)
      if ((window as any).electron?.database) {
        const result = await (window as any).electron.database.query(
          `SELECT * FROM expenses 
           WHERE date >= ? AND date <= ? 
           ORDER BY date ASC`,
          [start, end]
        );
        return result || [];
      }
      
      // localStorage (web fallback)
      const stored = localStorage.getItem('expenses');
      if (stored) {
        const allExpenses: Expense[] = JSON.parse(stored);
        return allExpenses.filter(exp => {
          const date = new Date(exp.date);
          return date >= new Date(start) && date <= new Date(end);
        });
      }
      
      return [];
    } catch (err) {
      console.error('❌ Błąd pobierania wydatków:', err);
      return [];
    }
  }
  
  /**
   * POBIERZ KILOMETRY Z BAZY DANYCH
   */
  async function fetchMileage(start: string, end: string): Promise<MileageEntry[]> {
    try {
      // Electron (desktop)
      if ((window as any).electron?.database) {
        const result = await (window as any).electron.database.query(
          `SELECT * FROM mileage 
           WHERE date >= ? AND date <= ? 
           ORDER BY date ASC`,
          [start, end]
        );
        return result || [];
      }
      
      // localStorage (web fallback)
      const stored = localStorage.getItem('mileage');
      if (stored) {
        const allMileage: MileageEntry[] = JSON.parse(stored);
        return allMileage.filter(mil => {
          const date = new Date(mil.date);
          return date >= new Date(start) && date <= new Date(end);
        });
      }
      
      return [];
    } catch (err) {
      console.error('❌ Błąd pobierania kilometrów:', err);
      return [];
    }
  }
  
  /**
   * AGREGUJ DANE UŻYWAJĄC reports-aggregator.ts
   */
  const aggregatedData = useMemo<AggregatedFinancialData | null>(() => {
    if (loading || invoices.length === 0) {
      return null;
    }
    
    try {
      // Użyj funkcji z reports-aggregator.ts
      // Ale przekaż rzeczywiste dane z hooków
      const data = getAllFinancialData(startDate, endDate);
      
      // Zastąp puste tablice rzeczywistymi danymi
      data.invoices = invoices;
      data.expenses = expenses;
      data.mileage = mileage;
      
      // Przelicz podsumowanie z rzeczywistymi danymi
      // (getAllFinancialData() zwraca strukturę, tutaj wypełniamy danymi)
      
      return data;
    } catch (err) {
      console.error('❌ Błąd agregacji danych:', err);
      return null;
    }
  }, [invoices, expenses, mileage, startDate, endDate, loading]);
  
  /**
   * ZMIEŃ ZAKRES DAT
   */
  const setDateRange = (start: string, end: string) => {
    setStartDate(start);
    setEndDate(end);
  };
  
  /**
   * EKSPORTUJ DO CSV
   */
  const exportCSV = (): string => {
    if (!aggregatedData) return '';
    
    let csv = 'Miesiąc,Przychody,Wydatki,VAT należny,VAT naliczony,Kilometry,Zysk\n';
    
    aggregatedData.monthlyData.forEach(month => {
      csv += `${month.label},${month.revenue},${month.expenses},${month.vatCollected},${month.vatDeductible},${month.mileageKm},${month.profit}\n`;
    });
    
    // Trigger download
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `raport-${startDate}-${endDate}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    return csv;
  };
  
  /**
   * EKSPORTUJ DO JSON
   */
  const exportJSON = (): string => {
    if (!aggregatedData) return '';
    
    const json = JSON.stringify(aggregatedData, null, 2);
    
    // Trigger download
    const blob = new Blob([json], { type: 'application/json;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `raport-${startDate}-${endDate}.json`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    return json;
  };
  
  // Pobierz dane przy montowaniu i zmianie zakresu dat
  useEffect(() => {
    fetchData();
  }, [startDate, endDate]);
  
  // Auto-odświeżanie (opcjonalne)
  useEffect(() => {
    if (options.autoRefresh) {
      const interval = setInterval(() => {
        fetchData();
      }, 30000); // Co 30 sekund
      
      return () => clearInterval(interval);
    }
  }, [options.autoRefresh, startDate, endDate]);
  
  // ============================================
  // ZWRÓĆ INTERFEJS HOOKA
  // ============================================
  
  return {
    // Dane
    data: aggregatedData,
    summary: aggregatedData?.summary || null,
    monthlyData: aggregatedData?.monthlyData || [],
    
    // Surowe dane
    invoices,
    expenses,
    mileage,
    
    // Stany
    loading,
    error,
    
    // Akcje
    refetch: fetchData,
    setDateRange,
    exportCSV,
    exportJSON
  };
}

// ============================================
// EKSPORT DODATKOWYCH FUNKCJI
// ============================================

/**
 * Hook do szybkiego dostępu do podsumowania
 */
export function useFinancialSummary(year?: number): FinancialSummary | null {
  const currentYear = year || new Date().getFullYear();
  const { summary } = useReportsData({
    startDate: `${currentYear}-01-01`,
    endDate: `${currentYear}-12-31`
  });
  
  return summary;
}

/**
 * Hook do danych miesięcznych dla konkretnego roku
 */
export function useMonthlyData(year?: number): MonthlyData[] {
  const currentYear = year || new Date().getFullYear();
  const { monthlyData } = useReportsData({
    startDate: `${currentYear}-01-01`,
    endDate: `${currentYear}-12-31`
  });
  
  return monthlyData;
}

/**
 * Hook do danych kwartalnych
 */
export function useQuarterlyData(year: number, quarter: 1 | 2 | 3 | 4): MonthlyData[] {
  const quarterMonths = {
    1: ['01', '02', '03'],
    2: ['04', '05', '06'],
    3: ['07', '08', '09'],
    4: ['10', '11', '12']
  };
  
  const months = quarterMonths[quarter];
  const startDate = `${year}-${months[0]}-01`;
  const endDate = `${year}-${months[2]}-31`;
  
  const { monthlyData } = useReportsData({ startDate, endDate });
  return monthlyData;
}

// ============================================
// ETAP 9: ZWROTY VAT
// ============================================

export interface VATReturnData {
  month: string;
  year: number;
  monthNumber: number;
  vatOwed: number;          // VAT należny (ze sprzedaży)
  vatPaid: number;          // VAT naliczony (z zakupów)
  mileageVAT: number;       // VAT z kilometrów
  netVAT: number;           // Saldo (vatOwed - vatPaid - mileageVAT)
  isRefund: boolean;        // true jeśli netVAT < 0 (zwrot)
  isPayment: boolean;       // true jeśli netVAT > 0 (wpłata)
  amount: number;           // Bezwzględna wartość
  status: 'pending' | 'paid' | 'refunded';
}

export interface AnnualVATSummary {
  totalOwed: number;
  totalPaid: number;
  totalMileageVAT: number;
  netBalance: number;
  refundMonths: number;
  paymentMonths: number;
  totalRefunds: number;
  totalPayments: number;
}

/**
 * Hook do analizy zwrotów VAT
 */
export function useVATReturns(year: number) {
  const { invoices, expenses, mileage, monthlyData } = useReportsData({
    startDate: `${year}-01-01`,
    endDate: `${year}-12-31`
  });

  // Oblicz miesięczne zwroty/wpłaty VAT
  const vatReturnsData = useMemo<VATReturnData[]>(() => {
    const data: VATReturnData[] = [];
    const monthNames = ['Styczeń', 'Luty', 'Marzec', 'Kwiecień', 'Maj', 'Czerwiec',
                       'Lipiec', 'Sierpień', 'Wrzesień', 'Październik', 'Listopad', 'Grudzień'];

    for (let month = 1; month <= 12; month++) {
      // Faktury w danym miesiącu
      const monthInvoices = invoices.filter(inv => {
        const invMonth = new Date(inv.issue_date).getMonth() + 1;
        return invMonth === month;
      });

      // Wydatki w danym miesiącu
      const monthExpenses = expenses.filter(exp => {
        const expMonth = new Date(exp.date).getMonth() + 1;
        return expMonth === month;
      });

      // Kilometry w danym miesiącu
      const monthMileage = mileage.filter(mil => {
        const milMonth = new Date(mil.date).getMonth() + 1;
        return milMonth === month;
      });

      // Obliczenia VAT
      const vatOwed = monthInvoices.reduce((sum, inv) => sum + (inv.total_vat || 0), 0);
      const vatPaid = monthExpenses.reduce((sum, exp) => sum + (exp.vat_amount || 0), 0);
      const mileageKm = monthMileage.reduce((sum, mil) => sum + (mil.distance_km || 0), 0);
      const mileageReimbursement = mileageKm * 0.21; // €0.21/km
      const mileageVAT = mileageReimbursement * 0.21; // 21% VAT z zwrotu

      const netVAT = vatOwed - vatPaid - mileageVAT;
      const isRefund = netVAT < 0;
      const isPayment = netVAT > 0;

      // Status - symulacja (w rzeczywistości byłoby to z bazy danych)
      let status: 'pending' | 'paid' | 'refunded' = 'pending';
      const currentMonth = new Date().getMonth() + 1;
      const currentYear = new Date().getFullYear();
      if (year < currentYear || (year === currentYear && month < currentMonth)) {
        status = isRefund ? 'refunded' : 'paid';
      }

      data.push({
        month: monthNames[month - 1],
        year,
        monthNumber: month,
        vatOwed: Number(vatOwed.toFixed(2)),
        vatPaid: Number(vatPaid.toFixed(2)),
        mileageVAT: Number(mileageVAT.toFixed(2)),
        netVAT: Number(netVAT.toFixed(2)),
        isRefund,
        isPayment,
        amount: Number(Math.abs(netVAT).toFixed(2)),
        status
      });
    }

    return data;
  }, [invoices, expenses, mileage, year]);

  // Roczne podsumowanie VAT
  const annualVATSummary = useMemo<AnnualVATSummary>(() => {
    const totalOwed = vatReturnsData.reduce((sum, d) => sum + d.vatOwed, 0);
    const totalPaid = vatReturnsData.reduce((sum, d) => sum + d.vatPaid, 0);
    const totalMileageVAT = vatReturnsData.reduce((sum, d) => sum + d.mileageVAT, 0);
    const netBalance = totalOwed - totalPaid - totalMileageVAT;

    const refundMonths = vatReturnsData.filter(d => d.isRefund).length;
    const paymentMonths = vatReturnsData.filter(d => d.isPayment).length;

    const totalRefunds = vatReturnsData
      .filter(d => d.isRefund)
      .reduce((sum, d) => sum + d.amount, 0);

    const totalPayments = vatReturnsData
      .filter(d => d.isPayment)
      .reduce((sum, d) => sum + d.amount, 0);

    return {
      totalOwed: Number(totalOwed.toFixed(2)),
      totalPaid: Number(totalPaid.toFixed(2)),
      totalMileageVAT: Number(totalMileageVAT.toFixed(2)),
      netBalance: Number(netBalance.toFixed(2)),
      refundMonths,
      paymentMonths,
      totalRefunds: Number(totalRefunds.toFixed(2)),
      totalPayments: Number(totalPayments.toFixed(2))
    };
  }, [vatReturnsData]);

  // Dane dla wykresów VAT z prawdziwymi zwrotami
  const vatChartData = useMemo(() => {
    return vatReturnsData.map(d => ({
      month: d.month,
      vatOwed: d.vatOwed,
      vatPaid: d.vatPaid + d.mileageVAT,
      balance: d.netVAT,
      type: d.isRefund ? 'refund' : 'payment',
      amount: d.amount
    }));
  }, [vatReturnsData]);

  return {
    vatReturnsData,
    annualVATSummary,
    vatChartData,
    
    // Pomocnicze funkcje
    getMonthData: (monthNumber: number) => {
      return vatReturnsData.find(d => d.monthNumber === monthNumber);
    },
    
    hasRefunds: annualVATSummary.refundMonths > 0,
    hasPayments: annualVATSummary.paymentMonths > 0,
    
    // Sprawdź uprawnienia do zwrotu
    isEligibleForRefund: annualVATSummary.netBalance < 0,
    totalRefundAmount: annualVATSummary.netBalance < 0 ? Math.abs(annualVATSummary.netBalance) : 0
  };
}

/**
 * Hook sprawdzający uprawnienia do zwrotu VAT
 */
export function useVATRefundEligibility(year: number) {
  const { annualVATSummary } = useVATReturns(year);

  return useMemo(() => {
    const isEligible = annualVATSummary.netBalance < 0;
    const refundAmount = isEligible ? Math.abs(annualVATSummary.netBalance) : 0;

    // Oblicz przewidywaną datę zwrotu (2 miesiące od końca roku)
    const endOfYear = new Date(year, 11, 31);
    const refundDate = new Date(endOfYear);
    refundDate.setMonth(refundDate.getMonth() + 2);

    return {
      isEligible,
      refundAmount,
      reason: isEligible 
        ? 'VAT naliczony przewyższa VAT należny - przysługuje zwrot' 
        : 'VAT należny przewyższa VAT naliczony - do zapłaty',
      expectedRefundDate: isEligible 
        ? refundDate.toISOString().split('T')[0]
        : null,
      refundMonths: annualVATSummary.refundMonths,
      paymentMonths: annualVATSummary.paymentMonths
    };
  }, [annualVATSummary, year]);
}
