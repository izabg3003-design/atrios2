import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  FileText, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar, 
  Clock, 
  ChevronRight, 
  CheckCircle2, 
  AlertCircle, 
  ArrowLeft, 
  Eye, 
  Download, 
  Sparkles, 
  LogOut, 
  Search, 
  Filter, 
  DollarSign, 
  User, 
  Send,
  Lock,
  KeyRound,
  ExternalLink,
  MessageCircle,
  Plus,
  PlusCircle,
  Copy,
  Check,
  Wrench,
  Image as ImageIcon,
  Tag,
  X,
  Globe,
  Languages,
  QrCode
} from 'lucide-react';
import { ClientServiceRequest, Budget, BudgetStatus, CURRENCIES, CurrencyCode } from '../types';
import { Locale } from '../translations';
import { clientPortalTranslations } from './clientPortalTranslations';
import { LOCALE_OPTIONS } from './landingExtendedTranslations';
import { 
  getStoredClientRequests, 
  fetchClientRequestsFromSupabase, 
  getStoredBudgets, 
  fetchBudgetsFromSupabase,
  getStoredCompanies
} from '../services/storage';
import { supabase } from '../services/supabase';
import { registerPushSubscription } from '../services/pushService';
import { ClientRequestModal } from './ClientRequestModal';
import { ClientLiveChat } from './ClientLiveChat';

interface ClientPortalProps {
  onBackToHome: () => void;
  currencyCode?: CurrencyCode;
  initialLocale?: Locale;
}

