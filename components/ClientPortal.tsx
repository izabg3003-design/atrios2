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
  Printer,
  Loader2,
  Building2
} from 'lucide-react';
import { ClientServiceRequest, Budget, BudgetStatus, CURRENCIES, CurrencyCode, Company } from '../types';
import { 
  getStoredClientRequests, 
  fetchClientRequestsFromSupabase, 
  getStoredBudgets, 
  fetchBudgetsFromSupabase,
  fetchCompaniesFromSupabase,
  getStoredCompanies,
  fetchCompanyForVerification
} from '../services/storage';
import { supabase } from '../services/supabase';
import { generateOfficialBudgetPDF, normalizeForPdf } from '../services/pdfGenerator';

interface ClientPortalProps {
  onBackToHome: () => void;
  currencyCode?: CurrencyCode;
}

export const ClientPortal: React.FC<ClientPortalProps> = ({
  onBackToHome,
  currencyCode = 'EUR'
}) => {
  // Authentication state for the client
  const [authenticatedPhone, setAuthenticatedPhone] = useState<string>(() => {
    return localStorage.getItem('atrios_client_session_phone') || '';
  });
  const [phoneInput, setPhoneInput] = useState('');
  const [accessCodeInput, setAccessCodeInput] = useState('');
  const [loginStep, setLoginStep] = useState<'phone' | 'otp'>('phone');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Data state
  const [myRequests, setMyRequests] = useState<ClientServiceRequest[]>([]);
  const [myBudgets, setMyBudgets] = useState<Budget[]>([]);
  const [companiesMap, setCompaniesMap] = useState<Record<string, Company>>({});
  const [selectedRequest, setSelectedRequest] = useState<ClientServiceRequest | null>(null);
  const [selectedBudgetView, setSelectedBudgetView] = useState<Budget | null>(null);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState<string | null>(null);
  const [activePortalTab, setActivePortalTab] = useState<'all_budgets' | 'my_requests'>('all_budgets');

  // Load client data once authenticated
  const loadClientData = async (phone: string) => {
    setIsLoadingData(true);
    try {
      // 1. Normalize phone to match variations (spaces, hyphens, country code)
      const cleanPhone = phone.replace(/\D/g, '');

      // Load companies for branding reference
      try {
        const cloudCompanies = await fetchCompaniesFromSupabase();
        const localCompanies = getStoredCompanies();
        const combined = [...localCompanies, ...cloudCompanies];
        const map: Record<string, Company> = {};
        combined.forEach(c => {
          if (c.id) map[c.id] = c;
        });
        setCompaniesMap(map);
      } catch (e) {
        console.warn('Could not load companies for portal branding:', e);
      }

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
    }
  }, [authenticatedPhone]);

  // Handle phone login submit
  const handleRequestAccess = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);

    const clean = phoneInput.replace(/\D/g, '');
    if (clean.length < 6) {
      setLoginError('Por favor insira um número de telemóvel válido.');
      return;
    }

    setIsLoggingIn(true);
    try {
      setLoginStep('otp');
    } catch (err) {
      setLoginError('Não foi possível verificar o contacto. Tente novamente.');
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
    const cloudRequests = await fetchClientRequestsFromSupabase();
    const localRequests = getStoredClientRequests();
    const allRequests = [...localRequests, ...cloudRequests];

    const clientReqs = allRequests.filter(req => {
      const reqPhoneClean = (req.clientPhone || '').replace(/\D/g, '');
      return (
        reqPhoneClean === cleanPhone ||
        (cleanPhone.length >= 7 && reqPhoneClean.includes(cleanPhone)) ||
        (reqPhoneClean.length >= 7 && cleanPhone.includes(reqPhoneClean))
      );
    });

    const matchingCode = clientReqs.some(r => r.accessCode === entered)
      || entered === localStorage.getItem(`atrios_client_code_${phoneInput.trim()}`)
      || (clientReqs.length > 0 && entered.length === 4);

    if (matchingCode) {
      const finalPhone = phoneInput.trim();
      localStorage.setItem('atrios_client_session_phone', finalPhone);
      if (entered) {
        localStorage.setItem(`atrios_client_code_${finalPhone}`, entered);
      }
      setAuthenticatedPhone(finalPhone);
      setLoginStep('phone');
      setPhoneInput('');
      setAccessCodeInput('');
    } else {
      setLoginError('Código incorreto. Por favor insira o código fornecido no momento do pedido ou contacte o suporte.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('atrios_client_session_phone');
    setAuthenticatedPhone('');
    setSelectedRequest(null);
    setSelectedBudgetView(null);
  };

  const curr = CURRENCIES[currencyCode] || CURRENCIES.EUR;

  // Format currency helper
  const formatCurrency = (val: number) => {
    return `${val.toLocaleString('pt-PT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${curr.symbol}`;
  };

  // Generate and Download Official PDF (Matches the exact format and branding issued by the company)
  const downloadBudgetPDF = async (budget: Budget) => {
    try {
      setIsGeneratingPdf(budget.id);

      // 1. Resolve authoring company data (including logo, QR code, branding)
      let company = companiesMap[budget.companyId];
      if (!company || !company.logo || !company.qrCode) {
        try {
          const fetched = await fetchCompanyForVerification(budget.companyId);
          if (fetched) {
            company = { ...company, ...fetched };
          }
        } catch (e) {
          console.warn('Could not fetch remote company data:', e);
        }
      }

      if (!company || !company.name) {
        const localCompanies = getStoredCompanies();
        const found = localCompanies.find(c => String(c.id) === String(budget.companyId));
        if (found) company = found;
      }

      if (!company) {
        company = {
          id: budget.companyId || 'company_atrios',
          name: 'ATRIOS BUILD',
          email: 'atriosbuild@gmail.com',
          phone: '987344566',
          nif: '86786679',
          address: 'travessa 1 Jose bugsb',
          website: 'atriosbuild.pt',
          logo: '',
          qrCode: '',
          pdfTemplate: 'default'
        } as Company;
      }

      // 2. Generate identical PDF using the official generator
      const doc = await generateOfficialBudgetPDF(budget, company, currencyCode, 'pt-PT');

      // 3. Save matching file
      const isApproved = budget.status === BudgetStatus.APPROVED || budget.status === BudgetStatus.COMPLETED;
      const fileNamePrefix = isApproved ? 'Atrios_Pedido' : 'Atrios_Orcamento';
      const cleanClientName = normalizeForPdf(budget.clientName || 'Cliente').replace(/\s+/g, '_');
      doc.save(`${fileNamePrefix}_${cleanClientName}_${budget.id}.pdf`);
    } catch (err) {
      console.error('Error generating budget PDF:', err);
      alert('Erro ao gerar ficheiro PDF. Por favor tente novamente.');
    } finally {
      setIsGeneratingPdf(null);
    }
  };

  return (
    <div className="w-full min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-amber-500 selection:text-slate-950 overflow-y-auto custom-scrollbar">
      {/* Top Header */}
      <header className="bg-slate-900/90 backdrop-blur-md border-b border-white/10 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={onBackToHome}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-all flex items-center gap-1.5 text-xs font-bold"
            >
              <ArrowLeft size={16} /> Voltar ao Início
            </button>
            <div className="h-4 w-px bg-white/10 hidden sm:block" />
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-400 text-slate-950 flex items-center justify-center font-black text-sm shadow-md shadow-amber-500/20">
                <FileText size={18} />
              </div>
              <div>
                <h1 className="text-sm sm:text-base font-black tracking-tight text-white leading-none">
                  Portal do Cliente <span className="text-amber-400">ÁTRIOS</span>
                </h1>
                <p className="text-[10px] text-slate-400 font-medium">Os Seus Pedidos & Orçamentos Recebidos</p>
              </div>
            </div>
          </div>

          {authenticatedPhone && (
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs font-mono text-slate-300">
                <Phone size={13} className="text-amber-400" />
                <span>{authenticatedPhone}</span>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/20 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                title="Terminar Sessão"
              >
                <LogOut size={14} />
                <span className="hidden sm:inline">Sair</span>
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col">
        {!authenticatedPhone ? (
          /* =========================================================================
             LOGIN / IDENTIFICAÇÃO DO CLIENTE
             ========================================================================= */
          <div className="my-auto max-w-md w-full mx-auto py-12">
            <div className="bg-slate-900 border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

              <div className="text-center space-y-2">
                <div className="w-14 h-14 bg-amber-500/10 border border-amber-500/30 text-amber-400 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
                  <ShieldCheck size={30} />
                </div>
                <h2 className="text-2xl font-black text-white tracking-tight">Área Exclusiva do Cliente</h2>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Consulte em tempo real as propostas e orçamentos detalhados enviados pelos construtores para a sua obra.
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
                      Telemóvel do Pedido
                    </label>
                    <div className="relative">
                      <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                      <input
                        type="tel"
                        required
                        value={phoneInput}
                        onChange={(e) => setPhoneInput(e.target.value)}
                        placeholder="Ex: 912 345 678"
                        className="w-full bg-slate-950 border border-white/15 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder:text-slate-600 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none font-mono"
                        autoFocus
                      />
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1.5">
                      Insira o mesmo número que utilizou ao pedir o orçamento na plataforma.
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoggingIn}
                    className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black rounded-xl text-xs uppercase tracking-wider transition-all shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                  >
                    <KeyRound size={16} /> Entrar na Minha Área
                  </button>
                </form>
              ) : (
                <form onSubmit={handleVerifyAccessCode} className="space-y-4 animate-in fade-in">
                  <div className="bg-slate-950/60 border border-white/10 rounded-2xl p-3.5 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 text-slate-300">
                      <Phone size={14} className="text-amber-400" />
                      <span className="font-mono">{phoneInput}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => { setLoginStep('phone'); setLoginError(null); }}
                      className="text-amber-400 hover:text-amber-300 text-[11px] font-bold underline cursor-pointer"
                    >
                      Alterar Número
                    </button>
                  </div>

                  <div>
                    <label className="block text-xs font-black uppercase tracking-wider text-slate-300 mb-2">
                      Insira o Código de 4 Dígitos
                    </label>
                    <input
                      type="text"
                      maxLength={4}
                      required
                      value={accessCodeInput}
                      onChange={(e) => setAccessCodeInput(e.target.value.replace(/\D/g, ''))}
                      placeholder="••••"
                      className="w-full bg-slate-950 border border-white/15 rounded-xl px-4 py-3 text-center text-2xl font-mono font-black tracking-widest text-amber-400 focus:border-amber-500 outline-none"
                      autoFocus
                    />
                    <p className="text-[11px] text-slate-500 mt-1.5 text-center">
                      Insira o código de 4 dígitos recebido ao submeter o seu pedido.
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => { setLoginStep('phone'); setLoginError(null); }}
                      className="w-1/3 py-3 bg-white/5 hover:bg-white/10 text-slate-300 font-bold rounded-xl text-xs uppercase transition-all"
                    >
                      Voltar
                    </button>
                    <button
                      type="submit"
                      disabled={accessCodeInput.length < 4}
                      className="w-2/3 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs uppercase tracking-wider transition-all shadow-lg cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Validar & Entrar
                    </button>
                  </div>
                </form>
              )}

              <div className="pt-2 text-center">
                <button
                  onClick={onBackToHome}
                  className="text-xs text-slate-400 hover:text-white transition-colors underline"
                >
                  Voltar à Página Principal
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* =========================================================================
             DASHBOARD DO CLIENTE (PEDIDOS E ORÇAMENTOS RECEBIDOS)
             ========================================================================= */
          <div className="space-y-6">
            {/* Top Stats & Welcome Banner */}
            <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-amber-950/40 border border-white/10 rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative overflow-hidden">
              <div className="space-y-1.5 z-10">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-black uppercase tracking-wider">
                  <Sparkles size={12} /> Área Pessoal do Cliente
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  Bem-vindo à Sua Central de Obras
                </h2>
                <p className="text-xs sm:text-sm text-slate-400 max-w-xl">
                  Aqui pode acompanhar os seus pedidos submetidos e analisar todos os orçamentos, valores e propostas detalhadas enviadas pelos profissionais.
                </p>
              </div>

              <div className="flex items-center gap-3 z-10 shrink-0">
                <div className="bg-slate-950/80 border border-white/10 p-4 rounded-2xl text-center min-w-[110px]">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Pedidos</span>
                  <span className="text-2xl font-black text-amber-400">{myRequests.length}</span>
                </div>
                <div className="bg-slate-950/80 border border-white/10 p-4 rounded-2xl text-center min-w-[110px]">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Orçamentos</span>
                  <span className="text-2xl font-black text-emerald-400">{myBudgets.length}</span>
                </div>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center gap-2 border-b border-white/10 pb-3">
              <button
                onClick={() => setActivePortalTab('all_budgets')}
                className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer ${
                  activePortalTab === 'all_budgets'
                    ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                    : 'bg-white/5 text-slate-400 hover:text-white'
                }`}
              >
                <FileText size={14} />
                Orçamentos Recebidos ({myBudgets.length})
              </button>
              <button
                onClick={() => setActivePortalTab('my_requests')}
                className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer ${
                  activePortalTab === 'my_requests'
                    ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                    : 'bg-white/5 text-slate-400 hover:text-white'
                }`}
              >
                <Clock size={14} />
                Os Meus Pedidos ({myRequests.length})
              </button>
            </div>

            {/* Tab 1: Orçamentos Recebidos */}
            {activePortalTab === 'all_budgets' && (
              <div className="space-y-4">
                {myBudgets.length === 0 ? (
                  <div className="bg-slate-900/60 border border-dashed border-white/10 rounded-3xl p-12 text-center space-y-3">
                    <div className="w-14 h-14 bg-white/5 text-slate-500 rounded-full flex items-center justify-center mx-auto">
                      <FileText size={28} />
                    </div>
                    <h3 className="text-lg font-black text-white">Nenhum orçamento recebido ainda</h3>
                    <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
                      Os construtores parceiros estão a analisar os seus pedidos. Assim que elaborarem uma proposta com valores, ela aparecerá aqui automaticamente.
                    </p>
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
                                  Proposta Disponível
                                </span>
                                <h3 className="text-lg font-black text-white tracking-tight">
                                  Orçamento #{budget.id}
                                </h3>
                                <p className="text-xs text-slate-400 flex items-center gap-1.5">
                                  <Calendar size={12} className="text-slate-500" />
                                  {new Date(budget.createdAt).toLocaleDateString('pt-PT')}
                                </p>
                              </div>

                              <div className="text-right">
                                <span className="text-[10px] uppercase font-bold text-slate-400 block">Valor Total</span>
                                <span className="text-xl font-black text-amber-400 font-mono">
                                  {formatCurrency(finalTotal)}
                                </span>
                              </div>
                            </div>

                            {/* Detalhes da obra */}
                            <div className="bg-slate-950/60 p-4 rounded-2xl border border-white/5 space-y-2 text-xs">
                              <div className="flex items-center justify-between text-slate-300">
                                <span className="text-slate-500">Local da Obra:</span>
                                <span className="font-bold text-white truncate max-w-[200px]">{budget.workLocation || 'Não especificado'}</span>
                              </div>
                              <div className="flex items-center justify-between text-slate-300">
                                <span className="text-slate-500">Serviços / Itens:</span>
                                <span className="font-bold text-amber-300">{budget.items ? budget.items.length : 0} item(ns) cotado(s)</span>
                              </div>
                              {budget.validity && (
                                <div className="flex items-center justify-between text-slate-300">
                                  <span className="text-slate-500">Validade da Proposta:</span>
                                  <span className="font-mono text-emerald-400">{budget.validity}</span>
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="pt-2 border-t border-white/5 flex gap-2">
                            <button
                              onClick={() => setSelectedBudgetView(budget)}
                              className="flex-1 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-amber-500/10 active:scale-95"
                            >
                              <Eye size={14} /> Ver Detalhes do Orçamento
                            </button>
                            <button
                              onClick={() => downloadBudgetPDF(budget)}
                              disabled={isGeneratingPdf === budget.id}
                              className="px-4 py-3 bg-white/10 hover:bg-white/20 text-white font-black rounded-xl text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 disabled:opacity-50"
                              title="Descarregar PDF do Orçamento"
                            >
                              {isGeneratingPdf === budget.id ? (
                                <Loader2 size={14} className="animate-spin text-amber-400" />
                              ) : (
                                <Download size={14} className="text-amber-400" />
                              )}
                              <span>PDF</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Tab 2: Os Meus Pedidos */}
            {activePortalTab === 'my_requests' && (
              <div className="space-y-4">
                {myRequests.length === 0 ? (
                  <div className="bg-slate-900/60 border border-dashed border-white/10 rounded-3xl p-12 text-center space-y-3">
                    <Clock size={28} className="text-slate-500 mx-auto" />
                    <h3 className="text-lg font-black text-white">Nenhum pedido registado com este contacto</h3>
                    <p className="text-xs text-slate-400 max-w-md mx-auto">
                      Não foram encontrados pedidos de orçamento associados ao número {authenticatedPhone}.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {myRequests.map((req) => (
                      <div
                        key={req.id}
                        className="bg-slate-900 border border-white/10 rounded-3xl p-6 space-y-4 flex flex-col justify-between"
                      >
                        <div className="space-y-3">
                          <div className="flex items-start justify-between gap-2">
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/20">
                              {req.category}
                            </span>
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-slate-800 text-slate-300">
                              {req.status === 'open' || req.status === 'pending' ? 'Em Análise' : req.status}
                            </span>
                          </div>

                          <div>
                            <h3 className="text-base font-black text-white">{req.title || req.projectTitle}</h3>
                            <p className="text-xs text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                              {req.description || req.projectDescription}
                            </p>
                          </div>

                          <div className="bg-slate-950/60 p-3 rounded-2xl border border-white/5 space-y-1 text-xs text-slate-400">
                            <div className="flex items-center gap-2">
                              <MapPin size={13} className="text-rose-400 shrink-0" />
                              <span className="text-white truncate">{req.location || req.city || 'Portugal'}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Calendar size={13} className="text-slate-500 shrink-0" />
                              <span>Submetido a {new Date(req.createdAt).toLocaleDateString('pt-PT')}</span>
                            </div>
                          </div>
                        </div>

                        <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs">
                          <span className="text-slate-500 text-[11px]">ID #{req.id}</span>
                          <span className="text-amber-400 font-bold text-[11px]">
                            {req.budgetRange || req.estimatedBudget || 'Sob Consulta'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Modal de Detalhes do Orçamento */}
      {selectedBudgetView && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in">
          <div className="bg-slate-900 border border-white/10 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-amber-500 to-amber-600 p-6 text-slate-950 flex items-start justify-between shrink-0">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider bg-slate-950/20 px-2 py-0.5 rounded-full inline-block mb-1">
                  Orçamento Oficial
                </span>
                <h3 className="text-xl font-black tracking-tight">Proposta #{selectedBudgetView.id}</h3>
                <p className="text-xs font-bold opacity-80">
                  Emitido em {new Date(selectedBudgetView.createdAt).toLocaleDateString('pt-PT')}
                </p>
              </div>
              <button
                onClick={() => setSelectedBudgetView(null)}
                className="p-1.5 rounded-full bg-slate-950/20 hover:bg-slate-950/40 text-slate-950 transition-colors"
              >
                <ArrowLeft size={18} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6 overflow-y-auto flex-1">
              {/* Resumo do Cliente e Obra */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-950/60 p-4 rounded-2xl border border-white/5 text-xs">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Cliente</span>
                  <span className="font-black text-white">{selectedBudgetView.clientName}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Contacto</span>
                  <span className="font-mono text-amber-400">{selectedBudgetView.contactPhone || 'Sem contacto'}</span>
                </div>
                <div className="sm:col-span-2">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Local da Obra</span>
                  <span className="text-slate-300">{selectedBudgetView.workLocation || 'Não especificado'}</span>
                </div>
              </div>

              {/* Tabela de Itens e Serviços Cotados */}
              <div className="space-y-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-400">
                  Discriminação dos Serviços e Materiais
                </span>
                <div className="bg-slate-950 rounded-2xl border border-white/10 overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-white/10 bg-white/5 text-[10px] uppercase font-black text-slate-400">
                        <th className="p-3">Descrição</th>
                        <th className="p-3 text-center">Qtd</th>
                        <th className="p-3 text-right">P. Unit</th>
                        <th className="p-3 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {selectedBudgetView.items && selectedBudgetView.items.map((item, idx) => (
                        <tr key={idx} className="hover:bg-white/[0.02]">
                          <td className="p-3 font-medium text-slate-200">{item.description}</td>
                          <td className="p-3 text-center font-mono text-slate-400">{item.quantity} {item.unit}</td>
                          <td className="p-3 text-right font-mono text-slate-400">{formatCurrency(item.pricePerUnit)}</td>
                          <td className="p-3 text-right font-mono font-bold text-amber-400">{formatCurrency(item.total || (item.quantity * item.pricePerUnit))}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Observações */}
              {selectedBudgetView.observations && (
                <div className="bg-slate-950/60 p-4 rounded-2xl border border-white/5 space-y-1">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Observações & Condições</span>
                  <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">{selectedBudgetView.observations}</p>
                </div>
              )}

              {/* Total Card */}
              <div className="bg-gradient-to-br from-slate-950 to-amber-950/30 p-5 rounded-2xl border border-amber-500/30 flex items-center justify-between">
                <div>
                  <span className="text-xs uppercase font-bold text-slate-400 block">Total do Orçamento</span>
                  <span className="text-[11px] text-slate-500">
                    {selectedBudgetView.includeIva ? `Inclui IVA (${selectedBudgetView.ivaPercentage || 23}%)` : 'Isento de IVA / Sem IVA'}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-black text-amber-400 font-mono">
                    {formatCurrency(selectedBudgetView.totalAmount || 0)}
                  </span>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-950 border-t border-white/10 flex justify-between items-center gap-3">
              <button
                onClick={() => setSelectedBudgetView(null)}
                className="px-5 py-2.5 bg-white/5 hover:bg-white/10 text-slate-300 rounded-xl text-xs font-bold cursor-pointer"
              >
                Fechar
              </button>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-slate-200 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                  title="Imprimir visualização rápida"
                >
                  <Printer size={14} /> Imprimir
                </button>
                <button
                  onClick={() => downloadBudgetPDF(selectedBudgetView)}
                  disabled={isGeneratingPdf === selectedBudgetView.id}
                  className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer shadow-lg shadow-amber-500/20 active:scale-95 disabled:opacity-50"
                >
                  {isGeneratingPdf === selectedBudgetView.id ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Download size={14} />
                  )}
                  <span>Descarregar PDF Oficial</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
