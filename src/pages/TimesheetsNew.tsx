/**
 * TIMESHEETS - GODZINY PRACY (NOWA WERSJA)
 * Kompatybilna z custom szablonami z edytora
 */

import React, { useState, useRef, useEffect } from 'react';
import { useAudio } from '@/contexts/AudioContext';
import { 
  Printer, 
  Plus, 
  Trash,
  ArrowLeft,
  FloppyDisk
} from '@phosphor-icons/react';
import type { WeekbriefTemplate, WeekbriefColumn } from '@/types/weekbrief';
import { DynamicTimesheetPreview } from '@/components/TimeTracking/DynamicTimesheetPreview';
import { toast } from 'sonner';

// ============================================
// TYPY
// ============================================

interface TimesheetEntry {
  id: string;
  [columnId: string]: string | number; // Dynamiczne kolumny
}

interface TimesheetInstance {
  id: string;
  templateId: string;
  employeeName: string;
  employeeAddress: string;
  employeePhone: string;
  projectName: string;
  projectAddress: string;
  projectClient: string;
  hourlyRate: number;
  weekNumber: string;
  dateFrom: string;
  dateTo: string;
  entries: TimesheetEntry[];
  createdAt: string;
  updatedAt: string;
}

// ============================================
// POMOCNICZE FUNKCJE
// ============================================

