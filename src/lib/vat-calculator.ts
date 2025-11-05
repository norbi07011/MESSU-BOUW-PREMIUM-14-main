/**
 * VAT CALCULATOR - Poprawne obliczenia VAT dla Holandii
 * 
 * PROBLEM: System błędnie DODAWAŁ VAT do kwoty brutto zamiast ODLICZYĆ
 * ROZWIĄZANIE: Dedykowane funkcje dla obu scenariuszy
 */

// Stawki VAT w Holandii (2025)
export const VAT_RATES_NL = {
  standard: 21,    // 21% - standardowa (usługi budowlane, większość produktów)
  reduced: 9,      // 9% - obniżona (żywność, książki, transport)
  zero: 0,         // 0% - eksport, reverse charge B2B
} as const;

export type VATRate = 21 | 9 | 0;

/**
 * SCENARIUSZ 1: Użytkownik wpisuje kwotę BRUTTO (z rachunku)
 * Przykład: Rachunek IKEA na 193.60 € (zawiera VAT 21%)
 * 
 * Obliczenia:
 * - Netto = Brutto / (1 + VAT%)
 * - VAT = Brutto - Netto
 * 
 * @param gross - Kwota brutto (z VAT)
 * @param vatRate - Stawka VAT (21, 9, lub 0)
 * @returns { net, vat, gross }
 */
export function calculateNetFromGross(gross: number, vatRate: VATRate = 21) {
  if (gross < 0) {
    throw new Error('Kwota brutto nie może być ujemna');
  }

  if (vatRate === 0) {
    return {
      net: gross,
      vat: 0,
      gross: gross,
    };
  }

  const divisor = 1 + (vatRate / 100);
  const net = gross / divisor;
  const vat = gross - net;

  return {
    net: Math.round(net * 100) / 100,      // Zaokrąglenie do 2 miejsc
    vat: Math.round(vat * 100) / 100,
    gross: Math.round(gross * 100) / 100,
  };
}

/**
 * SCENARIUSZ 2: Użytkownik wpisuje kwotę NETTO (bez VAT)
 * Przykład: Usługa za 160 € netto, doliczamy VAT 21%
 * 
 * Obliczenia:
 * - VAT = Netto × VAT%
 * - Brutto = Netto + VAT
 * 
 * @param net - Kwota netto (bez VAT)
 * @param vatRate - Stawka VAT (21, 9, lub 0)
 * @returns { net, vat, gross }
 */
export function calculateGrossFromNet(net: number, vatRate: VATRate = 21) {
  if (net < 0) {
    throw new Error('Kwota netto nie może być ujemna');
  }

  if (vatRate === 0) {
    return {
      net: net,
      vat: 0,
      gross: net,
    };
  }

  const vat = net * (vatRate / 100);
  const gross = net + vat;

  return {
    net: Math.round(net * 100) / 100,
    vat: Math.round(vat * 100) / 100,
    gross: Math.round(gross * 100) / 100,
  };
}

/**
 * Walidacja poprawności obliczeń VAT
 * Sprawdza czy Net + VAT = Gross (z tolerancją 0.01€ na zaokrąglenia)
 */
export function validateVATCalculation(net: number, vat: number, gross: number): boolean {
  const calculatedGross = net + vat;
  const difference = Math.abs(calculatedGross - gross);
  return difference < 0.02; // Tolerancja 2 centy
}

/**
 * Formatowanie kwoty do wyświetlenia (€)
 */
export function formatCurrency(amount: number, locale: string = 'nl-NL'): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * PRZYKŁADY UŻYCIA:
 */

// PRZYKŁAD 1: Rachunek IKEA 193.60 € (brutto)
// const result1 = calculateNetFromGross(193.60, 21);
// console.log(result1);
// // { net: 160.00, vat: 33.60, gross: 193.60 }

// PRZYKŁAD 2: Usługa 160 € (netto), dodaj VAT 21%
// const result2 = calculateGrossFromNet(160, 21);
// console.log(result2);
// // { net: 160.00, vat: 33.60, gross: 193.60 }

// PRZYKŁAD 3: Żywność 50 € (brutto) VAT 9%
// const result3 = calculateNetFromGross(50, 9);
// console.log(result3);
// // { net: 45.87, vat: 4.13, gross: 50.00 }

// PRZYKŁAD 4: Reverse charge B2B 1000 € (VAT 0%)
// const result4 = calculateNetFromGross(1000, 0);
// console.log(result4);
// // { net: 1000.00, vat: 0.00, gross: 1000.00 }
