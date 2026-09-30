import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Budget, BudgetStatus, Company, CurrencyCode, CURRENCIES, PdfTemplate, PlanType } from '../types';
import { Locale, translations, Translation } from '../translations';
import ReactGA from 'react-ga4';

// 9 Supported languages metadata
export interface SupportedPdfLanguage {
  code: Locale;
  label: string;
  nativeLabel: string;
  flag: string;
  shortCode: string;
}

export const SUPPORTED_PDF_LANGUAGES: SupportedPdfLanguage[] = [
  { code: 'pt-PT', label: 'Português (Portugal)', nativeLabel: 'Português (PT)', flag: '🇵🇹', shortCode: 'PT' },
  { code: 'pt-BR', label: 'Português (Brasil)', nativeLabel: 'Português (BR)', flag: '🇧🇷', shortCode: 'BR' },
  { code: 'en-US', label: 'English', nativeLabel: 'English (US)', flag: '🇬🇧', shortCode: 'EN' },
  { code: 'es-ES', label: 'Español', nativeLabel: 'Español', flag: '🇪🇸', shortCode: 'ES' },
  { code: 'fr-FR', label: 'Français', nativeLabel: 'Français', flag: '🇫🇷', shortCode: 'FR' },
  { code: 'it-IT', label: 'Italiano', nativeLabel: 'Italiano', flag: '🇮🇹', shortCode: 'IT' },
  { code: 'ru-RU', label: 'Русский', nativeLabel: 'Русский', flag: '🇷🇺', shortCode: 'RU' },
  { code: 'hi-IN', label: 'हिन्दी', nativeLabel: 'हिन्दी (Hindi)', flag: '🇮🇳', shortCode: 'HI' },
  { code: 'bn-BD', label: 'বাংলা', nativeLabel: 'বাংলা (Bengali)', flag: '🇧🇩', shortCode: 'BN' }
];

// Cyrillic transliteration map for clean PDF standard font rendering
const CYRILLIC_MAP: Record<string, string> = {
  'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'yo', 'ж': 'zh', 'з': 'z',
  'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm', 'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r',
  'с': 's', 'т': 't', 'у': 'u', 'ф': 'f', 'х': 'kh', 'ц': 'ts', 'ч': 'ch', 'ш': 'sh', 'щ': 'shch',
  'ъ': '', 'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu', 'я': 'ya',
  'А': 'A', 'Б': 'B', 'В': 'V', 'Г': 'G', 'Д': 'D', 'Е': 'E', 'Ё': 'Yo', 'Ж': 'Zh', 'З': 'Z',
  'И': 'I', 'Й': 'Y', 'К': 'K', 'Л': 'L', 'М': 'M', 'Н': 'N', 'О': 'O', 'П': 'P', 'Р': 'R',
  'С': 'S', 'Т': 'T', 'У': 'U', 'Ф': 'F', 'Х': 'Kh', 'Ц': 'Ts', 'Ч': 'Ch', 'Ш': 'Sh', 'Щ': 'Shch',
  'Ъ': '', 'Ы': 'Y', 'Ь': '', 'Э': 'E', 'Ю': 'Yu', 'Я': 'Ya'
};

// Hindi / Devanagari transliteration dictionary and character mapping
const HINDI_PHRASES: Record<string, string> = {
  'अनुमान': 'Anuman (Quote)',
  'ऑर्डर': 'Order (Pedido)',
  'कार्य आदेश': 'Karya Aadesh (OS)',
  'ग्राहक': 'Grahak (Client)',
  'विवरण': 'Vivaran (Description)',
  'मात्रा': 'Matra (Qty)',
  'दर': 'Dar (Unit Price)',
  'मूल्य': 'Mulya (Price)',
  'इकाई': 'Ikaee (Unit)',
  'कुल': 'Kul (Total)',
  'योग': 'Yog (Total)',
  'उप-योग': 'Up-Yog (Subtotal)',
  'कर': 'Kar / GST (Tax)',
  'भुगतान विधि': 'Bhugtan Vidhi (Payment)',
  'टिप्पणियाँ': 'Tippaniya (Notes)',
  'स्थान': 'Sthan (Location)',
  'तारीख': 'Tarikh (Date)',
  'वैधता': 'Vaidhata (Validity)',
  'स्थिति': 'Sthiti (Status)',
  'स्वीकृत': 'Swikrit (Approved)',
  'लंबित': 'Lambit (Pending)',
  'अस्वीकृत': 'Aswikrit (Rejected)'
};

const DEVANAGARI_CHARS: Record<string, string> = {
  '०': '0', '१': '1', '२': '2', '३': '3', '४': '4', '५': '5', '६': '6', '७': '7', '८': '8', '९': '9',
  'अ': 'A', 'आ': 'Aa', 'इ': 'I', 'ई': 'Ee', 'उ': 'U', 'ऊ': 'Oo', 'ऋ': 'Ri', 'ए': 'E', 'ऐ': 'Ai', 'ओ': 'O', 'औ': 'Au', 'अं': 'An', 'अः': 'Ah',
  'ा': 'a', 'ि': 'i', 'ी': 'ee', 'ु': 'u', 'ू': 'oo', 'ृ': 'ri', 'े': 'e', 'ै': 'ai', 'ो': 'o', 'ौ': 'au', 'ं': 'n', 'ँ': 'n', 'ः': 'h', '्': '',
  'क': 'k', 'ख': 'kh', 'ग': 'g', 'घ': 'gh', 'ङ': 'ng', 'च': 'ch', 'छ': 'chh', 'ज': 'j', 'झ': 'jh', 'ञ': 'ny',
  'ट': 't', 'ठ': 'th', 'ड': 'd', 'ढ': 'dh', 'ण': 'n', 'त': 't', 'थ': 'th', 'द': 'd', 'ध': 'dh', 'न': 'n',
  'प': 'p', 'फ': 'ph', 'ब': 'b', 'भ': 'bh', 'म': 'm', 'य': 'y', 'र': 'r', 'ल': 'l', 'व': 'v', 'श': 'sh', 'ष': 'sh', 'स': 's', 'ह': 'h',
  'क्ष': 'ksh', 'त्र': 'tr', 'ज्ञ': 'gy', 'क़': 'q', 'ख़': 'kh', 'ग़': 'gh', 'ज़': 'z', 'ड़': 'r', 'ढ़': 'rh', 'फ़': 'f'
};

