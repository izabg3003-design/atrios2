import React, { useState, useEffect } from 'react';
import { 
  X, Wrench, Paintbrush, Zap, Home, Hammer, Sparkles, Send, 
  MapPin, Phone, Mail, User, AlertCircle, CheckCircle2, ShieldCheck, 
  HelpCircle, Camera, Upload, Layers, Calendar, ChevronRight
} from 'lucide-react';
import { ClientServiceRequest, ServiceCategory } from '../types';
import { Locale } from '../translations';
import { clientPortalTranslations } from './clientPortalTranslations';
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

const CATEGORY_ICONS: Record<string, React.FC<{ size?: number; className?: string }>> = {
  doors_windows: Home,
  painting: Paintbrush,
  electrical: Zap,
  plumbing: Wrench,
  plasterboard: Layers,
  renovation: Sparkles,
  construction: Hammer,
  roofing: Home,
  flooring: Layers,
  other: HelpCircle
};

const CATEGORY_KEYS: ServiceCategory[] = [
  'doors_windows',
  'painting',
  'electrical',
  'plumbing',
  'plasterboard',
  'renovation',
  'construction',
  'roofing',
  'flooring',
  'other'
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
  const activeLocale = (locale && clientPortalTranslations[locale as Locale]) 
    ? (locale as Locale) 
    : 'pt-PT';
  const tPortal = clientPortalTranslations[activeLocale] || clientPortalTranslations['pt-PT'];
  const formT = tPortal.requestModalForm;

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

  useEffect(() => {
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

  const categories = CATEGORY_KEYS.map(key => ({
    id: key,
    label: formT.categories?.[key]?.label || key,
    description: formT.categories?.[key]?.description || '',
    icon: CATEGORY_ICONS[key] || HelpCircle
  }));

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
        alert(formT.photoSizeAlert);
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
      alert(formT.fillRequiredAlert);
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
        alert(formT.errorSubmit);
      }
    } catch (err) {
      console.error(err);
      alert(formT.errorSubmit);
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
              <Sparkles size={12} /> {formT.freeBadge}
            </div>
            <h2 className="text-lg sm:text-2xl font-black tracking-tight leading-tight">
              {formT.formTitle}
            </h2>
            <p className="text-white/85 text-[11px] sm:text-sm font-medium mt-0.5 line-clamp-2">
              {formT.formSubtitle}
            </p>
          </div>

          <button
            onClick={onClose}
            aria-label={tPortal.close}
            className="p-1.5 sm:p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-full transition-colors relative z-10 shrink-0 cursor-pointer"
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
                <h3 className="text-xl sm:text-2xl font-black text-slate-900">{formT.successTitle}</h3>
                <p className="text-slate-600 text-xs sm:text-sm max-w-md mx-auto leading-relaxed">
                  {formT.successDesc(createdRequestId)}
                </p>
              </div>

              {createdAccessCode && (
                <div className="bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-slate-50 border-2 border-amber-500/30 rounded-3xl p-4 sm:p-5 max-w-md mx-auto space-y-2 text-center shadow-sm">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500 text-slate-950 text-[10px] font-black uppercase tracking-wider shadow-sm">
                    <ShieldCheck size={13} /> {formT.exclusiveCodeBadge}
                  </div>
                  <div className="text-3xl sm:text-4xl font-mono font-black text-amber-600 tracking-widest py-1">
                    {createdAccessCode}
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {formT.exclusiveCodeHint(clientPhone)}
                  </p>
                </div>
              )}

              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs text-slate-700 text-left max-w-md mx-auto space-y-1.5">
                <div className="flex items-center gap-2 font-bold text-slate-900">
                  <Sparkles size={16} className="text-amber-600" /> {formT.nextStepsTitle}
                </div>
                <ul className="list-disc list-inside space-y-1 text-slate-600">
                  <li>{formT.nextStep1(location || tPortal.notSpecified)}</li>
                  <li>{formT.nextStep2}</li>
                  <li>{formT.nextStep3}</li>
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
                    <Sparkles size={16} /> {formT.trackProposalsBtn}
                  </button>
                )}
                <button
                  onClick={handleReset}
                  className="px-5 py-3.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-black text-xs sm:text-sm uppercase tracking-wider transition-all shadow-md active:scale-95 cursor-pointer"
                >
                  {formT.finishBtn}
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
                  <span className="text-xs sm:text-sm font-bold text-slate-800 truncate">{formT.step1Title}</span>
                </div>
                <div className="w-8 sm:w-12 h-[2px] bg-slate-200 shrink-0" />
                <div className="flex items-center gap-2 min-w-0">
                  <span className={`w-6 h-6 sm:w-7 sm:h-7 shrink-0 rounded-full flex items-center justify-center text-xs font-black ${step === 2 ? 'bg-amber-500 text-slate-950' : 'bg-slate-200 text-slate-500'}`}>
                    2
                  </span>
                  <span className="text-xs sm:text-sm font-bold text-slate-800 truncate">{formT.step2Title}</span>
                </div>
              </div>

              {step === 1 && (
                <div className="space-y-4 sm:space-y-5 animate-in fade-in duration-300">
                  
                  {/* Category Selection */}
                  <div>
                    <label className="block text-xs font-black uppercase tracking-wider text-slate-600 mb-2">
                      {formT.selectServiceLabel}
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-2.5">
                      {categories.map(cat => {
                        const Icon = cat.icon;
                        const isSelected = category === cat.id;
                        return (
                          <button
                            type="button"
                            key={cat.id}
                            onClick={() => setCategory(cat.id)}
                            className={`p-2.5 sm:p-3 rounded-2xl border text-left transition-all flex flex-col justify-between cursor-pointer ${
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
                      {formT.orderSummaryLabel}
                    </label>
                    <input
                      type="text"
                      required
                      value={title}
                      onChange={e => setTitle(e.target.value)}
                      placeholder={formT.orderSummaryPlaceholder}
                      className="w-full px-3.5 sm:px-4 py-2.5 sm:py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-900 focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none transition-all"
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">
                      {formT.descriptionLabel}
                    </label>
                    <textarea
                      rows={3}
                      value={description}
                      onChange={e => setDescription(e.target.value)}
                      placeholder={formT.descriptionPlaceholder}
                      className="w-full px-3.5 sm:px-4 py-2.5 sm:py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-900 focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none transition-all resize-none"
                    />
                  </div>

                  {/* Photo Upload (Optional) */}
                  <div>
                    <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">
                      {formT.photosLabel}
                    </label>
                    <div className="flex flex-wrap items-center gap-2.5">
                      {photos.map((p, idx) => (
                        <div key={idx} className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden border border-slate-200 group">
                          <img src={p} alt={`Foto ${idx + 1}`} className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => removePhoto(idx)}
                            className="absolute top-1 right-1 bg-rose-600 text-white p-1 rounded-full shadow-md hover:bg-rose-700 cursor-pointer"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ))}
                      {photos.length < 4 && (
                        <label className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl border-2 border-dashed border-slate-300 hover:border-amber-500 bg-slate-50 flex flex-col items-center justify-center cursor-pointer text-slate-500 hover:text-amber-600 transition-colors">
                          <Camera size={18} />
                          <span className="text-[9px] font-bold mt-0.5">{formT.addPhoto}</span>
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
                      className="w-full sm:w-auto px-6 py-3 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 rounded-xl font-black text-xs uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                    >
                      {formT.nextStep} <ChevronRight size={16} />
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
                        {formT.propertyTypeLabel}
                      </label>
                      <select
                        value={propertyType}
                        onChange={e => setPropertyType(e.target.value as any)}
                        className="w-full px-3.5 sm:px-4 py-2.5 sm:py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-bold text-slate-900 outline-none focus:border-amber-500 cursor-pointer"
                      >
                        <option value="apartment">{formT.propApartment}</option>
                        <option value="house">{formT.propHouse}</option>
                        <option value="commercial">{formT.propCommercial}</option>
                        <option value="land">{formT.propLand}</option>
                        <option value="other">{formT.propOther}</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">
                        {formT.urgencyLabel}
                      </label>
                      <select
                        value={urgency}
                        onChange={e => setUrgency(e.target.value as any)}
                        className="w-full px-3.5 sm:px-4 py-2.5 sm:py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-bold text-slate-900 outline-none focus:border-amber-500 cursor-pointer"
                      >
                        <option value="few_weeks">{formT.urgFewWeeks}</option>
                        <option value="immediate">{formT.urgImmediate}</option>
                        <option value="flexible">{formT.urgFlexible}</option>
                      </select>
                    </div>
                  </div>

                  {/* Location */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">
                        {formT.cityLabel}
                      </label>
                      <div className="relative">
                        <MapPin size={16} className="absolute left-3.5 top-3.5 text-slate-400" />
                        <input
                          type="text"
                          required
                          value={location}
                          onChange={e => setLocation(e.target.value)}
                          placeholder={formT.cityPlaceholder}
                          className="w-full pl-10 pr-4 py-2.5 sm:py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-900 focus:bg-white focus:border-amber-500 outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">
                        {formT.postalCodeLabel}
                      </label>
                      <input
                        type="text"
                        value={postalCode}
                        onChange={e => setPostalCode(e.target.value)}
                        placeholder={formT.postalCodePlaceholder}
                        className="w-full px-3.5 sm:px-4 py-2.5 sm:py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-900 focus:bg-white focus:border-amber-500 outline-none"
                      />
                    </div>
                  </div>

                  {/* Contact details */}
                  <div className="border-t border-slate-100 pt-4 space-y-3 sm:space-y-4">
                    <h4 className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                      <User size={14} className="text-amber-600" /> {formT.contactSectionTitle}
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          {formT.yourNameLabel}
                        </label>
                        <input
                          type="text"
                          required
                          value={clientName}
                          onChange={e => setClientName(e.target.value)}
                          placeholder={formT.yourNamePlaceholder}
                          className="w-full px-3.5 sm:px-4 py-2.5 sm:py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-900 focus:bg-white focus:border-amber-500 outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          {formT.yourPhoneLabel}
                        </label>
                        <div className="relative">
                          <Phone size={16} className="absolute left-3.5 top-3.5 text-slate-400" />
                          <input
                            type="tel"
                            required
                            value={clientPhone}
                            onChange={e => setClientPhone(e.target.value)}
                            placeholder={formT.yourPhonePlaceholder}
                            className="w-full pl-10 pr-4 py-2.5 sm:py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-900 focus:bg-white focus:border-amber-500 outline-none"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        {formT.yourEmailLabel}
                      </label>
                      <div className="relative">
                        <Mail size={16} className="absolute left-3.5 top-3.5 text-slate-400" />
                        <input
                          type="email"
                          value={clientEmail}
                          onChange={e => setClientEmail(e.target.value)}
                          placeholder={formT.yourEmailPlaceholder}
                          className="w-full pl-10 pr-4 py-2.5 sm:py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-900 focus:bg-white focus:border-amber-500 outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="px-4 py-2.5 text-slate-600 hover:text-slate-900 font-bold text-xs uppercase tracking-wider transition-colors text-center cursor-pointer"
                    >
                      {formT.backBtn}
                    </button>

                    <button
                      type="submit"
                      disabled={submitting || !clientName.trim() || !clientPhone.trim() || !location.trim()}
                      className="px-6 sm:px-8 py-3.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 rounded-xl font-black text-xs uppercase tracking-wider transition-all shadow-lg shadow-amber-500/25 active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                    >
                      {submitting ? (
                        formT.submittingBtn
                      ) : (
                        <>
                          <Send size={16} /> {formT.submitBtn}
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
