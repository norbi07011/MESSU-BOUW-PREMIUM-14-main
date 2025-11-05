# ⚡ TODO - POZOSTAŁE ZADANIA

**Ostatnia aktualizacja:** 6 listopada 2025  
**Status Invoice Editor:** 50%+ ukończone ✅

---

## 🎯 TIER 1: MUST HAVE (25 minut)

### 1. Social Media Icons - Rendering w Footer (5 min)
**Status:** UI controls gotowe ✅, brakuje renderingu w LiveInvoicePreview ❌

**Plik:** `src/components/shared/TemplateEditor/LiveInvoicePreview.tsx`

**Co dodać** (w sekcji footer, po warning box):
```tsx
{/* Social Media Icons */}
{state.socialMedia.enabled && (
  <div className="flex items-center justify-center gap-4 mt-4">
    {state.socialMedia.facebook && (
      <a href={state.socialMedia.facebook} className="text-blue-600 hover:text-blue-700">
        <FacebookLogo size={24} weight="fill" />
      </a>
    )}
    {state.socialMedia.linkedin && (
      <a href={state.socialMedia.linkedin} className="text-blue-700 hover:text-blue-800">
        <LinkedinLogo size={24} weight="fill" />
      </a>
    )}
    {state.socialMedia.instagram && (
      <a href={state.socialMedia.instagram} className="text-pink-600 hover:text-pink-700">
        <InstagramLogo size={24} weight="fill" />
      </a>
    )}
  </div>
)}
```

**Import dodać** (na górze pliku):
```tsx
import { FacebookLogo, LinkedinLogo, InstagramLogo } from '@phosphor-icons/react';
```

---

### 2. Payment Method Icons (10 min)
**Status:** Całkowicie brakuje ❌

**Kroki:**

1. **Dodać do EditorState** (`src/components/InvoiceTemplateEditor.tsx`):
```typescript
paymentIcons: {
  enabled: boolean;
  acceptedMethods: ('cash' | 'bank' | 'card' | 'qr')[];
  showInFooter: boolean;
}
```

2. **initialState defaults**:
```typescript
paymentIcons: {
  enabled: false,
  acceptedMethods: ['bank', 'card'],
  showInFooter: true,
}
```

3. **UI Controls** (RIGHT PANEL - po Social Media):
```tsx
{/* Payment Methods */}
<div className="pb-6 border-b border-gray-200">
  <div className="flex items-center justify-between mb-3">
    <h3 className="text-sm font-bold text-gray-900">Metody płatności</h3>
    <input
      type="checkbox"
      checked={paymentIcons.enabled}
      onChange={(e) => updateState({
        paymentIcons: { ...paymentIcons, enabled: e.target.checked }
      }, 'Przełączono ikony płatności')}
      className="w-5 h-5 text-sky-600 rounded"
    />
  </div>

  {paymentIcons.enabled && (
    <div className="space-y-3">
      {/* Checkboxes dla metod */}
      <label className="flex items-center gap-2">
        <input type="checkbox" className="w-4 h-4" />
        <span className="text-sm">💵 Gotówka</span>
      </label>
      <label className="flex items-center gap-2">
        <input type="checkbox" className="w-4 h-4" />
        <span className="text-sm">🏦 Przelew</span>
      </label>
      <label className="flex items-center gap-2">
        <input type="checkbox" className="w-4 h-4" />
        <span className="text-sm">💳 Karta</span>
      </label>
    </div>
  )}
</div>
```

4. **Rendering w LiveInvoicePreview** (w footer):
```tsx
{state.paymentIcons?.enabled && (
  <div className="flex items-center justify-center gap-3 mt-4">
    <span className="text-sm font-medium">Akceptujemy:</span>
    {state.paymentIcons.acceptedMethods.includes('cash') && (
      <Money size={28} weight="fill" className="text-green-600" />
    )}
    {state.paymentIcons.acceptedMethods.includes('bank') && (
      <Bank size={28} weight="fill" className="text-blue-600" />
    )}
    {state.paymentIcons.acceptedMethods.includes('card') && (
      <CreditCard size={28} weight="fill" className="text-purple-600" />
    )}
  </div>
)}
```

**Importy** (Phosphor Icons):
```tsx
import { Money, Bank, CreditCard } from '@phosphor-icons/react';
```

---

