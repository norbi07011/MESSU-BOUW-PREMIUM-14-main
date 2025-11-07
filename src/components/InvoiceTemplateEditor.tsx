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
  TwitterLogo,
  YoutubeLogo,
  TiktokLogo,
  WhatsappLogo,
  TelegramLogo,
  GithubLogo,
  EnvelopeSimple,
  Globe,
  Phone,
  TextAlignLeft,
  TextAlignCenter,
  TextAlignRight
} from '@phosphor-icons/react';
import type { InvoiceBlock, InvoiceTemplateLayout, InvoiceBlockType } from '@/types/invoiceTemplate';
import { useUndoRedo, useUndoRedoKeyboard } from '@/hooks/useUndoRedo';
import { ColorPickerDual, FontControls, LogoControls, UndoRedoToolbar, ColorThemeSelector } from '@/components/shared/TemplateEditor';
import LiveInvoicePreview from '@/components/shared/TemplateEditor/LiveInvoicePreview';
import type { ColorTheme } from '@/components/TimeTracking/colorThemes';
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
  // NEW: Watermark (logo w tle jako tło pod całą fakturą)
  watermarkUrl?: string;
  watermarkOpacity: number;  // 5-50%
  watermarkSize: number;  // 100-600px
  watermarkRotation: number;  // -45 to 45 degrees
  // NEW: QR Code settings (ONLY layout, data comes from invoice.payment_qr_payload)
  // UPDATED: position now relative to Payment Details block!
  qrCode: {
    enabled: boolean;
    position: 'payment-right' | 'payment-below' | 'top-right' | 'bottom-right'; // payment-* = relative to Payment Details
    size: number; // 80-200px
    // NO data field - payment link comes from Invoice.payment_qr_payload!
  };
  // NEW: Warning Box (yellow alert for reverse charge/important info)
  // TEXT comes from Invoice.vat_note, template defines ONLY styling!
  warningBox: {
    enabled: boolean;
    backgroundColor: string;
    textColor: string;
    icon: string; // emoji or unicode
    // NO text field - content comes from Invoice.vat_note!
  };
  // NEW: Social Media icons (DISPLAY ONLY - checkboxes select which icons show on invoice footer)
  // Values are just flags ('facebook', 'linkedin', etc.) - actual company URLs come from Company settings
  socialMedia: {
    enabled: boolean;
    facebook?: string;
    linkedin?: string;
    instagram?: string;
    twitter?: string;
    youtube?: string;
    tiktok?: string;
    whatsapp?: string;
    telegram?: string;
    github?: string;
    email?: string;
    website?: string;
    phone?: string;
  };
  pageSize: 'A4' | 'Letter';
  orientation: 'portrait' | 'landscape';
  // NEW: Decorative Waves (modern design element)
  decorativeWaves: {
    enabled: boolean;
    position: 'top' | 'bottom' | 'both';
    opacity: number; // 0-100%
    color: string; // hex color for wave gradient
  };
  // NEW: Product Image Frames (for items table images)
  imageFrames: {
    borderStyle: 'none' | 'solid' | 'dashed' | 'dotted' | 'double';
    borderWidth: number; // 0-5px
    borderColor: string;
    borderRadius: number; // 0-20px
    shadow: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  };
}

interface InvoiceTemplateEditorProps {
  existingTemplate?: InvoiceTemplateLayout;
  onBack: () => void;
}

// DEFAULT INVOICE BLOCKS (8 sections)
const DEFAULT_BLOCKS: InvoiceBlock[] = [
  { id: 'company-info', type: 'company-info', label: 'Dane firmy', visible: true, order: 1, align: 'left' },
  { id: 'client-info', type: 'client-info', label: 'Dane klienta', visible: true, order: 2, align: 'left' },
  { id: 'invoice-header', type: 'invoice-header', label: 'Nagłówek faktury', visible: true, order: 3, align: 'left' },
  { id: 'items-table', type: 'items-table', label: 'Tabela pozycji', visible: true, order: 4, align: 'left' },
  { id: 'totals', type: 'totals', label: 'Suma końcowa', visible: true, order: 5, align: 'right' },
  { id: 'payment-info', type: 'payment-info', label: 'Płatność', visible: true, order: 6, align: 'left' },
  { id: 'notes', type: 'notes', label: 'Notatki', visible: true, order: 7, align: 'left' },
  { id: 'footer', type: 'footer', label: 'Stopka', visible: true, order: 8, align: 'center' },
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
  isHighlighted?: boolean; // NEW: Interactive preview highlight
}

