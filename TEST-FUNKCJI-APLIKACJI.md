# ✅ PLAN TESTOWANIA FUNKCJI APLIKACJI

**Data:** 5 listopada 2025, 22:40  
**URL aplikacji:** http://localhost:5001  
**Cel:** Sprawdzić działanie wszystkich obecnych funkcji przed rozbudową

---

## 🎯 FUNKCJE DO PRZETESTOWANIA

### **1. INVOICE TEMPLATE EDITOR** (Główny test!)

#### **A. OTWARCIE EDYTORA:**
- [ ] Przejdź do Settings → Templates
- [ ] Kliknij "Nowy szablon faktury" lub "Edytuj szablon"
- [ ] Sprawdź czy otwiera się modal/strona edytora

#### **B. LAYOUT 3D:**
- [ ] Sprawdź gradient background (sky-50 → blue-50 → indigo-100)
- [ ] Sprawdź 3 panele (Left 420px, Center, Right 420px)
- [ ] Sprawdź sticky scroll (czy center pozostaje na miejscu)
- [ ] Sprawdź levitating effect (backdrop-blur, shadow-2xl)
- [ ] Sprawdź hover effects (scale-[1.02])

#### **C. TOP BAR:**
- [ ] Zmień nazwę szablonu (input edytowalny)
- [ ] Kliknij "Export" - czy pobiera JSON?
- [ ] Kliknij "Import" - czy otwiera file picker?
- [ ] Sprawdź Undo/Redo buttons (czy są disabled na starcie)
- [ ] Sprawdź "Zapisz" button
- [ ] Sprawdź "Anuluj" button

#### **D. LEFT PANEL - LOGO CONTROLS:**
- [ ] Upload logo (PNG/JPG)
- [ ] Toggle "Pokaż logo" checkbox
- [ ] Zmień position (Left/Center/Right)
- [ ] Przesuń logo (drag w live preview)
- [ ] Zmień szerokość (slider 50-300px)
- [ ] Zmień wysokość (slider 30-200px)
- [ ] Zmień opacity (slider 0-100%)
- [ ] Sprawdź czy współrzędne X/Y się aktualizują
- [ ] Sprawdź live preview (czy logo pokazuje zmiany)

#### **E. LEFT PANEL - BLOKI FAKTURY:**
- [ ] Sprawdź listę 8 bloków (company-info, client-info, invoice-header, items-table, totals, payment-info, notes, footer)
- [ ] Kliknij "Dodaj" - czy dodaje nowy blok?
- [ ] Drag & drop blok (zmień kolejność)
- [ ] Toggle visibility bloku (ikona Eye/EyeSlash)
- [ ] Zmień nazwę bloku (input field)
- [ ] Zmień typ bloku (select dropdown)
- [ ] Zmień kolor tła bloku (color picker)
- [ ] Zmień kolor tekstu bloku (color picker)
- [ ] Zmień rozmiar fontu bloku (8-24px)
- [ ] Duplikuj blok (ikona Copy)
- [ ] Usuń blok (ikona Trash)

#### **F. CENTER PANEL - PREVIEW:**
- [ ] Sprawdź czy pokazuje A4 preview (595×842px)
- [ ] Sprawdź czy jest sticky (nie scrolluje się)
- [ ] **PROBLEM:** Sprawdź czy pokazuje live preview czy tylko placeholder?
  - Oczekiwane: "Podgląd faktury" + "Tutaj pojawi się live preview"
  - **TO JEST GŁÓWNY BRAK!**

#### **G. RIGHT PANEL - KOLORY:**
- [ ] Nagłówek gradient:
  - [ ] Start color picker
  - [ ] End color picker
  - [ ] Sprawdź czy pokazuje gradient preview
- [ ] Primary gradient (tak samo)
- [ ] Accent gradient (tak samo)
- [ ] Tło (single color)
- [ ] Tekst (single color)

#### **H. RIGHT PANEL - CZCIONKI:**
- [ ] Nagłówki:
  - [ ] Font family select (Arial, Times, etc.)
  - [ ] Font size slider
- [ ] Treść (tak samo)
- [ ] Małe elementy (input number 6-12px)

#### **I. RIGHT PANEL - PAGE SETTINGS:**
- [ ] Rozmiar strony (A4/Letter select)
- [ ] Orientacja (Pionowa/Pozioma select)

#### **J. KEYBOARD SHORTCUTS:**
- [ ] Ctrl+S - czy zapisuje szablon?
- [ ] Ctrl+Z - czy cofa ostatnią zmianę?
- [ ] Ctrl+Y - czy przywraca zmianę?
- [ ] Ctrl+D - czy duplikuje pierwszy blok?

#### **K. EXPORT/IMPORT JSON:**
- [ ] Export:
  - [ ] Kliknij "Export"
  - [ ] Sprawdź czy pobiera plik .json
  - [ ] Otwórz plik - czy zawiera wszystkie dane?
- [ ] Import:
  - [ ] Kliknij "Import"
  - [ ] Wybierz wyeksportowany plik
  - [ ] Sprawdź czy wczytuje dane (nazwa, bloki, kolory, etc.)