// Bengali transliteration dictionary and character mapping
const BENGALI_PHRASES: Record<string, string> = {
  'হিসাব': 'Hisab (Quote)',
  'কোটেশন': 'Koteshon (Quote)',
  'অর্ডার': 'Order (Pedido)',
  'কাজের আদেশ': 'Kajer Adesh (OS)',
  'ক্লায়েন্ট': 'Client',
  'বিবরণ': 'Biboron (Description)',
  'পরিমাণ': 'Poriman (Qty)',
  'দর': 'Dor (Price)',
  'মূল্য': 'Mulya (Price)',
  'একক': 'Ekok (Unit)',
  'মোট': 'Mot (Total)',
  'উপ-মোট': 'Upo-Mot (Subtotal)',
  'কর / ভ্যাট': 'Kor / VAT',
  'পেমেন্ট পদ্ধতি': 'Payment Poddhoti',
  'মন্তব্য': 'Montobyo (Notes)',
  'ঠিকানা': 'Thikana (Location)',
  'তারিখ': 'Tarikh (Date)',
  'মেয়াদ': 'Meyad (Validity)',
  'অবস্থা': 'Obostha (Status)',
  'অনুমোদিত': 'Onumodito (Approved)',
  'মুলতুবি': 'Moltubi (Pending)',
  'প্রত্যাখ্যাত': 'Protyakhyato (Rejected)'
};

const BENGALI_CHARS: Record<string, string> = {
  '০': '0', '১': '1', '২': '2', '৩': '3', '৪': '4', '৫': '5', '৬': '6', '৭': '7', '৮': '8', '৯': '9',
  'অ': 'O', 'আ': 'A', 'ই': 'I', 'ঈ': 'I', 'উ': 'U', 'ঊ': 'U', 'ঋ': 'Ri', 'এ': 'E', 'ঐ': 'Oi', 'ও': 'O', 'ঔ': 'Ou',
  'া': 'a', 'ি': 'i', 'ী': 'i', 'ু': 'u', 'ূ': 'u', 'ৃ': 'ri', 'ে': 'e', 'ৈ': 'oi', 'ো': 'o', 'ৌ': 'ou', 'ং': 'ng', 'ঃ': 'h', 'ঁ': 'n', '্': '',
  'ক': 'k', 'খ': 'kh', 'ग': 'g', 'घ': 'gh', 'ङ': 'ng', 'চ': 'ch', 'ছ': 'chh', 'জ': 'j', 'ঝ': 'jh', 'ঞ': 'ny',
  'ট': 't', 'ঠ': 'th', 'ড': 'd', 'ঢ': 'dh', 'ণ': 'n', 'ত': 't', 'থ': 'th', 'দ': 'd', 'ধ': 'dh', 'ন': 'n',
  'প': 'p', 'ফ': 'ph', 'ব': 'b', 'ভ': 'bh', 'ম': 'm', 'য': 'j', 'র': 'r', 'ল': 'l', 'শ': 'sh', 'ষ': 'sh', 'স': 's', 'হ': 'h',
  'ড়': 'r', 'ঢ়': 'rh', 'য়': 'y'
};

/**
 * Universal text normalizer for jsPDF supporting all 9 application languages:
 * Transliterates Cyrillic, Hindi, Bengali and cleans Latin diacritics to ensure
 * high-contrast, crisp PDF rendering across standard PDF engines.
 */
export function normalizeForPdf(text: string | undefined): string {
  if (!text) return "";
  let str = String(text);

  // 1. Replace known phrases in Hindi & Bengali for maximum readability
  for (const [hindi, trans] of Object.entries(HINDI_PHRASES)) {
    if (str.includes(hindi)) {
      str = str.split(hindi).join(trans);
    }
  }
  for (const [bengali, trans] of Object.entries(BENGALI_PHRASES)) {
    if (str.includes(bengali)) {
      str = str.split(bengali).join(trans);
    }
  }

  // 2. Character-by-character transliteration for Cyrillic, Devanagari, Bengali
  let result = '';
  for (let i = 0; i < str.length; i++) {
    const char = str[i];
    if (CYRILLIC_MAP[char]) {
      result += CYRILLIC_MAP[char];
    } else if (DEVANAGARI_CHARS[char]) {
      result += DEVANAGARI_CHARS[char];
    } else if (BENGALI_CHARS[char]) {
      result += BENGALI_CHARS[char];
    } else {
      result += char;
    }
  }

  // 3. Normalize Latin accents (á -> a, ç -> c, ñ -> n, etc.)
  result = result.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  // 4. Sanitize control and unsupported binary characters while keeping standard ASCII
  result = result.replace(/[^\x20-\x7E\n\r\t]/g, " ");

  // 5. Clean excess whitespace
  return result.trim().replace(/ +/g, " ");
}

/**
 * Palette colors for PDF templates
 */
export function getPdfColors(template?: PdfTemplate) {
  switch (template) {
    case PdfTemplate.BLUE_MODERN:
      return {
        primary: [37, 99, 235], // Blue 600
        secondary: [239, 246, 255], // Blue 50
        accent: [30, 64, 175], // Blue 800
        textDark: [15, 23, 42],
        border: [191, 219, 254]
      };
    case PdfTemplate.GREEN_PROFESSIONAL:
      return {
        primary: [16, 185, 129], // Emerald 500
        secondary: [236, 253, 245], // Emerald 50
        accent: [4, 120, 87], // Emerald 700
        textDark: [15, 23, 42],
        border: [167, 243, 208]
      };
    case PdfTemplate.LIGHT_BLUE_CLEAN:
      return {
        primary: [2, 132, 199], // Sky 600
        secondary: [240, 249, 255], // Sky 50
        accent: [3, 105, 161], // Sky 700
        textDark: [15, 23, 42],
        border: [186, 230, 253]
      };
    case PdfTemplate.DARK_ELEGANT:
      return {
        primary: [30, 41, 59], // Slate 800
        secondary: [241, 245, 249], // Slate 100
        accent: [15, 23, 42], // Slate 900
        textDark: [15, 23, 42],
        border: [203, 213, 225]
      };
    case PdfTemplate.MODERN_V2:
      return {
        primary: [99, 102, 241], // Indigo 500
        secondary: [238, 242, 255], // Indigo 50
        accent: [67, 56, 202], // Indigo 700
        textDark: [15, 23, 42],
        border: [199, 210, 254]
      };
    case PdfTemplate.DEFAULT:
    default:
      return {
        primary: [249, 115, 22], // Orange 500 (Átrios Brand)
        secondary: [255, 247, 237], // Orange 50
        accent: [194, 65, 12], // Orange 700
        textDark: [15, 23, 42],
        border: [254, 215, 170]
      };
  }
}