const SortableBlockItem: React.FC<SortableBlockItemProps> = ({
  block,
  index,
  totalBlocks,
  onUpdate,
  onToggleVisible,
  onDuplicate,
  onRemove,
  isHighlighted = false, // NEW
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
      id={`block-${block.id}`}
      ref={setNodeRef}
      style={style}
      className={`bg-white border-2 rounded-xl p-3 transition-all ${
        isDragging ? 'border-sky-500 shadow-lg z-50' : 
        isHighlighted ? 'border-sky-500 border-4 shadow-xl ring-4 ring-sky-200' : 
        'border-gray-200 hover:border-sky-300'
      } ${!block.visible ? 'opacity-50 bg-gray-50' : ''}`}
    >
      <div className="flex items-start gap-2">
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing mt-2"
        >
          <DotsSixVertical size={20} className="text-gray-400" />
        </div>
        
        <div className="flex-1 min-w-0">
          {/* GÓRNY RZĄD: Oko + Nazwa + Typ */}
          <div className="flex items-start gap-2 mb-3">
            <button
              onClick={onToggleVisible}
              className={`p-2 rounded-lg transition-all flex-shrink-0 ${
                block.visible ? 'bg-sky-100 text-sky-600' : 'bg-gray-100 text-gray-400'
              }`}
              title={block.visible ? 'Ukryj blok' : 'Pokaż blok'}
            >
              {block.visible ? <Eye size={18} /> : <EyeSlash size={18} />}
            </button>
            
            <div className="flex-1 min-w-0">
              <label className="block text-xs font-bold text-gray-700 mb-1">Nazwa</label>
              <input
                type="text"
                value={block.label}
                onChange={(e) => onUpdate('label', e.target.value)}
                className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg text-sm font-semibold focus:border-sky-500 focus:ring-2 focus:ring-sky-200 transition-all"
                placeholder="Nazwa..."
              />
            </div>

            {/* TYP BLOKU - READ ONLY DISPLAY Z IKONĄ */}
            <div className="w-[160px] shrink-0">
              <label className="block text-xs font-bold text-gray-700 mb-1">Typ bloku</label>
              <div className="px-3 py-2 bg-gray-50 border-2 border-gray-200 rounded-lg flex items-center gap-2">
                {/* Ikona per typ */}
                {block.type === 'company-info' && <span className="text-lg">🏢</span>}
                {block.type === 'client-info' && <span className="text-lg">👤</span>}
                {block.type === 'invoice-header' && <span className="text-lg">📄</span>}
                {block.type === 'items-table' && <span className="text-lg">📊</span>}
                {block.type === 'totals' && <span className="text-lg">💰</span>}
                {block.type === 'payment-info' && <span className="text-lg">💳</span>}
                {block.type === 'notes' && <span className="text-lg">📝</span>}
                {block.type === 'footer' && <span className="text-lg">📜</span>}
                
                {/* Label */}
                <span className="text-xs font-medium text-gray-600">
                  {block.type === 'company-info' && 'Dane firmy'}
                  {block.type === 'client-info' && 'Klient'}
                  {block.type === 'invoice-header' && 'Nagłówek'}
                  {block.type === 'items-table' && 'Tabela'}
                  {block.type === 'totals' && 'Suma'}
                  {block.type === 'payment-info' && 'Płatność'}
                  {block.type === 'notes' && 'Notatki'}
                  {block.type === 'footer' && 'Stopka'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* AKCJE: Duplikuj i Usuń */}
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
          
          {/* Separator */}
          <div className="border-t border-gray-300 my-1" />
          
          {/* WYRÓWNANIE */}
          <button
            onClick={() => onUpdate('align', 'left')}
            className={`p-2 rounded transition-colors ${
              block.align === 'left' ? 'bg-sky-500 text-white' : 'hover:bg-gray-100 text-gray-600'
            }`}
            title="Wyrównaj do lewej"
          >
            <TextAlignLeft size={16} weight="bold" />
          </button>
          <button
            onClick={() => onUpdate('align', 'center')}
            className={`p-2 rounded transition-colors ${
              block.align === 'center' ? 'bg-sky-500 text-white' : 'hover:bg-gray-100 text-gray-600'
            }`}
            title="Wyśrodkuj"
          >
            <TextAlignCenter size={16} weight="bold" />
          </button>
          <button
            onClick={() => onUpdate('align', 'right')}
            className={`p-2 rounded transition-colors ${
              block.align === 'right' ? 'bg-sky-500 text-white' : 'hover:bg-gray-100 text-gray-600'
            }`}
            title="Wyrównaj do prawej"
          >
            <TextAlignRight size={16} weight="bold" />
          </button>
        </div>
      </div>
    </div>
  );
};

