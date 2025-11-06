# 🎯 PLAN REDESIGNU INVOICE TEMPLATE EDITOR

**Data:** 5 listopada 2025  
**Cel:** Stworzenie najbardziej zaawansowanego edytora faktur w stylu Canva z funkcjami jakich NIKT NIE MA

---

## 📊 FAZA 0: ANALIZA PLACU BUDOWY (OBECNY STAN)

### **OBECNE KOMPONENTY:**


**Status:** ⚠️ Layout wymaga naprawy
- **TOP BAR:** Sticky header z nazwą szablonu + przyciski (Export/Import/Undo/Redo/Save)
- **LAYOUT:** `grid-cols-2` (2 kolumny obok siebie) - **PROBLEM: wymaga scrollowania "kilometr do dołu"**
  - LEFT: Logo + Blocks list
  - RIGHT: Colors + Fonts + Settings
- **BRAKUJE:** CENTER preview faktury (live rendering)

#### 2. **LogoControls.tsx** (254 linii) - ✅ UPGRADED v2
- Live preview (200px draggable box)
- Drag & drop (mouse handlers)
- Width slider (50-300px)
- Height slider (30-200px)
- **Opacity slider (0-100%)** - przezroczystość ✅
- Position display (X/Y coordinates)

#### 3. **ColorPickerDual.tsx** (108 linii) - ✅ FIXED
- Gradient color picker (start/end)
- Supports both naming conventions (`onStartChange` + `onStartColorChange`)

#### 4. **FontControls.tsx** - ✅ WORKING
- Font family selector
- Font size slider

#### 5. **UndoRedoToolbar.tsx** - ✅ WORKING
- 20-step history
- Ctrl+Z / Ctrl+Y shortcuts

---

### **CO DZIAŁA:**
✅ Logo upload + drag & drop + resize + opacity  
✅ Undo/Redo (20 kroków)  
✅ Gradient colors (3x: header, primary, accent)  
✅ Font controls (heading + body)  
✅ Blocks drag & drop (8 typów)  
✅ Export/Import JSON  
✅ Keyboard shortcuts (Ctrl+S/Z/Y)  

### **CO NIE DZIAŁA / BRAKUJE:**
❌ Layout wymaga scrollowania w dół (za duże ramki)  
❌ Brak live preview faktury w centrum  
❌ Brak QR code generator/placeholder  
❌ Brak social media icons  
❌ Brak yellow warning box (reverse charge)  
❌ Brak blue total box (gradient)  
❌ Brak gradient waves/shapes  
❌ Brak product images upload  
❌ Brak payment method icons  
❌ Brak discount column  
❌ Brak signature upload  
❌ Brak business emoticons  
❌ Brak hologram effect na zdjęcia  

---

## 🎨 FAZA 1: CHIRURGIA LAYOUTU (15 min)

**CEL:** Naprawić "kilometr scrollowania" - zrobić kompaktowy, czytelny layout

### **1.1 ZMNIEJSZ WSZYSTKIE PADDINGI:**
```tsx
// PRZED:
p-8 (32px) → NAD DUŻO!
p-6 (24px) → ZA DUŻO!
p-4 (16px) → STANDARD

// PO:
p-2 (8px)  → KOMPAKTOWY
p-3 (12px) → SEKCJE
p-4 (16px) → GŁÓWNE KONTENERY
```

### **1.2 ZMNIEJSZ SZEROKOŚĆ PANELI:**
```tsx
// PRZED:
w-80 (320px) - LEFT panel
w-80 (320px) - RIGHT panel
= 640px zajęte, pozostaje ~600px na center

// PO:
w-64 (256px) - LEFT panel
w-64 (256px) - RIGHT panel
= 512px zajęte, pozostaje ~800px na center ✅
```

### **1.3 KOMPAKTOWE INPUTY:**
```tsx
// PRZED:
h-10 (40px) - za wysokie

// PO:
h-8 (32px) - idealne
```

### **1.4 SCAL COLORPICKERDUAL (1 linia zamiast 2):**
```tsx
// PRZED (120px wysokości):
<div className="space-y-3">
  <Label>Start Color</Label>
  <Input type="color" />
  <Label>End Color</Label>
  <Input type="color" />
</div>

// PO (60px wysokości):
<div className="flex gap-2">
  <Input type="color" title="Start" />
  <Input type="color" title="End" />
</div>
```

