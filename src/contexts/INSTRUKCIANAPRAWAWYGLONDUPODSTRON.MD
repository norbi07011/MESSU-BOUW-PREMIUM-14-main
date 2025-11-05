# 📋 INSTRUKCJA NAPRAWY WYGLĄDU PODSTRON

## 🎨 GLOBALNE ZASADY KOLORYSTYCZNE

### 1️⃣ KOLOR GŁÓWNY - JASNY NIEBIESKI (SKY-400)
**Użycie:** Ten kolor mają mieć WSZYSTKIE aktywne przyciski, przyciski akcji, hover states
```css
bg-sky-400 /* Jasny żywy błękit - jak na przycisku "Raporty" */
hover:bg-sky-500 /* Trochę ciemniejszy przy hover */
```

### 2️⃣ RAMKI - NIEBIESKIE Z CIENIEM
**Wszystkie ramki (karty, przyciski, inputy) muszą mieć:**
```css
border-2 border-sky-300 /* Niebieska ramka (NIE CZARNA!) */
shadow-[0_2px_8px_rgba(14,165,233,0.3)] /* Niebieski cień od spodu */
hover:border-sky-400 /* Intensywniejszy niebieski przy hover */
hover:shadow-xl hover:shadow-sky-200/50 /* Większy cień przy hover */
```

### 3️⃣ TŁO STRONY
```css
bg-white /* Zawsze białe, bez gradientów */
```

### 4️⃣ POLA TEKSTOWE (INPUT)
```css
bg-gray-100 /* Lekko szare tło */
text-gray-900 /* Ciemny tekst (prawie czarny) */
border-2 border-sky-300 /* Niebieska ramka */
focus:border-sky-500 focus:ring-2 focus:ring-sky-200 /* Podświetlenie przy focus */
```

---

## 🔧 SZCZEGÓŁOWE NAPRAWY DLA KAŻDEJ PODSTRONY

### 📊 PODSTRONA: RAPORTY (Reports.tsx)

#### ✅ CO JEST OK:
- Białe tło główne
- Przyciski Export CSV/PDF mają dobry kolor (sky-400)
- Karty mają białe tło

#### ❌ CO NAPRAWIĆ:

**1. MENU BOCZNE (Sidebar) - przyciski nieaktywne:**
```tsx
// BYŁO (ZŁE - czarna ramka):
className="border border-black"

// MA BYĆ:
className="border-2 border-sky-300 shadow-[0_2px_8px_rgba(14,165,233,0.3)] hover:bg-sky-50 hover:border-sky-400 transition-all duration-300"
```

**2. PRZYCISK AKTYWNY (np. Raporty):**
```tsx
// MA BYĆ:
className="bg-sky-400 text-white shadow-lg shadow-sky-400/50 border-0 rounded-lg"
```

**3. KARTY/RAMKI na stronie:**
```tsx
// BYŁO:
className="border border-gray-200"

// MA BYĆ:
className="border-2 border-sky-200 bg-white shadow-lg rounded-xl hover:border-sky-300 hover:shadow-xl hover:shadow-sky-200/50 transition-all duration-300"
```

**4. PRZYCISKI AKCJI (Export CSV, Export PDF, filtry):**
```tsx
// MA BYĆ:
className="bg-sky-400 text-white hover:bg-sky-500 border-2 border-sky-200 shadow-md hover:shadow-lg rounded-lg px-4 py-2 transition-all duration-300"
```

---

### 📄 PODSTRONA: FAKTURY (Invoices.tsx)

✅ **GŁÓWNA STRONA FAKTUR - UKOŃCZONA 100%!**
- ✅ Wszystkie kolory indigo/purple zamienione na sky/blue
- ✅ Gradient przycisków: `bg-linear-to-r from-sky-500 to-blue-600` hover:`from-sky-600 to-blue-700`
- ✅ 0 błędów w terminalu
- ✅ Tylko 1 warning (inline style) - nieistotny

✅ **FORMULARZ "NOWA FAKTURA" (InvoiceForm.tsx) - UKOŃCZONY!**
- ✅ Ramki itemów: `border-2 border-sky-200` z hover
- ✅ Główne klasy CSS naprawione (premium-card, premium-input, premium-button)

✅ **GLOBALNE STYLE CSS (main.css) - NAPRAWIONE!**
- ✅ `.premium-card`: border-sky-300 (było border-black)
- ✅ `.premium-input`: border-sky-300 + focus:border-sky-500  
- ✅ `.premium-button`: border-sky-200 (było border-black)

---

## 🎨 ZAPAMIĘTANY WZORZEC - WSZYSTKIE PRZYCISKI!