### 3. Discount Column w Items Table (10 min)
**Status:** Całkowicie brakuje ❌

**Kroki:**

1. **Aktualizacja InvoiceItem type** (`src/types/invoice.ts`):
```typescript
export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unit: string;
  price: number;
  tax: number;
  total: number;
  discount?: number; // NOWE - procent 0-100
  priceAfterDiscount?: number; // NOWE - auto-calculate
}
```

2. **Kolumna w tabeli** (LiveInvoicePreview - items-table block):
```tsx
<th className="text-left text-sm font-bold p-2">% Rabat</th>

{/* W wierszu */}
<td className="p-2 text-sm text-red-600 font-bold">
  {item.discount ? `${item.discount}%` : '-'}
</td>
```

3. **Auto-calculate** (przy dodawaniu/edycji pozycji):
```typescript
const priceAfterDiscount = discount 
  ? price * (1 - discount / 100) 
  : price;
```

---

## 🌟 TIER 2: NICE TO HAVE (55 minut)

### 4. Waves SVG Component (15 min)
**Status:** Brakuje całkowicie ❌

**Plik do stworzenia:** `src/components/shared/WaveShape.tsx`

**Funkcjonalność:**
- 3 style fal: wave (sinusoida), rectangle (prostokąty), triangle (trójkąty)
- Pozycje: top, bottom, both
- Gradient colors (start → end)
- Height: 40-120px

**EditorState dodać:**
```typescript
waves: {
  enabled: boolean;
  style: 'wave' | 'rectangle' | 'triangle';
  position: 'top' | 'bottom' | 'both';
  colorStart: string;
  colorEnd: string;
  height: number; // 40-120
}
```

