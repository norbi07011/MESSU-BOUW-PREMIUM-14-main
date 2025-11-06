# 🚀 INSTRUKCJA INSTALACJI NA NOWYM KOMPUTERZE
**MESSU BOUW PREMIUM - Aplikacja Desktop do Faktur**

Data utworzenia: 5 listopada 2025  
Wersja projektu: 1.0.0

---

## 📋 WYMAGANIA SYSTEMOWE

### **Oprogramowanie:**
- ✅ **Windows 10/11** (64-bit)
- ✅ **Node.js v22.15.0** (lub nowszy v22.x)
- ✅ **npm v10.9.2** (lub nowszy v10.x)
- ✅ **Git** (do klonowania repozytorium)
- ✅ **Visual Studio Code** (zalecane IDE)

### **Zasoby:**
- 💾 **Dysk:** ~3 GB wolnego miejsca
- 🧠 **RAM:** Min. 8 GB (zalecane 16 GB)
- 🌐 **Internet:** Do pobierania zależności

---

## 🔧 KROK 1: INSTALACJA OPROGRAMOWANIA

### **1.1 Node.js i npm**

**Pobierz:**
- https://nodejs.org/en/download/
- Wybierz: **Windows Installer (.msi) 64-bit**
- Wersja: **v22.15.0 LTS** (lub nowsza)

**Zainstaluj:**
```powershell
# Po instalacji sprawdź wersje:
node --version
# Powinna pokazać: v22.15.0 (lub nowsza)

npm --version
# Powinna pokazać: 10.9.2 (lub nowsza)
```

### **1.2 Git**

**Pobierz:**
- https://git-scm.com/download/win
- Wybierz: **64-bit Git for Windows Setup**

**Zainstaluj** z domyślnymi ustawieniami.

### **1.3 Visual Studio Code (opcjonalnie)**

**Pobierz:**
- https://code.visualstudio.com/
- Wybierz: **Windows x64**

---

## 📦 KROK 2: POBRANIE PROJEKTU

### **OPCJA A: Klonowanie z GitHub** ✅ POLECAM

```powershell
# 1. Utwórz folder na projekt
mkdir "C:\AI PROJEKT"
cd "C:\AI PROJEKT"

# 2. Sklonuj repozytorium
git clone https://github.com/norbi07011/MESSU-BOUW-PREMIUM-14-main.git

# 3. Wejdź do folderu
cd MESSU-BOUW-PREMIUM-14-main
```

**⚠️ WAŻNE - Dodatkowy plik spoza Git:**

Plik `Affinity x64.exe` (614 MB) **NIE JEST** w repozytorium GitHub (za duży).

**Musisz go skopiować ze starego komputera:**

```powershell
# OPCJA 1: Skopiuj z poprzedniego komputera
# 1. Na STARYM komputerze znajdź plik:
#    C:\AI PROJEKT\MESSU-BOUW-PREMIUM-13-main\MESSU-BOUW-PREMIUM-13-main\src\i18n\Affinity x64.exe
# 
# 2. Skopiuj przez:
#    - Pendrive
#    - Dysk sieciowy
#    - OneDrive/Google Drive
#    - Kabel USB między komputerami
#
# 3. Wklej na NOWYM komputerze do:
#    C:\AI PROJEKT\MESSU-BOUW-PREMIUM-14-main\src\i18n\Affinity x64.exe

# OPCJA 2: Pobierz z pliku ZIP (jeśli masz backup)
# Plik jest w ZIP: src\i18n\Affinity x64.exe
# Wypakuj tylko ten plik i skopiuj do:
# C:\AI PROJEKT\MESSU-BOUW-PREMIUM-14-main\src\i18n\
```

**Sprawdź czy plik jest:**
```powershell
Test-Path "C:\AI PROJEKT\MESSU-BOUW-PREMIUM-14-main\src\i18n\Affinity x64.exe"
# Powinno pokazać: True
```

### **OPCJA B: Rozpakowanie z ZIP**

Jeśli masz plik ZIP z backupu:

```powershell
# 1. Skopiuj ZIP do folderu
# C:\AI PROJEKT\MESSU-BOUW-PREMIUM-14-BACKUP-2025-11-05-2136.zip

# 2. Rozpakuj (kliknij prawym → Wyodrębnij wszystko)
# LUB użyj PowerShell:
Expand-Archive -Path "C:\AI PROJEKT\MESSU-BOUW-PREMIUM-14-BACKUP-2025-11-05-2136.zip" -DestinationPath "C:\AI PROJEKT\MESSU-BOUW-PREMIUM-14-main"

# 3. Wejdź do folderu
cd "C:\AI PROJEKT\MESSU-BOUW-PREMIUM-14-main"
```

**✅ ZALETĄ OPCJI B:** Plik `Affinity x64.exe` jest już w ZIP - nie trzeba go kopiować osobno!

