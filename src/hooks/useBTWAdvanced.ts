/**
 * ZAAWANSOWANE HOOKI BTW - 500% WIĘCEJ FUNKCJI
 * AI predictions, Analytics, KOR, ICL, Margin scheme, Auto-categorization
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useBTW, useInvoices, useExpenses, useKilometers } from './useElectronDB';
import type {
  BTWAnnualDeclaration,
  KORStatus,
  KORCalculation,
  BTWPrediction,
  BTWHealthScore,
  BTWAnalytics,
  BTWDeadline,
  BTWCashFlowForecast,
  IndustryBenchmark,
} from '../types/btw-advanced';

// ============================================
// HOOK: KOR (Kleineondernemersregeling)
// ============================================

export function useKOR(year: number) {
  const { invoices } = useInvoices();
  const [korStatus, setKorStatus] = useState<KORStatus | null>(null);
  const [calculation, setCalculation] = useState<KORCalculation | null>(null);

  // PROGI BTW HOLANDIA - Progresywny system
  const KOR_THRESHOLD = 20000; // €20,000 w 2025 - próg zwolnienia dla małych firm
  const QUARTERLY_THRESHOLD = 1500000; // €1,500,000 - powyżej wymagane miesięczne deklaracje
  
  // Stawki BTW Holandia
  const VAT_RATES = {
    standard: 0.21,    // 21% - standardowa (usługi budowlane, większość produktów)
    reduced: 0.09,     // 9% - obniżona (żywność, książki, transport)
    zero: 0.00,        // 0% - eksport, transport międzynarodowy
  } as const;

  useEffect(() => {
    // Oblicz roczny obrót
    const yearInvoices = invoices.filter((inv: any) => 
      inv.issue_date.startsWith(year.toString())
    );
    
    const annualTurnover = yearInvoices.reduce((sum: number, inv: any) => 
      sum + inv.total_net, 0
    );

    // Sprawdź kwalifikowalność KOR
    const isEligible = annualTurnover < KOR_THRESHOLD;
    const savingsEstimate = isEligible ? annualTurnover * VAT_RATES.standard : 0; // Oszczędność 21% VAT
    
    // Sprawdź status rozliczeń (miesięczne vs kwartalne)
    const declarationType = annualTurnover > QUARTERLY_THRESHOLD ? 'monthly' : 'quarterly';
    const distanceToThreshold = KOR_THRESHOLD - annualTurnover;
    const utilizationPercent = (annualTurnover / KOR_THRESHOLD) * 100;

    setKorStatus({
      isEligible,
      year,
      annual_turnover: annualTurnover,
      threshold: KOR_THRESHOLD,
      vat_exemption_amount: savingsEstimate,
      notes: isEligible 
        ? utilizationPercent > 90
          ? `⚠️ UWAGA! Jesteś przy ${utilizationPercent.toFixed(1)}% progu KOR (€${annualTurnover.toFixed(2)}/€${KOR_THRESHOLD}). Zostało tylko €${distanceToThreshold.toFixed(2)}. Możesz przekroczyć próg - rozważ rezygnację z KOR aby odliczać BTW z wydatków.`
          : `✅ Kwalifikujesz się do KOR! Oszczędzasz ~€${savingsEstimate.toFixed(2)} rocznie. Wykorzystanie progu: ${utilizationPercent.toFixed(1)}%. ${declarationType === 'monthly' ? '(Rozliczenia miesięczne wymagane)' : '(Rozliczenia kwartalne)'}`
        : `❌ Obrót przekracza próg KOR (€${annualTurnover.toFixed(2)} > €${KOR_THRESHOLD}). Musisz rozliczać BTW ${declarationType === 'monthly' ? 'MIESIĘCZNIE' : 'kwartalnie'}. Możesz odliczać BTW z wydatków.`,
    });

    // Poprzedni rok
    const prevYearInvoices = invoices.filter((inv: any) => 
      inv.issue_date.startsWith((year - 1).toString())
    );
    const prevYearTurnover = prevYearInvoices.reduce((sum: number, inv: any) => 
      sum + inv.total_net, 0
    );

    // Prognoza na podstawie dotychczasowych danych
    const currentMonth = new Date().getMonth() + 1;
    const forecastAnnual = currentMonth > 0 
      ? (annualTurnover / currentMonth) * 12 
      : annualTurnover;

    const reasons: string[] = [];
    
    // Analiza progów z praktycznymi wskazówkami
    if (forecastAnnual < KOR_THRESHOLD * 0.5) {
      reasons.push(`✅ Bardzo niski obrót (${((forecastAnnual / KOR_THRESHOLD) * 100).toFixed(0)}% progu KOR)`);
      reasons.push('💡 KOR jest IDEALNY - oszczędzasz BTW bez utraty możliwości odliczeń (niskie wydatki)');
      reasons.push(`💰 Szacowana oszczędność: €${(forecastAnnual * VAT_RATES.standard).toFixed(2)}/rok`);
    } else if (forecastAnnual < KOR_THRESHOLD * 0.8) {
      reasons.push(`✅ Obrót bezpieczny (${((forecastAnnual / KOR_THRESHOLD) * 100).toFixed(0)}% progu KOR)`);
      reasons.push('💡 KOR zalecany JEŚLI masz niskie wydatki (< €5,000/rok z BTW)');
      reasons.push('⚖️ Porównaj: oszczędność KOR vs. odliczenia BTW z wydatków');
    } else if (forecastAnnual < KOR_THRESHOLD * 0.95) {
      reasons.push(`⚠️ STREFA GRANICZNA! (${((forecastAnnual / KOR_THRESHOLD) * 100).toFixed(0)}% progu KOR)`);
      reasons.push(`🚨 Zostało tylko €${(KOR_THRESHOLD - forecastAnnual).toFixed(2)} do przekroczenia!`);
      reasons.push('💡 Rozważ REZYGNACJĘ z KOR teraz - łatwiej przejść na Standard VAT planowo niż pod presją');
      reasons.push('📊 Jeśli masz wysokie wydatki (> €8,000), Standard VAT będzie KORZYSTNIEJSZY');
    } else if (forecastAnnual < KOR_THRESHOLD) {
      reasons.push(`🔴 BARDZO BLISKO PROGU! (${((forecastAnnual / KOR_THRESHOLD) * 100).toFixed(0)}% progu KOR)`);
      reasons.push(`⏰ Przekroczysz próg w ciągu 1-2 miesięcy przy obecnym tempie`);
      reasons.push('🚨 PILNE: Przejdź na Standard VAT NATYCHMIAST - unikniesz kar i problemów z Belastingdienst');
      reasons.push('📞 Skontaktuj się z doradcą podatkowym przed końcem kwartału');
    } else {
      reasons.push(`❌ Przekroczono próg KOR (€${forecastAnnual.toFixed(2)} > €${KOR_THRESHOLD})`);
      reasons.push('✅ Musisz rozliczać BTW - ale możesz odliczać BTW z WSZYSTKICH wydatków!');
      reasons.push(`💰 Potencjalne odliczenia: €${(forecastAnnual * 0.3 * VAT_RATES.standard).toFixed(2)}/rok (zakładając 30% wydatki)`);
      
      if (forecastAnnual > QUARTERLY_THRESHOLD) {
        reasons.push(`🗓️ UWAGA: Przekroczono €${QUARTERLY_THRESHOLD.toLocaleString('nl-NL')} - WYMAGANE MIESIĘCZNE deklaracje BTW!`);
      } else {
        reasons.push('📅 Rozliczenia kwartalne (do €1,500,000 rocznego obrotu)');
      }
    }

    // Dodatkowe analizy wzrostu
    const growthRate = prevYearTurnover > 0 
      ? ((forecastAnnual - prevYearTurnover) / prevYearTurnover) * 100 
      : 0;
    
    if (Math.abs(growthRate) > 5) {
      reasons.push(`📈 ${growthRate > 0 ? 'Wzrost' : 'Spadek'} rok/rok: ${Math.abs(growthRate).toFixed(1)}%`);
    }

    setCalculation({
      previous_year_turnover: prevYearTurnover,
      current_year_forecast: forecastAnnual,
      savings_estimate: forecastAnnual < KOR_THRESHOLD ? forecastAnnual * VAT_RATES.standard : 0,
      recommendation: forecastAnnual < KOR_THRESHOLD * 0.5 ? 'apply' 
        : forecastAnnual < KOR_THRESHOLD * 0.8 ? 'borderline' 
        : forecastAnnual < KOR_THRESHOLD ? 'borderline'
        : 'not_applicable',
      reasons,
    });
  }, [invoices, year]);

  return { korStatus, calculation };
}

// ============================================
// HOOK: BTW PREDICTIONS (AI)
// ============================================

export function useBTWPredictions(year: number, quarter: 'Q1' | 'Q2' | 'Q3' | 'Q4') {
  const { invoices } = useInvoices();
  const { expenses } = useExpenses();
  const [prediction, setPrediction] = useState<BTWPrediction | null>(null);

  useEffect(() => {
    // Zbierz historyczne dane z ostatnich 4 kwartałów poprzedniego roku
    const historicalData: Array<{ quarter: 'Q1' | 'Q2' | 'Q3' | 'Q4'; revenue21: number }> = [];
    for (let i = 1; i <= 4; i++) {
      const q = `Q${i}` as 'Q1' | 'Q2' | 'Q3' | 'Q4';
      const qInvoices = invoices.filter((inv: any) => {
        const date = new Date(inv.issue_date);
        const qNum = Math.ceil((date.getMonth() + 1) / 3);
        return date.getFullYear() === year - 1 && qNum === i;
      });
      
      const revenue21 = qInvoices
        .filter((inv: any) => inv.total_vat / inv.total_net > 0.2)
        .reduce((sum: number, inv: any) => sum + inv.total_net, 0);
      
      historicalData.push({ quarter: q, revenue21 });
    }

    // Prosta predykcja liniowa (można rozbudować o ML)
    const avgRevenue = historicalData.reduce((sum, d) => sum + d.revenue21, 0) / historicalData.length;
    const trend = historicalData[3]?.revenue21 > historicalData[0]?.revenue21 ? 'increasing' : 'decreasing';

    // Wykryj anomalie
    const anomalies: string[] = [];
    const currentQuarterData = invoices.filter((inv: any) => {
      const date = new Date(inv.issue_date);
      const qNum = Math.ceil((date.getMonth() + 1) / 3);
      return date.getFullYear() === year && `Q${qNum}` === quarter;
    });

    if (currentQuarterData.length === 0) {
      anomalies.push('Brak faktur w tym kwartale - możliwy problem!');
    }

    type RecommendationType = {
      type: 'info' | 'warning' | 'suggestion';
      message: string;
      action: string;
    };
    const recommendations: RecommendationType[] = [];
    if (trend === 'increasing') {
      recommendations.push({
        type: 'info' as const,
        message: 'Trend wzrostowy - rozważ optymalizację odliczeń VAT',
        action: 'Sprawdź możliwości odliczeń'
      });
    }

    setPrediction({
      year,
      quarter,
      predicted_revenue_21: avgRevenue,
      predicted_revenue_9: avgRevenue * 0.1,
      predicted_expenses: avgRevenue * 0.3,
      predicted_vat_deductible: avgRevenue * 0.3 * 0.21,
      predicted_balance: avgRevenue * 0.21 - (avgRevenue * 0.3 * 0.21),
      confidence_level: historicalData.length >= 4 ? 85 : 60,
      based_on_months: historicalData.length * 3,
      trend,
      anomalies_detected: anomalies,
      recommendations,
    });
  }, [invoices, expenses, year, quarter]);

  return prediction;
}

// ============================================
// HOOK: BTW HEALTH SCORE
// ============================================

export function useBTWHealthScore() {
  const { declarations } = useBTW();
  const [healthScore, setHealthScore] = useState<BTWHealthScore | null>(null);

  useEffect(() => {
    // Compliance: czy wszystkie deklaracje złożone na czas
    const submitted = declarations.filter((d: any) => d.status === 'submitted' || d.status === 'paid');
    const complianceScore = declarations.length > 0 
      ? (submitted.length / declarations.length) * 100 
      : 100;

    // Accuracy: czy są błędy w obliczeniach
    const accuracyScore = declarations.every((d: any) => 
      Math.abs(d.balance - (d.total_vat_to_pay - d.total_vat_deductible)) < 0.01
    ) ? 100 : 70;

    // Timeliness: średni czas do deadline
    const timelinessScore = 90; // TODO: calculate based on submission dates

    // Optimization: czy maksymalizujesz odliczenia
    const avgDeduction = declarations.reduce((sum: number, d: any) => 
      sum + (d.total_vat_deductible / (d.total_vat_to_pay || 1)), 0
    ) / (declarations.length || 1);
    const optimizationScore = Math.min(avgDeduction * 100, 100);

    const overall = (complianceScore + accuracyScore + timelinessScore + optimizationScore) / 4;

    type HealthIssueType = {
      severity: 'critical' | 'warning' | 'info';
      category: string;
      description: string;
      fix_suggestion: string;
    };
    const issues: HealthIssueType[] = [];
    if (complianceScore < 100) {
      issues.push({
        severity: 'critical' as const,
        category: 'Compliance',
        description: 'Nie wszystkie deklaracje złożone',
        fix_suggestion: 'Złóż brakujące deklaracje BTW'
      });
    }

    setHealthScore({
      overall_score: Math.round(overall),
      components: {
        compliance: Math.round(complianceScore),
        accuracy: Math.round(accuracyScore),
        timeliness: Math.round(timelinessScore),
        optimization: Math.round(optimizationScore),
      },
      issues,
      calculated_at: new Date().toISOString(),
    });
  }, [declarations]);

  return healthScore;
}

// ============================================
// HOOK: BTW ANALYTICS
// ============================================

export function useBTWAnalytics(startDate: string, endDate: string) {
  const { invoices } = useInvoices();
  const { expenses } = useExpenses();
  const [analytics, setAnalytics] = useState<BTWAnalytics | null>(null);

  useEffect(() => {
    const periodInvoices = invoices.filter((inv: any) => 
      inv.issue_date >= startDate && inv.issue_date <= endDate
    );

    const periodExpenses = expenses.filter((exp: any) => 
      exp.date >= startDate && exp.date <= endDate
    );

    // Trendy miesięczne
    const monthlyRevenue = new Map<string, number>();
    periodInvoices.forEach((inv: any) => {
      const month = inv.issue_date.substring(0, 7);
      monthlyRevenue.set(month, (monthlyRevenue.get(month) || 0) + inv.total_net);
    });

    const revenueTrend = Array.from(monthlyRevenue.entries())
      .map(([date, amount]) => ({ date, amount }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // Top kategorie wydatków
    const categoryMap = new Map<string, { amount: number; vat: number }>();
    periodExpenses.forEach((exp: any) => {
      const existing = categoryMap.get(exp.category) || { amount: 0, vat: 0 };
      categoryMap.set(exp.category, {
        amount: existing.amount + exp.amount_gross,
        vat: existing.vat + exp.vat_amount,
      });
    });

    const totalExpenses = periodExpenses.reduce((sum: number, exp: any) => sum + exp.amount_gross, 0);
    const topExpenseCategories = Array.from(categoryMap.entries())
      .map(([category, data]) => ({
        category,
        amount: data.amount,
        vat: data.vat,
        percentage: (data.amount / totalExpenses) * 100,
      }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);

    // KPIs
    const totalRevenue = periodInvoices.reduce((sum: number, inv: any) => sum + inv.total_net, 0);
    const totalVAT = periodInvoices.reduce((sum: number, inv: any) => sum + inv.total_vat, 0);
    const effectiveVatRate = totalRevenue > 0 ? (totalVAT / totalRevenue) * 100 : 0;

    setAnalytics({
      period: {
        start: startDate,
        end: endDate,
        type: 'quarterly', // TODO: detect based on dates
      },
      trends: {
        revenue_trend: revenueTrend,
        vat_trend: [], // TODO
        deductible_trend: [], // TODO
      },
      comparisons: {
        vs_previous_period: {
          revenue_change: 0, // TODO
          vat_change: 0,
          balance_change: 0,
        },
        vs_previous_year: {
          revenue_change: 0, // TODO
          vat_change: 0,
          balance_change: 0,
        },
      },
      top_expense_categories: topExpenseCategories,
      anomalies: [],
      kpis: {
        effective_vat_rate: effectiveVatRate,
        vat_to_revenue_ratio: totalRevenue > 0 ? totalVAT / totalRevenue : 0,
        deduction_rate: 0, // TODO
        average_monthly_vat: totalVAT / 3, // Assuming quarterly
      },
    });
  }, [invoices, expenses, startDate, endDate]);

  return analytics;
}

// ============================================
// HOOK: DEADLINE TRACKING
// ============================================

export function useBTWDeadlines() {
  const [deadlines, setDeadlines] = useState<BTWDeadline[]>([]);

  useEffect(() => {
    const currentYear = new Date().getFullYear();
    const quarters: Array<'Q1' | 'Q2' | 'Q3' | 'Q4'> = ['Q1', 'Q2', 'Q3', 'Q4'];

    const generatedDeadlines: BTWDeadline[] = quarters.map((q, i) => {
      // Deadline: 1 miesiąc po końcu kwartału
      const deadlineMonth = (i + 1) * 3 + 1;
      const deadlineDay = deadlineMonth > 12 ? `${currentYear + 1}-01-31` : `${currentYear}-${String(deadlineMonth).padStart(2, '0')}-${deadlineMonth === 5 ? '31' : deadlineMonth === 8 ? '31' : deadlineMonth === 11 ? '30' : '30'}`;
      
      const daysRemaining = Math.floor((new Date(deadlineDay).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
      
      let status: 'upcoming' | 'due_soon' | 'overdue' | 'completed' = 'upcoming';
      if (daysRemaining < 0) status = 'overdue';
      else if (daysRemaining < 7) status = 'due_soon';

      return {
        id: `${currentYear}-${q}`,
        year: currentYear,
        quarter: q,
        declaration_due: deadlineDay,
        payment_due: deadlineDay,
        status,
        days_remaining: daysRemaining,
        reminders: [
          { date: deadlineDay, type: 'email', sent: false },
          { date: deadlineDay, type: 'notification', sent: false },
        ],
        penalties: {
          late_filing_fee: status === 'overdue' ? 369 : 0, // €369 kara w NL
          late_payment_interest: 0,
          total_penalty: status === 'overdue' ? 369 : 0,
        },
      };
    });

    setDeadlines(generatedDeadlines);
  }, []);

  return deadlines;
}

// ============================================
// HOOK: CASH FLOW FORECAST
// ============================================

export function useBTWCashFlowForecast() {
  const { invoices } = useInvoices();
  const { expenses } = useExpenses();
  const [forecast, setForecast] = useState<BTWCashFlowForecast | null>(null);

  useEffect(() => {
    // Oblicz średnie miesięczne na podstawie ostatnich 6 miesięcy
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    const recentInvoices = invoices.filter((inv: any) => 
      new Date(inv.issue_date) >= sixMonthsAgo
    );
    
    const avgMonthlyRevenue = recentInvoices.reduce((sum: number, inv: any) => 
      sum + inv.total_net, 0
    ) / 6;

    const avgMonthlyVAT = avgMonthlyRevenue * 0.21;

    const recentExpenses = expenses.filter((exp: any) => 
      new Date(exp.date) >= sixMonthsAgo
    );
    
    const avgMonthlyExpenses = recentExpenses.reduce((sum: number, exp: any) => 
      sum + exp.amount_gross, 0
    ) / 6;

    const avgMonthlyDeductible = avgMonthlyExpenses * 0.21;

    // Prognoza na następne 6 miesięcy
    type ForecastMonthType = {
      month: string;
      expected_revenue: number;
      expected_vat_collected: number;
      expected_expenses: number;
      expected_vat_deductible: number;
      expected_vat_payment: number;
      cash_impact: number;
    };
    const forecastMonths: ForecastMonthType[] = [];
    for (let i = 0; i < 6; i++) {
      const month = new Date();
      month.setMonth(month.getMonth() + i);
      const monthStr = month.toISOString().substring(0, 7);

      // Co 3 miesiące - płatność VAT
      const isVATMonth = i % 3 === 2;
      const vatPayment = isVATMonth ? (avgMonthlyVAT * 3) - (avgMonthlyDeductible * 3) : 0;

      forecastMonths.push({
        month: monthStr,
        expected_revenue: avgMonthlyRevenue,
        expected_vat_collected: avgMonthlyVAT,
        expected_expenses: avgMonthlyExpenses,
        expected_vat_deductible: avgMonthlyDeductible,
        expected_vat_payment: vatPayment,
        cash_impact: -vatPayment,
      });
    }

    const quarterlyPayment = (avgMonthlyVAT * 3) - (avgMonthlyDeductible * 3);

    setForecast({
      period: 'Next 6 months',
      forecast: forecastMonths,
      scenarios: {
        optimistic: { total_vat_payment: quarterlyPayment * 0.8 },
        realistic: { total_vat_payment: quarterlyPayment },
        pessimistic: { total_vat_payment: quarterlyPayment * 1.2 },
      },
      liquidity_warnings: forecastMonths
        .filter(m => m.cash_impact < -5000)
        .map(m => ({
          month: m.month,
          issue: `Duża płatność VAT: €${Math.abs(m.cash_impact).toFixed(2)}`,
          suggested_action: 'Zarezerwuj środki z wyprzedzeniem',
        })),
    });
  }, [invoices, expenses]);

  return forecast;
}