**SVG wave path:**
```tsx
<svg viewBox="0 0 1200 120" preserveAspectRatio="none">
  <path d="M0,50 Q300,0 600,50 T1200,50 L1200,120 L0,120 Z" 
        fill={`url(#waveGradient)`} />
  <defs>
    <linearGradient id="waveGradient" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stopColor={colorStart} />
      <stop offset="100%" stopColor={colorEnd} />
    </linearGradient>
  </defs>
</svg>
```

---

### 5. Signature Upload (10 min)
**Status:** Brakuje całkowicie ❌

**EditorState dodać:**
```typescript
signature: {
  enabled: boolean;
  url: string; // base64 lub URL
  position: 'bottom-left' | 'bottom-center' | 'bottom-right';
  showName: boolean;
  showLine: boolean;
  name?: string;
}
```

**UI Controls** (podobnie jak LogoControls):
- Upload PNG (transparent background)
- 3 przyciski pozycji
- Checkbox "Pokaż imię"
- Checkbox "Pokaż linię"

**Rendering** (LiveInvoicePreview footer):
```tsx
{state.signature?.enabled && (
  <div className={`flex justify-${state.signature.position} mt-4`}>
    <div className="text-center">
      {state.signature.showLine && (
        <div className="w-48 h-px bg-gray-400 mb-2"></div>
      )}
      <img src={state.signature.url} alt="Podpis" className="h-16" />
      {state.signature.showName && (
        <p className="text-sm mt-1">{state.signature.name}</p>
      )}
    </div>
  </div>
)}
```

---

### 6. Raporty - Tłumaczenia PL (30 min)
**Status:** Translations w i18n/pl.ts ✅, hardcoded strings w Reports.tsx ❌

**Plik:** `src/pages/Reports.tsx`

**Sekcje do zamiany (~155 strings):**

1. **Tax thresholds** (linie ~431-477):
   - `'VAT Small Business Exemption'` → `t('reports.vatSmallBusiness')`
   - `'ZZP Lower Income Threshold'` → `t('reports.zzpLowerThreshold')`
   - `'Tax-free allowance'` → `t('reports.taxFreeAllowance')`

2. **Revenue section** (linie ~485-562):
   - `'Monthly Revenue Breakdown'` → `t('reports.monthlyBreakdown')`
   - `'Net Revenue'` → `t('reports.netRevenue')`
   - `'Invoice Count'` → `t('reports.invoiceCount')`

3. **Tax Analysis** (linie ~564-707):
   - `'Gross Income'` → `t('reports.grossIncome')`
   - `'Zelfstandigenaftrek'` → `t('reports.zelfstandigenaftrek')`
   - `'Estimated Tax Calculation'` → `t('reports.estimatedTaxCalc')`

4. **VAT Breakdown** (linie ~709-839):
   - `'VAT Summary'` → `t('reports.vatSummary')`
   - `'21% Standard Rate'` → `t('reports.standardRate')`
   - `'9% Reduced Rate'` → `t('reports.reducedRate')`

**Metoda:** Find & Replace (Ctrl+H w VS Code)

---

## 🚀 TIER 3: ADVANCED (75 minut)

### 7. Product Images + Hologram Effect (25 min)
**Status:** Najbardziej skomplikowane ❌

**EditorState dodać:**
```typescript
hologram: {
  enabled: boolean;
  opacity: number; // 30-100%
  rainbowShift: number; // 0-360deg hue rotate
}
```

**InvoiceItem dodać:**
```typescript
image?: string; // base64 lub URL
```

**Component do stworzenia:** `src/components/shared/ImageEditor.tsx`
- Upload obrazka (JPG/PNG max 2MB)
- Crop do kwadratu 64x64px
- Preview

**CSS Hologram** (`src/styles/hologram.css`):
```css
@keyframes hologramShift {
  0% { filter: hue-rotate(0deg) brightness(1); }
  50% { filter: hue-rotate(180deg) brightness(1.2); }
  100% { filter: hue-rotate(360deg) brightness(1); }
}

.hologram-effect {
  animation: hologramShift 3s linear infinite;
  opacity: 0.8;
}
```

**Kolumna w tabeli:**
```tsx
<th>Zdjęcie</th>

{/* W wierszu */}
<td>
  {item.image && (
    <img 
      src={item.image} 
      className={hologramEnabled ? 'hologram-effect' : ''}
      alt={item.description}
      style={{ width: 64, height: 64 }}
    />
  )}
</td>
```

---

### 8. Business Emoticons Picker (5 min)
**Status:** Zabawne, ale niepotrzebne ❌

**Component:** `src/components/shared/EmojiPicker.tsx`

**50+ emojis:**
```typescript
const businessEmojis = {
  budowa: ['🏗️', '🏢', '🔨', '🪛', '🧱', '👷'],
  it: ['💻', '⌨️', '🖥️', '📱', '🖱️', '💾'],
  transport: ['🚚', '🚛', '🚗', '✈️', '🚢', '🚆'],
  biuro: ['📁', '📊', '📈', '📉', '📋', '🗂️'],
  // ... etc
};
```

**Użycie:** Button obok tekstu Invoice Header → popup z emoji grid → klik → dodaj do tekstu

---

### 9. Timer w Timesheets (45 min)
**Status:** Nowa funkcja z MOCKUPS ❌

**Component:** `src/components/TimerWidget.tsx`

**State:**
```typescript
interface ActiveTimer {
  start: Date;
  client: string;
  project: string;
  task: string;
  rate: number; // €/h
}
```

**UI:**
```tsx
<div className="timer-widget">
  <div className="text-4xl font-mono">{formatTime(elapsed)}</div>
  <div className="flex gap-2">
    <button onClick={handleStart}>▶️ Start</button>
    <button onClick={handlePause}>⏸️ Pause</button>
    <button onClick={handleStop}>⏹️ Stop</button>
  </div>
</div>
```

**Auto-create timesheet entry** po Stop:
```typescript
const newEntry = {
  id: uuid(),
  date: startTime,
  client,
  project,
  task,
  hours: elapsed / 3600,
  rate,
  total: (elapsed / 3600) * rate,
};
```

---

## 📊 PODSUMOWANIE CZASU

| Tier | Zadania | Czas | Rezultat |
|------|---------|------|----------|
| **TIER 1** | Social Media + Payment Icons + Discount | **25 min** | 75% Invoice Editor ✅ |
| **TIER 2** | Waves + Signature + Raporty PL | **55 min** | 90% Invoice Editor ✅ |
| **TIER 3** | Images + Hologram + Emoticons + Timer | **75 min** | 100% + bonusy 🔥 |

---

## ✅ ZALECENIA

**NAJPIERW:** TIER 1 (25 min) → Kluczowe funkcje gotowe!

**POTEM:** TIER 2 (55 min) → Profesjonalny wygląd!

**NA KONIEC:** TIER 3 (75 min) → Tylko jeśli masz czas/potrzebę!

---

**KONIEC TODO** 🎯