```css
/* GRADIENT PRZYCISKÓW - TAKI JAK PRZYCISK "FAKTURY" W SIDEBAR */
bg-linear-to-r from-sky-500 to-blue-600
hover:from-sky-600 hover:to-blue-700
text-white
border-2 border-blue-200
shadow-lg hover:shadow-xl
```

---

### 📝 POZOSTAŁE DO NAPRAWY:

#### ❌ KRYTYCZNE BŁĘDY W FORMULARZU:

**1. MINI RAMKI U GÓRY (daty Week/Norm):**
```tsx
// BYŁO (źle - czarne/szare ramki):
className="border border-gray-300 bg-white"

// MA BYĆ:
className="border-2 border-sky-300 bg-white shadow-sm hover:border-sky-400 rounded-md px-2 py-1"
```

**2. GŁÓWNA KARTA FORMULARZA (Invoice Details):**
```tsx
// BYŁO:
className="bg-white border border-gray-200 rounded-lg"

// MA BYĆ:
className="bg-white border-2 border-sky-200 rounded-xl shadow-lg hover:border-sky-300 hover:shadow-xl transition-all duration-300"
```

**3. WSZYSTKIE POLA INPUT (Data wystawienia, Termin płatności):**
```tsx
// BYŁO:
className="border border-gray-300 rounded-md"

// MA BYĆ:
className="border-2 border-sky-300 rounded-lg bg-gray-50 text-gray-900 focus:border-sky-500 focus:ring-2 focus:ring-sky-200 focus:bg-white transition-all"
```

**4. WSZYSTKIE SELECT (Wybierz klienta, 14 dagen, Language, Currency):**
```tsx
// BYŁO:
className="border border-gray-300"

// MA BYĆ:
className="border-2 border-sky-300 rounded-lg bg-gray-50 focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
```

**5. TEXTAREA (Omschrijving/Description):**
```tsx
// BYŁO:
className="border border-gray-300"

// MA BYĆ:
className="border-2 border-sky-300 rounded-lg bg-gray-50 text-gray-900 focus:border-sky-500 focus:ring-2 focus:ring-sky-200 min-h-[100px]"
```

**6. CHECKBOX (Odwrotne obciążenie 0% VAT):**
```tsx
// BYŁO:
className="border-gray-300"

// MA BYĆ:
className="border-2 border-sky-400 text-sky-500 focus:ring-sky-500 focus:ring-2 rounded"
```

**7. PRZYCISK "Godoj pozycję" (Dodaj pozycję):**
```tsx
// SPRAWDŹ czy ma:
className="bg-sky-400 hover:bg-sky-500 text-white border-2 border-sky-200 shadow-md hover:shadow-lg rounded-lg px-6 py-2.5 font-medium transition-all duration-300"
```

**8. KARTA "Pozycje faktury" (Products/Items section):**
```tsx
// BYŁO:
className="border border-gray-200"

// MA BYĆ:
className="border-2 border-sky-200 rounded-xl bg-white shadow-lg"
```

**9. ITEM BOXES (Item 1, Item 2 wewnątrz pozycji):**
```tsx
// BYŁO:
className="border border-gray-300 p-4"

// MA BYĆ:
className="border-2 border-sky-200 rounded-lg p-4 bg-gray-50 hover:border-sky-300 transition-all"
```

**10. INPUT W ITEM (Aantal/Amount, Eenheid/Unit, BTW-tarief):**
```tsx
// MA BYĆ:
className="border-2 border-sky-300 rounded-md bg-white text-gray-900 focus:border-sky-500 focus:ring-2 focus:ring-sky-200 px-3 py-1.5"
```

---

### 🎯 WZÓR DLA WSZYSTKICH FORMULARZY

**Każdy formularz na każdej podstronie musi mieć:**

1. **Główna karta:** `border-2 border-sky-200 shadow-lg rounded-xl bg-white`
2. **Input text:** `border-2 border-sky-300 bg-gray-50 focus:border-sky-500 focus:ring-2 focus:ring-sky-200`
3. **Select:** `border-2 border-sky-300 bg-gray-50 focus:border-sky-500 focus:ring-2 focus:ring-sky-200`
4. **Textarea:** `border-2 border-sky-300 bg-gray-50 focus:border-sky-500 focus:ring-2 focus:ring-sky-200`
5. **Checkbox:** `border-2 border-sky-400 text-sky-500 focus:ring-sky-500`
6. **Button primary:** `bg-sky-400 hover:bg-sky-500 text-white border-2 border-sky-200 shadow-md`
7. **Button secondary:** `bg-white hover:bg-sky-50 text-sky-600 border-2 border-sky-300`

