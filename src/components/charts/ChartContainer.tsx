/**
 * BAZOWY KONTENER DLA WSZYSTKICH WYKRESÓW
 * 
 * Zapewnia spójny wygląd, responsywność, loading states i error handling
 * dla wszystkich 15 wykresów w systemie.
 */

import React from 'react';
import { Card } from '@/components/ui/card';

// ============================================
// TYPY
// ============================================

interface ChartContainerProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  loading?: boolean;
  error?: string | null;
  isEmpty?: boolean;
  emptyMessage?: string;
  height?: number | string;
  className?: string;
  headerAction?: React.ReactNode; // Przycisk eksportu, filtr, etc.
  children: React.ReactNode;
}

// ============================================
// KOLORY DLA WYKRESÓW (Spójny design system)
// ============================================

export const CHART_COLORS = {
  // Główne kolory
  primary: '#3b82f6',      // blue-500
  success: '#10b981',      // green-500
  danger: '#ef4444',       // red-500
  warning: '#f59e0b',      // amber-500
  info: '#06b6d4',         // cyan-500
  
  // Przychody i wydatki
  revenue: '#10b981',      // zielony
  expense: '#ef4444',      // czerwony
  profit: '#3b82f6',       // niebieski
  
  // VAT
  vatCollected: '#10b981', // zielony (VAT należny)
  vatDeductible: '#3b82f6', // niebieski (VAT naliczony)
  vatBalance: '#6366f1',   // indigo
  
  // Kilometry
  mileage: '#8b5cf6',      // fioletowy
  transport: '#a855f7',    // purpurowy
  
  // Progi podatkowe
  korSafe: '#10b981',      // zielony (0-50%)
  korWarning: '#f59e0b',   // pomarańczowy (50-80%)
  korDanger: '#ef4444',    // czerwony (80-100%)
  
  // Pastelowe (dla pie charts)
  pastel: [
    '#93c5fd', // blue-300
    '#86efac', // green-300
    '#fca5a5', // red-300
    '#fcd34d', // amber-300
    '#c4b5fd', // violet-300
    '#fdba74', // orange-300
    '#67e8f9', // cyan-300
    '#f9a8d4', // pink-300
  ],
  
  // Gradient backgrounds
  gradients: {
    revenue: 'from-green-500 to-emerald-600',
    expense: 'from-red-500 to-rose-600',
    profit: 'from-blue-500 to-indigo-600',
    vat: 'from-indigo-500 to-purple-600',
  }
};

// ============================================
// KOMPONENT
// ============================================

export function ChartContainer({
  title,
  description,
  icon,
  loading = false,
  error = null,
  isEmpty = false,
  emptyMessage = 'Brak danych do wyświetlenia',
  height = 300,
  className = '',
  headerAction,
  children
}: ChartContainerProps) {
  
  return (
    <Card className={`p-6 bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow ${className}`}>
      {/* NAGŁÓWEK */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          {icon && (
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-blue-50 text-blue-600">
              {icon}
            </div>
          )}
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            {description && (
              <p className="text-sm text-gray-500 mt-1">{description}</p>
            )}
          </div>
        </div>
        
        {headerAction && (
          <div className="flex items-center gap-2">
            {headerAction}
          </div>
        )}
      </div>
      
      {/* SEPARATOR */}
      <div className="border-t border-gray-100 mb-4" />
      
      {/* ZAWARTOŚĆ */}
      <div style={{ height: typeof height === 'number' ? `${height}px` : height }}>
        {/* LOADING STATE */}
        {loading && (
          <div className="flex items-center justify-center h-full">
            <div className="flex flex-col items-center gap-3">
              <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-gray-500">Ładowanie danych...</p>
            </div>
          </div>
        )}
        
        {/* ERROR STATE */}
        {!loading && error && (
          <div className="flex items-center justify-center h-full">
            <div className="flex flex-col items-center gap-3 max-w-md text-center">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">⚠️</span>
              </div>
              <div>
                <p className="font-semibold text-gray-900">Błąd ładowania danych</p>
                <p className="text-sm text-gray-500 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}
        
        {/* EMPTY STATE */}
        {!loading && !error && isEmpty && (
          <div className="flex items-center justify-center h-full">
            <div className="flex flex-col items-center gap-3 text-center">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">📊</span>
              </div>
              <div>
                <p className="font-semibold text-gray-900">Brak danych</p>
                <p className="text-sm text-gray-500 mt-1">{emptyMessage}</p>
              </div>
            </div>
          </div>
        )}
        
        {/* WYKRES */}
        {!loading && !error && !isEmpty && (
          <div className="h-full">
            {children}
          </div>
        )}
      </div>
    </Card>
  );
}

// ============================================
// EKSPORT POMOCNICZYCH KOMPONENTÓW
// ============================================

/**
 * Przycisk eksportu wykresu do PNG
 */
export function ExportChartButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors flex items-center gap-2"
    >
      <span>📥</span>
      <span>Export</span>
    </button>
  );
}

/**
 * Legenda wykresu
 */
interface LegendItemProps {
  color: string;
  label: string;
  value?: string | number;
}

export function ChartLegend({ items }: { items: LegendItemProps[] }) {
  return (
    <div className="flex flex-wrap gap-4 mt-4">
      {items.map((item, index) => (
        <div key={index} className="flex items-center gap-2">
          <div 
            className="w-3 h-3 rounded-full" 
            style={{ backgroundColor: item.color }}
          />
          <span className="text-sm text-gray-600">{item.label}</span>
          {item.value !== undefined && (
            <span className="text-sm font-semibold text-gray-900">{item.value}</span>
          )}
        </div>
      ))}
    </div>
  );
}

/**
 * Tooltip helper
 */
export function formatCurrency(value: number, currency = 'EUR'): string {
  return new Intl.NumberFormat('nl-NL', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);
}

/**
 * Formatuj procent
 */
export function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`;
}

/**
 * Formatuj datę
 */
export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('pl-PL', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

/**
 * Formatuj miesiąc (2025-01 → Sty 2025)
 */
export function formatMonth(monthLabel: string): string {
  const [year, month] = monthLabel.split('-');
  const monthNames = ['Sty', 'Lut', 'Mar', 'Kwi', 'Maj', 'Cze', 'Lip', 'Sie', 'Wrz', 'Paź', 'Lis', 'Gru'];
  return `${monthNames[parseInt(month) - 1]} ${year}`;
}
