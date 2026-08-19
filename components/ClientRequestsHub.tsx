import React, { useState, useEffect, useMemo } from 'react';
import { 
  Briefcase, MapPin, Calendar, Clock, Phone, Mail, User, 
  Search, Filter, ChevronRight, ChevronLeft, CheckCircle2, AlertCircle, 
  Sparkles, Hammer, Paintbrush, Zap, Home, Wrench, Layers, 
  ArrowRight, ShieldCheck, Eye, Plus, Send, FileText, Check, 
  MessageSquare, Trash2, ExternalLink, Lock, Crown, Star, X,
  Maximize2, Download
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

// Masking helpers for free users (e.g. jef****** rua jo***** telemovel 876*****)
const maskName = (name?: string): string => {
  if (!name) return 'Jef******';
  const parts = name.trim().split(/\s+/);
  return parts.map(part => {
    if (part.length <= 2) return part.slice(0, 1) + '***';
    if (part.length === 3) return part.slice(0, 2) + '****';
    return part.slice(0, 3) + '******';
  }).join(' ');
};

const maskAddress = (address?: string): string => {
  if (!address) return 'rua jo*****';
  const parts = address.trim().split(/\s+/);
  return parts.map((part, i) => {
    const lower = part.toLowerCase().replace(/[,.:;]/g, '');
    if (['rua', 'av', 'av.', 'avenida', 'travessa', 'estrada', 'alameda', 'praça', 'praca', 'largo', 'de', 'da', 'do', 'das', 'dos'].includes(lower)) {
      return part;
    }
    const cleanWord = part.replace(/[,.:;]/g, '');
    const suffix = part.slice(cleanWord.length);
    const masked = cleanWord.length <= 2 ? cleanWord.slice(0, 1) + '*****' : cleanWord.slice(0, 2) + '*****';
    return masked + suffix;
  }).join(' ');
};

const maskPhone = (phone?: string): string => {
  if (!phone) return '876*****';
  const clean = phone.trim();
  if (clean.startsWith('+')) {
    const parts = clean.split(' ');
    if (parts.length > 1) {
      const firstNum = parts[1] || '';
      return `${parts[0]} ${firstNum.slice(0, 3)}*****`;
    }
  }
  const digits = clean.replace(/\D/g, '');
  if (digits.length <= 3) return `${digits}*****`;
  return `${digits.slice(0, 3)}*****`;
};

const maskEmail = (email?: string): string => {
  if (!email) return 'jef*****@***.com';
  const [user, domain] = email.split('@');
  if (!domain) return 'jef*****@***.com';
  const maskedUser = user.length <= 3 ? user.slice(0, 1) + '*****' : user.slice(0, 3) + '******';
  const domainParts = domain.split('.');
  const tld = domainParts.length > 1 ? domainParts[domainParts.length - 1] : 'com';
  return `${maskedUser}@***.${tld}`;
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
  const [selectedRequest, setSelectedRequest] = useState<ClientServiceRequest | null>(null);
  const [contactRevealed, setContactRevealed] = useState<Record<string, boolean>>({});
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [previewImage, setPreviewImage] = useState<{ photos: string[]; currentIndex: number; title: string } | null>(null);

  // Keyboard navigation for image lightbox
  useEffect(() => {
    if (!previewImage) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setPreviewImage(null);
      } else if (e.key === 'ArrowLeft') {
        setPreviewImage(prev => prev ? {
          ...prev,
          currentIndex: (prev.currentIndex - 1 + prev.photos.length) % prev.photos.length
        } : null);
      } else if (e.key === 'ArrowRight') {
        setPreviewImage(prev => prev ? {
          ...prev,
          currentIndex: (prev.currentIndex + 1) % prev.photos.length
        } : null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [previewImage]);

  // Check if current user is on a Premium plan
  const isPremium = Boolean(currentUser?.plan && currentUser.plan !== PlanType.FREE);

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

  const locationsList = useMemo(() => {
    const set = new Set<string>();
    requests.forEach(r => {
      if (r.location) set.add(r.location.trim());
    });
    return Array.from(set);
  }, [requests]);

  const filteredRequests = useMemo(() => {
    return requests.filter(r => {
      const matchSearch = 
        r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.clientName.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchCat = selectedCategory === 'all' || r.category === selectedCategory;
      const matchLoc = selectedLocation === 'all' || r.location.toLowerCase() === selectedLocation.toLowerCase();

      return matchSearch && matchCat && matchLoc;
    });
  }, [requests, searchTerm, selectedCategory, selectedLocation]);

  const handleStartBudget = (req: ClientServiceRequest) => {
    if (!isPremium) {
      setShowUpgradeModal(true);
      return;
    }

    onCreateBudgetForClient({
      clientName: req.clientName,
      clientEmail: req.clientEmail,
      clientPhone: req.clientPhone,
      clientAddress: req.location + (req.postalCode ? `, ${req.postalCode}` : ''),
      projectTitle: req.title,
      projectDescription: req.description,
      category: req.category
    });

    // Incrementar contagem de propostas
    saveClientServiceRequest({
      ...req,
      proposalsCount: (req.proposalsCount || 0) + 1
    });
  };

  const toggleContactReveal = (id: string) => {
    if (!isPremium) {
      setShowUpgradeModal(true);
      return;
    }

    setContactRevealed(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleUpgradeClick = () => {
    setShowUpgradeModal(false);
    if (onUpgrade) {
      onUpgrade();
    }
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

      {/* Free Plan Lock Banner */}
      {!isPremium && (
        <div className="bg-gradient-to-r from-amber-500/15 via-amber-500/10 to-amber-500/5 border-2 border-amber-500/40 rounded-3xl p-5 sm:p-6 shadow-md relative overflow-hidden">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-black shrink-0 shadow-lg shadow-amber-500/20">
                <Crown size={24} />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-base font-black text-slate-900">
                    Acesso a Oportunidades: Restrito ao Plano Gratuito
                  </h3>
                  <span className="bg-amber-500 text-slate-950 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full">
                    Exclusivo Premium
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-700 font-medium">
                  Os detalhes de contacto (telemóvel, e-mail, WhatsApp) e o envio de propostas diretas a clientes estão bloqueados no plano Gratuito. Atualize para o <strong>Plano Premium</strong> para desbloquear contactos e fechar novas obras.
                </p>
              </div>
            </div>

            <button
              onClick={handleUpgradeClick}
              className="w-full md:w-auto px-6 py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs uppercase tracking-wider rounded-2xl shadow-lg shadow-amber-500/25 transition-all flex items-center justify-center gap-2 shrink-0 active:scale-95"
            >
              <Crown size={16} /> Desbloquear com Premium
            </button>
          </div>
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
                <option key={loc} value={loc}>{loc}</option>
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
            const isRevealed = Boolean(contactRevealed[req.id]);

            return (
              <div 
                key={req.id}
                className="bg-white rounded-3xl border border-slate-200/90 hover:border-amber-400/80 p-5 sm:p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4 group"
              >
                <div className="space-y-3">
                  
                  {/* Top Badge & Time */}
                  <div className="flex items-center justify-between gap-2">
                    <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-black border ${catInfo.color}`}>
                      <CatIcon size={14} /> {catInfo.label}
                    </div>

                    <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
                      <Clock size={12} /> {new Date(req.createdAt).toLocaleDateString([], { day: '2-digit', month: 'short' })}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <div>
                    <h3 className="text-base sm:text-lg font-black text-slate-900 group-hover:text-amber-700 transition-colors leading-snug">
                      {req.title}
                    </h3>
                    <p className="text-slate-600 text-xs sm:text-sm mt-1 line-clamp-3 leading-relaxed font-medium">
                      {req.description || 'Cliente à procura de orçamento detalhado para a realização deste serviço.'}
                    </p>
                  </div>

                  {/* Location & Details Tags */}
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-bold text-[11px]">
                      <MapPin size={12} className="text-rose-500" /> {isPremium ? req.location : maskAddress(req.location)}
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
                  </div>

                  {/* Photos Preview if available */}
                  {req.photos && req.photos.length > 0 && (
                    <div className="pt-2 space-y-1.5">
                      <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                        <Eye size={12} className="text-amber-500" /> 
                        <span>Fotos Anexadas pelo Cliente ({req.photos.length}) — clique para ampliar:</span>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        {req.photos.slice(0, 4).map((img, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setPreviewImage({
                                photos: req.photos || [],
                                currentIndex: i,
                                title: req.title
                              });
                            }}
                            className="relative group/img overflow-hidden rounded-xl border-2 border-slate-200 hover:border-amber-500 transition-all shadow-sm cursor-pointer active:scale-95 focus:outline-none"
                            title="Clique para abrir e ampliar a imagem da obra"
                          >
                            <img 
                              src={img} 
                              alt={`Foto ${i + 1} da obra`} 
                              className="w-14 h-14 sm:w-16 sm:h-16 object-cover group-hover/img:scale-110 transition-transform duration-300" 
                            />
                            <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center text-white">
                              <Maximize2 size={16} className="drop-shadow" />
                            </div>
                          </button>
                        ))}
                        {req.photos.length > 4 && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setPreviewImage({
                                photos: req.photos || [],
                                currentIndex: 4,
                                title: req.title
                              });
                            }}
                            className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-slate-100 hover:bg-amber-50 border-2 border-slate-200 hover:border-amber-400 flex flex-col items-center justify-center text-slate-700 hover:text-amber-700 font-black text-xs transition-all cursor-pointer shadow-sm active:scale-95"
                            title="Ver todas as fotos"
                          >
                            <span>+{req.photos.length - 4}</span>
                            <span className="text-[9px] font-bold uppercase text-slate-500">Mais</span>
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Client Contact & Action Box */}
                <div className="border-t border-slate-100 pt-4 space-y-3">
                  
                  {/* Contact Preview / Reveal */}
                  <div className="bg-slate-50/80 p-3.5 rounded-2xl border border-slate-100 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5 overflow-hidden">
                        <div className="w-8 h-8 rounded-full bg-amber-500/10 text-amber-700 flex items-center justify-center font-black text-xs shrink-0">
                          {req.clientName ? (isPremium ? req.clientName.charAt(0).toUpperCase() : maskName(req.clientName).charAt(0).toUpperCase()) : 'C'}
                        </div>
                        <div className="overflow-hidden">
                          <div className="text-xs font-black text-slate-900 truncate">
                            {isPremium ? req.clientName : maskName(req.clientName)}
                          </div>
                          
                          <div className="text-[11px] font-medium truncate mt-0.5">
                            {isPremium ? (
                              isRevealed ? (
                                <span className="text-emerald-700 font-bold flex items-center gap-1.5">
                                  <Phone size={11} className="text-emerald-600" /> {req.clientPhone} 
                                  {req.clientEmail && <span className="text-slate-500 font-normal">• {req.clientEmail}</span>}
                                </span>
                              ) : (
                                <span className="text-slate-500 font-mono">
                                  {req.clientPhone ? `${req.clientPhone.slice(0, 3)} ••• •••` : '•••••••••'}
                                </span>
                              )
                            ) : (
                              <div className="flex flex-col gap-0.5">
                                <span className="text-slate-600 font-mono text-[11px] flex items-center gap-1.5 font-medium">
                                  <Phone size={11} className="text-amber-500 shrink-0" />
                                  <span>telemóvel {maskPhone(req.clientPhone)}</span>
                                </span>
                                {req.clientEmail && (
                                  <span className="text-slate-400 font-mono text-[10px] flex items-center gap-1.5">
                                    <Mail size={10} className="text-slate-400 shrink-0" />
                                    <span className="truncate">{maskEmail(req.clientEmail)}</span>
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => toggleContactReveal(req.id)}
                        className="text-[10px] font-black uppercase tracking-wider px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 transition-colors shrink-0 flex items-center gap-1 shadow-sm cursor-pointer"
                      >
                        {isPremium ? (
                          isRevealed ? 'Ocultar' : 'Ver Contacto'
                        ) : (
                          <>
                            <Lock size={11} className="text-amber-500" /> Desbloquear
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Create Estimate / Action Buttons */}
                  <div className="flex items-center gap-2">
                    {isPremium ? (
                      <>
                        <button
                          onClick={() => handleStartBudget(req)}
                          className="flex-1 py-3 px-4 bg-slate-900 hover:bg-amber-500 hover:text-slate-950 text-white rounded-2xl font-black text-xs uppercase tracking-wider transition-all shadow-md active:scale-95 flex items-center justify-center gap-2"
                        >
                          <FileText size={15} /> Criar Orçamento p/ Cliente
                        </button>

                        {req.clientPhone && (
                          <a
                            href={`https://wa.me/${req.clientPhone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Olá ${req.clientName}, vi o seu pedido de orçamento no ÁTRIOS BUILD para "${req.title}" e gostaria de apresentar a nossa proposta!`)}`}
                            target="_blank"
                            rel="noreferrer"
                            className="p-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl shadow-md transition-all active:scale-95 shrink-0"
                            title="Enviar mensagem WhatsApp"
                          >
                            <MessageSquare size={16} />
                          </a>
                        )}
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => setShowUpgradeModal(true)}
                          className="flex-1 py-3 px-4 bg-slate-900/90 hover:bg-slate-900 text-amber-400 border border-amber-500/30 rounded-2xl font-black text-xs uppercase tracking-wider transition-all shadow-md active:scale-95 flex items-center justify-center gap-2"
                        >
                          <Lock size={14} className="text-amber-400" /> Responder Pedido (Requer Premium)
                        </button>

                        <button
                          type="button"
                          onClick={() => setShowUpgradeModal(true)}
                          className="p-3 bg-slate-100 hover:bg-amber-100/80 text-slate-400 hover:text-amber-700 border border-slate-200 hover:border-amber-400 rounded-2xl shadow-sm transition-all active:scale-95 shrink-0 flex items-center justify-center relative group/wa cursor-pointer"
                          title="Contacto via WhatsApp Bloqueado (Requer Plano Premium)"
                        >
                          <MessageSquare size={16} className="text-slate-400 group-hover/wa:text-amber-600" />
                          <div className="absolute -top-1.5 -right-1.5 bg-amber-500 text-slate-950 p-0.5 rounded-full shadow">
                            <Lock size={10} />
                          </div>
                        </button>
                      </>
                    )}
                  </div>

                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Upgrade Modal for Free Users */}
      {showUpgradeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-amber-500/30 space-y-6 relative">
            <button
              onClick={() => setShowUpgradeModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-2 rounded-full hover:bg-slate-100 transition-all"
            >
              <X size={20} />
            </button>

            <div className="text-center space-y-3">
              <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-amber-500 to-amber-300 text-slate-950 flex items-center justify-center mx-auto shadow-xl shadow-amber-500/30 font-black">
                <Crown size={32} />
              </div>

              <h3 className="text-xl font-black text-slate-900">
                Funcionalidade Exclusiva Premium
              </h3>

              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
                O acesso direto a contactos de clientes particulares, visualização de números, envio por WhatsApp e criação de orçamentos para pedidos de obras são funcionalidades reservadas aos membros <strong>Premium</strong>.
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 space-y-2.5 text-xs font-bold text-slate-700">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                <span>Contactos completos e validados de clientes</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                <span>Contacto direto via WhatsApp em 1 clique</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                <span>Geração direta de orçamentos profissionais em PDF</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                <span>Sem limites de propostas enviadas</span>
              </div>
            </div>

            <div className="space-y-2">
              <button
                onClick={handleUpgradeClick}
                className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs uppercase tracking-wider rounded-2xl shadow-xl shadow-amber-500/25 transition-all flex items-center justify-center gap-2 active:scale-95"
              >
                <Crown size={16} /> Fazer Upgrade Agora
              </button>

              <button
                onClick={() => setShowUpgradeModal(false)}
                className="w-full py-2.5 text-slate-500 hover:text-slate-700 font-bold text-xs"
              >
                Voltar à navegação
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Fullscreen Image Lightbox Modal */}
      {previewImage && (
        <div 
          className="fixed inset-0 z-[99999] bg-slate-950/95 backdrop-blur-md flex flex-col justify-between p-3 sm:p-6 animate-in fade-in duration-200"
          onClick={() => setPreviewImage(null)}
        >
          {/* Top Bar */}
          <div 
            className="flex items-center justify-between gap-4 max-w-6xl w-full mx-auto z-10 text-white"
            onClick={e => e.stopPropagation()}
          >
            <div className="space-y-0.5">
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-400">
                Visualizador de Imagens da Obra
              </span>
              <h4 className="text-sm sm:text-base font-bold text-white truncate max-w-md">
                {previewImage.title}
              </h4>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs font-mono font-bold bg-white/10 px-3 py-1.5 rounded-xl text-slate-300">
                Foto {previewImage.currentIndex + 1} de {previewImage.photos.length}
              </span>
              <a
                href={previewImage.photos[previewImage.currentIndex]}
                target="_blank"
                rel="noreferrer"
                download={`foto_obra_${previewImage.currentIndex + 1}.jpg`}
                className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer"
                title="Abrir imagem original"
              >
                <ExternalLink size={18} />
              </a>
              <button
                onClick={() => setPreviewImage(null)}
                className="p-2.5 rounded-xl bg-white/10 hover:bg-rose-500 text-white transition-all cursor-pointer"
                title="Fechar (ESC)"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Main Large Image Container with Navigation Arrows */}
          <div 
            className="relative flex-1 flex items-center justify-center max-w-6xl w-full mx-auto my-2"
            onClick={e => e.stopPropagation()}
          >
            {previewImage.photos.length > 1 && (
              <button
                type="button"
                onClick={() => setPreviewImage(prev => prev ? {
                  ...prev,
                  currentIndex: (prev.currentIndex - 1 + prev.photos.length) % prev.photos.length
                } : null)}
                className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 p-3 sm:p-4 rounded-full bg-slate-900/80 hover:bg-amber-500 hover:text-slate-950 text-white border border-white/10 shadow-2xl transition-all z-20 cursor-pointer"
                title="Foto anterior (Seta Esquerda)"
              >
                <ChevronLeft size={24} />
              </button>
            )}

            <div className="relative max-h-[70vh] sm:max-h-[75vh] w-full flex items-center justify-center overflow-hidden rounded-2xl sm:rounded-3xl border border-white/10 bg-black/40 shadow-2xl">
              <img
                src={previewImage.photos[previewImage.currentIndex]}
                alt={`Foto ampliada ${previewImage.currentIndex + 1}`}
                className="max-h-[70vh] sm:max-h-[75vh] w-auto max-w-full object-contain select-none animate-in zoom-in-95 duration-200"
              />
            </div>

            {previewImage.photos.length > 1 && (
              <button
                type="button"
                onClick={() => setPreviewImage(prev => prev ? {
                  ...prev,
                  currentIndex: (prev.currentIndex + 1) % prev.photos.length
                } : null)}
                className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 p-3 sm:p-4 rounded-full bg-slate-900/80 hover:bg-amber-500 hover:text-slate-950 text-white border border-white/10 shadow-2xl transition-all z-20 cursor-pointer"
                title="Próxima foto (Seta Direita)"
              >
                <ChevronRight size={24} />
              </button>
            )}
          </div>

          {/* Bottom Thumbnails Strip (if multiple photos) */}
          {previewImage.photos.length > 1 && (
            <div 
              className="flex items-center justify-center gap-2 max-w-4xl w-full mx-auto overflow-x-auto py-2 no-scrollbar z-10"
              onClick={e => e.stopPropagation()}
            >
              {previewImage.photos.map((ph, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setPreviewImage(prev => prev ? { ...prev, currentIndex: idx } : null)}
                  className={`w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden border-2 transition-all shrink-0 cursor-pointer ${
                    previewImage.currentIndex === idx
                      ? 'border-amber-500 scale-105 shadow-lg shadow-amber-500/20 ring-2 ring-amber-500/30'
                      : 'border-white/20 opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={ph} alt={`Miniatura ${idx + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}

    </div>
  );
};
export default ClientRequestsHub;

