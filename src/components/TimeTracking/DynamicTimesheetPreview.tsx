/**
 * DYNAMIC TIMESHEET PREVIEW
 * Renderuje podgląd/wydruk timesheet na podstawie custom szablonu
 */

import React from 'react';
import type { WeekbriefTemplate } from '@/types/weekbrief';

interface TimeEntry {
  [columnId: string]: string | number;
}

interface DynamicTimesheetPreviewProps {
  template: WeekbriefTemplate;
  employeeName: string;
  employeeAddress?: string;
  employeePhone?: string;
  projectName?: string;
  projectAddress?: string;
  projectClient?: string;
  weekNumber: string;
  dateFrom: string;
  dateTo: string;
  entries: TimeEntry[];
  logoUrl?: string;
  hourlyRate?: number;
}

export const DynamicTimesheetPreview: React.FC<DynamicTimesheetPreviewProps> = ({
  template,
  employeeName,
  employeeAddress,
  employeePhone,
  projectName,
  projectAddress,
  projectClient,
  weekNumber,
  dateFrom,
  dateTo,
  entries,
  logoUrl,
  hourlyRate = 20
}) => {
  const { config, styles } = template;
  
  // Extract gradient colors
  const gradientMatch = styles?.headerColor?.match(/#[0-9a-fA-F]{6}/g);
  const headerGradient = gradientMatch 
    ? `linear-gradient(to right, ${gradientMatch[0]}, ${gradientMatch[1]})`
    : 'linear-gradient(to right, #0ea5e9, #2563eb)';
  
  const borderColor = styles?.borderColor || '#e5e7eb';
  const fontSize = styles?.fontSize || 10;

  // Calculate column totals
  const calculateColumnTotal = (columnId: string): number => {
    return entries.reduce((sum, entry) => {
      const value = parseFloat(String(entry[columnId] || 0));
      return sum + (isNaN(value) ? 0 : value);
    }, 0);
  };

  return (
    <div className="max-w-6xl mx-auto bg-white p-8 relative" style={{ fontSize: `${fontSize}pt` }}>
      {/* Watermark Logo */}
      {styles?.watermarkUrl && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
          <img
            src={styles.watermarkUrl}
            alt="Watermark"
            style={{
              width: `${styles.watermarkSize || 300}px`,
              opacity: (styles.watermarkOpacity || 10) / 100,
              transform: `rotate(${styles.watermarkRotation || -30}deg)`,
              filter: 'grayscale(100%)',
            }}
            className="select-none"
          />
        </div>
      )}

      {/* Header with Logo - ALWAYS show if logoUrl exists */}
      {logoUrl && (
        <div className="mb-6 flex items-center justify-between">
          <img 
            src={logoUrl} 
            alt="Company Logo" 
            className="h-20 w-auto object-contain"
          />
          <div className="text-right text-sm text-gray-600">
            <p>Datum: {new Date().toLocaleDateString('nl-NL')}</p>
          </div>
        </div>
      )}

      {/* Title */}
      <div 
        className="text-center py-4 mb-6 rounded-lg text-white font-bold text-2xl"
        style={{ background: headerGradient }}
      >
        {template.name}
      </div>

      {/* Employee & Project Info */}
      <div className="grid grid-cols-2 gap-6 mb-6">
        {/* Employee Info */}
        <div className="p-4 bg-gray-50 rounded-lg">
          <h3 className="text-sm font-bold text-gray-700 uppercase mb-3">Pracownik</h3>
          <div className="space-y-2">
            <p className="font-bold text-lg text-gray-900">{employeeName || '-'}</p>
            {employeeAddress && <p className="text-sm text-gray-600">{employeeAddress}</p>}
            {employeePhone && <p className="text-sm text-gray-600">{employeePhone}</p>}
          </div>
        </div>
        
        {/* Project Info */}
        <div className="p-4 bg-gray-50 rounded-lg">
          <h3 className="text-sm font-bold text-gray-700 uppercase mb-3">Projekt / Budowa</h3>
          <div className="space-y-2">
            {projectName && <p className="font-bold text-lg text-gray-900">{projectName}</p>}
            {projectAddress && <p className="text-sm text-gray-600">{projectAddress}</p>}
            {projectClient && <p className="text-sm text-gray-600">Klient: {projectClient}</p>}
            {!projectName && !projectAddress && !projectClient && <p className="text-gray-400">-</p>}
          </div>
        </div>
      </div>
      
      {/* Week Info */}
      <div className="mb-6 p-3 bg-sky-50 rounded-lg border border-sky-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Okres:</p>
            <p className="font-bold text-gray-900">{dateFrom} - {dateTo}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">Tydzień:</p>
            <p className="font-bold text-2xl text-sky-600">{weekNumber}</p>
          </div>
        </div>
      </div>

      {/* Dynamic Table */}
      <div className="overflow-x-auto relative z-10">
        <table 
          className="w-full border-collapse"
          style={{ borderColor }}
        >
          {/* Table Header */}
          <thead>
            <tr style={{ background: headerGradient }}>
              <th 
                className="text-left py-3 px-3 text-white font-bold border"
                style={{ borderColor }}
              >
                #
              </th>
              {config.columns.map((column) => (
                <th
                  key={column.id}
                  className="text-center py-3 px-3 text-white font-bold border"
                  style={{ 
                    borderColor,
                    width: column.width ? `${column.width}px` : 'auto'
                  }}
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>

          {/* Table Body */}
          <tbody>
            {entries.map((entry, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td 
                  className="py-2 px-3 text-center border font-mono text-sm"
                  style={{ borderColor }}
                >
                  {index + 1}
                </td>
                {config.columns.map((column) => (
                  <td
                    key={column.id}
                    className={`py-2 px-3 border ${
                      column.type === 'number' ? 'text-right font-mono' : 'text-left'
                    }`}
                    style={{ borderColor }}
                  >
                    {entry[column.id] || (column.type === 'number' ? '0' : '-')}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>

          {/* Table Footer - Totals */}
          {config.showTotalRow && (
            <tfoot>
              <tr style={{ background: headerGradient }}>
                <td 
                  className="py-3 px-3 text-right font-bold text-white border"
                  style={{ borderColor }}
                >
                  {config.totalRowLabel || 'Totaal'}
                </td>
                {config.columns.map((column) => (
                  <td
                    key={column.id}
                    className="py-3 px-3 text-right font-bold text-white border font-mono"
                    style={{ borderColor }}
                  >
                    {column.type === 'number' 
                      ? calculateColumnTotal(column.id).toFixed(1)
                      : '-'
                    }
                  </td>
                ))}
              </tr>
            </tfoot>
          )}
        </table>
      </div>

      {/* Summary Section - Totals Calculation */}
      {(() => {
        const totalHours = entries.reduce((sum, entry) => {
          const numberColumns = config.columns.filter(col => col.type === 'number');
          const rowTotal = numberColumns.reduce((rowSum, col) => {
            const value = parseFloat(String(entry[col.id] || 0));
            return rowSum + (isNaN(value) ? 0 : value);
          }, 0);
          return sum + rowTotal;
        }, 0);
        
        const totalAmount = totalHours * hourlyRate;
        
        return (
          <div className="mt-8 bg-linear-to-r from-sky-500 to-blue-600 rounded-lg p-6 border-2 border-sky-400">
            <div className="grid grid-cols-3 gap-6 text-white">
              <div className="text-center">
                <p className="text-sm opacity-90 mb-2">Całkowity Czas Pracy</p>
                <p className="text-4xl font-black">{totalHours.toFixed(1)}h</p>
              </div>
              <div className="text-center">
                <p className="text-sm opacity-90 mb-2">Stawka Godzinowa</p>
                <p className="text-4xl font-black">€{hourlyRate.toFixed(2)}</p>
              </div>
              <div className="text-center">
                <p className="text-sm opacity-90 mb-2">Kwota do Wypłaty</p>
                <p className="text-4xl font-black">€{totalAmount.toFixed(2)}</p>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Signature Section */}
      {config.showSignature && (
        <div className="mt-12 pt-8 border-t-2 border-gray-300">
          <div className="grid grid-cols-2 gap-16">
            <div>
              <p className="text-sm text-gray-600 mb-8">{config.signatureLabel || 'Handtekening'}:</p>
              <div className="border-b-2 border-gray-400 h-16"></div>
              <p className="text-xs text-gray-500 mt-2">{employeeName}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-8">Werkgever:</p>
              <div className="border-b-2 border-gray-400 h-16"></div>
              <p className="text-xs text-gray-500 mt-2">MESSU BOUW</p>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="mt-8 pt-4 border-t border-gray-200 text-center text-xs text-gray-500">
        <p>Gegenereerd: {new Date().toLocaleDateString('nl-NL')} {new Date().toLocaleTimeString('nl-NL')}</p>
      </div>
    </div>
  );
};
