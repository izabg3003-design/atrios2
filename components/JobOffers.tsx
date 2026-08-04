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
  HelpCircle,
  Users,
  Eye,
  Mail,
  User,
  Award
} from 'lucide-react';
import { Company, JobOffer, JobOfferStatus, Candidate } from '../types';
import { getStoredJobOffers, saveJobOffer, deleteJobOffer, generateShortId, fetchResilient, mapJobOfferFromSupabase, safeSetItem, getStoredCandidates, mapCandidateFromSupabase } from '../services/storage';
import { supabase, syncToCloud, safeFetch } from '../services/supabase';
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

  // States para candidatos atribuídos às vagas
  const [allCandidates, setAllCandidates] = useState<Candidate[]>([]);
  const [selectedJobCandidatesModal, setSelectedJobCandidatesModal] = useState<JobOffer | null>(null);
  const [selectedCandidateProfile, setSelectedCandidateProfile] = useState<Partial<Candidate> | null>(null);
  const [candidateNotification, setCandidateNotification] = useState<{ title: string; body: string } | null>(null);

  // Form State
  const [location, setLocation] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [salary, setSalary] = useState('');
  const [startDate, setStartDate] = useState('');
  const [duration, setDuration] = useState('');
  const [description, setDescription] = useState('');
  const [contact, setContact] = useState('');

  const loadCandidates = async () => {
    // 1. Carregar local e criar mapa
    const localCands = getStoredCandidates();
    const candMap = new Map<string, Candidate>();
    localCands.forEach(c => {
      const key = String(c.id || c.email || c.full_name);
      if (key) candMap.set(key, c);
    });

    // 2. Carregar do Supabase remoto
    try {
      const { data, error } = await safeFetch<any[]>(supabase.from('candidates').select('*'));
      if (data && Array.isArray(data)) {
        data.forEach(item => {
          const mapped = mapCandidateFromSupabase(item);
          const key = String(mapped.id || mapped.email || mapped.full_name);
          if (key) candMap.set(key, mapped);
        });
      }
    } catch (e) {
      console.warn("[JobOffers] Erro ao carregar candidatos remotos:", e);
    }

    const merged = Array.from(candMap.values());
    setAllCandidates(merged);
    safeSetItem('atrios_candidates', JSON.stringify(merged));
  };

  const getCandidatesForJob = (job: JobOffer, candidates: Candidate[]): Candidate[] => {
    const map = new Map<string, Candidate>();
    const targetJobId = String(job.id || '').trim().toLowerCase();

    // 1. Tabela 'candidates' no Supabase/localStorage
    candidates.forEach(c => {
      const cJobId = String(c.jobOfferId || (c as any).job_offer_id || (c as any).job_id || '').trim().toLowerCase();
      if (cJobId && targetJobId && cJobId === targetJobId) {
        const key = String(c.id || c.email || c.full_name);
        if (key) map.set(key, c);
      }
    });

    // 2. Campo 'candidatesJson' gravado na própria vaga
    if (job.candidatesJson) {
      try {
        let parsed: any = job.candidatesJson;
        if (typeof parsed === 'string') {
          try {
            parsed = JSON.parse(parsed);
          } catch (e1) {}
        }
        if (typeof parsed === 'string') {
          try {
            parsed = JSON.parse(parsed);
          } catch (e2) {}
        }

        const arr = Array.isArray(parsed) 
          ? parsed 
          : (parsed?.candidates || parsed?.candidatos || (typeof parsed === 'object' && parsed !== null ? [parsed] : []));

        arr.forEach((item: any, index: number) => {
          if (!item) return;
          const mapped: Candidate = {
            id: String(item.id || item.job_offer_id || `json-${job.id}-${index}`),
            jobOfferId: String(job.id),
            full_name: String(item.full_name || item.fullName || item.name || 'Candidato'),
            email: String(item.email || ''),
            phone: String(item.phone || ''),
            cover_letter: String(item.cover_letter || item.coverLetter || item.notes || ''),
            has_residence_permit: Boolean(item.has_residence_permit ?? item.hasResidencePermit ?? false),
            document_type: String(item.document_type || item.documentType || ''),
            has_drivers_license: Boolean(item.has_drivers_license ?? item.hasDriversLicense ?? false),
            has_construction_experience: Boolean(item.has_construction_experience ?? item.hasConstructionExperience ?? false),
            experience_duration: String(item.experience_duration || item.experienceDuration || ''),
            photo_url: String(item.photo_url || item.photoUrl || ''),
            created_at: String(item.created_at || item.createdAt || new Date().toISOString())
          };
          const key = mapped.id || mapped.email || mapped.full_name;
          if (key && (!map.has(key) || !map.get(key)?.full_name)) {
            map.set(key, mapped);
          }
        });
      } catch (e) {
        console.warn("[JobOffers] Erro ao ler candidatesJson para vaga:", job.id, e);
      }
    }

    return Array.from(map.values());
  };

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
    loadCandidates();

    // Inscrição Supabase Realtime para vagas e candidatos
    const channel = supabase
      .channel(`company-job-offers-${company.id}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'job_offers' },
        () => {
          loadOffers();
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'candidates' },
        () => {
          loadCandidates();
          loadOffers();
        }
      )
      .on(
        'broadcast',
        { event: 'new-candidate-push' },
        (payload) => {
          loadCandidates();
          loadOffers();
          if (payload?.payload?.title || payload?.payload?.candidateName) {
            const title = payload.payload.title || 'Novo Candidato Recebido!';
            const body = payload.payload.body || `Um novo candidato (${payload.payload.candidateName}) foi disponibilizado para a sua vaga.`;
            setCandidateNotification({ title, body });
            setTimeout(() => setCandidateNotification(null), 10000);
          }
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
      {/* Toast Alert para Notificação Push de Novo Candidato */}
      <AnimatePresence>
        {candidateNotification && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white p-4 sm:p-5 rounded-2xl sm:rounded-3xl shadow-2xl border border-emerald-400/50 flex items-start justify-between gap-4 z-50 relative"
          >
            <div className="flex items-start gap-3.5">
              <div className="p-2.5 bg-white/20 rounded-2xl shrink-0 mt-0.5">
                <Users className="w-6 h-6 text-white animate-bounce" />
              </div>
              <div>
                <h4 className="font-black text-sm uppercase tracking-wide flex items-center gap-2">
                  <span>🔔 {candidateNotification.title}</span>
                </h4>
                <p className="text-xs text-emerald-50 mt-1 font-medium leading-relaxed">
                  {candidateNotification.body}
                </p>
              </div>
            </div>
            <button
              onClick={() => setCandidateNotification(null)}
              className="p-1.5 hover:bg-white/20 rounded-xl text-white/80 hover:text-white transition-colors"
            >
              <X size={18} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

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
          {filteredOffers.map(offer => {
            const offerCandidates = getCandidatesForJob(offer, allCandidates);
            return (
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

                  {/* Seção / Botão de Candidatos Atribuídos pelo Master */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between bg-slate-50/80 p-3 rounded-2xl">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-black transition-colors ${
                        offerCandidates.length > 0 ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20' : 'bg-slate-200 text-slate-600'
                      }`}>
                        <Users size={18} />
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-black tracking-wider text-slate-400 block">
                          Candidatos
                        </span>
                        <span className="text-xs font-black text-slate-900">
                          {offerCandidates.length} candidato{offerCandidates.length === 1 ? '' : 's'} {offerCandidates.length > 0 ? 'enviado(s)' : 'atribuído(s)'}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => setSelectedJobCandidatesModal(offer)}
                      className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-black transition-all shadow-sm active:scale-95 ${
                        offerCandidates.length > 0
                          ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/20 animate-pulse'
                          : 'bg-slate-900 hover:bg-slate-800 text-white'
                      }`}
                    >
                      <Eye size={14} />
                      <span>Ver Candidatos</span>
                    </button>
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
            );
          })}
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

      {/* Modal / Nova Janela: Lista de Candidatos da Vaga Selecionada */}
      <AnimatePresence>
        {selectedJobCandidatesModal && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[120] flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-in fade-in">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-slate-900 text-white rounded-3xl shadow-2xl border border-white/10 w-full max-w-3xl overflow-hidden my-6 flex flex-col max-h-[90vh]"
            >
              {/* Modal Header */}
              <div className="p-6 bg-gradient-to-r from-amber-500/20 via-slate-900 to-amber-500/10 border-b border-white/10 flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-amber-500 rounded-2xl text-slate-950 shadow-lg shrink-0">
                    <Users size={26} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
                        Candidatos da Vaga
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        ID: {selectedJobCandidatesModal.id}
                      </span>
                    </div>
                    <h2 className="text-xl font-black text-white mt-1">
                      {selectedJobCandidatesModal.specialty}
                    </h2>
                    <p className="text-xs text-slate-300 font-medium flex items-center gap-2 mt-0.5">
                      <MapPin size={13} className="text-amber-400 shrink-0" />
                      {selectedJobCandidatesModal.location} • {selectedJobCandidatesModal.companyName}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedJobCandidatesModal(null)}
                  className="p-2.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-full transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 overflow-y-auto space-y-4">
                {(() => {
                  const jobCands = getCandidatesForJob(selectedJobCandidatesModal, allCandidates);
                  if (jobCands.length === 0) {
                    return (
                      <div className="py-12 text-center space-y-3 bg-slate-950/60 rounded-2xl border border-white/5 p-6">
                        <div className="w-16 h-16 bg-amber-500/10 text-amber-400 rounded-2xl flex items-center justify-center mx-auto border border-amber-500/20">
                          <Users size={32} />
                        </div>
                        <h4 className="text-base font-bold text-white">Nenhum candidato atribuído ainda</h4>
                        <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
                          Assim que a equipa Master disponibilizar candidatos para esta vaga ({selectedJobCandidatesModal.specialty}), eles ficarão visíveis nesta janela.
                        </p>
                      </div>
                    );
                  }

                  return (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-xs font-bold text-slate-400 px-1">
                        <span>Total de candidatos disponíveis: <strong className="text-amber-400">{jobCands.length}</strong></span>
                        <span className="text-[10px] text-slate-500">Clique em um candidato para ver a ficha completa</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {jobCands.map((c, i) => (
                          <div
                            key={c.id || i}
                            onClick={() => setSelectedCandidateProfile(c)}
                            className="p-4 rounded-2xl bg-slate-950/80 hover:bg-slate-850 border border-white/10 hover:border-amber-500/50 text-xs text-slate-300 flex flex-col justify-between space-y-3 cursor-pointer transition-all group shadow-md"
                          >
                            <div className="flex items-start gap-3">
                              {c.photo_url ? (
                                <img
                                  src={c.photo_url}
                                  alt={c.full_name || 'Candidato'}
                                  className="w-12 h-12 rounded-2xl object-cover border-2 border-amber-500/40 shrink-0 group-hover:scale-105 transition-transform"
                                  referrerPolicy="no-referrer"
                                />
                              ) : (
                                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 text-slate-950 font-black text-lg flex items-center justify-center shrink-0 shadow-md">
                                  {(c.full_name || 'C').charAt(0).toUpperCase()}
                                </div>
                              )}

                              <div className="min-w-0 flex-1 space-y-0.5">
                                <h4 className="font-black text-sm text-white truncate group-hover:text-amber-300 transition-colors">
                                  {c.full_name || 'Candidato Sem Nome'}
                                </h4>
                                {c.email && (
                                  <span className="text-[11px] text-amber-300/90 truncate block">
                                    {c.email}
                                  </span>
                                )}
                                {c.phone && (
                                  <span className="text-[11px] text-slate-400 block font-mono">
                                    Tel: {c.phone}
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Presentation note */}
                            {c.cover_letter && (
                              <p className="text-[11px] text-slate-300 italic line-clamp-2 bg-slate-900 p-2.5 rounded-xl border border-white/5">
                                "{c.cover_letter}"
                              </p>
                            )}

                            {/* Attribute tags */}
                            <div className="flex flex-wrap gap-1.5 pt-1">
                              {c.experience_duration && (
                                <span className="px-2 py-0.5 rounded-lg text-[10px] bg-slate-800 text-slate-300 border border-white/10 font-mono">
                                  Exp: {c.experience_duration} anos
                                </span>
                              )}
                              {c.has_residence_permit && (
                                <span className="px-2 py-0.5 rounded-lg text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold">
                                  Permissão Residência ✓
                                </span>
                              )}
                              {c.has_drivers_license && (
                                <span className="px-2 py-0.5 rounded-lg text-[10px] bg-blue-500/20 text-blue-300 border border-blue-500/30 font-bold">
                                  Carta Condução ✓
                                </span>
                              )}
                              {c.has_construction_experience && (
                                <span className="px-2 py-0.5 rounded-lg text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold">
                                  Exp. Construção ✓
                                </span>
                              )}
                            </div>

                            {/* View profile button */}
                            <div className="pt-2 border-t border-white/5 flex justify-end">
                              <span className="text-[11px] text-amber-400 font-bold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                                <Eye size={13} /> Ver Ficha Completa &rarr;
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Modal Footer */}
              <div className="p-4 bg-slate-950 border-t border-white/10 flex justify-end">
                <button
                  onClick={() => setSelectedJobCandidatesModal(null)}
                  className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs uppercase tracking-wider transition-all shadow-lg"
                >
                  Fechar Janela
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal / Ficha Completa do Candidato Selecionado */}
      <AnimatePresence>
        {selectedCandidateProfile && (
          <div className="fixed inset-0 z-[130] flex items-center justify-center bg-slate-950/85 p-4 sm:p-6 backdrop-blur-md animate-in fade-in">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 w-full max-w-xl rounded-[2.5rem] border border-white/10 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-amber-500/20 via-slate-900 to-emerald-500/20 p-6 border-b border-white/10 flex items-start justify-between">
                <div className="flex items-center gap-4">
                  {selectedCandidateProfile.photo_url ? (
                    <img 
                      src={selectedCandidateProfile.photo_url} 
                      alt={selectedCandidateProfile.full_name || 'Candidato'} 
                      className="w-16 h-16 rounded-2xl object-cover border-2 border-amber-500/50 shadow-lg"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-slate-950 font-black text-2xl shadow-lg">
                      {(selectedCandidateProfile.full_name || 'C').charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <h3 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
                      {selectedCandidateProfile.full_name || 'Candidato Sem Nome'}
                    </h3>
                    <p className="text-xs text-slate-400 font-mono flex items-center gap-1.5 mt-0.5">
                      <User size={13} className="text-amber-400" /> ID: {selectedCandidateProfile.id || 'N/A'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedCandidateProfile(null)}
                  className="p-2 text-slate-400 hover:text-white rounded-full bg-white/5 hover:bg-white/10 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Body */}
              <div className="p-6 overflow-y-auto space-y-5 text-slate-200">
                {/* Contact options */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {selectedCandidateProfile.email && (
                    <a 
                      href={`mailto:${selectedCandidateProfile.email}`}
                      className="flex items-center gap-3 p-3 rounded-2xl bg-slate-950 border border-white/10 hover:border-amber-500/50 transition-all text-xs group"
                    >
                      <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center group-hover:bg-amber-500 group-hover:text-slate-950 transition-colors">
                        <Mail size={16} />
                      </div>
                      <div className="min-w-0">
                        <span className="text-[10px] text-slate-400 uppercase font-black block">Email</span>
                        <span className="font-medium text-white truncate block">{selectedCandidateProfile.email}</span>
                      </div>
                    </a>
                  )}

                  {selectedCandidateProfile.phone && (
                    <a 
                      href={`tel:${selectedCandidateProfile.phone}`}
                      className="flex items-center gap-3 p-3 rounded-2xl bg-slate-950 border border-white/10 hover:border-emerald-500/50 transition-all text-xs group"
                    >
                      <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center group-hover:bg-emerald-500 group-hover:text-slate-950 transition-colors">
                        <Phone size={16} />
                      </div>
                      <div className="min-w-0">
                        <span className="text-[10px] text-slate-400 uppercase font-black block">Telefone</span>
                        <span className="font-medium text-white truncate block">{selectedCandidateProfile.phone}</span>
                      </div>
                    </a>
                  )}
                </div>

                {/* Candidate details */}
                <div className="space-y-2 bg-slate-950/60 p-4 rounded-2xl border border-white/10">
                  <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 block mb-2">
                    Informações e Qualificações
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {/* Residence permit */}
                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900 border border-white/5">
                      <span className="text-slate-400 text-[11px]">Permissão de Residência:</span>
                      {selectedCandidateProfile.has_residence_permit ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          Sim ✓
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-800 text-slate-400">
                          Não / Não indicado
                        </span>
                      )}
                    </div>

                    {/* Driver's license */}
                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900 border border-white/5">
                      <span className="text-slate-400 text-[11px]">Carta de Condução:</span>
                      {selectedCandidateProfile.has_drivers_license ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                          Sim ✓
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-800 text-slate-400">
                          Não / Não indicado
                        </span>
                      )}
                    </div>

                    {/* Construction experience */}
                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900 border border-white/5">
                      <span className="text-slate-400 text-[11px]">Exp. em Construção:</span>
                      {selectedCandidateProfile.has_construction_experience ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          Sim ✓
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-800 text-slate-400">
                          Não / Não indicado
                        </span>
                      )}
                    </div>

                    {/* Duration of experience */}
                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900 border border-white/5">
                      <span className="text-slate-400 text-[11px]">Tempo de Experiência:</span>
                      <span className="font-mono text-amber-400 font-bold">
                        {selectedCandidateProfile.experience_duration || 'Não especificado'} {selectedCandidateProfile.experience_duration ? 'anos' : ''}
                      </span>
                    </div>

                    {/* Document Type */}
                    {selectedCandidateProfile.document_type && (
                      <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900 border border-white/5 sm:col-span-2">
                        <span className="text-slate-400 text-[11px]">Tipo de Documento:</span>
                        <span className="font-semibold text-white">
                          {selectedCandidateProfile.document_type}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Presentation letter */}
                {selectedCandidateProfile.cover_letter && (
                  <div className="space-y-1.5 bg-slate-950/60 p-4 rounded-2xl border border-white/10">
                    <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                      <FileText size={13} /> Apresentação / Carta de Motivação
                    </span>
                    <p className="text-xs text-slate-300 leading-relaxed italic whitespace-pre-wrap bg-slate-900 p-3 rounded-xl border border-white/5">
                      "{selectedCandidateProfile.cover_letter}"
                    </p>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="p-4 bg-slate-950 border-t border-white/10 flex justify-end">
                <button
                  onClick={() => setSelectedCandidateProfile(null)}
                  className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs uppercase tracking-wider transition-all shadow-lg"
                >
                  Fechar Ficha
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