### **1.5 SCAL FONTCONTROLS (1 linia zamiast 2):**
```tsx
// PRZED (100px):
<Label>Font Family</Label>
<Select />
<Label>Font Size</Label>
<Input />

// PO (50px):
<div className="flex gap-2">
  <Select title="Font" />
  <Input type="number" title="Size" />
</div>
```

### **1.6 ACCORDION DLA SEKCJI:**
```tsx
// Kolory / Fonty / Settings w collapsible sections
<Accordion type="single" collapsible>
  <AccordionItem value="colors">
    <AccordionTrigger>🎨 Kolory</AccordionTrigger>
    <AccordionContent>...</AccordionContent>
  </AccordionItem>
</Accordion>
```

### **1.7 ZMNIEJSZ PREVIEW A4 (60% scale):**
```tsx
// PRZED:
595x842px (100% scale) - NIE MIEŚCI SIĘ

// PO:
357x505px (60% scale) - MIEŚCI SIĘ ✅
```

**REZULTAT:**
- Left panel: 256px, scrollable
- Center: ~800px, LIVE PREVIEW (always visible, no scroll)
- Right panel: 256px, scrollable
- **KONIEC SCROLLOWANIA "KILOMETR W DÓŁ"!**

---

## 🏗️ FAZA 2: LOGO CONTROLS - FULL INTEGRATION (20 min)

**CEL:** Logo z pełną kontrolą na wszystkich 3 podstronach

### **2.1 Company Information (src/pages/Settings.tsx):**
```tsx
// DODAJ:
- Logo opacity slider (0-100%)
- Logo position (left/center/right)
- Logo size (width/height px)
- Logo preview (live)
```

### **2.2 Invoice Form (src/pages/Invoices.tsx - NewInvoice):**
```tsx
// DODAJ:
- Logo preview w headerze faktury
- Opacity slider (0-100%)
- Position buttons (L/C/R)
- Real-time update w preview
```

### **2.3 Template Editor (InvoiceTemplateEditor.tsx):**
```tsx
// JUŻ MAMY ✅ (LogoControls v2):
- Drag & drop
- Resize sliders
- Opacity 0-100%
- Position X/Y

// UPEWNIJ SIĘ ŻE DZIAŁA:
- Test drag → X/Y update
- Test opacity → preview transparency
- Test resize → width/height update
```

**REZULTAT:**
- Logo z pełną kontrolą na 3 podstronach ✅
- Live preview wszędzie ✅
- Opacity działa (0-100%) ✅

---

## 📱 FAZA 3: QR CODE GENERATOR + FRAME STYLES (15 min)

**CEL:** Automatyczny QR kod płatności z pięknymi ramkami

### **3.1 QR Code Generator (nowa funkcja):**
```typescript
// src/lib/qrCodeGenerator.ts
export function generatePaymentQR(data: {
  iban: string;
  amount: number;
  currency: string;
  reference: string;
  name: string;
}): string {
  // Format: BCD (EPC QR Code standard)
  const qrData = `BCD\n002\n1\nSCT\n${data.name}\n${data.iban}\nEUR${data.amount}\n\n${data.reference}`;
  return generateQRCodeBase64(qrData);
}
```

### **3.2 QR Frame Styles (Template Editor):**
```tsx
// DODAJ DO EditorState:
qrCodeSettings: {
  enabled: boolean;
  position: 'top-right' | 'bottom-right' | 'center';
  size: 80 | 120 | 150; // px
  frameStyle: 'rectangle' | 'rounded' | 'gradient' | 'none';
  frameBorderColor: string;
  frameBorderWidth: number; // 1-5px
  backgroundColor: string;
}

// COMPONENT: QRFrameSelector.tsx
<Select value={frameStyle}>
  <option value="rectangle">🟦 Prostokąt</option>
  <option value="rounded">⬜ Zaokrąglony</option>
  <option value="gradient">🌈 Gradient</option>
  <option value="none">❌ Bez ramki</option>
</Select>

<ColorPicker label="Kolor ramki" value={frameBorderColor} />
<Slider label="Grubość ramki" min={1} max={5} value={frameBorderWidth} />
```