/**
 * Translates text via backend `/api/translate` endpoint with Gemini and high-speed fallback
 */
export async function translateSingleText(text: string, targetLocale: Locale): Promise<string> {
  if (!text || !text.trim()) return text;
  
  // Extract simple language code (e.g. 'fr', 'en', 'es', 'it', 'ru', 'hi', 'bn', 'pt')
  const targetLang = targetLocale.split('-')[0].toLowerCase();
  
  try {
    const res = await fetch('/api/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: text.trim(),
        sourceLang: 'auto',
        targetLang: targetLang,
        context: 'construction'
      })
    });

    if (res.ok) {
      const data = await res.json();
      if (data && data.translatedText) {
        return data.translatedText;
      }
    }
  } catch (err) {
    console.warn('[PDF AI Translation Error]', err);
  }
  return text;
}

/**
 * Translates the dynamic items, units, and remarks of a Budget into the target language
 */
export async function translateBudgetContent(budget: Budget, targetLocale: Locale): Promise<Budget> {
  const targetLang = targetLocale.split('-')[0].toLowerCase();
  
  // Translate items descriptions and units
  const translatedItems = await Promise.all(
    budget.items.map(async (item) => {
      try {
        const descTrans = await translateSingleText(item.description, targetLocale);
        const unitTrans = await translateSingleText(item.unit, targetLocale);
        return {
          ...item,
          description: descTrans || item.description,
          unit: unitTrans || item.unit
        };
      } catch {
        return item;
      }
    })
  );

  // Translate observations if present
  let translatedObs = budget.observations;
  if (budget.observations && budget.observations.trim()) {
    try {
      translatedObs = await translateSingleText(budget.observations, targetLocale);
    } catch {
      translatedObs = budget.observations;
    }
  }

  // Translate payment method if present
  let translatedPaymentMethod = budget.paymentMethod;
  if (budget.paymentMethod && budget.paymentMethod.trim()) {
    try {
      translatedPaymentMethod = await translateSingleText(budget.paymentMethod, targetLocale);
    } catch {
      translatedPaymentMethod = budget.paymentMethod;
    }
  }

  return {
    ...budget,
    items: translatedItems,
    observations: translatedObs,
    paymentMethod: translatedPaymentMethod
  };
}

export interface PdfExportOptions {
  targetLocale?: Locale;
  currencyCode?: CurrencyCode;
  company: Company;
  activeQrCode?: string;
  autoTranslateContent?: boolean;
  onProgress?: (stage: string) => void;
}

/**
 * Returns localized status string
 */
export function getTranslatedBudgetStatus(status: BudgetStatus, t: Translation): string {
  switch (status) {
    case BudgetStatus.APPROVED:
    case BudgetStatus.COMPLETED:
      return t.statusApproved || 'Aprovado';
    case BudgetStatus.REJECTED:
      return t.statusRejected || 'Rejeitado';
    case BudgetStatus.PENDING:
    default:
      return t.statusPending || 'Pendente';
  }
}

/**
 * Generates and downloads Budget / Commercial Proposal PDF in any of the 9 languages
 */
