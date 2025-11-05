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
import { Plus, Trash, Copy, DotsSixVertical, DownloadSimple, UploadSimple } from '@phosphor-icons/react';
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
  const { templateName, columns, headerGradientStart, headerGradientEnd, borderColor, fontSize, showLogo, rows } = currentState;

  // Drag & Drop state
  const [activeId, setActiveId] = useState<string | null>(null);

  // File input ref for import
  const fileInputRef = useRef<HTMLInputElement>(null);

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
        fontFamily: 'Arial, sans-serif'
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
          rows: importedTemplate.config.rows
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
        fontFamily: 'Arial, sans-serif'
      },
      createdAt: template?.createdAt || new Date(),
      updatedAt: new Date()
    };
    onSave(newTemplate);
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-blue-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT PANEL - Narzędzia */}
          <div className="lg:col-span-1 space-y-4">
            {/* Color Theme Selector - NEW! */}
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

            {/* Kolory - Gradient Picker */}
            <ColorPickerDual
              startColor={headerGradientStart}
              endColor={headerGradientEnd}
              onStartColorChange={(color) => updateState({ headerGradientStart: color }, 'Zmieniono kolor start')}
              onEndColorChange={(color) => updateState({ headerGradientEnd: color }, 'Zmieniono kolor end')}
              label="Kolory nagłówka (dostosuj)"
            />

            {/* Border Color Picker */}
            <div className="bg-white rounded-2xl shadow-xl p-6 border-2 border-sky-300">
              <h3 className="font-bold text-lg mb-4">Kolor ramek</h3>
              <div className="flex gap-3">
                <input
                  type="color"
                  value={borderColor}
                  onChange={(e) => updateState({ borderColor: e.target.value }, 'Zmieniono kolor ramek')}
                  className="w-16 h-12 rounded-lg border-2 border-gray-300 cursor-pointer"
                  title="Wybierz kolor ramek"
                />
                <input
                  type="text"
                  value={borderColor}
                  onChange={(e) => updateState({ borderColor: e.target.value }, 'Zmieniono kolor ramek')}
                  className="flex-1 px-3 py-2 border-2 border-sky-300 rounded-lg font-mono text-sm"
                  placeholder="#e5e7eb"
                />
              </div>
            </div>

            {/* Font Controls */}
            <FontControls
              fontSize={fontSize}
              onFontSizeChange={(size) => updateState({ fontSize: size }, 'Zmieniono rozmiar czcionki')}
            />

            {/* Logo Controls */}
            <LogoControls
              showLogo={showLogo}
              onShowLogoChange={(show) => updateState({ showLogo: show }, 'Zmieniono widoczność logo')}
            />

            {/* Ustawienia */}
            <div className="bg-white rounded-2xl shadow-xl p-6 border-2 border-sky-300">
              <h3 className="font-bold text-lg mb-4">Ustawienia</h3>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Liczba wierszy</label>
                <input
                  type="number"
                  min="5"
                  max="30"
                  value={rows}
                  onChange={(e) => updateState({ rows: Number(e.target.value) }, 'Zmieniono liczbę wierszy')}
                  className="w-full px-3 py-2 border-2 border-sky-300 rounded-lg font-bold text-center"
                />
              </div>
            </div>
          </div>

          {/* RIGHT PANEL - Edytor kolumn + Podgląd */}
          <div className="lg:col-span-2 space-y-4">
            {/* Kolumny */}
            <div className="bg-white rounded-2xl shadow-xl p-6 border-2 border-sky-300">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-lg">Kolumny ({columns.length})</h3>
                <button
                  onClick={addColumn}
                  className="px-4 py-2 bg-linear-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white rounded-lg font-bold shadow-lg transition-all flex items-center gap-2"
                >
                  <Plus size={18} weight="bold" />
                  Dodaj kolumnę
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
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {columns.map((column, index) => (
                      <SortableColumnItem
                        key={column.id}
                        column={column}
                        index={index}
                        totalColumns={columns.length}
                        onUpdate={(field, value) => updateColumn(index, field, value)}
                        onMoveLeft={() => moveColumn(index, 'left')}
                        onMoveRight={() => moveColumn(index, 'right')}
                        onDuplicate={() => duplicateColumn(index)}
                        onRemove={() => removeColumn(index)}
                      />
                    ))}
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

            {/* Podgląd na żywo */}
            <div className="bg-white rounded-2xl shadow-xl p-6 border-2 border-sky-300">
              <h3 className="font-bold text-lg mb-4">Podgląd</h3>
              
              <div className="bg-gray-100 p-4 rounded-xl overflow-x-auto">
                <div className="min-w-[800px] bg-white border-2 rounded-lg overflow-hidden" style={{ borderColor: borderColor }}>
                  {/* Header */}
                  <div 
                    className="grid" 
                    style={{ 
                      gridTemplateColumns: columns.map(c => c.width).join(' '), 
                      background: `linear-gradient(to right, ${headerGradientStart}, ${headerGradientEnd})` 
                    }}
                  >
                    {columns.map((col) => (
                      <div
                        key={col.id}
                        className="p-2 font-bold text-center border-r text-white"
                        style={{ borderColor: borderColor, fontSize: `${fontSize}px` }}
                      >
                        {col.label}
                      </div>
                    ))}
                  </div>
                  
                  {/* Sample Rows */}
                  {Array.from({ length: Math.min(rows, 5) }).map((_, i) => (
                    <div key={i} className="grid" style={{ gridTemplateColumns: columns.map(c => c.width).join(' ') }}>
                      {columns.map((col) => (
                        <div
                          key={col.id}
                          className="p-2 border-r border-b text-center"
                          style={{ borderColor: borderColor, fontSize: `${fontSize}px` }}
                        >
                          {col.type === 'number' ? '8' : col.type === 'date' ? '01-01-2025' : 'Przykład'}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