### **3.3 Company Info - QR Settings:**
```tsx
// src/pages/Settings.tsx - DODAJ:
<Checkbox label="Włącz automatyczny QR kod płatności" />
<Select label="Typ QR">
  <option value="payment">💳 Płatność (EPC)</option>
  <option value="vcard">👤 vCard (dane kontaktowe)</option>
  <option value="url">🔗 Custom URL</option>
</Select>
```

### **3.4 Invoice Preview - Render QR:**
```tsx
// Generated Invoice:
{qrCodeSettings.enabled && (
  <div className={`qr-frame qr-frame-${frameStyle}`} style={{
    position: 'absolute',
    [qrCodeSettings.position === 'top-right' ? 'top' : 'bottom']: '20px',
    right: '20px',
    border: `${frameBorderWidth}px solid ${frameBorderColor}`,
    borderRadius: frameStyle === 'rounded' ? '12px' : '0',
    background: frameStyle === 'gradient' 
      ? `linear-gradient(135deg, ${frameBorderColor}, ${backgroundColor})`
      : backgroundColor,
    padding: '8px'
  }}>
    <img src={qrCodeBase64} width={size} height={size} alt="QR Payment" />
    <p className="text-xs text-center mt-1">Zeskanuj, aby zapłacić</p>
  </div>
)}
```

**REZULTAT:**
- QR kod generuje się automatycznie przy tworzeniu faktury ✅
- 4 style ramek (prostokąt/zaokrąglony/gradient/none) ✅
- 3 pozycje (top-right/bottom-right/center) ✅
- 3 rozmiary (80/120/150px) ✅

---

## 🌐 FAZA 4: SOCIAL MEDIA ICONS (10 min)

**CEL:** Ikony social media w stopce faktury

### **4.1 Company Info - Social Media Fields:**
```tsx
// src/pages/Settings.tsx - DODAJ:
<h3>🌐 Media społecznościowe</h3>
<Input label="Facebook" placeholder="https://facebook.com/..." />
<Input label="Instagram" placeholder="https://instagram.com/..." />
<Input label="LinkedIn" placeholder="https://linkedin.com/..." />
<Input label="Twitter/X" placeholder="https://twitter.com/..." />
<Input label="YouTube" placeholder="https://youtube.com/..." />
<Input label="TikTok" placeholder="https://tiktok.com/@..." />
```

### **4.2 Template Editor - Social Icons Display:**
```tsx
// DODAJ DO EditorState:
socialMedia: {
  showIcons: boolean;
  position: 'header' | 'footer';
  iconColor: string;
  iconSize: 16 | 24 | 32; // px
  links: {
    facebook?: string;
    instagram?: string;
    linkedin?: string;
    twitter?: string;
    youtube?: string;
    tiktok?: string;
  }
}
```

### **4.3 Generated Invoice - Render Icons:**
```tsx
// Footer:
{socialMedia.showIcons && (
  <div className="social-icons flex gap-3 justify-center mt-4">
    {socialMedia.links.facebook && (
      <a href={socialMedia.links.facebook}>
        <FacebookLogo size={socialMedia.iconSize} color={socialMedia.iconColor} />
      </a>
    )}
    {socialMedia.links.instagram && (
      <a href={socialMedia.links.instagram}>
        <InstagramLogo size={socialMedia.iconSize} color={socialMedia.iconColor} />
      </a>
    )}
    {/* ... pozostałe ... */}
  </div>
)}
```

**REZULTAT:**
- 6 social media links ✅
- Ikony w header lub footer ✅
- Custom kolor + rozmiar ✅

---

## 🌊 FAZA 5: GRADIENT WAVES & BLUE TOTAL BOX (15 min)

**CEL:** Piękne falowane paski + niebieski box na sumę

### **5.1 Gradient Waves Generator:**
```tsx
// DODAJ DO EditorState:
waves: {
  enabled: boolean;
  position: 'top' | 'bottom' | 'both';
  style: 'wave' | 'rectangle' | 'triangle';
  colors: {
    start: string;
    end: string;
  };
  height: number; // 20-100px
}

// COMPONENT: WaveStyleSelector.tsx
<Select value={waves.style}>
  <option value="wave">🌊 Falowane</option>
  <option value="rectangle">🟦 Prostokątne</option>
  <option value="triangle">🔺 Trójkąty</option>
</Select>
```