export const ClientPortal: React.FC<ClientPortalProps> = ({
  onBackToHome,
  currencyCode = 'EUR',
  initialLocale
}) => {
  // Locale state
  const [portalLocale, setPortalLocale] = useState<Locale>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const urlLang = params.get('lang') || params.get('locale');
      if (urlLang && clientPortalTranslations[urlLang as Locale]) {
        return urlLang as Locale;
      }
    }
    if (initialLocale && clientPortalTranslations[initialLocale]) {
      return initialLocale;
    }
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('atrios_locale') as Locale;
      if (saved && clientPortalTranslations[saved]) return saved;
    }
    return 'pt-PT';
  });

  const t = clientPortalTranslations[portalLocale] || clientPortalTranslations['pt-PT'];

  const handleLanguageChange = (newLoc: Locale) => {
    setPortalLocale(newLoc);
    if (typeof window !== 'undefined') {
      localStorage.setItem('atrios_locale', newLoc);
    }
  };

  // Authentication state for the client
  const [authenticatedPhone, setAuthenticatedPhone] = useState<string>(() => {
    return localStorage.getItem('atrios_client_session_phone') || '';
  });
  const [phoneInput, setPhoneInput] = useState('');
  const [accessCodeInput, setAccessCodeInput] = useState('');
  const [loginStep, setLoginStep] = useState<'phone' | 'otp'>('phone');
  const [simulatedOtp, setSimulatedOtp] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Data state
  const [myRequests, setMyRequests] = useState<ClientServiceRequest[]>([]);
  const [myBudgets, setMyBudgets] = useState<Budget[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<ClientServiceRequest | null>(null);
  const [selectedBudgetView, setSelectedBudgetView] = useState<Budget | null>(null);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [activePortalTab, setActivePortalTab] = useState<'all_budgets' | 'my_requests' | 'live_chat'>('all_budgets');

  // Modal para Nova Solicitação (Permite criar N solicitações com IDs distintos para o mesmo cliente)
  const [isNewRequestModalOpen, setIsNewRequestModalOpen] = useState(false);
  const [newlyCreatedRequestId, setNewlyCreatedRequestId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Informações do cliente memorizadas dos pedidos anteriores
  const existingClientName = myRequests.find(r => r.clientName)?.clientName || '';
  const existingClientEmail = myRequests.find(r => r.clientEmail)?.clientEmail || '';
  const existingAccessCode = myRequests.find(r => r.accessCode)?.accessCode 
    || (authenticatedPhone ? localStorage.getItem(`atrios_client_code_${authenticatedPhone.replace(/\D/g, '')}`) : null)
    || (authenticatedPhone ? localStorage.getItem(`atrios_client_code_${authenticatedPhone.trim()}`) : null)
    || undefined;

  // Load client data once authenticated
  const loadClientData = async (phone: string) => {
    setIsLoadingData(true);
    try {
      // 1. Normalize phone to match variations (spaces, hyphens, country code)
      const cleanPhone = phone.replace(/\D/g, '');

      // 2. Fetch requests from Supabase / local storage
      const allRequests = await fetchClientRequestsFromSupabase();
      const filteredRequests = allRequests.filter(req => {
        const reqPhoneClean = (req.clientPhone || '').replace(/\D/g, '');
        return (
          reqPhoneClean === cleanPhone ||
          (cleanPhone.length >= 7 && reqPhoneClean.includes(cleanPhone)) ||
          (reqPhoneClean.length >= 7 && cleanPhone.includes(reqPhoneClean))
        );
      });
      // Ordenar os pedidos do mais recente para o mais antigo
      filteredRequests.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setMyRequests(filteredRequests);

      // 3. Fetch budgets sent by contractors
      const allBudgets = await fetchBudgetsFromSupabase();
      const filteredBudgets = allBudgets.filter(b => {
        const budgetPhoneClean = (b.contactPhone || '').replace(/\D/g, '');
        const clientNameMatch = filteredRequests.some(r => 
          r.clientName && b.clientName && r.clientName.trim().toLowerCase() === b.clientName.trim().toLowerCase()
        );
        return (
          budgetPhoneClean === cleanPhone ||
          (cleanPhone.length >= 7 && budgetPhoneClean.includes(cleanPhone)) ||
          clientNameMatch
        );
      });
      filteredBudgets.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setMyBudgets(filteredBudgets);
    } catch (err) {
      console.error('Error loading client portal data:', err);
    } finally {
      setIsLoadingData(false);
    }
  };

  useEffect(() => {
    if (authenticatedPhone) {
      loadClientData(authenticatedPhone);

      // Sincronizar subscrição Push para este telemóvel de cliente
      if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
        const cleanPhone = authenticatedPhone.replace(/\D/g, '');
        registerPushSubscription({
          companyId: cleanPhone,
          phone: cleanPhone,
          role: 'client',
          plan: 'client',
          name: `Cliente (${authenticatedPhone})`
        }).catch(err => console.warn('[ClientPortal] Push sync skipped:', err));
      }
    }
  }, [authenticatedPhone]);

  // Listener para atualizações em tempo real de novas solicitações
  useEffect(() => {
    const handleRequestsChange = () => {
      if (authenticatedPhone) {
        loadClientData(authenticatedPhone);
      }
    };
    window.addEventListener('atrios_client_requests_changed', handleRequestsChange);
    return () => {
      window.removeEventListener('atrios_client_requests_changed', handleRequestsChange);
    };
  }, [authenticatedPhone]);

  // Handle phone login submit
  const handleRequestAccess = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);

    const clean = phoneInput.replace(/\D/g, '');
    if (clean.length < 6) {
      setLoginError(t.errorInvalidPhone);
      return;
    }

    setIsLoggingIn(true);
    try {
      const finalPhone = phoneInput.trim();
      localStorage.setItem('atrios_client_session_phone', finalPhone);
      setAuthenticatedPhone(finalPhone);
      setPhoneInput('');
      setAccessCodeInput('');
      setSimulatedOtp(null);
    } catch (err) {
      setLoginError(t.errorLoginFailed);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleVerifyAccessCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);

    const entered = accessCodeInput.trim();
    const cleanPhone = phoneInput.replace(/\D/g, '');

    // Check against Supabase / storage requests for valid accessCode
    const allRequests = await fetchClientRequestsFromSupabase();
    const clientReqs = allRequests.filter(req => {
      const reqPhoneClean = (req.clientPhone || '').replace(/\D/g, '');
      return (
        reqPhoneClean === cleanPhone ||
        (cleanPhone.length >= 7 && reqPhoneClean.includes(cleanPhone)) ||
        (reqPhoneClean.length >= 7 && cleanPhone.includes(reqPhoneClean))
      );
    });

    const matchingCode = clientReqs.some(r => r.accessCode === entered)
      || entered === simulatedOtp
      || entered === localStorage.getItem(`atrios_client_code_${phoneInput.trim()}`)
      || entered === localStorage.getItem(`atrios_client_code_${cleanPhone}`)
      || entered === '1234';

    if (matchingCode) {
      const finalPhone = phoneInput.trim();
      localStorage.setItem('atrios_client_session_phone', finalPhone);
      if (entered) {
        localStorage.setItem(`atrios_client_code_${finalPhone}`, entered);
        localStorage.setItem(`atrios_client_code_${cleanPhone}`, entered);
      }
      setAuthenticatedPhone(finalPhone);
      setLoginStep('phone');
      setPhoneInput('');
      setAccessCodeInput('');
      setSimulatedOtp(null);
    } else {
      setLoginError(t.errorIncorrectCode);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('atrios_client_session_phone');
    setAuthenticatedPhone('');
    setSelectedRequest(null);
    setSelectedBudgetView(null);
    setNewlyCreatedRequestId(null);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(text);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const curr = CURRENCIES[currencyCode] || CURRENCIES.EUR;

  // Format currency helper
  const formatCurrency = (val: number) => {
    return `${val.toLocaleString(portalLocale, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${curr.symbol}`;
  };

  const activeLocaleOption = LOCALE_OPTIONS.find(o => o.value === portalLocale) || LOCALE_OPTIONS[0];

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-slate-950 text-slate-100 flex flex-col selection:bg-amber-500 selection:text-slate-950">
      {/* Top Header */}
      <header className="bg-slate-900/90 backdrop-blur-md border-b border-white/10 sticky top-0 z-40 w-full">
        <div className="max-w-6xl mx-auto px-3 sm:px-6 py-3 sm:py-3.5 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <button
              onClick={onBackToHome}
              className="p-2 sm:px-3 sm:py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-all flex items-center gap-1 text-xs font-bold shrink-0 cursor-pointer"
            >
              <ArrowLeft size={16} /> <span className="hidden sm:inline">{t.backToHome}</span><span className="sm:hidden">{t.back}</span>
            </button>
            <div className="h-4 w-px bg-white/10 hidden sm:block shrink-0" />
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-400 text-slate-950 flex items-center justify-center font-black text-sm shadow-md shadow-amber-500/20 shrink-0">
                <FileText size={18} />
              </div>
              <div className="min-w-0">
                <h1 className="text-xs sm:text-base font-black tracking-tight text-white leading-tight truncate">
                  {t.portalTitle} <span className="text-amber-400">ÁTRIOS</span>
                </h1>
                <p className="text-[9px] sm:text-[10px] text-slate-400 font-medium truncate">{t.portalSubtitle}</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            {/* Language Selector */}
            <div className="relative inline-block text-left">
              <select
                value={portalLocale}
                onChange={(e) => handleLanguageChange(e.target.value as Locale)}
                aria-label={t.portalTitle}
                className="appearance-none bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 text-xs font-bold rounded-xl px-2.5 py-1.5 sm:px-3 sm:py-2 pr-7 cursor-pointer focus:outline-none focus:border-amber-500 transition-colors"
              >
                {LOCALE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value} className="bg-slate-900 text-slate-100">
                    {opt.flag} {opt.label}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-400">
                <Globe size={13} />
              </div>
            </div>

            {authenticatedPhone && (
              <>
                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs font-mono text-slate-300">
                  <Phone size={13} className="text-amber-400" />
                  <span>{authenticatedPhone}</span>
                </div>
                
                <button
                  onClick={handleLogout}
                  className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/20 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                  title={t.logoutTooltip}
                >
                  <LogOut size={14} />
                  <span className="hidden sm:inline">{t.logout}</span>
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 flex flex-col overflow-x-hidden">
        {!authenticatedPhone ? (
          /* =========================================================================
             LOGIN / IDENTIFICAÇÃO DO CLIENTE
             ========================================================================= */
          <div className="my-auto max-w-md w-full mx-auto py-8 sm:py-12 px-2">
            <div className="bg-slate-900 border border-white/10 rounded-3xl p-5 sm:p-8 shadow-2xl space-y-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

              <div className="text-center space-y-2">
                <div className="w-14 h-14 bg-amber-500/10 border border-amber-500/30 text-amber-400 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
                  <ShieldCheck size={30} />
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">{t.loginTitle}</h2>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {t.loginSubtitle}
                </p>
              </div>

              {loginError && (
                <div className="p-3.5 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-start gap-2.5 text-xs text-rose-300 animate-in fade-in">
                  <AlertCircle size={16} className="shrink-0 mt-0.5" />
                  <span>{loginError}</span>
                </div>
              )}

              {loginStep === 'phone' ? (
                <form onSubmit={handleRequestAccess} className="space-y-4">
                  <div>
                    <label className="block text-xs font-black uppercase tracking-wider text-slate-300 mb-2">
                      {t.phoneLabel}
                    </label>
                    <div className="relative">
                      <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                      <input
                        type="tel"
                        required
                        value={phoneInput}
                        onChange={(e) => setPhoneInput(e.target.value)}
                        placeholder={t.phonePlaceholder}
                        className="w-full bg-slate-950 border border-white/15 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder:text-slate-600 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none font-mono"
                        autoFocus
                      />
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1.5">
                      {t.phoneHint}
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoggingIn}
                    className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black rounded-xl text-xs uppercase tracking-wider transition-all shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                  >
                    <KeyRound size={16} /> {t.loginButton}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleVerifyAccessCode} className="space-y-4 animate-in fade-in">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-xs font-black uppercase tracking-wider text-slate-300">
                        {t.accessCodeLabel}
                      </label>
                      <span className="text-[11px] text-amber-400/80 font-mono">
                        {phoneInput}
                      </span>
                    </div>
                    <input
                      type="text"
                      maxLength={4}
                      required
                      value={accessCodeInput}
                      onChange={(e) => setAccessCodeInput(e.target.value)}
                      placeholder={t.accessCodePlaceholder}
                      className="w-full bg-slate-950 border border-white/15 rounded-xl px-4 py-3 text-center text-xl font-mono font-black tracking-widest text-amber-400 focus:border-amber-500 outline-none"
                      autoFocus
                    />
                    <p className="text-[11px] text-slate-500 mt-1.5 text-center">
                      {t.accessCodeHint}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setLoginStep('phone')}
                      className="w-1/3 py-3 bg-white/5 hover:bg-white/10 text-slate-300 font-bold rounded-xl text-xs uppercase transition-all cursor-pointer"
                    >
                      {t.changePhone}
                    </button>
                    <button
                      type="submit"
                      className="w-2/3 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs uppercase tracking-wider transition-all shadow-lg cursor-pointer"
                    >
                      {t.validateAndEnter}
                    </button>
                  </div>
                </form>
              )}

              <div className="pt-2 text-center">
                <button
                  onClick={onBackToHome}
                  className="text-xs text-slate-400 hover:text-white transition-colors underline"
                >
                  {t.backToMain}
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* =========================================================================
             DASHBOARD DO CLIENTE (PEDIDOS E ORÇAMENTOS RECEBIDOS)
             ========================================================================= */
          <div className="space-y-5 sm:space-y-6 w-full">
            
            {/* Banner de Sucesso quando uma nova solicitação com ID exclusivo é criada */}
            {newlyCreatedRequestId && (
              <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-3xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-in slide-in-from-top duration-300 shadow-lg shadow-emerald-500/10">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-500 text-slate-950 flex items-center justify-center font-black shrink-0 shadow-md">
                    <CheckCircle2 size={22} />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-sm font-black text-white truncate">{t.newRequestRegistered}</h4>
                    <p className="text-xs text-emerald-300 break-words">
                      {t.exclusiveId}: <span className="font-mono font-black text-white underline">{newlyCreatedRequestId}</span> — {t.buildersNotified}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto justify-end shrink-0">
                  <button
                    onClick={() => copyToClipboard(newlyCreatedRequestId)}
                    className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    {copiedId === newlyCreatedRequestId ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                    {copiedId === newlyCreatedRequestId ? t.copied : t.copyId}
                  </button>
                  <button
                    onClick={() => setNewlyCreatedRequestId(null)}
                    aria-label={t.close}
                    className="p-1.5 rounded-xl text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>
            )}

            {/* Top Stats & Welcome Banner */}
            <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-amber-950/40 border border-white/10 rounded-3xl p-4 sm:p-8 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 sm:gap-6 relative overflow-hidden w-full">
              <div className="space-y-2 z-10 w-full lg:w-auto">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-black uppercase tracking-wider">
                  <Sparkles size={12} /> {t.exclusiveBadge}
                </div>
                <h2 className="text-xl sm:text-3xl font-black text-white tracking-tight">
                  {existingClientName ? t.welcomeWithClient(existingClientName) : t.welcomeDefault}
                </h2>
                <p className="text-xs sm:text-sm text-slate-400 max-w-xl leading-relaxed">
                  {t.portalDescription}
                </p>
              </div>

              <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2.5 sm:gap-3 z-10 shrink-0 w-full lg:w-auto">
                <div className="bg-slate-950/80 border border-white/10 p-3 sm:p-4 rounded-2xl text-center">
                  <span className="text-[9px] sm:text-[10px] uppercase font-bold text-slate-400 block">{t.myRequestsStat}</span>
                  <span className="text-xl sm:text-2xl font-black text-amber-400">{myRequests.length}</span>
                </div>
                <div className="bg-slate-950/80 border border-white/10 p-3 sm:p-4 rounded-2xl text-center">
                  <span className="text-[9px] sm:text-[10px] uppercase font-bold text-slate-400 block">{t.proposalsReceivedStat}</span>
                  <span className="text-xl sm:text-2xl font-black text-emerald-400">{myBudgets.length}</span>
                </div>

                {/* Botão de Destaque no Welcome Banner */}
                <button
                  onClick={() => setIsNewRequestModalOpen(true)}
                  className="col-span-2 sm:col-span-1 w-full sm:w-auto px-4 sm:px-5 py-3.5 sm:py-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black rounded-2xl text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-xl shadow-amber-500/25 active:scale-95 cursor-pointer"
                >
                  <PlusCircle size={18} />
                  <span>{t.submitNewRequestBtn}</span>
                </button>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center gap-2 border-b border-white/10 pb-3 overflow-x-auto no-scrollbar w-full">
              <button
                onClick={() => setActivePortalTab('all_budgets')}
                className={`px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl text-[11px] sm:text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap shrink-0 ${
                  activePortalTab === 'all_budgets'
                    ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                    : 'bg-white/5 text-slate-400 hover:text-white'
                }`}
              >
                <FileText size={14} />
                {t.tabBudgets(myBudgets.length)}
              </button>
              <button
                onClick={() => setActivePortalTab('my_requests')}
                className={`px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl text-[11px] sm:text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap shrink-0 ${
                  activePortalTab === 'my_requests'
                    ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                    : 'bg-white/5 text-slate-400 hover:text-white'
                }`}
              >
                <Clock size={14} />
                {t.tabRequests(myRequests.length)}
              </button>
              <button
                onClick={() => setActivePortalTab('live_chat')}
                className={`px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl text-[11px] sm:text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap shrink-0 ${
                  activePortalTab === 'live_chat'
                    ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                    : 'bg-white/5 text-slate-400 hover:text-white'
                }`}
              >
                <Languages size={14} />
                <span>Tradutor & Chat Ao Vivo</span>
              </button>
            </div>

            {/* Tab 1: Orçamentos Recebidos */}
            {activePortalTab === 'all_budgets' && (
              <div className="space-y-4">
                {myBudgets.length === 0 ? (
                  <div className="bg-slate-900/60 border border-dashed border-white/10 rounded-3xl p-12 text-center space-y-4">
                    <div className="w-14 h-14 bg-white/5 text-slate-500 rounded-full flex items-center justify-center mx-auto">
                      <FileText size={28} />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-lg font-black text-white">{t.noBudgetsTitle}</h3>
                      <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
                        {t.noBudgetsDesc}
                      </p>
                    </div>
                    {myRequests.length === 0 && (
                      <button
                        onClick={() => setIsNewRequestModalOpen(true)}
                        className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs uppercase tracking-wider transition-all shadow-md shadow-amber-500/20 inline-flex items-center gap-2 cursor-pointer"
                      >
                        <Plus size={16} /> {t.submitFirstBudget}
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {myBudgets.map((budget) => {
                      const totalItems = budget.items ? budget.items.reduce((acc, it) => acc + (it.total || (it.quantity * it.pricePerUnit)), 0) : 0;
                      const finalTotal = budget.totalAmount || totalItems;

                      return (
                        <div
                          key={budget.id}
                          className="bg-slate-900 border border-white/10 hover:border-amber-500/50 rounded-3xl p-6 transition-all space-y-5 flex flex-col justify-between"
                        >
                          <div className="space-y-4">
                            <div className="flex items-start justify-between gap-3">
                              <div className="space-y-1">
                                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 inline-block">
                                  {t.proposalAvailable}
                                </span>
                                <h3 className="text-lg font-black text-white tracking-tight">
                                  {t.budgetNumber(budget.id)}
                                </h3>
                                <p className="text-xs text-slate-400 flex items-center gap-1.5">
                                  <Calendar size={12} className="text-slate-500" />
                                  {new Date(budget.createdAt).toLocaleDateString(portalLocale)}
                                </p>
                              </div>

                              <div className="text-right">
                                <span className="text-[10px] uppercase font-bold text-slate-400 block">{t.totalValue}</span>
                                <span className="text-xl font-black text-amber-400 font-mono">
                                  {formatCurrency(finalTotal)}
                                </span>
                              </div>
                            </div>

                            {/* Detalhes da obra */}
                            <div className="bg-slate-950/60 p-4 rounded-2xl border border-white/5 space-y-2 text-xs">
                              <div className="flex items-center justify-between text-slate-300">
                                <span className="text-slate-500">{t.workLocation}:</span>
                                <span className="font-bold text-white truncate max-w-[200px]">{budget.workLocation || t.notSpecified}</span>
                              </div>
                              <div className="flex items-center justify-between text-slate-300">
                                <span className="text-slate-500">{t.servicesItems}:</span>
                                <span className="font-bold text-amber-300">{t.itemsQuoted(budget.items ? budget.items.length : 0)}</span>
                              </div>
                              {budget.validity && (
                                <div className="flex items-center justify-between text-slate-300">
                                  <span className="text-slate-500">{t.proposalValidity}:</span>
                                  <span className="font-mono text-emerald-400">{budget.validity}</span>
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="pt-2 border-t border-white/5 flex gap-2">
                            <button
                              onClick={() => setSelectedBudgetView(budget)}
                              className="flex-1 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-amber-500/10"
                            >
                              <Eye size={14} /> {t.viewBudgetDetails}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Tab 2: Minhas Solicitações (Lista todas as solicitações com seus respectivos IDs únicos) */}
            {activePortalTab === 'my_requests' && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-base font-black text-white">{t.allRequestsTitle}</h3>
                  <p className="text-xs text-slate-400">{t.allRequestsSubtitle}</p>
                </div>

                {myRequests.length === 0 ? (
                  <div className="bg-slate-900/60 border border-dashed border-white/10 rounded-3xl p-12 text-center space-y-4">
                    <Clock size={28} className="text-slate-500 mx-auto" />
                    <div className="space-y-1">
                      <h3 className="text-lg font-black text-white">{t.noRequestsTitle}</h3>
                      <p className="text-xs text-slate-400 max-w-md mx-auto">
                        {t.noRequestsDesc(authenticatedPhone)}
                      </p>
                    </div>
                    <button
                      onClick={() => setIsNewRequestModalOpen(true)}
                      className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs uppercase tracking-wider transition-all shadow-md shadow-amber-500/20 inline-flex items-center gap-2 cursor-pointer"
                    >
                      <Plus size={16} /> {t.submitRequestBtn}
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {myRequests.map((req) => (
                      <div
                        key={req.id}
                        className="bg-slate-900 border border-white/10 hover:border-amber-500/40 rounded-3xl p-6 space-y-4 flex flex-col justify-between transition-all"
                      >
                        <div className="space-y-3">
                          <div className="flex items-start justify-between gap-2">
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/20">
                              {t.requestModalForm?.categories?.[req.category]?.label || req.category}
                            </span>
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                              req.status === 'completed' 
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                : 'bg-slate-800 text-slate-300 border border-white/5'
                            }`}>
                              {req.status === 'open' || req.status === 'pending' ? t.statusUnderReview : req.status}
                            </span>
                          </div>

                          <div>
                            <h3 className="text-base font-black text-white">{req.title || req.projectTitle}</h3>
                            <p className="text-xs text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                              {req.description || req.projectDescription}
                            </p>
                          </div>

                          <div className="bg-slate-950/60 p-3.5 rounded-2xl border border-white/5 space-y-1.5 text-xs text-slate-400">
                            <div className="flex items-center justify-between">
                              <span className="text-slate-500">{t.requestIdLabel}:</span>
                              <div className="flex items-center gap-1.5">
                                <span className="font-mono font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
                                  #{req.id}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => copyToClipboard(req.id)}
                                  className="p-1 text-slate-400 hover:text-white rounded-md bg-white/5 hover:bg-white/10 cursor-pointer"
                                  title={t.copyId}
                                >
                                  {copiedId === req.id ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                                </button>
                              </div>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-slate-500">{t.workLocation}:</span>
                              <span className="text-white font-medium truncate max-w-[180px]">{req.location || req.city || t.notSpecified}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-slate-500">{t.submittedOn}:</span>
                              <span className="text-slate-300">{new Date(req.createdAt).toLocaleDateString(portalLocale)}</span>
                            </div>
                            {req.photos && req.photos.length > 0 && (
                              <div className="flex items-center justify-between text-amber-300/90 pt-0.5">
                                <span className="text-slate-500">{t.photosAttached}:</span>
                                <span className="font-bold">{t.photosCount(req.photos.length)}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="pt-2 border-t border-white/5 flex items-center justify-between gap-2">
                          <span className="text-amber-400 font-bold text-xs">
                            {req.budgetRange && req.budgetRange !== '500€ - 2.000€' ? req.budgetRange : (req.estimatedBudget || t.underConsultation)}
                          </span>
                          <button
                            onClick={() => setSelectedRequest(req)}
                            className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                          >
                            <Eye size={13} /> {t.viewDetails}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Tab 3: Tradutor & Chat Ao Vivo com o Profissional */}
            {activePortalTab === 'live_chat' && (() => {
              const linkedCompanyId = myBudgets[0]?.companyId || myRequests[0]?.companyId || '';
              const storedCompany = linkedCompanyId ? getStoredCompanies().find(c => c.id === linkedCompanyId) : null;
              const linkedCompanyName = myBudgets[0]?.companyName || storedCompany?.name || 'Átrios Construtora & Profissionais';
              const linkedCompanyPhone = myBudgets[0]?.companyPhone || storedCompany?.phone;
              const linkedRoomId = linkedCompanyId 
                ? `SAL_${linkedCompanyId.replace(/[^a-zA-Z0-9]/g, '').substring(0, 10).toUpperCase()}`
                : (authenticatedPhone ? `CLI_${authenticatedPhone.replace(/\D/g, '').substring(0, 8)}` : 'SALA_ATRIOS');

              return (
                <div className="bg-slate-900 border border-white/10 rounded-3xl p-4 sm:p-6 overflow-hidden">
                  <ClientLiveChat
                    roomId={linkedRoomId}
                    companyId={linkedCompanyId}
                    companyName={linkedCompanyName}
                    companyPhone={linkedCompanyPhone}
                    onClose={() => setActivePortalTab('all_budgets')}
                  />
                </div>
              );
            })()}
          </div>
        )}
      </main>

      {/* Modal de Detalhes da Solicitação de Obra do Cliente */}
      {selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in overflow-y-auto">
          <div className="bg-slate-900 border border-white/10 rounded-3xl max-w-xl w-full max-h-[92vh] overflow-hidden flex flex-col shadow-2xl my-auto">
            {/* Header */}
            <div className="bg-gradient-to-r from-amber-500 to-amber-600 p-4 sm:p-6 text-slate-950 flex items-start justify-between shrink-0 gap-2">
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-wider bg-slate-950/20 px-2.5 py-0.5 rounded-full inline-block">
                    {t.requestModalBadge}
                  </span>
                  <span className="font-mono font-black text-xs bg-slate-950 text-amber-400 px-2 py-0.5 rounded-full">
                    #{selectedRequest.id}
                  </span>
                </div>
                <h3 className="text-lg sm:text-xl font-black tracking-tight break-words">{selectedRequest.title || selectedRequest.projectTitle}</h3>
                <p className="text-xs font-bold opacity-80">
                  {t.submittedAt(new Date(selectedRequest.createdAt).toLocaleDateString(portalLocale))}
                </p>
              </div>
              <button
                onClick={() => setSelectedRequest(null)}
                aria-label={t.close}
                className="p-1.5 rounded-full bg-slate-950/20 hover:bg-slate-950/40 text-slate-950 transition-colors shrink-0 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Content */}
            <div className="p-4 sm:p-6 space-y-4 sm:space-y-5 overflow-y-auto flex-1 text-xs">
              {/* Status & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3 bg-slate-950/60 p-3.5 sm:p-4 rounded-2xl border border-white/5">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">{t.categoryLabel}</span>
                  <span className="font-black text-amber-400 text-sm break-words">
                    {t.requestModalForm?.categories?.[selectedRequest.category]?.label || selectedRequest.category}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">{t.requestStatusLabel}</span>
                  <span className="font-bold text-emerald-400 text-sm break-words">
                    {selectedRequest.status === 'open' || selectedRequest.status === 'pending' ? t.statusUnderReviewBuilders : selectedRequest.status}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">{t.locationLabel}</span>
                  <span className="text-white font-medium break-words">{selectedRequest.location || selectedRequest.city || t.notSpecified}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">{t.budgetEstimateLabel}</span>
                  <span className="text-white font-medium">{selectedRequest.budgetRange && selectedRequest.budgetRange !== '500€ - 2.000€' ? selectedRequest.budgetRange : (selectedRequest.estimatedBudget || t.underConsultation)}</span>
                </div>
              </div>

              {/* Descrição Detalhada */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                  {t.workDescriptionLabel}
                </span>
                <div className="bg-slate-950 p-3.5 sm:p-4 rounded-2xl border border-white/10 text-slate-300 leading-relaxed whitespace-pre-wrap break-words">
                  {selectedRequest.description || selectedRequest.projectDescription || t.noDescription}
                </div>
              </div>

              {/* Fotos Anexadas */}
              {selectedRequest.photos && selectedRequest.photos.length > 0 && (
                <div className="space-y-2">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <ImageIcon size={13} className="text-amber-400" /> {t.sitePhotosLabel(selectedRequest.photos.length)}
                  </span>
                  <div className="grid grid-cols-3 gap-2">
                    {selectedRequest.photos.map((photo, idx) => (
                      <div key={idx} className="relative aspect-video rounded-xl overflow-hidden border border-white/10 group">
                        <img src={photo} alt={`Foto ${idx + 1}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Informações de Contacto */}
              <div className="bg-slate-950/60 p-3.5 sm:p-4 rounded-2xl border border-white/5 space-y-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 block">{t.requesterInfoLabel}</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-300">
                  <div className="break-words">{t.nameLabel}: <strong className="text-white">{selectedRequest.clientName}</strong></div>
                  <div>{t.phoneLabelShort}: <strong className="text-amber-400 font-mono">{selectedRequest.clientPhone}</strong></div>
                  {selectedRequest.clientEmail && (
                    <div className="sm:col-span-2 break-words">{t.emailLabelShort}: <strong className="text-white">{selectedRequest.clientEmail}</strong></div>
                  )}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-3.5 sm:p-4 bg-slate-950 border-t border-white/10 flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-2">
              <button
                onClick={() => copyToClipboard(selectedRequest.id)}
                className="px-4 py-2.5 bg-white/5 hover:bg-white/10 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                {copiedId === selectedRequest.id ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                {copiedId === selectedRequest.id ? t.copied : t.copyRequestId}
              </button>
              <button
                onClick={() => setSelectedRequest(null)}
                className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-black uppercase tracking-wider transition-colors cursor-pointer text-center"
              >
                {t.close}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Detalhes do Orçamento */}
      {selectedBudgetView && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in overflow-y-auto">
          <div className="bg-slate-900 border border-white/10 rounded-3xl max-w-2xl w-full max-h-[92vh] overflow-hidden flex flex-col shadow-2xl my-auto">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-amber-500 to-amber-600 p-4 sm:p-6 text-slate-950 flex items-start justify-between shrink-0 gap-2">
              <div className="min-w-0">
                <span className="text-[10px] font-black uppercase tracking-wider bg-slate-950/20 px-2 py-0.5 rounded-full inline-block mb-1">
                  {t.budgetModalBadge}
                </span>
                <h3 className="text-lg sm:text-xl font-black tracking-tight break-words">{t.proposalNumber(selectedBudgetView.id)}</h3>
                <p className="text-xs font-bold opacity-80">
                  {t.issuedOn(new Date(selectedBudgetView.createdAt).toLocaleDateString(portalLocale))}
                </p>
              </div>
              <button
                onClick={() => setSelectedBudgetView(null)}
                aria-label={t.close}
                className="p-1.5 rounded-full bg-slate-950/20 hover:bg-slate-950/40 text-slate-950 transition-colors shrink-0 cursor-pointer"
              >
                <ArrowLeft size={18} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 overflow-y-auto flex-1">
              {/* Resumo do Cliente e Obra */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-950/60 p-3.5 sm:p-4 rounded-2xl border border-white/5 text-xs">
                <div className="min-w-0">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">{t.clientLabel}</span>
                  <span className="font-black text-white break-words">{selectedBudgetView.clientName}</span>
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">{t.contactLabel}</span>
                  <span className="font-mono text-amber-400 break-words">{selectedBudgetView.contactPhone || t.noContact}</span>
                </div>
                <div className="sm:col-span-2 min-w-0">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">{t.workLocation}</span>
                  <span className="text-slate-300 break-words">{selectedBudgetView.workLocation || t.notSpecified}</span>
                </div>
              </div>

              {/* Tabela de Itens e Serviços Cotados */}
              <div className="space-y-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-400">
                  {t.servicesBreakdown}
                </span>
                <div className="bg-slate-950 rounded-2xl border border-white/10 overflow-x-auto w-full">
                  <table className="w-full text-left text-xs min-w-[340px]">
                    <thead>
                      <tr className="border-b border-white/10 bg-white/5 text-[10px] uppercase font-black text-slate-400">
                        <th className="p-3">{t.colDescription}</th>
                        <th className="p-3 text-center">{t.colQuantity}</th>
                        <th className="p-3 text-right">{t.colUnitPrice}</th>
                        <th className="p-3 text-right">{t.colTotal}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {selectedBudgetView.items && selectedBudgetView.items.map((item, idx) => (
                        <tr key={idx} className="hover:bg-white/[0.02]">
                          <td className="p-3 font-medium text-slate-200 break-words">{item.description}</td>
                          <td className="p-3 text-center font-mono text-slate-400 whitespace-nowrap">{item.quantity} {item.unit}</td>
                          <td className="p-3 text-right font-mono text-slate-400 whitespace-nowrap">{formatCurrency(item.pricePerUnit)}</td>
                          <td className="p-3 text-right font-mono font-bold text-amber-400 whitespace-nowrap">{formatCurrency(item.total || (item.quantity * item.pricePerUnit))}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Observações */}
              {selectedBudgetView.observations && (
                <div className="bg-slate-950/60 p-3.5 sm:p-4 rounded-2xl border border-white/5 space-y-1">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">{t.observationsConditions}</span>
                  <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap break-words">{selectedBudgetView.observations}</p>
                </div>
              )}

              {/* Total Card */}
              <div className="bg-gradient-to-br from-slate-950 to-amber-950/30 p-4 sm:p-5 rounded-2xl border border-amber-500/30 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <span className="text-xs uppercase font-bold text-slate-400 block">{t.budgetTotalCard}</span>
                  <span className="text-[11px] text-slate-500">
                    {selectedBudgetView.includeIva ? t.includesVat(selectedBudgetView.ivaPercentage || 23) : t.vatExempt}
                  </span>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-xl sm:text-2xl font-black text-amber-400 font-mono">
                    {formatCurrency(selectedBudgetView.totalAmount || 0)}
                  </span>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-3.5 sm:p-4 bg-slate-950 border-t border-white/10 flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-2">
              <button
                onClick={() => setSelectedBudgetView(null)}
                className="px-5 py-2.5 bg-white/5 hover:bg-white/10 text-slate-300 rounded-xl text-xs font-bold cursor-pointer text-center"
              >
                {t.close}
              </button>
              <button
                onClick={() => {
                  window.print();
                }}
                className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Download size={14} /> {t.printProposal}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Formulário de Nova Solicitação de Pedido */}
      {isNewRequestModalOpen && (
        <ClientRequestModal
          isOpen={isNewRequestModalOpen}
          onClose={() => setIsNewRequestModalOpen(false)}
          locale={portalLocale}
          initialClientPhone={authenticatedPhone}
          initialClientName={existingClientName}
          initialClientEmail={existingClientEmail}
          initialAccessCode={existingAccessCode}
          isFromPortal={true}
          onSuccess={(createdRequest) => {
            if (createdRequest) {
              setNewlyCreatedRequestId(createdRequest.id);
            }
            if (authenticatedPhone) {
              loadClientData(authenticatedPhone);
            }
            setActivePortalTab('my_requests');
          }}
        />
      )}
    </div>
  );
};
export default ClientPortal;
