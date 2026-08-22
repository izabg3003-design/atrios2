import React, { useState, useEffect, useMemo } from 'react';
import { 
  Briefcase, MapPin, Calendar, Clock, Phone, Mail, User, 
  Search, Filter, ChevronRight, CheckCircle2, AlertCircle, 
  Sparkles, Hammer, Paintbrush, Zap, Home, Wrench, Layers, 
  ArrowRight, ShieldCheck, Eye, Plus, Send, FileText, Check, 
  MessageSquare, Trash2, ExternalLink
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

  const isPremium = currentUser.plan !== PlanType.FREE;

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
            const isRevealed = contactRevealed[req.id];

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
                      <MapPin size={12} className="text-rose-500" /> {req.location}
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
                    {req.budgetRange && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 font-bold text-[11px]">
                        💰 {req.budgetRange}
                      </span>
                    )}
                  </div>

                  {/* Photos Preview if available */}
                  {req.photos && req.photos.length > 0 && (
                    <div className="flex items-center gap-2 pt-1">
                      {req.photos.slice(0, 3).map((img, i) => (
                        <img 
                          key={i} 
                          src={img} 
                          alt="Foto da obra" 
                          className="w-12 h-12 rounded-xl object-cover border border-slate-200" 
                        />
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
                          {req.clientName ? req.clientName.charAt(0).toUpperCase() : 'C'}
                        </div>
                        <div className="overflow-hidden">
                          <div className="text-xs font-black text-slate-900 truncate">{req.clientName}</div>
                          <div className="text-[11px] text-slate-500 font-medium truncate">
                            {isRevealed ? (
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
                        className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 transition-colors shrink-0"
                      >
                        {isRevealed ? 'Ocultar' : 'Ver Contacto'}
                      </button>
                    </div>

                    {isRevealed && req.accessCode && (
                      <div className="pt-1.5 border-t border-slate-200/60 flex items-center justify-between text-[11px] bg-amber-50/70 px-2.5 py-1.5 rounded-xl border border-amber-200/50">
                        <span className="text-slate-600 font-bold flex items-center gap-1">
                          <ShieldCheck size={13} className="text-amber-600" /> Código de Acesso do Cliente:
                        </span>
                        <span className="font-mono font-black text-amber-700 bg-amber-100/80 px-2 py-0.5 rounded text-xs tracking-wider">
                          {req.accessCode}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Create Estimate Button */}
                  <div className="flex items-center gap-2">
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
                  </div>

                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
export default ClientRequestsHub;