### **5.2 Blue Total Box:**
```tsx
// DODAJ DO EditorState:
totalBox: {
  enabled: boolean;
  gradient: {
    start: string; // #1e40af (dark blue)
    end: string;   // #3b82f6 (blue)
  };
  borderRadius: number; // 0-20px
  textColor: string; // white
  fontSize: number; // 24-48px
}

// Generated Invoice:
<div className="total-box" style={{
  background: `linear-gradient(135deg, ${totalBox.gradient.start}, ${totalBox.gradient.end})`,
  borderRadius: `${totalBox.borderRadius}px`,
  color: totalBox.textColor,
  fontSize: `${totalBox.fontSize}px`,
  fontWeight: 'bold',
  padding: '16px 24px',
  textAlign: 'right'
}}>
  Suma brutto: {totalBrutto} {currency}
</div>
```

### **5.3 Wave SVG Generator:**
```tsx
// src/components/WaveShape.tsx
export function WaveShape({ style, colors, height }: WaveProps) {
  if (style === 'wave') {
    return (
      <svg viewBox="0 0 1200 120" style={{ height }}>
        <defs>
          <linearGradient id="waveGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={colors.start} />
            <stop offset="100%" stopColor={colors.end} />
          </linearGradient>
        </defs>
        <path fill="url(#waveGradient)" 
          d="M0,50 C150,70 350,30 600,50 C850,70 1050,30 1200,50 L1200,120 L0,120 Z" />
      </svg>
    );
  }
  // ... pozostałe style ...
}
```

**REZULTAT:**
- 3 style waves (falowane/prostokątne/trójkąty) ✅
- Gradient colors (start/end) ✅
- Pozycja (top/bottom/both) ✅
- Blue total box z gradientem ✅

---

## ⚠️ FAZA 6: YELLOW WARNING BOX (10 min)

**CEL:** Edytowalny żółty box dla reverse charge / custom warnings

### **6.1 Warning Box Editor:**
```tsx
// DODAJ DO EditorState:
warningBox: {
  enabled: boolean;
  text: string; // default: "Odwrotne obciążenie (reverse charge) – art. 194 dyrektywy VAT"
  backgroundColor: string; // #fef3c7 (yellow-100)
  textColor: string; // #92400e (yellow-900)
  borderColor: string; // #fbbf24 (yellow-400)
  icon: string; // "⚠️" emoji
}

// COMPONENT: WarningBoxEditor.tsx
<Checkbox label="Pokaż ostrzeżenie" checked={warningBox.enabled} />
<Textarea 
  label="Tekst ostrzeżenia" 
  value={warningBox.text}
  placeholder="Odwrotne obciążenie..."
/>
<ColorPicker label="Kolor tła" value={warningBox.backgroundColor} />
<ColorPicker label="Kolor tekstu" value={warningBox.textColor} />
<Input label="Emoji/Ikona" value={warningBox.icon} placeholder="⚠️" />
```

### **6.2 Invoice Form - Auto-Show:**
```tsx
// src/pages/Invoices.tsx - NewInvoice
// Gdy zaznaczono checkbox "Odwrotne obciążenie (0% VAT)"
const [reverseCharge, setReverseCharge] = useState(false);

useEffect(() => {
  if (reverseCharge) {
    // Auto-enable warning box
    updateInvoice({ 
      warningBox: { 
        enabled: true,
        text: "Odwrotne obciążenie (reverse charge) – art. 194 dyrektywy VAT"
      }
    });
  }
}, [reverseCharge]);
```

### **6.3 Generated Invoice - Render:**
```tsx
{warningBox.enabled && (
  <div className="warning-box" style={{
    backgroundColor: warningBox.backgroundColor,
    color: warningBox.textColor,
    border: `2px solid ${warningBox.borderColor}`,
    borderRadius: '8px',
    padding: '12px 16px',
    margin: '16px 0',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  }}>
    <span style={{ fontSize: '20px' }}>{warningBox.icon}</span>
    <span>{warningBox.text}</span>
  </div>
)}
```

**REZULTAT:**
- Edytowalny tekst ostrzeżenia ✅
- Custom kolory (tło/tekst/ramka) ✅
- Auto-show przy reverse charge ✅
- Custom emoji/ikona ✅

---