// MAIN COMPONENT
export default function InvoiceTemplateEditor({ existingTemplate, onBack }: InvoiceTemplateEditorProps) {
  // Helper function to parse gradient colors
  const parseGradient = (gradient: string | undefined, defaultStart: string, defaultEnd: string): [string, string] => {
    if (!gradient || !gradient.includes('linear-gradient')) {
      return [defaultStart, defaultEnd];
    }
    // Extract colors from "linear-gradient(to right, #color1, #color2)"
    const match = gradient.match(/linear-gradient\(to right,\s*([^,]+),\s*([^)]+)\)/);
    if (match && match[1] && match[2]) {
      return [match[1].trim(), match[2].trim()];
    }
    return [defaultStart, defaultEnd];
  };

  // Parse colors from existingTemplate
  const [headerStart, headerEnd] = parseGradient(existingTemplate?.colors?.secondary, '#0ea5e9', '#2563eb');
  const [primaryStart, primaryEnd] = parseGradient(existingTemplate?.colors?.primary, '#0ea5e9', '#2563eb');
  const [accentStart, accentEnd] = parseGradient(existingTemplate?.colors?.accent, '#0284c7', '#1e40af');

  // Initial state from existing template or defaults
  const initialState: EditorState = {
    templateName: existingTemplate?.name || 'Nowy Szablon Faktury',
    blocks: existingTemplate?.blocks || DEFAULT_BLOCKS,
    headerGradientStart: headerStart,
    headerGradientEnd: headerEnd,
    primaryColorStart: primaryStart,
    primaryColorEnd: primaryEnd,
    accentColorStart: accentStart,
    accentColorEnd: accentEnd,
    backgroundColor: existingTemplate?.colors?.background || '#ffffff',
    textColor: existingTemplate?.colors?.text || '#1f2937',
    borderColor: existingTemplate?.colors?.border || '#e5e7eb',
    fontSize: existingTemplate?.fonts?.size || {
      heading: 14,
      body: 10,
      small: 8,
    },
    fontFamily: existingTemplate?.fonts || {
      heading: 'Arial',
      body: 'Arial',
    },
    logoUrl: existingTemplate?.logo?.url || '',
    logoPosition: existingTemplate?.logo?.position || 'left',
    // NEW: Advanced logo control with defaults
    logoX: existingTemplate?.logo?.x ?? 20,
    logoY: existingTemplate?.logo?.y ?? 20,
    logoWidth: existingTemplate?.logo?.size?.width || 120,
    logoHeight: existingTemplate?.logo?.size?.height || 60,
    logoOpacity: existingTemplate?.logo?.opacity ?? 100,
    showLogo: existingTemplate?.logo?.showInHeader ?? true,
    // NEW: Watermark (logo w tle)
    watermarkUrl: existingTemplate?.watermark?.url || '',
    watermarkOpacity: existingTemplate?.watermark?.opacity ?? 15,
    watermarkSize: existingTemplate?.watermark?.size ?? 300,
    watermarkRotation: existingTemplate?.watermark?.rotation ?? 0,
    // NEW: QR Code settings (layout only, data from Invoice.payment_qr_payload)
    qrCode: existingTemplate?.qrCode || {
      enabled: false,
      position: 'payment-right',
      size: 100,
    },
    // NEW: Warning Box (styling only, text from Invoice.vat_note)
    warningBox: existingTemplate?.warningBox || {
      enabled: false,
      backgroundColor: '#fef3c7',
      textColor: '#92400e',
      icon: '⚠️',
    },
    // NEW: Social Media links
    socialMedia: existingTemplate?.socialMedia || {
      enabled: false,
      facebook: '',
      linkedin: '',
      instagram: '',
      twitter: '',
    },
    pageSize: existingTemplate?.pageSize || 'A4',
    orientation: existingTemplate?.orientation || 'portrait',
    // NEW: Decorative Waves
    decorativeWaves: existingTemplate?.decorativeWaves || {
      enabled: false,
      position: 'top',
      opacity: 20,
      color: '#0ea5e9',
    },
    // NEW: Product Image Frames
    imageFrames: existingTemplate?.imageFrames || {
      borderStyle: 'solid',
      borderWidth: 2,
      borderColor: '#e5e7eb',
      borderRadius: 8,
      shadow: 'sm',
    },
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
    watermarkUrl,
    watermarkOpacity,
    watermarkSize,
    watermarkRotation,
    qrCode,
    warningBox,
    socialMedia,
    pageSize,
    orientation,
    decorativeWaves,
    imageFrames,
  } = currentState;

  // Drag & Drop state
  const [activeId, setActiveId] = useState<string | null>(null);
  // NEW: Interactive preview - highlighted block
  const [highlightedBlockId, setHighlightedBlockId] = useState<string | null>(null);
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

  // Apply Color Theme (1-click preset)
  const handleThemeSelect = (theme: ColorTheme) => {
    updateState({
      headerGradientStart: theme.colors.headerStart,
      headerGradientEnd: theme.colors.headerEnd,
      primaryColorStart: theme.colors.headerStart,
      primaryColorEnd: theme.colors.headerEnd,
      accentColorStart: theme.colors.accentColor,
      accentColorEnd: theme.colors.accentColor,
      backgroundColor: theme.colors.backgroundColor,
      textColor: theme.colors.textColor,
      borderColor: theme.colors.borderColor,
      fontFamily: {
        heading: theme.fontFamily,
        body: theme.fontFamily,
      },
      fontSize: {
        heading: theme.fontSize + 4,
        body: theme.fontSize,
        small: theme.fontSize - 2,
      },
    }, `Zastosowano motyw: ${theme.name}`);
    toast.success(`Motyw "${theme.name}" zastosowany!`);
  };

  // Add new block
  const addBlock = (type: InvoiceBlockType) => {
    const newBlock: InvoiceBlock = {
      id: `block-${Date.now()}`,
      type,
      label: `Nowy blok (${type})`,
      visible: true,
      order: blocks.length + 1,
      align: 'left', // Default alignment
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
        border: borderColor,
      },
      fonts: {
        heading: fontFamily.heading,
        body: fontFamily.body,
        size: fontSize,
      },
      logo: showLogo ? {
        url: logoUrl || '',
        position: logoPosition,
        x: logoX,
        y: logoY,
        size: { width: logoWidth, height: logoHeight },
        opacity: logoOpacity,
        showInHeader: showLogo,
      } : undefined,
      // NEW: Watermark (logo w tle)
      watermark: watermarkUrl ? {
        url: watermarkUrl,
        opacity: watermarkOpacity,
        size: watermarkSize,
        rotation: watermarkRotation,
      } : undefined,
      // NEW: QR Code settings (layout only)
      qrCode: {
        enabled: qrCode.enabled,
        position: qrCode.position,
        size: qrCode.size,
      },
      // NEW: Warning Box (styling only)
      warningBox: {
        enabled: warningBox.enabled,
        backgroundColor: warningBox.backgroundColor,
        textColor: warningBox.textColor,
        icon: warningBox.icon,
      },
      // NEW: Social Media (TODO: should come from Company, but kept for backward compatibility)
      socialMedia: {
        enabled: socialMedia.enabled,
        facebook: socialMedia.facebook,
        linkedin: socialMedia.linkedin,
        instagram: socialMedia.instagram,
        twitter: socialMedia.twitter,
        youtube: socialMedia.youtube,
        tiktok: socialMedia.tiktok,
        whatsapp: socialMedia.whatsapp,
        telegram: socialMedia.telegram,
        github: socialMedia.github,
        email: socialMedia.email,
        website: socialMedia.website,
        phone: socialMedia.phone,
      },
      // NEW: Decorative Waves
      decorativeWaves: {
        enabled: decorativeWaves.enabled,
        position: decorativeWaves.position,
        opacity: decorativeWaves.opacity,
        color: decorativeWaves.color,
      },
      // NEW: Product Image Frames
      imageFrames: {
        borderStyle: imageFrames.borderStyle,
        borderWidth: imageFrames.borderWidth,
        borderColor: imageFrames.borderColor,
        borderRadius: imageFrames.borderRadius,
        shadow: imageFrames.shadow,
      },
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
          borderColor: imported.colors?.border || '#e5e7eb',
          fontSize: imported.fonts?.size || { heading: 14, body: 10, small: 8 },
          fontFamily: {
            heading: imported.fonts?.heading || 'Arial',
            body: imported.fonts?.body || 'Arial',
          },
          logoUrl: imported.logo?.url || '',
          logoPosition: imported.logo?.position || 'left',
          logoX: imported.logo?.x || 20,
          logoY: imported.logo?.y || 20,
          logoWidth: imported.logo?.size?.width || 120,
          logoHeight: imported.logo?.size?.height || 60,
          logoOpacity: imported.logo?.opacity || 100,
          showLogo: imported.logo?.showInHeader ?? true,
          qrCode: {
            enabled: imported.qrCode?.enabled ?? true,
            position: imported.qrCode?.position || 'payment-right',
            size: imported.qrCode?.size || 120,
          },
          warningBox: {
            enabled: imported.warningBox?.enabled ?? false,
            backgroundColor: imported.warningBox?.backgroundColor || '#fef3c7',
            textColor: imported.warningBox?.textColor || '#92400e',
            icon: imported.warningBox?.icon || '⚠️',
          },
          socialMedia: {
            enabled: imported.socialMedia?.enabled ?? false,
            facebook: imported.socialMedia?.facebook || '',
            linkedin: imported.socialMedia?.linkedin || '',
            instagram: imported.socialMedia?.instagram || '',
            twitter: imported.socialMedia?.twitter || '',
            youtube: imported.socialMedia?.youtube || '',
            tiktok: imported.socialMedia?.tiktok || '',
            whatsapp: imported.socialMedia?.whatsapp || '',
            telegram: imported.socialMedia?.telegram || '',
            github: imported.socialMedia?.github || '',
            email: imported.socialMedia?.email || '',
            website: imported.socialMedia?.website || '',
            phone: imported.socialMedia?.phone || '',
          },
          decorativeWaves: {
            enabled: imported.decorativeWaves?.enabled ?? false,
            position: imported.decorativeWaves?.position || 'top',
            opacity: imported.decorativeWaves?.opacity || 20,
            color: imported.decorativeWaves?.color || '#0ea5e9',
          },
          imageFrames: {
            borderStyle: imported.imageFrames?.borderStyle || 'solid',
            borderWidth: imported.imageFrames?.borderWidth || 2,
            borderColor: imported.imageFrames?.borderColor || '#e5e7eb',
            borderRadius: imported.imageFrames?.borderRadius || 8,
            shadow: imported.imageFrames?.shadow || 'sm',
          },
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
        border: borderColor,
      },
      fonts: {
        heading: fontFamily.heading,
        body: fontFamily.body,
        size: fontSize,
      },
      logo: showLogo ? {
        url: logoUrl || '',
        position: logoPosition,
        x: logoX,
        y: logoY,
        size: { width: logoWidth, height: logoHeight },
        opacity: logoOpacity,
        showInHeader: showLogo,
      } : undefined,
      watermark: watermarkUrl ? {
        url: watermarkUrl,
        opacity: watermarkOpacity,
        size: watermarkSize,
        rotation: watermarkRotation,
      } : undefined,
      qrCode: {
        enabled: qrCode.enabled,
        position: qrCode.position,
        size: qrCode.size,
      },
      warningBox: {
        enabled: warningBox.enabled,
        backgroundColor: warningBox.backgroundColor,
        textColor: warningBox.textColor,
        icon: warningBox.icon,
      },
      socialMedia: {
        enabled: socialMedia.enabled,
        facebook: socialMedia.facebook,
        linkedin: socialMedia.linkedin,
        instagram: socialMedia.instagram,
        twitter: socialMedia.twitter,
        youtube: socialMedia.youtube,
        tiktok: socialMedia.tiktok,
        whatsapp: socialMedia.whatsapp,
        telegram: socialMedia.telegram,
        github: socialMedia.github,
        email: socialMedia.email,
        website: socialMedia.website,
        phone: socialMedia.phone,
      },
      decorativeWaves: {
        enabled: decorativeWaves.enabled,
        position: decorativeWaves.position,
        opacity: decorativeWaves.opacity,
        color: decorativeWaves.color,
      },
      imageFrames: {
        borderStyle: imageFrames.borderStyle,
        borderWidth: imageFrames.borderWidth,
        borderColor: imageFrames.borderColor,
        borderRadius: imageFrames.borderRadius,
        shadow: imageFrames.shadow,
      },
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

      {/* MAIN LAYOUT: 3 kolumny - LEFT (scroll) + CENTER (sticky faktura) + RIGHT (scroll) */}
      <div className="h-[calc(100vh-64px)] bg-linear-to-br from-sky-50 via-blue-50 to-indigo-100 overflow-hidden">
        <div className="h-full max-w-[1920px] mx-auto flex gap-6 p-6">
          
          {/* LEFT PANEL - SCROLL */}
          <div className="w-[560px] shrink-0 h-full overflow-y-auto pr-2">
            <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/50 p-5">
              <div className="space-y-5">
                  
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

                  {/* Watermark Section */}
                  <div className="pb-6 border-b border-gray-200">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <ImageIcon size={22} weight="duotone" className="text-gray-400" />
                      Logo w Tle (Watermark)
                    </h3>
                    
                    {/* Upload Watermark */}
                    <div className="space-y-4">
                      <label className="block">
                        <span className="text-sm font-bold text-gray-700 mb-2 block">Wybierz logo (PNG/JPG)</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onload = (evt) => {
                                const url = evt.target?.result as string;
                                updateState({ watermarkUrl: url }, 'Dodano watermark');
                                toast.success('Watermark dodany');
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-sky-50 file:text-sky-700 hover:file:bg-sky-100 file:font-semibold cursor-pointer"
                        />
                      </label>

                      {watermarkUrl && (
                        <>
                          {/* Preview */}
                          <div className="relative bg-gray-50 rounded-lg p-4 border-2 border-gray-200">
                            <img 
                              src={watermarkUrl} 
                              alt="Watermark preview"
                              className="max-h-24 mx-auto"
                              style={{ 
                                opacity: watermarkOpacity / 100,
                                transform: `rotate(${watermarkRotation}deg)`,
                                filter: 'grayscale(100%)'
                              }}
                            />
                          </div>

                          {/* Opacity */}
                          <div>
                            <label className="text-sm font-bold text-gray-700 mb-2 block">
                              Przezroczystość: {watermarkOpacity}%
                            </label>
                            <input
                              type="range"
                              min="5"
                              max="50"
                              value={watermarkOpacity}
                              onChange={(e) => updateState({ watermarkOpacity: parseInt(e.target.value) }, 'Zmieniono przezroczystość watermark')}
                              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-sky-600"
                              aria-label="Przezroczystość watermark"
                              title="Przezroczystość watermark"
                            />
                            <div className="flex justify-between text-xs text-gray-500 mt-1">
                              <span>5%</span>
                              <span>50%</span>
                            </div>
                          </div>

                          {/* Size */}
                          <div>
                            <label className="text-sm font-bold text-gray-700 mb-2 block">
                              Rozmiar: {watermarkSize}px
                            </label>
                            <input
                              type="range"
                              min="100"
                              max="600"
                              step="10"
                              value={watermarkSize}
                              onChange={(e) => updateState({ watermarkSize: parseInt(e.target.value) }, 'Zmieniono rozmiar watermark')}
                              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-sky-600"
                              aria-label="Rozmiar watermark"
                              title="Rozmiar watermark"
                            />
                            <div className="flex justify-between text-xs text-gray-500 mt-1">
                              <span>100px</span>
                              <span>600px</span>
                            </div>
                          </div>

                          {/* Rotation */}
                          <div>
                            <label className="text-sm font-bold text-gray-700 mb-2 block">
                              Obrót: {watermarkRotation}°
                            </label>
                            <input
                              type="range"
                              min="-45"
                              max="45"
                              value={watermarkRotation}
                              onChange={(e) => updateState({ watermarkRotation: parseInt(e.target.value) }, 'Zmieniono obrót watermark')}
                              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-sky-600"
                              aria-label="Obrót watermark"
                              title="Obrót watermark"
                            />
                            <div className="flex justify-between text-xs text-gray-500 mt-1">
                              <span>-45°</span>
                              <span>0°</span>
                              <span>45°</span>
                            </div>
                          </div>

                          {/* Remove Button */}
                          <button
                            onClick={() => {
                              updateState({ watermarkUrl: '' }, 'Usunięto watermark');
                              toast.success('Watermark usunięty');
                            }}
                            className="w-full px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg font-semibold text-sm transition-colors flex items-center justify-center gap-2"
                          >
                            <Trash size={18} weight="bold" />
                            Usuń watermark
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Blocks Section - NAPRAWIONY PANEL */}
                  <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-6 border-2 border-gray-200">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xl font-bold text-gray-900 flex items-center gap-3">
                        <ListBullets size={26} weight="bold" className="text-sky-600" />
                        Bloki faktury 
                        <span className="text-sm font-normal text-gray-500">({blocks.length} {blocks.length === 1 ? 'blok' : blocks.length < 5 ? 'bloki' : 'bloków'})</span>
                      </h3>
                      
                      {/* DODAJ BLOK - Dropdown menu z ikonami */}
                      <div className="relative group">
                        <button
                          className="px-5 py-3 bg-linear-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white rounded-xl text-sm font-bold flex items-center gap-2 transition-all shadow-lg shadow-sky-200/50 hover:shadow-xl hover:scale-105"
                        >
                          <Plus size={20} weight="bold" />
                          Dodaj blok
                        </button>
                        
                        {/* Dropdown menu - pojawia się po hover */}
                        <div className="hidden group-hover:block absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-2xl border-2 border-sky-200 z-50 p-2">
                          <p className="text-xs font-bold text-gray-500 px-3 py-2">Wybierz typ bloku:</p>
                          
                          <button onClick={() => addBlock('company-info')} className="w-full text-left px-3 py-2 hover:bg-sky-50 rounded-lg flex items-center gap-3 transition-colors">
                            <span className="text-xl">🏢</span>
                            <span className="text-sm font-semibold">Dane firmy</span>
                          </button>
                          
                          <button onClick={() => addBlock('client-info')} className="w-full text-left px-3 py-2 hover:bg-sky-50 rounded-lg flex items-center gap-3 transition-colors">
                            <span className="text-xl">👤</span>
                            <span className="text-sm font-semibold">Dane klienta</span>
                          </button>
                          
                          <button onClick={() => addBlock('invoice-header')} className="w-full text-left px-3 py-2 hover:bg-sky-50 rounded-lg flex items-center gap-3 transition-colors">
                            <span className="text-xl">📄</span>
                            <span className="text-sm font-semibold">Nagłówek faktury</span>
                          </button>
                          
                          <button onClick={() => addBlock('items-table')} className="w-full text-left px-3 py-2 hover:bg-sky-50 rounded-lg flex items-center gap-3 transition-colors">
                            <span className="text-xl">📊</span>
                            <span className="text-sm font-semibold">Tabela pozycji</span>
                          </button>
                          
                          <button onClick={() => addBlock('totals')} className="w-full text-left px-3 py-2 hover:bg-sky-50 rounded-lg flex items-center gap-3 transition-colors">
                            <span className="text-xl">💰</span>
                            <span className="text-sm font-semibold">Suma końcowa</span>
                          </button>
                          
                          <button onClick={() => addBlock('payment-info')} className="w-full text-left px-3 py-2 hover:bg-sky-50 rounded-lg flex items-center gap-3 transition-colors">
                            <span className="text-xl">💳</span>
                            <span className="text-sm font-semibold">Płatność</span>
                          </button>
                          
                          <button onClick={() => addBlock('notes')} className="w-full text-left px-3 py-2 hover:bg-sky-50 rounded-lg flex items-center gap-3 transition-colors">
                            <span className="text-xl">📝</span>
                            <span className="text-sm font-semibold">Notatki</span>
                          </button>
                          
                          <button onClick={() => addBlock('footer')} className="w-full text-left px-3 py-2 hover:bg-sky-50 rounded-lg flex items-center gap-3 transition-colors">
                            <span className="text-xl">📜</span>
                            <span className="text-sm font-semibold">Stopka</span>
                          </button>
                        </div>
                      </div>
                    </div>

                    <DndContext
                      sensors={sensors}
                      collisionDetection={closestCenter}
                      onDragStart={handleDragStart}
                      onDragEnd={handleDragEnd}
                    >
                      <SortableContext items={blocks.map(b => b.id)} strategy={verticalListSortingStrategy}>
                        <div className="space-y-4">
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
                              isHighlighted={highlightedBlockId === block.id}
                            />
                          ))}
                        </div>
                      </SortableContext>
                    </DndContext>
                  </div>

                </div>
              </div>
          </div>

          {/* CENTER PANEL - FAKTURA STOI W MIEJSCU */}
          <div className="flex-1 flex justify-center items-start py-6">
            <div className="sticky top-6">
              <div className="bg-white rounded-3xl shadow-2xl">
                {/* Live Invoice Preview - Real-time rendering */}
                <LiveInvoicePreview 
                  state={currentState} 
                  onBlockClick={(blockId) => {
                    setHighlightedBlockId(blockId);
                    // Scroll to block in LEFT panel
                    const blockElement = document.getElementById(`block-${blockId}`);
                    blockElement?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    // Clear highlight after 2s
                    setTimeout(() => setHighlightedBlockId(null), 2000);
                  }}
                />
              </div>
            </div>
          </div>

          {/* RIGHT PANEL - SCROLL */}
          <div className="w-[360px] shrink-0 h-full overflow-y-auto pl-2">
            <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/50 p-5">
              <div className="space-y-5">
                  
                  {/* Color Theme Selector (Quick Apply) */}
                  <div className="pb-6 border-b border-gray-200">
                    <ColorThemeSelector
                      onSelectTheme={handleThemeSelect}
                      currentGradientStart={headerGradientStart}
                      currentGradientEnd={headerGradientEnd}
                    />
                  </div>

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
                          {/* QR Position - UPDATED: relative to Payment Details! */}
                          <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Pozycja</label>
                            <select
                              value={qrCode.position}
                              onChange={(e) => updateState({ qrCode: { ...qrCode, position: e.target.value as any } }, 'Zmieniono pozycję QR')}
                              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl text-sm font-semibold focus:border-sky-500 focus:ring-2 focus:ring-sky-200 transition-all"
                              aria-label="Pozycja kodu QR"
                              title="Wybierz pozycję kodu QR na fakturze"
                            >
                              <option value="payment-right">💳 Obok danych płatności (prawo)</option>
                              <option value="payment-below">💳 Pod danymi płatności</option>
                              <option value="top-right">📍 Góra - prawy róg</option>
                              <option value="bottom-right">📍 Dół - prawy róg</option>
                            </select>
                            <p className="text-xs text-gray-500 mt-2">
                              💡 <strong>Rekomendacja:</strong> Obok lub pod danymi płatności - logiczne połączenie!
                            </p>
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
                            <p className="text-xs text-gray-500 mt-2">
                              💡 <strong>Link płatności</strong> zostanie automatycznie wygenerowany z danych faktury (IBAN/Blik)
                            </p>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Border Settings */}
                  <div className="pb-6 border-b border-gray-200">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">🔲 Obramowania</h3>
                    
                    <div className="space-y-4">
                      {/* Border Color */}
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Kolor obramowania</label>
                        <input
                          type="color"
                          value={borderColor}
                          onChange={(e) => updateState({ borderColor: e.target.value }, 'Zmieniono kolor obramowania')}
                          className="w-full h-12 rounded-xl cursor-pointer border-2 border-gray-300 hover:border-sky-400 transition-colors"
                          title="Kolor obramowania bloków"
                        />
                      </div>

                      {/* Border Style Preview */}
                      <div className="p-4 bg-gray-50 rounded-xl border-2" style={{ borderColor }}>
                        <p className="text-xs text-gray-600 text-center">
                          Podgląd obramowania
                        </p>
                      </div>

                      <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <p className="text-xs text-blue-800">
                          💡 <strong>Tip:</strong> Kolor obramowania wpływa na wszystkie bloki faktury. 
                          Użyj jasnego koloru dla subtelnego efektu.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Decorative Waves */}
                  <div className="pb-6 border-b border-gray-200">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">🌊 Dekoracje (Waves)</h3>
                    
                    <div className="space-y-4">
                      {/* Enable Waves */}
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={decorativeWaves.enabled}
                          onChange={(e) => updateState({ decorativeWaves: { ...decorativeWaves, enabled: e.target.checked } }, 'Włączono/wyłączono fale dekoracyjne')}
                          className="w-5 h-5 text-sky-600 border-gray-300 rounded focus:ring-sky-500"
                        />
                        <span className="text-sm font-semibold text-gray-700">Pokaż fale dekoracyjne</span>
                      </label>

                      {decorativeWaves.enabled && (
                        <>
                          {/* Wave Position */}
                          <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Pozycja</label>
                            <select
                              value={decorativeWaves.position}
                              onChange={(e) => updateState({ decorativeWaves: { ...decorativeWaves, position: e.target.value as 'top' | 'bottom' | 'both' } }, 'Zmieniono pozycję fal')}
                              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl text-sm font-semibold focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
                              title="Pozycja fal dekoracyjnych"
                            >
                              <option value="top">⬆️ Góra</option>
                              <option value="bottom">⬇️ Dół</option>
                              <option value="both">⬆️⬇️ Góra i dół</option>
                            </select>
                          </div>

                          {/* Wave Color */}
                          <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Kolor fali</label>
                            <input
                              type="color"
                              value={decorativeWaves.color}
                              onChange={(e) => updateState({ decorativeWaves: { ...decorativeWaves, color: e.target.value } }, 'Zmieniono kolor fal')}
                              className="w-full h-12 rounded-xl cursor-pointer border-2 border-gray-300 hover:border-sky-400 transition-colors"
                              title="Kolor fal dekoracyjnych"
                            />
                          </div>

                          {/* Wave Opacity */}
                          <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">
                              Przezroczystość: {decorativeWaves.opacity}%
                            </label>
                            <input
                              type="range"
                              min="5"
                              max="50"
                              step="5"
                              value={decorativeWaves.opacity}
                              onChange={(e) => updateState({ decorativeWaves: { ...decorativeWaves, opacity: parseInt(e.target.value) } }, 'Zmieniono przezroczystość fal')}
                              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-sky-600"
                              title="Przezroczystość fal (5-50%)"
                              aria-label="Przezroczystość fal dekoracyjnych"
                            />
                            <div className="flex justify-between text-xs text-gray-500 mt-1">
                              <span>Subtelne (5%)</span>
                              <span>Wyraźne (50%)</span>
                            </div>
                          </div>

                          {/* Wave Preview */}
                          <div 
                            className="h-24 rounded-xl overflow-hidden relative"
                            style={{ backgroundColor: '#f9fafb' }}
                          >
                            <svg
                              viewBox="0 0 1440 320"
                              className="absolute bottom-0 w-full h-full"
                              style={{ opacity: decorativeWaves.opacity / 100 }}
                            >
                              <path
                                fill={decorativeWaves.color}
                                d="M0,192L48,197.3C96,203,192,213,288,229.3C384,245,480,267,576,250.7C672,235,768,181,864,181.3C960,181,1056,235,1152,234.7C1248,235,1344,181,1392,154.7L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
                              />
                            </svg>
                            <p className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-xs text-gray-500">
                              Podgląd fali
                            </p>
                          </div>
                        </>
                      )}

                      <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <p className="text-xs text-blue-800">
                          💡 <strong>Tip:</strong> Fale dekoracyjne dodają nowoczesny akcent. 
                          Użyj koloru pasującego do gradientu nagłówka.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Product Image Frames */}
                  <div className="pb-6 border-b border-gray-200">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">🖼️ Ramki zdjęć produktów</h3>
                    
                    <div className="space-y-4">
                      {/* Border Style */}
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Styl obramowania</label>
                        <select
                          value={imageFrames.borderStyle}
                          onChange={(e) => updateState({ imageFrames: { ...imageFrames, borderStyle: e.target.value as any } }, 'Zmieniono styl ramki')}
                          className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl text-sm font-semibold focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
                          title="Styl obramowania zdjęć"
                        >
                          <option value="none">Brak obramowania</option>
                          <option value="solid">━━━ Ciągła linia</option>
                          <option value="dashed">╌╌╌ Przerywana</option>
                          <option value="dotted">┄┄┄ Kropkowana</option>
                          <option value="double">═══ Podwójna</option>
                        </select>
                      </div>

                      {imageFrames.borderStyle !== 'none' && (
                        <>
                          {/* Border Width */}
                          <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">
                              Grubość: {imageFrames.borderWidth}px
                            </label>
                            <input
                              type="range"
                              min="1"
                              max="5"
                              step="1"
                              value={imageFrames.borderWidth}
                              onChange={(e) => updateState({ imageFrames: { ...imageFrames, borderWidth: parseInt(e.target.value) } }, 'Zmieniono grubość ramki')}
                              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-sky-600"
                              title="Grubość obramowania (1-5px)"
                              aria-label="Grubość obramowania zdjęć"
                            />
                            <div className="flex justify-between text-xs text-gray-500 mt-1">
                              <span>Cienka (1px)</span>
                              <span>Gruba (5px)</span>
                            </div>
                          </div>

                          {/* Border Color */}
                          <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Kolor obramowania</label>
                            <input
                              type="color"
                              value={imageFrames.borderColor}
                              onChange={(e) => updateState({ imageFrames: { ...imageFrames, borderColor: e.target.value } }, 'Zmieniono kolor ramki')}
                              className="w-full h-12 rounded-xl cursor-pointer border-2 border-gray-300 hover:border-sky-400 transition-colors"
                              title="Kolor obramowania zdjęć"
                            />
                          </div>
                        </>
                      )}

                      {/* Border Radius */}
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                          Zaokrąglenie rogów: {imageFrames.borderRadius}px
                        </label>
                        <input
                          type="range"
                          min="0"
                          max="20"
                          step="2"
                          value={imageFrames.borderRadius}
                          onChange={(e) => updateState({ imageFrames: { ...imageFrames, borderRadius: parseInt(e.target.value) } }, 'Zmieniono zaokrąglenie')}
                          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-sky-600"
                          title="Zaokrąglenie rogów (0-20px)"
                          aria-label="Zaokrąglenie rogów ramki"
                        />
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                          <span>Ostre (0px)</span>
                          <span>Okrągłe (20px)</span>
                        </div>
                      </div>

                      {/* Shadow */}
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Cień</label>
                        <select
                          value={imageFrames.shadow}
                          onChange={(e) => updateState({ imageFrames: { ...imageFrames, shadow: e.target.value as any } }, 'Zmieniono cień')}
                          className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl text-sm font-semibold focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
                          title="Cień zdjęć"
                        >
                          <option value="none">Brak cienia</option>
                          <option value="sm">Mały</option>
                          <option value="md">Średni</option>
                          <option value="lg">Duży</option>
                          <option value="xl">Bardzo duży</option>
                        </select>
                      </div>

                      {/* Preview */}
                      <div className="p-4 bg-gray-50 rounded-xl">
                        <p className="text-xs font-bold text-gray-700 mb-3">Podgląd ramki:</p>
                        <div className="flex justify-center">
                          <div
                            style={{
                              width: '80px',
                              height: '80px',
                              borderStyle: imageFrames.borderStyle,
                              borderWidth: imageFrames.borderStyle !== 'none' ? `${imageFrames.borderWidth}px` : '0',
                              borderColor: imageFrames.borderColor,
                              borderRadius: `${imageFrames.borderRadius}px`,
                              boxShadow: imageFrames.shadow !== 'none' ? {
                                sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
                                md: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                                lg: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                                xl: '0 20px 25px -5px rgb(0 0 0 / 0.1)'
                              }[imageFrames.shadow] : 'none',
                              backgroundColor: '#e5e7eb',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            <span className="text-3xl">📦</span>
                          </div>
                        </div>
                      </div>

                      <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <p className="text-xs text-blue-800">
                          💡 <strong>Tip:</strong> Ramki stosują się do zdjęć produktów w tabeli pozycji. 
                          Użyj subtelnych ustawień dla profesjonalnego wyglądu.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Warning Box Settings */}
                  <div className="pb-6 border-b border-gray-200">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">⚠️ Ostrzeżenie (Reverse Charge)</h3>
                    
                    <div className="space-y-4">
                      {/* Enable Warning Box */}
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={warningBox.enabled}
                          onChange={(e) => updateState({ warningBox: { ...warningBox, enabled: e.target.checked } }, 'Włączono/wyłączono ostrzeżenie')}
                          className="w-5 h-5 text-yellow-600 border-gray-300 rounded focus:ring-yellow-500"
                        />
                        <span className="text-sm font-semibold text-gray-700">Pokaż pole ostrzeżenia</span>
                      </label>

                      {warningBox.enabled && (
                        <>
                          {/* Warning Background Color */}
                          <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Kolor tła</label>
                            <input
                              type="color"
                              value={warningBox.backgroundColor}
                              onChange={(e) => updateState({ warningBox: { ...warningBox, backgroundColor: e.target.value } }, 'Zmieniono kolor tła ostrzeżenia')}
                              className="w-full h-12 rounded-lg cursor-pointer border-2 border-gray-300"
                              title="Wybierz kolor tła ostrzeżenia"
                              aria-label="Kolor tła ostrzeżenia"
                            />
                          </div>

                          {/* Warning Text Color */}
                          <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Kolor tekstu</label>
                            <input
                              type="color"
                              value={warningBox.textColor}
                              onChange={(e) => updateState({ warningBox: { ...warningBox, textColor: e.target.value } }, 'Zmieniono kolor tekstu ostrzeżenia')}
                              className="w-full h-12 rounded-lg cursor-pointer border-2 border-gray-300"
                              title="Wybierz kolor tekstu ostrzeżenia"
                              aria-label="Kolor tekstu ostrzeżenia"
                            />
                          </div>

                          {/* Warning Icon */}
                          <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Ikona (emoji)</label>
                            <input
                              type="text"
                              value={warningBox.icon}
                              onChange={(e) => updateState({ warningBox: { ...warningBox, icon: e.target.value } }, 'Zmieniono ikonę ostrzeżenia')}
                              placeholder="⚠️"
                              maxLength={2}
                              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl text-2xl text-center focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200 transition-all"
                            />
                            <p className="text-xs text-gray-500 mt-2">
                              💡 <strong>Tekst ostrzeżenia</strong> (np. "Reverse Charge") zostanie wpisany podczas tworzenia faktury
                            </p>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Social Media Icons - Ikony na fakturze do druku */}
                  <div className="pb-6 border-b border-gray-200">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">📱 Ikony kontaktu</h3>
                    <p className="text-xs text-blue-600 bg-blue-50 border border-blue-200 rounded-lg p-2 mb-3">
                      💡 Wybierz ikony które będą <strong>widoczne na fakturze</strong> (w jednej linii na dole)
                    </p>
                    
                    <div className="space-y-2">
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={socialMedia.enabled}
                          onChange={(e) => updateState({ socialMedia: { ...socialMedia, enabled: e.target.checked } }, 'Ikony toggle')}
                          className="w-5 h-5 text-blue-600 border-gray-300 rounded"
                          title="Włącz/wyłącz ikony na fakturze"
                        />
                        <span className="text-sm font-semibold">Pokaż ikony na fakturze</span>
                      </label>

                      {socialMedia.enabled && (
                        <div className="bg-gray-50 rounded-lg p-3 space-y-1.5">
                          <p className="text-xs font-bold text-gray-700 mb-2">Wybierz ikony (zaznacz które mają się wyświetlać):</p>
                          
                          <label className="flex items-center gap-2 cursor-pointer hover:bg-white p-1.5 rounded transition">
                            <input
                              type="checkbox"
                              checked={!!socialMedia.facebook}
                              onChange={(e) => updateState({ 
                                socialMedia: { ...socialMedia, facebook: e.target.checked ? 'facebook' : '' } 
                              }, 'Facebook')}
                              className="w-4 h-4 text-blue-600 border-gray-300 rounded"
                              title="Facebook"
                            />
                            <FacebookLogo size={18} weight="fill" className="text-blue-600" />
                            <span className="text-xs">Facebook</span>
                          </label>

                          <label className="flex items-center gap-2 cursor-pointer hover:bg-white p-1.5 rounded transition">
                            <input
                              type="checkbox"
                              checked={!!socialMedia.linkedin}
                              onChange={(e) => updateState({ 
                                socialMedia: { ...socialMedia, linkedin: e.target.checked ? 'linkedin' : '' } 
                              }, 'LinkedIn')}
                              className="w-4 h-4 text-blue-700 border-gray-300 rounded"
                              title="LinkedIn"
                            />
                            <LinkedinLogo size={18} weight="fill" className="text-blue-700" />
                            <span className="text-xs">LinkedIn</span>
                          </label>

                          <label className="flex items-center gap-2 cursor-pointer hover:bg-white p-1.5 rounded transition">
                            <input
                              type="checkbox"
                              checked={!!socialMedia.instagram}
                              onChange={(e) => updateState({ 
                                socialMedia: { ...socialMedia, instagram: e.target.checked ? 'instagram' : '' } 
                              }, 'Instagram')}
                              className="w-4 h-4 text-pink-600 border-gray-300 rounded"
                              title="Instagram"
                            />
                            <InstagramLogo size={18} weight="fill" className="text-pink-600" />
                            <span className="text-xs">Instagram</span>
                          </label>

                          <label className="flex items-center gap-2 cursor-pointer hover:bg-white p-1.5 rounded transition">
                            <input
                              type="checkbox"
                              checked={!!socialMedia.twitter}
                              onChange={(e) => updateState({ 
                                socialMedia: { ...socialMedia, twitter: e.target.checked ? 'twitter' : '' } 
                              }, 'Twitter/X')}
                              className="w-4 h-4 text-sky-500 border-gray-300 rounded"
                              title="Twitter / X"
                            />
                            <TwitterLogo size={18} weight="fill" className="text-sky-500" />
                            <span className="text-xs">Twitter / X</span>
                          </label>

                          <label className="flex items-center gap-2 cursor-pointer hover:bg-white p-1.5 rounded transition">
                            <input
                              type="checkbox"
                              checked={!!socialMedia.youtube}
                              onChange={(e) => updateState({ 
                                socialMedia: { ...socialMedia, youtube: e.target.checked ? 'youtube' : '' } 
                              }, 'YouTube')}
                              className="w-4 h-4 text-red-600 border-gray-300 rounded"
                              title="YouTube"
                            />
                            <YoutubeLogo size={18} weight="fill" className="text-red-600" />
                            <span className="text-xs">YouTube</span>
                          </label>

                          <label className="flex items-center gap-2 cursor-pointer hover:bg-white p-1.5 rounded transition">
                            <input
                              type="checkbox"
                              checked={!!socialMedia.tiktok}
                              onChange={(e) => updateState({ 
                                socialMedia: { ...socialMedia, tiktok: e.target.checked ? 'tiktok' : '' } 
                              }, 'TikTok')}
                              className="w-4 h-4 text-gray-900 border-gray-300 rounded"
                              title="TikTok"
                            />
                            <TiktokLogo size={18} weight="fill" className="text-gray-900" />
                            <span className="text-xs">TikTok</span>
                          </label>

                          <label className="flex items-center gap-2 cursor-pointer hover:bg-white p-1.5 rounded transition">
                            <input
                              type="checkbox"
                              checked={!!socialMedia.whatsapp}
                              onChange={(e) => updateState({ 
                                socialMedia: { ...socialMedia, whatsapp: e.target.checked ? 'whatsapp' : '' } 
                              }, 'WhatsApp')}
                              className="w-4 h-4 text-green-600 border-gray-300 rounded"
                              title="WhatsApp"
                            />
                            <WhatsappLogo size={18} weight="fill" className="text-green-600" />
                            <span className="text-xs">WhatsApp</span>
                          </label>

                          <label className="flex items-center gap-2 cursor-pointer hover:bg-white p-1.5 rounded transition">
                            <input
                              type="checkbox"
                              checked={!!socialMedia.telegram}
                              onChange={(e) => updateState({ 
                                socialMedia: { ...socialMedia, telegram: e.target.checked ? 'telegram' : '' } 
                              }, 'Telegram')}
                              className="w-4 h-4 text-blue-500 border-gray-300 rounded"
                              title="Telegram"
                            />
                            <TelegramLogo size={18} weight="fill" className="text-blue-500" />
                            <span className="text-xs">Telegram</span>
                          </label>

                          <label className="flex items-center gap-2 cursor-pointer hover:bg-white p-1.5 rounded transition">
                            <input
                              type="checkbox"
                              checked={!!socialMedia.github}
                              onChange={(e) => updateState({ 
                                socialMedia: { ...socialMedia, github: e.target.checked ? 'github' : '' } 
                              }, 'GitHub')}
                              className="w-4 h-4 text-gray-900 border-gray-300 rounded"
                              title="GitHub"
                            />
                            <GithubLogo size={18} weight="fill" className="text-gray-900" />
                            <span className="text-xs">GitHub</span>
                          </label>

                          <div className="h-px bg-gray-300 my-2"></div>

                          <label className="flex items-center gap-2 cursor-pointer hover:bg-white p-1.5 rounded transition">
                            <input
                              type="checkbox"
                              checked={!!socialMedia.email}
                              onChange={(e) => updateState({ 
                                socialMedia: { ...socialMedia, email: e.target.checked ? 'email' : '' } 
                              }, 'Email')}
                              className="w-4 h-4 text-gray-700 border-gray-300 rounded"
                              title="Email"
                            />
                            <EnvelopeSimple size={18} weight="fill" className="text-gray-700" />
                            <span className="text-xs">Email</span>
                          </label>

                          <label className="flex items-center gap-2 cursor-pointer hover:bg-white p-1.5 rounded transition">
                            <input
                              type="checkbox"
                              checked={!!socialMedia.phone}
                              onChange={(e) => updateState({ 
                                socialMedia: { ...socialMedia, phone: e.target.checked ? 'phone' : '' } 
                              }, 'Telefon')}
                              className="w-4 h-4 text-gray-700 border-gray-300 rounded"
                              title="Telefon"
                            />
                            <Phone size={18} weight="fill" className="text-gray-700" />
                            <span className="text-xs">Telefon</span>
                          </label>

                          <label className="flex items-center gap-2 cursor-pointer hover:bg-white p-1.5 rounded transition">
                            <input
                              type="checkbox"
                              checked={!!socialMedia.website}
                              onChange={(e) => updateState({ 
                                socialMedia: { ...socialMedia, website: e.target.checked ? 'website' : '' } 
                              }, 'Strona WWW')}
                              className="w-4 h-4 text-gray-700 border-gray-300 rounded"
                              title="Strona WWW"
                            />
                            <Globe size={18} weight="fill" className="text-gray-700" />
                            <span className="text-xs">Strona WWW</span>
                          </label>

                          <div className="mt-3 pt-3 border-t border-gray-200">
                            <p className="text-xs text-gray-600">
                              ✨ Wybrane ikony będą wyświetlane <strong>w jednej linii</strong> na dole faktury (idealne do druku)
                            </p>
                          </div>
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
  );
}