---

### 👥 PODSTRONA: KLIENCI (Clients.tsx)

*(Będzie dodane po analizie)*

---

### 📦 PODSTRONA: PRODUKTY (Products.tsx)

*(Będzie dodane po analizie)*

---

## 🎨 KOLORY - SZYBKI PRZEWODNIK

| Zastosowanie | Kolor Tailwind | Hex |
|--------------|----------------|-----|
| Przycisk aktywny | `bg-sky-400` | #38bdf8 |
| Przycisk hover | `bg-sky-500` | #0ea5e9 |
| Ramka normalna | `border-sky-300` | #7dd3fc |
| Ramka hover | `border-sky-400` | #38bdf8 |
| Ramka focus | `border-sky-500` | #0ea5e9 |
| Tło input | `bg-gray-100` | #f3f4f6 |
| Cień niebieski | `shadow-sky-200/50` | rgba(186,230,253,0.5) |

---

## ⚠️ ZASADY BEZWZGLĘDNE

1. **NIE UŻYWAĆ** kolorów: indigo, purple, emerald, gray (oprócz tła input)
2. **WSZYSTKIE** ramki muszą być niebieskie (sky), **NIGDY CZARNE**
3. **WSZYSTKIE** przyciski muszą mieć `bg-sky-400` (jasny niebieski)
4. **WSZYSTKIE** dark: klasy muszą być usunięte
5. Gradienty **TYLKO** na przyciskach (opcjonalnie), **NIGDY** na tle strony

---

## 🚨 KRYTYCZNE: GÓRNY I DOLNY PANEL (HEADER & FOOTER)

### ❌ BŁĄD - CZARNE RAMKI NA PANELACH

**PROBLEM:**
Górny panel (header) i dolny panel mają **GRUBE CZARNE RAMKI** - to jest niedopuszczalne!

**JAK NAPRAWIĆ:**

#### 1️⃣ GÓRNY PANEL (Header z logo MESSU BOUW):
```tsx
// BYŁO (ŹLE):
className="bg-sky-400 border-t-4 border-b-4 border-black"
// lub
className="... border-4 border-black"

// MA BYĆ:
className="bg-sky-400 border-t-2 border-b-2 border-sky-600 shadow-lg shadow-sky-500/30"
```

**Zasady dla headera:**
- Tło: `bg-sky-400` (jasny niebieski) ✅
- Ramka górna: `border-t-2 border-sky-600` (ciemniejszy niebieski)
- Ramka dolna: `border-b-2 border-sky-600` (ciemniejszy niebieski)
- Cień: `shadow-lg shadow-sky-500/30` (niebieski cień od spodu)
- **NIGDY:** `border-black`, `border-gray-900`, `border-slate-900`

#### 2️⃣ DOLNY PANEL (Footer/Navigation):
```tsx
// BYŁO (ŹLE):
className="... border-t-4 border-black"

// MA BYĆ:
className="bg-white border-t-2 border-sky-300 shadow-[0_-4px_12px_rgba(14,165,233,0.2)]"
```

**Zasady dla footera:**
- Tło: `bg-white` (białe)
- Ramka górna: `border-t-2 border-sky-300` (niebieski)
- Cień od góry: `shadow-[0_-4px_12px_rgba(14,165,233,0.2)]` (niebieski cień od góry)
- **NIGDY:** czarne ramki!

#### 3️⃣ SIDEBAR (Menu boczne):
```tsx
// BYŁO (ŹLE):
className="... border-r-4 border-black"

// MA BYĆ:
className="bg-white border-r-2 border-sky-300 shadow-[4px_0_12px_rgba(14,165,233,0.15)]"
```

---

## 🎨 PEŁNA SPECYFIKACJA KOLORÓW RAMEK

| Element | Border Color | Border Width | Shadow |
|---------|--------------|--------------|--------|
| Header | `border-sky-600` | `border-t-2 border-b-2` | `shadow-lg shadow-sky-500/30` |
| Footer | `border-sky-300` | `border-t-2` | `shadow-[0_-4px_12px_rgba(14,165,233,0.2)]` |
| Sidebar | `border-sky-300` | `border-r-2` | `shadow-[4px_0_12px_rgba(14,165,233,0.15)]` |
| Card | `border-sky-200` | `border-2` | `shadow-lg` |
| Button | `border-sky-200` | `border-2` | `shadow-md` |
| Input | `border-sky-300` | `border-2` | `focus:ring-2 focus:ring-sky-200` |

**WSZYSTKIE MUSZĄ BYĆ NIEBIESKIE (sky-*), ZERO CZARNYCH!**