## 🖼️ FAZA 7: PRODUCT IMAGES + HOLOGRAM EFFECT (25 min)

**CEL:** Upload zdjęć produktów + efekt hologramu (naklejka!)

### **7.1 Invoice Form - Product Image Upload:**
```tsx
// src/pages/Invoices.tsx - Item Row
<div className="item-image">
  <Input 
    type="file" 
    accept="image/*"
    onChange={(e) => {
      const file = e.target.files[0];
      // Otwórz Image Editor
      openImageEditor(file, itemIndex);
    }}
  />
  {item.image && (
    <img src={item.image} className="w-16 h-16 object-cover rounded" />
  )}
</div>
```

### **7.2 IMAGE EDITOR + HOLOGRAM EFFECT:**
```tsx
// src/components/ImageEditor.tsx
export function ImageEditor({ image, onSave }: ImageEditorProps) {
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [hologram, setHologram] = useState({
    enabled: false,
    opacity: 50,
    rainbowShift: 10, // color shift amount
    glowIntensity: 20
  });

  return (
    <div className="image-editor">
      {/* Crop */}
      <ReactCrop crop={crop} onChange={setCrop}>
        <img src={image} />
      </ReactCrop>

      {/* Hologram Effect */}
      <div className="hologram-controls">
        <Checkbox 
          label="🌈 Efekt hologramu" 
          checked={hologram.enabled} 
        />
        {hologram.enabled && (
          <>
            <Slider 
              label="Przezroczystość hologramu" 
              min={0} max={100} 
              value={hologram.opacity} 
            />
            <Slider 
              label="Intensywność tęczy" 
              min={0} max={50} 
              value={hologram.rainbowShift} 
            />
            <Slider 
              label="Blask" 
              min={0} max={50} 
              value={hologram.glowIntensity} 
            />
          </>
        )}
      </div>

      {/* Preview z hologramem */}
      <div className="preview">
        <img 
          src={image}
          style={{
            filter: hologram.enabled 
              ? `
                brightness(${brightness}%)
                contrast(${contrast}%)
                hue-rotate(${hologram.rainbowShift}deg)
                drop-shadow(0 0 ${hologram.glowIntensity}px rgba(255,255,255,0.8))
              `
              : `brightness(${brightness}%) contrast(${contrast}%)`
          }}
          className={hologram.enabled ? 'hologram-layer' : ''}
        />
        {hologram.enabled && (
          <div 
            className="hologram-overlay"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              background: `linear-gradient(
                45deg,
                rgba(255,0,255,${hologram.opacity/100}) 0%,
                rgba(0,255,255,${hologram.opacity/100}) 33%,
                rgba(255,255,0,${hologram.opacity/100}) 66%,
                rgba(255,0,255,${hologram.opacity/100}) 100%
              )`,
              mixBlendMode: 'screen',
              pointerEvents: 'none'
            }}
          />
        )}
      </div>
    </div>
  );
}
```

### **7.3 CSS Hologram Animation:**
```css
/* src/styles/hologram.css */
.hologram-layer {
  position: relative;
  animation: hologram-shimmer 3s infinite;
}

@keyframes hologram-shimmer {
  0% {
    filter: hue-rotate(0deg) brightness(100%);
  }
  25% {
    filter: hue-rotate(10deg) brightness(110%);
  }
  50% {
    filter: hue-rotate(20deg) brightness(120%);
  }
  75% {
    filter: hue-rotate(10deg) brightness(110%);
  }
  100% {
    filter: hue-rotate(0deg) brightness(100%);
  }
}

.hologram-overlay {
  animation: hologram-shift 2s infinite alternate;
}

@keyframes hologram-shift {
  0% {
    opacity: 0.3;
    transform: translateX(0px);
  }
  100% {
    opacity: 0.6;
    transform: translateX(2px);
  }
}
```

### **7.4 Generated Invoice - Render Images:**
```tsx
// Tabela pozycji - kolumna z obrazkiem
<td className="item-image-cell">
  {item.image ? (
    <div className="relative w-16 h-16">
      <img 
        src={item.image} 
        className={item.hologram?.enabled ? 'hologram-layer' : ''}
        style={{
          filter: item.hologram?.enabled 
            ? `hue-rotate(${item.hologram.rainbowShift}deg)`
            : 'none'
        }}
      />
      {item.hologram?.enabled && (
        <div className="hologram-overlay" style={{
          opacity: item.hologram.opacity / 100
        }} />
      )}
    </div>
  ) : (
    <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center">
      <ImageIcon size={24} className="text-gray-400" />
    </div>
  )}
</td>
```

