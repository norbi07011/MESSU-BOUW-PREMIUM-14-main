/**
 * GOTOWE MOTYWY - Themes & Presets
 * 5 profesjonalnych kolorystyk + możliwość zapisu custom
 */

export interface ColorTheme {
  id: string;
  name: string;
  description: string;
  colors: {
    headerStart: string;  // Gradient start
    headerEnd: string;    // Gradient end
    borderColor: string;
    textColor: string;
    backgroundColor: string;
    accentColor: string;
  };
  fontFamily: string;
  fontSize: number;
}

// 1️⃣ Professional Blue (obecny)
export const THEME_PROFESSIONAL_BLUE: ColorTheme = {
  id: 'professional-blue',
  name: 'Professional Blue',
  description: 'Nowoczesny niebieski gradient - profesjonalny i czysty',
  colors: {
    headerStart: '#0ea5e9',  // sky-500
    headerEnd: '#2563eb',    // blue-600
    borderColor: '#e5e7eb',  // gray-200
    textColor: '#111827',    // gray-900
    backgroundColor: '#ffffff',
    accentColor: '#0ea5e9'
  },
  fontFamily: 'Arial, sans-serif',
  fontSize: 10
};

// 2️⃣ Corporate Gray
export const THEME_CORPORATE_GRAY: ColorTheme = {
  id: 'corporate-gray',
  name: 'Corporate Gray',
  description: 'Elegancka szarość - dla firm korporacyjnych',
  colors: {
    headerStart: '#4b5563',  // gray-600
    headerEnd: '#1f2937',    // gray-800
    borderColor: '#d1d5db',  // gray-300
    textColor: '#111827',
    backgroundColor: '#ffffff',
    accentColor: '#6b7280'
  },
  fontFamily: 'Helvetica, Arial, sans-serif',
  fontSize: 10
};

// 3️⃣ Construction Orange
export const THEME_CONSTRUCTION_ORANGE: ColorTheme = {
  id: 'construction-orange',
  name: 'Construction Orange',
  description: 'Energetyczna pomarańcz - dla budowy i przemysłu',
  colors: {
    headerStart: '#f97316',  // orange-500
    headerEnd: '#ea580c',    // orange-600
    borderColor: '#fed7aa',  // orange-200
    textColor: '#1c1917',    // stone-900
    backgroundColor: '#fffbeb', // amber-50
    accentColor: '#f97316'
  },
  fontFamily: 'Arial, sans-serif',
  fontSize: 11
};

// 4️⃣ Minimal Black/White
export const THEME_MINIMAL_BW: ColorTheme = {
  id: 'minimal-bw',
  name: 'Minimal Black/White',
  description: 'Minimalistyczny czarno-biały - czysty i przejrzysty',
  colors: {
    headerStart: '#000000',
    headerEnd: '#1f2937',    // dark gray
    borderColor: '#000000',
    textColor: '#000000',
    backgroundColor: '#ffffff',
    accentColor: '#374151'
  },
  fontFamily: 'Helvetica, sans-serif',
  fontSize: 10
};

// 5️⃣ Colorful Rainbow
export const THEME_COLORFUL_RAINBOW: ColorTheme = {
  id: 'colorful-rainbow',
  name: 'Colorful Rainbow',
  description: 'Kolorowy gradient - kreatywny i żywy',
  colors: {
    headerStart: '#8b5cf6',  // violet-500
    headerEnd: '#ec4899',    // pink-500
    borderColor: '#e9d5ff',  // violet-200
    textColor: '#581c87',    // violet-900
    backgroundColor: '#faf5ff', // violet-50
    accentColor: '#a855f7'
  },
  fontFamily: 'Roboto, Arial, sans-serif',
  fontSize: 10
};

// Wszystkie motywy
export const ALL_THEMES: ColorTheme[] = [
  THEME_PROFESSIONAL_BLUE,
  THEME_CORPORATE_GRAY,
  THEME_CONSTRUCTION_ORANGE,
  THEME_MINIMAL_BW,
  THEME_COLORFUL_RAINBOW
];

// Funkcje pomocnicze
export const getThemeById = (id: string): ColorTheme | undefined => {
  return ALL_THEMES.find(theme => theme.id === id);
};

export const exportThemeToJSON = (theme: ColorTheme): string => {
  return JSON.stringify(theme, null, 2);
};

export const importThemeFromJSON = (json: string): ColorTheme | null => {
  try {
    const parsed = JSON.parse(json);
    // Walidacja podstawowa
    if (parsed.id && parsed.name && parsed.colors) {
      return parsed as ColorTheme;
    }
    return null;
  } catch {
    return null;
  }
};
