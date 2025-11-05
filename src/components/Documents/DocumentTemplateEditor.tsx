/**
 * Document Template Editor
 * Kreatywny edytor szablonów dokumentów biznesowych (umowy, CV, formularze, etc.)
 * Wzorowany na TimesheetTemplateEditor - pełne funkcje DRAG&DROP, themes, export/import
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { DndContext, DragOverlay, closestCenter, PointerSensor, useSensor, useSensors, DragStartEvent, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, useSortable, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Plus, Trash, Copy, DotsSixVertical, DownloadSimple, UploadSimple, FilePdf, FileText } from '@phosphor-icons/react';
import { ColorPickerDual, FontControls, LogoControls, UndoRedoToolbar, ColorThemeSelector } from '@/components/shared/TemplateEditor';
import { useUndoRedo, useUndoRedoKeyboard } from '@/hooks/useUndoRedo';
import { DocumentTemplate, DocumentBlock, BlockType, generateBlockId, mergeTemplateFields } from '@/types/documentTemplate';
import { toast } from 'sonner';

// ==================== TYPES ====================

interface EditorState {
  templateName: string;
  blocks: DocumentBlock[];
  textColor: string;
  backgroundColor: string;
  headerColor: string;
  accentColor: string;
  fontFamily: string;
  fontSize: number;
  lineHeight: number;
  showLogo: boolean;
  logoPosition: 'left' | 'center' | 'right';
  logoSize: 'small' | 'medium' | 'large';
  marginTop: number;
  marginBottom: number;
  marginLeft: number;
  marginRight: number;
}

interface DocumentTemplateEditorProps {
  template?: DocumentTemplate;
  onSave: (template: DocumentTemplate) => void;
  onCancel: () => void;
}

// ==================== SORTABLE BLOCK ITEM ====================

interface SortableBlockItemProps {
  block: DocumentBlock;
  index: number;
  updateBlock: (id: string, updates: Partial<DocumentBlock>) => void;
  removeBlock: (id: string) => void;
  duplicateBlock: (id: string) => void;
}

function SortableBlockItem({ block, index, updateBlock, removeBlock, duplicateBlock }: SortableBlockItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: block.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`p-4 bg-white rounded-lg border-2 ${
        isDragging ? 'border-sky-500 shadow-lg' : 'border-gray-200'
      } mb-3`}
    >
      <div className="flex items-center gap-2 mb-3">
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing p-1 hover:bg-gray-100 rounded"
          title="Przeciągnij aby zmienić kolejność"
        >
          <DotsSixVertical size={20} className="text-gray-400" />
        </button>

        <span className="text-sm font-medium text-gray-500">
          Blok #{index + 1} - {block.type}
        </span>

        <div className="ml-auto flex gap-2">
          <button
            onClick={() => duplicateBlock(block.id)}
            className="p-2 hover:bg-blue-50 rounded text-blue-600"
            title="Duplikuj blok"
          >
            <Copy size={18} />
          </button>
          <button
            onClick={() => removeBlock(block.id)}
            className="p-2 hover:bg-red-50 rounded text-red-600"
            title="Usuń blok"
          >
            <Trash size={18} />
          </button>
        </div>
      </div>

      {/* Block Type Selector */}
      <div className="mb-3">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Typ bloku:
        </label>
        <select
          value={block.type}
          onChange={(e) => updateBlock(block.id, { type: e.target.value as BlockType })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
          aria-label="Typ bloku dokumentu"
          title="Wybierz typ bloku"
        >
          <option value="header">Nagłówek (Header)</option>
          <option value="title">Tytuł (Title)</option>
          <option value="text">Tekst (Text)</option>
          <option value="signature">Podpis (Signature)</option>
          <option value="footer">Stopka (Footer)</option>
          <option value="table">Tabela (Table)</option>
          <option value="list">Lista (List)</option>
          <option value="field">Pole dynamiczne (Field)</option>
        </select>
      </div>

      {/* Content Editor */}
      <div className="mb-3">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Treść: {block.placeholder && <span className="text-gray-400 text-xs">({block.placeholder})</span>}
        </label>
        <textarea
          value={block.content}
          onChange={(e) => updateBlock(block.id, { content: e.target.value })}
          placeholder={block.placeholder || 'Wpisz treść...'}
          rows={block.type === 'text' || block.type === 'signature' ? 6 : 3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 font-mono text-sm"
        />
        <p className="text-xs text-gray-500 mt-1">
          💡 Użyj [NAZWA_POLA] dla pól dynamicznych, np. [COMPANY_NAME], [DATE], [EMPLOYEE_NAME]
        </p>
      </div>

      {/* Styling Options */}
      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Wyrównanie:</label>
          <select
            value={block.alignment || 'left'}
            onChange={(e) => updateBlock(block.id, { alignment: e.target.value as any })}
            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
            aria-label="Wyrównanie tekstu"
            title="Wybierz wyrównanie tekstu"
          >
            <option value="left">Lewo</option>
            <option value="center">Środek</option>
            <option value="right">Prawo</option>
            <option value="justify">Wyjustuj</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Styl:</label>
          <div className="flex gap-2">
            <button
              onClick={() =>
                updateBlock(block.id, {
                  fontWeight: block.fontWeight === 'bold' ? 'normal' : 'bold',
                })
              }
              className={`px-3 py-1 rounded text-sm font-bold ${
                block.fontWeight === 'bold' ? 'bg-sky-500 text-white' : 'bg-gray-200 text-gray-700'
              }`}
              title="Pogrubienie"
            >
              B
            </button>
            <button
              onClick={() =>
                updateBlock(block.id, {
                  fontStyle: block.fontStyle === 'italic' ? 'normal' : 'italic',
                })
              }
              className={`px-3 py-1 rounded text-sm italic ${
                block.fontStyle === 'italic' ? 'bg-sky-500 text-white' : 'bg-gray-200 text-gray-700'
              }`}
              title="Kursywa"
            >
              I
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Rozmiar:</label>
          <input
            type="number"
            value={block.fontSize || 12}
            onChange={(e) => updateBlock(block.id, { fontSize: Number(e.target.value) })}
            min={8}
            max={24}
            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
            title="Rozmiar czcionki (px)"
            aria-label="Rozmiar czcionki w pikselach"
          />
        </div>
      </div>

      {/* Editable & Required */}
      <div className="flex gap-4 mt-3">
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            checked={block.isEditable}
            onChange={(e) => updateBlock(block.id, { isEditable: e.target.checked })}
            className="rounded"
          />
          Edytowalne
        </label>
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            checked={block.isRequired}
            onChange={(e) => updateBlock(block.id, { isRequired: e.target.checked })}
            className="rounded"
          />
          Wymagane
        </label>
      </div>
    </div>
  );
}