---

## 📥 KROK 3: INSTALACJA ZALEŻNOŚCI

```powershell
# Upewnij się, że jesteś w folderze projektu
cd "C:\AI PROJEKT\MESSU-BOUW-PREMIUM-14-main"

# Zainstaluj wszystkie zależności (to zajmie 5-10 minut)
npm install
```

**Co się zainstaluje:**
- React 19.0.0
- Electron 38.4.0
- Vite 6.3.5
- TypeScript 5.7.2
- Tailwind CSS 4.1.11
- ~100+ innych paczek

---

## 🗄️ KROK 4: KONFIGURACJA BAZY DANYCH

**Aplikacja używa:**
- **Electron:** SQLite (better-sqlite3) - automatyczne
- **Web:** localStorage - automatyczne

**Baza danych tworzy się automatycznie przy pierwszym uruchomieniu!**

### **Przywracanie danych z poprzedniego komputera:**

**OPCJA 1: Skopiuj cały folder danych**
```powershell
# Z POPRZEDNIEGO KOMPUTERA skopiuj:
C:\Users\[TWOJA_NAZWA]\AppData\Roaming\messu-bouw-faktur\

# DO NOWEGO KOMPUTERA wklej:
C:\Users\[TWOJA_NAZWA]\AppData\Roaming\messu-bouw-faktur\
```

**OPCJA 2: Eksport/Import przez aplikację**
1. Na starym komputerze: **Ustawienia → Backup → Eksportuj dane**
2. Skopiuj plik `.json` na nowy komputer
3. Na nowym komputerze: **Ustawienia → Backup → Importuj dane**

---

## ▶️ KROK 5: URUCHOMIENIE APLIKACJI

### **5.1 Tryb Deweloperski (do testowania)**

```powershell
# W folderze projektu:
npm run dev
```

**Aplikacja uruchomi się:**
- Przeglądarka: http://localhost:5000
- Auto-reload przy zmianach kodu

### **5.2 Tryb Electron (Desktop)**

```powershell
# Zbuduj i uruchom aplikację desktop
npm run electron
```

### **5.3 Tryb Produkcyjny (Instalator)**

```powershell
# Zbuduj instalator Windows (.exe)
npm run dist:win
```

**Instalator znajdziesz w:**
`dist/MESSU BOUW Setup 1.0.0.exe`

---

## 🔗 KROK 6: PODŁĄCZENIE DO GITHUB

### **6.1 Konfiguracja Git**

```powershell
# Ustaw swoją tożsamość
git config --global user.name "Twoje Imię"
git config --global user.email "twoj@email.com"

# Sprawdź połączenie z repo
git remote -v
# Powinno pokazać:
# origin  https://github.com/norbi07011/MESSU-BOUW-PREMIUM-14-main.git
```

### **6.2 Synchronizacja zmian**

```powershell
# Pobierz najnowsze zmiany
git pull origin master

# Po dokonaniu zmian:
git add .
git commit -m "Opis zmian"
git push origin master
```

---

## 📂 STRUKTURA PROJEKTU

```
MESSU-BOUW-PREMIUM-14-main/
├── src/                          # Kod źródłowy React
│   ├── components/               # Komponenty UI
│   ├── pages/                    # Strony aplikacji
│   ├── hooks/                    # Custom React hooks
│   ├── contexts/                 # Context providers
│   ├── lib/                      # Utilities
│   ├── i18n/                     # Tłumaczenia (PL, NL, EN)
│   └── types/                    # TypeScript types
├── electron/                     # Kod Electron (Desktop)
│   ├── main.ts                   # Główny proces
│   ├── preload.ts                # Preload script
│   ├── database.ts               # SQLite database
│   └── filesystem.ts             # File operations
├── public/                       # Pliki statyczne
├── dist-electron/                # Zbudowany kod Electron
├── node_modules/                 # Zależności (nie commitować!)
├── package.json                  # Konfiguracja projektu
├── vite.config.ts                # Konfiguracja Vite
├── tsconfig.json                 # Konfiguracja TypeScript
└── .gitignore                    # Pliki ignorowane przez Git
```

---

## 🛠️ DOSTĘPNE KOMENDY

```powershell
# DEVELOPERSKIE
npm run dev              # Uruchom w trybie developerskim (web)
npm run electron:dev     # Uruchom Electron z hot-reload
npm run build            # Zbuduj projekt (web)
npm run preview          # Podgląd buildu

# ELECTRON
npm run build:electron   # Zbuduj część Electron
npm run electron         # Uruchom aplikację desktop
npm run dist             # Stwórz instalator (Windows + Linux)
npm run dist:win         # Stwórz instalator tylko Windows

# UTILITIES
npm run lint             # Sprawdź kod (ESLint)
npm run optimize         # Optymalizuj zależności
```

---

