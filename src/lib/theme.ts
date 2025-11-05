/**
 * ULTRA PREMIUM DESIGN SYSTEM
 * 
 * TYLKO JASNY MOTYW (LIGHT MODE):
 * - light: Jasny z niebieskim
 */

export type Theme = 'light';

// ============================================
// KOLORY - LIGHT THEME (Jasny) - TYLKO BŁĘKITNY
// ============================================

export const lightTheme = {
  // Tło
  background: {
    primary: '#FFFFFF',           // Białe tło główne
    secondary: '#F0F9FF',         // Bardzo jasny błękit (sky-50)
    card: '#FFFFFF',              // Białe karty
    hover: '#E0F2FE',             // Hover - sky-100
  },
  
  // Główny kolor akcji (BŁĘKITNY - sky blue)
  primary: {
    main: '#0EA5E9',              // sky-500 - główny błękitny
    light: '#38BDF8',             // sky-400 - jasny błękitny
    dark: '#0284C7',              // sky-600 - ciemny błękitny
    glow: 'rgba(14, 165, 233, 0.3)', // Glow błękitny
  },
  
  // Tekst
  text: {
    primary: '#0F172A',           // slate-900 - czarny tekst
    secondary: '#475569',         // slate-600 - szary
    muted: '#94A3B8',             // slate-400 - jasny szary
    inverse: '#FFFFFF',           // biały (dla dark backgrounds)
  },
  
  // Obramowania - WSZYSTKIE BŁĘKITNE
  border: {
    primary: '#BAE6FD',           // sky-200 - błękitna ramka
    focus: '#0EA5E9',             // błękitny focus
    glow: 'rgba(14, 165, 233, 0.2)', // Subtelny błękitny glow
  },
  
  // Statusy - WSZYSTKIE BŁĘKITNE (dla spójności)
  status: {
    success: '#0EA5E9',           // błękitny zamiast zielonego
    error: '#0EA5E9',             // błękitny zamiast czerwonego
    warning: '#0EA5E9',           // błękitny zamiast pomarańczowego
    info: '#0EA5E9',              // błękitny
  },
  
  // Cienie
  shadow: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    glow: '0 0 20px rgba(14, 165, 233, 0.3)',
  }
};

// ============================================
// THEME UTILITIES
// ============================================

export function getTheme(theme: Theme) {
  return lightTheme;
}

export function getThemeColors(theme: Theme) {
  const t = getTheme(theme);
  return {
    // CSS Variables format
    '--bg-primary': t.background.primary,
    '--bg-secondary': t.background.secondary,
    '--bg-card': t.background.card,
    '--bg-hover': t.background.hover,
    
    '--primary': t.primary.main,
    '--primary-light': t.primary.light,
    '--primary-dark': t.primary.dark,
    '--primary-glow': t.primary.glow,
    
    '--text-primary': t.text.primary,
    '--text-secondary': t.text.secondary,
    '--text-muted': t.text.muted,
    '--text-inverse': t.text.inverse,
    
    '--border': t.border.primary,
    '--border-focus': t.border.focus,
    '--border-glow': t.border.glow,
    
    '--shadow-sm': t.shadow.sm,
    '--shadow-md': t.shadow.md,
    '--shadow-lg': t.shadow.lg,
    '--shadow-glow': t.shadow.glow,
  };
}

// ============================================
// THEME CLASSES (dla Tailwind)
// ============================================

export const themeClasses = {
  light: {
    // Tła
    bgPrimary: 'bg-white',
    bgSecondary: 'bg-sky-50',
    bgCard: 'bg-white',
    bgHover: 'hover:bg-sky-100',
    
    // Teksty
    textPrimary: 'text-slate-900',
    textSecondary: 'text-slate-600',
    textMuted: 'text-slate-400',
    
    // Przyciski - TYLKO BŁĘKITNE
    btnPrimary: 'bg-sky-500 hover:bg-sky-600 text-white',
    btnSecondary: 'bg-white hover:bg-sky-50 text-sky-600 border border-sky-300',
    
    // Obramowania - BŁĘKITNE
    border: 'border-sky-200',
    borderFocus: 'focus:border-sky-500 focus:ring-sky-500',
    
    // Karty - BŁĘKITNE ramki
    card: 'bg-white border border-sky-200 shadow-sm hover:shadow-md hover:border-sky-300',
  },
  
  dark: {
    // Tła
    bgPrimary: 'bg-[#0A0E1A]',
    bgSecondary: 'bg-[#0F1623]',
    bgCard: 'bg-[#151B2E]',
    bgHover: 'hover:bg-[#1A2235]',
    
    // Teksty
    textPrimary: 'text-slate-50',
    textSecondary: 'text-slate-300',
    textMuted: 'text-slate-500',
    
    // Przyciski - FIOLETOWE z GLOW!
    btnPrimary: 'bg-purple-500 hover:bg-purple-400 text-white shadow-[0_0_20px_rgba(168,85,247,0.5)] hover:shadow-[0_0_30px_rgba(168,85,247,0.7)]',
    btnSecondary: 'bg-slate-800 hover:bg-slate-700 text-purple-400 border border-purple-500/30 hover:border-purple-400 shadow-[0_0_10px_rgba(168,85,247,0.2)]',
    
    // Obramowania - ŚWIECĄCE FIOLETOWE!
    border: 'border-purple-500/20',
    borderFocus: 'focus:border-purple-500 focus:ring-purple-500 focus:shadow-[0_0_20px_rgba(168,85,247,0.3)]',
    
    // Karty - z FIOLETOWYM glow obramówką
    card: 'bg-[#151B2E] border border-purple-500/20 shadow-lg hover:border-purple-400/40 hover:shadow-[0_0_30px_rgba(168,85,247,0.2)]',
  }
};

// ============================================
// GRADIENTS (Premium Backgrounds)
// ============================================

export const gradients = {
  light: {
    primary: 'bg-gradient-to-br from-sky-50 to-blue-50',
    card: 'bg-gradient-to-br from-white to-sky-50',
    header: 'bg-gradient-to-r from-sky-500 to-blue-600',
  },
  
  dark: {
    primary: 'bg-gradient-to-br from-[#0A0E1A] via-[#0F1623] to-[#0A0E1A]',
    card: 'bg-gradient-to-br from-[#151B2E] to-[#1A2235]',
    header: 'bg-gradient-to-r from-purple-600 to-purple-500',  // FIOLETOWY header
    glow: 'bg-gradient-to-br from-purple-500/10 via-transparent to-purple-600/10',  // FIOLETOWY glow
  }
};

// ============================================
// ANIMATION CLASSES
// ============================================

export const animations = {
  // Pulsujący glow (dla dark theme)
  pulseGlow: 'animate-pulse-glow',
  
  // Fade in
  fadeIn: 'animate-fade-in',
  
  // Slide up
  slideUp: 'animate-slide-up',
};

// CSS dla animacji (dodaj do index.css):
export const animationCSS = `
@keyframes pulse-glow {
  0%, 100% {
    box-shadow: 0 0 20px rgba(6, 182, 212, 0.3);
  }
  50% {
    box-shadow: 0 0 40px rgba(6, 182, 212, 0.6);
  }
}

@keyframes fade-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slide-up {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.animate-pulse-glow {
  animation: pulse-glow 3s ease-in-out infinite;
}

.animate-fade-in {
  animation: fade-in 0.3s ease-out;
}

.animate-slide-up {
  animation: slide-up 0.4s ease-out;
}
`;
