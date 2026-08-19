import React, { useState } from 'react';
import { 
  X, Wrench, Paintbrush, Zap, Home, Hammer, Sparkles, Send, 
  MapPin, Phone, Mail, User, AlertCircle, CheckCircle2, ShieldCheck, 
  HelpCircle, Camera, Upload, Layers, Calendar, ChevronRight, ArrowLeft
} from 'lucide-react';
import { ClientServiceRequest, ServiceCategory } from '../types';
import { saveClientServiceRequest } from '../services/storage';

interface ClientRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  locale?: string;
  onSuccess?: (request: ClientServiceRequest) => void;
  onOpenPortal?: () => void;
}

const CATEGORIES: { id: ServiceCategory; label: string; icon: React.FC<{ size?: number; className?: string }>; description: string }[] = [
  { id: 'doors_windows', label: 'Portas & Janelas', icon: Home, description: 'Trocar portas, janelas, fechaduras, alumínios e estores' },
  { id: 'painting', label: 'Pintura', icon: Paintbrush, description: 'Pintura de paredes interiores, tetos, fachadas ou portões' },
  { id: 'electrical', label: 'Eletricidade & Fichas', icon: Zap, description: 'Troca de tomadas, fichas, disjuntores, iluminação e quadros' },
  { id: 'plumbing', label: 'Canalização & Esgotos', icon: Wrench, description: 'Torneiras, fugas de água, loiças de casa de banho, tubagens' },
  { id: 'plasterboard', label: 'Pladur & Tetos Falsos', icon: Layers, description: 'Divisórias em pladur, tetos falsos, sancas e isolamentos' },
  { id: 'renovation', label: 'Remodelação Geral', icon: Sparkles, description: 'Cozinhas, casas de banho completas, remodelações totais' },
  { id: 'construction', label: 'Construção do Zero', icon: Hammer, description: 'Construção de moradias, ampliações, muros e alvenaria' },
  { id: 'roofing', label: 'Telhados & Coberturas', icon: Home, description: 'Reparação de telhados, caleiras, impermeabilizações' },
  { id: 'flooring', label: 'Pisos & Revestimentos', icon: Layers, description: 'Cerâmica, mosaicos, flutuante, vinílico ou deck' },
  { id: 'other', label: 'Outro Serviço', icon: HelpCircle, description: 'Qualquer outro tipo de reparação, manutenção ou obra' }
];

