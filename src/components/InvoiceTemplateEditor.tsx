/**
 * INVOICE TEMPLATE EDITOR - Visual Builder v2 (CLEAN REBUILD)
 * 
 * FUNKCJE (zgodne z TimesheetTemplateEditor):
 * ✅ UNDO/REDO (Ctrl+Z/Ctrl+Y) - 20-step history
 * ✅ Gradient colors (dual picker) - start/end colors
 * ✅ Template library - presets faktur
 * ✅ Logo upload - ColorPickerDual, FontControls, LogoControls
 * ✅ Keyboard shortcuts (Ctrl+S save, Ctrl+D duplicate)
 * ✅ Drag & Drop blocks - reorder invoice sections
 * ✅ Export/Import JSON - share templates
 * 
 * BLOKI FAKTURY:
 * 1. company-info - Dane firmy
 * 2. client-info - Dane klienta  
 * 3. invoice-header - Nagłówek (Nr faktury, data)
 * 4. items-table - Tabela pozycji
 * 5. totals - Suma końcowa
 * 6. payment-info - Informacje o płatności
 * 7. notes - Notatki/warunki
 * 8. footer - Stopka
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Plus, 
  Trash, 
  Copy, 
  DotsSixVertical, 
  DownloadSimple, 
  UploadSimple, 
  Eye, 
  EyeSlash,
  ListBullets,
  Image as ImageIcon,
  FacebookLogo,
  LinkedinLogo,
  InstagramLogo,
  TwitterLogo
} from '@phosphor-icons/react';
import type { InvoiceBlock, InvoiceTemplateLayout, InvoiceBlockType } from '@/types/invoiceTemplate';
import { useUndoRedo, useUndoRedoKeyboard } from '@/hooks/useUndoRedo';
import { ColorPickerDual, FontControls, LogoControls, UndoRedoToolbar } from '@/components/shared/TemplateEditor';
import LiveInvoicePreview from '@/components/shared/TemplateEditor/LiveInvoicePreview';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { toast } from 'sonner';

// Editor State Interface
interface EditorState {
  templateName: string;
  blocks: InvoiceBlock[];
  headerGradientStart: string;
  headerGradientEnd: string;
  primaryColorStart: string;
  primaryColorEnd: string;
  accentColorStart: string;
  accentColorEnd: string;
  backgroundColor: string;
  textColor: string;
  borderColor: string;
  fontSize: { heading: number; body: number; small: number };
  fontFamily: { heading: string; body: string };
  logoUrl?: string;
  logoPosition: 'left' | 'center' | 'right';
  // NEW: Advanced logo control
  logoX: number;  // X position in px
  logoY: number;  // Y position in px
  logoWidth: number;  // Width in px
  logoHeight: number;  // Height in px
  logoOpacity: number;  // 0-100%
  showLogo: boolean;
  // NEW: QR Code settings
  qrCode: {
    enabled: boolean;
    position: 'top-right' | 'bottom-right' | 'bottom-left';
    size: number; // 80-200px
    data: string; // Payment URL or text
  };
  // NEW: Warning Box (yellow alert for reverse charge/important info)
  warningBox: {
    enabled: boolean;
    text: string;
    backgroundColor: string;
    textColor: string;
    icon: string; // emoji or unicode
  };
  // NEW: Social Media links (footer icons)
  socialMedia: {
    enabled: boolean;
    facebook?: string;
    linkedin?: string;
    instagram?: string;
    twitter?: string;
  };
  pageSize: 'A4' | 'Letter';
  orientation: 'portrait' | 'landscape';
}

interface InvoiceTemplateEditorProps {
  existingTemplate?: InvoiceTemplateLayout;
  onBack: () => void;
}

// DEFAULT INVOICE BLOCKS (8 sections)
const DEFAULT_BLOCKS: InvoiceBlock[] = [
  { id: 'company-info', type: 'company-info', label: 'Dane firmy', visible: true, order: 1 },
  { id: 'client-info', type: 'client-info', label: 'Dane klienta', visible: true, order: 2 },
  { id: 'invoice-header', type: 'invoice-header', label: 'Nagłówek faktury', visible: true, order: 3 },
  { id: 'items-table', type: 'items-table', label: 'Tabela pozycji', visible: true, order: 4 },
  { id: 'totals', type: 'totals', label: 'Suma końcowa', visible: true, order: 5 },
  { id: 'payment-info', type: 'payment-info', label: 'Płatność', visible: true, order: 6 },
  { id: 'notes', type: 'notes', label: 'Notatki', visible: true, order: 7 },
  { id: 'footer', type: 'footer', label: 'Stopka', visible: true, order: 8 },
];

// Sortable Block Item Component
interface SortableBlockItemProps {
  block: InvoiceBlock;
  index: number;
  totalBlocks: number;
  onUpdate: (field: keyof InvoiceBlock, value: any) => void;
  onToggleVisible: () => void;
  onDuplicate: () => void;
  onRemove: () => void;
}

const SortableBlockItem: React.FC<SortableBlockItemProps> = ({
  block,
  index,
  totalBlocks,
  onUpdate,
  onToggleVisible,
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
      className={`bg-white border-2 rounded-xl p-4 transition-all ${
        isDragging ? 'border-sky-500 shadow-lg z-50' : 'border-gray-200 hover:border-sky-300'
      } ${!block.visible ? 'opacity-50 bg-gray-50' : ''}`}
    >
      <div className="flex items-start gap-3">
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing mt-2"
        >
          <DotsSixVertical size={24} className="text-gray-400" />
        </div>
        
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3">
            <button
              onClick={onToggleVisible}
              className={`p-2 rounded-lg transition-all ${
                block.visible ? 'bg-sky-100 text-sky-600' : 'bg-gray-100 text-gray-400'
              }`}
              title={block.visible ? 'Ukryj blok' : 'Pokaż blok'}
            >
              {block.visible ? <Eye size={20} /> : <EyeSlash size={20} />}
            </button>
            
            <div className="flex-1">
              <label className="block text-xs font-bold text-gray-600 mb-1">Nazwa bloku</label>
              <input
                type="text"
                value={block.label}
                onChange={(e) => onUpdate('label', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-semibold"
                placeholder="Nazwa bloku"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1">Typ</label>
              <select
                value={block.type}
                onChange={(e) => onUpdate('type', e.target.value as InvoiceBlockType)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                aria-label="Typ bloku"
                title="Wybierz typ bloku"
              >
                <option value="company-info">Dane firmy</option>
                <option value="client-info">Dane klienta</option>
                <option value="invoice-header">Nagłówek</option>
                <option value="items-table">Tabela pozycji</option>
                <option value="totals">Suma</option>
                <option value="payment-info">Płatność</option>
                <option value="notes">Notatki</option>
                <option value="footer">Stopka</option>
              </select>
            </div>
          </div>

          {/* Block Style Controls */}
          {block.visible && (
            <div className="grid grid-cols-3 gap-3 mt-3 pt-3 border-t border-gray-200">
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">Kolor tła</label>
                <input
                  type="color"
                  value={block.styles?.backgroundColor || '#ffffff'}
                  onChange={(e) => onUpdate('styles', { ...block.styles, backgroundColor: e.target.value })}
                  className="w-full h-10 rounded cursor-pointer"
                  title="Kolor tła bloku"
                  aria-label="Wybierz kolor tła"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">Kolor tekstu</label>
                <input
                  type="color"
                  value={block.styles?.textColor || '#1f2937'}
                  onChange={(e) => onUpdate('styles', { ...block.styles, textColor: e.target.value })}
                  className="w-full h-10 rounded cursor-pointer"
                  title="Kolor tekstu bloku"
                  aria-label="Wybierz kolor tekstu"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">Rozmiar fontu</label>
                <input
                  type="number"
                  value={block.styles?.fontSize || 10}
                  onChange={(e) => onUpdate('styles', { ...block.styles, fontSize: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  min="8"
                  max="24"
                  title="Rozmiar fontu (px)"
                  aria-label="Rozmiar fontu w pikselach"
                />
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <button
            onClick={onDuplicate}
            className="p-2 hover:bg-sky-100 rounded"
            title="Duplikuj blok"
          >
            <Copy size={16} className="text-sky-600" />
          </button>
          <button
            onClick={onRemove}
            className="p-2 hover:bg-red-100 rounded"
            title="Usuń blok"
          >
            <Trash size={16} className="text-red-600" />
          </button>
        </div>
      </div>
    </div>
  );
};

// MAIN COMPONENT
export default function InvoiceTemplateEditor({ existingTemplate, onBack }: InvoiceTemplateEditorProps) {
  // Initial state from existing template or defaults
  const initialState: EditorState = {
    templateName: existingTemplate?.name || 'Nowy Szablon Faktury',
    blocks: existingTemplate?.blocks || DEFAULT_BLOCKS,
    headerGradientStart: '#0ea5e9', // sky-500
    headerGradientEnd: '#2563eb',   // blue-600
    primaryColorStart: '#0ea5e9',
    primaryColorEnd: '#2563eb',
    accentColorStart: '#0284c7',    // sky-600
    accentColorEnd: '#1e40af',      // blue-800
    backgroundColor: '#ffffff',
    textColor: '#1f2937',           // gray-800
    borderColor: '#e5e7eb',         // gray-200
    fontSize: {
      heading: 14,
      body: 10,
      small: 8,
    },
    fontFamily: {
      heading: 'Arial',
      body: 'Arial',
    },
    logoUrl: existingTemplate?.logo?.url || '',
    logoPosition: existingTemplate?.logo?.position || 'left',
    // NEW: Advanced logo control with defaults
    logoX: 20,
    logoY: 20,
    logoWidth: existingTemplate?.logo?.size?.width || 120,
    logoHeight: existingTemplate?.logo?.size?.height || 60,
    logoOpacity: 100,
    showLogo: existingTemplate?.logo?.showInHeader ?? true,
    // NEW: QR Code settings
    qrCode: {
      enabled: false,
      position: 'bottom-right',
      size: 100,
      data: '', // Will be filled with payment data
    },
    // NEW: Warning Box (reverse charge warning)
    warningBox: {
      enabled: false,
      text: '⚠️ REVERSE CHARGE: BTW verlegd naar de afnemer volgens artikel 12b Wet OB',
      backgroundColor: '#fef3c7', // yellow-100
      textColor: '#92400e', // yellow-900
      icon: '⚠️',
    },
    // NEW: Social Media links
    socialMedia: {
      enabled: false,
      facebook: '',
      linkedin: '',
      instagram: '',
      twitter: '',
    },
    pageSize: existingTemplate?.pageSize || 'A4',
    orientation: existingTemplate?.orientation || 'portrait',
  };

  // UNDO/REDO System (20-step history)
  const {
    currentState,
    pushState,
    undo,
    redo,
    canUndo,
    canRedo
  } = useUndoRedo<EditorState>({ initialState, maxHistory: 20 });

  // Destructure current state
  const {
    templateName,
    blocks,
    headerGradientStart,
    headerGradientEnd,
    primaryColorStart,
    primaryColorEnd,
    accentColorStart,
    accentColorEnd,
    backgroundColor,
    textColor,
    borderColor,
    fontSize,
    fontFamily,
    logoUrl,
    logoPosition,
    logoX,
    logoY,
    logoWidth,
    logoHeight,
    logoOpacity,
    showLogo,
    qrCode,
    warningBox,
    socialMedia,
    pageSize,
    orientation,
  } = currentState;

  // Drag & Drop state
  const [activeId, setActiveId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sensors for drag & drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
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
      const oldIndex = blocks.findIndex((b) => b.id === active.id);
      const newIndex = blocks.findIndex((b) => b.id === over.id);
      
      const newBlocks = arrayMove(blocks, oldIndex, newIndex).map((block, idx) => ({
        ...block,
        order: idx + 1,
      }));
      updateState({ blocks: newBlocks }, 'Przesunięto blok');
    }
    
    setActiveId(null);
  };

  // Helper: Update state with history tracking
  const updateState = (updates: Partial<EditorState>, description: string) => {
    pushState({ ...currentState, ...updates }, description);
  };

  // Add new block
  const addBlock = (type: InvoiceBlockType) => {
    const newBlock: InvoiceBlock = {
      id: `block-${Date.now()}`,
      type,
      label: `Nowy blok (${type})`,
      visible: true,
      order: blocks.length + 1,
      styles: {
        backgroundColor: '#ffffff',
        textColor: '#1f2937',
        fontSize: 10,
      },
    };
    updateState({ blocks: [...blocks, newBlock] }, 'Dodano blok');
  };

  // Remove block
  const removeBlock = (index: number) => {
    updateState({ blocks: blocks.filter((_, i) => i !== index) }, 'Usunięto blok');
  };

  // Duplicate block
  const duplicateBlock = (index: number) => {
    const block = blocks[index];
    const newBlock: InvoiceBlock = {
      ...block,
      id: `block-${Date.now()}`,
      label: block.label + ' (kopia)',
      order: block.order + 1,
    };
    const newBlocks = [...blocks];
    newBlocks.splice(index + 1, 0, newBlock);
    updateState({ blocks: newBlocks }, 'Zduplikowano blok');
  };

  // Update block field
  const updateBlock = (index: number, field: keyof InvoiceBlock, value: any) => {
    const newBlocks = [...blocks];
    (newBlocks[index] as any)[field] = value;
    updateState({ blocks: newBlocks }, `Zaktualizowano ${field}`);
  };

  // Toggle block visibility
  const toggleBlockVisible = (index: number) => {
    const newBlocks = [...blocks];
    newBlocks[index].visible = !newBlocks[index].visible;
    updateState({ blocks: newBlocks }, 'Przełączono widoczność');
  };

  // EXPORT template to JSON
  const handleExportTemplate = () => {
    const exportData: InvoiceTemplateLayout = {
      id: existingTemplate?.id || `invoice-template-${Date.now()}`,
      name: templateName,
      description: `Szablon faktury - ${blocks.filter(b => b.visible).length} bloków`,
      blocks,
      colors: {
        primary: `linear-gradient(to right, ${primaryColorStart}, ${primaryColorEnd})`,
        secondary: `linear-gradient(to right, ${headerGradientStart}, ${headerGradientEnd})`,
        accent: `linear-gradient(to right, ${accentColorStart}, ${accentColorEnd})`,
        text: textColor,
        background: backgroundColor,
      },
      fonts: {
        heading: fontFamily.heading,
        body: fontFamily.body,
        size: fontSize,
      },
      logo: showLogo ? {
        url: logoUrl || '',
        position: logoPosition,
        size: { width: logoWidth, height: logoHeight },
        showInHeader: showLogo,
      } : undefined,
      pageSize,
      orientation,
      createdAt: existingTemplate?.createdAt || new Date(),
      updatedAt: new Date(),
    };

    const jsonString = JSON.stringify(exportData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${templateName.replace(/\s+/g, '-')}-template.json`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success(`Szablon "${templateName}" wyeksportowany!`);
  };

  // IMPORT template from JSON
  const handleImportTemplate = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target?.result as string) as InvoiceTemplateLayout;
        
        if (!imported.blocks || imported.blocks.length === 0) {
          toast.error('Nieprawidłowy format szablonu!');
          return;
        }

        // Extract gradient colors
        const primaryMatch = imported.colors?.primary?.match(/#[0-9a-fA-F]{6}/g);
        const secondaryMatch = imported.colors?.secondary?.match(/#[0-9a-fA-F]{6}/g);
        const accentMatch = imported.colors?.accent?.match(/#[0-9a-fA-F]{6}/g);

        updateState({
          templateName: imported.name,
          blocks: imported.blocks,
          primaryColorStart: primaryMatch?.[0] || '#0ea5e9',
          primaryColorEnd: primaryMatch?.[1] || '#2563eb',
          headerGradientStart: secondaryMatch?.[0] || '#0ea5e9',
          headerGradientEnd: secondaryMatch?.[1] || '#2563eb',
          accentColorStart: accentMatch?.[0] || '#0284c7',
          accentColorEnd: accentMatch?.[1] || '#1e40af',
          backgroundColor: imported.colors?.background || '#ffffff',
          textColor: imported.colors?.text || '#1f2937',
          fontSize: imported.fonts?.size || { heading: 14, body: 10, small: 8 },
          fontFamily: {
            heading: imported.fonts?.heading || 'Arial',
            body: imported.fonts?.body || 'Arial',
          },
          logoUrl: imported.logo?.url || '',
          logoPosition: imported.logo?.position || 'left',
          logoWidth: imported.logo?.size?.width || 120,
          logoHeight: imported.logo?.size?.height || 60,
          logoOpacity: 100,
          showLogo: imported.logo?.showInHeader ?? true,
          pageSize: imported.pageSize || 'A4',
          orientation: imported.orientation || 'portrait',
        }, 'Zaimportowano szablon');

        toast.success(`Szablon "${imported.name}" zaimportowany!`);
      } catch (error) {
        toast.error('Błąd importu szablonu!');
        console.error(error);
      }
    };
    reader.readAsText(file);
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // SAVE template
  function handleSave() {
    // Validation
    const errors: string[] = [];

    if (!templateName.trim()) {
      errors.push('Nazwa szablonu jest wymagana');
    }

    if (blocks.length === 0) {
      errors.push('Szablon musi mieć przynajmniej 1 blok');
    }

    const visibleBlocks = blocks.filter(b => b.visible);
    if (visibleBlocks.length === 0) {
      errors.push('Szablon musi mieć przynajmniej 1 widoczny blok');
    }

    blocks.forEach((block, idx) => {
      if (!block.label.trim()) {
        errors.push(`Blok #${idx + 1} nie ma nazwy`);
      }
    });

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

    // Save to localStorage
    const template: InvoiceTemplateLayout = {
      id: existingTemplate?.id || `invoice-template-${Date.now()}`,
      name: templateName,
      description: `${visibleBlocks.length} bloków`,
      blocks,
      colors: {
        primary: `linear-gradient(to right, ${primaryColorStart}, ${primaryColorEnd})`,
        secondary: `linear-gradient(to right, ${headerGradientStart}, ${headerGradientEnd})`,
        accent: `linear-gradient(to right, ${accentColorStart}, ${accentColorEnd})`,
        text: textColor,
        background: backgroundColor,
      },
      fonts: {
        heading: fontFamily.heading,
        body: fontFamily.body,
        size: fontSize,
      },
      logo: showLogo ? {
        url: logoUrl || '',
        position: logoPosition,
        size: { width: logoWidth, height: logoHeight },
        showInHeader: showLogo,
      } : undefined,
      pageSize,
      orientation,
      createdAt: existingTemplate?.createdAt || new Date(),
      updatedAt: new Date(),
    };

    localStorage.setItem(`invoice-template-${template.id}`, JSON.stringify(template));
    toast.success(`✅ Szablon "${templateName}" zapisany!`);
    onBack();
  }

  // Keyboard shortcuts (Ctrl+S, Ctrl+Z, Ctrl+Y, Ctrl+D)
  const { handleKeyDown } = useUndoRedoKeyboard(
    undo,
    redo,
    handleSave,
    () => {
      if (blocks.length > 0) {
        duplicateBlock(0);
        toast.success('Blok zduplikowany (Ctrl+D)');
      }
    },
    () => {
      toast.info('Podgląd wydruku - wkrótce! (Ctrl+P)');
    }
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return (
    <div className="fixed inset-0 bg-gray-50 overflow-hidden">
      {/* TOP BAR */}
      <div className="h-16 bg-white border-b-2 border-sky-300 px-4 flex items-center justify-between shadow-lg">
        <div className="flex-1 max-w-md">
          <input
            type="text"
            value={templateName}
            onChange={(e) => updateState({ templateName: e.target.value }, 'Zmieniono nazwę')}
            className="w-full px-3 py-1.5 border-2 border-sky-300 rounded-xl focus:border-sky-500 focus:ring-2 focus:ring-sky-200 text-base font-bold"
            placeholder="Nazwa szablonu..."
          />
        </div>

        <div className="flex gap-2">
          {/* Export/Import */}
          <button
            onClick={handleExportTemplate}
            className="px-3 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-bold transition-all flex items-center gap-2"
            title="Eksportuj szablon do JSON"
          >
            <DownloadSimple size={18} weight="bold" />
            Export
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-bold transition-all flex items-center gap-2"
            title="Importuj szablon z JSON"
          >
            <UploadSimple size={18} weight="bold" />
            Import
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            className="hidden"
            onChange={handleImportTemplate}
            title="Importuj szablon z pliku JSON"
            aria-label="Wybierz plik JSON do importu"
          />

          {/* UNDO/REDO */}
          <UndoRedoToolbar
            canUndo={canUndo}
            canRedo={canRedo}
            onUndo={undo}
            onRedo={redo}
          />

          <button
            onClick={onBack}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg font-bold transition-all"
          >
            Anuluj
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-linear-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white rounded-lg font-bold shadow-lg transition-all"
          >
            Zapisz
          </button>
        </div>
      </div>

      {/* MAIN LAYOUT: Gradient Background + 3D Panels */}
      <div className="h-[calc(100vh-64px)] bg-linear-to-br from-sky-50 via-blue-50 to-indigo-100 p-6 overflow-y-auto">
        <div className="max-w-[1800px] mx-auto flex gap-6">
          
          {/* LEFT PANEL - 3D Levitating Card */}
          <div className="w-[420px] shrink-0">
            <div className="sticky top-6">
              <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/50 p-6 transform hover:scale-[1.02] transition-transform duration-300">
                <div className="space-y-6">
                  
                  {/* Logo Section */}
                  <div className="pb-6 border-b border-gray-200">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <ImageIcon size={22} weight="bold" className="text-sky-600" />
                      Logo firmy
                    </h3>
                    <LogoControls
                      logoUrl={logoUrl}
                      onLogoUpload={(url) => updateState({ logoUrl: url }, 'Dodano logo')}
                      showLogo={showLogo}
                      onShowLogoChange={(show) => updateState({ showLogo: show }, 'Przełączono logo')}
                      logoPosition={logoPosition}
                      onLogoPositionChange={(pos) => updateState({ logoPosition: pos }, 'Zmieniono pozycję logo')}
                      logoX={logoX}
                      logoY={logoY}
                      logoWidth={logoWidth}
                      logoHeight={logoHeight}
                      logoOpacity={logoOpacity}
                      onLogoPositionXY={(x, y) => updateState({ logoX: x, logoY: y }, 'Przesunięto logo')}
                      onLogoResize={(w, h) => updateState({ logoWidth: w, logoHeight: h }, 'Zmieniono rozmiar logo')}
                      onLogoOpacityChange={(opacity) => updateState({ logoOpacity: opacity }, 'Zmieniono przezroczystość')}
                      showLivePreview={true}
                    />
                  </div>

                  {/* Blocks Section */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                        <ListBullets size={22} weight="bold" className="text-sky-600" />
                        Bloki faktury ({blocks.length})
                      </h3>
                      <button
                        onClick={() => addBlock('notes')}
                        className="px-4 py-2 bg-linear-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white rounded-xl text-sm font-bold flex items-center gap-2 transition-all shadow-lg shadow-sky-200/50"
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
                      <SortableContext items={blocks.map(b => b.id)} strategy={verticalListSortingStrategy}>
                        <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
                          {blocks.map((block, index) => (
                            <SortableBlockItem
                              key={block.id}
                              block={block}
                              index={index}
                              totalBlocks={blocks.length}
                              onUpdate={(field, value) => updateBlock(index, field, value)}
                              onToggleVisible={() => toggleBlockVisible(index)}
                              onDuplicate={() => duplicateBlock(index)}
                              onRemove={() => removeBlock(index)}
                            />
                          ))}
                        </div>
                      </SortableContext>
                    </DndContext>
                  </div>

                </div>
              </div>
            </div>
          </div>

          {/* CENTER PANEL - Fixed A4 Preview (Sticky) */}
          <div className="flex-1 flex justify-center">
            <div className="sticky top-6 h-fit">
              <div className="bg-white rounded-3xl shadow-2xl transform hover:scale-[1.01] transition-transform duration-300">
                {/* Live Invoice Preview - Real-time rendering */}
                <LiveInvoicePreview state={currentState} />
              </div>
            </div>
          </div>

          {/* RIGHT PANEL - 3D Levitating Card */}
          <div className="w-[420px] shrink-0">
            <div className="sticky top-6">
              <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/50 p-6 transform hover:scale-[1.02] transition-transform duration-300">
                <div className="space-y-6">
                  
                  {/* Colors Section */}
                  <div className="pb-6 border-b border-gray-200">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">🎨 Kolory</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Nagłówek</label>
                        <ColorPickerDual
                          startColor={headerGradientStart}
                          endColor={headerGradientEnd}
                          onStartChange={(color) => updateState({ headerGradientStart: color }, 'Zmieniono kolor nagłówka (start)')}
                          onEndChange={(color) => updateState({ headerGradientEnd: color }, 'Zmieniono kolor nagłówka (koniec)')}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Primary</label>
                        <ColorPickerDual
                          startColor={primaryColorStart}
                          endColor={primaryColorEnd}
                          onStartChange={(color) => updateState({ primaryColorStart: color }, 'Zmieniono primary (start)')}
                          onEndChange={(color) => updateState({ primaryColorEnd: color }, 'Zmieniono primary (koniec)')}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Accent</label>
                        <ColorPickerDual
                          startColor={accentColorStart}
                          endColor={accentColorEnd}
                          onStartChange={(color) => updateState({ accentColorStart: color }, 'Zmieniono accent (start)')}
                          onEndChange={(color) => updateState({ accentColorEnd: color }, 'Zmieniono accent (koniec)')}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm font-bold text-gray-700 mb-2">Tło</label>
                          <input
                            type="color"
                            value={backgroundColor}
                            onChange={(e) => updateState({ backgroundColor: e.target.value }, 'Zmieniono tło')}
                            className="w-full h-12 rounded-xl cursor-pointer border-2 border-gray-300 hover:border-sky-400 transition-colors"
                            title="Kolor tła"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-gray-700 mb-2">Tekst</label>
                          <input
                            type="color"
                            value={textColor}
                            onChange={(e) => updateState({ textColor: e.target.value }, 'Zmieniono tekst')}
                            className="w-full h-12 rounded-xl cursor-pointer border-2 border-gray-300 hover:border-sky-400 transition-colors"
                            title="Kolor tekstu"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Fonts Section */}
                  <div className="pb-6 border-b border-gray-200">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">� Czcionki</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Nagłówki</label>
                        <FontControls
                          fontFamily={fontFamily.heading}
                          fontSize={fontSize.heading}
                          onFontFamilyChange={(family) => updateState({ fontFamily: { ...fontFamily, heading: family } }, 'Zmieniono font nagłówka')}
                          onFontSizeChange={(size) => updateState({ fontSize: { ...fontSize, heading: size } }, 'Zmieniono rozmiar nagłówka')}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Treść</label>
                        <FontControls
                          fontFamily={fontFamily.body}
                          fontSize={fontSize.body}
                          onFontFamilyChange={(family) => updateState({ fontFamily: { ...fontFamily, body: family } }, 'Zmieniono font treści')}
                          onFontSizeChange={(size) => updateState({ fontSize: { ...fontSize, body: size } }, 'Zmieniono rozmiar treści')}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Małe elementy (px)</label>
                        <input
                          type="number"
                          value={fontSize.small}
                          onChange={(e) => updateState({ fontSize: { ...fontSize, small: parseInt(e.target.value) } }, 'Zmieniono rozmiar małego')}
                          className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl text-sm font-semibold focus:border-sky-500 focus:ring-2 focus:ring-sky-200 transition-all"
                          min="6"
                          max="12"
                          title="Rozmiar małych elementów"
                        />
                      </div>
                    </div>
                  </div>

                  {/* QR Code Settings */}
                  <div className="pb-6 border-b border-gray-200">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">📱 Kod QR</h3>
                    
                    <div className="space-y-4">
                      {/* Enable QR Code */}
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={qrCode.enabled}
                          onChange={(e) => updateState({ qrCode: { ...qrCode, enabled: e.target.checked } }, 'Włączono/wyłączono QR')}
                          className="w-5 h-5 text-sky-600 border-gray-300 rounded focus:ring-sky-500"
                        />
                        <span className="text-sm font-semibold text-gray-700">Pokaż kod QR na fakturze</span>
                      </label>

                      {qrCode.enabled && (
                        <>
                          {/* QR Position */}
                          <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Pozycja</label>
                            <select
                              value={qrCode.position}
                              onChange={(e) => updateState({ qrCode: { ...qrCode, position: e.target.value as any } }, 'Zmieniono pozycję QR')}
                              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl text-sm font-semibold focus:border-sky-500 focus:ring-2 focus:ring-sky-200 transition-all"
                              aria-label="Pozycja kodu QR"
                              title="Wybierz pozycję kodu QR na fakturze"
                            >
                              <option value="top-right">Góra - prawy róg</option>
                              <option value="bottom-right">Dół - prawy róg</option>
                              <option value="bottom-left">Dół - lewy róg</option>
                            </select>
                          </div>

                          {/* QR Size */}
                          <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">
                              Rozmiar: {qrCode.size}px
                            </label>
                            <input
                              type="range"
                              min="80"
                              max="200"
                              value={qrCode.size}
                              onChange={(e) => updateState({ qrCode: { ...qrCode, size: parseInt(e.target.value) } }, 'Zmieniono rozmiar QR')}
                              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-sky-500"
                              aria-label="Rozmiar kodu QR"
                              title="Rozmiar kodu QR (80-200px)"
                            />
                          </div>

                          {/* QR Data */}
                          <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Dane QR</label>
                            <input
                              type="text"
                              value={qrCode.data}
                              onChange={(e) => updateState({ qrCode: { ...qrCode, data: e.target.value } }, 'Zmieniono dane QR')}
                              placeholder="https://payment.nl/pay/INV-001"
                              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl text-sm focus:border-sky-500 focus:ring-2 focus:ring-sky-200 transition-all"
                            />
                            <p className="text-xs text-gray-500 mt-1">Link do płatności lub IBAN</p>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Warning Box Settings */}
                  <div className="pb-6 border-b border-gray-200">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">⚠️ Ostrzeżenie</h3>
                    
                    <div className="space-y-4">
                      {/* Enable Warning Box */}
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={warningBox.enabled}
                          onChange={(e) => updateState({ warningBox: { ...warningBox, enabled: e.target.checked } }, 'Włączono/wyłączono ostrzeżenie')}
                          className="w-5 h-5 text-yellow-600 border-gray-300 rounded focus:ring-yellow-500"
                        />
                        <span className="text-sm font-semibold text-gray-700">Pokaż żółte ostrzeżenie</span>
                      </label>

                      {warningBox.enabled && (
                        <>
                          {/* Warning Text */}
                          <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Tekst ostrzeżenia</label>
                            <textarea
                              value={warningBox.text}
                              onChange={(e) => updateState({ warningBox: { ...warningBox, text: e.target.value } }, 'Zmieniono tekst ostrzeżenia')}
                              rows={3}
                              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl text-sm focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200 transition-all"
                              placeholder="⚠️ REVERSE CHARGE: BTW verlegd naar de afnemer..."
                              aria-label="Tekst ostrzeżenia"
                              title="Wprowadź treść ostrzeżenia (np. reverse charge, warunki płatności)"
                            />
                            <p className="text-xs text-gray-500 mt-1">Np. reverse charge, warunki płatności</p>
                          </div>

                          {/* Warning Colors */}
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-sm font-bold text-gray-700 mb-2">Kolor tła</label>
                              <input
                                type="color"
                                value={warningBox.backgroundColor}
                                onChange={(e) => updateState({ warningBox: { ...warningBox, backgroundColor: e.target.value } }, 'Zmieniono kolor tła')}
                                className="w-full h-12 border-2 border-gray-300 rounded-xl cursor-pointer"
                                aria-label="Kolor tła ostrzeżenia"
                                title="Wybierz kolor tła dla box'a ostrzeżenia"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-bold text-gray-700 mb-2">Kolor tekstu</label>
                              <input
                                type="color"
                                value={warningBox.textColor}
                                onChange={(e) => updateState({ warningBox: { ...warningBox, textColor: e.target.value } }, 'Zmieniono kolor tekstu')}
                                className="w-full h-12 border-2 border-gray-300 rounded-xl cursor-pointer"
                                aria-label="Kolor tekstu ostrzeżenia"
                                title="Wybierz kolor tekstu w box'ie ostrzeżenia"
                              />
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Social Media Links */}
                  <div className="pb-6 border-b border-gray-200">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">📱 Social Media</h3>
                    
                    <div className="space-y-3">
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={socialMedia.enabled}
                          onChange={(e) => updateState({ socialMedia: { ...socialMedia, enabled: e.target.checked } }, 'Social media toggle')}
                          className="w-5 h-5 text-blue-600 border-gray-300 rounded"
                        />
                        <span className="text-sm font-semibold">Pokaż ikony social media</span>
                      </label>

                      {socialMedia.enabled && (
                        <div className="grid grid-cols-1 gap-2">
                          <input
                            type="url"
                            value={socialMedia.facebook || ''}
                            onChange={(e) => updateState({ socialMedia: { ...socialMedia, facebook: e.target.value } }, 'Facebook URL')}
                            placeholder="https://facebook.com/..."
                            className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg text-sm"
                          />
                          <input
                            type="url"
                            value={socialMedia.linkedin || ''}
                            onChange={(e) => updateState({ socialMedia: { ...socialMedia, linkedin: e.target.value } }, 'LinkedIn URL')}
                            placeholder="https://linkedin.com/..."
                            className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg text-sm"
                          />
                          <input
                            type="url"
                            value={socialMedia.instagram || ''}
                            onChange={(e) => updateState({ socialMedia: { ...socialMedia, instagram: e.target.value } }, 'Instagram URL')}
                            placeholder="https://instagram.com/..."
                            className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg text-sm"
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Page Settings */}
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-4">� Ustawienia strony</h3>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Rozmiar</label>
                        <select
                          value={pageSize}
                          onChange={(e) => updateState({ pageSize: e.target.value as 'A4' | 'Letter' }, 'Zmieniono rozmiar')}
                          className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl text-sm font-semibold focus:border-sky-500 focus:ring-2 focus:ring-sky-200 transition-all"
                          title="Rozmiar strony"
                        >
                          <option value="A4">A4</option>
                          <option value="Letter">Letter</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Orientacja</label>
                        <select
                          value={orientation}
                          onChange={(e) => updateState({ orientation: e.target.value as 'portrait' | 'landscape' }, 'Zmieniono orientację')}
                          className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl text-sm font-semibold focus:border-sky-500 focus:ring-2 focus:ring-sky-200 transition-all"
                          title="Orientacja strony"
                        >
                          <option value="portrait">Pionowa</option>
                          <option value="landscape">Pozioma</option>
                        </select>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