**REZULTAT:**
- Upload produktów ✅
- Crop/Resize w edytorze ✅
- **HOLOGRAM EFFECT** (rainbow shimmer + glow!) ✅
- Miniaturki 60x60px w tabeli ✅
- Placeholder jeśli brak zdjęcia ✅

---

## 💳 FAZA 8: PAYMENT METHOD + ICONS (10 min)

**CEL:** Wybór metody płatności + ikony (Visa, MC, Blik, Przelewy24)

### **8.1 Invoice Form - Payment Method:**
```tsx
// src/pages/Invoices.tsx - DODAJ:
<Select label="Sposób płatności" value={paymentMethod}>
  <option value="transfer">🏦 Przelew bankowy</option>
  <option value="card">💳 Karta kredytowa</option>
  <option value="cash">💵 Gotówka</option>
  <option value="blik">📱 BLIK</option>
  <option value="p24">🔵 Przelewy24</option>
</Select>
```

### **8.2 Template Editor - Payment Icons:**
```tsx
// DODAJ DO EditorState:
paymentIcons: {
  enabled: boolean;
  showIcons: string[]; // ['visa', 'mastercard', 'blik', 'przelewy24']
  position: 'header' | 'footer' | 'payment-section';
  size: 32 | 48 | 64; // px
}

// COMPONENT: PaymentIconsSelector.tsx
<Checkbox label="Visa" />
<Checkbox label="MasterCard" />
<Checkbox label="BLIK" />
<Checkbox label="Przelewy24" />
<Checkbox label="PayPal" />
<Checkbox label="Apple Pay" />
```

### **8.3 Generated Invoice - Render:**
```tsx
{paymentIcons.enabled && (
  <div className="payment-icons flex gap-2 mt-4">
    {paymentIcons.showIcons.includes('visa') && (
      <img src="/icons/visa.svg" width={paymentIcons.size} />
    )}
    {paymentIcons.showIcons.includes('mastercard') && (
      <img src="/icons/mastercard.svg" width={paymentIcons.size} />
    )}
    {/* ... pozostałe ... */}
  </div>
)}
```

**REZULTAT:**
- 6+ metod płatności ✅
- Ikony payment methods ✅
- Custom pozycja + rozmiar ✅

---

## 🎁 FAZA 9: DISCOUNT COLUMN (10 min)

**CEL:** Kolumna rabatu % + auto-calculate

### **9.1 Invoice Form - Discount Column:**
```tsx
// src/pages/Invoices.tsx - Item Row
<Input 
  type="number" 
  label="% Rabat" 
  value={item.discount || 0}
  min={0}
  max={100}
  onChange={(e) => {
    const discount = parseInt(e.target.value);
    const priceAfterDiscount = item.price * (1 - discount / 100);
    updateItem(itemIndex, { 
      discount,
      priceAfterDiscount 
    });
  }}
/>

// Auto-calculate cena po rabacie:
const finalPrice = item.discount 
  ? item.price * (1 - item.discount / 100)
  : item.price;
```

### **9.2 Generated Invoice - Show Discount:**
```tsx
<table>
  <thead>
    <tr>
      <th>#</th>
      <th>Opis</th>
      <th>Ilość</th>
      <th>Cena jedn.</th>
      <th>% Rabat</th> {/* NOWA KOLUMNA */}
      <th>Cena po rabacie</th>
      <th>VAT</th>
      <th>Brutto</th>
    </tr>
  </thead>
  <tbody>
    {items.map((item, i) => (
      <tr key={i}>
        <td>{i+1}</td>
        <td>{item.description}</td>
        <td>{item.amount}</td>
        <td>{item.price} €</td>
        <td className="text-red-600">
          {item.discount > 0 && `-${item.discount}%`}
        </td>
        <td>{item.priceAfterDiscount} €</td>
        <td>{item.vat}%</td>
        <td>{item.total} €</td>
      </tr>
    ))}
  </tbody>
</table>
```