## 🔐 BEZPIECZEŃSTWO I DANE

### **Gdzie są przechowywane dane:**

**Windows:**
```
C:\Users\[NAZWA_UŻYTKOWNIKA]\AppData\Roaming\messu-bouw-faktur\
├── database.sqlite      # Baza danych
├── config.json          # Konfiguracja
└── backups/             # Automatyczne backupy
```

**localStorage (Web):**
- Dane w przeglądarce (IndexedDB)
- Backup przez: DevTools → Application → Storage

### **Backup danych:**

**Automatyczny:**
- Aplikacja tworzy backup co 7 dni
- Lokalizacja: `AppData/Roaming/messu-bouw-faktur/backups/`

**Ręczny:**
1. Otwórz aplikację
2. **Ustawienia → Backup & Export**
3. **Eksportuj wszystkie dane** → plik `.json`
4. Zapisz w bezpiecznym miejscu

---

## 🐛 ROZWIĄZYWANIE PROBLEMÓW

### **Problem: "node" nie jest rozpoznawany**
```powershell
# Rozwiązanie: Dodaj Node.js do PATH
# 1. Panel Sterowania → System → Zaawansowane ustawienia systemu
# 2. Zmienne środowiskowe → Path → Edytuj
# 3. Dodaj: C:\Program Files\nodejs\
```

### **Problem: npm install zawiesza się**
```powershell
# Wyczyść cache i spróbuj ponownie
npm cache clean --force
npm install
```

### **Problem: Electron nie uruchamia się**
```powershell
# Przebuduj natywne moduły
npm rebuild
npm run build:electron
npm run electron
```

### **Problem: Port 5000 zajęty**
```powershell
# Zmień port w package.json:
# "dev": "vite --host --port 5001"
```

### **Problem: Brak danych po migracji**
```powershell
# Sprawdź czy skopiowałeś folder:
dir "C:\Users\$env:USERNAME\AppData\Roaming\messu-bouw-faktur"

# Jeśli pusty, przywróć z backup
```

---

## 📱 DODATKOWE FUNKCJE

### **Build Android APK**
```powershell
# Wymagane: Android Studio + Java 21
npm run build
npx cap sync android
npx cap open android
# Build w Android Studio
```

### **Build iOS**
```powershell
# Wymagane: macOS + Xcode
npm run build
npx cap sync ios
npx cap open ios
# Build w Xcode
```

---

## 🎯 FUNKCJONALNOŚCI APLIKACJI

**Główne moduły:**
- ✅ **Faktury:** Tworzenie, edycja, wysyłka
- ✅ **Klienci:** Zarządzanie bazą klientów
- ✅ **Wydatki:** Rejestracja kosztów
- ✅ **Kilometrówka:** Rozliczanie przejazdów
- ✅ **Godziny pracy:** Karty tygodniowe (MESSU BOUW)
- ✅ **Raporty:** BTW, przychody, koszty
- ✅ **Dokumenty:** Magazyn plików
- ✅ **Ustawienia:** Konfiguracja, backup, języki

**Języki:**
- 🇵🇱 Polski (domyślny)
- 🇳🇱 Nederlands
- 🇬🇧 English

**Eksport:**
- PDF (faktury, raporty)
- Excel (zestawienia)
- JSON (backup danych)
- QR Code (płatności SEPA)

---

## ✅ CHECKLIST INSTALACJI

- [ ] Zainstalowano Node.js v22+
- [ ] Zainstalowano Git
- [ ] Sklonowano repozytorium lub rozpakowano ZIP
- [ ] **SKOPIOWANO plik `Affinity x64.exe` do `src/i18n/`** ⚠️ WAŻNE!
- [ ] Uruchomiono `npm install`
- [ ] Aplikacja uruchamia się (`npm run dev`)
- [ ] (Opcjonalnie) Przywrócono dane z poprzedniego komputera
- [ ] (Opcjonalnie) Skonfigurowano Git (user.name, user.email)
- [ ] (Opcjonalnie) Zbudowano instalator (`npm run dist:win`)

---

## 📞 KONTAKT I WSPARCIE

**Repozytorium GitHub:**
https://github.com/norbi07011/MESSU-BOUW-PREMIUM-14-main

**Issues (zgłaszanie błędów):**
https://github.com/norbi07011/MESSU-BOUW-PREMIUM-14-main/issues

**Wiki (dokumentacja):**
https://github.com/norbi07011/MESSU-BOUW-PREMIUM-14-main/wiki

---

## 🎉 GOTOWE!

Po wykonaniu wszystkich kroków, aplikacja powinna działać identycznie jak na pierwszym komputerze!

**Następne kroki:**
1. Uruchom aplikację: `npm run dev`
2. Zaloguj się / Przywróć dane
3. Zacznij pracować! 🚀

---

**Powodzenia!**  
MESSU BOUW Team 💪
