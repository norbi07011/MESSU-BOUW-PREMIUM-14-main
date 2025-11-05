/**
 * Rich Text Editor - Kompletny edytor WYSIWYG dla dokumentów
 * Toolbar: Bold, Italic, Underline, Colors, Fonts, Alignment, Lists, Images, Tables, Borders
 */

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import {
  TextB,
  TextItalic,
  TextUnderline,
  TextAlignLeft,
  TextAlignCenter,
  TextAlignRight,
  TextAlignJustify,
  ListBullets,
  ListNumbers,
  Image as ImageIcon,
  Table,
  FrameCorners,
  PaintBucket,
  TextAa,
} from '@phosphor-icons/react';
import { toast } from 'sonner';

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  className?: string;
}

export default function RichTextEditor({ value, onChange, className = '' }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [selectedColor, setSelectedColor] = useState('#000000');
  const [bgColor, setBgColor] = useState('#ffffff');
  const [fontSize, setFontSize] = useState('12');
  const [fontFamily, setFontFamily] = useState('Arial');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Wykonaj komendę formatowania
  const execCommand = (command: string, value: string | undefined = undefined) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
  };

  // Wstaw HTML na pozycji kursora
  const insertHTML = (html: string) => {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      range.deleteContents();
      const node = range.createContextualFragment(html);
      range.insertNode(node);
    }
    updateContent();
  };

  // Aktualizuj content
  const updateContent = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  // Dodaj obraz
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Wybierz plik obrazu');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const imageUrl = event.target?.result as string;
      insertHTML(`<img src="${imageUrl}" style="max-width: 100%; height: auto; margin: 10px 0;" alt="Uploaded image" />`);
      toast.success('Obraz dodany');
    };
    reader.readAsDataURL(file);
  };

  // Dodaj tabelę
  const insertTable = () => {
    const rows = prompt('Liczba wierszy:', '3');
    const cols = prompt('Liczba kolumn:', '3');
    
    if (!rows || !cols) return;

    const rowCount = parseInt(rows);
    const colCount = parseInt(cols);

    let tableHTML = '<table style="width: 100%; border-collapse: collapse; margin: 15px 0;">';
    
    for (let i = 0; i < rowCount; i++) {
      tableHTML += '<tr>';
      for (let j = 0; j < colCount; j++) {
        tableHTML += '<td style="border: 1px solid #ddd; padding: 8px; min-width: 50px;">&nbsp;</td>';
      }
      tableHTML += '</tr>';
    }
    
    tableHTML += '</table>';
    insertHTML(tableHTML);
    toast.success('Tabela dodana');
  };

  // Dodaj ramkę/border
  const addBorder = () => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) {
      toast.info('Zaznacz tekst aby dodać ramkę');
      return;
    }

    const range = selection.getRangeAt(0);
    const span = document.createElement('span');
    span.style.border = '2px solid #0ea5e9';
    span.style.padding = '5px 10px';
    span.style.display = 'inline-block';
    span.style.borderRadius = '4px';
    
    range.surroundContents(span);
    updateContent();
    toast.success('Ramka dodana');
  };

  // Merge fields
  const insertMergeField = (field: string) => {
    insertHTML(`<span style="background-color: #e0f2fe; color: #0369a1; padding: 2px 6px; border-radius: 3px; font-weight: 500;">[${field}]</span>&nbsp;`);
  };

  return (
    <div className={`border border-sky-200 rounded-lg overflow-hidden ${className}`}>
      {/* TOOLBAR */}
      <div className="bg-gradient-to-r from-sky-50 to-blue-50 border-b border-sky-200 p-2 flex flex-wrap items-center gap-1">
        
        {/* Font Family */}
        <Select value={fontFamily} onValueChange={(val) => { setFontFamily(val); execCommand('fontName', val); }}>
          <SelectTrigger className="w-32 h-8 bg-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Arial">Arial</SelectItem>
            <SelectItem value="Helvetica">Helvetica</SelectItem>
            <SelectItem value="Times New Roman">Times New Roman</SelectItem>
            <SelectItem value="Courier New">Courier New</SelectItem>
            <SelectItem value="Georgia">Georgia</SelectItem>
            <SelectItem value="Verdana">Verdana</SelectItem>
            <SelectItem value="Comic Sans MS">Comic Sans</SelectItem>
          </SelectContent>
        </Select>

        {/* Font Size */}
        <Select value={fontSize} onValueChange={(val) => { setFontSize(val); execCommand('fontSize', '3'); document.execCommand('fontName', false, fontFamily); const selection = window.getSelection(); if (selection && selection.rangeCount > 0) { const range = selection.getRangeAt(0); const span = range.commonAncestorContainer.parentElement; if (span) span.style.fontSize = val + 'px'; } }}>
          <SelectTrigger className="w-20 h-8 bg-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="8">8</SelectItem>
            <SelectItem value="10">10</SelectItem>
            <SelectItem value="12">12</SelectItem>
            <SelectItem value="14">14</SelectItem>
            <SelectItem value="16">16</SelectItem>
            <SelectItem value="18">18</SelectItem>
            <SelectItem value="20">20</SelectItem>
            <SelectItem value="24">24</SelectItem>
            <SelectItem value="28">28</SelectItem>
            <SelectItem value="32">32</SelectItem>
          </SelectContent>
        </Select>

        <Separator orientation="vertical" className="h-6" />

        {/* Bold, Italic, Underline */}
        <Button
          size="sm"
          variant="ghost"
          className="h-8 w-8 p-0"
          onClick={() => execCommand('bold')}
          title="Pogrubienie (Ctrl+B)"
        >
          <TextB className="h-4 w-4" />
        </Button>

        <Button
          size="sm"
          variant="ghost"
          className="h-8 w-8 p-0"
          onClick={() => execCommand('italic')}
          title="Kursywa (Ctrl+I)"
        >
          <TextItalic className="h-4 w-4" />
        </Button>

        <Button
          size="sm"
          variant="ghost"
          className="h-8 w-8 p-0"
          onClick={() => execCommand('underline')}
          title="Podkreślenie (Ctrl+U)"
        >
          <TextUnderline className="h-4 w-4" />
        </Button>

        <Separator orientation="vertical" className="h-6" />

        {/* Text Color */}
        <Popover>
          <PopoverTrigger asChild>
            <Button size="sm" variant="ghost" className="h-8 w-8 p-0" title="Kolor tekstu">
              <TextAa className="h-4 w-4" style={{ color: selectedColor }} weight="bold" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64">
            <Label>Kolor tekstu</Label>
            <div className="flex gap-2 mt-2">
              <Input
                type="color"
                value={selectedColor}
                onChange={(e) => {
                  setSelectedColor(e.target.value);
                  execCommand('foreColor', e.target.value);
                }}
                className="h-10"
              />
              <Input
                type="text"
                value={selectedColor}
                onChange={(e) => {
                  setSelectedColor(e.target.value);
                  execCommand('foreColor', e.target.value);
                }}
                className="h-10"
                placeholder="#000000"
              />
            </div>
            <div className="grid grid-cols-6 gap-2 mt-3">
              {['#000000', '#ffffff', '#0ea5e9', '#2563eb', '#dc2626', '#16a34a', '#eab308', '#8b5cf6', '#ec4899', '#f97316', '#64748b', '#334155'].map(color => (
                <button
                  key={color}
                  className="w-8 h-8 rounded border-2 border-gray-300 hover:border-sky-500"
                  style={{ backgroundColor: color }}
                  onClick={() => {
                    setSelectedColor(color);
                    execCommand('foreColor', color);
                  }}
                />
              ))}
            </div>
          </PopoverContent>
        </Popover>

        {/* Background Color */}
        <Popover>
          <PopoverTrigger asChild>
            <Button size="sm" variant="ghost" className="h-8 w-8 p-0" title="Kolor tła">
              <PaintBucket className="h-4 w-4" style={{ color: bgColor }} weight="fill" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64">
            <Label>Kolor tła</Label>
            <div className="flex gap-2 mt-2">
              <Input
                type="color"
                value={bgColor}
                onChange={(e) => {
                  setBgColor(e.target.value);
                  execCommand('backColor', e.target.value);
                }}
                className="h-10"
              />
              <Input
                type="text"
                value={bgColor}
                onChange={(e) => {
                  setBgColor(e.target.value);
                  execCommand('backColor', e.target.value);
                }}
                className="h-10"
                placeholder="#ffffff"
              />
            </div>
            <div className="grid grid-cols-6 gap-2 mt-3">
              {['#ffffff', '#f8fafc', '#e0f2fe', '#dbeafe', '#fee2e2', '#dcfce7', '#fef9c3', '#f3e8ff', '#fce7f3', '#ffedd5', '#f1f5f9', '#e2e8f0'].map(color => (
                <button
                  key={color}
                  className="w-8 h-8 rounded border-2 border-gray-300 hover:border-sky-500"
                  style={{ backgroundColor: color }}
                  onClick={() => {
                    setBgColor(color);
                    execCommand('backColor', color);
                  }}
                />
              ))}
            </div>
          </PopoverContent>
        </Popover>

        <Separator orientation="vertical" className="h-6" />

        {/* Alignment */}
        <Button
          size="sm"
          variant="ghost"
          className="h-8 w-8 p-0"
          onClick={() => execCommand('justifyLeft')}
          title="Wyrównaj do lewej"
        >
          <TextAlignLeft className="h-4 w-4" />
        </Button>

        <Button
          size="sm"
          variant="ghost"
          className="h-8 w-8 p-0"
          onClick={() => execCommand('justifyCenter')}
          title="Wyśrodkuj"
        >
          <TextAlignCenter className="h-4 w-4" />
        </Button>

        <Button
          size="sm"
          variant="ghost"
          className="h-8 w-8 p-0"
          onClick={() => execCommand('justifyRight')}
          title="Wyrównaj do prawej"
        >
          <TextAlignRight className="h-4 w-4" />
        </Button>

        <Button
          size="sm"
          variant="ghost"
          className="h-8 w-8 p-0"
          onClick={() => execCommand('justifyFull')}
          title="Wyjustuj"
        >
          <TextAlignJustify className="h-4 w-4" />
        </Button>

        <Separator orientation="vertical" className="h-6" />

        {/* Lists */}
        <Button
          size="sm"
          variant="ghost"
          className="h-8 w-8 p-0"
          onClick={() => execCommand('insertUnorderedList')}
          title="Lista punktowana"
        >
          <ListBullets className="h-4 w-4" />
        </Button>

        <Button
          size="sm"
          variant="ghost"
          className="h-8 w-8 p-0"
          onClick={() => execCommand('insertOrderedList')}
          title="Lista numerowana"
        >
          <ListNumbers className="h-4 w-4" />
        </Button>

        <Separator orientation="vertical" className="h-6" />

        {/* Image */}
        <Button
          size="sm"
          variant="ghost"
          className="h-8 w-8 p-0"
          onClick={() => fileInputRef.current?.click()}
          title="Dodaj zdjęcie"
        >
          <ImageIcon className="h-4 w-4" />
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleImageUpload}
        />

        {/* Table */}
        <Button
          size="sm"
          variant="ghost"
          className="h-8 w-8 p-0"
          onClick={insertTable}
          title="Dodaj tabelę"
        >
          <Table className="h-4 w-4" />
        </Button>

        {/* Border/Frame */}
        <Button
          size="sm"
          variant="ghost"
          className="h-8 w-8 p-0"
          onClick={addBorder}
          title="Dodaj ramkę (zaznacz tekst)"
        >
          <FrameCorners className="h-4 w-4" />
        </Button>

        <Separator orientation="vertical" className="h-6" />

        {/* Merge Fields */}
        <div className="flex gap-1">
          <Button
            size="sm"
            variant="outline"
            className="h-8 text-xs"
            onClick={() => insertMergeField('NAZWA')}
          >
            [NAZWA]
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="h-8 text-xs"
            onClick={() => insertMergeField('DATA')}
          >
            [DATA]
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="h-8 text-xs"
            onClick={() => insertMergeField('FIRMA')}
          >
            [FIRMA]
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="h-8 text-xs"
            onClick={() => insertMergeField('ADRES')}
          >
            [ADRES]
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="h-8 text-xs"
            onClick={() => insertMergeField('EMAIL')}
          >
            [EMAIL]
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="h-8 text-xs"
            onClick={() => insertMergeField('TELEFON')}
          >
            [TELEFON]
          </Button>
        </div>
      </div>

      {/* EDITOR AREA */}
      <div
        ref={editorRef}
        contentEditable
        className="min-h-[500px] p-6 bg-white focus:outline-none prose prose-sm max-w-none"
        style={{
          fontFamily: fontFamily,
          fontSize: `${fontSize}px`,
          lineHeight: '1.6',
        }}
        onInput={updateContent}
        dangerouslySetInnerHTML={{ __html: value }}
        suppressContentEditableWarning
      />
    </div>
  );
}
