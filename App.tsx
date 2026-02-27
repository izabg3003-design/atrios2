import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  LayoutDashboard, 
  PlusCircle, 
  FileText, 
  Settings, 
  LogOut, 
  Search, 
  Bell, 
  User, 
  ChevronRight, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Download,
  Crown,
  Construction,
  Globe,
  Wallet,
  CreditCard as PaymentIcon,
  Filter,
  Coins,
  X,
  QrCode,
  BarChart3,
  Lock,
  Unlock,
  Headphones,
  MessageSquare,
  ShieldCheck,
  Mail
} from 'lucide-react';
import { Company, Budget, PlanType, BudgetStatus, CurrencyCode, CURRENCIES, GlobalNotification, SupportMessage, Transaction } from './types';
import { 
  getStoredCompanies, 
  saveCompany, 
  getStoredBudgets, 
  saveBudget, 
  getPdfDownloadCount, 
  incrementPdfDownloadCount,
  getGlobalNotifications,
  getMessages,
  markMessagesAsRead,
  saveTransaction,
  hydrateLocalData,
  saveSession,
  getSession,
  generateShortId
} from './services/storage';
import { supabase } from './services/supabase';
import { FREE_PDF_LIMIT } from './constants';
import { Locale, translations } from './translations';
import Dashboard from './components/Dashboard';
import BudgetForm from './components/BudgetForm';
import PremiumBanner from './components/PremiumBanner';
import PaymentManager from './components/PaymentManager';
import ExpenseManager from './components/ExpenseManager';
import Plans from './components/Plans';
import MasterPanel from './components/MasterPanel';
import Reports from './components/Reports';
import SupportChat from './components/SupportChat';
import WelcomeScreen from './components/WelcomeScreen';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const App: React.FC = () => {
  const session = useMemo(() => getSession(), []);
  const [locale, setLocale] = useState<Locale>(() => {
    if (session?.companyId) {
      const companies = getStoredCompanies();
      const user = companies.find(c => c.id === session.companyId);
      return (user?.lastLocale as Locale) || 'pt-PT';
    }
    return 'pt-PT';
  });
  const [currencyCode, setCurrencyCode] = useState<CurrencyCode>(session?.currencyCode as any || 'EUR');
  const t = translations[locale];

  const [view, setView] = useState<'landing' | 'login' | 'signup' | 'verify' | 'forgot-password' | 'app' | 'master'>(session?.view as any || 'landing');
  const [activeTab, setActiveTab] = useState<'dashboard' | 'budgets' | 'plans' | 'settings' | 'reports'>(session?.activeTab as any || 'dashboard');
  const [currentUser, setCurrentUser] = useState<Company | null>(() => {
    if (session?.companyId) {
      const companies = getStoredCompanies();
      return companies.find(c => c.id === session.companyId) || null;
    }
    return null;
  });
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [isEditingBudget, setIsEditingBudget] = useState(false);
  const [selectedBudget, setSelectedBudget] = useState<Budget | undefined>(undefined);
  const [showPaymentManager, setShowPaymentManager] = useState(false);
  const [showExpenseManager, setShowExpenseManager] = useState(false);
  const [budgetFilter, setBudgetFilter] = useState<BudgetStatus | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  const [showWelcome, setShowWelcome] = useState(false);
  const [activeNotification, setActiveNotification] = useState<GlobalNotification | null>(null);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  
  const [showSupportChat, setShowSupportChat] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNewMessageAlert, setShowNewMessageAlert] = useState(false);
  const [showUnlockAlert, setShowUnlockAlert] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (isEditingBudget) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      const mainContent = document.querySelector('main > div');
      if (mainContent) mainContent.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [isEditingBudget]);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [companyName, setCompanyName] = useState('');

  const [settingsLogo, setSettingsLogo] = useState<string | undefined>(undefined);
  const [settingsCompanyName, setSettingsCompanyName] = useState('');
  const [settingsQrCode, setSettingsQrCode] = useState<string | undefined>(undefined);
  const [settingsAddress, setSettingsAddress] = useState('');
  const [settingsNif, setSettingsNif] = useState('');
  const [settingsPhone, setSettingsPhone] = useState('');
  
  const [showSettingsConfirmModal, setShowSettingsConfirmModal] = useState(false);
  const [showLegalModal, setShowLegalModal] = useState<'terms' | 'privacy' | null>(null);

  const currentUserRef = useRef<Company | null>(null);

  useEffect(() => {
    if (currentUser && view === 'app') {
      // Subscrição para mudanças na própria empresa (ex: desbloqueio aprovado)
      const companyChannel = supabase
        .channel(`user-company-${currentUser.id}`)
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'companies',
            filter: `id=eq.${currentUser.id}`
          },
          (payload) => {
            const updated = payload.new as Company;
            if (!updated) return;
            if (!currentUserRef.current?.canEditSensitiveData && updated.canEditSensitiveData) {
              setShowUnlockAlert(true);
              setTimeout(() => setShowUnlockAlert(false), 8000);
            }
            
            // Atualizar localStorage e estado
            const companies = getStoredCompanies();
            const idx = companies.findIndex(c => c.id === updated.id);
            if (idx > -1) {
              companies[idx] = updated;
              localStorage.setItem('atrios_companies', JSON.stringify(companies));
            }
            
            setCurrentUser(updated);
            currentUserRef.current = updated;
          }
        )
        .subscribe();

      // Subscrição para novas mensagens do Master
      const msgChannel = supabase
        .channel(`user-messages-${currentUser.id}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'messages',
            filter: `companyId=eq.${currentUser.id}`
          },
          (payload) => {
            const newMessage = payload.new as SupportMessage;
            if (!newMessage || !newMessage.id) return;
            
            // Atualizar localStorage
            const allMsgs = getMessages();
            const existingIdx = allMsgs.findIndex(m => m.id === newMessage.id);
            if (existingIdx === -1) {
              allMsgs.push(newMessage);
            } else {
              allMsgs[existingIdx] = { ...allMsgs[existingIdx], ...newMessage };
            }
            localStorage.setItem('atrios_messages', JSON.stringify(allMsgs));

            if (newMessage.senderRole === 'master' && !newMessage.read && payload.eventType === 'INSERT') {
              setShowNewMessageAlert(true);
              setTimeout(() => setShowNewMessageAlert(false), 8000);
              setUnreadCount(prev => prev + 1);
            }
          }
        )
        .subscribe();

      // Fallback polling para dados básicos
      const fallback = setInterval(() => {
        const all = getStoredCompanies();
        const updated = all.find(c => c.id === currentUser.id);
        if (updated && JSON.stringify(currentUserRef.current) !== JSON.stringify(updated)) {
          setCurrentUser(updated);
          currentUserRef.current = updated;
        }
      }, 20000);

      return () => {
        supabase.removeChannel(companyChannel);
        supabase.removeChannel(msgChannel);
        clearInterval(fallback);
      };
    }
  }, [view, currentUser?.id]);

  useEffect(() => {
    if (currentUser) {
      currentUserRef.current = currentUser;
      setBudgets(getStoredBudgets(currentUser.id));
      setSettingsLogo(currentUser.logo);
      setSettingsCompanyName(currentUser.name);
      setSettingsQrCode(currentUser.qrCode);
      setSettingsAddress(currentUser.address || '');
      setSettingsNif(currentUser.nif || '');
      setSettingsPhone(currentUser.phone || '');
      
      const checkMessages = () => {
        const msgs = getMessages(currentUser.id);
        const unread = msgs.filter(m => m.senderRole === 'master' && !m.read);
        setUnreadCount(unread.length);
      };

      checkMessages();
    }
  }, [currentUser?.id]);

  useEffect(() => {
    if (currentUser && currentUser.lastLocale !== locale) {
      const updated = { ...currentUser, lastLocale: locale };
      saveCompany(updated);
      setCurrentUser(updated);
      currentUserRef.current = updated;
    }
  }, [locale, currentUser?.id]);

  useEffect(() => {
    if (currentUser && view === 'app' && !showWelcome) {
      const bannerTimer = setTimeout(() => {
        const allNotifications = getGlobalNotifications();
        const activeBanners = allNotifications.filter(n => n.active);
        const userPlan = currentUser.plan;
        const isPremium = userPlan === PlanType.PREMIUM_MONTHLY || userPlan === PlanType.PREMIUM_ANNUAL || userPlan === PlanType.PREMIUM;
        
        const matchingBanner = [...activeBanners].reverse().find(n => {
          if (n.targetAudience === 'all') return true;
          if (n.targetAudience === 'free' && userPlan === PlanType.FREE) return true;
          if (n.targetAudience === 'premium_monthly' && (userPlan === PlanType.PREMIUM_MONTHLY || userPlan === PlanType.PREMIUM)) return true;
          if (n.targetAudience === 'premium_annual' && userPlan === PlanType.PREMIUM_ANNUAL) return true;
          if (n.targetAudience === 'all_premium' && isPremium) return true;
          return false;
        });

        if (matchingBanner) {
          setActiveNotification(matchingBanner);
          setShowNotificationModal(true);
        }
      }, 25000);
      return () => clearTimeout(bannerTimer);
    }
  }, [view, showWelcome, currentUser?.id, currentUser?.plan]);

  useEffect(() => {
    saveSession(currentUser?.id || null, view, activeTab, currencyCode);
  }, [currentUser?.id, view, activeTab, currencyCode]);

  useEffect(() => {
    const initData = async () => {
      if (currentUser?.id) {
        await hydrateLocalData(currentUser.id);
        const all = getStoredCompanies();
        const updated = all.find(c => c.id === currentUser.id);
        if (updated) {
          setCurrentUser(updated);
          currentUserRef.current = updated;
        }
      }
    };
    initData();
  }, []);

  const isSettingsLocked = useMemo(() => {
    if (!currentUser) return true;
    const hasData = !!(currentUser.logo || currentUser.nif);
    return hasData && !currentUser.canEditSensitiveData;
  }, [currentUser]);

  const canCreateBudget = useMemo(() => {
    if (!currentUser) return false;
    if (currentUser.plan !== PlanType.FREE) return true;
    return budgets.length < 3;
  }, [currentUser, budgets]);

  const filteredBudgets = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return budgets.filter(budget => {
      const matchesFilter = budgetFilter === 'all' || budget.status === budgetFilter;
      const matchesSearch = 
        budget.clientName.toLowerCase().includes(term) || 
        budget.id.toLowerCase().includes(term) ||
        budget.contactName.toLowerCase().includes(term) ||
        budget.contactPhone.toLowerCase().includes(term) ||
        budget.clientNif.toLowerCase().includes(term) ||
        budget.workLocation.toLowerCase().includes(term) ||
        budget.workNumber.toLowerCase().includes(term) ||
        budget.workPostalCode.toLowerCase().includes(term) ||
        (budget.observations || '').toLowerCase().includes(term) ||
        (budget.paymentMethod || '').toLowerCase().includes(term) ||
        budget.totalAmount.toString().includes(term) ||
        budget.items.some(item => item.description.toLowerCase().includes(term) || item.total.toString().includes(term)) ||
        budget.expenses.some(exp => exp.description.toLowerCase().includes(term) || exp.amount.toString().includes(term)) ||
        (budget.payments || []).some(pay => pay.amount.toString().includes(term) || pay.notes?.toLowerCase().includes(term));
      return matchesFilter && matchesSearch;
    });
  }, [budgets, budgetFilter, searchTerm]);

  const getTranslatedPlan = (plan: PlanType) => {
    switch (plan) {
      case PlanType.FREE: return t.planFree;
      case PlanType.PREMIUM_MONTHLY: return t.planMonthly;
      case PlanType.PREMIUM_ANNUAL: return t.planAnnual;
      case PlanType.PREMIUM: return t.planMonthly;
      default: return plan;
    }
  };

  const getTranslatedStatus = (status: BudgetStatus) => {
    switch (status) {
      case BudgetStatus.PENDING: return t.statusPending;
      case BudgetStatus.APPROVED: return t.statusApproved;
      case BudgetStatus.REJECTED: return t.statusRejected;
      case BudgetStatus.COMPLETED: return t.statusApproved;
      default: return status;
    }
  };

  const handleRequestUnlock = () => {
    if (!currentUser) return;
    const updated: Company = {
      ...currentUser,
      unlockRequested: true
    };
    saveCompany(updated);
    setCurrentUser(updated);
    currentUserRef.current = updated;
    alert(t.unlockRequestSent);
  };

  const normalizeForPdf = (text: string | undefined): string => {
    if (!text) return "";
    // Fix: Corrected duplicated keys and missing uppercase characters in Cyrillic transliteration map
    const ruMap: Record<string, string> = {
      'а':'a','б':'b','в':'v','г':'g','д':'d','е':'e','ё':'yo','ж':'zh','з':'z','и':'i','й':'y','к':'k','л':'l','м':'m','н':'n','о':'o','п':'p','р':'r','с':'s','т':'t','у':'u','ф':'f','х':'kh','ц':'ts','ч':'ch','ш':'sh','щ':'shch','ъ':'','ы':'y','ь':'','э':'e','ю':'yu','я':'ya',
      'А':'A','Б':'B','В':'V','Г':'G','Д':'D','Е':'E','Ё':'Yo','Ж':'Zh','З':'Z','И':'I','Й':'Y','К':'K','Л':'L','М':'M','Н':'N','О':'O','П':'P','Р':'R','С':'S','Т':'T','У':'U','Ф':'F','Х':'KH','Ц':'TS','Ч':'CH','Ш':'SH','Щ':'SHCH','Ъ':'','Ы':'Y','Ь':'','Э':'E','Ю':'YU','Я':'YA'
    };
    let result = text;
    result = result.split('').map(char => ruMap[char] || char).join('');
    result = result.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    result = result.replace(/[^\x20-\x7E]/g, "");
    return result;
  };

  const exportToPDF = (budget: Budget) => {
    const company = currentUser;
    if (!company) return;
    const isNonLatin = ['ru-RU', 'hi-IN', 'bn-BD'].includes(locale);
    const pdfT = isNonLatin ? translations['en-US'] : translations[locale];
    
    if (company.plan === PlanType.FREE) {
      const count = getPdfDownloadCount(company.id);
      if (count >= FREE_PDF_LIMIT) {
        alert(pdfT.pdfLimitReached);
        setActiveTab('plans');
        return;
      }
    }

    const doc = new jsPDF();
    const currencyInfo = CURRENCIES[currencyCode];
    const pageHeight = doc.internal.pageSize.getHeight();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    const usableWidth = pageWidth - (margin * 2);

    // Helper for footer
    const addFooter = (doc: any, pageNumber: number, totalPages: number) => {
      doc.setFontSize(8).setFont('helvetica', 'italic').setTextColor(148, 163, 184);
      const footerText = `Documento processado em nuvem via ÁTRIOS - Segurança e Transparência | Gerado em ${new Date().toLocaleString(locale)}`;
      doc.text(footerText, pageWidth / 2, pageHeight - 10, { align: 'center' });
      doc.text(`${pageNumber} / ${totalPages}`, pageWidth - margin, pageHeight - 10, { align: 'right' });
    };

    // --- HEADER ---
    // Top Accent Bar
    doc.setFillColor(245, 158, 11); // Amber-500
    doc.rect(0, 0, pageWidth, 5, 'F');

    // Logo
    if (company.logo && company.logo.length > 50) {
      try {
        const format = company.logo.toLowerCase().includes('image/png') ? 'PNG' : 'JPEG';
        doc.addImage(company.logo, format, margin, 15, 45, 45, undefined, 'FAST');
      } catch (err) {}
    }

    // Company Info
    doc.setFontSize(18).setFont('helvetica', 'bold').setTextColor(15, 23, 42); // Slate-900
    doc.text(normalizeForPdf(company.name.toUpperCase()), 70, 25);
    
    doc.setFontSize(9).setFont('helvetica', 'normal').setTextColor(100, 116, 139);
    let companyY = 32;
    if (company.nif) { doc.text(`NIF: ${normalizeForPdf(company.nif)}`, 70, companyY); companyY += 5; }
    doc.text(normalizeForPdf(company.email), 70, companyY); companyY += 5;
    if (company.phone) { doc.text(`${normalizeForPdf(pdfT.phone)}: ${normalizeForPdf(company.phone)}`, 70, companyY); companyY += 5; }
    if (company.address) {
      const splitAddress = doc.splitTextToSize(normalizeForPdf(company.address), 60);
      doc.text(splitAddress, 70, companyY);
    }

    // Budget Info Box (Right Side)
    doc.setFillColor(248, 250, 252); // Slate-50
    doc.roundedRect(115, 15, 75, 42, 3, 3, 'F');
    
    // QR Code inside the box (Right side of box)
    if (company.qrCode && company.qrCode.length > 50) {
      try {
        const qrFormat = company.qrCode.toLowerCase().includes('image/png') ? 'PNG' : 'JPEG';
        doc.addImage(company.qrCode, qrFormat, 165, 20, 20, 20, undefined, 'FAST');
        doc.setFontSize(5).setTextColor(148, 163, 184).text(normalizeForPdf(pdfT.scanMe.toUpperCase()), 175, 42, { align: 'center' });
      } catch (err) {}
    }

    doc.setFontSize(9).setFont('helvetica', 'bold').setTextColor(245, 158, 11);
    doc.text(normalizeForPdf(pdfT.budgetSingle.toUpperCase()), 120, 25);
    
    doc.setFontSize(11).setFont('helvetica', 'black').setTextColor(15, 23, 42);
    doc.text(`#${budget.id.toUpperCase()}`, 120, 32);
    
    doc.setFontSize(7).setFont('helvetica', 'normal').setTextColor(100, 116, 139);
    doc.text(`${normalizeForPdf(pdfT.date)}: ${new Date(budget.createdAt).toLocaleDateString(locale)}`, 120, 38);
    if (budget.validity) doc.text(`${normalizeForPdf(pdfT.estimateValidity)}: ${normalizeForPdf(budget.validity)}`, 120, 43);

    // --- CLIENT & SERVICES SECTION ---
    doc.setDrawColor(241, 245, 249).line(margin, 65, pageWidth - margin, 65);

    // Client Identification
    doc.setFontSize(11).setFont('helvetica', 'bold').setTextColor(15, 23, 42);
    doc.text(normalizeForPdf(pdfT.clientIdentification.toUpperCase()), margin, 75);
    
    doc.setFontSize(9).setFont('helvetica', 'normal').setTextColor(71, 85, 105);
    let clientY = 82;
    doc.text(`${normalizeForPdf(pdfT.clientName)}: ${normalizeForPdf(budget.clientName)}`, margin, clientY); clientY += 5;
    doc.text(`${normalizeForPdf(pdfT.contactName)}: ${normalizeForPdf(budget.contactName)}`, margin, clientY); clientY += 5;
    doc.text(`${normalizeForPdf(pdfT.phone)}: ${normalizeForPdf(budget.contactPhone)}`, margin, clientY); clientY += 5;
    if (budget.clientNif) { doc.text(`${normalizeForPdf(pdfT.clientNif)}: ${normalizeForPdf(budget.clientNif)}`, margin, clientY); clientY += 5; }
    doc.text(`${normalizeForPdf(pdfT.workLocation)}: ${normalizeForPdf(budget.workLocation)}`, margin, clientY); clientY += 5;
    doc.text(`${normalizeForPdf(pdfT.workNumber)}: ${normalizeForPdf(budget.workNumber)}`, margin, clientY); clientY += 5;
    doc.text(`${normalizeForPdf(pdfT.workPostalCode)}: ${normalizeForPdf(budget.workPostalCode)}`, margin, clientY);

    // Services Included (Right Side)
    if (budget.servicesSelected && budget.servicesSelected.length > 0) {
      doc.setFontSize(11).setFont('helvetica', 'bold').setTextColor(15, 23, 42);
      doc.text(normalizeForPdf(pdfT.servicesIncluded.toUpperCase()), 110, 75);
      
      let serviceY = 82;
      let iconX = 110;
      budget.servicesSelected.forEach((serviceId) => {
        const label = normalizeForPdf(pdfT[`service_${serviceId}` as keyof typeof pdfT] || serviceId);
        const textWidth = doc.getTextWidth(label);
        
        doc.setFillColor(248, 250, 252);
        doc.roundedRect(iconX, serviceY - 6, textWidth + 14, 9, 2, 2, 'F');
        
        doc.setLineWidth(0.4);
        // Simplified icon drawing logic for PDF
        if (serviceId === 'eletricista') doc.setDrawColor(245, 158, 11);
        else if (serviceId === 'pintura') doc.setDrawColor(59, 130, 246);
        else if (serviceId === 'canalizador') doc.setDrawColor(71, 85, 105);
        else if (serviceId === 'capoto') doc.setDrawColor(16, 185, 129);
        else if (serviceId === 'carpinteiro') doc.setDrawColor(120, 53, 15);
        else doc.setDrawColor(148, 163, 184);
        
        doc.circle(iconX + 4, serviceY - 2, 1.5, 'S');
        
        doc.setFontSize(8).setFont('helvetica', 'bold').setTextColor(71, 85, 105);
        doc.text(label, iconX + 9, serviceY);
        
        iconX += textWidth + 20;
        if (iconX > 180) {
          iconX = 110;
          serviceY += 12;
        }
      });
    }

    // --- ITEMS TABLE ---
    autoTable(doc, {
      startY: 120,
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
      theme: 'striped',
      headStyles: { fillColor: [15, 23, 42], fontStyle: 'bold', fontSize: 9, halign: 'center' },
      bodyStyles: { fontSize: 8, textColor: [71, 85, 105] },
      columnStyles: {
        0: { cellWidth: 'auto' },
        1: { halign: 'center', cellWidth: 20 },
        2: { halign: 'right', cellWidth: 30 },
        3: { halign: 'center', cellWidth: 20 },
        4: { halign: 'right', cellWidth: 30 }
      },
      margin: { left: margin, right: margin },
      didDrawPage: (data) => {
        addFooter(doc, data.pageNumber, doc.getNumberOfPages());
      }
    });

    // --- TOTALS ---
    const finalY = (doc as any).lastAutoTable.finalY;
    let sumY = finalY + 15;
    if (sumY + 60 > pageHeight) { doc.addPage(); sumY = 30; }

    const subTotal = budget.items.reduce((s, i) => s + i.total, 0);
    const ivaVal = budget.includeIva ? (subTotal * budget.ivaPercentage) / 100 : 0;
    const grandTotal = subTotal + ivaVal;

    // Totals Box
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(110, sumY - 10, 80, 40, 3, 3, 'F');

    doc.setFontSize(9).setFont('helvetica', 'normal').setTextColor(100, 116, 139);
    doc.text(normalizeForPdf(pdfT.subtotal), 115, sumY);
    doc.text(`${(subTotal * currencyInfo.rate).toFixed(2)} ${currencyInfo.code}`, 185, sumY, { align: 'right' });
    sumY += 7;

    if (budget.includeIva) {
      doc.text(`${normalizeForPdf(pdfT.ivaValue)} (${budget.ivaPercentage}%):`, 115, sumY);
      doc.text(`${(ivaVal * currencyInfo.rate).toFixed(2)} ${currencyInfo.code}`, 185, sumY, { align: 'right' });
      sumY += 7;
    }

    doc.setDrawColor(226, 232, 240).line(115, sumY - 2, 185, sumY - 2);
    doc.setFontSize(12).setFont('helvetica', 'bold').setTextColor(15, 23, 42);
    doc.text(normalizeForPdf(pdfT.total.toUpperCase()), 115, sumY + 5);
    doc.setTextColor(245, 158, 11);
    doc.text(`${(grandTotal * currencyInfo.rate).toFixed(2)} ${currencyInfo.code}`, 185, sumY + 5, { align: 'right' });

    // Payment Method
    if (budget.paymentMethod) {
      doc.setFontSize(9).setFont('helvetica', 'bold').setTextColor(15, 23, 42);
      doc.text(normalizeForPdf(pdfT.paymentMethodLabel.toUpperCase()), margin, sumY - 5);
      doc.setFont('helvetica', 'normal').setTextColor(71, 85, 105);
      const pmLines = doc.splitTextToSize(normalizeForPdf(budget.paymentMethod), 80);
      doc.text(pmLines, margin, sumY);
    }

    // Observations
    if (budget.observations) {
      let obsY = sumY + 25;
      if (obsY + 30 > pageHeight) { doc.addPage(); obsY = 30; }
      doc.setFont('helvetica', 'bold').setFontSize(10).setTextColor(15, 23, 42);
      doc.text(normalizeForPdf(pdfT.observationsLabel.toUpperCase()), margin, obsY);
      doc.setFont('helvetica', 'normal').setFontSize(8).setTextColor(100, 116, 139);
      const lines = doc.splitTextToSize(normalizeForPdf(budget.observations), usableWidth);
      doc.text(lines, margin, obsY + 7);
    }

    // Final Save
    doc.save(`Atrios_Budget_${normalizeForPdf(budget.clientName).replace(/\s/g, '_')}_${budget.id}.pdf`);
    if (company.plan === PlanType.FREE) incrementPdfDownloadCount(company.id);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (email === 'jeferson.goes36@gmail.com' && password === 'izalivjeh') {
      setView('master');
      return;
    }
    
    // 1. Tentar localizar usuário localmente
    const localCompanies = getStoredCompanies();
    let company = localCompanies.find(c => c.email === email && c.password === password);
    
    // 2. Se não estiver no local, buscar no Supabase (Permite login em novos dispositivos)
    if (!company) {
      const { data, error } = await supabase.from('companies').select('*').eq('email', email).eq('password', password).single();
      if (data && !error) {
        company = data as Company;
        saveCompany(company); // Salva no local storage para sessões futuras
      }
    }

    if (company) {
      if (company.isBlocked) {
        alert(t.masterAccountBlocked);
        return;
      }
      if (!company.verified) {
        setView('verify');
        return;
      }
      
      // Hidratar dados do Supabase ao logar com sucesso
      await hydrateLocalData(company.id);
      
      if (!company.firstLoginAt) {
        company.firstLoginAt = new Date().toISOString();
        saveCompany(company);
      }
      setCurrentUser(company);
      currentUserRef.current = company;
      setShowWelcome(true);
      setTimeout(() => {
        setShowWelcome(false);
        setView('app');
      }, 3500);
    } else {
      alert(t.invalidCredentials);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    alert(t.resetLinkSent);
    setView('login');
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Verificar se e-mail já existe no Supabase
    const { data: existingEmail } = await supabase.from('companies').select('id').eq('email', email).single();
    if (existingEmail) {
       alert("Este e-mail já está em uso.");
       return;
    }

    // Verificar se nome da empresa já existe no Supabase
    const { data: existingName } = await supabase.from('companies').select('id').eq('name', companyName).single();
    if (existingName) {
       alert("Este nome de empresa já está em uso.");
       return;
    }

    const newCompany: Company = {
      id: Math.random().toString(36).substr(2, 9).toUpperCase(),
      name: companyName,
      email,
      password,
      plan: PlanType.FREE,
      verified: true,
      createdAt: new Date().toISOString(),
      firstLoginAt: new Date().toISOString(),
      lastLocale: locale
    };
    saveCompany(newCompany);
    
    setCurrentUser(newCompany);
    currentUserRef.current = newCompany;
    setShowWelcome(true);
    setTimeout(() => {
      setShowWelcome(false);
      setView('app');
    }, 3500);
  };

  const handleVerify = async () => {
    const companies = getStoredCompanies();
    let company = companies.find(c => c.email === email);
    
    if (!company) {
       // Buscar se foi criado recentemente no signup mas não está no cache (improvável mas possível)
       const { data } = await supabase.from('companies').select('*').eq('email', email).single();
       if (data) company = data as Company;
    }

    if (company) {
      company.verified = true;
      company.firstLoginAt = new Date().toISOString();
      saveCompany(company);
      
      await hydrateLocalData(company.id);
      
      setCurrentUser(company);
      currentUserRef.current = company;
      setShowWelcome(true);
      setTimeout(() => {
        setShowWelcome(false);
        setView('app');
      }, 3500);
    }
  };

  const handleSaveBudget = (budget: Budget) => {
    if (!currentUser) {
      return;
    }

    // Check limit for new budgets
    const isNew = !budgets.find(b => b.id === budget.id);
    if (isNew && !canCreateBudget) {
      alert(t.budgetLimitReached);
      setActiveTab('plans');
      setIsEditingBudget(false);
      return;
    }

    try {
      saveBudget(budget);
      setBudgets(getStoredBudgets(currentUser.id));
      setIsEditingBudget(false);
      setSelectedBudget(undefined);
    } catch (error: any) {
      console.error("Erro ao guardar orçamento:", error);
      alert("Erro ao guardar orçamento: " + error.message);
    }
  };

  useEffect(() => {
    const checkSession = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const sessionId = urlParams.get('session_id');
      if (sessionId && currentUser) {
        // Refresh user data to see the new plan
        await hydrateLocalData(currentUser.id);
        const updatedCompanies = getStoredCompanies();
        const updatedUser = updatedCompanies.find(c => c.id === currentUser.id);
        if (updatedUser) {
          setCurrentUser(updatedUser);
          currentUserRef.current = updatedUser;
          alert(t.upgradeSuccess);
        }
        // Clean up URL
        window.history.replaceState({}, document.title, "/");
      }
    };
    checkSession();
  }, [currentUser]);

  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  const handleUpgrade = async (plan: PlanType, finalPrice: number, coupon?: string) => {
    if (!currentUser) return;
    
    if (plan === PlanType.FREE) {
      const updated = { ...currentUser, plan: PlanType.FREE, subscriptionExpiresAt: undefined };
      saveCompany(updated);
      setCurrentUser(updated);
      currentUserRef.current = updated;
      setActiveTab('dashboard');
      return;
    }

    setIsProcessingPayment(true);
    try {
      console.log('Initiating checkout for plan:', plan);
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          companyId: currentUser.id,
          planType: plan,
          couponCode: coupon,
          origin: window.location.origin,
        }),
      });

      const contentType = response.headers.get("content-type");
      const text = await response.text();
      
      if (!contentType || !contentType.includes("application/json")) {
        console.error("Non-JSON response received:", text);
        if (text.includes("<!DOCTYPE html>") || text.includes("<html")) {
          throw new Error("O servidor retornou HTML em vez de JSON. Isso geralmente acontece se o Render estiver configurado como 'Static Site' em vez de 'Web Service', ou se a rota da API não estiver sendo encontrada.");
        }
        throw new Error(`O servidor não retornou JSON. Status: ${response.status}. Conteúdo: ${text.substring(0, 100)}`);
      }

      let data;
      try {
        data = JSON.parse(text);
      } catch (e) {
        console.error("Failed to parse JSON:", text);
        throw new Error("Erro ao processar resposta do servidor (JSON inválido).");
      }
      
      if (!response.ok || data.error) {
        throw new Error(data.error || `Erro do servidor (${response.status})`);
      }

      if (data.url) {
        // Ensure session is saved with dashboard tab before redirecting
        setActiveTab('dashboard');
        // Delay redirection by 8 seconds as requested
        await new Promise(resolve => setTimeout(resolve, 8000));
        window.location.href = data.url;
      } else {
        throw new Error("URL de checkout não recebida.");
      }
    } catch (err: any) {
      console.error('Stripe error:', err);
      alert(`Erro ao processar pagamento: ${err.message}`);
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const handleSaveSettings = () => {
    if (!currentUser) return;
    if (isSettingsLocked) { alert(t.settingsPassError); return; }
    setShowSettingsConfirmModal(true);
  };

  const confirmSensitiveSave = async () => {
    if (!currentUser) return;

    // Verificar se NIF já existe em outra empresa
    if (settingsNif) {
      const { data: existingNif } = await supabase
        .from('companies')
        .select('id')
        .eq('nif', settingsNif)
        .neq('id', currentUser.id)
        .single();
      
      if (existingNif) {
        alert("Este NIF já está em uso por outra conta.");
        return;
      }
    }

    // Verificar se Telefone já existe em outra empresa
    if (settingsPhone) {
      const { data: existingPhone } = await supabase
        .from('companies')
        .select('id')
        .eq('phone', settingsPhone)
        .neq('id', currentUser.id)
        .single();
      
      if (existingPhone) {
        alert("Este telefone já está em uso por outra conta.");
        return;
      }
    }

    // Verificar se Nome da Empresa já existe em outra empresa
    if (settingsCompanyName && settingsCompanyName !== currentUser.name) {
      const { data: existingName } = await supabase
        .from('companies')
        .select('id')
        .eq('name', settingsCompanyName)
        .neq('id', currentUser.id)
        .single();
      
      if (existingName) {
        alert("Este nome de empresa já está em uso por outra conta.");
        return;
      }
    }

    const updated: Company = {
      ...currentUser,
      name: settingsCompanyName,
      logo: settingsLogo,
      qrCode: settingsQrCode,
      address: settingsAddress,
      nif: settingsNif,
      phone: settingsPhone,
      canEditSensitiveData: false,
      unlockRequested: false
    };
    saveCompany(updated);
    setCurrentUser({...updated});
    currentUserRef.current = updated;
    setShowSettingsConfirmModal(false);
    setTimeout(() => alert(t.saveSuccess), 100);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, setter: (val: string) => void) => {
    if (isSettingsLocked) return;
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 200000) { alert(t.imageTooLarge); return; }
      const reader = new FileReader();
      reader.onloadend = () => setter(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const Selectors = () => (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl px-3 py-1.5 shadow-sm">
        <Coins size={14} className="text-white/60" />
        <select value={currencyCode} onChange={(e) => setCurrencyCode(e.target.value as CurrencyCode)} className="bg-transparent text-[10px] font-black text-white uppercase outline-none cursor-pointer tracking-widest">
          {Object.values(CURRENCIES).map(curr => <option key={curr.code} value={curr.code} className="text-slate-900">{curr.label}</option>)}
        </select>
      </div>
      <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl px-3 py-1.5 shadow-sm">
        <Globe size={14} className="text-white/60" />
        <select value={locale} onChange={(e) => setLocale(e.target.value as Locale)} className="bg-transparent text-[10px] font-black text-white uppercase outline-none cursor-pointer tracking-widest">
          <option value="pt-PT" className="text-slate-900">🇵🇹 PT (Portugal)</option>
          <option value="pt-BR" className="text-slate-900">🇧🇷 PT (Brasil)</option>
          <option value="en-US" className="text-slate-900">🇺🇸 EN (English)</option>
          <option value="fr-FR" className="text-slate-900">🇫🇷 FR (Français)</option>
          <option value="it-IT" className="text-slate-900">🇮🇹 IT (Italiano)</option>
          <option value="es-ES" className="text-slate-900">🇪🇸 ES (Español)</option>
          <option value="ru-RU" className="text-slate-900">🇷🇺 RU (Pоссия)</option>
          <option value="hi-IN" className="text-slate-900">🇮🇳 HI (भारत)</option>
          <option value="bn-BD" className="text-slate-900">🇧🇩 BN (বাংলাদেশ)</option>
        </select>
      </div>
    </div>
  );

  if (view === 'master') return <MasterPanel onLogout={() => { saveSession(null); setView('landing'); }} locale={locale} />;

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden relative">
      {showWelcome && currentUser && <WelcomeScreen company={currentUser} locale={locale} />}
      
      {showUnlockAlert && (
        <div className="fixed top-8 left-1/2 -translate-x-1/2 z-[10000] bg-emerald-600 text-white px-8 py-5 rounded-[2rem] shadow-2xl flex items-center gap-4 animate-in slide-in-from-top duration-700 border border-emerald-400">
           <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center animate-pulse"><ShieldCheck size={28} /></div>
           <div><p className="font-black text-sm uppercase tracking-widest">{t.notifyUnlockTitle}</p><p className="text-xs font-bold text-white/80">{t.notifyUnlockDesc}</p></div>
           <button onClick={() => setShowUnlockAlert(false)} className="ml-4 p-2 hover:bg-white/10 rounded-full"><X size={20} /></button>
        </div>
      )}

      {showNewMessageAlert && (
        <div className="fixed top-8 left-1/2 -translate-x-1/2 z-[9998] bg-slate-900 text-white px-8 py-5 rounded-[2rem] shadow-2xl flex items-center gap-4 animate-in slide-in-from-top duration-500 border border-white/10">
          <div className="w-12 h-12 bg-amber-500 text-slate-900 rounded-full flex items-center justify-center animate-bounce shadow-lg"><MessageSquare size={24} /></div>
          <div><p className="font-black text-sm uppercase tracking-widest">{t.notifyNewMessageTitle}</p><p className="text-xs font-bold text-white/60">{t.notifyNewMessageDesc}</p></div>
          <button onClick={() => { setShowNewMessageAlert(false); setShowSupportChat(true); }} className="px-6 py-2.5 bg-white/10 hover:bg-white/20 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all">{t.viewProof}</button>
          <button onClick={() => setShowNewMessageAlert(false)} className="p-1 hover:bg-white/10 rounded-full"><X size={16} /></button>
        </div>
      )}

      {showNotificationModal && activeNotification && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/90 backdrop-blur-md p-6 animate-in fade-in duration-700">
          <div className="relative max-w-4xl w-full bg-white rounded-[3rem] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-500">
            <button onClick={() => setShowNotificationModal(false)} className="absolute top-6 right-6 z-10 p-3 bg-black/50 text-white rounded-full hover:bg-black transition-all"><X size={24} /></button>
            <div className="aspect-video w-full bg-slate-100 flex items-center justify-center"><img src={activeNotification.imageUrl} alt="Notification" className="w-full h-full object-contain" /></div>
            <div className="p-8 text-center bg-white"><button onClick={() => setShowNotificationModal(false)} className="px-12 py-4 bg-slate-900 text-white rounded-[1.5rem] font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl">{t.understood}</button></div>
          </div>
        </div>
      )}

      {showSettingsConfirmModal && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-6">
          <div className="bg-white rounded-[2.5rem] p-10 max-w-lg w-full shadow-2xl space-y-8 text-center">
            <div className="w-20 h-20 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center mx-auto"><CheckCircle2 size={40} /></div>
            <div className="space-y-4"><h3 className="text-2xl font-black text-slate-900">{t.settingsConfirmTitle}</h3><p className="text-slate-500 font-medium leading-relaxed">{t.settingsConfirmDesc}</p></div>
            <div className="flex flex-col gap-3"><button onClick={confirmSensitiveSave} className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-slate-800 transition-all">{t.settingsConfirmBtn}</button><button onClick={() => setShowSettingsConfirmModal(false)} className="w-full py-4 border-2 border-slate-100 rounded-2xl font-black uppercase tracking-widest text-xs text-slate-400">{t.cancel}</button></div>
          </div>
        </div>
      )}

      {showLegalModal && (
        <div className="fixed inset-0 z-[10001] flex items-center justify-center bg-slate-950/90 backdrop-blur-md p-6 animate-in fade-in duration-500">
          <div className="relative max-w-3xl w-full bg-white rounded-[3rem] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center shrink-0">
              <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">
                {showLegalModal === 'terms' ? t.termsTitle : t.privacyTitle}
              </h3>
              <button onClick={() => setShowLegalModal(null)} className="p-2 hover:bg-slate-100 rounded-full transition-all text-slate-400 hover:text-slate-900">
                <X size={24} />
              </button>
            </div>
            <div className="p-10 overflow-y-auto no-scrollbar flex-1">
              <div className="prose prose-slate max-w-none">
                <p className="text-slate-600 font-medium leading-relaxed whitespace-pre-wrap">
                  {showLegalModal === 'terms' ? t.termsContent : t.privacyContent}
                </p>
              </div>
            </div>
            <div className="p-8 border-t border-slate-100 text-center shrink-0">
              <button onClick={() => setShowLegalModal(null)} className="px-12 py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl">
                {t.understood}
              </button>
            </div>
          </div>
        </div>
      )}

      {view === 'landing' ? (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 bg-slate-900 overflow-hidden relative w-full">
          <div className="absolute top-4 right-4 sm:top-8 sm:right-8 z-50 scale-90 sm:scale-100 origin-top-right"><Selectors /></div>
          <div className="z-10 text-center max-w-2xl px-4 py-12 sm:py-0">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8 sm:mb-10">
              <div className="bg-amber-500 p-4 sm:p-5 rounded-[1.5rem] sm:rounded-[2rem] shadow-2xl rotate-12">
                <Construction className="text-white w-8 h-8 sm:w-12 sm:h-12" />
              </div>
              <h1 className="text-5xl sm:text-7xl font-black text-white tracking-tighter italic">{t.appName}</h1>
            </div>
            <h2 className="text-xl sm:text-3xl text-slate-300 font-medium mb-10 sm:mb-16 leading-relaxed">{t.heroTitle}</h2>
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-5 justify-center">
              <button onClick={() => setView('signup')} className="w-full sm:w-auto px-8 sm:px-12 py-4 sm:py-6 bg-amber-500 text-slate-900 rounded-2xl sm:rounded-3xl font-black text-lg sm:text-xl hover:bg-amber-400 transition-all shadow-2xl">
                {t.heroCta}
              </button>
              <button onClick={() => setView('login')} className="w-full sm:w-auto px-8 sm:px-12 py-4 sm:py-6 bg-white/10 text-white border-2 border-white/20 rounded-2xl sm:rounded-3xl font-black text-lg sm:text-xl hover:bg-white/20 transition-all">
                {t.loginBtn}
              </button>
            </div>
            
            <div className="mt-12 sm:mt-20 flex flex-col items-center gap-6">
              <div className="flex items-center gap-6 sm:gap-8 text-[9px] sm:text-[10px] font-black uppercase tracking-widest sm:tracking-[0.3em] text-white/40">
                <button onClick={() => setShowLegalModal('terms')} className="hover:text-amber-500 transition-colors">{t.termsOfService}</button>
                <button onClick={() => setShowLegalModal('privacy')} className="hover:text-amber-500 transition-colors">{t.privacyPolicy}</button>
              </div>
              <div className="flex items-center gap-3 px-4 sm:px-6 py-2.5 sm:py-3 bg-white/5 border border-white/10 rounded-xl sm:rounded-2xl text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-white/60">
                <Mail size={12} className="text-amber-500 sm:w-3.5 sm:h-3.5" />
                <span>{t.supportEmailLabel}: <a href="mailto:support@atrios.pt" className="text-white hover:text-amber-500 transition-colors">support@atrios.pt</a></span>
              </div>
            </div>
          </div>
        </div>
      ) : view === 'login' ? (
        <div className="min-h-screen w-full bg-slate-50 flex items-center justify-center p-4 sm:p-6 lg:p-12 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,1)_0%,rgba(241,245,249,1)_100%)]" />
          <div className="w-full sm:max-w-xl space-y-8 lg:space-y-12 p-6 sm:p-8 lg:p-12 bg-white rounded-[1.5rem] sm:rounded-[2.5rem] shadow-2xl border border-slate-100 animate-in fade-in slide-in-from-bottom-8 duration-700 relative z-10">
            <div className="text-center space-y-3 lg:space-y-4">
              <div className="inline-flex p-3 sm:p-4 bg-amber-500 rounded-2xl sm:rounded-3xl text-white shadow-xl shadow-amber-500/20 mb-2 lg:mb-4"><Construction size={24} className="sm:w-8 sm:h-8" /></div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tighter">{t.welcomeBack}</h2>
              <p className="text-slate-400 font-bold uppercase tracking-[0.2em] lg:tracking-[0.3em] text-[10px] lg:text-xs">{t.enterData}</p>
            </div>
            <form onSubmit={handleLogin} className="space-y-5 sm:space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t.emailLabel}</label>
                <input type="email" required value={email} onChange={e => setEmail(e.target.value)} className="w-full px-5 sm:px-6 py-3.5 sm:py-4 rounded-xl sm:rounded-2xl bg-slate-50 border-2 border-slate-100 outline-none focus:border-slate-900 transition-all font-bold text-sm sm:text-base" placeholder="exemplo@empresa.pt" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center ml-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.passwordLabel}</label>
                  <button type="button" onClick={() => setView('forgot-password')} className="text-[9px] font-black text-amber-600 uppercase tracking-widest hover:text-amber-700 transition-colors">{t.forgotPassword}</button>
                </div>
                <input type="password" required value={password} onChange={e => setPassword(e.target.value)} className="w-full px-5 sm:px-6 py-3.5 sm:py-4 rounded-xl sm:rounded-2xl bg-slate-50 border-2 border-slate-100 outline-none focus:border-slate-900 transition-all font-bold text-sm sm:text-base" placeholder="••••••••" />
              </div>
              <button type="submit" className="w-full py-4 sm:py-5 bg-slate-900 text-white rounded-xl sm:rounded-2xl font-black text-base sm:text-lg hover:bg-slate-800 transition-all shadow-2xl active:scale-95">{t.loginBtn}</button>
            </form>
            <div className="text-center space-y-4">
              <p className="text-slate-400 font-bold text-xs sm:text-sm">{t.noAccount} <button onClick={() => setView('signup')} className="text-amber-600 hover:text-amber-700 underline decoration-2 underline-offset-4">{t.registerHere}</button></p>
              <button onClick={() => setView('landing')} className="text-slate-400 font-black uppercase tracking-widest text-[9px] sm:text-[10px] hover:text-slate-900 transition-colors">{t.backToLogin}</button>
            </div>
          </div>
        </div>
      ) : view === 'signup' ? (
        <div className="min-h-screen w-full bg-slate-50 flex items-center justify-center p-4 sm:p-6 lg:p-12 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,1)_0%,rgba(241,245,249,1)_100%)]" />
          <div className="w-full max-w-2xl space-y-8 lg:space-y-12 p-6 sm:p-8 lg:p-12 bg-white rounded-[1.5rem] sm:rounded-[2.5rem] shadow-2xl border border-slate-100 animate-in fade-in slide-in-from-bottom-8 duration-700 relative z-10">
            <div className="text-center space-y-3 lg:space-y-4">
              <div className="inline-flex p-3 sm:p-4 bg-amber-500 rounded-2xl sm:rounded-3xl text-white shadow-xl shadow-amber-500/20 mb-2 lg:mb-4"><Construction size={24} className="sm:w-8 sm:h-8" /></div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tighter">{t.createAccount}</h2>
              <p className="text-slate-400 font-bold uppercase tracking-[0.2em] lg:tracking-[0.3em] text-[10px] lg:text-xs">{t.enterData}</p>
            </div>
            <form onSubmit={handleSignup} className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
              <div className="sm:col-span-2 space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t.companyLabel}</label>
                <input type="text" required value={companyName} onChange={e => setCompanyName(e.target.value)} className="w-full px-5 sm:px-6 py-3.5 sm:py-4 rounded-xl sm:rounded-2xl bg-slate-50 border-2 border-slate-100 outline-none focus:border-slate-900 transition-all font-bold text-sm sm:text-base" placeholder="Nome da sua Empresa" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t.emailLabel}</label>
                <input type="email" required value={email} onChange={e => setEmail(e.target.value)} className="w-full px-5 sm:px-6 py-3.5 sm:py-4 rounded-xl sm:rounded-2xl bg-slate-50 border-2 border-slate-100 outline-none focus:border-slate-900 transition-all font-bold text-sm sm:text-base" placeholder="exemplo@empresa.pt" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t.passwordLabel}</label>
                <input type="password" required value={password} onChange={e => setPassword(e.target.value)} className="w-full px-5 sm:px-6 py-3.5 sm:py-4 rounded-xl sm:rounded-2xl bg-slate-50 border-2 border-slate-100 outline-none focus:border-slate-900 transition-all font-bold text-sm sm:text-base" placeholder="••••••••" />
              </div>
              <div className="sm:col-span-2 pt-2">
                <button type="submit" className="w-full py-4 sm:py-5 bg-slate-900 text-white rounded-xl sm:rounded-2xl font-black text-base sm:text-lg hover:bg-slate-800 transition-all shadow-2xl active:scale-95">{t.registerBtn}</button>
              </div>
            </form>
            <div className="text-center space-y-4">
              <p className="text-slate-400 font-bold text-xs sm:text-sm">{t.haveAccount} <button onClick={() => setView('login')} className="text-amber-600 hover:text-amber-700 underline decoration-2 underline-offset-4">{t.loginBtn}</button></p>
              <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-slate-300">
                <button onClick={() => setShowLegalModal('terms')} className="hover:text-slate-900 transition-colors">{t.termsOfService}</button>
                <button onClick={() => setShowLegalModal('privacy')} className="hover:text-slate-900 transition-colors">{t.privacyPolicy}</button>
              </div>
            </div>
          </div>
        </div>
      ) : view === 'forgot-password' ? (
        <div className="min-h-screen w-full bg-slate-50 flex items-center justify-center p-4 sm:p-6 lg:p-12 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,1)_0%,rgba(241,245,249,1)_100%)]" />
          <div className="w-full sm:max-w-xl space-y-8 lg:space-y-12 p-6 sm:p-8 lg:p-12 bg-white rounded-[1.5rem] sm:rounded-[2.5rem] shadow-2xl border border-slate-100 animate-in fade-in slide-in-from-bottom-8 duration-700 relative z-10">
            <div className="text-center space-y-3 lg:space-y-4">
              <div className="inline-flex p-3 sm:p-4 bg-amber-500 rounded-2xl sm:rounded-3xl text-white shadow-xl shadow-amber-500/20 mb-2 lg:mb-4"><Construction size={24} className="sm:w-8 sm:h-8" /></div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tighter">{t.resetPasswordTitle}</h2>
              <p className="text-slate-400 font-bold uppercase tracking-[0.2em] lg:tracking-[0.3em] text-[10px] lg:text-xs">{t.resetPasswordDesc}</p>
            </div>
            <form onSubmit={handleResetPassword} className="space-y-5 sm:space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{t.emailLabel}</label>
                <input type="email" required value={email} onChange={e => setEmail(e.target.value)} className="w-full px-5 sm:px-6 py-3.5 sm:py-4 rounded-xl sm:rounded-2xl bg-slate-50 border-2 border-slate-100 outline-none focus:border-slate-900 transition-all font-bold text-sm sm:text-base" placeholder="exemplo@empresa.pt" />
              </div>
              <button type="submit" className="w-full py-4 sm:py-5 bg-slate-900 text-white rounded-xl sm:rounded-2xl font-black text-base sm:text-lg hover:bg-slate-800 transition-all shadow-2xl active:scale-95">{t.sendResetLink}</button>
            </form>
            <div className="text-center">
              <button onClick={() => setView('login')} className="text-slate-400 font-black uppercase tracking-widest text-[9px] sm:text-[10px] hover:text-slate-900 transition-colors">{t.backToLogin}</button>
            </div>
          </div>
        </div>
      ) : view === 'verify' ? (
        <div className="min-h-screen w-full bg-slate-50 flex items-center justify-center p-4 sm:p-6 lg:p-12 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,1)_0%,rgba(241,245,249,1)_100%)]" />
          <div className="w-full sm:max-w-xl space-y-8 lg:space-y-12 p-6 sm:p-8 lg:p-12 bg-white rounded-[1.5rem] sm:rounded-[2.5rem] shadow-2xl border border-slate-100 animate-in fade-in slide-in-from-bottom-8 duration-700 text-center relative z-10">
            <div className="space-y-3 lg:space-y-4">
              <div className="inline-flex p-3 sm:p-4 bg-blue-500 rounded-2xl sm:rounded-3xl text-white shadow-xl shadow-blue-500/20 mb-2 lg:mb-4"><Mail size={24} className="sm:w-8 sm:h-8" /></div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tighter">{t.verifyEmailTitle}</h2>
              <p className="text-slate-400 font-bold uppercase tracking-[0.2em] lg:tracking-[0.3em] text-[10px] lg:text-xs">{t.verifyEmailDesc} {email}</p>
            </div>
            <div className="space-y-4">
              <button onClick={handleVerify} className="w-full py-4 sm:py-5 bg-slate-900 text-white rounded-xl sm:rounded-2xl font-black text-base sm:text-lg hover:bg-slate-800 transition-all shadow-2xl active:scale-95">{t.simulateVerify}</button>
              <button onClick={() => setView('login')} className="text-slate-400 font-black uppercase tracking-widest text-[9px] sm:text-[10px] hover:text-slate-900 transition-colors">{t.backToLogin}</button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex h-screen bg-slate-50 overflow-hidden relative w-full">
          {/* Mobile Sidebar Overlay */}
          {isMobileMenuOpen && (
            <div 
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60] lg:hidden"
              onClick={() => setIsMobileMenuOpen(false)}
            />
          )}

          <aside className={`fixed inset-y-0 left-0 w-72 sm:w-80 bg-white border-r border-slate-100 flex flex-col shrink-0 shadow-2xl lg:shadow-sm z-[70] transition-transform duration-300 lg:relative lg:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
            <div className="p-6 sm:p-8 lg:p-10">
              <div className="flex items-center justify-between mb-8 sm:mb-12 lg:mb-16">
                <div className="flex items-center gap-3">
                  <div className="bg-amber-500 p-2 rounded-xl"><Construction className="text-white" size={20} /></div>
                  <span className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tighter">{t.appName}</span>
                </div>
                <button onClick={() => setIsMobileMenuOpen(false)} className="lg:hidden p-2 text-slate-400 hover:text-slate-900">
                  <X size={24} />
                </button>
              </div>
              <nav className="space-y-1 sm:space-y-2 lg:space-y-3">
                {[
                  { id: 'dashboard', label: t.dashboard, icon: LayoutDashboard },
                  { id: 'budgets', label: t.budgets, icon: FileText },
                  { id: 'reports', label: t.reports, icon: BarChart3 },
                  { id: 'plans', label: t.plans, icon: Crown },
                  { id: 'settings', label: t.settings, icon: Settings }
                ].map(item => {
                  const isReportsLocked = item.id === 'reports' && currentUser?.plan === PlanType.FREE;
                  const hasPendingUnlock = item.id === 'settings' && currentUser?.unlockRequested;
                  
                  return (
                    <button 
                      key={item.id} 
                      onClick={() => { setActiveTab(item.id as any); setIsMobileMenuOpen(false); }} 
                      className={`w-full flex items-center gap-3 sm:gap-4 lg:gap-5 px-4 sm:px-5 lg:px-6 py-3 sm:py-3.5 lg:py-4 rounded-xl sm:rounded-[1.25rem] lg:rounded-[1.5rem] font-black transition-all ${activeTab === item.id ? 'bg-slate-900 text-white shadow-2xl' : 'text-slate-400 hover:bg-slate-50'}`}
                    >
                      <div className="relative">
                        <item.icon size={18} className="sm:w-[18px] sm:h-[18px] lg:w-5 lg:h-5" />
                        {isReportsLocked && <Lock size={10} className="absolute -top-1 -right-1 text-amber-500" />}
                        {hasPendingUnlock && <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-500 rounded-full border-2 border-white animate-pulse" />}
                      </div>
                      <span className="text-xs sm:text-sm lg:text-base">{item.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>
            <div className="mt-auto p-4 sm:p-6 border-t border-slate-50 space-y-4">
              <div className="lg:hidden flex flex-col gap-2 animate-in slide-in-from-bottom duration-500">
                <div className="flex items-center gap-2 bg-slate-900 border border-white/10 rounded-xl px-4 py-2.5 shadow-sm">
                  <Coins size={14} className="text-white/60" />
                  <select value={currencyCode} onChange={(e) => setCurrencyCode(e.target.value as CurrencyCode)} className="bg-transparent text-[10px] font-black text-white uppercase outline-none cursor-pointer tracking-widest w-full">
                    {Object.values(CURRENCIES).map(curr => <option key={curr.code} value={curr.code} className="text-slate-900">{curr.label}</option>)}
                  </select>
                </div>
                <div className="flex items-center gap-2 bg-slate-900 border border-white/10 rounded-xl px-4 py-2.5 shadow-sm">
                  <Globe size={14} className="text-white/60" />
                  <select value={locale} onChange={(e) => setLocale(e.target.value as Locale)} className="bg-transparent text-[10px] font-black text-white uppercase outline-none cursor-pointer tracking-widest w-full">
                    <option value="pt-PT" className="text-slate-900">🇵🇹 PT (Portugal)</option>
                    <option value="pt-BR" className="text-slate-900">🇧🇷 PT (Brasil)</option>
                    <option value="en-US" className="text-slate-900">🇺🇸 EN (English)</option>
                    <option value="fr-FR" className="text-slate-900">🇫🇷 FR (Français)</option>
                    <option value="it-IT" className="text-slate-900">🇮🇹 IT (Italiano)</option>
                    <option value="es-ES" className="text-slate-900">🇪🇸 ES (Español)</option>
                    <option value="ru-RU" className="text-slate-900">🇷🇺 RU (Pоссия)</option>
                    <option value="hi-IN" className="text-slate-900">🇮🇳 HI (भारत)</option>
                    <option value="bn-BD" className="text-slate-900">🇧🇩 BN (বাংলাদেশ)</option>
                  </select>
                </div>
              </div>
              <div className="bg-slate-50 p-3 sm:p-4 rounded-xl sm:rounded-2xl lg:rounded-3xl flex items-center gap-3 relative">
                <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-slate-900 rounded-lg sm:rounded-xl lg:rounded-2xl flex items-center justify-center font-black text-white uppercase overflow-hidden shrink-0">
                  {currentUser?.logo ? <img src={currentUser.logo} className="w-full h-full object-cover" alt="Logo" /> : currentUser?.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-black text-slate-900 truncate text-[10px] sm:text-xs lg:text-sm">{currentUser?.name}</p>
                  <p className="text-[8px] sm:text-[10px] lg:text-xs font-bold text-slate-400 uppercase tracking-tighter">{getTranslatedPlan(currentUser?.plan || PlanType.FREE)}</p>
                </div>
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white animate-bounce">
                    {unreadCount}
                  </span>
                )}
              </div>
              <button 
                onClick={() => { saveSession(null); setView('landing'); setCurrentUser(null); currentUserRef.current = null; }} 
                className="w-full flex items-center gap-3 sm:gap-4 px-4 sm:px-6 py-2 sm:py-3 text-slate-400 hover:text-red-500 transition-colors font-black uppercase tracking-widest text-[8px] sm:text-[9px] lg:text-[10px]"
              >
                <LogOut size={14} className="sm:w-4 sm:h-4 lg:w-[18px] lg:h-[18px]" /> {t.logout}
              </button>
            </div>
          </aside>

          <main className="flex-1 flex flex-col overflow-hidden w-full">
            <header className="h-20 lg:h-24 bg-white border-b border-slate-100 flex items-center justify-between px-4 sm:px-6 lg:px-12 shrink-0 gap-4">
              <div className="flex items-center gap-2 sm:gap-3 lg:hidden">
                <button 
                  onClick={() => setIsMobileMenuOpen(true)}
                  className="p-2 bg-amber-500 text-white rounded-xl hover:bg-amber-400 transition-all shadow-lg shadow-amber-500/40 animate-pulse"
                >
                  <LayoutDashboard size={20} />
                </button>
                <span className="text-lg sm:text-xl font-black tracking-tighter">{t.appName}</span>
              </div>

              <div className="hidden md:flex items-center bg-slate-50 rounded-xl lg:rounded-2xl px-4 lg:px-6 py-2.5 lg:py-3 w-full max-w-[12rem] sm:max-w-[16rem] lg:max-w-[28rem] border border-slate-100 focus-within:border-slate-300 transition-all">
                <Search className="text-slate-400 lg:w-5 lg:h-5" size={18} />
                <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder={t.searchPlaceholder} className="bg-transparent border-none outline-none px-3 lg:px-4 w-full text-xs lg:text-sm font-bold text-slate-700" />
              </div>

              <div className="flex items-center gap-2 sm:gap-3 lg:gap-8">
                <div className="hidden lg:block bg-slate-900 rounded-xl p-0.5"><Selectors /></div>
                <button 
                  onClick={() => { 
                    if (!canCreateBudget) {
                      alert(t.budgetLimitReached);
                      setActiveTab('plans');
                      return;
                    }
                    setSelectedBudget(undefined); 
                    setIsEditingBudget(true); 
                  }} 
                  className="px-3 sm:px-4 lg:px-8 py-2.5 lg:py-4 bg-slate-900 text-white rounded-xl lg:rounded-[1.5rem] font-black flex items-center gap-2 lg:gap-3 hover:bg-slate-800 transition-all shadow-2xl text-[10px] sm:text-xs lg:text-base"
                >
                  <PlusCircle size={16} className="sm:w-[18px] sm:h-[18px] lg:w-[22px] lg:h-[22px]" /> 
                  <span className="hidden xs:inline">{t.newBudget}</span>
                  <span className="xs:hidden">{t.newBudget.split(' ')[1] || t.newBudget}</span>
                </button>
              </div>
            </header>

            <div className="flex-1 overflow-y-auto p-4 sm:p-8 lg:p-12 no-scrollbar">
              {isEditingBudget ? (
                <BudgetForm locale={locale} currencyCode={currencyCode} company={currentUser!} onSave={handleSaveBudget} onCancel={() => setIsEditingBudget(false)} onUpgrade={() => { setIsEditingBudget(false); setActiveTab('plans'); }} initialData={selectedBudget} />
              ) : (
                <div className="max-w-6xl mx-auto space-y-8 lg:space-y-12">
                  {currentUser?.plan === PlanType.FREE && activeTab === 'dashboard' && <PremiumBanner locale={locale} onUpgrade={() => setActiveTab('plans')} />}
                  {activeTab === 'dashboard' && <Dashboard locale={locale} currencyCode={currencyCode} budgets={budgets} plan={currentUser?.plan || PlanType.FREE} onUpgrade={() => setActiveTab('plans')} />}
                  
                  {activeTab === 'reports' && (
                    currentUser?.plan === PlanType.FREE ? (
                      <div className="flex flex-col items-center justify-center min-h-[50vh] lg:min-h-[60vh] text-center animate-in fade-in duration-500 bg-white rounded-[2rem] lg:rounded-[3rem] border border-slate-100 shadow-sm p-8 lg:p-12">
                         <div className="w-16 h-16 lg:w-24 lg:h-24 bg-amber-50 text-amber-600 rounded-[1.5rem] lg:rounded-[2.5rem] flex items-center justify-center mb-6 lg:mb-8 shadow-xl shadow-amber-500/10 border border-amber-100"><Lock size={32} className="lg:w-12 lg:h-12" /></div>
                         <h2 className="text-2xl lg:text-4xl font-black text-slate-900 mb-3 lg:mb-4">{t.premiumAnalysisTitle}</h2>
                         <p className="text-sm lg:text-base text-slate-500 max-w-md mx-auto mb-8 lg:mb-10 font-medium leading-relaxed">{t.premiumAnalysisDesc}</p>
                         <button onClick={() => setActiveTab('plans')} className="px-8 lg:px-12 py-4 lg:py-5 bg-slate-900 text-white rounded-xl lg:rounded-[1.5rem] font-black hover:bg-slate-800 transition-all shadow-2xl flex items-center gap-3 lg:gap-4 text-sm lg:text-base"><Crown size={20} className="text-amber-400 lg:w-6 lg:h-6" /> {t.viewPremiumPlans}</button>
                      </div>
                    ) : <Reports budgets={budgets} locale={locale} currencyCode={currencyCode} onExportPdf={exportToPDF} />
                  )}

                  {activeTab === 'budgets' && (
                    <div className="space-y-6 lg:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
                        <h2 className="text-3xl lg:text-4xl font-black text-slate-900 tracking-tight">{t.budgetListTitle}</h2>
                        <div className="flex items-center gap-3 w-full sm:w-auto">
                          <Filter size={18} className="text-slate-400 shrink-0" />
                          <select value={budgetFilter} onChange={(e) => setBudgetFilter(e.target.value as any)} className="w-full sm:w-auto px-4 lg:px-5 py-2.5 lg:py-3 rounded-xl border-2 border-slate-100 bg-white font-black text-[10px] lg:text-xs text-slate-500 uppercase tracking-widest outline-none focus:border-slate-900 transition-all">
                            <option value="all">{t.allStatuses}</option>
                            <option value={BudgetStatus.PENDING}>{t.statusPending}</option>
                            <option value={BudgetStatus.APPROVED}>{t.statusApproved}</option>
                          </select>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 gap-4 lg:gap-5">
                        {filteredBudgets.length === 0 ? (
                          <div className="flex flex-col items-center justify-center py-12 lg:py-20 bg-white rounded-[2rem] lg:rounded-[3rem] border-2 border-dashed border-slate-100 p-6 text-center">
                            <button 
                              onClick={() => { 
                                if (!canCreateBudget) {
                                  alert(t.budgetLimitReached);
                                  setActiveTab('plans');
                                  return;
                                }
                                setSelectedBudget(undefined); 
                                setIsEditingBudget(true); 
                              }}
                              className="px-8 lg:px-12 py-4 lg:py-6 bg-slate-900 text-white rounded-[1.5rem] lg:rounded-[2rem] font-black text-lg lg:text-2xl hover:scale-105 transition-all shadow-2xl active:scale-95 uppercase tracking-tighter italic"
                            >
                              grave agora um novo orçamento
                            </button>
                          </div>
                        ) : (
                          filteredBudgets.map(budget => (
                            <div 
                              key={budget.id} 
                              onClick={() => {
                                setSelectedBudget(budget); 
                                setIsEditingBudget(true); 
                              }}
                              className="bg-white p-5 lg:p-8 rounded-[1.5rem] lg:rounded-[2rem] border border-slate-100 shadow-sm flex flex-col gap-4 lg:gap-6 group hover:border-slate-300 transition-all relative cursor-pointer"
                            >
                              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 lg:gap-10">
                                <div className={`w-12 h-12 lg:w-16 lg:h-16 rounded-xl lg:rounded-[1.5rem] flex items-center justify-center shrink-0 shadow-inner ${budget.status === BudgetStatus.APPROVED ? 'bg-emerald-50 text-emerald-600' : budget.status === BudgetStatus.REJECTED ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600'}`}>
                                  {budget.status === BudgetStatus.APPROVED ? <CheckCircle2 size={24} className="lg:w-7 lg:h-7" /> : budget.status === BudgetStatus.REJECTED ? <XCircle size={24} className="lg:w-7 lg:h-7" /> : <Clock size={24} className="lg:w-7 lg:h-7" />}
                                </div>
                                <div className="flex-1 min-w-0 w-full sm:w-auto">
                                  <div className="flex flex-wrap items-center gap-2 lg:gap-3 mb-1 lg:mb-2">
                                    <h4 className="font-black text-slate-900 text-base sm:text-lg lg:text-xl truncate">{budget.clientName}</h4>
                                    <div className="flex flex-wrap gap-2">
                                      <span className="text-[7px] sm:text-[8px] lg:text-[10px] font-black bg-slate-100 text-slate-500 px-2 lg:px-3 py-0.5 lg:py-1 rounded-full border border-slate-200 tracking-tighter uppercase">{t.budgetRef}: {budget.id}</span>
                                      <span className={`text-[7px] sm:text-[8px] lg:text-[10px] font-black px-2 lg:px-3 py-0.5 lg:py-1 rounded-full border tracking-tighter uppercase ${budget.status === BudgetStatus.APPROVED ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : budget.status === BudgetStatus.REJECTED ? 'bg-red-100 text-red-700 border-red-200' : 'bg-amber-100 text-amber-700 border-amber-200'}`}>{getTranslatedStatus(budget.status)}</span>
                                    </div>
                                  </div>
                                  <div className="flex flex-wrap items-center gap-3 sm:gap-4 lg:gap-6 text-[7px] sm:text-[8px] lg:text-[10px] font-black text-slate-400 uppercase tracking-widest lg:tracking-[0.2em]">
                                    <span className="flex items-center gap-1.5 lg:gap-2"><User size={10} className="sm:w-3 sm:h-3 lg:w-3.5 lg:h-3.5" /> {budget.contactName}</span>
                                    <span className="flex items-center gap-1.5 lg:gap-2"><Clock size={10} className="sm:w-3 sm:h-3 lg:w-3.5 lg:h-3.5" /> {new Date(budget.createdAt).toLocaleDateString(locale)}</span>
                                  </div>
                                </div>
                                <div className="sm:text-right w-full sm:w-auto border-t sm:border-t-0 border-slate-50 pt-3 sm:pt-0 flex sm:flex-col justify-between items-center sm:items-end">
                                  <p className="text-[7px] sm:text-[8px] lg:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5 lg:mb-1">{t.total}</p>
                                  <p className="text-lg sm:text-xl lg:text-3xl font-black text-slate-900">{(budget.totalAmount * CURRENCIES[currencyCode].rate).toLocaleString(locale, { style: 'currency', currency: currencyCode })}</p>
                                </div>
                                <div className="flex gap-2 lg:gap-3 sm:opacity-0 sm:group-hover:opacity-100 transition-all transform sm:translate-x-2 sm:group-hover:translate-x-0 w-full sm:w-auto justify-center sm:justify-end mt-2 sm:mt-0">
                                   <button 
                                    onClick={(e) => { 
                                      e.stopPropagation();
                                      setSelectedBudget(budget); 
                                      setShowPaymentManager(true); 
                                    }} 
                                    className="flex-1 sm:flex-none p-2.5 sm:p-3 lg:p-4 bg-emerald-50 text-emerald-600 rounded-xl lg:rounded-2xl hover:bg-emerald-600 hover:text-white transition-all shadow-sm flex items-center justify-center"
                                  >
                                    <PaymentIcon size={16} className="sm:w-[18px] sm:h-[18px] lg:w-[22px] lg:h-[22px]" />
                                  </button>
                                   <button 
                                    onClick={(e) => { 
                                      e.stopPropagation();
                                      setSelectedBudget(budget); 
                                      setShowExpenseManager(true); 
                                    }} 
                                    className="flex-1 sm:flex-none p-2.5 sm:p-3 lg:p-4 bg-red-50 text-red-600 rounded-xl lg:rounded-2xl hover:bg-red-600 hover:text-white transition-all shadow-sm flex items-center justify-center"
                                  >
                                    <Wallet size={16} className="sm:w-[18px] sm:h-[18px] lg:w-[22px] lg:h-[22px]" />
                                  </button>
                                  <button onClick={(e) => { e.stopPropagation(); exportToPDF(budget); }} className="flex-1 sm:flex-none p-2.5 sm:p-3 lg:p-4 bg-blue-50 text-blue-600 rounded-xl lg:rounded-2xl hover:bg-blue-600 hover:text-white transition-all shadow-sm flex items-center justify-center"><Download size={16} className="sm:w-[18px] sm:h-[18px] lg:w-[22px] lg:h-[22px]" /></button>
                                   <button 
                                    onClick={(e) => { 
                                      e.stopPropagation();
                                      setSelectedBudget(budget); 
                                      setIsEditingBudget(true); 
                                    }} 
                                    className="flex-1 sm:flex-none p-2.5 sm:p-3 lg:p-4 bg-slate-50 text-slate-900 rounded-xl lg:rounded-2xl hover:bg-slate-900 hover:text-white transition-all shadow-sm flex items-center justify-center"
                                  >
                                    <ChevronRight size={16} className="sm:w-[18px] sm:h-[18px] lg:w-[22px] lg:h-[22px]" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                  {activeTab === 'plans' && <Plans currentPlan={currentUser?.plan || PlanType.FREE} onSelect={handleUpgrade} locale={locale} currencyCode={currencyCode} isProcessing={isProcessingPayment} />}
                  {activeTab === 'settings' && (
                    <div className="bg-white rounded-[2rem] lg:rounded-[3rem] p-6 sm:p-8 lg:p-12 border border-slate-100 shadow-sm animate-in fade-in duration-500 max-w-5xl mx-auto relative overflow-hidden">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 lg:mb-10">
                        <h2 className="text-2xl lg:text-3xl font-black text-slate-900 tracking-tight">{t.companySettings}</h2>
                        {isSettingsLocked && (
                          <div className="flex flex-wrap items-center gap-3 lg:gap-4">
                            <span className="flex items-center gap-2 px-4 lg:px-6 py-2 lg:py-2.5 bg-amber-50 text-amber-600 rounded-lg lg:rounded-xl font-black text-[8px] lg:text-[10px] uppercase tracking-widest border border-amber-100"><Lock size={12} className="lg:w-3.5 lg:h-3.5" /> {t.dashboard}</span>
                            <button onClick={handleRequestUnlock} disabled={currentUser?.unlockRequested} className={`flex items-center gap-2 px-4 lg:px-6 py-2 lg:py-2.5 rounded-lg lg:rounded-xl font-black text-[8px] lg:text-[10px] uppercase tracking-widest transition-all ${currentUser?.unlockRequested ? 'bg-amber-100 text-amber-600 opacity-80' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}><Headphones size={12} className="lg:w-3.5 lg:h-3.5" /> {currentUser?.unlockRequested ? t.unlockRequestedNotify : t.settingsRequestUnlock}</button>
                          </div>
                        )}
                        {!isSettingsLocked && (currentUser?.logo || currentUser?.nif) && (<span className="flex items-center gap-2 px-4 lg:px-6 py-2 lg:py-2.5 bg-emerald-50 text-emerald-600 rounded-lg lg:rounded-xl font-black text-[8px] lg:text-[10px] uppercase tracking-widest border border-emerald-100 animate-pulse"><Unlock size={12} className="lg:w-3.5 lg:h-3.5" /> {t.masterUnlockAction}</span>)}
                      </div>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
                         <div className="space-y-6 lg:space-y-8">
                            <div className="space-y-3 lg:space-y-4">
                              <label className="block text-[10px] lg:text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">{t.companyLogo} {isSettingsLocked && <Lock size={10} className="text-amber-500" />}</label>
                              <label className={`border-4 border-dashed border-slate-100 rounded-[1.5rem] lg:rounded-[2.5rem] p-6 lg:p-10 flex flex-col items-center justify-center gap-3 lg:gap-4 transition-all overflow-hidden h-40 lg:h-48 relative ${isSettingsLocked ? 'bg-slate-50 cursor-not-allowed opacity-60' : 'cursor-pointer hover:bg-slate-50'}`}>
                                {settingsLogo ? <img src={settingsLogo} className={`absolute inset-0 w-full h-full object-contain p-4 ${isSettingsLocked ? 'opacity-40 grayscale' : ''}`} alt="Logo" /> : <><div className="w-10 h-10 lg:w-12 lg:h-12 bg-slate-100 text-slate-300 rounded-lg lg:rounded-[1rem] flex items-center justify-center group-hover:scale-110 transition-transform"><Download size={20} className="lg:w-6 lg:h-6" /></div><span className="text-[8px] lg:text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.uploadImage}</span></>}
                                <input disabled={isSettingsLocked} type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, setSettingsLogo)} />
                              </label>
                            </div>
                            <div className="space-y-3 lg:space-y-4">
                              <label className="block text-[10px] lg:text-xs font-black text-slate-400 uppercase tracking-widest">{t.companyQrCode}</label>
                              <label className="border-4 border-dashed border-slate-50 rounded-[1.5rem] lg:rounded-[2.5rem] p-6 lg:p-10 flex flex-col items-center justify-center gap-3 lg:gap-4 cursor-pointer hover:bg-slate-50 overflow-hidden h-40 lg:h-48 relative">
                                {settingsQrCode ? <img src={settingsQrCode} className="absolute inset-0 w-full h-full object-contain p-6 lg:p-8" alt="QR Code" /> : <><div className="w-10 h-10 lg:w-12 lg:h-12 bg-slate-100 text-slate-300 rounded-lg lg:rounded-[1rem] flex items-center justify-center group-hover:scale-110 transition-transform"><QrCode size={20} className="lg:w-6 lg:h-6" /></div><span className="text-[8px] lg:text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.uploadQrCode}</span></>}
                                <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, setSettingsQrCode)} />
                              </label>
                            </div>
                         </div>
                         <div className="space-y-6 lg:space-y-8">
                            <div><label className="block text-[10px] lg:text-xs font-black text-slate-400 uppercase tracking-widest mb-2 lg:mb-3 flex items-center gap-2">{t.companyLabel} {isSettingsLocked && <Lock size={10} className="text-amber-500" />}</label><input disabled={isSettingsLocked} type="text" value={settingsCompanyName} onChange={e => setSettingsCompanyName(e.target.value)} className={`w-full px-5 lg:px-6 py-3.5 lg:py-4 rounded-xl lg:rounded-2xl bg-slate-50 border-2 border-slate-100 outline-none font-bold transition-all text-sm lg:text-base ${isSettingsLocked ? 'opacity-50' : 'focus:border-slate-900'}`} /></div>
                            <div><label className="block text-[10px] lg:text-xs font-black text-slate-400 uppercase tracking-widest mb-2 lg:mb-3 flex items-center gap-2">{t.fiscalAddress} {isSettingsLocked && <Lock size={10} className="text-amber-500" />}</label><input disabled={isSettingsLocked} type="text" value={settingsAddress} onChange={e => setSettingsAddress(e.target.value)} className={`w-full px-5 lg:px-6 py-3.5 lg:py-4 rounded-xl lg:rounded-2xl bg-slate-50 border-2 border-slate-100 outline-none font-bold transition-all text-sm lg:text-base ${isSettingsLocked ? 'opacity-50' : 'focus:border-slate-900'}`} /></div>
                            <div><label className="block text-[10px] lg:text-xs font-black text-slate-400 uppercase tracking-widest mb-2 lg:mb-3 flex items-center gap-2">{t.nifLabel} {isSettingsLocked && <Lock size={10} className="text-amber-500" />}</label><input disabled={isSettingsLocked} type="text" value={settingsNif} onChange={e => setSettingsNif(e.target.value)} className={`w-full px-5 lg:px-6 py-3.5 lg:py-4 rounded-xl lg:rounded-2xl bg-slate-50 border-2 border-slate-100 outline-none font-bold transition-all text-sm lg:text-base ${isSettingsLocked ? 'opacity-50' : 'focus:border-slate-900'}`} /></div>
                            <div><label className="block text-[10px] lg:text-xs font-black text-slate-400 uppercase tracking-widest mb-2 lg:mb-3 flex items-center gap-2">{t.phone} {isSettingsLocked && <Lock size={10} className="text-amber-500" />}</label><input disabled={isSettingsLocked} type="text" value={settingsPhone} onChange={e => setSettingsPhone(e.target.value)} className={`w-full px-5 lg:px-6 py-3.5 lg:py-4 rounded-xl lg:rounded-2xl bg-slate-50 border-2 border-slate-100 outline-none font-bold transition-all text-sm lg:text-base ${isSettingsLocked ? 'opacity-50' : 'focus:border-slate-900'}`} /></div>
                            <div className="pt-4 lg:pt-6"><button onClick={handleSaveSettings} className="w-full py-5 lg:py-6 bg-slate-900 text-white rounded-2xl lg:rounded-[2rem] font-black text-lg lg:text-xl hover:bg-slate-800 shadow-2xl disabled:opacity-30">{t.saveChanges}</button></div>
                         </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </main>
          {showPaymentManager && selectedBudget && <PaymentManager locale={locale} currencyCode={currencyCode} budget={selectedBudget} plan={currentUser?.plan || PlanType.FREE} onUpgrade={() => { setShowPaymentManager(false); setActiveTab('plans'); }} onSave={(updated) => { handleSaveBudget(updated); setShowPaymentManager(false); }} onClose={() => setShowPaymentManager(false)} />}
          {showExpenseManager && selectedBudget && <ExpenseManager locale={locale} currencyCode={currencyCode} budget={selectedBudget} plan={currentUser?.plan || PlanType.FREE} onUpgrade={() => { setShowExpenseManager(false); setActiveTab('plans'); }} onSave={(updated) => { handleSaveBudget(updated); setShowExpenseManager(false); }} onClose={() => setShowExpenseManager(false)} />}
          <button onClick={() => { setShowSupportChat(true); setUnreadCount(0); markMessagesAsRead(currentUser!.id, 'user'); }} className="fixed bottom-8 right-8 w-16 h-16 bg-slate-900 text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-all z-[40]"><div className="relative"><Headphones size={28} />{unreadCount > 0 && <span className="absolute -top-4 -right-4 bg-red-500 text-white text-[10px] font-black w-6 h-6 rounded-full flex items-center justify-center border-4 border-slate-50">{unreadCount}</span>}</div></button>
          {showSupportChat && currentUser && <SupportChat locale={locale} company={currentUser} onClose={() => { setShowSupportChat(false); markMessagesAsRead(currentUser.id, 'user'); }} />}
          
          {isProcessingPayment && (
            <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-slate-900/90 backdrop-blur-xl animate-in fade-in duration-500">
              <div className="bg-white p-16 rounded-[4rem] shadow-2xl max-w-2xl w-full text-center space-y-10 transform animate-in zoom-in-95 duration-500 border border-slate-100">
                <div className="w-32 h-32 bg-amber-50 text-amber-500 rounded-[2.5rem] flex items-center justify-center mx-auto animate-bounce shadow-inner">
                  <ShieldCheck size={64} />
                </div>
                <div className="space-y-4">
                  <h3 className="text-4xl font-black text-slate-900 leading-tight tracking-tighter">
                    {t.stripeSecurePayment}
                  </h3>
                  <p className="text-slate-500 text-xl font-bold">
                    {t.redirecting}
                  </p>
                </div>
                <div className="space-y-6">
                  <div className="flex justify-center">
                    <div className="w-16 h-16 border-8 border-amber-500/10 border-t-amber-500 rounded-full animate-spin" />
                  </div>
                  <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden max-w-xs mx-auto">
                    <div className="h-full bg-amber-500 animate-[progress_8s_linear_forwards]" />
                  </div>
                </div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                  Powered by Stripe & Átrios Security
                </p>
              </div>
              <style>{`
                @keyframes progress {
                  0% { width: 0%; }
                  100% { width: 100%; }
                }
              `}</style>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default App;