**REZULTAT:**
- Kolumna "% Rabat" ✅
- Auto-calculate ceny ✅
- Czerwony kolor dla rabatu ✅

---

## ✍️ FAZA 10: SIGNATURE UPLOAD (10 min)

**CEL:** Upload podpisu wystawcy + render na fakturze

### **10.1 Company Info - Signature Upload:**
```tsx
// src/pages/Settings.tsx - DODAJ:
<div className="signature-upload">
  <h3>✍️ Podpis</h3>
  <Input 
    type="file" 
    accept="image/png"
    label="Podpis (PNG transparent)"
  />
  <p className="text-xs text-gray-500">
    Tip: Użyj transparentnego PNG (białe tło będzie widoczne na fakturze)
  </p>
  {signature && (
    <img src={signature} className="max-h-20 mt-2" />
  )}
</div>
```

### **10.2 Template Editor - Signature Position:**
```tsx
// DODAJ DO EditorState:
signature: {
  enabled: boolean;
  position: 'bottom-left' | 'bottom-right' | 'bottom-center';
  showName: boolean; // pokaż imię pod podpisem
  showLine: boolean; // linia nad podpisem
}
```

### **10.3 Generated Invoice - Render:**
```tsx
{signature.enabled && (
  <div className={`signature signature-${signature.position}`}>
    {signature.showLine && (
      <div className="signature-line w-48 border-t border-gray-400 mb-2" />
    )}
    <img src={companyInfo.signature} className="max-h-16" />
    {signature.showName && (
      <p className="text-sm text-gray-600 mt-1">
        {companyInfo.ownerName}
      </p>
    )}
  </div>
)}
```

**REZULTAT:**
- Upload podpisu (PNG) ✅
- 3 pozycje (left/center/right) ✅
- Opcja: linia + imię ✅

---

## 📊 FAZA 11: BUSINESS EMOTICONS (5 min)

**CEL:** Emoji picker dla business icons

### **11.1 Emoji Picker Component:**
```tsx
// src/components/EmojiPicker.tsx
export function EmojiPicker({ onSelect }: { onSelect: (emoji: string) => void }) {
  const businessEmojis = [
    '📞', // Telefon
    '✉️', // Email
    '📍', // Adres
    '🏦', // Bank
    '💳', // Płatność
    '✅', // Potwierdzone
    '⚠️', // Uwaga
    '📄', // Dokument
    '💰', // Pieniądze
    '🧾', // Rachunek
    '📊', // Wykres
    '🎯', // Cel
  ];

  return (
    <div className="emoji-picker grid grid-cols-6 gap-2">
      {businessEmojis.map(emoji => (
        <button 
          key={emoji}
          onClick={() => onSelect(emoji)}
          className="text-2xl hover:bg-gray-100 p-2 rounded"
        >
          {emoji}
        </button>
      ))}
    </div>
  );
}
```

### **11.2 Template Editor - Use Emojis:**
```tsx
// Użyj emoji w różnych miejscach:
- Nagłówki sekcji (📞 Telefon, 📍 Adres)
- Warning box (⚠️)
- Payment section (💳)
- Footer (🏦 Bank)
```

**REZULTAT:**
- 12 business emoji ✅
- Łatwy picker ✅
- Użycie w całej fakturze ✅

---

## 🎨 FAZA 12: IDEALNE ROZSTAWIENIE ESTETYCZNE

**CEL:** Stworzyć najbardziej czytelny, estetyczny layout faktury

### **ZASADY ZŁOTEGO PODZIAŁU:**

#### **1. HIERARCHIA WIZUALNA:**
```
WAŻNOŚĆ (od góry do dołu):
1. Logo + Tytuł faktury (największe)
2. Numer faktury + Data (duże, wyróżnione)
3. Dane sprzedawcy/nabywcy (medium)
4. Tabela pozycji (CORE - najwięcej miejsca)
5. Podsumowanie (duże, wyróżnione - niebieski box)
6. Dane płatności + QR kod (medium)
7. Footer (małe)
```

#### **2. SPACING (ODDYCHAJĄCE LAYOUT):**
```
- Logo → Dane firm: 32px
- Dane firm → Tabela: 48px
- Tabela → Podsumowanie: 32px
- Podsumowanie → Płatność: 24px
- Płatność → Footer: 48px
```