function getCurrentWeekNumber(date: Date): number {
  const tempDate = new Date(date.valueOf());
  tempDate.setHours(0, 0, 0, 0);
  tempDate.setDate(tempDate.getDate() + 3 - (tempDate.getDay() + 6) % 7);
  const week1 = new Date(tempDate.getFullYear(), 0, 4);
  return 1 + Math.round(((tempDate.getTime() - week1.getTime()) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7);
}

function getWeekDates(): { from: string; to: string; weekNumber: number } {
  const today = new Date();
  const dayOfWeek = today.getDay();
  const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  
  const monday = new Date(today);
  monday.setDate(today.getDate() + diff);
  
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  
  return {
    from: monday.toLocaleDateString('nl-NL'),
    to: sunday.toLocaleDateString('nl-NL'),
    weekNumber: getCurrentWeekNumber(monday)
  };
}

// ============================================
// KOMPONENT GŁÓWNY
// ============================================

export function TimesheetsNew() {
  const { isMuted } = useAudio();
  const [activeTemplate, setActiveTemplate] = useState<WeekbriefTemplate | null>(null);
  const [companyLogo, setCompanyLogo] = useState<string>('');
  const [timesheets, setTimesheets] = useState<TimesheetInstance[]>([]);
  const [currentSheet, setCurrentSheet] = useState<TimesheetInstance | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  
  const printRef = useRef<HTMLDivElement>(null);
  
  // Load company logo
  useEffect(() => {
    try {
      const companyData = localStorage.getItem('company');
      if (companyData) {
        const company = JSON.parse(companyData);
        if (company.logo_url) {
          setCompanyLogo(company.logo_url);
        }
      }
    } catch (e) {
      console.error('Failed to load company logo', e);
    }
  }, []);
  
  // Load active template
  useEffect(() => {
    const activeTemplateId = localStorage.getItem('activeTimesheetTemplate') || 'pezet-weekbrief-template';
    const customTemplate = localStorage.getItem(`timesheet-template-${activeTemplateId}`);
    
    if (customTemplate) {
      try {
        setActiveTemplate(JSON.parse(customTemplate));
      } catch (e) {
        console.error('Failed to parse active template', e);
        toast.error('Nie można załadować szablonu!');
      }
    } else {
      toast.error('Brak aktywnego szablonu! Przejdź do Ustawień → Szablony Kart Pracy');
    }
  }, []);
  
  // Load saved timesheets
  useEffect(() => {
    try {
      const saved = localStorage.getItem('timesheets-new');
      if (saved) {
        setTimesheets(JSON.parse(saved));
      }
    } catch (e) {
      console.error('Failed to load timesheets', e);
    }
  }, []);
  
  // Save timesheets to localStorage
  const saveToLocalStorage = (sheets: TimesheetInstance[]) => {
    try {
      localStorage.setItem('timesheets-new', JSON.stringify(sheets));
    } catch (e) {
      console.error('Failed to save timesheets', e);
      toast.error('Błąd zapisu!');
    }
  };
  
  // Create new timesheet
  const createNewTimesheet = () => {
    if (!activeTemplate) {
      toast.error('Brak aktywnego szablonu!');
      return;
    }
    
    const { from, to, weekNumber } = getWeekDates();
    
    // Generate empty entries based on template rows
    const entries: TimesheetEntry[] = Array.from({ length: activeTemplate.config.rows }, (_, index) => {
      const entry: TimesheetEntry = { id: `row-${index + 1}` };
      
      // Initialize all columns with empty values
      activeTemplate.config.columns.forEach(col => {
        entry[col.id] = col.type === 'number' ? 0 : '';
      });
      
      return entry;
    });
    
    const newSheet: TimesheetInstance = {
      id: `timesheet-${Date.now()}`,
      templateId: activeTemplate.id,
      employeeName: '',
      employeeAddress: '',
      employeePhone: '',
      projectName: '',
      projectAddress: '',
      projectClient: '',
      hourlyRate: 20,
      weekNumber: `${weekNumber}`,
      dateFrom: from,
      dateTo: to,
      entries,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    setCurrentSheet(newSheet);
  };
  
  // Update entry value
  const updateEntry = (entryIndex: number, columnId: string, value: string | number) => {
    if (!currentSheet) return;
    
    const updatedEntries = [...currentSheet.entries];
    updatedEntries[entryIndex] = {
      ...updatedEntries[entryIndex],
      [columnId]: value
    };
    
    setCurrentSheet({
      ...currentSheet,
      entries: updatedEntries,
      updatedAt: new Date().toISOString()
    });
  };
  
  // Add new row
  const addRow = () => {
    if (!currentSheet || !activeTemplate) return;
    
    const newEntry: TimesheetEntry = { id: `row-${Date.now()}` };
    activeTemplate.config.columns.forEach(col => {
      newEntry[col.id] = col.type === 'number' ? 0 : '';
    });
    
    setCurrentSheet({
      ...currentSheet,
      entries: [...currentSheet.entries, newEntry],
      updatedAt: new Date().toISOString()
    });
    
    toast.success('Dodano wiersz');
  };
  
  // Delete row
  const deleteRow = (index: number) => {
    if (!currentSheet) return;
    
    if (currentSheet.entries.length <= 1) {
      toast.error('Musi być przynajmniej 1 wiersz!');
      return;
    }
    
    const updatedEntries = currentSheet.entries.filter((_, i) => i !== index);
    setCurrentSheet({
      ...currentSheet,
      entries: updatedEntries,
      updatedAt: new Date().toISOString()
    });
    
    toast.success('Usunięto wiersz');
  };
  
  // Save timesheet
  const saveTimesheet = () => {
    if (!currentSheet) return;
    
    if (!currentSheet.employeeName.trim()) {
      toast.error('Wprowadź imię pracownika!');
      return;
    }
    
    const existingIndex = timesheets.findIndex(t => t.id === currentSheet.id);
    let updatedSheets: TimesheetInstance[];
    
    if (existingIndex >= 0) {
      updatedSheets = [...timesheets];
      updatedSheets[existingIndex] = currentSheet;
    } else {
      updatedSheets = [...timesheets, currentSheet];
    }
    
    setTimesheets(updatedSheets);
    saveToLocalStorage(updatedSheets);
    toast.success('Karta pracy zapisana!');
    setCurrentSheet(null);
  };
  
  // Delete timesheet
  const deleteTimesheet = (id: string) => {
    if (!confirm('Czy na pewno chcesz usunąć tę kartę pracy?')) return;
    
    const updatedSheets = timesheets.filter(t => t.id !== id);
    setTimesheets(updatedSheets);
    saveToLocalStorage(updatedSheets);
    toast.success('Karta pracy usunięta!');
  };
  
  // Print handler
  const handlePrint = () => {
    if (printRef.current) {
      const printContents = printRef.current.innerHTML;
      const originalContents = document.body.innerHTML;
      
      document.body.innerHTML = printContents;
      window.print();
      document.body.innerHTML = originalContents;
      window.location.reload();
    }
  };
  
  // ============================================
  // RENDER - Lista kart pracy
  // ============================================
  
  if (!currentSheet) {
    return (
      <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-blue-100 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-black text-gray-900 mb-2">
              ⏰ Godziny Pracy
            </h1>
            <p className="text-lg text-gray-600">
              Twórz karty pracy zgodne z Twoim szablonem
            </p>
          </div>
          
          {/* Action Button */}
          <div className="mb-8">
            <button
              onClick={createNewTimesheet}
              disabled={!activeTemplate}
              className="px-8 py-4 bg-linear-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white rounded-xl font-bold text-lg shadow-xl transition-all duration-300 hover:scale-105 flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus size={24} weight="bold" />
              Nowa Karta Pracy
            </button>
            
            {!activeTemplate && (
              <p className="mt-3 text-sm text-red-600">
                ⚠️ Najpierw ustaw aktywny szablon w Ustawienia → Szablony Kart Pracy
              </p>
            )}
          </div>
          
          {/* Lista zapisanych kart */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {timesheets.length === 0 ? (
              <div className="col-span-full bg-white rounded-2xl p-16 text-center border-2 border-dashed border-gray-300">
                <div className="text-6xl mb-4">📋</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Brak kart pracy
                </h3>
                <p className="text-gray-600">
                  Kliknij "Nowa Karta Pracy" aby rozpocząć
                </p>
              </div>
            ) : (
              timesheets.map(sheet => (
                <div
                  key={sheet.id}
                  className="bg-white rounded-xl p-6 border-2 border-sky-200 hover:border-sky-400 hover:shadow-xl transition-all cursor-pointer group"
                  onClick={() => setCurrentSheet(sheet)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-bold text-lg text-gray-900 group-hover:text-sky-600 transition">
                        {sheet.employeeName || 'Bez nazwy'}
                      </h3>
                      <p className="text-sm text-gray-600">
                        Tydzień {sheet.weekNumber}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {sheet.dateFrom} - {sheet.dateTo}
                      </p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteTimesheet(sheet.id);
                      }}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
                      title="Usuń kartę pracy"
                      aria-label="Usuń kartę pracy"
                    >
                      <Trash size={20} />
                    </button>
                  </div>
                  
                  <div className="pt-4 border-t border-gray-200">
                    <p className="text-xs text-gray-500">
                      Utworzono: {new Date(sheet.createdAt).toLocaleDateString('pl-PL')}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    );
  }
  
  // ============================================
  // RENDER - Edytor karty pracy
  // ============================================
  
  if (!activeTemplate) {
    return (
      <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-blue-100 p-6 flex items-center justify-center">
        <div className="bg-white rounded-2xl p-8 border-2 border-red-300 max-w-md text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Brak szablonu!</h3>
          <p className="text-gray-600 mb-6">
            Najpierw ustaw aktywny szablon w Ustawienia → Szablony Kart Pracy
          </p>
          <button
            onClick={() => setCurrentSheet(null)}
            className="px-6 py-3 bg-sky-500 hover:bg-sky-600 text-white rounded-lg font-bold transition"
          >
            Powrót
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-blue-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-2xl p-6 border-2 border-sky-300 shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Karta Pracy - Tydzień {currentSheet.weekNumber}
              </h2>
              <p className="text-gray-600 mt-1">
                {currentSheet.dateFrom} - {currentSheet.dateTo}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Szablon: <span className="font-semibold">{activeTemplate.name}</span>
              </p>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => {
                  if (confirm('Czy na pewno chcesz anulować? Niezapisane zmiany zostaną utracone.')) {
                    setCurrentSheet(null);
                  }
                }}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition flex items-center gap-2"
              >
                <ArrowLeft size={18} />
                Anuluj
              </button>
              <button
                onClick={saveTimesheet}
                className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition flex items-center gap-2 font-bold"
              >
                <FloppyDisk size={18} />
                Zapisz
              </button>
              <button
                onClick={() => setShowPreview(true)}
                className="px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-lg transition flex items-center gap-2 font-bold"
              >
                <Printer size={18} />
                Podgląd
              </button>
            </div>
          </div>
        </div>
        
        {/* Employee & Project Info */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Employee Info */}
          <div className="bg-white rounded-2xl p-6 border-2 border-sky-300">
            <h3 className="text-lg font-bold text-gray-900 mb-4">👤 Dane Pracownika</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Imię i Nazwisko *
                </label>
                <input
                  type="text"
                  value={currentSheet.employeeName}
                  onChange={(e) => setCurrentSheet({ ...currentSheet, employeeName: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-sky-500 focus:ring-2 focus:ring-sky-200 transition"
                  placeholder="Jan Kowalski"
                />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Adres
                </label>
                <input
                  type="text"
                  value={currentSheet.employeeAddress}
                  onChange={(e) => setCurrentSheet({ ...currentSheet, employeeAddress: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-sky-500 focus:ring-2 focus:ring-sky-200 transition"
                  placeholder="ul. Przykładowa 123, Warszawa"
                />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Telefon
                </label>
                <input
                  type="tel"
                  value={currentSheet.employeePhone}
                  onChange={(e) => setCurrentSheet({ ...currentSheet, employeePhone: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-sky-500 focus:ring-2 focus:ring-sky-200 transition"
                  placeholder="+48 123 456 789"
                />
              </div>
            </div>
          </div>
          
          {/* Project Info */}
          <div className="bg-white rounded-2xl p-6 border-2 border-sky-300">
            <h3 className="text-lg font-bold text-gray-900 mb-4">🏗️ Dane Projektu / Budowy</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Nazwa Projektu
                </label>
                <input
                  type="text"
                  value={currentSheet.projectName}
                  onChange={(e) => setCurrentSheet({ ...currentSheet, projectName: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-sky-500 focus:ring-2 focus:ring-sky-200 transition"
                  placeholder="Budowa domu jednorodzinnego"
                />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Adres Budowy
                </label>
                <input
                  type="text"
                  value={currentSheet.projectAddress}
                  onChange={(e) => setCurrentSheet({ ...currentSheet, projectAddress: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-sky-500 focus:ring-2 focus:ring-sky-200 transition"
                  placeholder="ul. Budowlana 456, Kraków"
                />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Klient
                </label>
                <input
                  type="text"
                  value={currentSheet.projectClient}
                  onChange={(e) => setCurrentSheet({ ...currentSheet, projectClient: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-sky-500 focus:ring-2 focus:ring-sky-200 transition"
                  placeholder="Firma XYZ Sp. z o.o."
                />
              </div>
            </div>
          </div>
        </div>
        
        {/* Hourly Rate */}
        <div className="bg-white rounded-2xl p-6 border-2 border-sky-300">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">💰 Stawka Godzinowa</h3>
              <p className="text-sm text-gray-600">Automatyczne obliczanie zarobków</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-gray-900">€</span>
              <input
                type="number"
                step="0.01"
                min="0"
                value={currentSheet.hourlyRate}
                onChange={(e) => setCurrentSheet({ ...currentSheet, hourlyRate: parseFloat(e.target.value) || 0 })}
                onWheel={(e) => e.currentTarget.blur()}
                className="w-32 px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-sky-500 focus:ring-2 focus:ring-sky-200 transition text-right font-bold text-2xl [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                title="Stawka godzinowa"
                aria-label="Stawka godzinowa w euro"
                placeholder="20.00"
              />
              <span className="text-gray-600 font-medium">/ godz</span>
            </div>
          </div>
        </div>
        
        {/* Summary */}
        {(() => {
          const totalHours = currentSheet.entries.reduce((sum, entry) => {
            const numberColumns = activeTemplate.config.columns.filter(col => col.type === 'number');
            const rowTotal = numberColumns.reduce((rowSum, col) => {
              const value = parseFloat(String(entry[col.id] || 0));
              return rowSum + (isNaN(value) ? 0 : value);
            }, 0);
            return sum + rowTotal;
          }, 0);
          
          const totalAmount = totalHours * currentSheet.hourlyRate;
          
          return (
            <div className="bg-linear-to-r from-sky-500 to-blue-600 rounded-2xl p-6 border-2 border-sky-400 shadow-xl">
              <div className="grid grid-cols-3 gap-6 text-white">
                <div className="text-center">
                  <p className="text-sm opacity-90 mb-2">Całkowity Czas Pracy</p>
                  <p className="text-4xl font-black">{totalHours.toFixed(1)}h</p>
                </div>
                <div className="text-center">
                  <p className="text-sm opacity-90 mb-2">Stawka Godzinowa</p>
                  <p className="text-4xl font-black">€{currentSheet.hourlyRate.toFixed(2)}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm opacity-90 mb-2">Kwota do Wypłaty</p>
                  <p className="text-4xl font-black">€{totalAmount.toFixed(2)}</p>
                </div>
              </div>
            </div>
          );
        })()}
        
        {/* Editable Table */}
        <div className="bg-white rounded-2xl p-6 border-2 border-sky-300 overflow-x-auto">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900">
              Wypełnij kartę pracy
            </h3>
            <button
              onClick={addRow}
              className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition flex items-center gap-2 font-bold"
            >
              <Plus size={18} />
              Dodaj wiersz
            </button>
          </div>
          
          <table className="w-full border-collapse">
            <thead>
              <tr style={{ 
                background: activeTemplate.styles?.headerColor || 'linear-gradient(to right, #0ea5e9, #2563eb)' 
              }}>
                <th className="text-left py-3 px-3 text-white font-bold border border-white/20">
                  #
                </th>
                {activeTemplate.config.columns.map((column) => (
                  <th
                    key={column.id}
                    className="text-center py-3 px-3 text-white font-bold border border-white/20"
                    style={{ width: column.width ? `${column.width}px` : 'auto' }}
                  >
                    {column.label}
                  </th>
                ))}
                <th className="text-center py-3 px-3 text-white font-bold border border-white/20 w-20">
                  Akcje
                </th>
              </tr>
            </thead>
            
            <tbody>
              {currentSheet.entries.map((entry, index) => (
                <tr key={entry.id} className="hover:bg-sky-50 transition">
                  <td className="py-2 px-3 text-center border border-gray-300 font-mono text-sm bg-gray-50">
                    {index + 1}
                  </td>
                  {activeTemplate.config.columns.map((column) => (
                    <td key={column.id} className="py-2 px-3 border border-gray-300">
                      {column.type === 'number' ? (
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={entry[column.id] || 0}
                          onChange={(e) => updateEntry(index, column.id, parseFloat(e.target.value) || 0)}
                          onWheel={(e) => e.currentTarget.blur()}
                          className="w-full px-2 py-1 text-right font-mono border border-gray-200 rounded focus:border-sky-500 focus:ring-1 focus:ring-sky-200 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          aria-label={`${column.label} wiersz ${index + 1}`}
                          title={column.label}
                        />
                      ) : column.type === 'date' ? (
                        <input
                          type="date"
                          value={entry[column.id] || ''}
                          onChange={(e) => updateEntry(index, column.id, e.target.value)}
                          className="w-full px-2 py-1 border border-gray-200 rounded focus:border-sky-500 focus:ring-1 focus:ring-sky-200"
                          aria-label={`${column.label} wiersz ${index + 1}`}
                          title={column.label}
                        />
                      ) : (
                        <input
                          type="text"
                          value={entry[column.id] || ''}
                          onChange={(e) => updateEntry(index, column.id, e.target.value)}
                          className="w-full px-2 py-1 border border-gray-200 rounded focus:border-sky-500 focus:ring-1 focus:ring-sky-200"
                          aria-label={`${column.label} wiersz ${index + 1}`}
                          placeholder={column.label}
                          title={column.label}
                        />
                      )}
                    </td>
                  ))}
                  <td className="py-2 px-3 text-center border border-gray-300">
                    <button
                      onClick={() => deleteRow(index)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded transition"
                      title="Usuń wiersz"
                      aria-label={`Usuń wiersz ${index + 1}`}
                    >
                      <Trash size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white z-10">
              <h3 className="text-xl font-bold text-gray-900">Podgląd Wydruku</h3>
              <div className="flex gap-3">
                <button
                  onClick={handlePrint}
                  className="px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-lg transition flex items-center gap-2"
                >
                  <Printer size={18} />
                  Drukuj
                </button>
                <button
                  onClick={() => setShowPreview(false)}
                  className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition"
                >
                  Zamknij
                </button>
              </div>
            </div>
            
            <div ref={printRef} className="p-8">
              <DynamicTimesheetPreview
                template={activeTemplate}
                employeeName={currentSheet.employeeName}
                employeeAddress={currentSheet.employeeAddress}
                employeePhone={currentSheet.employeePhone}
                projectName={currentSheet.projectName}
                projectAddress={currentSheet.projectAddress}
                projectClient={currentSheet.projectClient}
                weekNumber={currentSheet.weekNumber}
                dateFrom={currentSheet.dateFrom}
                dateTo={currentSheet.dateTo}
                entries={currentSheet.entries}
                logoUrl={companyLogo}
                hourlyRate={currentSheet.hourlyRate}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
