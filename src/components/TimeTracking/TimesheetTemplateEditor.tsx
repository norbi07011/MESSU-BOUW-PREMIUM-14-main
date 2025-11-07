/**
 * TIMESHEET TEMPLATE EDITOR - Visual Builder (UPGRADED v2)
 * 
 * NOWE Funkcje:
 * ✅ UNDO/REDO (Ctrl+Z/Ctrl+Y)
 * ✅ Gradient colors (dual picker)
 * ✅ Template library integration
 * ✅ Keyboard shortcuts (Ctrl+S)
 * 
 * Funkcje podstawowe:
 * - Drag & drop kolumn
 * - Zmiana szerokości kolumn
 * - Dodawanie/usuwanie kolumn
 * - Zmiana kolorów (gradient, ramki)
 * - Upload logo
 * - Edycja fontów i rozmiarów
 * - Zapisywanie custom templates
 * - Podgląd na żywo
 */

import React, { useState, useEffect, useRef } from 'react';
import { Plus, Trash, Copy, DotsSixVertical, DownloadSimple, UploadSimple, Upload } from '@phosphor-icons/react';
import type { WeekbriefTemplate, WeekbriefColumn } from '@/types/weekbrief';
import { useUndoRedo, useUndoRedoKeyboard } from '@/hooks/useUndoRedo';
import { ColorPickerDual, FontControls, LogoControls, UndoRedoToolbar, ColorThemeSelector } from '@/components/shared/TemplateEditor';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  horizontalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { ColorTheme } from '@/components/TimeTracking/colorThemes';
import { toast } from 'sonner';

interface EditorState {
  templateName: string;
  columns: WeekbriefColumn[];
  headerGradientStart: string;
  headerGradientEnd: string;
  borderColor: string;
  fontSize: number;
  showLogo: boolean;
  logoUrl: string;  // Logo URL (header logo)
  // NEW: Watermark logo (background logo in table)
  showWatermark: boolean;
  watermarkUrl: string;
  watermarkOpacity: number; // 0-100%
  watermarkSize: number; // 100-500px
  watermarkRotation: number; // -45 to 45 degrees
  rows: number;
}

interface TimesheetTemplateEditorProps {
  template?: WeekbriefTemplate;
  onSave: (template: WeekbriefTemplate) => void;
  onCancel: () => void;
}

// Sortable Column Item Component
interface SortableColumnItemProps {
  column: WeekbriefColumn;
  index: number;
  totalColumns: number;
  onUpdate: (field: keyof WeekbriefColumn, value: any) => void;
  onMoveLeft: () => void;
  onMoveRight: () => void;
  onDuplicate: () => void;
  onRemove: () => void;
}