export async function generateBudgetPDF(rawBudget: Budget, options: PdfExportOptions): Promise<void> {
  const { company, currencyCode = 'EUR', activeQrCode, onProgress } = options;
  const targetLocale: Locale = options.targetLocale || 'pt-PT';
  const pdfT = translations[targetLocale] || translations['pt-PT'];

  if (onProgress) onProgress(`Preparando documento em ${SUPPORTED_PDF_LANGUAGES.find(l => l.code === targetLocale)?.label || targetLocale}...`);

  // Translate dynamic content if requested
  let budget = rawBudget;
  if (options.autoTranslateContent) {
    if (onProgress) onProgress(`Traduzindo itens e observações com Inteligência Artificial...`);
    try {
      budget = await translateBudgetContent(rawBudget, targetLocale);
    } catch (e) {
      console.warn('Erro na tradução automática, usando dados originais:', e);
    }
  }

  if (onProgress) onProgress(`Formatando layout do PDF...`);

  const doc = new jsPDF();
  const colors = getPdfColors(company.pdfTemplate);
  const currencyInfo = CURRENCIES[currencyCode] || CURRENCIES['EUR'];
  const pageHeight = doc.internal.pageSize.getHeight();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 15;
  const usableWidth = pageWidth - (margin * 2);

  // Dynamic Footer on Every Page
  const addFooter = (pdfDoc: any, pageNumber: number, totalPages: number) => {
    if (activeQrCode && activeQrCode.length > 50) {
      try {
        const qrFormat = activeQrCode.toLowerCase().includes('image/png') ? 'PNG' : 'JPEG';
        const qrSize = 14;
        const qrX = pageWidth - margin - qrSize;
        const qrY = pageHeight - 28;
        pdfDoc.addImage(activeQrCode, qrFormat, qrX, qrY, qrSize, qrSize, undefined, 'FAST');

        pdfDoc.setFont('helvetica', 'bold').setFontSize(5.8).setTextColor(71, 85, 105);
        pdfDoc.text(normalizeForPdf('CERTIFICADO ÁTRIOS'), qrX - 2.5, qrY + 5.5, { align: 'right' });
        pdfDoc.setFont('helvetica', 'normal').setFontSize(5.2).setTextColor(148, 163, 184);
        pdfDoc.text(normalizeForPdf(pdfT.scanMe || 'ESCANEAR PARA VERIFICAR'), qrX - 2.5, qrY + 9.5, { align: 'right' });
      } catch {}
    }

    pdfDoc.setFontSize(7).setFont('helvetica', 'italic').setTextColor(148, 163, 184);
    const dateFormatted = new Date().toLocaleDateString(targetLocale);
    const footerText = `Documento processado na nuvem via ÁTRIOS - Segurança e Transparência | Gerado em ${dateFormatted}`;
    pdfDoc.text(footerText, pageWidth / 2, pageHeight - 6, { align: 'center' });
    pdfDoc.text(`${pageNumber} / ${totalPages}`, pageWidth - margin, pageHeight - 6, { align: 'right' });
  };

  // 1. TOP BRAND ACCENT BAR
  doc.setFillColor(colors.primary[0], colors.primary[1], colors.primary[2]);
  doc.rect(0, 0, pageWidth, 4.5, 'F');

  // 2. HEADER: COMPANY IDENTITY (LEFT)
  let companyX = margin;
  if (company.logo && company.logo.length > 50) {
    try {
      const format = company.logo.toLowerCase().includes('image/png') ? 'PNG' : 'JPEG';
      doc.addImage(company.logo, format, margin, 8, 45, 35, undefined, 'FAST');
      companyX = margin + 48;
    } catch {}
  }

  doc.setFont('helvetica', 'bold').setFontSize(20).setTextColor(15, 23, 42);
  const companyNameClean = normalizeForPdf((company.name || 'EMPRESA').toUpperCase());
  doc.text(companyNameClean, companyX, 16);

  doc.setFont('helvetica', 'normal').setFontSize(10.5).setTextColor(100, 116, 139);
  let companyY = 22.5;
  if (company.nif) {
    doc.text(`NIF: ${normalizeForPdf(company.nif)}`, companyX, companyY);
    companyY += 5.0;
  }
  doc.text(normalizeForPdf(company.email), companyX, companyY);
  companyY += 5.0;
  if (company.phone) {
    doc.text(`${normalizeForPdf(pdfT.phone)}: ${normalizeForPdf(company.phone)}`, companyX, companyY);
    companyY += 5.0;
  }
  if (company.address) {
    const maxAddrWidth = Math.max(50, 132 - companyX);
    const splitAddr = doc.splitTextToSize(normalizeForPdf(company.address), maxAddrWidth);
    doc.text(splitAddr, companyX, companyY);
    companyY += (Array.isArray(splitAddr) ? splitAddr.length : 1) * 5.0;
  }
  if (company.website) {
    companyY += 1.5;
    const formattedWeb = company.website.toLowerCase().startsWith('http') || company.website.toLowerCase().startsWith('site') || company.website.toLowerCase().startsWith('www') 
      ? company.website 
      : `${pdfT.websiteLabel || 'Site'}: ${company.website}`;
    doc.text(normalizeForPdf(formattedWeb), companyX, companyY);
    companyY += 5.0;
  }

  // 3. HEADER: BUDGET INFO CARD (RIGHT)
  const cardX = 135;
  const cardW = 60;
  const cardH = 40;
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(cardX, 12, cardW, cardH, 2, 2, 'F');
  doc.setDrawColor(226, 232, 240).setLineWidth(0.3);
  doc.roundedRect(cardX, 12, cardW, cardH, 2, 2, 'S');

  // Left thick vertical indicator
  doc.setFillColor(colors.primary[0], colors.primary[1], colors.primary[2]);
  doc.rect(cardX, 12, 1.5, cardH, 'F');

  // Box content
  doc.setFont('helvetica', 'bold').setFontSize(7.5).setTextColor(colors.primary[0], colors.primary[1], colors.primary[2]);
  const isApproved = budget.status === BudgetStatus.APPROVED || budget.status === BudgetStatus.COMPLETED;
  const pdfDocTitle = isApproved ? (pdfT.orderSingle || 'Pedido') : (pdfT.budgetSingle || 'Orçamento');
  doc.text(normalizeForPdf(pdfDocTitle.toUpperCase()), cardX + 5, 18);

  doc.setFont('text', 'bold').setFontSize(11).setTextColor(15, 23, 42);
  doc.text(`#${budget.id.toUpperCase()}`, cardX + 5, 24.5);

  doc.setFont('helvetica', 'normal').setFontSize(7.2).setTextColor(100, 116, 139);
  doc.text(`${normalizeForPdf(pdfT.date)}: ${new Date(budget.createdAt).toLocaleDateString(targetLocale)}`, cardX + 5, 31);
  if (budget.validity) {
    doc.text(`${normalizeForPdf(pdfT.estimateValidity)}: ${normalizeForPdf(budget.validity)}`, cardX + 5, 36.5);
  }

  // Status Field
  const statusY = budget.validity ? 42 : 36.5;
  doc.setFont('helvetica', 'normal').setFontSize(7.2).setTextColor(100, 116, 139);
  doc.text(`${normalizeForPdf(pdfT.budgetStatusLabel || 'Estado')}:`, cardX + 5, statusY);
  
  const statusText = normalizeForPdf(getTranslatedBudgetStatus(budget.status, pdfT));
  if (isApproved) {
    doc.setFont('helvetica', 'bold').setTextColor(16, 185, 129);
  } else if (budget.status === BudgetStatus.REJECTED) {
    doc.setFont('helvetica', 'bold').setTextColor(239, 68, 68);
  } else {
    doc.setFont('helvetica', 'bold').setTextColor(245, 158, 11);
  }
  doc.text(statusText, cardX + 5 + doc.getTextWidth(`${normalizeForPdf(pdfT.budgetStatusLabel || 'Estado')}: `), statusY);
  doc.setFont('helvetica', 'normal').setTextColor(100, 116, 139);

  // 4. SIDE-BY-SIDE PANELS (CLIENTS & PROJECT DETAILS)
  const panelY = 54;
  const panelW = 87;
  const panelH = 46;

  // --- LEFT CARD: CLIENT SPECIFICATIONS ---
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(margin, panelY, panelW, panelH, 2, 2, 'F');
  doc.setDrawColor(241, 245, 249).setLineWidth(0.2);
  doc.roundedRect(margin, panelY, panelW, panelH, 2, 2, 'S');

  doc.setFont('helvetica', 'bold').setFontSize(7).setTextColor(100, 116, 139);
  doc.text(normalizeForPdf((pdfT.clientIdentification || 'Identificação do Cliente').toUpperCase()), margin + 5, panelY + 6);
  doc.setDrawColor(226, 232, 240).line(margin + 5, panelY + 8, margin + panelW - 5, panelY + 8);

  doc.setFont('helvetica', 'bold').setFontSize(9.5).setTextColor(15, 23, 42);
  doc.text(normalizeForPdf(budget.clientName), margin + 5, panelY + 14);

  doc.setFont('helvetica', 'normal').setFontSize(8).setTextColor(71, 85, 105);
  let clientRowY = panelY + 20;
  doc.text(`${normalizeForPdf(pdfT.contactName)}: ${normalizeForPdf(budget.contactName)}`, margin + 5, clientRowY);
  clientRowY += 4.5;
  doc.text(`${normalizeForPdf(pdfT.phone)}: ${normalizeForPdf(budget.contactPhone)}`, margin + 5, clientRowY);
  clientRowY += 4.5;
  if (budget.clientNif) {
    doc.text(`${normalizeForPdf(pdfT.clientNif)}: ${normalizeForPdf(budget.clientNif)}`, margin + 5, clientRowY);
  }

  // --- RIGHT CARD: PROJECT DETAILS & SERVICES ---
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(108, panelY, panelW, panelH, 2, 2, 'F');
  doc.setDrawColor(241, 245, 249).setLineWidth(0.2);
  doc.roundedRect(108, panelY, panelW, panelH, 2, 2, 'S');

  doc.setFont('helvetica', 'bold').setFontSize(7).setTextColor(100, 116, 139);
  doc.text(normalizeForPdf((pdfT.workLocation || 'Local da Obra').toUpperCase()), 113, panelY + 6);
  doc.setDrawColor(226, 232, 240).line(113, panelY + 8, 108 + panelW - 5, panelY + 8);

  doc.setFont('helvetica', 'normal').setFontSize(8).setTextColor(15, 23, 42);
  const workLocAddress = `${normalizeForPdf(budget.workLocation)}, ${normalizeForPdf(budget.workNumber)}`;
  const splitWorkLoc = doc.splitTextToSize(workLocAddress, 77);
  doc.text(splitWorkLoc, 113, panelY + 14);

  let siteRowY = panelY + 14 + (splitWorkLoc.length * 4);
  doc.setFontSize(8).setTextColor(71, 85, 105).text(normalizeForPdf(budget.workPostalCode), 113, siteRowY);

  // Responsive Pill Badges for Services
  if (budget.servicesSelected && budget.servicesSelected.length > 0) {
    doc.setFont('helvetica', 'bold').setFontSize(6.5).setTextColor(100, 116, 139);
    doc.text(normalizeForPdf(pdfT.servicesToPerform || 'Serviços a realizar:'), 113, siteRowY + 5);

    let pillX = 113;
    let pillY = siteRowY + 10.5;
    doc.setFont('helvetica', 'bold').setFontSize(6.5);
    
    budget.servicesSelected.forEach((serviceId) => {
      const label = normalizeForPdf(pdfT[`service_${serviceId}` as keyof typeof pdfT] || serviceId);
      const textWidth = doc.getTextWidth(label);
      const pillW = textWidth + 6;
      
      if (pillX + pillW > 108 + panelW - 4) {
        pillX = 113;
        pillY += 5.5;
      }
      
      if (pillY < panelY + panelH - 2) {
        doc.setFillColor(241, 245, 249);
        doc.roundedRect(pillX, pillY - 4.2, pillW, 5.5, 1, 1, 'F');
        
        doc.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2]);
        doc.text(label, pillX + 3, pillY - 0.4);
        
        pillX += pillW + 2.5;
      }
    });
  }

  // 5. ITEMIZED SERVICES TABLE
  autoTable(doc, {
    startY: panelY + panelH + 7,
    head: [[
      normalizeForPdf(pdfT.description), 
      normalizeForPdf(pdfT.quantity), 
      normalizeForPdf(pdfT.unitPrice), 
      normalizeForPdf(pdfT.unit), 
      normalizeForPdf(pdfT.total)
    ]],
    body: budget.items.map(i => [
      normalizeForPdf(i.description), 
      i.quantity, 
      `${(i.pricePerUnit * currencyInfo.rate).toFixed(2)} ${currencyInfo.code}`, 
      normalizeForPdf(i.unit), 
      `${(i.total * currencyInfo.rate).toFixed(2)} ${currencyInfo.code}`
    ]),
    theme: 'grid',
    styles: {
      fontSize: 8,
      font: 'helvetica',
      cellPadding: 3.5,
    },
    headStyles: { 
      fillColor: colors.primary as any, 
      textColor: [255, 255, 255],
      fontStyle: 'bold', 
      fontSize: 8.5, 
      halign: 'center',
      valign: 'middle'
    },
    bodyStyles: { 
      textColor: [71, 85, 105],
      lineColor: [241, 245, 249],
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    columnStyles: {
      0: { cellWidth: 'auto', halign: 'left' },
      1: { halign: 'center', cellWidth: 15 },
      2: { halign: 'right', cellWidth: 25 },
      3: { halign: 'center', cellWidth: 15 },
      4: { halign: 'right', cellWidth: 25 }
    },
    margin: { left: margin, right: margin }
  });

  // 6. TOTALS & LOWER MEMORANDUM SECTION
  const finalY = (doc as any).lastAutoTable.finalY || 120;
  let sumY = finalY + 12;
  if (sumY + 45 > pageHeight) { 
    doc.addPage(); 
    sumY = 25; 
  }

  const subTotal = budget.items.reduce((s, i) => s + i.total, 0);
  const ivaVal = budget.includeIva ? (subTotal * budget.ivaPercentage) / 100 : 0;
  const grandTotal = subTotal + ivaVal;

  // --- LEFT COLUMN: OBSERVATIONS & REMARKS ---
  let leftY = sumY;
  if (budget.observations) {
    const obsLines = doc.splitTextToSize(normalizeForPdf(budget.observations), 101);
    const obsHeight = (obsLines.length * 4.5) + 10;
    
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(15, leftY - 4, 110, obsHeight, 1.5, 1.5, 'F');
    
    doc.setFillColor(colors.primary[0], colors.primary[1], colors.primary[2]);
    doc.rect(15, leftY - 4, 1.2, obsHeight, 'F');
    
    doc.setFont('helvetica', 'bold').setFontSize(7.5).setTextColor(colors.primary[0], colors.primary[1], colors.primary[2]);
    doc.text(normalizeForPdf((pdfT.observationsLabel || 'Observações').toUpperCase()), 19, leftY);
    
    doc.setFont('helvetica', 'normal').setFontSize(7.5).setTextColor(100, 116, 139);
    doc.text(obsLines, 19, leftY + 4.5);
  }

  // --- RIGHT COLUMN: TOTALS ---
  let rightY = sumY;
  doc.setFont('helvetica', 'normal').setFontSize(8).setTextColor(100, 116, 139);
  doc.text(normalizeForPdf(pdfT.subtotal), 135, rightY);
  doc.setFont('helvetica', 'bold').setFontSize(8.5).setTextColor(15, 23, 42);
  doc.text(`${(subTotal * currencyInfo.rate).toFixed(2)} ${currencyInfo.code}`, 195, rightY, { align: 'right' });
  
  rightY += 5.5;

  if (budget.includeIva) {
    doc.setFont('helvetica', 'normal').setFontSize(8).setTextColor(100, 116, 139);
    doc.text(`${normalizeForPdf(pdfT.ivaValue)} (${budget.ivaPercentage}%):`, 135, rightY);
    doc.setFont('helvetica', 'bold').setFontSize(8.5).setTextColor(15, 23, 42);
    doc.text(`${(ivaVal * currencyInfo.rate).toFixed(2)} ${currencyInfo.code}`, 195, rightY, { align: 'right' });
    rightY += 5.5;
  }

  // Executive Total Badge
  doc.setFillColor(15, 23, 42);
  doc.roundedRect(135, rightY, 60, 14, 1.5, 1.5, 'F');
  
  doc.setFont('helvetica', 'bold').setFontSize(7).setTextColor(255, 255, 255);
  doc.text(normalizeForPdf(pdfT.total.toUpperCase()), 141, rightY + 5.5);
  
  doc.setFont('helvetica', 'bold').setFontSize(12.5).setTextColor(255, 255, 255);
  doc.text(`${(grandTotal * currencyInfo.rate).toFixed(2)} ${currencyInfo.code}`, 189, rightY + 9.2, { align: 'right' });

  rightY += 14;

  if (budget.paymentMethod) {
    const pmLines = doc.splitTextToSize(normalizeForPdf(budget.paymentMethod), 52);
    const pmHeight = (pmLines.length * 4.5) + 10;
    const pmY = rightY + 6;
    
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(135, pmY - 4, 60, pmHeight, 1.5, 1.5, 'F');
    
    doc.setFillColor(100, 116, 139);
    doc.rect(135, pmY - 4, 1.2, pmHeight, 'F');
    
    doc.setFont('helvetica', 'bold').setFontSize(7).setTextColor(15, 23, 42);
    doc.text(normalizeForPdf((pdfT.paymentMethodLabel || 'Método de Pagamento').toUpperCase()), 139, pmY);
    
    doc.setFont('helvetica', 'normal').setFontSize(7.5).setTextColor(71, 85, 105);
    doc.text(pmLines, 139, pmY + 4.5);
  }

  // 7. DRAW FOOTER WITH QR CODE ON ALL PAGES
  const totalPages = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    addFooter(doc, i, totalPages);
  }

  // 8. SAVE DOCUMENT
  const fileNamePrefix = isApproved ? 'Atrios_Pedido' : 'Atrios_Orcamento';
  const langSuffix = targetLocale.split('-')[0].toUpperCase();
  doc.save(`${fileNamePrefix}_${normalizeForPdf(budget.clientName).replace(/\s/g, '_')}_${budget.id}_${langSuffix}.pdf`);
  
  if (import.meta.env.VITE_GA_MEASUREMENT_ID || 'G-L75RSF4D1Y') {
    ReactGA.event({
      category: 'Export',
      action: 'Download Budget PDF',
      label: `${budget.clientName} (${targetLocale})`
    });
  }
}