#### **L. UNDO/REDO (20 kroków):**
- [ ] Zmień nazwę szablonu (krok 1)
- [ ] Dodaj blok (krok 2)
- [ ] Zmień kolor (krok 3)
- [ ] Ctrl+Z 3x - czy wraca do stanu początkowego?
- [ ] Ctrl+Y 3x - czy przywraca wszystkie zmiany?
- [ ] Sprawdź czy history ma max 20 kroków

#### **M. SAVE/CANCEL:**
- [ ] Zapisz szablon - czy toast pokazuje "Szablon zapisany"?
- [ ] Sprawdź localStorage - czy szablon jest zapisany?
- [ ] Anuluj - czy wraca do poprzedniej strony?

---

### **2. TIMESHEET TEMPLATE EDITOR** (dla porównania)

#### **A. OTWARCIE:**
- [ ] Przejdź do Godziny Pracy → Szablony
- [ ] Kliknij "Nowy szablon" lub "Edytuj"

#### **B. FUNKCJE (porównaj z Invoice Editor):**
- [ ] Logo controls
- [ ] Kolumny (dodaj/usuń/drag&drop)
- [ ] Color picker dual
- [ ] Font controls
- [ ] Undo/Redo
- [ ] Export/Import

#### **C. TEMPLATE LIBRARY:**
- [ ] Kliknij "Biblioteka szablonów"
- [ ] Sprawdź czy pokazuje 11 kategorii
- [ ] Sprawdź ikony (Building, Code, Truck, ShieldCheck, etc.)
- [ ] Wybierz szablon - czy wczytuje?

---

### **3. INNE STRONY APLIKACJI**

#### **A. FAKTURY (Invoices):**
- [ ] Lista faktur - czy wyświetla?
- [ ] Dodaj nową fakturę - czy działa form?
- [ ] Podgląd faktury - czy PDF preview działa?

#### **B. KLIENCI (Clients):**
- [ ] Lista klientów
- [ ] Dodaj klienta
- [ ] Edytuj klienta

#### **C. PRODUKTY (Products):**
- [ ] Lista produktów
- [ ] Dodaj produkt
- [ ] Kategorie produktów

#### **D. GODZINY PRACY (Timesheets):**
- [ ] Lista godzin
- [ ] Dodaj wpis godzin
- [ ] **PROBLEM:** Czy PEZET template jest usunięty?

#### **E. WYDATKI (Expenses):**
- [ ] Lista wydatków
- [ ] Dodaj wydatek

#### **F. BTW AANGIFTE:**
- [ ] Formularz VAT
- [ ] Eksport XML

#### **G. RAPORTY (Reports):**
- [ ] Czy strona się ładuje?
- [ ] Czy dark mode działa?

#### **H. DOKUMENTY (Documents):**
- [ ] Lista dokumentów
- [ ] Upload dokumentu
- [ ] Rich Text Editor - czy działa?

#### **I. USTAWIENIA (Settings):**
- [ ] Company Info - sprawdź wszystkie pola
- [ ] Logo upload (główny)
- [ ] Invoice Templates
- [ ] Timesheet Templates

---

## 📝 FORMULARZ TESTOWY (wypełnij podczas testowania)

### **INVOICE TEMPLATE EDITOR:**

| Funkcja | Działa? | Problemy |
|---------|---------|----------|
| Layout 3D | ⬜ Tak / ⬜ Nie | |
| Logo upload | ⬜ Tak / ⬜ Nie | |
| Logo opacity | ⬜ Tak / ⬜ Nie | |
| Logo drag&drop | ⬜ Tak / ⬜ Nie | |
| Bloki drag&drop | ⬜ Tak / ⬜ Nie | |
| Bloki add/remove | ⬜ Tak / ⬜ Nie | |
| Color pickers | ⬜ Tak / ⬜ Nie | |
| Font controls | ⬜ Tak / ⬜ Nie | |
| Undo/Redo | ⬜ Tak / ⬜ Nie | |
| Export JSON | ⬜ Tak / ⬜ Nie | |
| Import JSON | ⬜ Tak / ⬜ Nie | |
| Keyboard shortcuts | ⬜ Tak / ⬜ Nie | |
| **LIVE PREVIEW** | ⬜ Tak / ⬜ **NIE** | **PLACEHOLDER!** |

### **ZNALEZIONE BUGI:**

1. **KRYTYCZNE:**
   - 

2. **WAŻNE:**
   - 

3. **MAŁE:**
   - 

---

## 🚨 OCZEKIWANE PROBLEMY (z raportu śledztwa)

### **1. CENTER PANEL - Brak live preview**
- **Oczekiwane:** Placeholder "Podgląd faktury"
- **To dodać:** LiveInvoicePreview.tsx component

### **2. Brak funkcji z planu:**
- QR Code generator
- Social Media icons
- Waves + Blue Total Box
- Warning Box (reverse charge)
- Product images + hologram
- Payment icons
- Discount column
- Signature upload
- Emoticons

---

## 📊 PO TESTACH: RAPORT

### **CO DZIAŁA:**
```
✅ 
✅ 
✅ 
```

### **CO NIE DZIAŁA:**
```
❌ 
❌ 
❌ 
```

### **CO DODAĆ NAJPIERW:**
```
1. Live Preview (PRIORYTET 1)
2. 
3. 
```

---

**KONIEC PLANU TESTÓW** - Gotowy do wypełnienia! ✅
