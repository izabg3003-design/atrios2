import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Budget, Company, CurrencyCode, BudgetStatus, CURRENCIES } from '../types';
import { Locale, translations } from '../translations';
import { generateCompanyQrCode } from './qrcode';

export const getPdfColors = (template: string = 'default') => {
  switch (template) {
    case 'blue_modern':
      return { primary: [37, 99, 235], secondary: [248, 250, 252], accent: [37, 99, 235] };
    case 'green_professional':
      return { primary: [22, 163, 74], secondary: [240, 253, 244], accent: [22, 163, 74] };
    case 'light_blue_clean':
      return { primary: [14, 165, 233], secondary: [240, 249, 255], accent: [14, 165, 233] };
    case 'dark_elegant':
      return { primary: [15, 23, 42], secondary: [248, 250, 252], accent: [71, 85, 105] };
    case 'modern_v2':
      return { primary: [79, 70, 229], secondary: [249, 250, 251], accent: [99, 102, 241] }; // Indigo
    default:
      return { primary: [245, 158, 11], secondary: [248, 250, 252], accent: [245, 158, 11] };
  }
};

export const normalizeForPdf = (text: string | undefined): string => {
  if (!text) return "";
  const ruMap: Record<string, string> = {
    'а':'a','б':'b','в':'v','г':'g','д':'d','е':'e','ё':'yo','ж':'zh','з':'z','и':'i','й':'y','к':'k','л':'l','м':'m','н':'n','о':'o','п':'p','р':'r','с':'s','т':'t','у':'u','ф':'f','х':'kh','ц':'ts','ч':'ch','ш':'sh','щ':'shch','ъ':'','ы':'y','ь':'','э':'e','ю':'yu','я':'ya',
    'А':'A','Б':'B','В':'V','Г':'G','Д':'D','Е':'E','Ё':'Yo','Ж':'Zh','З':'Z','И':'I','Й':'Y','К':'K','Л':'L','М':'M','Н':'N','О':'O','П':'P','Р':'R','С':'S','Т':'T','У':'U','Ф':'F','Х':'KH','Ц':'TS','CH':'CH','Ш':'SH','Щ':'SHCH','Ъ':'','Ы':'Y','Ь':'','Э':'E','Ю':'YU','Я':'YA'
  };
  let result = text;
  result = result.split('').map(char => ruMap[char] || char).join('');
  result = result.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  result = result.replace(/[^\x20-\x7E]/g, "");
  return result;
};