// ==================== MAIN COMPONENT ====================

export default function DocumentTemplateEditor({
  template,
  onSave,
  onCancel,
}: DocumentTemplateEditorProps) {
  // Initial state
  const initialState: EditorState = {
    templateName: template?.name || 'Nowy dokument',
    blocks: template?.blocks || [
      {
        id: generateBlockId(),
        type: 'header',
        content: '[COMPANY_NAME]\n[COMPANY_ADDRESS]',
        alignment: 'left',
        isEditable: true,
        isRequired: true,
      },
    ],
    textColor: template?.styles?.textColor || '#000000',
    backgroundColor: template?.styles?.backgroundColor || '#ffffff',
    headerColor: template?.styles?.headerColor || '#1e40af',
    accentColor: template?.styles?.accentColor || '#0ea5e9',
    fontFamily: template?.styles?.fontFamily || 'Arial',
    fontSize: template?.styles?.fontSize || 12,
    lineHeight: template?.styles?.lineHeight || 1.5,
    showLogo: true,
    logoPosition: 'left',
    logoSize: 'medium',
    marginTop: template?.styles?.marginTop || 20,
    marginBottom: template?.styles?.marginBottom || 20,
    marginLeft: template?.styles?.marginLeft || 25,
    marginRight: template?.styles?.marginRight || 25,
  };

  // Undo/Redo state management
  const {
    currentState,
    pushState: updateState,
    undo,
    redo,
    canUndo,
    canRedo,
  } = useUndoRedo<EditorState>({ initialState, maxHistory: 20 });

  const {
    templateName,
    blocks,
    textColor,
    backgroundColor,
    headerColor,
    accentColor,
    fontFamily,
    fontSize,
    lineHeight,
    showLogo,
    logoPosition,
    logoSize,
    marginTop,
    marginBottom,
    marginLeft,
    marginRight,
  } = currentState;

  // Drag & Drop
  const [activeId, setActiveId] = useState<string | null>(null);
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = blocks.findIndex((b) => b.id === active.id);
      const newIndex = blocks.findIndex((b) => b.id === over.id);
      
      updateState(
        {
          ...currentState,
          blocks: arrayMove(blocks, oldIndex, newIndex),
        },
        'Przesunięto blok'
      );
    }

    setActiveId(null);
  };

  // File input ref for import
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcuts
  const { handleKeyDown } = useUndoRedoKeyboard(
    undo,
    redo,
    handleSave,
    () => {
      // Ctrl+D - Duplicate first block
      if (blocks.length > 0) {
        const firstBlock = blocks[0];
        const duplicated: DocumentBlock = {
          ...firstBlock,
          id: generateBlockId(),
        };
        updateState(
          { ...currentState, blocks: [...blocks, duplicated] },
          'Zduplikowano blok'
        );
        toast.success('Zduplikowano pierwszy blok');
      }
    },
    () => {
      // Ctrl+P - Preview
      toast.info('Podgląd dokumentu (funkcja w przygotowaniu)');
    }
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Export/Import JSON
  const handleExportJSON = () => {
    const exportData = {
      templateName,
      blocks,
      styles: {
        textColor,
        backgroundColor,
        headerColor,
        accentColor,
        fontFamily,
        fontSize,
        lineHeight,
        marginTop,
        marginBottom,
        marginLeft,
        marginRight,
      },
    };

    const json = JSON.stringify(exportData, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${templateName.replace(/\s+/g, '-').toLowerCase()}-template.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Szablon wyeksportowany!');
  };

  const handleImportJSON = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target?.result as string);
        
        updateState({
          templateName: imported.templateName || 'Importowany dokument',
          blocks: imported.blocks || [],
          textColor: imported.styles?.textColor || '#000000',
          backgroundColor: imported.styles?.backgroundColor || '#ffffff',
          headerColor: imported.styles?.headerColor || '#1e40af',
          accentColor: imported.styles?.accentColor || '#0ea5e9',
          fontFamily: imported.styles?.fontFamily || 'Arial',
          fontSize: imported.styles?.fontSize || 12,
          lineHeight: imported.styles?.lineHeight || 1.5,
          showLogo,
          logoPosition,
          logoSize,
          marginTop: imported.styles?.marginTop || 20,
          marginBottom: imported.styles?.marginBottom || 20,
          marginLeft: imported.styles?.marginLeft || 25,
          marginRight: imported.styles?.marginRight || 25,
        }, 'Zaimportowano szablon');

        toast.success('Szablon zaimportowany!');
      } catch (error) {
        toast.error('Błąd importu - nieprawidłowy format JSON');
      }
    };
    reader.readAsText(file);

    // Reset input
    event.target.value = '';
  };

  // Validation & Save
  function handleSave() {
    const errors: string[] = [];

    if (!templateName.trim()) {
      errors.push('Nazwa szablonu jest wymagana');
    }

    if (blocks.length === 0) {
      errors.push('Dodaj przynajmniej 1 blok');
    }

    const requiredBlocks = blocks.filter(b => b.isRequired);
    const emptyRequired = requiredBlocks.filter(b => !b.content.trim());
    if (emptyRequired.length > 0) {
      errors.push(`${emptyRequired.length} wymagany(ch) blok(ów) jest pustych`);
    }

    if (errors.length > 0) {
      toast.error('Błędy walidacji:\n• ' + errors.join('\n• '));
      return;
    }

    // Create template
    const newTemplate: DocumentTemplate = {
      id: template?.id || `doc-${Date.now()}`,
      name: templateName,
      category: template?.category || 'business',
      description: template?.description || 'Niestandardowy szablon dokumentu',
      language: 'nl',
      blocks,
      fields: [], // TODO: Extract from [FIELD_NAME] placeholders
      styles: {
        fontFamily,
        fontSize,
        lineHeight,
        textColor,
        backgroundColor,
        headerColor,
        accentColor,
        marginTop,
        marginBottom,
        marginLeft,
        marginRight,
        pageSize: 'A4',
        orientation: 'portrait',
      },
      tags: template?.tags || ['custom'],
      createdAt: template?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isCustom: true,
    };

    onSave(newTemplate);
    toast.success('Szablon zapisany!');
  }

  // Block operations
  const addBlock = useCallback(
    (type: BlockType = 'text') => {
      const newBlock: DocumentBlock = {
        id: generateBlockId(),
        type,
        content: '',
        alignment: 'left',
        isEditable: true,
        isRequired: false,
        placeholder: 'Wpisz treść...',
      };

      updateState(
        { ...currentState, blocks: [...blocks, newBlock] },
        'Dodano blok'
      );
    },
    [currentState, blocks, updateState]
  );

  const removeBlock = useCallback(
    (id: string) => {
      updateState(
        { ...currentState, blocks: blocks.filter((b) => b.id !== id) },
        'Usunięto blok'
      );
    },
    [currentState, blocks, updateState]
  );

  const duplicateBlock = useCallback(
    (id: string) => {
      const blockToDuplicate = blocks.find((b) => b.id === id);
      if (!blockToDuplicate) return;

      const duplicated: DocumentBlock = {
        ...blockToDuplicate,
        id: generateBlockId(),
      };

      const index = blocks.findIndex((b) => b.id === id);
      const newBlocks = [...blocks];
      newBlocks.splice(index + 1, 0, duplicated);

      updateState({ ...currentState, blocks: newBlocks }, 'Zduplikowano blok');
    },
    [currentState, blocks, updateState]
  );

  const updateBlock = useCallback(
    (id: string, updates: Partial<DocumentBlock>) => {
      updateState(
        {
          ...currentState,
          blocks: blocks.map((b) => (b.id === id ? { ...b, ...updates } : b)),
        },
        'Zaktualizowano blok'
      );
    },
    [currentState, blocks, updateState]
  );

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-sky-500 to-blue-600 p-4 text-white">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <input
              type="text"
              value={templateName}
              onChange={(e) => updateState({ ...currentState, templateName: e.target.value }, 'Zmieniono nazwę')}
              className="bg-white/20 backdrop-blur-sm text-white placeholder-white/70 px-4 py-2 rounded-lg text-lg font-semibold w-full max-w-md focus:outline-none focus:ring-2 focus:ring-white/50"
              placeholder="Nazwa dokumentu..."
            />
          </div>

          <div className="flex gap-2">
            <UndoRedoToolbar
              onUndo={undo}
              onRedo={redo}
              canUndo={canUndo}
              canRedo={canRedo}
            />
            <button
              onClick={handleExportJSON}
              className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg flex items-center gap-2 font-medium transition-colors"
              title="Eksportuj jako JSON"
            >
              <DownloadSimple size={20} />
              Export JSON
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg flex items-center gap-2 font-medium transition-colors"
              title="Importuj z JSON"
            >
              <UploadSimple size={20} />
              Import JSON
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleImportJSON}
              className="hidden"
              aria-label="Importuj szablon dokumentu JSON"
            />
            <button
              onClick={onCancel}
              className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg font-medium transition-colors"
            >
              Anuluj
            </button>
            <button
              onClick={handleSave}
              className="px-6 py-2 bg-white text-sky-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Zapisz
            </button>
          </div>
        </div>
      </div>

      {/* Main Content - 3 panels */}
      <div className="flex-1 grid grid-cols-12 gap-4 p-4 overflow-hidden">
        {/* Left Panel - Tools (3 cols) */}
        <div className="col-span-3 overflow-y-auto space-y-4">
          <div className="bg-white rounded-lg shadow-md p-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">🎨 Motywy kolorów</h3>
            <ColorThemeSelector
              onSelectTheme={(theme) => {
                updateState(
                  {
                    ...currentState,
                    headerColor: theme.colors.headerStart,
                    accentColor: theme.colors.headerEnd,
                    textColor: theme.colors.borderColor,
                    fontSize: theme.fontSize,
                  },
                  'Zastosowano motyw'
                );
              }}
              currentGradientStart={headerColor}
              currentGradientEnd={accentColor}
            />
          </div>

          <div className="bg-white rounded-lg shadow-md p-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">🎨 Kolory</h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Kolor nagłówka:
              </label>
              <input
                type="color"
                value={headerColor}
                onChange={(e) => updateState({ ...currentState, headerColor: e.target.value }, 'Zmieniono kolor nagłówka')}
                className="w-full h-10 rounded cursor-pointer"
                title="Kolor nagłówka dokumentu"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Kolor akcentu:
              </label>
              <input
                type="color"
                value={accentColor}
                onChange={(e) => updateState({ ...currentState, accentColor: e.target.value }, 'Zmieniono kolor akcentu')}
                className="w-full h-10 rounded cursor-pointer"
                title="Kolor akcentu dokumentu"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Kolor tekstu:
              </label>
              <input
                type="color"
                value={textColor}
                onChange={(e) => updateState({ ...currentState, textColor: e.target.value }, 'Zmieniono kolor tekstu')}
                className="w-full h-10 rounded cursor-pointer"
                title="Kolor tekstu dokumentu"
              />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">✍️ Czcionka</h3>
            <FontControls
              fontSize={fontSize}
              onFontSizeChange={(size) => updateState({ ...currentState, fontSize: size }, 'Zmieniono rozmiar czcionki')}
              fontFamily={fontFamily}
              onFontFamilyChange={(family) => updateState({ ...currentState, fontFamily: family }, 'Zmieniono czcionkę')}
            />
          </div>

          <div className="bg-white rounded-lg shadow-md p-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">🖼️ Logo</h3>
            <LogoControls
              showLogo={showLogo}
              onShowLogoChange={(show) => updateState({ ...currentState, showLogo: show }, 'Zmieniono widoczność logo')}
              logoPosition={logoPosition}
              onLogoPositionChange={(pos) => updateState({ ...currentState, logoPosition: pos }, 'Zmieniono pozycję logo')}
            />
          </div>

          <div className="bg-white rounded-lg shadow-md p-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">📏 Marginesy (mm)</h3>
            <div className="space-y-3">
              <div>
                <label className="text-sm text-gray-700">Góra: {marginTop}mm</label>
                <input
                  type="range"
                  min={10}
                  max={50}
                  value={marginTop}
                  onChange={(e) => updateState({ ...currentState, marginTop: Number(e.target.value) }, 'Zmieniono margines')}
                  className="w-full"
                  title="Margines górny (10-50mm)"
                />
              </div>
              <div>
                <label className="text-sm text-gray-700">Dół: {marginBottom}mm</label>
                <input
                  type="range"
                  min={10}
                  max={50}
                  value={marginBottom}
                  onChange={(e) => updateState({ ...currentState, marginBottom: Number(e.target.value) }, 'Zmieniono margines')}
                  className="w-full"
                  title="Margines dolny (10-50mm)"
                />
              </div>
              <div>
                <label className="text-sm text-gray-700">Lewo: {marginLeft}mm</label>
                <input
                  type="range"
                  min={10}
                  max={50}
                  value={marginLeft}
                  onChange={(e) => updateState({ ...currentState, marginLeft: Number(e.target.value) }, 'Zmieniono margines')}
                  className="w-full"
                  title="Margines lewy (10-50mm)"
                />
              </div>
              <div>
                <label className="text-sm text-gray-700">Prawo: {marginRight}mm</label>
                <input
                  type="range"
                  min={10}
                  max={50}
                  value={marginRight}
                  onChange={(e) => updateState({ ...currentState, marginRight: Number(e.target.value) }, 'Zmieniono margines')}
                  className="w-full"
                  title="Margines prawy (10-50mm)"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Middle Panel - Blocks Editor (5 cols) */}
        <div className="col-span-5 bg-white rounded-lg shadow-md p-4 overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">📄 Bloki dokumentu</h3>
            <button
              onClick={() => addBlock('text')}
              className="px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-lg flex items-center gap-2 font-medium transition-colors"
            >
              <Plus size={20} />
              Dodaj blok
            </button>
          </div>

          {blocks.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <FileText size={64} className="mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">Brak bloków</p>
              <p className="text-sm">Kliknij "Dodaj blok" aby rozpocząć</p>
            </div>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={blocks.map((b) => b.id)}
                strategy={verticalListSortingStrategy}
              >
                {blocks.map((block, index) => (
                  <SortableBlockItem
                    key={block.id}
                    block={block}
                    index={index}
                    updateBlock={updateBlock}
                    removeBlock={removeBlock}
                    duplicateBlock={duplicateBlock}
                  />
                ))}
              </SortableContext>
              <DragOverlay>
                {activeId ? (
                  <div className="p-4 bg-white rounded-lg border-2 border-sky-500 shadow-2xl opacity-90">
                    <p className="text-sm font-medium text-gray-700">
                      Przeciąganie bloku...
                    </p>
                  </div>
                ) : null}
              </DragOverlay>
            </DndContext>
          )}
        </div>

        {/* Right Panel - Live Preview (4 cols) */}
        <div className="col-span-4 bg-white rounded-lg shadow-md p-4 overflow-y-auto">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">👁️ Podgląd na żywo</h3>
          
          <div
            className="border-2 rounded-lg overflow-hidden shadow-lg"
            style={{
              backgroundColor,
              padding: `${marginTop}px ${marginRight}px ${marginBottom}px ${marginLeft}px`,
              fontFamily,
              fontSize: `${fontSize}px`,
              lineHeight,
              color: textColor,
            }}
          >
            {/* Logo */}
            {showLogo && (
              <div
                className={`mb-4 flex ${
                  logoPosition === 'left' ? 'justify-start' : logoPosition === 'right' ? 'justify-end' : 'justify-center'
                }`}
              >
                <div
                  className={`bg-gray-200 rounded flex items-center justify-center text-gray-400 ${
                    logoSize === 'small' ? 'w-16 h-12' : logoSize === 'medium' ? 'w-24 h-20' : 'w-32 h-32'
                  }`}
                >
                  Logo
                </div>
              </div>
            )}

            {/* Blocks */}
            {blocks.map((block) => {
              const blockStyle = {
                textAlign: block.alignment || 'left',
                fontWeight: block.fontWeight || 'normal',
                fontStyle: block.fontStyle || 'normal',
                fontSize: block.fontSize ? `${block.fontSize}px` : undefined,
                color: block.color || textColor,
                marginBottom: '12px',
              };

              if (block.type === 'header') {
                return (
                  <div
                    key={block.id}
                    style={{ ...blockStyle, color: headerColor, fontWeight: 'bold', fontSize: '16px' }}
                  >
                    {block.content.split('\n').map((line, i) => (
                      <div key={i}>{line || '\u00A0'}</div>
                    ))}
                  </div>
                );
              }

              if (block.type === 'title') {
                return (
                  <div
                    key={block.id}
                    style={{ ...blockStyle, color: accentColor, fontWeight: 'bold', fontSize: '18px' }}
                  >
                    {block.content}
                  </div>
                );
              }

              if (block.type === 'signature') {
                return (
                  <div key={block.id} style={{ ...blockStyle, marginTop: '24px' }}>
                    {block.content.split('\n').map((line, i) => (
                      <div key={i}>{line || '\u00A0'}</div>
                    ))}
                  </div>
                );
              }

              return (
                <div key={block.id} style={blockStyle as React.CSSProperties}>
                  {block.content.split('\n').map((line, i) => (
                    <div key={i}>{line || '\u00A0'}</div>
                  ))}
                </div>
              );
            })}
          </div>

          <div className="mt-4 p-3 bg-blue-50 rounded-lg text-sm text-gray-700">
            <p className="font-medium mb-2">💡 Skróty klawiszowe:</p>
            <ul className="space-y-1 text-xs">
              <li>• Ctrl+Z - Cofnij</li>
              <li>• Ctrl+Y - Ponów</li>
              <li>• Ctrl+S - Zapisz</li>
              <li>• Ctrl+D - Duplikuj pierwszy blok</li>
              <li>• Ctrl+P - Podgląd (wkrótce)</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
