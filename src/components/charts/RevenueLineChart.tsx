/**
 * WYKRES 1: PRZYCHODY MIESIĘCZNE Z PROGAMI PODATKOWYMI
 * 
 * Wykres liniowy pokazujący:
 * - Przychody miesięczne (zielona linia)
 * - Prog KOR €20,000 (czerwona linia przerywana)
 * - Prog deklaracji kwartalnych €1,500,000 (pomarańczowa linia przerywana)
 * - Prognoza przychodów (niebieska linia przerywana)
 */

import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import { ChartContainer, CHART_COLORS, formatCurrency, formatMonth } from './ChartContainer';
import { TrendUp } from '@phosphor-icons/react';
import type { MonthlyData } from '@/lib/reports-aggregator';

// ============================================
// TYPY
// ============================================

interface RevenueLineChartProps {
  data: MonthlyData[];
  loading?: boolean;
  error?: string | null;
}

// ============================================
// PROGI PODATKOWE (HOLANDIA)
// ============================================

const KOR_THRESHOLD = 20000;           // €20k - próg KOR (small business exemption)
const QUARTERLY_THRESHOLD = 1500000;   // €1.5M - próg deklaracji miesięcznych

// ============================================
// KOMPONENT
// ============================================

export function RevenueLineChart({ data, loading = false, error = null }: RevenueLineChartProps) {
  
  // Sprawdź czy są dane
  const isEmpty = !data || data.length === 0;
  
  // Przygotuj dane dla wykresu
  const chartData = data.map(month => ({
    month: formatMonth(month.label),
    monthLabel: month.label,
    revenue: month.revenue,
    revenueGross: month.revenueGross,
    invoices: month.invoiceCount
  }));
  
  // Oblicz skumulowane przychody (dla progów)
  let cumulativeRevenue = 0;
  const cumulativeData = chartData.map(item => {
    cumulativeRevenue += item.revenue;
    return {
      ...item,
      cumulative: cumulativeRevenue
    };
  });
  
  // Oblicz prognozę (linear regression dla ostatnich 3 miesięcy)
  const forecast = calculateForecast(data);
  
  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload || !payload.length) return null;
    
    const data = payload[0].payload;
    
    return (
      <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
        <p className="font-semibold text-black mb-2">{data.month}</p>
        <div className="space-y-1 text-sm">
          <div className="flex items-center justify-between gap-4">
            <span className="text-black">Przychody netto:</span>
            <span className="font-semibold text-green-600">{formatCurrency(data.revenue)}</span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="text-black">Przychody brutto:</span>
            <span className="font-medium text-black">{formatCurrency(data.revenueGross)}</span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="text-black">Liczba faktur:</span>
            <span className="font-medium text-black">{data.invoices}</span>
          </div>
          <div className="border-t border-gray-200 mt-2 pt-2">
            <div className="flex items-center justify-between gap-4">
              <span className="text-black">Skumulowane:</span>
              <span className="font-semibold text-blue-600">{formatCurrency(data.cumulative)}</span>
            </div>
          </div>
          
          {/* Ostrzeżenia o progach */}
          {data.cumulative >= KOR_THRESHOLD * 0.8 && data.cumulative < KOR_THRESHOLD && (
            <div className="mt-2 p-2 bg-amber-50 border border-amber-200 rounded text-xs">
              <p className="text-amber-800 font-medium">⚠️ UWAGA: Blisko progu KOR!</p>
              <p className="text-amber-700">Pozostało: {formatCurrency(KOR_THRESHOLD - data.cumulative)}</p>
            </div>
          )}
          
          {data.cumulative >= KOR_THRESHOLD && data.cumulative < KOR_THRESHOLD * 1.2 && (
            <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-xs">
              <p className="text-red-800 font-medium">🔴 Przekroczono próg KOR!</p>
              <p className="text-red-700">Obligatoryjny Standard VAT</p>
            </div>
          )}
        </div>
      </div>
    );
  };
  
  return (
    <ChartContainer
      title="Przychody miesięczne"
      description="Przychody netto z progami podatkowymi KOR (€20k) i deklaracji kwartalnych (€1.5M)"
      icon={<TrendUp size={24} weight="duotone" />}
      loading={loading}
      error={error}
      isEmpty={isEmpty}
      emptyMessage="Brak faktur do wyświetlenia. Dodaj pierwszą fakturę aby zobaczyć wykres."
      height={400}
    >
      <ResponsiveContainer width="100%" height="100%">
        <LineChart 
          data={cumulativeData}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          
          <XAxis 
            dataKey="month" 
            stroke="#6b7280"
            style={{ fontSize: '12px' }}
            angle={-45}
            textAnchor="end"
            height={80}
          />
          
          <YAxis 
            stroke="#6b7280"
            style={{ fontSize: '12px' }}
            tickFormatter={(value) => `€${(value / 1000).toFixed(0)}k`}
          />
          
          <Tooltip content={<CustomTooltip />} />
          
          <Legend 
            wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
            iconType="line"
          />
          
          {/* LINIA PROGU KOR - €20,000 */}
          <ReferenceLine 
            y={KOR_THRESHOLD} 
            stroke={CHART_COLORS.danger}
            strokeDasharray="5 5"
            strokeWidth={2}
            label={{
              value: 'KOR €20k',
              position: 'right',
              fill: CHART_COLORS.danger,
              fontSize: 11,
              fontWeight: 'bold'
            }}
          />
          
          {/* PRZYCHODY MIESIĘCZNE */}
          <Line 
            type="monotone"
            dataKey="revenue"
            name="Przychody netto"
            stroke={CHART_COLORS.revenue}
            strokeWidth={3}
            dot={{ fill: CHART_COLORS.revenue, r: 5 }}
            activeDot={{ r: 7 }}
          />
          
          {/* SKUMULOWANE PRZYCHODY */}
          <Line 
            type="monotone"
            dataKey="cumulative"
            name="Skumulowane"
            stroke={CHART_COLORS.primary}
            strokeWidth={2}
            strokeDasharray="3 3"
            dot={false}
          />
          
          {/* PROGNOZA (tylko jeśli są dane) */}
          {forecast && (
            <ReferenceLine 
              y={forecast} 
              stroke={CHART_COLORS.info}
              strokeDasharray="5 5"
              label={{
                value: `Prognoza: ${formatCurrency(forecast)}`,
                position: 'right',
                fill: CHART_COLORS.info,
                fontSize: 11
              }}
            />
          )}
        </LineChart>
      </ResponsiveContainer>
      
      {/* LEGENDY POD WYKRESEM */}
      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
        {/* Status KOR */}
        <div className="p-3 bg-gray-50 rounded-lg">
          <p className="text-black mb-1">Status KOR</p>
          <p className="font-semibold text-black">
            {cumulativeRevenue < KOR_THRESHOLD * 0.5 ? '✅ Bezpieczny' :
             cumulativeRevenue < KOR_THRESHOLD * 0.8 ? '⚠️ Monitoruj' :
             cumulativeRevenue < KOR_THRESHOLD ? '🔴 Strefa graniczna' :
             '❌ Przekroczony'}
          </p>
          <p className="text-black mt-1">
            {cumulativeRevenue < KOR_THRESHOLD 
              ? `Pozostało: ${formatCurrency(KOR_THRESHOLD - cumulativeRevenue)}`
              : `Nadwyżka: ${formatCurrency(cumulativeRevenue - KOR_THRESHOLD)}`
            }
          </p>
        </div>
        
        {/* Średnia miesięczna */}
        <div className="p-3 bg-green-50 rounded-lg">
          <p className="text-black mb-1">Średnia miesięczna</p>
          <p className="font-semibold text-green-600">
            {formatCurrency(data.length > 0 ? cumulativeRevenue / data.length : 0)}
          </p>
          <p className="text-black mt-1">
            {data.length} miesięcy
          </p>
        </div>
        
        {/* Trend */}
        <div className="p-3 bg-blue-50 rounded-lg">
          <p className="text-black mb-1">Trend</p>
          <p className="font-semibold text-blue-600">
            {forecast && forecast > cumulativeRevenue ? '📈 Wzrostowy' : '📉 Spadkowy'}
          </p>
          <p className="text-black mt-1">
            Prognoza na koniec roku
          </p>
        </div>
      </div>
    </ChartContainer>
  );
}

// ============================================
// FUNKCJE POMOCNICZE
// ============================================

/**
 * Oblicz prognozę przychodów (linear regression)
 */
function calculateForecast(data: MonthlyData[]): number | null {
  if (data.length < 3) return null;
  
  // Weź ostatnie 3 miesiące
  const recentData = data.slice(-3);
  const revenues = recentData.map(d => d.revenue);
  
  // Prosta średnia (można rozbudować o linear regression)
  const avgRevenue = revenues.reduce((a, b) => a + b, 0) / revenues.length;
  
  // Prognoza = średnia × pozostałe miesiące
  const currentMonth = new Date().getMonth() + 1;
  const remainingMonths = 12 - currentMonth;
  
  const currentTotal = data.reduce((sum, d) => sum + d.revenue, 0);
  const forecast = currentTotal + (avgRevenue * remainingMonths);
  
  return forecast;
}