export const ClientRequestModal: React.FC<ClientRequestModalProps> = ({
  isOpen,
  onClose,
  locale = 'pt-PT',
  onSuccess,
  onOpenPortal
}) => {
  const [step, setStep] = useState<1 | 2>(1);
  
  // Step 1: Personal & Location Details
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [location, setLocation] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [propertyType, setPropertyType] = useState<'apartment' | 'house' | 'commercial' | 'land' | 'other'>('apartment');

  // Step 2: Service Details
  const [category, setCategory] = useState<ServiceCategory>('doors_windows');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [urgency, setUrgency] = useState<'immediate' | 'few_weeks' | 'flexible'>('few_weeks');
  const [photos, setPhotos] = useState<string[]>([]);
  
  const [submitting, setSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [createdRequestId, setCreatedRequestId] = useState('');
  const [createdAccessCode, setCreatedAccessCode] = useState('');

  if (!isOpen) return null;

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    Array.from(files).forEach((file: File) => {
      if (file.size > 5 * 1024 * 1024) {
        alert('A fotografia não deve exceder 5MB.');
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        if (reader.result) {
          setPhotos(prev => [...prev, reader.result as string].slice(0, 5));
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const handleAdvanceStep1 = () => {
    if (!clientName.trim()) {
      alert('Por favor introduza o seu Nome.');
      return;
    }
    if (!clientPhone.trim()) {
      alert('Por favor introduza o seu Telemóvel / WhatsApp para envio dos orçamentos.');
      return;
    }
    if (!location.trim()) {
      alert('Por favor introduza a Cidade ou Concelho da obra.');
      return;
    }
    setStep(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert('Por favor indique um resumo ou título para o seu pedido de serviço.');
      return;
    }

    setSubmitting(true);
    try {
      const result = await saveClientServiceRequest({
        clientName: clientName.trim(),
        clientEmail: clientEmail.trim(),
        clientPhone: clientPhone.trim(),
        category,
        title: title.trim(),
        description: description.trim(),
        location: location.trim(),
        postalCode: postalCode.trim() || undefined,
        propertyType,
        urgency,
        photos,
        status: 'pending'
      });

      if (result.success && result.data) {
        setCreatedRequestId(result.data.id);
        const code = result.data.accessCode || '';
        setCreatedAccessCode(code);
        if (clientPhone) {
          localStorage.setItem('atrios_client_session_phone', clientPhone.trim());
          if (code) {
            localStorage.setItem(`atrios_client_code_${clientPhone.trim()}`, code);
          }
        }
        setIsSuccess(true);
        if (onSuccess) onSuccess(result.data);
      } else {
        alert('Ocorreu um erro ao submeter o seu pedido. Por favor tente novamente.');
      }
    } catch (err) {
      console.error(err);
      alert('Ocorreu um erro ao submeter o seu pedido.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setIsSuccess(false);
    setStep(1);
    setTitle('');
    setDescription('');
    setLocation('');
    setClientName('');
    setClientPhone('');
    setClientEmail('');
    setPhotos([]);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto">
      <div className="bg-white text-slate-900 w-full max-w-2xl rounded-3xl sm:rounded-[2rem] shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[92vh] flex flex-col">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 via-amber-500 to-amber-600 text-white px-5 sm:px-8 py-5 sm:py-6 flex items-center justify-between shrink-0 relative overflow-hidden">
          <div className="absolute -right-6 -bottom-6 opacity-15">
            <Hammer size={120} />
          </div>

          <div className="relative z-10 flex-1 pr-3 sm:pr-4">
            <div className="flex flex-wrap items-center gap-2.5 mb-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/20 text-white text-[11px] font-black uppercase tracking-wider">
                <Sparkles size={13} /> 100% Gratuito & Sem Compromisso
              </div>

              {onOpenPortal && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenPortal();
                  }}
                  className="inline-flex items-center gap-2 px-4 py-1.5 sm:py-2 rounded-full bg-slate-950 hover:bg-black text-amber-300 hover:text-amber-200 text-xs sm:text-sm font-black tracking-wide transition-all border-2 border-amber-400 shadow-md hover:shadow-lg active:scale-95 cursor-pointer ring-2 ring-amber-400/30"
                  title="Aceder à Área do Cliente para ver orçamentos"
                >
                  <ShieldCheck size={16} className="text-amber-400 shrink-0" />
                  <span>Já tem código? Fazer Login</span>
                  <ChevronRight size={15} className="text-amber-400 shrink-0" />
                </button>
              )}
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight">
              Pedir Orçamento Grátis
            </h2>
            <p className="text-white/90 text-xs sm:text-sm font-medium mt-0.5">
              Receba propostas e orçamentos detalhados de profissionais qualificados
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-full transition-colors relative z-10 shrink-0 cursor-pointer"
          >
            <X size={22} />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-5 sm:p-8 overflow-y-auto flex-1 space-y-6">
          {isSuccess ? (
            <div className="text-center py-6 space-y-5 animate-in zoom-in-95 duration-300">
              <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 size={46} />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-black text-slate-900">Pedido Submetido com Sucesso!</h3>
                <p className="text-slate-600 text-sm max-w-md mx-auto leading-relaxed">
                  O seu pedido <span className="font-mono font-bold text-amber-600">#{createdRequestId}</span> foi registado e enviado para os profissionais da sua zona.
                </p>
              </div>

              {createdAccessCode && (
                <div className="bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-slate-50 border-2 border-amber-500/40 rounded-3xl p-6 max-w-md mx-auto space-y-3 text-center shadow-md">
                  <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-amber-500 text-slate-950 text-[10px] font-black uppercase tracking-wider shadow-sm">
                    <ShieldCheck size={14} /> O Seu Código de Acesso Exclusivo
                  </div>
                  <div className="text-3xl sm:text-4xl font-mono font-black text-amber-600 tracking-widest py-1 bg-white rounded-2xl border border-amber-200 shadow-inner">
                    {createdAccessCode}
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed font-medium">
                    Guarde este código! Ele dá-lhe acesso imediato à área exclusiva do <strong className="text-slate-950">Portal do Cliente ÁTRIOS</strong> para acompanhar orçamentos, aprovar propostas e falar com os profissionais.
                  </p>
                </div>
              )}

              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs text-slate-700 text-left max-w-md mx-auto space-y-1.5">
                <div className="flex items-center gap-2 font-bold text-slate-900">
                  <Sparkles size={16} className="text-amber-600" /> Próximos passos
                </div>
                <ul className="list-disc list-inside space-y-1 text-slate-600">
                  <li>Profissionais na zona de <strong>{location}</strong> vão analisar o seu pedido.</li>
                  <li>Receberá notificações no telemóvel <strong>{clientPhone}</strong> quando tiver novos orçamentos.</li>
                  <li>Pode aceder ao Portal do Cliente a qualquer momento para ver os orçamentos em PDF.</li>
                </ul>
              </div>

              <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center">
                {onOpenPortal && (
                  <button
                    onClick={() => {
                      handleReset();
                      onOpenPortal();
                    }}
                    className="px-7 py-3.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-2xl font-black text-xs uppercase tracking-wider transition-all shadow-lg shadow-orange-500/25 active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Sparkles size={16} /> Aceder ao Portal do Cliente ÁTRIOS
                  </button>
                )}
                <button
                  onClick={handleReset}
                  className="px-6 py-3.5 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-black text-xs uppercase tracking-wider transition-all shadow-md active:scale-95 cursor-pointer"
                >
                  Concluir
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Step indicator */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2">
                  <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black transition-colors ${step === 1 ? 'bg-amber-500 text-slate-950' : 'bg-emerald-500 text-white'}`}>
                    1
                  </span>
                  <span className="text-xs sm:text-sm font-bold text-slate-800">1. Informações Pessoais</span>
                </div>
                <div className="w-12 h-[2px] bg-slate-200" />
                <div className="flex items-center gap-2">
                  <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black transition-colors ${step === 2 ? 'bg-amber-500 text-slate-950' : 'bg-slate-200 text-slate-500'}`}>
                    2
                  </span>
                  <span className="text-xs sm:text-sm font-bold text-slate-800">2. Detalhes do Serviço</span>
                </div>
              </div>

              {/* STEP 1: Personal & Contact Information */}
              {step === 1 && (
                <div className="space-y-5 animate-in fade-in duration-300">
                  
                  {/* Option for clients who already have a request / code */}
                  <div className="bg-slate-900 text-white rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-md border border-slate-800">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center shrink-0">
                        <ShieldCheck size={22} />
                      </div>
                      <div className="text-left">
                        <p className="text-xs font-black text-white">Já fez uma solicitação anteriormente?</p>
                        <p className="text-[11px] text-slate-300">Aceda ao Portal do Cliente para consultar e aprovar orçamentos.</p>
                      </div>
                    </div>
                    {onOpenPortal && (
                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          onOpenPortal();
                        }}
                        className="w-full sm:w-auto px-4 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-sm shrink-0 flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer"
                      >
                        Entrar no Portal <ChevronRight size={14} />
                      </button>
                    )}
                  </div>

                  <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-4 text-xs text-amber-900 flex items-start gap-3">
                    <User size={18} className="text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold">Novo Pedido: Identificação do Cliente</p>
                      <p className="text-amber-800 mt-0.5 leading-relaxed">
                        Indique os seus dados para que os profissionais da sua zona possam entrar em contacto e enviar-lhe orçamentos detalhados.
                      </p>
                    </div>
                  </div>

                  {/* Name and Phone */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">
                        O seu Nome Completo *
                      </label>
                      <div className="relative">
                        <User size={16} className="absolute left-3.5 top-3.5 text-slate-400" />
                        <input
                          type="text"
                          required
                          value={clientName}
                          onChange={e => setClientName(e.target.value)}
                          placeholder="Ex: João Santos"
                          className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:bg-white focus:border-amber-500 outline-none transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">
                        Telemóvel / WhatsApp *
                      </label>
                      <div className="relative">
                        <Phone size={16} className="absolute left-3.5 top-3.5 text-slate-400" />
                        <input
                          type="tel"
                          required
                          value={clientPhone}
                          onChange={e => setClientPhone(e.target.value)}
                          placeholder="Ex: 912 345 678"
                          className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:bg-white focus:border-amber-500 outline-none transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">
                      Email (Opcional — para receber orçamentos em PDF)
                    </label>
                    <div className="relative">
                      <Mail size={16} className="absolute left-3.5 top-3.5 text-slate-400" />
                      <input
                        type="email"
                        value={clientEmail}
                        onChange={e => setClientEmail(e.target.value)}
                        placeholder="Ex: seuemail@exemplo.com"
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:bg-white focus:border-amber-500 outline-none transition-all"
                      />
                    </div>
                  </div>

                  {/* Location & Postal Code */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">
                        Cidade / Concelho da Obra *
                      </label>
                      <div className="relative">
                        <MapPin size={16} className="absolute left-3.5 top-3.5 text-slate-400" />
                        <input
                          type="text"
                          required
                          value={location}
                          onChange={e => setLocation(e.target.value)}
                          placeholder="Ex: Lisboa, Porto, Sintra, Braga..."
                          className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:bg-white focus:border-amber-500 outline-none transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">
                        Código Postal
                      </label>
                      <input
                        type="text"
                        value={postalCode}
                        onChange={e => setPostalCode(e.target.value)}
                        placeholder="Ex: 1000-001"
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:bg-white focus:border-amber-500 outline-none transition-all"
                      />
                    </div>
                  </div>

                  {/* Property Type */}
                  <div>
                    <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">
                      Tipo de Imóvel
                    </label>
                    <select
                      value={propertyType}
                      onChange={e => setPropertyType(e.target.value as any)}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 outline-none focus:border-amber-500"
                    >
                      <option value="apartment">Apartamento</option>
                      <option value="house">Moradia</option>
                      <option value="commercial">Comércio / Escritório</option>
                      <option value="land">Terreno</option>
                      <option value="other">Outro</option>
                    </select>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
                    {onOpenPortal ? (
                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          onOpenPortal();
                        }}
                        className="text-xs font-bold text-slate-500 hover:text-orange-600 transition-colors flex items-center gap-1 cursor-pointer order-2 sm:order-1"
                      >
                        <ShieldCheck size={14} className="text-amber-500" /> Já tem código? Aceder ao Portal do Cliente
                      </button>
                    ) : (
                      <div className="order-2 sm:order-1" />
                    )}

                    <button
                      type="button"
                      onClick={handleAdvanceStep1}
                      className="w-full sm:w-auto px-7 py-3.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-2xl font-black text-xs uppercase tracking-wider transition-all shadow-md active:scale-95 flex items-center justify-center gap-2 cursor-pointer order-1 sm:order-2"
                    >
                      Avançar para Detalhes do Serviço <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 2: Service Details */}
              {step === 2 && (
                <div className="space-y-5 animate-in fade-in duration-300">
                  
                  {/* Category Selection */}
                  <div>
                    <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-2.5">
                      1. Selecione o Tipo de Serviço Desejado *
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                      {CATEGORIES.map(cat => {
                        const Icon = cat.icon;
                        const isSelected = category === cat.id;
                        return (
                          <button
                            type="button"
                            key={cat.id}
                            onClick={() => setCategory(cat.id)}
                            className={`p-3 rounded-2xl border text-left transition-all flex flex-col justify-between cursor-pointer ${
                              isSelected
                                ? 'border-orange-500 bg-orange-50/80 text-orange-950 ring-2 ring-orange-500/20 shadow-sm'
                                : 'border-slate-200 hover:border-slate-300 bg-slate-50/60 text-slate-700'
                            }`}
                          >
                            <div className={`p-2 rounded-xl w-fit mb-2 ${isSelected ? 'bg-orange-500 text-white' : 'bg-white text-slate-700 shadow-sm'}`}>
                              <Icon size={18} />
                            </div>
                            <div>
                              <div className="font-bold text-xs leading-snug">{cat.label}</div>
                              <div className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">{cat.description}</div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Title */}
                  <div>
                    <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">
                      2. Resumo do Pedido *
                    </label>
                    <input
                      type="text"
                      required
                      value={title}
                      onChange={e => setTitle(e.target.value)}
                      placeholder="Ex: Troca de 2 janelas em alumínio e pintura da sala"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none transition-all"
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">
                      3. Descrição Detalhada da Obra / Reparação
                    </label>
                    <textarea
                      rows={3}
                      value={description}
                      onChange={e => setDescription(e.target.value)}
                      placeholder="Explique o que precisa (medidas aproximadas, estado atual, se inclui materiais ou só mão de obra)..."
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none transition-all resize-none"
                    />
                  </div>

                  {/* Urgency */}
                  <div>
                    <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">
                      4. Urgência do Serviço
                    </label>
                    <select
                      value={urgency}
                      onChange={e => setUrgency(e.target.value as any)}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 outline-none focus:border-amber-500"
                    >
                      <option value="few_weeks">Nas próximas semanas</option>
                      <option value="immediate">Urgente / O mais rápido possível</option>
                      <option value="flexible">Apenas a consultar preços / Sem pressa</option>
                    </select>
                  </div>

                  {/* Photo Upload (Optional) */}
                  <div>
                    <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">
                      5. Fotografias do Local (Opcional - Ajuda a orçamentar melhor)
                    </label>
                    <div className="flex flex-wrap items-center gap-3">
                      {photos.map((p, idx) => (
                        <div key={idx} className="relative w-20 h-20 rounded-xl overflow-hidden border border-slate-200 group">
                          <img src={p} alt="Foto" className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => removePhoto(idx)}
                            className="absolute top-1 right-1 bg-rose-600 text-white p-1 rounded-full shadow-md hover:bg-rose-700"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ))}
                      {photos.length < 4 && (
                        <label className="w-20 h-20 rounded-xl border-2 border-dashed border-slate-300 hover:border-amber-500 bg-slate-50 flex flex-col items-center justify-center cursor-pointer text-slate-500 hover:text-amber-600 transition-colors">
                          <Camera size={20} />
                          <span className="text-[9px] font-bold mt-1">+ Foto</span>
                          <input type="file" accept="image/*" multiple onChange={handlePhotoUpload} className="hidden" />
                        </label>
                      )}
                    </div>
                  </div>

                  {/* Navigation Buttons */}
                  <div className="pt-3 flex items-center justify-between gap-3">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="px-5 py-3 text-slate-600 hover:text-slate-900 font-bold text-xs uppercase tracking-wider transition-colors flex items-center gap-2 cursor-pointer"
                    >
                      <ArrowLeft size={16} /> Voltar aos Contactos
                    </button>

                    <button
                      type="submit"
                      disabled={submitting || !title.trim()}
                      className="px-8 py-3.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 disabled:opacity-50 text-white rounded-2xl font-black text-xs uppercase tracking-wider transition-all shadow-lg shadow-orange-500/25 active:scale-95 flex items-center gap-2 cursor-pointer"
                    >
                      {submitting ? (
                        'A registar pedido...'
                      ) : (
                        <>
                          <Send size={16} /> Submeter Pedido & Obter Código 🚀
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClientRequestModal;