#### **3. FONT SIZES:**
```
- Tytuł "FAKTURA VAT": 36px (bold)
- Numer faktury: 24px (bold)
- Suma brutto (blue box): 32px (bold)
- Nagłówki sekcji: 18px (semibold)
- Tabela header: 14px (bold)
- Tabela body: 12px (regular)
- Footer: 10px (regular)
```

#### **4. COLORS (PROFESSIONAL):**
```
PRIMARY: #1e40af (dark blue) - nagłówki, totals
SECONDARY: #3b82f6 (blue) - akcenty, przyciski
ACCENT: #10b981 (green) - potwierdzone, success
WARNING: #fbbf24 (yellow) - reverse charge
DANGER: #ef4444 (red) - rabaty, overdue
TEXT: #111827 (gray-900) - główny tekst
MUTED: #6b7280 (gray-500) - drugi plan
BACKGROUND: #ffffff (white)
```

#### **5. GRID SYSTEM (A4: 595px szerokość):**
```
MARGINS: 40px (left/right)
CONTENT WIDTH: 515px

COLUMNS:
- 2-kolumnowy (Firma | Klient): 250px | 250px
- Tabela: 100% (515px)
  - # (5%) 25px
  - Opis (35%) 180px
  - Ilość (10%) 50px
  - Cena (15%) 75px
  - % Rabat (10%) 50px
  - VAT (10%) 50px
  - Brutto (15%) 75px
```

#### **6. VISUAL FLOW:**
```
1. ENTRANCE (Top):
   - Logo (left) + Tytuł (right)
   - Gradient wave (top) - opcjonalne

2. IDENTITY:
   - Sprzedawca (left) | Nabywca (right)
   - Separator line

3. DETAILS:
   - Numer, Daty, Termin - w ramce

4. CORE CONTENT:
   - Tabela pozycji (najwięcej miejsca)

5. SUMMARY:
   - Yellow warning box (jeśli reverse charge)
   - Blue total box (SUMA BRUTTO) - wyróżniona

6. PAYMENT:
   - IBAN/BIC + QR kod (right)

7. EXIT (Bottom):
   - Footer info + Social icons
   - Gradient wave (bottom) - opcjonalne
```

---

## ⏱️ HARMONOGRAM PRACY

### **DZIEŃ 1: Fundament (1h 30min)**
- ✅ FAZA 1: Chirurgia layoutu (15 min)
- ✅ FAZA 2: Logo controls (20 min)
- ✅ FAZA 3: QR code + frames (15 min)
- ✅ FAZA 4: Social media (10 min)
- ✅ FAZA 5: Waves + Blue box (15 min)
- ✅ FAZA 6: Yellow warning (10 min)
- ☕ BREAK (5 min)

### **DZIEŃ 2: Advanced Features (45min)**
- 🎨 FAZA 7: Images + Hologram (25 min)
- 💳 FAZA 8: Payment icons (10 min)
- 🎁 FAZA 9: Discount column (10 min)

### **DZIEŃ 3: Finalizacja (25min)**
- ✍️ FAZA 10: Signature (10 min)
- 📊 FAZA 11: Emoticons (5 min)
- 🎨 FAZA 12: Final polish (10 min)

**TOTAL: 2h 40min** (realistycznie: ~3-4h z testami)

---

## ✅ CZEKLISTA PRE-FLIGHT

Przed startem pracy sprawdź:

- [ ] VSCode otwarte z projektem
- [ ] Terminal gotowy (npm run dev)
- [ ] Backup obecnego InvoiceTemplateEditor.tsx
- [ ] Git commit obecnego stanu
- [ ] Ekran 1920x1080+ (żeby zobaczyć cały layout)
- [ ] Kawa/herbata gotowa ☕
- [ ] Muzyka w tle (focus mode) 🎵

---

## 🚀 READY TO START!

**Kiedy zacznę pracę:**
1. Najpierw commit obecny stan (backup)
2. Potem FAZA 1 (chirurgia layoutu)
3. Test po każdej fazie
4. Screenshot przed/po każdej zmiany

**KOMENDA STARTU:**
```bash
git add .
git commit -m "BACKUP przed redesignem Invoice Editor"
npm run dev
```

---

**KONIEC PLANU** - Gotowy do działania! 🎯
