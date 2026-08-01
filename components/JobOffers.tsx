import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Briefcase, 
  MapPin, 
  HardHat, 
  Euro, 
  Calendar, 
  Clock, 
  FileText, 
  Phone, 
  Plus, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Search, 
  Edit, 
  Trash2, 
  X, 
  Send,
  Building2,
  HelpCircle
} from 'lucide-react';
import { Company, JobOffer, JobOfferStatus } from '../types';
import { getStoredJobOffers, saveJobOffer, deleteJobOffer, generateShortId, fetchResilient, mapJobOfferFromSupabase, safeSetItem } from '../services/storage';
import { supabase, syncToCloud } from '../services/supabase';
import { Locale, jobOffersTranslations } from '../translations';

interface JobOffersProps {
  company: Company;
  locale?: Locale;
}

export const JobOffers: React.FC<JobOffersProps> = ({ company, locale = 'pt-PT' }) => {
  const t = jobOffersTranslations[locale] || jobOffersTranslations['pt-PT'];
  const [jobOffers, setJobOffers] = useState<JobOffer[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingOffer, setEditingOffer] = useState<JobOffer | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | JobOfferStatus>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [location, setLocation] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [salary, setSalary] = useState('');
  const [startDate, setStartDate] = useState('');
  const [duration, setDuration] = useState('');
  const [description, setDescription] = useState('');
  const [contact, setContact] = useState('');

  const loadOffers = async () => {
    // 1. Carregar do armazenamento local
    const localData = getStoredJobOffers(company.id);
    setJobOffers(localData);

    // 2. Buscar remoto resiliente do Supabase
    try {
      const { data: remoteData } = await fetchResilient('job_offers', company.id);
      if (remoteData && Array.isArray(remoteData)) {
        const mappedRemote = remoteData.map(mapJobOfferFromSupabase);
        const allLocal = getStoredJobOffers();
        const otherCompaniesJobs = allLocal.filter(j => String(j.companyId) !== String(company.id));
        
        // As vagas remota vindas do Supabase são a fonte de verdade para a empresa
        const unsyncedLocal = localData.filter(lj => (lj as any).synced === false && !mappedRemote.some(rj => String(rj.id) === String(lj.id)));
        const finalCompanyJobs = [...mappedRemote, ...unsyncedLocal];
        
        safeSetItem('atrios_job_offers', JSON.stringify([...otherCompaniesJobs, ...finalCompanyJobs]));
        setJobOffers(finalCompanyJobs);
      }
    } catch (e) {
      console.warn("[JobOffers] Erro ao carregar vagas remota:", e);
    }
  };

  useEffect(() => {
    loadOffers();

    // Inscrição Supabase Realtime para atualização instantânea (aprovação/feedback do Master)
    const channel = supabase
      .channel(`company-job-offers-${company.id}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'job_offers' },
        () => {
          loadOffers();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [company.id]);

  const resetForm = () => {
    setLocation('');
    setSpecialty('');
    setSalary('');
    setStartDate('');
    setDuration('');
    setDescription('');
    setContact(company.phone || company.email || '');
    setEditingOffer(null);
  };

  const handleOpenModal = (offerToEdit?: JobOffer) => {
    if (offerToEdit) {
      setEditingOffer(offerToEdit);
      setLocation(offerToEdit.location);
      setSpecialty(offerToEdit.specialty);
      setSalary(offerToEdit.salary);
      setStartDate(offerToEdit.startDate);
      setDuration(offerToEdit.duration);
      setDescription(offerToEdit.description);
      setContact(offerToEdit.contact);
    } else {
      resetForm();
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    resetForm();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!location.trim() || !specialty.trim() || !salary.trim() || !startDate.trim() || !duration.trim() || !description.trim() || !contact.trim()) {
      alert(t.fillRequiredFieldsAlert);
      return;
    }

    setIsSubmitting(true);

    const now = new Date().toISOString();
    const offer: JobOffer = {
      id: editingOffer ? editingOffer.id : generateShortId(),
      companyId: company.id,
      companyName: company.name || 'Empresa',
      location: location.trim(),
      specialty: specialty.trim(),
      salary: salary.trim(),
      startDate: startDate.trim(),
      duration: duration.trim(),
      description: description.trim(),
      contact: contact.trim(),
      status: 'pending', // Re-submetida ou nova vaga sempre entra em pendente de aprovação
      createdAt: editingOffer ? editingOffer.createdAt : now,
      updatedAt: now
    };

    const isEditing = !!editingOffer;
    const isAdjustment = editingOffer && editingOffer.status === 'adjustment_requested';

    const result = await saveJobOffer(offer);
    setIsSubmitting(false);

    loadOffers();
    handleCloseModal();

    // Notificar Master via Push API imediatamente (funciona mesmo com o app fechado)
    try {
      fetch('/api/push/notify-master', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: isAdjustment ? 'job_adjustment' : 'job_offer',
          details: {
            companyName: company.name || 'Empresa',
            specialty: offer.specialty,
            location: offer.location,
            isAdjustment,
            isEditing,
            title: isAdjustment 
              ? `🛠️ Ajuste Efetuado na Vaga! (${company.name})`
              : (isEditing ? `💼 Vaga Atualizada! (${company.name})` : `💼 Nova Vaga Publicada! (${company.name})`),
            body: isAdjustment
              ? `A empresa "${company.name}" efetuou o ajuste na vaga de ${offer.specialty} em ${offer.location}. Clique para analisar.`
              : `A vaga de ${offer.specialty} em ${offer.location} foi publicada por "${company.name}" e aguarda aprovação.`
          }
        })
      }).catch(err => console.warn("Notificação push para o master falhou:", err));
    } catch (e) {
      console.warn("Erro no envio push master:", e);
    }

    if (result.success) {
      alert(editingOffer ? t.updateSuccessAlert : t.createSuccessAlert);
    } else {
      const err = result.error;
      if (err?.code === '42501' || String(err?.message || '').includes('row-level security')) {
        alert(`A vaga foi salva localmente, mas a sincronização cloud com o Supabase falhou por permissões de RLS (Row Level Security).\n\nCertifique-se de que a tabela 'job_offers' no Supabase tem permissão de INSERT/UPDATE desativando o RLS ou adicionando uma política de acesso.`);
      } else {
        alert(`Vaga salva localmente! Aviso de sincronização cloud: ${err?.message || 'Erro de rede'}`);
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm(t.deleteConfirm)) return;
    
    // Atualiza o estado local imediatamente
    setJobOffers(prev => prev.filter(offer => String(offer.id) !== String(id)));
    
    const result = await deleteJobOffer(id);
    if (result.success) {
      alert(t.deleteSuccessAlert);
    } else {
      const err = result.error;
      if (err?.code === '42501' || String(err?.message || '').includes('row-level security')) {
        alert(`A vaga foi removida localmente, mas a exclusão no Supabase falhou por permissões de RLS (Row Level Security).\n\nCertifique-se de que a tabela 'job_offers' tem permissão para DELETE no Supabase ou desative o RLS.`);
      } else {
        alert(`Vaga removida localmente! Aviso de sincronização Supabase: ${err?.message || 'Erro de conexão'}`);
      }
    }
    loadOffers();
  };

  const filteredOffers = jobOffers.filter(offer => {
    const matchesStatus = statusFilter === 'all' || offer.status === statusFilter;
    const matchesSearch = searchTerm === '' || 
      offer.specialty.toLowerCase().includes(searchTerm.toLowerCase()) ||
      offer.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      offer.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const getStatusBadge = (status: JobOfferStatus) => {
    switch (status) {
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-sm">
            <CheckCircle2 size={13} className="text-emerald-600" /> {t.badgeApproved}
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-rose-50 text-rose-700 border border-rose-200 shadow-sm">
            <XCircle size={13} className="text-rose-600" /> {t.badgeRejected}
          </span>
        );
      case 'adjustment_requested':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-amber-50 text-amber-800 border border-amber-300 shadow-sm animate-pulse">
            <AlertTriangle size={13} className="text-amber-600" /> {t.badgeAdjustmentRequested}
          </span>
        );
      case 'pending':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-slate-100 text-slate-700 border border-slate-200 shadow-sm">
            <Clock size={13} className="text-slate-500" /> {t.badgePending}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-amber-950 to-slate-900 rounded-2xl sm:rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden border border-amber-500/20">
        <div className="absolute right-0 top-0 translate-x-1/4 -translate-y-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold border border-amber-500/30">
              <Building2 size={14} /> {t.jobsHeaderTag}
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-3">
              <HardHat className="text-amber-400 shrink-0" size={32} />
              {t.jobsTitle}
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm max-w-2xl font-medium leading-relaxed">
              {t.jobsDesc}
            </p>
          </div>

          <button
            onClick={() => handleOpenModal()}
            className="inline-flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black shadow-lg shadow-amber-500/20 transition-all active:scale-95 text-sm shrink-0"
          >
            <Plus size={18} /> {t.publishJob}
          </button>
        </div>
      </div>

      {/* Control Bar: Filters & Search */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4 sm:space-y-0 sm:flex sm:items-center sm:justify-between gap-4">
        {/* Filter Badges */}
        <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-2 sm:pb-0 scrollbar-none">
          {[
            { id: 'all', label: t.filterAll },
            { id: 'pending', label: t.filterPending },
            { id: 'approved', label: t.filterApproved },
            { id: 'adjustment_requested', label: t.filterAdjustmentRequested },
            { id: 'rejected', label: t.filterRejected }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id as any)}
              className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all shrink-0 ${
                statusFilter === tab.id
                  ? 'bg-slate-900 text-white shadow-md'
                  : 'bg-slate-50 text-slate-500 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-72 shrink-0">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            placeholder={t.searchPlaceholder}
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 placeholder:text-slate-400 outline-none focus:border-slate-900 transition-all"
          />
        </div>
      </div>

      {/* Job Offers List */}
      {filteredOffers.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-100 shadow-sm space-y-4">
          <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-500 mx-auto">
            <Briefcase size={32} />
          </div>
          <div className="space-y-1 max-w-md mx-auto">
            <h3 className="text-base font-black text-slate-900">{t.noJobsFound}</h3>
            <p className="text-xs text-slate-500 font-medium">
              {statusFilter !== 'all' || searchTerm !== ''
                ? t.noJobsFilterMatch
                : t.noJobsCreatedYet}
            </p>
          </div>
          {statusFilter === 'all' && searchTerm === '' && (
            <button
              onClick={() => handleOpenModal()}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-slate-900 text-white text-xs font-black hover:bg-slate-800 transition-all"
            >
              <Plus size={16} /> {t.publishFirstJob}
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {filteredOffers.map(offer => (
            <motion.div
              key={offer.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl border border-slate-100 p-5 sm:p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4 relative group"
            >
              <div className="space-y-3">
                {/* Header card info */}
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-black tracking-widest uppercase text-amber-600 block mb-1">
                      {offer.companyName}
                    </span>
                    <h3 className="text-base sm:text-lg font-black text-slate-900 leading-snug flex items-center gap-2">
                      <HardHat size={18} className="text-slate-600 shrink-0" />
                      {offer.specialty}
                    </h3>
                  </div>
                  <div>{getStatusBadge(offer.status)}</div>
                </div>

                {/* Feedback block from support if adjustment requested or rejected */}
                {(offer.status === 'adjustment_requested' || offer.status === 'rejected') && offer.feedback && (
                  <div className={`p-3.5 rounded-xl text-xs font-medium space-y-1 border ${
                    offer.status === 'adjustment_requested' 
                      ? 'bg-amber-50 border-amber-200 text-amber-900' 
                      : 'bg-rose-50 border-rose-200 text-rose-900'
                  }`}>
                    <div className="font-black flex items-center gap-1.5 uppercase text-[10px] tracking-wider">
                      <AlertTriangle size={12} /> 
                      {offer.status === 'adjustment_requested' ? t.adjustmentNeededTitle : t.rejectionReasonTitle}
                    </div>
                    <p className="text-xs leading-relaxed font-semibold">{offer.feedback}</p>
                  </div>
                )}

                {/* Field Details Grid */}
                <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-100">
                  <div className="flex items-center gap-2 text-slate-600 font-semibold bg-slate-50 p-2 rounded-lg">
                    <MapPin size={14} className="text-slate-400 shrink-0" />
                    <span className="truncate">{offer.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600 font-semibold bg-slate-50 p-2 rounded-lg">
                    <Euro size={14} className="text-emerald-600 shrink-0" />
                    <span className="truncate font-bold text-slate-900">{offer.salary}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600 font-semibold bg-slate-50 p-2 rounded-lg">
                    <Calendar size={14} className="text-slate-400 shrink-0" />
                    <span className="truncate">{t.startDateLabel} {offer.startDate}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600 font-semibold bg-slate-50 p-2 rounded-lg">
                    <Clock size={14} className="text-slate-400 shrink-0" />
                    <span className="truncate">{t.durationLabel} {offer.duration}</span>
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-1">
                  <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">{t.jobDescriptionLabel}</span>
                  <p className="text-xs text-slate-600 leading-relaxed font-medium bg-slate-50/70 p-3 rounded-xl border border-slate-100 whitespace-pre-line">
                    {offer.description}
                  </p>
                </div>

                {/* Contact */}
                <div className="flex items-center gap-2 text-xs font-bold text-slate-800 pt-1">
                  <Phone size={14} className="text-amber-500 shrink-0" />
                  <span>{t.contactLabel} {offer.contact}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
                <span className="text-[10px] font-bold text-slate-400">
                  {t.publishedOn} {new Date(offer.createdAt).toLocaleDateString(locale)}
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenModal(offer)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-900 hover:text-white font-bold text-slate-700 transition-colors"
                  >
                    <Edit size={13} /> {offer.status === 'adjustment_requested' ? t.fixJobBtn : t.editBtn}
                  </button>
                  <button
                    onClick={() => handleDelete(offer.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                    title={t.deleteJobTitle}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Modal Form for Creating / Editing Job Offer */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl shadow-2xl border border-slate-100 w-full max-w-2xl overflow-hidden my-8"
            >
              {/* Modal Header */}
              <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-amber-500 rounded-xl text-slate-950">
                    <HardHat size={22} />
                  </div>
                  <div>
                    <h2 className="text-lg font-black">
                      {editingOffer ? t.editModalTitle : t.createModalTitle}
                    </h2>
                    <p className="text-xs text-slate-300 font-medium">
                      {t.modalDesc}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleCloseModal}
                  className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Form Content */}
              <form onSubmit={handleSubmit} className="p-6 space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* 📍 Local da obra */}
                  <div>
                    <label className="block text-xs font-black uppercase tracking-wider text-slate-600 mb-2 flex items-center gap-1.5">
                      <MapPin size={14} className="text-amber-500" /> {t.workLocationLabel}
                    </label>
                    <input
                      type="text"
                      required
                      placeholder={t.workLocationPlaceholder}
                      value={location}
                      onChange={e => setLocation(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 outline-none font-bold text-sm text-slate-900 focus:border-slate-900 transition-all"
                    />
                  </div>

                  {/* 👷 Especialidade */}
                  <div>
                    <label className="block text-xs font-black uppercase tracking-wider text-slate-600 mb-2 flex items-center gap-1.5">
                      <HardHat size={14} className="text-amber-500" /> {t.specialtyLabel}
                    </label>
                    <input
                      type="text"
                      required
                      placeholder={t.specialtyPlaceholder}
                      value={specialty}
                      onChange={e => setSpecialty(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 outline-none font-bold text-sm text-slate-900 focus:border-slate-900 transition-all"
                    />
                  </div>

                  {/* 💶 Salário/Valor diário */}
                  <div>
                    <label className="block text-xs font-black uppercase tracking-wider text-slate-600 mb-2 flex items-center gap-1.5">
                      <Euro size={14} className="text-amber-500" /> {t.salaryLabel}
                    </label>
                    <input
                      type="text"
                      required
                      placeholder={t.salaryPlaceholder}
                      value={salary}
                      onChange={e => setSalary(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 outline-none font-bold text-sm text-slate-900 focus:border-slate-900 transition-all"
                    />
                  </div>

                  {/* 📅 Data de início */}
                  <div>
                    <label className="block text-xs font-black uppercase tracking-wider text-slate-600 mb-2 flex items-center gap-1.5">
                      <Calendar size={14} className="text-amber-500" /> {t.startDateInputLabel}
                    </label>
                    <input
                      type="text"
                      required
                      placeholder={t.startDatePlaceholder}
                      value={startDate}
                      onChange={e => setStartDate(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 outline-none font-bold text-sm text-slate-900 focus:border-slate-900 transition-all"
                    />
                  </div>

                  {/* 📅 Duração prevista */}
                  <div>
                    <label className="block text-xs font-black uppercase tracking-wider text-slate-600 mb-2 flex items-center gap-1.5">
                      <Clock size={14} className="text-amber-500" /> {t.durationInputLabel}
                    </label>
                    <input
                      type="text"
                      required
                      placeholder={t.durationPlaceholder}
                      value={duration}
                      onChange={e => setDuration(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 outline-none font-bold text-sm text-slate-900 focus:border-slate-900 transition-all"
                    />
                  </div>

                  {/* 📞 Contacto */}
                  <div>
                    <label className="block text-xs font-black uppercase tracking-wider text-slate-600 mb-2 flex items-center gap-1.5">
                      <Phone size={14} className="text-amber-500" /> {t.contactInputLabel}
                    </label>
                    <input
                      type="text"
                      required
                      placeholder={t.contactPlaceholder}
                      value={contact}
                      onChange={e => setContact(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 outline-none font-bold text-sm text-slate-900 focus:border-slate-900 transition-all"
                    />
                  </div>
                </div>

                {/* 📝 Descrição */}
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-600 mb-2 flex items-center gap-1.5">
                    <FileText size={14} className="text-amber-500" /> {t.jobDescriptionInputLabel}
                  </label>
                  <textarea
                    required
                    rows={4}
                    placeholder={t.jobDescriptionPlaceholder}
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 outline-none font-bold text-sm text-slate-900 focus:border-slate-900 transition-all resize-none"
                  />
                </div>

                {/* Notice */}
                <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl text-xs text-amber-900 flex items-start gap-3">
                  <HelpCircle size={16} className="text-amber-600 shrink-0 mt-0.5" />
                  <p className="leading-relaxed font-medium">
                    {t.noticeBoxText}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="px-5 py-3 rounded-xl bg-slate-100 text-slate-700 text-xs font-black hover:bg-slate-200 transition-colors"
                  >
                    {t.cancelBtn}
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-900 text-white text-xs font-black hover:bg-slate-800 transition-all disabled:opacity-50 shadow-lg"
                  >
                    <Send size={15} />
                    {isSubmitting ? t.publishingBtn : (editingOffer ? t.saveAndSendBtn : t.publishJobModalBtn)}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