export const generateOfficialBudgetPDF = async (
  budget: Budget,
  company: Company,
  currencyCode: CurrencyCode | string = 'EUR',
  locale: Locale | string = 'pt-PT'
): Promise<jsPDF> => {
  const effectiveLocale = (locale as Locale) || 'pt-PT';
  const isNonLatin = ['ru-RU', 'hi-IN', 'bn-BD'].includes(effectiveLocale);
  const pdfT = isNonLatin ? translations['en-US'] : (translations[effectiveLocale] || translations['pt-PT']);

  // 1. Ensure company has a valid QR code pointing to Átrios Certificate
  let activeQrCode = company?.qrCode;
  if (!activeQrCode || activeQrCode.length < 50) {
    try {
      activeQrCode = await generateCompanyQrCode(company?.id || 'atrios-company', window.location.origin);
    } catch (e) {
      console.warn('Could not generate QR code for PDF:', e);
    }
  }

  const doc = new jsPDF();
  const colors = getPdfColors(company?.pdfTemplate || 'default');
  const currencyInfo = CURRENCIES[currencyCode] || CURRENCIES.EUR;
  const pageHeight = doc.internal.pageSize.getHeight();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 15;
  const usableWidth = pageWidth - (margin * 2);

  // Dynamic Footer on Every Page
  const addFooter = (doc: any, pageNumber: number, totalPages: number) => {
    // Bottom Right QR Code placed higher above the footer line
    if (activeQrCode && activeQrCode.length > 50) {
      try {
        const qrFormat = activeQrCode.toLowerCase().includes('image/png') ? 'PNG' : 'JPEG';
        const qrSize = 14;
        const qrX = pageWidth - margin - qrSize;
        const qrY = pageHeight - 28;
        doc.addImage(activeQrCode, qrFormat, qrX, qrY, qrSize, qrSize, undefined, 'FAST');

        doc.setFont('helvetica', 'bold').setFontSize(5.8).setTextColor(71, 85, 105);
        doc.text(normalizeForPdf('CERTIFICADO ATRIOS'), qrX - 2.5, qrY + 5.5, { align: 'right' });
        doc.setFont('helvetica', 'normal').setFontSize(5.2).setTextColor(148, 163, 184);
        doc.text(normalizeForPdf(pdfT.scanMe || 'Certificado Atrios Escanear'), qrX - 2.5, qrY + 9.5, { align: 'right' });
      } catch (err) {}
    }

    doc.setFontSize(7).setFont('helvetica', 'italic').setTextColor(148, 163, 184);
    const footerText = `Documento processado na nuvem via ÁTRIOS - Segurança e Transparência | Gerado em ${new Date().toLocaleString(locale)}`;
    doc.text(footerText, pageWidth / 2, pageHeight - 6, { align: 'center' });
    doc.text(`${pageNumber} / ${totalPages}`, pageWidth - margin, pageHeight - 6, { align: 'right' });
  };

  // 1. TOP BRAND ACCENT BAR
  doc.setFillColor(colors.primary[0], colors.primary[1], colors.primary[2]);
  doc.rect(0, 0, pageWidth, 4.5, 'F');

  // 2. HEADER: COMPANY IDENTITY (LEFT)
  let companyX = margin;
  if (company?.logo && company.logo.length > 50) {
    try {
      const format = company.logo.toLowerCase().includes('image/png') ? 'PNG' : 'JPEG';
      doc.addImage(company.logo, format, margin, 8, 45, 35, undefined, 'FAST');
      companyX = margin + 48;
    } catch (err) {
      console.warn('Could not add company logo image to PDF:', err);
    }
  }

  doc.setFont('helvetica', 'bold').setFontSize(20).setTextColor(15, 23, 42);
  const companyNameClean = normalizeForPdf((company?.name || 'EMPRESA PARCEIRA ATRIOS').toUpperCase());
  doc.text(companyNameClean, companyX, 16);

  doc.setFont('helvetica', 'normal').setFontSize(10.5).setTextColor(100, 116, 139);
  let companyY = 22.5;
  if (company?.nif) {
    doc.text(`NIF: ${normalizeForPdf(company.nif)}`, companyX, companyY);
    companyY += 5.0;
  }
  if (company?.email) {
    doc.text(normalizeForPdf(company.email), companyX, companyY);
    companyY += 5.0;
  }
  if (company?.phone) {
    doc.text(`${normalizeForPdf(pdfT.phone || 'Telefone')}: ${normalizeForPdf(company.phone)}`, companyX, companyY);
    companyY += 5.0;
  }
  if (company?.address) {
    const maxAddrWidth = Math.max(50, 132 - companyX);
    const splitAddr = doc.splitTextToSize(normalizeForPdf(company.address), maxAddrWidth);
    doc.text(splitAddr, companyX, companyY);
    companyY += (Array.isArray(splitAddr) ? splitAddr.length : 1) * 5.0;
  }
  if (company?.website) {
    companyY += 1.5;
    const formattedWeb = company.website.toLowerCase().startsWith('http') || company.website.toLowerCase().startsWith('site') || company.website.toLowerCase().startsWith('www') 
      ? company.website 
      : `${pdfT.websiteLabel || 'Website / Site'}: ${company.website}`;
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
  const pdfDocTitle = (budget.status === BudgetStatus.APPROVED || budget.status === BudgetStatus.COMPLETED)
    ? (pdfT.orderSingle || 'ENCOMENDA')
    : (pdfT.budgetSingle || 'ORÇAMENTO');
  doc.text(normalizeForPdf(pdfDocTitle.toUpperCase()), cardX + 5, 18);

  doc.setFont('text', 'bold').setFontSize(11).setTextColor(15, 23, 42);
  doc.text(`#${budget.id.toUpperCase()}`, cardX + 5, 24.5);

  doc.setFont('helvetica', 'normal').setFontSize(7.2).setTextColor(100, 116, 139);
  doc.text(`${normalizeForPdf(pdfT.date || 'Data')}: ${new Date(budget.createdAt).toLocaleDateString(locale)}`, cardX + 5, 31);
  if (budget.validity) {
    doc.text(`${normalizeForPdf(pdfT.estimateValidity || 'Validade do Orçamento')}: ${normalizeForPdf(budget.validity)}`, cardX + 5, 36.5);
  }

  // Status Field
  const statusY = budget.validity ? 42 : 36.5;
  doc.setFont('helvetica', 'normal').setFontSize(7.2).setTextColor(100, 116, 139);
  doc.text(`${normalizeForPdf(pdfT.statusLabel || 'Estado')}:`, cardX + 5, statusY);
  
  const getStatusText = (status: BudgetStatus) => {
    switch (status) {
      case BudgetStatus.PENDING: return pdfT.statusPending || 'Pendente';
      case BudgetStatus.APPROVED: return pdfT.statusApproved || 'Aprovado';
      case BudgetStatus.REJECTED: return pdfT.statusRejected || 'Recusado';
      case BudgetStatus.COMPLETED: return pdfT.statusApproved || 'Concluído';
      default: return status;
    }
  };

  const statusText = normalizeForPdf(getStatusText(budget.status));
  if (budget.status === BudgetStatus.APPROVED || budget.status === BudgetStatus.COMPLETED) {
    doc.setFont('helvetica', 'bold').setTextColor(16, 185, 129);
  } else if (budget.status === BudgetStatus.REJECTED) {
    doc.setFont('helvetica', 'bold').setTextColor(239, 68, 68);
  } else {
    doc.setFont('helvetica', 'bold').setTextColor(245, 158, 11);
  }
  doc.text(statusText, cardX + 5 + doc.getTextWidth(`${normalizeForPdf(pdfT.statusLabel || 'Estado')}: `), statusY);
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
  doc.text(normalizeForPdf((pdfT.clientIdentification || 'IDENTIFICAÇÃO DO CLIENTE').toUpperCase()), margin + 5, panelY + 6);
  doc.setDrawColor(226, 232, 240).line(margin + 5, panelY + 8, margin + panelW - 5, panelY + 8);

  doc.setFont('helvetica', 'bold').setFontSize(9.5).setTextColor(15, 23, 42);
  doc.text(normalizeForPdf(budget.clientName || 'Cliente Particular'), margin + 5, panelY + 14);

  doc.setFont('helvetica', 'normal').setFontSize(8).setTextColor(71, 85, 105);
  let clientRowY = panelY + 20;
  if (budget.contactName) {
    doc.text(`${normalizeForPdf(pdfT.contactName || 'Pessoa de Contacto')}: ${normalizeForPdf(budget.contactName)}`, margin + 5, clientRowY);
    clientRowY += 4.5;
  }
  if (budget.contactPhone) {
    doc.text(`${normalizeForPdf(pdfT.phone || 'Telefone')}: ${normalizeForPdf(budget.contactPhone)}`, margin + 5, clientRowY);
    clientRowY += 4.5;
  }
  if (budget.clientNif) {
    doc.text(`${normalizeForPdf(pdfT.clientNif || 'NIF')}: ${normalizeForPdf(budget.clientNif)}`, margin + 5, clientRowY);
  }

  // --- RIGHT CARD: PROJECT DETAILS & SERVICES ---
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(108, panelY, panelW, panelH, 2, 2, 'F');
  doc.setDrawColor(241, 245, 249).setLineWidth(0.2);
  doc.roundedRect(108, panelY, panelW, panelH, 2, 2, 'S');

  doc.setFont('helvetica', 'bold').setFontSize(7).setTextColor(100, 116, 139);
  doc.text(normalizeForPdf((pdfT.workLocation || 'LOCAL DA OBRA').toUpperCase()), 113, panelY + 6);
  doc.setDrawColor(226, 232, 240).line(113, panelY + 8, 108 + panelW - 5, panelY + 8);

  doc.setFont('helvetica', 'normal').setFontSize(8).setTextColor(15, 23, 42);
  const workLocAddress = budget.workNumber 
    ? `${normalizeForPdf(budget.workLocation || '')}, ${normalizeForPdf(budget.workNumber)}`
    : normalizeForPdf(budget.workLocation || 'Local da Obra');
  const splitWorkLoc = doc.splitTextToSize(workLocAddress, 77);
  doc.text(splitWorkLoc, 113, panelY + 14);

  let siteRowY = panelY + 14 + (splitWorkLoc.length * 4);
  if (budget.workPostalCode) {
    doc.setFontSize(8).setTextColor(71, 85, 105).text(normalizeForPdf(budget.workPostalCode), 113, siteRowY);
  }

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
      normalizeForPdf(pdfT.description || 'Descrição'), 
      normalizeForPdf(pdfT.quantity || 'Qtd'), 
      normalizeForPdf(pdfT.unitPrice || 'Preço Unitário'), 
      normalizeForPdf(pdfT.unit || 'Unid.'), 
      normalizeForPdf(pdfT.total || 'Total')
    ]],
    body: (budget.items || []).map(i => [
      normalizeForPdf(i.description), 
      i.quantity, 
      `${((i.pricePerUnit || 0) * currencyInfo.rate).toFixed(2)} ${currencyInfo.code}`, 
      normalizeForPdf(i.unit || 'unidade'), 
      `${(((i.total ?? (i.quantity * i.pricePerUnit)) || 0) * currencyInfo.rate).toFixed(2)} ${currencyInfo.code}`
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

  const subTotal = (budget.items || []).reduce((s, i) => s + (i.total || (i.quantity * i.pricePerUnit) || 0), 0);
  const ivaPercentage = budget.ivaPercentage ?? 23;
  const ivaVal = budget.includeIva ? (subTotal * ivaPercentage) / 100 : 0;
  const grandTotal = budget.totalAmount || (subTotal + ivaVal);

  // --- LEFT COLUMN: ADMINISTRATIVE SPECS & REMARKS (x=15, width=110) ---
  let leftY = sumY;

  if (budget.observations) {
    const obsLines = doc.splitTextToSize(normalizeForPdf(budget.observations), 101);
    const obsHeight = (obsLines.length * 4.5) + 10;
    
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(15, leftY - 4, 110, obsHeight, 1.5, 1.5, 'F');
    
    doc.setFillColor(colors.primary[0], colors.primary[1], colors.primary[2]);
    doc.rect(15, leftY - 4, 1.2, obsHeight, 'F');
    
    doc.setFont('helvetica', 'bold').setFontSize(7.5).setTextColor(colors.primary[0], colors.primary[1], colors.primary[2]);
    doc.text(normalizeForPdf((pdfT.observationsLabel || 'OBSERVAÇÕES / DESCRIÇÃO ADICIONAL').toUpperCase()), 19, leftY);
    
    doc.setFont('helvetica', 'normal').setFontSize(7.5).setTextColor(100, 116, 139);
    doc.text(obsLines, 19, leftY + 4.5);
  }

  // --- RIGHT COLUMN: CONCISE TOTALS (x=135, width=60) ---
  let rightY = sumY;

  doc.setFont('helvetica', 'normal').setFontSize(8).setTextColor(100, 116, 139);
  doc.text(normalizeForPdf(pdfT.subtotal || 'Subtotal'), 135, rightY);
  doc.setFont('helvetica', 'bold').setFontSize(8.5).setTextColor(15, 23, 42);
  doc.text(`${(subTotal * currencyInfo.rate).toFixed(2)} ${currencyInfo.code}`, 195, rightY, { align: 'right' });
  
  rightY += 5.5;

  if (budget.includeIva) {
    doc.setFont('helvetica', 'normal').setFontSize(8).setTextColor(100, 116, 139);
    doc.text(`${normalizeForPdf(pdfT.ivaValue || 'Valor do IVA')} (${ivaPercentage}%):`, 135, rightY);
    doc.setFont('helvetica', 'bold').setFontSize(8.5).setTextColor(15, 23, 42);
    doc.text(`${(ivaVal * currencyInfo.rate).toFixed(2)} ${currencyInfo.code}`, 195, rightY, { align: 'right' });
    rightY += 5.5;
  }

  // Massive Executive Total Badge
  doc.setFillColor(15, 23, 42); // Black/Slate-900 Elegant Badge
  doc.roundedRect(135, rightY, 60, 14, 1.5, 1.5, 'F');
  
  doc.setFont('helvetica', 'bold').setFontSize(7).setTextColor(255, 255, 255);
  doc.text(normalizeForPdf((pdfT.total || 'TOTAL').toUpperCase()), 141, rightY + 5.5);
  
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
    doc.text(normalizeForPdf((pdfT.paymentMethodLabel || 'MÉTODO DE PAGAMENTO').toUpperCase()), 139, pmY);
    
    doc.setFont('helvetica', 'normal').setFontSize(7.5).setTextColor(71, 85, 105);
    doc.text(pmLines, 139, pmY + 4.5);
  }

  // 7. DRAW FOOTER WITH QR CODE ON ALL PAGES
  const totalPages = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    addFooter(doc, i, totalPages);
  }

  return doc;
};
