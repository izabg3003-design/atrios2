import React, { useState } from 'react';
import { 
  X, Wrench, Paintbrush, Zap, Home, Hammer, Sparkles, Send, 
  MapPin, Phone, Mail, User, AlertCircle, CheckCircle2, ShieldCheck, 
  HelpCircle, Camera, Upload, Layers, Calendar, ChevronRight
} from 'lucide-react';
import { ClientServiceRequest, ServiceCategory } from '../types';
import { saveClientServiceRequest } from '../services/storage';

interface ClientRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  locale?: string;
  onSuccess?: (request: ClientServiceRequest) => void;
  onOpenPortal?: () => void;
  initialClientPhone?: string;
  initialClientName?: string;
  initialClientEmail?: string;
  initialAccessCode?: string;
  isFromPortal?: boolean;
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
  onOpenPortal,
  initialClientPhone,
  initialClientName,
  initialClientEmail,
  initialAccessCode,
  isFromPortal
}) => {
  const [step, setStep] = useState<1 | 2>(1);
  const [category, setCategory] = useState<ServiceCategory>('doors_windows');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [propertyType, setPropertyType] = useState<'apartment' | 'house' | 'commercial' | 'land' | 'other'>('apartment');
  const [urgency, setUrgency] = useState<'immediate' | 'few_weeks' | 'flexible'>('few_weeks');
  const [budgetRange, setBudgetRange] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  
  // Contact Info
  const [clientName, setClientName] = useState(initialClientName || '');
  const [clientPhone, setClientPhone] = useState(initialClientPhone || '');
  const [clientEmail, setClientEmail] = useState(initialClientEmail || '');

  React.useEffect(() => {
    if (isOpen) {
      if (initialClientPhone && !clientPhone) setClientPhone(initialClientPhone);
      if (initialClientName && !clientName) setClientName(initialClientName);
      if (initialClientEmail && !clientEmail) setClientEmail(initialClientEmail);
    }
  }, [isOpen, initialClientPhone, initialClientName, initialClientEmail]);
  
  const [submitting, setSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [createdRequestId, setCreatedRequestId] = useState('');
  const [createdAccessCode, setCreatedAccessCode] = useState('');

  if (!isOpen) return null;

  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (readerEvent) => {
        const img = new Image();
        img.onload = () => {
          const maxDim = 800;
          let width = img.width;
          let height = img.height;

          if (width > height && width > maxDim) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else if (height > maxDim) {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.7);
            resolve(compressedDataUrl);
          } else {
            resolve(readerEvent.target?.result as string);
          }
        };
        img.onerror = () => resolve(readerEvent.target?.result as string);
        img.src = readerEvent.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const fileList: File[] = Array.from(files);
    for (const file of fileList) {
      if (file.size > 10 * 1024 * 1024) {
        alert('A fotografia não deve exceder 10MB.');
        continue;
      }
      try {
        const compressedBase64 = await compressImage(file);
        setPhotos(prev => [...prev, compressedBase64].slice(0, 5));
      } catch (err) {
        console.warn('Erro ao processar imagem:', err);
      }
    }
  };

  const removePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !clientName.trim() || !clientPhone.trim() || !location.trim()) {
      alert('Por favor preencha todos os campos obrigatórios (Nome, Telefone, Localidade e Título do Pedido).');
      return;
    }

    setSubmitting(true);
    try {
      const result = await saveClientServiceRequest({
        clientName: clientName.trim(),
        clientEmail: clientEmail.trim(),
        clientPhone: clientPhone.trim(),
        accessCode: initialAccessCode || undefined,
        category,
        title: title.trim(),
        description: description.trim(),
        location: location.trim(),
        postalCode: postalCode.trim() || undefined,
        propertyType,
        urgency,
        budgetRange: budgetRange.trim() || undefined,
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
    if (!initialClientName) setClientName('');
    if (!initialClientPhone) setClientPhone('');
    if (!initialClientEmail) setClientEmail('');
    setPhotos([]);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-2.5 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto">
      <div className="bg-white text-slate-900 w-full max-w-2xl rounded-2xl sm:rounded-[2rem] shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[92vh] flex flex-col">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 text-white px-4 sm:px-8 py-4 sm:py-6 flex items-center justify-between shrink-0 relative overflow-hidden gap-2">
          <div className="absolute -right-6 -bottom-6 opacity-15">
            <Hammer size={120} />
          </div>

          <div className="relative z-10 min-w-0 pr-2">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/20 text-white text-[10px] font-black uppercase tracking-wider mb-1">
              <Sparkles size={12} /> 100% Gratuito & Sem Compromisso
            </div>
            <h2 className="text-lg sm:text-2xl font-black tracking-tight leading-tight">
              Pedir Orçamento para Obra ou Reparação
            </h2>
            <p className="text-white/85 text-[11px] sm:text-sm font-medium mt-0.5 line-clamp-2">
              Receba propostas detalhadas de profissionais qualificados do ÁTRIOS BUILD
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 sm:p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-full transition-colors relative z-10 shrink-0"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-4 sm:p-8 overflow-y-auto flex-1 space-y-5 sm:space-y-6">
          {isSuccess ? (
            <div className="text-center py-6 sm:py-8 space-y-4 sm:space-y-5 animate-in zoom-in-95 duration-300">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 size={40} />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-xl sm:text-2xl font-black text-slate-900">Pedido Submetido com Sucesso!</h3>
                <p className="text-slate-600 text-xs sm:text-sm max-w-md mx-auto leading-relaxed">
                  O seu pedido <span className="font-mono font-bold text-amber-600">#{createdRequestId}</span> foi recebido e disponibilizado aos nossos profissionais.
                </p>
              </div>

              {createdAccessCode && (
                <div className="bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-slate-50 border-2 border-amber-500/30 rounded-3xl p-4 sm:p-5 max-w-md mx-auto space-y-2 text-center shadow-sm">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500 text-slate-950 text-[10px] font-black uppercase tracking-wider shadow-sm">
                    <ShieldCheck size={13} /> O Seu Código de Acesso Exclusivo
                  </div>
                  <div className="text-3xl sm:text-4xl font-mono font-black text-amber-600 tracking-widest py-1">
                    {createdAccessCode}
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Guarde este código! Ele permite aceder à <strong className="text-slate-900">Área do Cliente</strong> com o número <strong className="font-mono text-slate-900">{clientPhone}</strong> para consultar as propostas e orçamentos detalhados.
                  </p>
                </div>
              )}

              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs text-slate-700 text-left max-w-md mx-auto space-y-1.5">
                <div className="flex items-center gap-2 font-bold text-slate-900">
                  <Sparkles size={16} className="text-amber-600" /> Próximos passos
                </div>
                <ul className="list-disc list-inside space-y-1 text-slate-600">
                  <li>Profissionais na zona de <strong>{location}</strong> verificarão os detalhes.</li>
                  <li>Receberá orçamentos detalhados e oficiais em PDF.</li>
                  <li>Pode entrar na Área do Cliente a qualquer momento com o seu telemóvel e este código.</li>
                </ul>
              </div>

              <div className="pt-2 sm:pt-4 flex flex-col sm:flex-row gap-2 justify-center">
                {onOpenPortal && (
                  <button
                    onClick={() => {
                      handleReset();
                      onOpenPortal();
                    }}
                    className="px-5 py-3.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl font-black text-xs sm:text-sm uppercase tracking-wider transition-all shadow-md active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Sparkles size={16} /> Acompanhar Orçamentos Recebidos
                  </button>
                )}
                <button
                  onClick={handleReset}
                  className="px-5 py-3.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-black text-xs sm:text-sm uppercase tracking-wider transition-all shadow-md active:scale-95 cursor-pointer"
                >
                  Concluir
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
              
              {/* Step indicator */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 sm:pb-4 gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <span className={`w-6 h-6 sm:w-7 sm:h-7 shrink-0 rounded-full flex items-center justify-center text-xs font-black ${step === 1 ? 'bg-amber-500 text-slate-950' : 'bg-emerald-500 text-white'}`}>
                    1
                  </span>
                  <span className="text-xs sm:text-sm font-bold text-slate-800 truncate">O que precisa?</span>
                </div>
                <div className="w-8 sm:w-12 h-[2px] bg-slate-200 shrink-0" />
                <div className="flex items-center gap-2 min-w-0">
                  <span className={`w-6 h-6 sm:w-7 sm:h-7 shrink-0 rounded-full flex items-center justify-center text-xs font-black ${step === 2 ? 'bg-amber-500 text-slate-950' : 'bg-slate-200 text-slate-500'}`}>
                    2
                  </span>
                  <span className="text-xs sm:text-sm font-bold text-slate-800 truncate">Local & Contacto</span>
                </div>
              </div>

              {step === 1 && (
                <div className="space-y-4 sm:space-y-5 animate-in fade-in duration-300">
                  
                  {/* Category Selection */}
                  <div>
                    <label className="block text-xs font-black uppercase tracking-wider text-slate-600 mb-2">
                      1. Selecione o Tipo de Serviço *
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-2.5">
                      {CATEGORIES.map(cat => {
                        const Icon = cat.icon;
                        const isSelected = category === cat.id;
                        return (
                          <button
                            type="button"
                            key={cat.id}
                            onClick={() => setCategory(cat.id)}
                            className={`p-2.5 sm:p-3 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                              isSelected
                                ? 'border-amber-500 bg-amber-50 text-amber-950 ring-2 ring-amber-500/20 shadow-sm'
                                : 'border-slate-200 hover:border-slate-300 bg-slate-50/60 text-slate-700'
                            }`}
                          >
                            <div className={`p-1.5 sm:p-2 rounded-xl w-fit mb-1.5 sm:mb-2 ${isSelected ? 'bg-amber-500 text-white' : 'bg-white text-slate-700 shadow-sm'}`}>
                              <Icon size={16} />
                            </div>
                            <div>
                              <div className="font-bold text-xs leading-snug">{cat.label}</div>
                              <div className="text-[9px] sm:text-[10px] text-slate-500 line-clamp-1 mt-0.5">{cat.description}</div>
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
                      placeholder="Ex: Troca de 1 porta de entrada e reparação de tomada na cozinha"
                      className="w-full px-3.5 sm:px-4 py-2.5 sm:py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-900 focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none transition-all"
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
                      placeholder="Explique com mais detalhe o que precisa (medidas aproximadas, estado atual, se já comprou o material ou precisa com fornecimento incluído)..."
                      className="w-full px-3.5 sm:px-4 py-2.5 sm:py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-900 focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none transition-all resize-none"
                    />
                  </div>

                  {/* Photo Upload (Optional) */}
                  <div>
                    <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">
                      4. Fotografias do Local (Opcional - Ajuda a orçamentar melhor)
                    </label>
                    <div className="flex flex-wrap items-center gap-2.5">
                      {photos.map((p, idx) => (
                        <div key={idx} className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden border border-slate-200 group">
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
                        <label className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl border-2 border-dashed border-slate-300 hover:border-amber-500 bg-slate-50 flex flex-col items-center justify-center cursor-pointer text-slate-500 hover:text-amber-600 transition-colors">
                          <Camera size={18} />
                          <span className="text-[9px] font-bold mt-0.5">+ Foto</span>
                          <input type="file" accept="image/*" multiple onChange={handlePhotoUpload} className="hidden" />
                        </label>
                      )}
                    </div>
                  </div>

                  <div className="pt-2 flex justify-end">
                    <button
                      type="button"
                      disabled={!title.trim()}
                      onClick={() => setStep(2)}
                      className="w-full sm:w-auto px-6 py-3 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 rounded-xl font-black text-xs uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2"
                    >
                      Avançar para Contacto <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-4 sm:space-y-5 animate-in fade-in duration-300">
                  
                  {/* Property & Urgency */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div>
                      <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">
                        Tipo de Imóvel
                      </label>
                      <select
                        value={propertyType}
                        onChange={e => setPropertyType(e.target.value as any)}
                        className="w-full px-3.5 sm:px-4 py-2.5 sm:py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-bold text-slate-900 outline-none focus:border-amber-500"
                      >
                        <option value="apartment">Apartamento</option>
                        <option value="house">Moradia</option>
                        <option value="commercial">Comércio / Escritório</option>
                        <option value="land">Terreno</option>
                        <option value="other">Outro</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">
                        Urgência do Serviço
                      </label>
                      <select
                        value={urgency}
                        onChange={e => setUrgency(e.target.value as any)}
                        className="w-full px-3.5 sm:px-4 py-2.5 sm:py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-bold text-slate-900 outline-none focus:border-amber-500"
                      >
                        <option value="few_weeks">Nas próximas semanas</option>
                        <option value="immediate">Urgente / O mais rápido possível</option>
                        <option value="flexible">Apenas a consultar preços / Sem pressa</option>
                      </select>
                    </div>
                  </div>

                  {/* Location */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
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
                          className="w-full pl-10 pr-4 py-2.5 sm:py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-900 focus:bg-white focus:border-amber-500 outline-none"
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
                        className="w-full px-3.5 sm:px-4 py-2.5 sm:py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-900 focus:bg-white focus:border-amber-500 outline-none"
                      >
                      </input>
                    </div>
                  </div>

                  {/* Contact details */}
                  <div className="border-t border-slate-100 pt-4 space-y-3 sm:space-y-4">
                    <h4 className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                      <User size={14} className="text-amber-600" /> Os seus dados de contacto para envio de orçamentos
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          O seu Nome *
                        </label>
                        <input
                          type="text"
                          required
                          value={clientName}
                          onChange={e => setClientName(e.target.value)}
                          placeholder="Nome e Sobrenome"
                          className="w-full px-3.5 sm:px-4 py-2.5 sm:py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-900 focus:bg-white focus:border-amber-500 outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Telemóvel / WhatsApp *
                        </label>
                        <div className="relative">
                          <Phone size={16} className="absolute left-3.5 top-3.5 text-slate-400" />
                          <input
                            type="tel"
                            required
                            value={clientPhone}
                            onChange={e => setClientPhone(e.target.value)}
                            placeholder="Ex: +351 912 345 678"
                            className="w-full pl-10 pr-4 py-2.5 sm:py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-900 focus:bg-white focus:border-amber-500 outline-none"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Email (Opcional - para receber cópia em PDF)
                      </label>
                      <div className="relative">
                        <Mail size={16} className="absolute left-3.5 top-3.5 text-slate-400" />
                        <input
                          type="email"
                          value={clientEmail}
                          onChange={e => setClientEmail(e.target.value)}
                          placeholder="seuemail@exemplo.com"
                          className="w-full pl-10 pr-4 py-2.5 sm:py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-900 focus:bg-white focus:border-amber-500 outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="px-4 py-2.5 text-slate-600 hover:text-slate-900 font-bold text-xs uppercase tracking-wider transition-colors text-center"
                    >
                      Voltar
                    </button>

                    <button
                      type="submit"
                      disabled={submitting || !clientName.trim() || !clientPhone.trim() || !location.trim()}
                      className="px-6 sm:px-8 py-3.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 rounded-xl font-black text-xs uppercase tracking-wider transition-all shadow-lg shadow-amber-500/25 active:scale-95 flex items-center justify-center gap-2"
                    >
                      {submitting ? (
                        'A enviar pedido...'
                      ) : (
                        <>
                          <Send size={16} /> Submeter Pedido de Orçamento
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