const SortableColumnItem: React.FC<SortableColumnItemProps> = ({
  column,
  index,
  totalColumns,
  onUpdate,
  onMoveLeft,
  onMoveRight,
  onDuplicate,
  onRemove,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: column.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-gray-50 border-2 rounded-xl p-4 transition-all ${
        isDragging ? 'border-sky-500 shadow-lg z-50' : 'border-gray-200 hover:border-sky-300'
      }`}
    >
      <div className="flex items-start gap-3">
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing mt-2"
        >
          <DotsSixVertical size={24} className="text-gray-400" />
        </div>
        
        <div className="flex-1 grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1">Nazwa</label>
            <input
              type="text"
              value={column.label}
              onChange={(e) => onUpdate('label', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-semibold"
              placeholder="Nazwa kolumny"
              title="Nazwa kolumny"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1">Szerokość</label>
            <input
              type="text"
              value={column.width}
              onChange={(e) => onUpdate('width', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono"
              placeholder="10%"
              title="Szerokość kolumny (np. 10%, 50px)"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1">Typ</label>
            <select
              value={column.type}
              onChange={(e) => onUpdate('type', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              title="Typ danych w kolumnie"
            >
              <option value="text">Tekst</option>
              <option value="number">Liczba</option>
              <option value="date">Data</option>
            </select>
          </div>

          <div className="flex items-end">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={column.required}
                onChange={(e) => onUpdate('required', e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-sky-600"
              />
              <span className="text-xs font-semibold">Wymagane</span>
            </label>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <button
            onClick={onMoveLeft}
            disabled={index === 0}
            className="p-2 hover:bg-gray-200 rounded disabled:opacity-30"
            title="Przesuń w lewo"
          >
            ←
          </button>
          <button
            onClick={onMoveRight}
            disabled={index === totalColumns - 1}
            className="p-2 hover:bg-gray-200 rounded disabled:opacity-30"
            title="Przesuń w prawo"
          >
            →
          </button>
          <button
            onClick={onDuplicate}
            className="p-2 hover:bg-sky-100 rounded"
            title="Duplikuj"
          >
            <Copy size={16} className="text-sky-600" />
          </button>
          <button
            onClick={onRemove}
            className="p-2 hover:bg-red-100 rounded"
            title="Usuń"
          >
            <Trash size={16} className="text-red-600" />
          </button>
        </div>
      </div>
    </div>
  );
};

export const TimesheetTemplateEditor: React.FC<TimesheetTemplateEditorProps> = ({
  template,
  onSave,
  onCancel
}) => {
  // Początkowy stan edytora - zabezpieczenie przed undefined template
  const initialState: EditorState = {
    templateName: template?.name || 'Nowy Szablon',
    columns: template?.config.columns || [
      { id: 'day', label: 'Dag', type: 'text' as const, width: '60px' },
      { id: 'date', label: 'Datum', type: 'date' as const, width: '80px' },
      { id: 'hours', label: 'Uren', type: 'number' as const, width: '60px' },
    ],
    headerGradientStart: template?.styles?.headerColor || '#0ea5e9', // sky-500
    headerGradientEnd: '#2563eb', // blue-600 (default gradient)
    borderColor: template?.styles?.borderColor || '#e5e7eb',
    fontSize: template?.styles?.fontSize || 10,
    showLogo: template?.config.showLogo ?? true,
    logoUrl: '', // Header logo URL
    // NEW: Watermark logo defaults
    showWatermark: false,
    watermarkUrl: '',
    watermarkOpacity: 10, // 10% opacity (subtle)
    watermarkSize: 300, // 300px
    watermarkRotation: -30, // -30 degrees diagonal
    rows: template?.config.rows || 15
  };

  // UNDO/REDO System
  const {
    currentState,
    pushState,
    undo,
    redo,
    canUndo,
    canRedo
  } = useUndoRedo<EditorState>({ initialState, maxHistory: 20 });

  // Destructure current state
  const { templateName, columns, headerGradientStart, headerGradientEnd, borderColor, fontSize, showLogo, logoUrl, showWatermark, watermarkUrl, watermarkOpacity, watermarkSize, watermarkRotation, rows } = currentState;

  // NEW: Selected column for editing (3-column layout)
  const [selectedColumnId, setSelectedColumnId] = useState<string | null>(
    columns.length > 0 ? columns[0].id : null
  );

  // Drag & Drop state
  const [activeId, setActiveId] = useState<string | null>(null);

  // File input ref for import
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Helper: Get column emoji by type
  const getColumnIcon = (type: 'text' | 'number' | 'date' | 'time' | 'select') => {
    const icons: Record<string, string> = {
      text: '📝',
      number: '🔢',
      date: '📅',
      time: '⏰',
      select: '📋',
    };
    return icons[type] || '📋';
  };

  // Sensors for drag & drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px movement needed to start drag
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Handle drag start
  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  // Handle drag end
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      const oldIndex = columns.findIndex((col) => col.id === active.id);
      const newIndex = columns.findIndex((col) => col.id === over.id);
      
      const newColumns = arrayMove(columns, oldIndex, newIndex);
      updateState({ columns: newColumns }, 'Przesunięto kolumnę');
    }
    
    setActiveId(null);
  };

  // Helper: Update state with history tracking
  const updateState = (updates: Partial<EditorState>, description: string) => {
    pushState({ ...currentState, ...updates }, description);
  };

  // Keyboard shortcuts
  const { handleKeyDown } = useUndoRedoKeyboard(
    undo,
    redo,
    handleSave,
    () => {
      // Ctrl+D: Duplicate first column (or last edited)
      if (columns.length > 0) {
        duplicateColumn(0);
        toast.success('Kolumna zduplikowana (Ctrl+D)');
      }
    },
    () => {
      // Ctrl+P: Preview (pokazuje toast z info)
      toast.info('Podgląd wydruku - wkrótce! (Ctrl+P)');
    }
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Dodaj nową kolumnę
  const addColumn = () => {
    const newColumn: WeekbriefColumn = {
      id: `col-${Date.now()}`,
      label: 'Nowa Kolumna',
      type: 'text',
      width: '10%',
      required: false
    };
    updateState({ columns: [...columns, newColumn] }, 'Dodano kolumnę');
  };

  // Usuń kolumnę
  const removeColumn = (index: number) => {
    updateState({ columns: columns.filter((_, i) => i !== index) }, 'Usunięto kolumnę');
  };

  // Duplikuj kolumnę
  const duplicateColumn = (index: number) => {
    const column = columns[index];
    const newColumn: WeekbriefColumn = {
      ...column,
      id: `col-${Date.now()}`,
      label: column.label + ' (kopia)'
    };
    const newColumns = [...columns];
    newColumns.splice(index + 1, 0, newColumn);
    updateState({ columns: newColumns }, 'Zduplikowano kolumnę');
  };

  // Aktualizuj kolumnę
  const updateColumn = (index: number, field: keyof WeekbriefColumn, value: any) => {
    const newColumns = [...columns];
    (newColumns[index] as any)[field] = value;
    updateState({ columns: newColumns }, `Zaktualizowano ${field}`);
  };

  // Przesuń kolumnę
  const moveColumn = (index: number, direction: 'left' | 'right') => {
    if (direction === 'left' && index === 0) return;
    if (direction === 'right' && index === columns.length - 1) return;
    
    const newColumns = [...columns];
    const targetIndex = direction === 'left' ? index - 1 : index + 1;
    [newColumns[index], newColumns[targetIndex]] = [newColumns[targetIndex], newColumns[index]];
    updateState({ columns: newColumns }, 'Przesunięto kolumnę');
  };

  // EXPORT template to JSON
  const handleExportTemplate = () => {
    const exportData: WeekbriefTemplate = {
      id: template?.id || `template-${Date.now()}`,
      name: templateName,
      employerId: 'custom',
      isPublic: false,
      config: {
        size: 'A4',
        orientation: 'portrait',
        columns: columns,
        rows: rows,
        showLogo: showLogo,
        showHeader: true,
        headerFields: [],
        showTotalRow: true,
        totalRowLabel: 'Totaal',
        showSignature: true,
        signatureLabel: 'Handtekening',
        signatureRows: 1
      },
      styles: {
        headerColor: `linear-gradient(to right, ${headerGradientStart}, ${headerGradientEnd})`,
        borderColor: borderColor,
        fontSize: fontSize,
        fontFamily: 'Arial, sans-serif',
        // NEW: Watermark settings
        watermarkUrl: watermarkUrl || undefined,
        watermarkOpacity: showWatermark ? watermarkOpacity : undefined,
        watermarkSize: showWatermark ? watermarkSize : undefined,
        watermarkRotation: showWatermark ? watermarkRotation : undefined,
      },
      createdAt: template?.createdAt || new Date(),
      updatedAt: new Date()
    };

    const jsonString = JSON.stringify(exportData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${templateName.replace(/\s+/g, '-')}-template.json`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success(`Szablon "${templateName}" wyeksportowany do JSON!`);
  };

  // IMPORT template from JSON
  const handleImportTemplate = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const importedTemplate = JSON.parse(event.target?.result as string) as WeekbriefTemplate;
        
        // Validate basic structure
        if (!importedTemplate.config || !importedTemplate.config.columns) {
          toast.error('Nieprawidłowy format szablonu!');
          return;
        }

        // Extract gradient colors from styles
        const gradientMatch = importedTemplate.styles?.headerColor?.match(/#[0-9a-fA-F]{6}/g);
        const startColor = gradientMatch?.[0] || '#0ea5e9';
        const endColor = gradientMatch?.[1] || '#2563eb';

        // Apply imported template
        updateState({
          templateName: importedTemplate.name,
          columns: importedTemplate.config.columns,
          headerGradientStart: startColor,
          headerGradientEnd: endColor,
          borderColor: importedTemplate.styles?.borderColor || '#e5e7eb',
          fontSize: importedTemplate.styles?.fontSize || 10,
          showLogo: importedTemplate.config.showLogo,
          rows: importedTemplate.config.rows,
          // NEW: Watermark settings
          showWatermark: !!importedTemplate.styles?.watermarkUrl,
          watermarkUrl: importedTemplate.styles?.watermarkUrl || '',
          watermarkOpacity: importedTemplate.styles?.watermarkOpacity || 10,
          watermarkSize: importedTemplate.styles?.watermarkSize || 300,
          watermarkRotation: importedTemplate.styles?.watermarkRotation || -30,
        }, 'Zaimportowano szablon');

        toast.success(`Szablon "${importedTemplate.name}" zaimportowany!`);
      } catch (error) {
        toast.error('Błąd podczas importowania szablonu!');
        console.error(error);
      }
    };
    reader.readAsText(file);
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Zapisz szablon
  function handleSave() {
    // VALIDATION RULES
    const errors: string[] = [];

    // 1. Check template name
    if (!templateName.trim()) {
      errors.push('Nazwa szablonu jest wymagana');
    }

    // 2. Check minimum columns
    if (columns.length === 0) {
      errors.push('Szablon musi mieć przynajmniej 1 kolumnę');
    }

    // 3. Check required columns have labels
    columns.forEach((col, idx) => {
      if (!col.label.trim()) {
        errors.push(`Kolumna #${idx + 1} nie ma nazwy`);
      }
    });

    // 4. Check for duplicate column IDs
    const columnIds = columns.map(c => c.id);
    const uniqueIds = new Set(columnIds);
    if (columnIds.length !== uniqueIds.size) {
      errors.push('Znaleziono duplikaty ID kolumn');
    }

    // 5. Check max hours validation (optional - for number columns)
    const numberColumns = columns.filter(c => c.type === 'number');
    if (numberColumns.length > 7) {
      errors.push('Zbyt wiele kolumn liczbowych (max 7 dni w tygodniu)');
    }

    // 6. Check rows count
    if (rows < 5) {
      errors.push('Szablon musi mieć minimum 5 wierszy');
    }
    if (rows > 50) {
      errors.push('Szablon może mieć maksymalnie 50 wierszy');
    }

    // If validation fails, show errors and abort
    if (errors.length > 0) {
      toast.error(
        <div>
          <strong>Błędy walidacji:</strong>
          <ul className="list-disc ml-4 mt-2">
            {errors.map((err, i) => (
              <li key={i}>{err}</li>
            ))}
          </ul>
        </div>,
        { duration: 5000 }
      );
      return;
    }

    // All validations passed - save template
    const newTemplate: WeekbriefTemplate = {
      id: template?.id || `template-${Date.now()}`,
      name: templateName,
      employerId: template?.employerId || 'custom',
      isPublic: false,
      config: {
        size: 'A4',
        orientation: 'portrait',
        columns: columns,
        rows: rows,
        showLogo: showLogo,
        showHeader: true,
        headerFields: template?.config.headerFields || [],
        showTotalRow: true,
        totalRowLabel: 'Totaal',
        showSignature: true,
        signatureLabel: 'Handtekening',
        signatureRows: 1
      },
      styles: {
        headerColor: `linear-gradient(to right, ${headerGradientStart}, ${headerGradientEnd})`,
        borderColor: borderColor,
        fontSize: fontSize,
        fontFamily: 'Arial, sans-serif',
        // NEW: Watermark settings
        watermarkUrl: watermarkUrl || undefined,
        watermarkOpacity: showWatermark ? watermarkOpacity : undefined,
        watermarkSize: showWatermark ? watermarkSize : undefined,
        watermarkRotation: showWatermark ? watermarkRotation : undefined,
      },
      createdAt: template?.createdAt || new Date(),
      updatedAt: new Date()
    };
    onSave(newTemplate);
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-blue-100 p-6">
      <div className="max-w-[1800px] mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl p-6 border-2 border-sky-300">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Nazwa szablonu</label>
              <input
                type="text"
                value={templateName}
                onChange={(e) => updateState({ templateName: e.target.value }, 'Zmieniono nazwę')}
                className="w-full px-4 py-3 border-2 border-sky-300 rounded-xl focus:border-sky-500 focus:ring-2 focus:ring-sky-200 text-lg font-bold"
                placeholder="np. PEZET Weekbrief"
              />
            </div>
            <div className="flex gap-3 ml-6">
              {/* Export/Import Buttons */}
              <button
                onClick={handleExportTemplate}
                className="px-4 py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl font-bold transition-all flex items-center gap-2"
                title="Eksportuj szablon do JSON"
              >
                <DownloadSimple size={20} weight="bold" />
                Export
              </button>

              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-bold transition-all flex items-center gap-2"
                title="Importuj szablon z JSON"
              >
                <UploadSimple size={20} weight="bold" />
                Import
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                className="hidden"
                onChange={handleImportTemplate}
                aria-label="Import template file"
              />

              {/* UNDO/REDO Buttons */}
              <UndoRedoToolbar
                canUndo={canUndo}
                canRedo={canRedo}
                onUndo={undo}
                onRedo={redo}
              />

              <button
                onClick={onCancel}
                className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-xl font-bold transition-all"
              >
                Anuluj
              </button>
              <button
                onClick={handleSave}
                className="px-6 py-3 bg-linear-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white rounded-xl font-bold shadow-lg transition-all"
              >
                Zapisz szablon
              </button>
            </div>
          </div>
        </div>

        {/* 3-COLUMN LAYOUT */}
        <div className="grid grid-cols-[480px_1fr_360px] gap-6">
          {/* ============================================ */}
          {/* LEFT PANEL - Columns List (480px)           */}
          {/* ============================================ */}
          <div className="space-y-4">
            {/* Color Theme Selector */}
            <div className="bg-white rounded-2xl shadow-xl p-6 border-2 border-sky-300">
              <ColorThemeSelector
                currentGradientStart={headerGradientStart}
                currentGradientEnd={headerGradientEnd}
                onSelectTheme={(theme: ColorTheme) => {
                  updateState({
                    headerGradientStart: theme.colors.headerStart,
                    headerGradientEnd: theme.colors.headerEnd,
                    borderColor: theme.colors.borderColor,
                    fontSize: theme.fontSize
                  }, `Zastosowano motyw: ${theme.name}`);
                }}
              />
            </div>

            {/* Columns List with Drag & Drop */}
            <div className="bg-white rounded-2xl shadow-xl p-6 border-2 border-sky-300">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-lg">Kolumny ({columns.length})</h3>
                <button
                  onClick={addColumn}
                  className="px-4 py-2 bg-linear-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white rounded-lg font-bold shadow-lg transition-all flex items-center gap-2"
                >
                  <Plus size={18} weight="bold" />
                  Dodaj
                </button>
              </div>

              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={columns.map(col => col.id)}
                  strategy={horizontalListSortingStrategy}
                >
                  <div className="space-y-2 max-h-[600px] overflow-y-auto">
                    {columns.map((column, index) => {
                      const isSelected = selectedColumnId === column.id;
                      return (
                        <div
                          key={column.id}
                          onClick={() => setSelectedColumnId(column.id)}
                          className={`cursor-pointer transition-all rounded-xl p-4 border-2 ${
                            isSelected 
                              ? 'bg-sky-50 border-sky-500 shadow-lg' 
                              : 'bg-gray-50 border-gray-200 hover:border-sky-300'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="text-2xl">{getColumnIcon(column.type)}</div>
                            <div className="flex-1">
                              <div className="font-bold text-gray-900">{column.label}</div>
                              <div className="text-xs text-gray-600">{column.type} · {column.width}</div>
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                removeColumn(index);
                              }}
                              className="p-2 hover:bg-red-100 rounded-lg transition-all"
                              title="Usuń kolumnę"
                            >
                              <Trash size={16} className="text-red-600" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </SortableContext>

                <DragOverlay>
                  {activeId ? (
                    <div className="bg-white border-2 border-sky-500 rounded-xl p-4 shadow-2xl opacity-90">
                      <div className="flex items-center gap-3">
                        <DotsSixVertical size={24} className="text-sky-500" />
                        <span className="font-bold text-gray-900">
                          {columns.find(col => col.id === activeId)?.label}
                        </span>
                      </div>
                    </div>
                  ) : null}
                </DragOverlay>
              </DndContext>
            </div>
          </div>

          {/* ============================================ */}
          {/* CENTER PANEL - Sticky Preview (auto)        */}
          {/* ============================================ */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl shadow-xl p-6 border-2 border-sky-300 sticky top-6">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <span>📊</span>
                Podgląd na żywo
              </h3>
              
              <div className="bg-gray-100 p-4 rounded-xl overflow-x-auto">
                <div 
                  className="min-w-[600px] bg-white border-2 rounded-lg overflow-hidden relative" 
                  style={{ borderColor: borderColor }}
                >
                  {/* WATERMARK - Background logo */}
                  {showWatermark && watermarkUrl && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
                      <img
                        src={watermarkUrl}
                        alt="Watermark"
                        className="select-none"
                        style={{
                          width: `${watermarkSize}px`,
                          opacity: watermarkOpacity / 100,
                          transform: `rotate(${watermarkRotation}deg)`,
                          filter: 'grayscale(100%)',
                          userSelect: 'none',
                        }}
                      />
                    </div>
                  )}

                  {/* Header */}
                  <div 
                    className="grid relative z-10" 
                    style={{ 
                      gridTemplateColumns: columns.map(c => c.width).join(' '), 
                      background: `linear-gradient(to right, ${headerGradientStart}, ${headerGradientEnd})` 
                    }}
                  >
                    {columns.map((col) => {
                      const isSelected = selectedColumnId === col.id;
                      return (
                        <div
                          key={col.id}
                          onClick={() => setSelectedColumnId(col.id)}
                          className={`p-2 font-bold text-center border-r text-white cursor-pointer transition-all ${
                            isSelected ? 'ring-4 ring-yellow-400 ring-inset' : 'hover:opacity-80'
                          }`}
                          style={{ borderColor: borderColor, fontSize: `${fontSize}px` }}
                          title={`Kliknij aby edytować: ${col.label}`}
                        >
                          {col.label}
                        </div>
                      );
                    })}
                  </div>
                  
                  {/* Sample Rows */}
                  {Array.from({ length: Math.min(rows, 5) }).map((_, i) => (
                    <div key={i} className="grid" style={{ gridTemplateColumns: columns.map(c => c.width).join(' ') }}>
                      {columns.map((col) => {
                        const isSelected = selectedColumnId === col.id;
                        return (
                          <div
                            key={col.id}
                            onClick={() => setSelectedColumnId(col.id)}
                            className={`p-2 border-r border-b text-center cursor-pointer transition-all ${
                              isSelected ? 'bg-sky-50 ring-2 ring-sky-300 ring-inset' : 'hover:bg-gray-50'
                            }`}
                            style={{ borderColor: borderColor, fontSize: `${fontSize}px` }}
                          >
                            {col.type === 'number' ? '8' : col.type === 'date' ? '01-01-2025' : 'Przykład'}
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
                
                {/* Preview Info */}
                <div className="mt-3 text-xs text-gray-600 text-center">
                  Pokazano {Math.min(rows, 5)} z {rows} wierszy · Kliknij kolumnę aby edytować
                </div>
              </div>
            </div>
          </div>

          {/* ============================================ */}
          {/* RIGHT PANEL - Column Editor (360px)         */}
          {/* ============================================ */}
          <div className="space-y-4">
            {selectedColumnId && columns.find(c => c.id === selectedColumnId) ? (
              <>
                {/* Selected Column Editor */}
                <div className="bg-white rounded-2xl shadow-xl p-6 border-2 border-sky-300">
                  <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                    <span>{getColumnIcon(columns.find(c => c.id === selectedColumnId)!.type)}</span>
                    Edycja kolumny
                  </h3>

                  {(() => {
                    const selectedColumn = columns.find(c => c.id === selectedColumnId)!;
                    const selectedIndex = columns.findIndex(c => c.id === selectedColumnId);

                    return (
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Nazwa kolumny</label>
                          <input
                            type="text"
                            value={selectedColumn.label}
                            onChange={(e) => updateColumn(selectedIndex, 'label', e.target.value)}
                            className="w-full px-3 py-2 border-2 border-sky-300 rounded-lg font-semibold focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
                            placeholder="np. Dag, Datum, Uren"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Typ danych</label>
                          <select
                            value={selectedColumn.type}
                            onChange={(e) => updateColumn(selectedIndex, 'type', e.target.value)}
                            className="w-full px-3 py-2 border-2 border-sky-300 rounded-lg font-semibold focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
                            title="Wybierz typ danych dla kolumny"
                          >
                            <option value="text">📝 Tekst</option>
                            <option value="number">🔢 Liczba</option>
                            <option value="date">📅 Data</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Szerokość</label>
                          <input
                            type="text"
                            value={selectedColumn.width}
                            onChange={(e) => updateColumn(selectedIndex, 'width', e.target.value)}
                            className="w-full px-3 py-2 border-2 border-sky-300 rounded-lg font-mono focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
                            placeholder="np. 10%, 60px"
                          />
                        </div>

                        <div className="flex items-center gap-2 p-3 bg-sky-50 rounded-lg">
                          <input
                            type="checkbox"
                            checked={selectedColumn.required || false}
                            onChange={(e) => updateColumn(selectedIndex, 'required', e.target.checked)}
                            className="w-5 h-5 rounded border-gray-300 text-sky-600 focus:ring-2 focus:ring-sky-200"
                            id="column-required"
                          />
                          <label htmlFor="column-required" className="font-semibold text-gray-700 cursor-pointer">
                            Pole wymagane
                          </label>
                        </div>

                        <div className="flex gap-2 pt-4 border-t border-gray-200">
                          <button
                            onClick={() => duplicateColumn(selectedIndex)}
                            className="flex-1 px-4 py-2 bg-sky-100 hover:bg-sky-200 text-sky-700 rounded-lg font-bold transition-all flex items-center justify-center gap-2"
                          >
                            <Copy size={16} weight="bold" />
                            Duplikuj
                          </button>
                          <button
                            onClick={() => {
                              removeColumn(selectedIndex);
                              setSelectedColumnId(columns[0]?.id || null);
                            }}
                            className="flex-1 px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg font-bold transition-all flex items-center justify-center gap-2"
                          >
                            <Trash size={16} weight="bold" />
                            Usuń
                          </button>
                        </div>
                      </div>
                    );
                  })()}
                </div>

                {/* Global Settings */}
                <div className="bg-white rounded-2xl shadow-xl p-6 border-2 border-sky-300">
                  <h3 className="font-bold text-lg mb-4">⚙️ Globalne ustawienia</h3>

                  <div className="space-y-4">
                    {/* Gradient Colors */}
                    <ColorPickerDual
                      startColor={headerGradientStart}
                      endColor={headerGradientEnd}
                      onStartColorChange={(color) => updateState({ headerGradientStart: color }, 'Zmieniono kolor start')}
                      onEndColorChange={(color) => updateState({ headerGradientEnd: color }, 'Zmieniono kolor end')}
                      label="Kolory nagłówka"
                    />

                    {/* Border Color */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Kolor ramek</label>
                      <div className="flex gap-2">
                        <input
                          type="color"
                          value={borderColor}
                          onChange={(e) => updateState({ borderColor: e.target.value }, 'Zmieniono kolor ramek')}
                          className="w-12 h-10 rounded-lg border-2 border-gray-300 cursor-pointer"
                          title="Wybierz kolor ramek"
                          aria-label="Picker koloru ramek"
                        />
                        <input
                          type="text"
                          value={borderColor}
                          onChange={(e) => updateState({ borderColor: e.target.value }, 'Zmieniono kolor ramek')}
                          className="flex-1 px-3 py-2 border-2 border-sky-300 rounded-lg font-mono text-sm"
                          placeholder="#e5e7eb"
                          title="Hex kodu koloru ramek"
                        />
                      </div>
                    </div>

                    {/* Font Size */}
                    <FontControls
                      fontSize={fontSize}
                      onFontSizeChange={(size) => updateState({ fontSize: size }, 'Zmieniono rozmiar czcionki')}
                    />

                    {/* Logo */}
                    <LogoControls
                      showLogo={showLogo}
                      onShowLogoChange={(show) => updateState({ showLogo: show }, 'Zmieniono widoczność logo')}
                      logoUrl={logoUrl}
                      onLogoUpload={(url) => updateState({ logoUrl: url }, 'Dodano logo')}
                      showLivePreview={false}
                    />

                    {/* Watermark Logo (background) */}
                    <div className="bg-white rounded-2xl shadow-xl p-6 border-2 border-sky-300">
                      <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                        <span>🖼️</span>
                        Logo w tle (watermark)
                      </h3>

                      <div className="space-y-4">
                        {/* Show/Hide Watermark */}
                        <label className="flex items-center gap-3 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={showWatermark}
                            onChange={(e) => updateState({ showWatermark: e.target.checked }, 'Zmieniono widoczność watermark')}
                            className="w-5 h-5 rounded border-2 border-sky-300 text-sky-600 focus:ring-2 focus:ring-sky-200"
                          />
                          <span className="font-semibold">Pokaż logo w tle</span>
                        </label>

                        {/* Upload Watermark */}
                        <div>
                          <input
                            type="file"
                            id="watermark-upload"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const reader = new FileReader();
                                reader.onloadend = () => {
                                  updateState({ watermarkUrl: reader.result as string }, 'Dodano watermark');
                                };
                                reader.readAsDataURL(file);
                              }
                            }}
                            className="hidden"
                          />
                          <label
                            htmlFor="watermark-upload"
                            className="w-full px-4 py-3 bg-linear-to-r from-purple-100 to-pink-100 hover:from-purple-200 hover:to-pink-200 text-purple-700 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer"
                          >
                            <Upload size={20} />
                            {watermarkUrl ? 'Zmień watermark' : 'Upload logo w tle'}
                          </label>
                        </div>

                        {showWatermark && watermarkUrl && (
                          <>
                            {/* Opacity Slider */}
                            <div>
                              <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Przezroczystość: {watermarkOpacity}%
                              </label>
                              <input
                                type="range"
                                min="5"
                                max="50"
                                value={watermarkOpacity}
                                onChange={(e) => updateState({ watermarkOpacity: Number(e.target.value) }, 'Zmieniono przezroczystość')}
                                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-sky-600"
                                title="Przezroczystość watermark (5-50%)"
                                aria-label="Slider przezroczystości watermark"
                              />
                              <div className="flex justify-between text-xs text-gray-500 mt-1">
                                <span>5% (ledwo widoczne)</span>
                                <span>50% (mocne)</span>
                              </div>
                            </div>

                            {/* Size Slider */}
                            <div>
                              <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Rozmiar: {watermarkSize}px
                              </label>
                              <input
                                type="range"
                                min="100"
                                max="600"
                                step="50"
                                value={watermarkSize}
                                onChange={(e) => updateState({ watermarkSize: Number(e.target.value) }, 'Zmieniono rozmiar')}
                                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-sky-600"
                                title="Rozmiar watermark (100-600px)"
                                aria-label="Slider rozmiaru watermark"
                              />
                              <div className="flex justify-between text-xs text-gray-500 mt-1">
                                <span>Małe</span>
                                <span>Duże</span>
                              </div>
                            </div>

                            {/* Rotation Slider */}
                            <div>
                              <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Obrót: {watermarkRotation}°
                              </label>
                              <input
                                type="range"
                                min="-45"
                                max="45"
                                step="5"
                                value={watermarkRotation}
                                onChange={(e) => updateState({ watermarkRotation: Number(e.target.value) }, 'Zmieniono obrót')}
                                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-sky-600"
                                title="Obrót watermark (-45° do 45°)"
                                aria-label="Slider obrotu watermark"
                              />
                              <div className="flex justify-between text-xs text-gray-500 mt-1">
                                <span>-45° (lewo)</span>
                                <span>0° (prosto)</span>
                                <span>45° (prawo)</span>
                              </div>
                            </div>

                            {/* Preview */}
                            <div className="p-4 bg-gray-100 rounded-lg border-2 border-gray-300">
                              <div className="text-xs font-bold text-gray-600 mb-2 text-center">Podgląd watermark</div>
                              <div className="relative h-32 bg-white rounded overflow-hidden flex items-center justify-center">
                                <img
                                  src={watermarkUrl}
                                  alt="Watermark preview"
                                  className="absolute"
                                  style={{
                                    width: `${watermarkSize / 3}px`,
                                    opacity: watermarkOpacity / 100,
                                    transform: `rotate(${watermarkRotation}deg)`,
                                    filter: 'grayscale(100%)',
                                  }}
                                />
                                <div className="text-xs text-gray-400 z-10">Tak będzie wyglądać w tle tabeli</div>
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Rows */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Liczba wierszy</label>
                      <input
                        type="number"
                        min="5"
                        max="30"
                        value={rows}
                        onChange={(e) => updateState({ rows: Number(e.target.value) }, 'Zmieniono liczbę wierszy')}
                        className="w-full px-3 py-2 border-2 border-sky-300 rounded-lg font-bold text-center focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
                        title="Liczba wierszy tabeli (5-30)"
                        placeholder="15"
                      />
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="bg-white rounded-2xl shadow-xl p-6 border-2 border-gray-300">
                <div className="text-center text-gray-500 py-12">
                  <div className="text-4xl mb-3">👈</div>
                  <p className="font-semibold">Wybierz kolumnę do edycji</p>
                  <p className="text-sm mt-2">Kliknij na kolumnę z listy po lewej</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
