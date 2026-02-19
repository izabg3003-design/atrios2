import { useState, useEffect, useMemo, useRef } from 'react';
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
  ShieldCheck
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
  hydrateLocalData
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

export const generateShortId = () => {
  return `ATR-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
};

const App: React.FC = () => {
  const [locale, setLocale] = useState<Locale>('pt-PT');
  const [currencyCode, setCurrencyCode] = useState<CurrencyCode>('EUR');
  const t = translations[locale];

  const [view, setView] = useState<'landing' | 'login' | 'signup' | 'verify' | 'app' | 'master'>('landing');
  const [activeTab, setActiveTab] = useState<'dashboard' | 'budgets' | 'plans' | 'settings' | 'reports'>('dashboard');
  const [currentUser, setCurrentUser] = useState<Company | null>(null);
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

  const currentUserRef = useRef<Company | null>(null);

  useEffect(() => {
    if (currentUser && view === 'app') {
      const interval = setInterval(() => {
        const all = getStoredCompanies();
        const updated = all.find(c => c.id === currentUser.id);
        if (updated) {
          if (!currentUserRef.current?.canEditSensitiveData && updated.canEditSensitiveData) {
            setShowUnlockAlert(true);
            setTimeout(() => setShowUnlockAlert(false), 8000);
          }
          if (JSON.stringify(currentUserRef.current) !== JSON.stringify(updated)) {
            setCurrentUser(updated);
            currentUserRef.current = updated;
          }
        }
      }, 5000);
      return () => clearInterval(interval);
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
        if (unread.length > unreadCount) {
          setShowNewMessageAlert(true);
          setTimeout(() => setShowNewMessageAlert(false), 8000);
        }
        setUnreadCount(unread.length);
      };

      checkMessages();
      const interval = setInterval(checkMessages, 5000);
      return () => clearInterval(interval);
    }
  }, [currentUser?.id, unreadCount]);

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

  const isSettingsLocked = useMemo(() => {
    if (!currentUser) return true;
    const hasData = !!(currentUser.logo || currentUser.nif);
    return hasData && !currentUser.canEditSensitiveData;
  }, [currentUser]);

  const filteredBudgets = useMemo(() => {
    return budgets.filter(budget => {
      const matchesFilter = budgetFilter === 'all' || budget.status === budgetFilter;
      const matchesSearch = budget.clientName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          budget.id.toLowerCase().includes(searchTerm.toLowerCase());
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
    if (company.logo && company.logo.length > 50) {
      try {
        const format = company.logo.toLowerCase().includes('image/png') ? 'PNG' : 'JPEG';
        doc.addImage(company.logo, format, 20, 10, 45, 45, undefined, 'FAST');
      } catch (err) {}
    }
    doc.setFontSize(18).setFont('helvetica', 'bold').setTextColor(33, 37, 41);
    doc.text(normalizeForPdf(company.name.toUpperCase()), 70, 20);
    doc.setFontSize(10).setFont('helvetica', 'normal').setTextColor(100, 116, 139);
    doc.text(normalizeForPdf(company.email), 70, 27);
    if (company.phone) doc.text(`${normalizeForPdf(pdfT.phone)}: ${normalizeForPdf(company.phone)}`, 70, 32);
    if (company.address) {
      const splitAddress = doc.splitTextToSize(normalizeForPdf(company.address), 70);
      doc.text(splitAddress, 70, 37);
    }
    doc.setFontSize(10).setFont('helvetica', 'bold').setTextColor(33, 37, 41);
    doc.text(`${normalizeForPdf(pdfT.budgetRef)}: #${budget.id.toUpperCase()}`, 140, 20);
    doc.setFont('helvetica', 'normal').setTextColor(100, 116, 139);
    doc.text(`${normalizeForPdf(pdfT.date)}: ${new Date(budget.createdAt).toLocaleDateString(locale)}`, 140, 25);
    if (budget.validity) doc.text(`${normalizeForPdf(pdfT.estimateValidity)}: ${normalizeForPdf(budget.validity)}`, 140, 30);
    if (company.qrCode && company.qrCode.length > 50) {
      try {
        const qrFormat = company.qrCode.toLowerCase().includes('image/png') ? 'PNG' : 'JPEG';
        doc.addImage(company.qrCode, qrFormat, 155, 35, 28, 28, undefined, 'FAST');
        doc.setFontSize(7).setTextColor(150, 150, 150).text(normalizeForPdf(pdfT.scanMe.toUpperCase()), 169, 66, { align: 'center' });
      } catch (err) {}
    }
    doc.setDrawColor(241, 245, 249).line(20, 78, 190, 78);
    doc.setFontSize(12).setFont('helvetica', 'bold').setTextColor(33, 37, 41);
    doc.text(normalizeForPdf(pdfT.clientIdentification.toUpperCase()), 20, 88);
    doc.setFontSize(10).setFont('helvetica', 'normal').setTextColor(100, 116, 139);
    let curY = 95;
    doc.text(`${normalizeForPdf(pdfT.clientName)}: ${normalizeForPdf(budget.clientName)}`, 20, curY); curY += 5;
    doc.text(`${normalizeForPdf(pdfT.contactName)}: ${normalizeForPdf(budget.contactName)}`, 20, curY); curY += 5;
    doc.text(`${normalizeForPdf(pdfT.phone)}: ${normalizeForPdf(budget.contactPhone)}`, 20, curY); curY += 5;
    if (budget.clientNif) { doc.text(`${normalizeForPdf(pdfT.clientNif)}: ${normalizeForPdf(budget.clientNif)}`, 20, curY); curY += 5; }
    doc.text(`${normalizeForPdf(pdfT.workLocation)}: ${normalizeForPdf(budget.workLocation)}`, 20, curY); curY += 5;
    doc.text(`${normalizeForPdf(pdfT.workNumber)}: ${normalizeForPdf(budget.workNumber)}`, 20, curY); curY += 5;
    doc.text(`${normalizeForPdf(pdfT.workPostalCode)}: ${normalizeForPdf(budget.workPostalCode)}`, 20, curY); curY += 5;
    autoTable(doc, {
      startY: curY + 5,
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
      headStyles: { fillColor: [33, 37, 41], fontStyle: 'bold' },
      styles: { fontSize: 8, font: 'helvetica' },
      margin: { left: 20, right: 20 }
    });
    const finalY = (doc as any).lastAutoTable.finalY;
    let sumY = finalY + 15;
    if (sumY + 60 > pageHeight) { doc.addPage(); sumY = 30; }
    const subTotal = budget.items.reduce((s, i) => s + i.total, 0);
    const ivaVal = budget.includeIva ? (subTotal * budget.ivaPercentage) / 100 : 0;
    const grandTotal = subTotal + ivaVal;
    if (budget.paymentMethod) {
      doc.setFontSize(10).setFont('helvetica', 'bold').setTextColor(33, 37, 41);
      doc.text(`${normalizeForPdf(pdfT.paymentMethodLabel.toUpperCase())}:`, 120, sumY - 8);
      doc.setFont('helvetica', 'normal').setTextColor(100, 116, 139);
      doc.text(doc.splitTextToSize(normalizeForPdf(budget.paymentMethod), 70), 120, sumY - 3);
    }
    doc.setFontSize(10).setFont('helvetica', 'normal').setTextColor(33, 37, 41);
    if (budget.includeIva) {
      doc.text(`${normalizeForPdf(pdfT.ivaValue)} (${budget.ivaPercentage}%):`, 120, sumY);
      doc.text(`${(ivaVal * currencyInfo.rate).toFixed(2)} ${currencyInfo.code}`, 185, sumY, { align: 'right' });
      sumY += 7;
    }
    doc.setFontSize(13).setFont('helvetica', 'bold');
    doc.text(`${normalizeForPdf(pdfT.total.toUpperCase())}:`, 120, sumY + 3);
    doc.text(`${(grandTotal * currencyInfo.rate).toFixed(2)} ${currencyInfo.code}`, 185, sumY + 3, { align: 'right' });
    if (budget.observations) {
      let obsY = sumY + 25;
      if (obsY + 20 > pageHeight) { doc.addPage(); obsY = 25; }
      doc.setFont('helvetica', 'bold').setFontSize(11).setTextColor(33, 37, 41);
      doc.text(normalizeForPdf(pdfT.observationsLabel.toUpperCase()), margin, obsY);
      doc.setFont('helvetica', 'normal').setFontSize(9).setTextColor(71, 85, 105);
      const lines = doc.splitTextToSize(normalizeForPdf(budget.observations), usableWidth);
      doc.text(lines, margin, obsY + 8);
    }
    doc.save(`Atrios_Budget_${normalizeForPdf(budget.clientName).replace(/\s/g, '_')}.pdf`);
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

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Verificar se e-mail já existe no Supabase
    const { data: existing } = await supabase.from('companies').select('id').eq('email', email).single();
    if (existing) {
       alert("Este e-mail já está em uso.");
       return;
    }

    const newCompany: Company = {
      id: Math.random().toString(36).substr(2, 9).toUpperCase(),
      name: companyName,
      email,
      password,
      plan: PlanType.FREE,
      verified: false,
      createdAt: new Date().toISOString(),
      lastLocale: locale
    };
    saveCompany(newCompany);
    setView('verify');
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
    if (!currentUser) return;
    saveBudget(budget);
    setBudgets(getStoredBudgets(currentUser.id));
    setIsEditingBudget(false);
    setSelectedBudget(undefined);
  };

  const handleUpgrade = (plan: PlanType, finalPrice: number, coupon?: string) => {
    if (!currentUser) return;
    const now = new Date();
    let expirationDate = new Date();
    if (plan === PlanType.PREMIUM_MONTHLY) expirationDate.setDate(now.getDate() + 30);
    else if (plan === PlanType.PREMIUM_ANNUAL) expirationDate.setDate(now.getDate() + 360);
    
    const updated = { ...currentUser, plan: plan, subscriptionExpiresAt: plan === PlanType.FREE ? undefined : expirationDate.toISOString() };
    if (plan !== PlanType.FREE) {
      const ivaVal = finalPrice * 0.23;
      const tx: Transaction = {
        id: Math.random().toString(36).substr(2, 9).toUpperCase(),
        companyId: currentUser.id,
        companyName: currentUser.name,
        planType: plan,
        amount: finalPrice - ivaVal,
        // Fix: Corrected typo 'iivaVal' to 'ivaVal'
        ivaAmount: ivaVal,
        totalAmount: finalPrice,
        couponUsed: coupon,
        date: now.toISOString()
      };
      saveTransaction(tx);
    }
    saveCompany(updated);
    setCurrentUser(updated);
    currentUserRef.current = updated;
    setActiveTab('dashboard');
    alert(t.upgradeSuccess);
  };

  const handleSaveSettings = () => {
    if (!currentUser) return;
    if (isSettingsLocked) { alert(t.settingsPassError); return; }
    setShowSettingsConfirmModal(true);
  };

  const confirmSensitiveSave = () => {
    if (!currentUser) return;
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

  if (view === 'master') return <MasterPanel onLogout={() => setView('landing')} locale={locale} />;

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

      {view === 'landing' ? (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-900 overflow-hidden relative w-full">
          <div className="absolute top-8 right-8 z-50"><Selectors /></div>
          <div className="z-10 text-center max-w-2xl px-4">
            <div className="flex items-center justify-center gap-4 mb-8"><div className="bg-amber-500 p-5 rounded-[2rem] shadow-2xl rotate-12"><Construction className="text-white" size={48} /></div><h1 className="text-7xl font-black text-white tracking-tighter italic">{t.appName}</h1></div>
            <h2 className="text-3xl text-slate-300 font-medium mb-16 leading-relaxed">{t.heroTitle}</h2>
            <div className="flex flex-col sm:flex-row gap-5 justify-center"><button onClick={() => setView('signup')} className="px-12 py-6 bg-amber-500 text-slate-900 rounded-3xl font-black text-xl hover:bg-amber-400 transition-all shadow-2xl">{t.heroCta}</button><button onClick={() => setView('login')} className="px-12 py-6 bg-white/10 text-white border-2 border-white/20 rounded-3xl font-black text-xl hover:bg-white/20 transition-all">{t.loginBtn}</button></div>
          </div>
        </div>
      ) : (view === 'login' || view === 'signup') ? (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 relative w-full">
          <div className="bg-white w-full max-w-md p-12 rounded-[3rem] shadow-2xl border border-slate-100">
            <div className="flex items-center gap-3 mb-10 justify-center"><Construction className="text-amber-500" size={40} /><span className="text-4xl font-black tracking-tighter">{t.appName}</span></div>
            <h2 className="text-3xl font-black text-slate-900 mb-8">{view === 'login' ? t.welcomeBack : t.createAccount}</h2>
            <form onSubmit={view === 'login' ? handleLogin : handleSignup} className="space-y-5">
              {view === 'signup' && <input required type="text" value={companyName} onChange={e => setCompanyName(e.target.value)} placeholder={t.companyLabel} className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-2 border-slate-100 outline-none font-bold" />}
              <input required type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder={t.emailLabel} className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-2 border-slate-100 outline-none font-bold" />
              <input required type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder={t.passwordLabel} className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-2 border-slate-100 outline-none font-bold" />
              <button className="w-full py-5 bg-slate-900 text-white rounded-3xl font-black text-xl hover:bg-slate-800 transition-all shadow-2xl">{view === 'login' ? t.loginBtn : t.registerBtn}</button>
            </form>
            <div className="mt-8 text-center"><button onClick={() => setView(view === 'login' ? 'signup' : 'login')} className="text-slate-400 font-bold hover:text-slate-900 underline">{view === 'login' ? t.noAccount : t.haveAccount}</button></div>
          </div>
        </div>
      ) : view === 'verify' ? (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 w-full text-center">
          <div className="bg-white w-full max-w-md p-12 rounded-[3rem] shadow-2xl border border-slate-100">
            <div className="w-24 h-24 bg-emerald-50 text-emerald-500 rounded-[2rem] flex items-center justify-center mx-auto mb-8"><Bell size={48} /></div>
            <h2 className="text-3xl font-black mb-4">{t.verifyEmailTitle}</h2>
            <p className="text-slate-500 mb-10">{t.verifyEmailDesc} <b>{email}</b>.</p>
            <button onClick={handleVerify} className="w-full py-5 bg-emerald-600 text-white rounded-3xl font-black text-xl">{t.simulateVerify}</button>
          </div>
        </div>
      ) : (
        <>
          <aside className="w-80 bg-white border-r border-slate-100 flex flex-col shrink-0 shadow-sm">
            <div className="p-10">
              <div className="flex items-center gap-3 mb-16"><div className="bg-amber-500 p-2 rounded-xl"><Construction className="text-white" size={24} /></div><span className="text-3xl font-black tracking-tighter">{t.appName}</span></div>
              <nav className="space-y-3">
                {[
                  { id: 'dashboard', label: t.dashboard, icon: LayoutDashboard },
                  { id: 'budgets', label: t.budgets, icon: FileText },
                  { id: 'reports', label: t.reports, icon: BarChart3 },
                  { id: 'plans', label: t.plans, icon: Crown },
                  { id: 'settings', label: t.settings, icon: Settings }
                ].map(item => {
                  const isReportsLocked = item.id === 'reports' && currentUser?.plan === PlanType.FREE;
                  return (
                    <button key={item.id} onClick={() => setActiveTab(item.id as any)} className={`w-full flex items-center gap-5 px-6 py-4 rounded-[1.5rem] font-black transition-all ${activeTab === item.id ? 'bg-slate-900 text-white shadow-2xl' : 'text-slate-400 hover:bg-slate-50'}`}>
                      <div className="relative"><item.icon size={20} />{isReportsLocked && <Lock size={10} className="absolute -top-1 -right-1 text-amber-500" />}</div>
                      {item.label}
                    </button>
                  );
                })}
              </nav>
            </div>
            <div className="mt-auto p-10 border-t border-slate-50 space-y-6">
              <div className="bg-slate-50 p-4 rounded-3xl flex items-center gap-3">
                <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center font-black text-white uppercase overflow-hidden">{currentUser?.logo ? <img src={currentUser.logo} className="w-full h-full object-cover" alt="Logo" /> : currentUser?.name.charAt(0)}</div>
                <div className="flex-1 min-w-0"><p className="font-black text-slate-900 truncate text-sm">{currentUser?.name}</p><p className="text-xs font-bold text-slate-400 uppercase tracking-tighter">{getTranslatedPlan(currentUser?.plan || PlanType.FREE)}</p></div>
              </div>
              <button onClick={() => { setView('landing'); setCurrentUser(null); currentUserRef.current = null; }} className="w-full flex items-center gap-4 px-6 py-4 text-slate-400 hover:text-red-500 transition-colors font-black uppercase tracking-widest text-xs"><LogOut size={18} /> {t.logout}</button>
            </div>
          </aside>
          <main className="flex-1 flex flex-col overflow-hidden">
            <header className="h-24 bg-white border-b border-slate-100 flex items-center justify-between px-12 shrink-0">
              <div className="flex items-center bg-slate-50 rounded-2xl px-6 py-3 w-[28rem] border border-slate-100 focus-within:border-slate-300 transition-all"><Search className="text-slate-400" size={20} /><input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder={t.searchPlaceholder} className="bg-transparent border-none outline-none px-4 w-full text-sm font-bold text-slate-700" /></div>
              <div className="flex items-center gap-8"><div className="bg-slate-900 rounded-xl p-0.5"><Selectors /></div><button onClick={() => { setSelectedBudget(undefined); setIsEditingBudget(true); }} className="px-8 py-4 bg-slate-900 text-white rounded-[1.5rem] font-black flex items-center gap-3 hover:bg-slate-800 transition-all shadow-2xl"><PlusCircle size={22} /> {t.newBudget}</button></div>
            </header>
            <div className="flex-1 overflow-y-auto p-12 no-scrollbar">
              {isEditingBudget ? (
                <BudgetForm locale={locale} currencyCode={currencyCode} company={currentUser!} onSave={handleSaveBudget} onCancel={() => setIsEditingBudget(false)} onUpgrade={() => { setIsEditingBudget(false); setActiveTab('plans'); }} initialData={selectedBudget} />
              ) : (
                <div className="max-w-6xl mx-auto space-y-12">
                  {currentUser?.plan === PlanType.FREE && activeTab === 'dashboard' && <PremiumBanner locale={locale} onUpgrade={() => setActiveTab('plans')} />}
                  {activeTab === 'dashboard' && <Dashboard locale={locale} currencyCode={currencyCode} budgets={budgets} plan={currentUser?.plan || PlanType.FREE} onUpgrade={() => setActiveTab('plans')} />}
                  
                  {activeTab === 'reports' && (
                    currentUser?.plan === PlanType.FREE ? (
                      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center animate-in fade-in duration-500 bg-white rounded-[3rem] border border-slate-100 shadow-sm p-12">
                         <div className="w-24 h-24 bg-amber-50 text-amber-600 rounded-[2.5rem] flex items-center justify-center mb-8 shadow-xl shadow-amber-500/10 border border-amber-100"><Lock size={48} /></div>
                         <h2 className="text-4xl font-black text-slate-900 mb-4">{t.premiumAnalysisTitle}</h2>
                         <p className="text-slate-500 max-w-md mx-auto mb-10 font-medium leading-relaxed">{t.premiumAnalysisDesc}</p>
                         <button onClick={() => setActiveTab('plans')} className="px-12 py-5 bg-slate-900 text-white rounded-[1.5rem] font-black hover:bg-slate-800 transition-all shadow-2xl flex items-center gap-4"><Crown size={24} className="text-amber-400" /> {t.viewPremiumPlans}</button>
                      </div>
                    ) : <Reports budgets={budgets} locale={locale} currencyCode={currencyCode} onExportPdf={exportToPDF} />
                  )}

                  {activeTab === 'budgets' && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                      <div className="flex justify-between items-end"><h2 className="text-4xl font-black text-slate-900 tracking-tight">{t.budgetListTitle}</h2><div className="flex items-center gap-3"><Filter size={18} className="text-slate-400" /><select value={budgetFilter} onChange={(e) => setBudgetFilter(e.target.value as any)} className="px-5 py-3 rounded-xl border-2 border-slate-100 bg-white font-black text-xs text-slate-500 uppercase tracking-widest outline-none focus:border-slate-900 transition-all"><option value="all">{t.allStatuses}</option><option value={BudgetStatus.PENDING}>{t.statusPending}</option><option value={BudgetStatus.APPROVED}>{t.statusApproved}</option></select></div></div>
                      <div className="grid grid-cols-1 gap-5">
                        {filteredBudgets.length === 0 ? (
                          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[3rem] border-2 border-dashed border-slate-100">
                            <button 
                              onClick={() => { setSelectedBudget(undefined); setIsEditingBudget(true); }}
                              className="px-12 py-6 bg-slate-900 text-white rounded-[2rem] font-black text-2xl hover:scale-105 transition-all shadow-2xl active:scale-95 uppercase tracking-tighter italic"
                            >
                              grave agora um novo orçamento
                            </button>
                          </div>
                        ) : (
                          filteredBudgets.map(budget => (
                            <div key={budget.id} className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col gap-6 group hover:border-slate-300 transition-all">
                              <div className="flex items-center gap-10">
                                <div className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center shrink-0 shadow-inner ${budget.status === BudgetStatus.APPROVED ? 'bg-emerald-50 text-emerald-600' : budget.status === BudgetStatus.REJECTED ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600'}`}>{budget.status === BudgetStatus.APPROVED ? <CheckCircle2 size={28} /> : budget.status === BudgetStatus.REJECTED ? <XCircle size={28} /> : <Clock size={28} />}</div>
                                <div className="flex-1">
                                  <div className="flex items-center gap-3 mb-2"><h4 className="font-black text-slate-900 text-xl">{budget.clientName}</h4><span className="text-[10px] font-black bg-slate-100 text-slate-500 px-3 py-1 rounded-full border border-slate-200 tracking-tighter uppercase">{t.budgetRef}: {budget.id}</span><span className={`text-[10px] font-black px-3 py-1 rounded-full border tracking-tighter uppercase ${budget.status === BudgetStatus.APPROVED ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : budget.status === BudgetStatus.REJECTED ? 'bg-red-100 text-red-700 border-red-200' : 'bg-amber-100 text-amber-700 border-amber-200'}`}>{getTranslatedStatus(budget.status)}</span></div>
                                  <div className="flex flex-wrap items-center gap-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]"><span className="flex items-center gap-2"><User size={14} /> {budget.contactName}</span><span className="flex items-center gap-2"><Clock size={14} /> {new Date(budget.createdAt).toLocaleDateString(locale)}</span></div>
                                </div>
                                <div className="text-right"><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{t.total}</p><p className="text-3xl font-black text-slate-900">{(budget.totalAmount * CURRENCIES[currencyCode].rate).toLocaleString(locale, { style: 'currency', currency: currencyCode })}</p></div>
                                <div className="flex gap-3 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                                  <button onClick={() => { setSelectedBudget(budget); setShowPaymentManager(true); }} className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl hover:bg-emerald-600 hover:text-white transition-all shadow-sm"><PaymentIcon size={22} /></button>
                                  <button onClick={() => { setSelectedBudget(budget); setShowExpenseManager(true); }} className="p-4 bg-red-50 text-red-600 rounded-2xl hover:bg-red-600 hover:text-white transition-all shadow-sm"><Wallet size={22} /></button>
                                  <button onClick={() => exportToPDF(budget)} className="p-4 bg-blue-50 text-blue-600 rounded-2xl hover:bg-blue-600 hover:text-white transition-all shadow-sm"><Download size={22} /></button>
                                  <button onClick={() => { setSelectedBudget(budget); setIsEditingBudget(true); }} className="p-4 bg-slate-50 text-slate-900 rounded-2xl hover:bg-slate-900 hover:text-white transition-all shadow-sm"><ChevronRight size={22} /></button>
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                  {activeTab === 'plans' && <Plans currentPlan={currentUser?.plan || PlanType.FREE} onSelect={handleUpgrade} locale={locale} currencyCode={currencyCode} />}
                  {activeTab === 'settings' && (
                    <div className="bg-white rounded-[3rem] p-12 border border-slate-100 shadow-sm animate-in fade-in duration-500 max-w-5xl mx-auto relative overflow-hidden">
                      <div className="flex justify-between items-center mb-10">
                        <h2 className="text-3xl font-black text-slate-900 tracking-tight">{t.companySettings}</h2>
                        {isSettingsLocked && (
                          <div className="flex items-center gap-4">
                            <span className="flex items-center gap-2 px-6 py-2.5 bg-amber-50 text-amber-600 rounded-xl font-black text-[10px] uppercase tracking-widest border border-amber-100"><Lock size={14} /> {t.dashboard}</span>
                            <button onClick={handleRequestUnlock} disabled={currentUser?.unlockRequested} className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${currentUser?.unlockRequested ? 'bg-amber-100 text-amber-600 opacity-80' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}><Headphones size={14} /> {currentUser?.unlockRequested ? t.unlockRequestedNotify : t.settingsRequestUnlock}</button>
                          </div>
                        )}
                        {!isSettingsLocked && (currentUser?.logo || currentUser?.nif) && (<span className="flex items-center gap-2 px-6 py-2.5 bg-emerald-50 text-emerald-600 rounded-xl font-black text-[10px] uppercase tracking-widest border border-emerald-100 animate-pulse"><Unlock size={14} /> {t.masterUnlockAction}</span>)}
                      </div>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                         <div className="space-y-8">
                            <div className="space-y-4">
                              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">{t.companyLogo} {isSettingsLocked && <Lock size={10} className="text-amber-500" />}</label>
                              <label className={`border-4 border-dashed border-slate-100 rounded-[2.5rem] p-10 flex flex-col items-center justify-center gap-4 transition-all overflow-hidden h-48 relative ${isSettingsLocked ? 'bg-slate-50 cursor-not-allowed opacity-60' : 'cursor-pointer hover:bg-slate-50'}`}>
                                {settingsLogo ? <img src={settingsLogo} className={`absolute inset-0 w-full h-full object-contain p-4 ${isSettingsLocked ? 'opacity-40 grayscale' : ''}`} alt="Logo" /> : <><div className="w-12 h-12 bg-slate-100 text-slate-300 rounded-[1rem] flex items-center justify-center group-hover:scale-110 transition-transform"><Download size={24} /></div><span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.uploadImage}</span></>}
                                <input disabled={isSettingsLocked} type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, setSettingsLogo)} />
                              </label>
                            </div>
                            <div className="space-y-4">
                              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest">{t.companyQrCode}</label>
                              <label className="border-4 border-dashed border-white/10 rounded-[2.5rem] p-10 flex flex-col items-center justify-center gap-4 cursor-pointer hover:bg-slate-50 overflow-hidden h-48 relative">
                                {settingsQrCode ? <img src={settingsQrCode} className="absolute inset-0 w-full h-full object-contain p-8" alt="QR Code" /> : <><div className="w-12 h-12 bg-slate-100 text-slate-300 rounded-[1rem] flex items-center justify-center group-hover:scale-110 transition-transform"><QrCode size={24} /></div><span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.uploadQrCode}</span></>}
                                <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, setSettingsQrCode)} />
                              </label>
                            </div>
                         </div>
                         <div className="space-y-8">
                            <div><label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">{t.companyLabel} {isSettingsLocked && <Lock size={10} className="text-amber-500" />}</label><input disabled={isSettingsLocked} type="text" value={settingsCompanyName} onChange={e => setSettingsCompanyName(e.target.value)} className={`w-full px-6 py-4 rounded-2xl bg-slate-50 border-2 border-slate-100 outline-none font-bold transition-all ${isSettingsLocked ? 'opacity-50' : 'focus:border-slate-900'}`} /></div>
                            <div><label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">{t.fiscalAddress} {isSettingsLocked && <Lock size={10} className="text-amber-500" />}</label><input disabled={isSettingsLocked} type="text" value={settingsAddress} onChange={e => setSettingsAddress(e.target.value)} className={`w-full px-6 py-4 rounded-2xl bg-slate-50 border-2 border-slate-100 outline-none font-bold transition-all ${isSettingsLocked ? 'opacity-50' : 'focus:border-slate-900'}`} /></div>
                            <div><label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">{t.nifLabel} {isSettingsLocked && <Lock size={10} className="text-amber-500" />}</label><input disabled={isSettingsLocked} type="text" value={settingsNif} onChange={e => setSettingsNif(e.target.value)} className={`w-full px-6 py-4 rounded-2xl bg-slate-50 border-2 border-slate-100 outline-none font-bold transition-all ${isSettingsLocked ? 'opacity-50' : 'focus:border-slate-900'}`} /></div>
                            <div><label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">{t.phone} {isSettingsLocked && <Lock size={10} className="text-amber-500" />}</label><input disabled={isSettingsLocked} type="text" value={settingsPhone} onChange={e => setSettingsPhone(e.target.value)} className={`w-full px-6 py-4 rounded-2xl bg-slate-50 border-2 border-slate-100 outline-none font-bold transition-all ${isSettingsLocked ? 'opacity-50' : 'focus:border-slate-900'}`} /></div>
                            <div className="pt-6"><button onClick={handleSaveSettings} className="w-full py-6 bg-slate-900 text-white rounded-[2rem] font-black text-xl hover:bg-slate-800 shadow-2xl disabled:opacity-30">{t.saveChanges}</button></div>
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
        </>
      )}
    </div>
  );
};

export default App;