/**
 * Generates and downloads Service Order (Ordem de Serviço) PDF in any of the 9 languages
 */
export async function generateServiceOrderPDF(rawBudget: Budget, options: PdfExportOptions): Promise<void> {
  const { company, currencyCode = 'EUR', activeQrCode, onProgress } = options;
  const targetLocale: Locale = options.targetLocale || 'pt-PT';
  const pdfT = translations[targetLocale] || translations['pt-PT'];

  if (onProgress) onProgress(`Preparando Ordem de Serviço em ${SUPPORTED_PDF_LANGUAGES.find(l => l.code === targetLocale)?.label || targetLocale}...`);

  let budget = rawBudget;
  if (options.autoTranslateContent) {
    if (onProgress) onProgress(`Traduzindo especificações e observações técnicas...`);
    try {
      budget = await translateBudgetContent(rawBudget, targetLocale);
    } catch (e) {
      console.warn('Erro na tradução automática da OS:', e);
    }
  }

  if (onProgress) onProgress(`Formatando documento técnico...`);

  const doc = new jsPDF();
  const colors = getPdfColors(company.pdfTemplate);
  const pageHeight = doc.internal.pageSize.getHeight();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 15;
  const usableWidth = pageWidth - (margin * 2);

  const addFooter = (pdfDoc: any, pageNumber: number, totalPages: number) => {
    if (activeQrCode && activeQrCode.length > 50) {
      try {
        const qrFormat = activeQrCode.toLowerCase().includes('image/png') ? 'PNG' : 'JPEG';
        const qrSize = 14;
        const qrX = pageWidth - margin - qrSize;
        const qrY = pageHeight - 28;
        pdfDoc.addImage(activeQrCode, qrFormat, qrX, qrY, qrSize, qrSize, undefined, 'FAST');

        pdfDoc.setFont('helvetica', 'bold').setFontSize(5.8).setTextColor(71, 85, 105);
        pdfDoc.text(normalizeForPdf('CERTIFICADO ÁTRIOS'), qrX - 2.5, qrY + 5.5, { align: 'right' });
        pdfDoc.setFont('helvetica', 'normal').setFontSize(5.2).setTextColor(148, 163, 184);
        pdfDoc.text(normalizeForPdf(pdfT.scanMe || 'ESCANEAR PARA VERIFICAR'), qrX - 2.5, qrY + 9.5, { align: 'right' });
      } catch {}
    }

    pdfDoc.setFontSize(7).setFont('helvetica', 'italic').setTextColor(148, 163, 184);
    const footerText = `Ordem de Serviço - ÁTRIOS | Segurança & Transparência | Gerado em ${new Date().toLocaleDateString(targetLocale)}`;
    pdfDoc.text(footerText, pageWidth / 2, pageHeight - 6, { align: 'center' });
    pdfDoc.text(`${pageNumber} / ${totalPages}`, pageWidth - margin, pageHeight - 6, { align: 'right' });
  };

  // 1. TOP ACCENT BAR
  doc.setFillColor(colors.primary[0], colors.primary[1], colors.primary[2]); 
  doc.rect(0, 0, pageWidth, 4.5, 'F');

  // 2. HEADER: COMPANY IDENTITY
  let companyX = margin;
  if (company.logo && company.logo.length > 50) {
    try {
      const format = company.logo.toLowerCase().includes('image/png') ? 'PNG' : 'JPEG';
      doc.addImage(company.logo, format, margin, 8, 45, 35, undefined, 'FAST');
      companyX = margin + 48;
    } catch {}
  }

  doc.setFont('helvetica', 'bold').setFontSize(20).setTextColor(15, 23, 42);
  const companyNameClean = normalizeForPdf((company.name || 'EMPRESA').toUpperCase());
  doc.text(companyNameClean, companyX, 16);

  doc.setFont('helvetica', 'normal').setFontSize(10.5).setTextColor(100, 116, 139);
  let companyY = 22.5;
  if (company.nif) {
    doc.text(`NIF: ${normalizeForPdf(company.nif)}`, companyX, companyY);
    companyY += 5.0;
  }
  doc.text(normalizeForPdf(company.email), companyX, companyY);
  companyY += 5.0;
  if (company.phone) {
    doc.text(`${normalizeForPdf(pdfT.phone)}: ${normalizeForPdf(company.phone)}`, companyX, companyY);
    companyY += 5.0;
  }
  if (company.address) {
    const maxAddrWidth = Math.max(50, 132 - companyX);
    const splitAddr = doc.splitTextToSize(normalizeForPdf(company.address), maxAddrWidth);
    doc.text(splitAddr, companyX, companyY);
    companyY += (Array.isArray(splitAddr) ? splitAddr.length : 1) * 5.0;
  }
  if (company.website) {
    companyY += 1.5;
    const formattedWeb = company.website.toLowerCase().startsWith('http') || company.website.toLowerCase().startsWith('site') || company.website.toLowerCase().startsWith('www') 
      ? company.website 
      : `${pdfT.websiteLabel || 'Site'}: ${company.website}`;
    doc.text(normalizeForPdf(formattedWeb), companyX, companyY);
    companyY += 5.0;
  }

  // 3. HEADER: OS DETAILS CARD
  const cardX = 135;
  const cardW = 60;
  const cardH = 40;
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(cardX, 12, cardW, cardH, 2, 2, 'F');
  doc.setDrawColor(226, 232, 240).setLineWidth(0.3);
  doc.roundedRect(cardX, 12, cardW, cardH, 2, 2, 'S');

  doc.setFillColor(colors.primary[0], colors.primary[1], colors.primary[2]);
  doc.rect(cardX, 12, 1.5, cardH, 'F');

  doc.setFont('helvetica', 'bold').setFontSize(7.5).setTextColor(colors.primary[0], colors.primary[1], colors.primary[2]);
  const osTitle = pdfT.serviceOrderTitle || pdfT.orderSingle || 'Ordem de Serviço';
  doc.text(normalizeForPdf(osTitle.toUpperCase()), cardX + 5, 18);

  doc.setFont('text', 'bold').setFontSize(11).setTextColor(15, 23, 42);
  doc.text(`#OS-${budget.id.toUpperCase()}`, cardX + 5, 24.5);

  doc.setFont('helvetica', 'normal').setFontSize(7.2).setTextColor(100, 116, 139);
  doc.text(`${normalizeForPdf(pdfT.date)}: ${new Date().toLocaleDateString(targetLocale)}`, cardX + 5, 31);

  // Status Field
  const statusY = 36.5;
  doc.setFont('helvetica', 'normal').setFontSize(7.2).setTextColor(100, 116, 139);
  doc.text(`${normalizeForPdf(pdfT.budgetStatusLabel || 'Estado')}:`, cardX + 5, statusY);
  
  const statusText = normalizeForPdf(getTranslatedBudgetStatus(budget.status, pdfT));
  if (budget.status === BudgetStatus.APPROVED || budget.status === BudgetStatus.COMPLETED) {
    doc.setFont('helvetica', 'bold').setTextColor(16, 185, 129);
  } else if (budget.status === BudgetStatus.REJECTED) {
    doc.setFont('helvetica', 'bold').setTextColor(239, 68, 68);
  } else {
    doc.setFont('helvetica', 'bold').setTextColor(245, 158, 11);
  }
  doc.text(statusText, cardX + 5 + doc.getTextWidth(`${normalizeForPdf(pdfT.budgetStatusLabel || 'Estado')}: `), statusY);
  doc.setFont('helvetica', 'normal').setTextColor(100, 116, 139);

  // 4. SIDE-BY-SIDE PANELS
  const panelY = 54;
  const panelW = 87;
  const panelH = 46;

  // --- LEFT CARD: CLIENT SPECS ---
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(margin, panelY, panelW, panelH, 2, 2, 'F');
  doc.setDrawColor(241, 245, 249).setLineWidth(0.2);
  doc.roundedRect(margin, panelY, panelW, panelH, 2, 2, 'S');

  doc.setFont('helvetica', 'bold').setFontSize(7).setTextColor(100, 116, 139);
  doc.text(normalizeForPdf((pdfT.contactInfoLabel || pdfT.clientIdentification || 'Dados do Cliente').toUpperCase()), margin + 5, panelY + 6);
  doc.setDrawColor(226, 232, 240).line(margin + 5, panelY + 8, margin + panelW - 5, panelY + 8);

  doc.setFont('helvetica', 'bold').setFontSize(9.5).setTextColor(15, 23, 42);
  doc.text(normalizeForPdf(budget.clientName), margin + 5, panelY + 14);

  doc.setFont('helvetica', 'normal').setFontSize(8).setTextColor(71, 85, 105);
  let clientRowY = panelY + 20;
  doc.text(`${normalizeForPdf(pdfT.contactName)}: ${normalizeForPdf(budget.contactName)}`, margin + 5, clientRowY);
  clientRowY += 4.5;
  doc.text(`${normalizeForPdf(pdfT.phone)}: ${normalizeForPdf(budget.contactPhone)}`, margin + 5, clientRowY);
  clientRowY += 4.5;
  if (budget.clientNif) {
    doc.text(`${normalizeForPdf(pdfT.clientNif)}: ${normalizeForPdf(budget.clientNif)}`, margin + 5, clientRowY);
  }

  // --- RIGHT CARD: WORK SITE ---
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(108, panelY, panelW, panelH, 2, 2, 'F');
  doc.setDrawColor(241, 245, 249).setLineWidth(0.2);
  doc.roundedRect(108, panelY, panelW, panelH, 2, 2, 'S');

  doc.setFont('helvetica', 'bold').setFontSize(7).setTextColor(100, 116, 139);
  doc.text(normalizeForPdf((pdfT.workLocation || 'Local da Obra').toUpperCase()), 113, panelY + 6);
  doc.setDrawColor(226, 232, 240).line(113, panelY + 8, 108 + panelW - 5, panelY + 8);

  doc.setFont('helvetica', 'normal').setFontSize(8).setTextColor(15, 23, 42);
  const workLocAddress = `${normalizeForPdf(budget.workLocation)}, ${normalizeForPdf(budget.workNumber)}`;
  const splitWorkLoc = doc.splitTextToSize(workLocAddress, 77);
  doc.text(splitWorkLoc, 113, panelY + 14);

  let siteRowY = panelY + 14 + (splitWorkLoc.length * 4);
  doc.setFontSize(8).setTextColor(71, 85, 105).text(normalizeForPdf(budget.workPostalCode), 113, siteRowY);

  if (budget.servicesSelected && budget.servicesSelected.length > 0) {
    doc.setFont('helvetica', 'bold').setFontSize(6.5).setTextColor(100, 116, 139);
    doc.text(normalizeForPdf(pdfT.servicesToPerform || 'Serviços a realizar:'), 113, siteRowY + 5);

    let pillX = 113;
    let pillY = siteRowY + 10.5;
    doc.setFont('helvetica', 'bold').setFontSize(6.5);
    
    budget.servicesSelected.forEach((serviceId) => {
      const label = normalizeForPdf(pdfT[`service_${serviceId}` as keyof typeof pdfT] || serviceId);
      const textWidth = doc.getTextWidth(label);
      const pillW = textWidth + 6;
      
      if (pillX + pillW > 108 + panelW - 4) {
        pillX = 113;
        pillY += 5.5;
      }
      
      if (pillY < panelY + panelH - 2) {
        doc.setFillColor(241, 245, 249);
        doc.roundedRect(pillX, pillY - 4.2, pillW, 5.5, 1, 1, 'F');
        
        doc.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2]);
        doc.text(label, pillX + 3, pillY - 0.4);
        
        pillX += pillW + 2.5;
      }
    });
  }

  // 5. MATERIALS & TASKS TABLE
  autoTable(doc, {
    startY: panelY + panelH + 7,
    head: [[
      normalizeForPdf(pdfT.description), 
      normalizeForPdf(pdfT.quantity), 
      normalizeForPdf(pdfT.unit)
    ]],
    body: budget.items.map(i => [
      normalizeForPdf(i.description), 
      i.quantity, 
      normalizeForPdf(i.unit)
    ]),
    theme: 'grid',
    styles: {
      fontSize: 8,
      font: 'helvetica',
      cellPadding: 3.5,
    },
    headStyles: { 
      fillColor: colors.primary as any, 
      textColor: [255, 255, 255],
      fontStyle: 'bold', 
      fontSize: 8.5, 
      halign: 'center',
      valign: 'middle'
    },
    bodyStyles: { 
      textColor: [71, 85, 105],
      lineColor: [241, 245, 249],
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    columnStyles: {
      0: { cellWidth: 'auto', halign: 'left' },
      1: { halign: 'center', cellWidth: 20 },
      2: { halign: 'center', cellWidth: 25 }
    },
    margin: { left: margin, right: margin }
  });

  // 6. TECHNICAL OBSERVATIONS
  const finalY = (doc as any).lastAutoTable.finalY || 120;
  let obsY = finalY + 12;

  if (budget.observations) {
    const obsLines = doc.splitTextToSize(normalizeForPdf(budget.observations), usableWidth - 10);
    const obsHeight = (obsLines.length * 4.5) + 10;
    
    if (obsY + obsHeight + 6 > pageHeight) {
      doc.addPage();
      obsY = 25;
    }
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(15, obsY - 4, usableWidth, obsHeight, 1.5, 1.5, 'F');
    
    doc.setFillColor(colors.primary[0], colors.primary[1], colors.primary[2]);
    doc.rect(15, obsY - 4, 1.2, obsHeight, 'F');
    
    doc.setFont('helvetica', 'bold').setFontSize(7.5).setTextColor(colors.primary[0], colors.primary[1], colors.primary[2]);
    doc.text(normalizeForPdf((pdfT.observationsLabel || 'Observações Técnicas').toUpperCase()), 20, obsY);
    
    doc.setFont('helvetica', 'normal').setFontSize(8).setTextColor(100, 116, 139);
    doc.text(obsLines, 20, obsY + 5);
    
    obsY += obsHeight + 6;
  }

  // 7. SIGNATURE FIELDS
  let sigY = obsY + 14;
  if (sigY + 36 > pageHeight) { 
    doc.addPage(); 
    sigY = 35; 
  }
  
  doc.setDrawColor(226, 232, 240).setLineWidth(0.4);
  doc.line(margin + 5, sigY, margin + 70, sigY);
  doc.line(pageWidth - margin - 70, sigY, pageWidth - margin - 5, sigY);
  
  doc.setFont('helvetica', 'bold').setFontSize(7).setTextColor(100, 116, 139);
  doc.text(normalizeForPdf((pdfT as any).techSignature || "ASSINATURA DO TECNICO"), margin + 37.5, sigY + 5, { align: 'center' });
  doc.text(normalizeForPdf((pdfT as any).clientSignature || "ASSINATURA DO CLIENTE"), pageWidth - margin - 37.5, sigY + 5, { align: 'center' });

  doc.setFont('helvetica', 'normal').setFontSize(6).setTextColor(148, 163, 184);
  doc.text(normalizeForPdf((pdfT as any).techDeclaration || "Declaro a realizacao conforme os padroes tecnicos"), margin + 37.5, sigY + 8.5, { align: 'center' });
  doc.text(normalizeForPdf((pdfT as any).clientDeclaration || "Declaro a conformidade e recebimento dos servicos"), pageWidth - margin - 37.5, sigY + 8.5, { align: 'center' });

  // 8. FOOTER WITH QR CODE
  const totalPages = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    addFooter(doc, i, totalPages);
  }

  const langSuffix = targetLocale.split('-')[0].toUpperCase();
  doc.save(`OS_${normalizeForPdf(budget.clientName).replace(/\s/g, '_')}_${budget.id}_${langSuffix}.pdf`);
  
  if (import.meta.env.VITE_GA_MEASUREMENT_ID || 'G-L75RSF4D1Y') {
    ReactGA.event({
      category: 'Export',
      action: 'Download OS PDF',
      label: `${budget.clientName} (${targetLocale})`
    });
  }
}
