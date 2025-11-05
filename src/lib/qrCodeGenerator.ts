/**
 * QR Code Generator Utility
 * 
 * Generates QR codes for payment links, IBANs, or any text data.
 * Uses qrcode library with optimized settings for invoices.
 */

import QRCode from 'qrcode';

interface QRCodeOptions {
  size?: number; // Width/height in pixels
  margin?: number; // Margin around QR code
  errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H'; // Error correction
}

/**
 * Generate QR code as Data URL (base64 image)
 * @param data - Text data to encode (URL, IBAN, text)
 * @param options - QR code generation options
 * @returns Promise<string> - Data URL (can be used in <img src="">)
 */
export async function generateQRCode(
  data: string,
  options: QRCodeOptions = {}
): Promise<string> {
  const {
    size = 200,
    margin = 1,
    errorCorrectionLevel = 'M',
  } = options;

  try {
    const dataUrl = await QRCode.toDataURL(data, {
      width: size,
      margin,
      errorCorrectionLevel,
      color: {
        dark: '#000000', // Black QR code
        light: '#FFFFFF', // White background
      },
    });

    return dataUrl;
  } catch (error) {
    console.error('QR Code generation error:', error);
    return ''; // Return empty string on error
  }
}

/**
 * Generate payment QR code (SEPA format for Europe)
 * @param iban - Bank account IBAN
 * @param amount - Payment amount (e.g., "2601.50")
 * @param reference - Invoice number or reference
 * @returns Promise<string> - Data URL
 */
export async function generatePaymentQRCode(
  iban: string,
  amount: string,
  reference: string
): Promise<string> {
  // EPC QR Code format for SEPA payments
  const epcData = [
    'BCD', // Service tag
    '002', // Version
    '1', // Character set (UTF-8)
    'SCT', // SEPA Credit Transfer
    '', // BIC (optional)
    '', // Beneficiary name (optional)
    iban.replace(/\s/g, ''), // IBAN without spaces
    `EUR${amount}`, // Currency + amount
    '', // Purpose (optional)
    reference, // Structured reference
    '', // Unstructured remittance
  ].join('\n');

  return generateQRCode(epcData, { size: 200, errorCorrectionLevel: 'M' });
}
