import React, { useState, useEffect, useMemo } from 'react';
import { 
  Briefcase, MapPin, Calendar, Clock, Phone, Mail, User, 
  Search, Filter, ChevronRight, CheckCircle2, AlertCircle, 
  Sparkles, Hammer, Paintbrush, Zap, Home, Wrench, Layers, 
  ArrowRight, ShieldCheck, Eye, Plus, Send, FileText, Check, 
  MessageSquare, Trash2, ExternalLink, Lock, Crown, ShieldAlert,
  X, HelpCircle, ArrowUpRight
} from 'lucide-react';
import { ClientServiceRequest, Company, ServiceCategory, PlanType } from '../types';
import { getStoredClientRequests, fetchClientRequestsFromSupabase, saveClientServiceRequest } from '../services/storage';

interface ClientRequestsHubProps {
  currentUser: Company;
  onCreateBudgetForClient: (clientData: {
    clientName: string;
    clientEmail?: string;
    clientPhone?: string;
    clientAddress?: string;
    projectTitle: string;
    projectDescription: string;
    category: ServiceCategory;
  }) => void;
  onUpgrade?: () => void;
}

const MONTHLY_QUOTES_LIMIT = 2;

const CATEGORY_MAP: Record<string, { label: string; icon: React.FC<{ size?: number; className?: string }>; color: string }> = {
  doors_windows: { label: 'Portas & Janelas', icon: Home, color: 'bg-blue-50 text-blue-700 border-blue-200' },
  painting: { label: 'Pintura', icon: Paintbrush, color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  pintura: { label: 'Pintura', icon: Paintbrush, color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  electrical: { label: 'Eletricidade & Fichas', icon: Zap, color: 'bg-amber-50 text-amber-700 border-amber-200' },
  eletricidade: { label: 'Eletricidade & Fichas', icon: Zap, color: 'bg-amber-50 text-amber-700 border-amber-200' },
  plumbing: { label: 'Canalização', icon: Wrench, color: 'bg-cyan-50 text-cyan-700 border-cyan-200' },
  canalizacao: { label: 'Canalização', icon: Wrench, color: 'bg-cyan-50 text-cyan-700 border-cyan-200' },
  plasterboard: { label: 'Pladur & Tetos', icon: Layers, color: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
  pladur: { label: 'Pladur & Tetos', icon: Layers, color: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
  renovation: { label: 'Remodelação Geral', icon: Sparkles, color: 'bg-purple-50 text-purple-700 border-purple-200' },
  remodelacao: { label: 'Remodelação Geral', icon: Sparkles, color: 'bg-purple-50 text-purple-700 border-purple-200' },
  construction: { label: 'Construção do Zero', icon: Hammer, color: 'bg-rose-50 text-rose-700 border-rose-200' },
  construcao_raiz: { label: 'Construção do Zero', icon: Hammer, color: 'bg-rose-50 text-rose-700 border-rose-200' },
  roofing: { label: 'Telhados & Coberturas', icon: Home, color: 'bg-orange-50 text-orange-700 border-orange-200' },
  telhados: { label: 'Telhados & Coberturas', icon: Home, color: 'bg-orange-50 text-orange-700 border-orange-200' },
  flooring: { label: 'Pisos & Revestimentos', icon: Layers, color: 'bg-teal-50 text-teal-700 border-teal-200' },
  carpentry: { label: 'Carpintaria', icon: Hammer, color: 'bg-amber-50 text-amber-800 border-amber-300' },
  carpintaria: { label: 'Carpintaria', icon: Hammer, color: 'bg-amber-50 text-amber-800 border-amber-300' },
  jardim: { label: 'Jardim & Exteriores', icon: Sparkles, color: 'bg-emerald-50 text-emerald-800 border-emerald-300' },
  outro: { label: 'Outro Serviço', icon: Briefcase, color: 'bg-slate-100 text-slate-700 border-slate-200' },
  other: { label: 'Outro Serviço', icon: Briefcase, color: 'bg-slate-100 text-slate-700 border-slate-200' }
};

export const ClientRequestsHub: React.FC<ClientRequestsHubProps> = ({
  currentUser,
  onCreateBudgetForClient,
  onUpgrade
}) => {
  const [requests, setRequests] = useState<ClientServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedLocation, setSelectedLocation] = useState<string>('all');
  const [contactRevealed, setContactRevealed] = useState<Record<string, boolean>>({});
  const [upgradeModalInfo, setUpgradeModalInfo] = useState<{
    open: boolean;
    reason: 'free_blocked' | 'monthly_limit_reached';
  }>({ open: false, reason: 'free_blocked' });

  // Plan types
  const isFree = currentUser.plan === PlanType.FREE;
  const isMonthly = currentUser.plan === PlanType.PREMIUM_MONTHLY;
  const isUnlimited = currentUser.plan === PlanType.PREMIUM_ANNUAL || currentUser.plan === PlanType.PREMIUM;

  // Monthly limit tracking
  const currentMonthKey = useMemo(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  }, []);

  const currentMonthFormatted = useMemo(() => {
    return new Date().toLocaleDateString('pt-PT', { month: 'long', year: 'numeric' });
  }, []);

  const [respondedIds, setRespondedIds] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem(`atrios_monthly_responses_${currentUser.id}_${currentMonthKey}`);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const respondedCount = respondedIds.length;
  const monthlyLimitReached = isMonthly && respondedCount >= MONTHLY_QUOTES_LIMIT;

  const loadRequests = async () => {
    setLoading(true);
    try {
      const local = getStoredClientRequests();
      setRequests(local);
      const cloud = await fetchClientRequestsFromSupabase();
      if (cloud && cloud.length > 0) {
        setRequests(cloud);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();

    const handleReqChange = () => {
      loadRequests();
    };

    window.addEventListener('atrios_client_requests_changed', handleReqChange);
    return () => window.removeEventListener('atrios_client_requests_changed', handleReqChange);
  }, []);

  // Helper to mask sensitive text for FREE users:
  // Shows only first 3 characters and the rest ********
  const maskText = (text?: string | null): string => {
    if (!text) return '';
    if (!isFree) return text;
    const clean = text.trim();
    if (clean.length <= 3) {
      return clean + '********';
    }
    return clean.substring(0, 3) + '********';
  };

  const locationsList = useMemo(() => {
    const set = new Set<string>();
    requests.forEach(r => {
      if (r.location) set.add(r.location.trim());
    });
    return Array.from(set);
  }, [requests]);

  const filteredRequests = useMemo(() => {
    return requests.filter(r => {
      const titleToMatch = isFree ? maskText(r.title) : r.title;
      const descToMatch = isFree ? maskText(r.description) : (r.description || '');
      const locToMatch = isFree ? maskText(r.location) : (r.location || '');
      const nameToMatch = isFree ? maskText(r.clientName) : r.clientName;

      const matchSearch = 
        titleToMatch.toLowerCase().includes(searchTerm.toLowerCase()) ||
        descToMatch.toLowerCase().includes(searchTerm.toLowerCase()) ||
        locToMatch.toLowerCase().includes(searchTerm.toLowerCase()) ||
        nameToMatch.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchCat = selectedCategory === 'all' || r.category === selectedCategory;
      const matchLoc = selectedLocation === 'all' || r.location?.toLowerCase() === selectedLocation.toLowerCase();

      return matchSearch && matchCat && matchLoc;
    });
  }, [requests, searchTerm, selectedCategory, selectedLocation, isFree]);

  const handleStartBudget = (req: ClientServiceRequest) => {
    // 1. FREE users are strictly blocked
    if (isFree) {
      setUpgradeModalInfo({ open: true, reason: 'free_blocked' });
      return;
    }

    // 2. MONTHLY users checking
    const alreadyResponded = respondedIds.includes(req.id);
    if (isMonthly && !alreadyResponded && respondedCount >= MONTHLY_QUOTES_LIMIT) {
      setUpgradeModalInfo({ open: true, reason: 'monthly_limit_reached' });
      return;
    }

    // Save response tracking for monthly count if not already responded
    if (isMonthly && !alreadyResponded) {
      const updated = [...respondedIds, req.id];
      setRespondedIds(updated);
      try {
        localStorage.setItem(`atrios_monthly_responses_${currentUser.id}_${currentMonthKey}`, JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
    }

    onCreateBudgetForClient({
      clientName: req.clientName,
      clientEmail: req.clientEmail,
      clientPhone: req.clientPhone,
      clientAddress: req.location + (req.postalCode ? `, ${req.postalCode}` : ''),
      projectTitle: req.title || req.projectTitle || 'Pedido de Obra',
      projectDescription: req.description || req.projectDescription || '',
      category: req.category as ServiceCategory
    });

    // Increment proposals counter on request
    saveClientServiceRequest({
      ...req,
      proposalsCount: (req.proposalsCount || 0) + 1
    });
  };

  const toggleContactReveal = (id: string) => {
    if (isFree) {
      setUpgradeModalInfo({ open: true, reason: 'free_blocked' });
      return;
    }
    setContactRevealed(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-7xl mx-auto px-2 sm:px-4">
      
      {/* Top Banner Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-amber-950 text-white rounded-3xl sm:rounded-[2.5rem] p-6 sm:p-10 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-amber-500/10 blur-3xl rounded-full -mr-20 pointer-events-none" />
        
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-black uppercase tracking-wider">
            <Sparkles size={14} className="text-amber-400" /> Oportunidades em Tempo Real
          </div>
          
          <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
            Pedidos de Orçamento & Obras de Clientes
          </h2>
          
          <p className="text-slate-300 text-xs sm:text-base leading-relaxed">
            Particulares à procura de profissionais qualificados. Envie orçamentos em PDF com a sua marca e feche novos trabalhos na sua área de atuação.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2 text-xs font-bold text-slate-300">
            <span className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-xl">
              <CheckCircle2 size={15} className="text-emerald-400" /> Contactos Verificados
            </span>
            <span className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-xl">
              <FileText size={15} className="text-amber-400" /> Gerar Orçamento Direto
            </span>
            <span className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-xl">
              <MapPin size={15} className="text-cyan-400" /> Todas as Regiões
            </span>
          </div>
        </div>
      </div>

      {/* PLAN STATUS & LIMITS CONTROL BAR */}
      {isFree && (
        <div className="bg-gradient-to-r from-amber-500/15 via-rose-500/15 to-orange-500/15 border-2 border-amber-400/80 rounded-3xl p-5 sm:p-6 text-slate-900 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-md">
              <Lock size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-wider bg-rose-100 text-rose-700 px-2.5 py-0.5 rounded-full border border-rose-200">
                  Plano Gratuito • Bloqueado
                </span>
                <span className="text-xs font-bold text-slate-500">Dados Mascarados (3 caracteres + ********)</span>
              </div>
              <h3 className="text-base sm:text-lg font-black text-slate-950 mt-1">
                Visualização Bloqueada para Utilizadores Gratuitos
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 mt-0.5 max-w-2xl font-medium leading-relaxed">
                Para desbloquear todos os contactos reais, moradas, fotos e enviar orçamentos diretos aos clientes, escolha um plano <strong>Mensal</strong> (2 respostas/mês) ou <strong>Premium Ilimitado</strong>.
              </p>
            </div>
          </div>

          <button
            onClick={() => onUpgrade && onUpgrade()}
            className="w-full md:w-auto px-6 py-3.5 bg-[#ff5722] hover:bg-[#e64a19] text-white rounded-2xl font-black text-xs uppercase tracking-wider shadow-lg shadow-orange-500/25 active:scale-95 transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer"
          >
            <Crown size={16} />
            <span>Desbloquear Oportunidades</span>
          </button>
        </div>
      )}

      {isMonthly && (
        <div className="bg-white border border-amber-200 rounded-3xl p-5 sm:p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider bg-amber-100 text-amber-800 px-2.5 py-0.5 rounded-full border border-amber-300 flex items-center gap-1">
                <Sparkles size={12} /> Plano Mensal
              </span>
              <span className="text-xs font-bold text-slate-500">
                {currentMonthFormatted}
              </span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
              <h3 className="text-sm sm:text-base font-black text-slate-900">
                Orçamentos Respondidos: <span className={respondedCount >= MONTHLY_QUOTES_LIMIT ? 'text-rose-600 font-black' : 'text-[#ff5722] font-black'}>{respondedCount} / {MONTHLY_QUOTES_LIMIT}</span> este mês
              </h3>
              
              {/* Progress pill */}
              <div className="w-40 bg-slate-100 h-3 rounded-full overflow-hidden border border-slate-200">
                <div 
                  className={`h-full transition-all duration-500 ${respondedCount >= MONTHLY_QUOTES_LIMIT ? 'bg-rose-500' : 'bg-[#ff5722]'}`}
                  style={{ width: `${Math.min(100, (respondedCount / MONTHLY_QUOTES_LIMIT) * 100)}%` }}
                />
              </div>

              {respondedCount >= MONTHLY_QUOTES_LIMIT ? (
                <span className="text-xs font-black text-rose-600 flex items-center gap-1 bg-rose-50 px-2.5 py-1 rounded-xl border border-rose-200">
                  <ShieldAlert size={14} /> Limite mensal atingido (2/2)
                </span>
              ) : (
                <span className="text-xs font-bold text-emerald-700 flex items-center gap-1 bg-emerald-50 px-2.5 py-1 rounded-xl border border-emerald-200">
                  <CheckCircle2 size={14} /> {MONTHLY_QUOTES_LIMIT - respondedCount} resposta(s) disponível(is)
                </span>
              )}
            </div>

            <p className="text-xs text-slate-500 font-medium">
              O Plano Mensal inclui até 2 respostas a pedidos de clientes por mês. Para responder sem qualquer limite, faça upgrade para o Plano Premium Anual.
            </p>
          </div>

          {onUpgrade && (
            <button
              onClick={onUpgrade}
              className="w-full md:w-auto px-5 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-bold text-xs uppercase tracking-wider active:scale-95 transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer shadow-sm"
            >
              <Crown size={15} className="text-amber-400" />
              <span>Upgrade para Ilimitado</span>
            </button>
          )}
        </div>
      )}

      {isUnlimited && (
        <div className="bg-emerald-50/70 border border-emerald-200 rounded-3xl p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-sm">
              <Crown size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  Plano Premium Ativo
                </span>
                <span className="text-xs font-black text-emerald-700">Orçamentos Ilimitados</span>
              </div>
              <p className="text-xs text-emerald-900 font-medium mt-0.5">
                Pode responder a todos os pedidos de clientes e particulares sem qualquer restrição de quantidade.
              </p>
            </div>
          </div>

          <span className="text-xs font-black text-emerald-700 bg-white px-3 py-1.5 rounded-xl border border-emerald-200 shadow-2xs shrink-0">
            Acesso Total Desbloqueado ✨
          </span>
        </div>
      )}

      {/* Filters Bar */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          
          {/* Search Input */}
          <div className="sm:col-span-6 relative">
            <Search size={18} className="absolute left-3.5 top-3.5 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Pesquisar por serviço, tipo de trabalho, cidade ou nome..."
              className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:bg-white focus:border-amber-500 outline-none transition-all"
            />
          </div>

          {/* Category Filter */}
          <div className="sm:col-span-3">
            <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-bold text-slate-900 focus:bg-white focus:border-amber-500 outline-none cursor-pointer"
            >
              <option value="all">Todas as Categorias</option>
              {Object.entries(CATEGORY_MAP).map(([key, item]) => (
                <option key={key} value={key}>{item.label}</option>
              ))}
            </select>
          </div>

          {/* Location Filter */}
          <div className="sm:col-span-3">
            <select
              value={selectedLocation}
              onChange={e => setSelectedLocation(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-bold text-slate-900 focus:bg-white focus:border-amber-500 outline-none cursor-pointer"
            >
              <option value="all">Todas as Cidades / Zonas</option>
              {locationsList.map(loc => (
                <option key={loc} value={loc}>{isFree ? maskText(loc) : loc}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Categories Quick Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar text-xs font-bold">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3.5 py-1.5 rounded-xl shrink-0 transition-all ${selectedCategory === 'all' ? 'bg-slate-900 text-white shadow-md' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
          >
            Todos ({requests.length})
          </button>
          {Object.entries(CATEGORY_MAP).map(([catKey, cat]) => {
            const count = requests.filter(r => r.category === catKey).length;
            if (count === 0 && selectedCategory !== catKey) return null;
            return (
              <button
                key={catKey}
                onClick={() => setSelectedCategory(catKey)}
                className={`px-3 py-1.5 rounded-xl shrink-0 transition-all flex items-center gap-1.5 ${selectedCategory === catKey ? 'bg-amber-500 text-slate-950 font-black shadow-md' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
              >
                <span>{cat.label}</span>
                <span className="text-[10px] opacity-75">({count})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Requests Feed */}
      {loading ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-200">
          <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-slate-500 font-bold text-sm">A carregar oportunidades de clientes...</p>
        </div>
      ) : filteredRequests.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-6 space-y-4">
          <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mx-auto">
            <Search size={32} />
          </div>
          <h3 className="text-lg font-black text-slate-900">Nenhum pedido encontrado com estes filtros</h3>
          <p className="text-slate-500 text-xs sm:text-sm max-w-md mx-auto">
            Tente remover os filtros ou pesquisar por outra localidade. Novos pedidos de clientes particulares surgem em tempo real.
          </p>
          <button
            onClick={() => { setSearchTerm(''); setSelectedCategory('all'); setSelectedLocation('all'); }}
            className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-xs uppercase tracking-wider"
          >
            Limpar Filtros
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredRequests.map(req => {
            const catInfo = CATEGORY_MAP[req.category] || CATEGORY_MAP.other;
            const CatIcon = catInfo.icon;
            const isRevealed = !isFree && contactRevealed[req.id];
            const hasAlreadyResponded = respondedIds.includes(req.id);

            // Masked representations for Free users
            const displayTitle = maskText(req.title || req.projectTitle || 'Pedido de Obra');
            const displayDesc = maskText(req.description || req.projectDescription || 'Cliente à procura de orçamento detalhado para a realização deste serviço.');
            const displayLocation = maskText(req.location);
            const displayClientName = maskText(req.clientName);
            const displayPhone = maskText(req.clientPhone);
            const displayEmail = maskText(req.clientEmail);
            const displayBudget = maskText(req.budgetRange);

            return (
              <div 
                key={req.id}
                className={`bg-white rounded-3xl border ${isFree ? 'border-slate-200/80' : 'border-slate-200/90 hover:border-amber-400/80'} p-5 sm:p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4 group relative`}
              >
                {/* Free User Lock Badge Overlay (Non-intrusive) */}
                {isFree && (
                  <div className="absolute top-3 right-3 flex items-center gap-1 bg-amber-50 border border-amber-200 text-amber-800 px-2 py-0.5 rounded-full text-[10px] font-black uppercase">
                    <Lock size={10} /> Bloqueado no Free
                  </div>
                )}

                <div className="space-y-3">
                  
                  {/* Top Badge & Time */}
                  <div className="flex items-center justify-between gap-2">
                    <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-black border ${catInfo.color}`}>
                      <CatIcon size={14} /> {catInfo.label}
                    </div>

                    {!isFree && (
                      <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
                        <Clock size={12} /> {new Date(req.createdAt).toLocaleDateString([], { day: '2-digit', month: 'short' })}
                      </span>
                    )}
                  </div>

                  {/* Title & Description */}
                  <div>
                    <h3 className="text-base sm:text-lg font-black text-slate-900 group-hover:text-amber-700 transition-colors leading-snug break-words">
                      {displayTitle}
                    </h3>
                    <p className="text-slate-600 text-xs sm:text-sm mt-1 line-clamp-3 leading-relaxed font-medium break-words">
                      {displayDesc}
                    </p>
                  </div>

                  {/* Location & Details Tags */}
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-bold text-[11px]">
                      <MapPin size={12} className="text-rose-500" /> {displayLocation}
                    </span>
                    {req.propertyType && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-bold text-[11px] capitalize">
                        <Home size={12} className="text-blue-500" /> {req.propertyType === 'apartment' ? 'Apartamento' : req.propertyType === 'house' ? 'Moradia' : 'Comércio'}
                      </span>
                    )}
                    {req.urgency && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50 text-amber-800 font-bold text-[11px]">
                        <Clock size={12} className="text-amber-600" /> {req.urgency === 'immediate' ? 'Urgente' : 'Próximas semanas'}
                      </span>
                    )}
                    {req.budgetRange && req.budgetRange !== '500€ - 2.000€' && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 font-bold text-[11px]">
                        💰 {displayBudget}
                      </span>
                    )}
                  </div>

                  {/* Photos Preview (Blurred for Free users) */}
                  {req.photos && req.photos.length > 0 && (
                    <div className="flex items-center gap-2 pt-1">
                      {req.photos.slice(0, 3).map((img, i) => (
                        <div key={i} className="relative w-12 h-12 rounded-xl overflow-hidden border border-slate-200">
                          <img 
                            src={img} 
                            alt="Foto da obra" 
                            className={`w-full h-full object-cover ${isFree ? 'blur-xs scale-110' : ''}`} 
                          />
                          {isFree && (
                            <div className="absolute inset-0 bg-slate-900/30 flex items-center justify-center text-white">
                              <Lock size={12} />
                            </div>
                          )}
                        </div>
                      ))}
                      {req.photos.length > 3 && (
                        <span className="text-[11px] font-bold text-slate-500">+{req.photos.length - 3} fotos</span>
                      )}
                    </div>
                  )}
                </div>

                {/* Client Contact & Action Box */}
                <div className="border-t border-slate-100 pt-4 space-y-3">
                  
                  {/* Contact Preview / Reveal */}
                  <div className="bg-slate-50/80 p-3 rounded-2xl border border-slate-100 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5 overflow-hidden">
                        <div className="w-8 h-8 rounded-full bg-amber-500/10 text-amber-700 flex items-center justify-center font-black text-xs shrink-0">
                          {displayClientName ? displayClientName.charAt(0).toUpperCase() : 'C'}
                        </div>
                        <div className="overflow-hidden">
                          <div className="text-xs font-black text-slate-900 truncate">{displayClientName}</div>
                          <div className="text-[11px] text-slate-500 font-medium truncate">
                            {isFree ? (
                              <span className="text-slate-400 font-mono tracking-wider font-bold">
                                {displayPhone}
                              </span>
                            ) : isRevealed ? (
                              <span className="text-emerald-700 font-bold flex items-center gap-1">
                                <Phone size={10} /> {req.clientPhone} {req.clientEmail && `• ${req.clientEmail}`}
                              </span>
                            ) : (
                              <span>{req.clientPhone.slice(0, 6)}•••••</span>
                            )}
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => toggleContactReveal(req.id)}
                        className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg border transition-colors shrink-0 flex items-center gap-1 cursor-pointer ${isFree ? 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100' : 'bg-white border-slate-200 hover:bg-slate-100 text-slate-700'}`}
                      >
                        {isFree ? (
                          <>
                            <Lock size={10} /> Ver Contacto
                          </>
                        ) : isRevealed ? (
                          'Ocultar'
                        ) : (
                          'Ver Contacto'
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Create Estimate Button + WhatsApp CTA */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleStartBudget(req)}
                      className={`flex-1 py-3 px-4 rounded-2xl font-black text-xs uppercase tracking-wider transition-all shadow-md active:scale-95 flex items-center justify-center gap-2 cursor-pointer ${
                        isFree 
                          ? 'bg-amber-500 hover:bg-amber-600 text-white' 
                          : monthlyLimitReached && !hasAlreadyResponded
                            ? 'bg-slate-800 hover:bg-slate-900 text-amber-400'
                            : 'bg-slate-900 hover:bg-amber-500 hover:text-slate-950 text-white'
                      }`}
                    >
                      {isFree ? (
                        <>
                          <Lock size={15} /> Desbloquear e Criar Orçamento
                        </>
                      ) : monthlyLimitReached && !hasAlreadyResponded ? (
                        <>
                          <Crown size={15} /> Limite 2/2 Atingido • Upgrade
                        </>
                      ) : hasAlreadyResponded ? (
                        <>
                          <FileText size={15} /> Editar Orçamento Enviado
                        </>
                      ) : (
                        <>
                          <FileText size={15} /> Criar Orçamento p/ Cliente
                        </>
                      )}
                    </button>

                    {isFree ? (
                      <button
                        onClick={() => setUpgradeModalInfo({ open: true, reason: 'free_blocked' })}
                        className="p-3 bg-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-300 rounded-2xl shadow-xs transition-all active:scale-95 shrink-0 cursor-pointer"
                        title="Desbloquear WhatsApp (Plano Pago)"
                      >
                        <Lock size={16} />
                      </button>
                    ) : req.clientPhone ? (
                      <a
                        href={`https://wa.me/${req.clientPhone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Olá ${req.clientName}, vi o seu pedido de orçamento no ÁTRIOS BUILD para "${req.title}" e gostaria de apresentar a nossa proposta!`)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="p-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl shadow-md transition-all active:scale-95 shrink-0"
                        title="Enviar mensagem WhatsApp"
                      >
                        <MessageSquare size={16} />
                      </a>
                    ) : null}
                  </div>

                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* UPGRADE MODAL FOR FREE BLOCKED / MONTHLY LIMIT REACHED */}
      {upgradeModalInfo.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-slate-200 relative text-slate-900 space-y-5">
            
            <button
              onClick={() => setUpgradeModalInfo({ open: false, reason: 'free_blocked' })}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
            >
              <X size={20} />
            </button>

            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white flex items-center justify-center shadow-lg shadow-orange-500/25">
              {upgradeModalInfo.reason === 'free_blocked' ? (
                <Lock size={28} />
              ) : (
                <Crown size={28} />
              )}
            </div>

            <div className="space-y-2">
              <h3 className="text-xl sm:text-2xl font-black text-slate-950 tracking-tight">
                {upgradeModalInfo.reason === 'free_blocked'
                  ? 'Acesso Exclusivo para Profissionais com Plano Ativo'
                  : 'Limite Mensal Atingido (2/2 Orçamentos)'}
              </h3>
              
              <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
                {upgradeModalInfo.reason === 'free_blocked'
                  ? 'Os pedidos de particulares contêm dados reais de obras e contactos diretos. No Plano Gratuito, as informações ficam mascaradas. Escolha o seu plano para desbloquear:'
                  : 'O seu Plano Mensal permite responder a até 2 pedidos de clientes por mês. Já utilizou todas as suas respostas disponíveis neste mês.'}
              </p>
            </div>

            {/* Plans comparison cards */}
            <div className="space-y-2.5 pt-1">
              <div className="p-3.5 rounded-2xl border-2 border-amber-400 bg-amber-50/60 flex items-center justify-between">
                <div>
                  <div className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                    <Crown size={14} className="text-[#ff5722]" /> Plano Premium Anual / Vitalício
                  </div>
                  <div className="text-[11px] text-slate-600 font-bold mt-0.5">
                    ✨ Orçamentos Ilimitados para responder a todos os clientes
                  </div>
                </div>
                <span className="text-xs font-black text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-md">
                  Ilimitado
                </span>
              </div>

              <div className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-900">
                    Plano Mensal
                  </div>
                  <div className="text-[11px] text-slate-500 font-medium mt-0.5">
                    Até 2 orçamentos respondidos por mês
                  </div>
                </div>
                <span className="text-xs font-black text-slate-700 bg-slate-200 px-2 py-0.5 rounded-md">
                  2 / mês
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
              <button
                onClick={() => {
                  setUpgradeModalInfo({ open: false, reason: 'free_blocked' });
                  if (onUpgrade) onUpgrade();
                }}
                className="flex-1 py-3.5 bg-[#ff5722] hover:bg-[#e64a19] text-white rounded-2xl font-black text-xs uppercase tracking-wider shadow-lg shadow-orange-500/25 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Crown size={16} />
                <span>Ver Planos & Fazer Upgrade</span>
              </button>

              <button
                onClick={() => setUpgradeModalInfo({ open: false, reason: 'free_blocked' })}
                className="py-3.5 px-5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl font-bold text-xs uppercase tracking-wider transition-all cursor-pointer text-center"
              >
                Fechar
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
export default ClientRequestsHub;
