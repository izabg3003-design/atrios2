import React, { useState, useEffect, useMemo } from 'react';
import { 
  Clock, 
  Calendar, 
  MapPin, 
  CheckCircle2, 
  AlertCircle, 
  Send, 
  History, 
  Coffee, 
  Utensils, 
  FileText, 
  Copy, 
  Check, 
  ArrowLeft,
  HardHat,
  RefreshCw,
  Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Worker, WorkTimeLog, Company } from '../types';
import { Locale } from '../translations';
import { workerPortalTranslations } from './workTrackerTranslations';
import { 
  fetchWorkerById, 
  fetchCompanyForVerification, 
  fetchWorkTimeLogsFromCloud, 
  saveWorkTimeLog, 
  generateShortId 
} from '../services/storage';

interface WorkerPortalProps {
  initialWorkerId?: string;
  initialCompanyId?: string;
  initialLocale?: Locale;
  onBackToHome?: () => void;
}

export const WorkerPortal: React.FC<WorkerPortalProps> = ({
  initialWorkerId,
  initialCompanyId,
  initialLocale,
  onBackToHome
}) => {
  const [portalLocale, setPortalLocale] = useState<Locale>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const urlLang = params.get('lang') || params.get('locale');
      if (urlLang && workerPortalTranslations[urlLang as Locale]) {
        return urlLang as Locale;
      }
    }
    if (initialLocale && workerPortalTranslations[initialLocale]) {
      return initialLocale;
    }
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('atrios_locale') as Locale;
      if (saved && workerPortalTranslations[saved]) return saved;
    }
    return 'pt-PT';
  });

  const wpt = workerPortalTranslations[portalLocale] || workerPortalTranslations['pt-PT'];

  // Obter IDs a partir de props ou parâmetros de URL
  const [workerId] = useState<string>(() => {
    if (initialWorkerId) return initialWorkerId;
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      return params.get('workerId') || params.get('wid') || params.get('id') || params.get('w') || params.get('worker') || '';
    }
    return '';
  });

  const [companyId] = useState<string>(() => {
    if (initialCompanyId) return initialCompanyId;
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      return params.get('companyId') || params.get('cid') || params.get('company') || params.get('c') || '';
    }
    return '';
  });

  const [worker, setWorker] = useState<Worker | null>(null);
  const [company, setCompany] = useState<Company | null>(null);
  const [isLoadingWorker, setIsLoadingWorker] = useState<boolean>(true);
  const [recentLogs, setRecentLogs] = useState<WorkTimeLog[]>([]);
  const [isLoadingLogs, setIsLoadingLogs] = useState<boolean>(false);

  // Form State
  const [logDate, setLogDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState<string>('08:00');
  const [coffeeBreak, setCoffeeBreak] = useState<string>('10:00 - 10:15 (15 min)');
  const [lunchBreak, setLunchBreak] = useState<string>('12:00 - 13:00 (1h)');
  const [endTime, setEndTime] = useState<string>('17:00');
  const [workLocation, setWorkLocation] = useState<string>('');
  const [details, setDetails] = useState<string>('');

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitSuccess, setSubmitSuccess] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  // Carregar dados do colaborador e da empresa
  const loadWorkerData = async () => {
    if (!workerId || !companyId) {
      setIsLoadingWorker(false);
      return;
    }

    try {
      setIsLoadingWorker(true);
      const [fetchedWorker, fetchedCompany] = await Promise.all([
        fetchWorkerById(companyId, workerId),
        fetchCompanyForVerification(companyId)
      ]);

      if (fetchedWorker) {
        setWorker(fetchedWorker);
      }
      if (fetchedCompany) {
        setCompany(fetchedCompany);
      }

      // Carregar histórico de registos deste colaborador
      loadLogs();
    } catch (err) {
      console.error('Erro ao carregar dados do portal do colaborador:', err);
    } finally {
      setIsLoadingWorker(false);
    }
  };

  const loadLogs = async () => {
    if (!workerId || !companyId) return;
    try {
      setIsLoadingLogs(true);
      const logs = await fetchWorkTimeLogsFromCloud(companyId, workerId);
      setRecentLogs(logs || []);
    } catch (err) {
      console.warn('Erro ao carregar registos:', err);
    } finally {
      setIsLoadingLogs(false);
    }
  };

  useEffect(() => {
    loadWorkerData();
  }, [workerId, companyId]);

  // Atalhos de Horário Padrão da Construção Civil
  const applyPresetShift = (start: string, end: string, lunch: string) => {
    setStartTime(start);
    setEndTime(end);
    setLunchBreak(lunch);
  };

  // Cálculo das horas em tempo real (15 min de café é remunerado e NÃO desconta das 8h)
  const calculatedTotalHours = useMemo(() => {
    try {
      if (!startTime || !endTime) return 8;
      const [startH, startM] = startTime.split(':').map(Number);
      const [endH, endM] = endTime.split(':').map(Number);
      
      let totalMinutes = (endH * 60 + endM) - (startH * 60 + startM);
      if (totalMinutes < 0) totalMinutes += 24 * 60; // caso vire a noite

      // Deduz apenas almoço
      let lunchDeduction = 60;
      if (lunchBreak.includes('30m') || lunchBreak.includes('30 min')) {
        lunchDeduction = 30;
      } else if (lunchBreak.includes('1h30') || lunchBreak.includes('90m') || lunchBreak.includes('90 min')) {
        lunchDeduction = 90;
      } else if (lunchBreak.includes('0m') || lunchBreak.includes('Sem pausa') || lunchBreak.includes('0 min') || lunchBreak.includes('No break') || lunchBreak.includes('Sin pausa')) {
        lunchDeduction = 0;
      }

      const netMinutes = Math.max(0, totalMinutes - lunchDeduction);
      return Number((netMinutes / 60).toFixed(2));
    } catch {
      return 8;
    }
  }, [startTime, endTime, lunchBreak]);

  // Submissão do Registo de Ponto
  const handleSubmitLog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!worker || !companyId) {
      setErrorMessage(wpt.errorUnidentifiedWorker);
      return;
    }

    if (!logDate || !startTime || !endTime) {
      setErrorMessage(wpt.errorMissingFields);
      return;
    }

    if (!workLocation.trim()) {
      setErrorMessage(wpt.errorMissingLocation);
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMessage(null);

      const newLog: WorkTimeLog = {
        id: generateShortId(),
        companyId: companyId,
        workerId: worker.id,
        date: logDate,
        startTime: startTime,
        coffeeBreak: coffeeBreak,
        lunchBreak: lunchBreak,
        endTime: endTime,
        totalHours: calculatedTotalHours,
        workLocation: workLocation.trim(),
        details: details.trim(),
        createdAt: new Date().toISOString()
      };

      // Salva tanto no localStorage como no Supabase
      await saveWorkTimeLog(newLog);

      setSubmitSuccess(true);
      setDetails('');

      // Recarrega os registos
      await loadLogs();

      setTimeout(() => {
        setSubmitSuccess(false);
      }, 4500);
    } catch (err) {
      console.error('Erro ao submeter horas:', err);
      setErrorMessage(wpt.errorSubmitFailed);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Resumo do Mês
  const currentMonthStats = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const monthLogs = recentLogs.filter(l => {
      const logD = new Date(l.date);
      return logD.getMonth() === currentMonth && logD.getFullYear() === currentYear;
    });

    const totalHours = monthLogs.reduce((acc, curr) => acc + (Number(curr.totalHours) || 0), 0);
    return {
      daysCount: monthLogs.length,
      totalHours: Number(totalHours.toFixed(2))
    };
  }, [recentLogs]);

  const copyPortalLink = () => {
    if (typeof window !== 'undefined') {
      const origin = window.location.origin;
      const workerSlug = worker
        ? encodeURIComponent(
            worker.name
              .trim()
              .normalize('NFD')
              .replace(/[\u0300-\u036f]/g, '')
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, '-')
              .replace(/^-+|-+$/g, '') || worker.name.trim().toLowerCase().replace(/\s+/g, '-')
          )
        : '';
      const workerFullName = worker ? encodeURIComponent(worker.name.trim()) : '';
      const wId = worker?.id || workerId;
      const cId = company?.id || companyId;
      
      const customUrl = `${origin}/?portal=ponto&colaborador=${workerSlug}&nome=${workerFullName}&workerId=${encodeURIComponent(wId)}&companyId=${encodeURIComponent(cId)}&lang=${encodeURIComponent(portalLocale)}`;
      navigator.clipboard.writeText(customUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  if (isLoadingWorker) {
    return (
      <div className="min-h-screen w-full bg-slate-950 text-white flex flex-col items-center justify-center p-4 text-center">
        <div className="w-12 h-12 bg-amber-500/20 text-amber-500 rounded-2xl flex items-center justify-center animate-bounce mb-3">
          <Clock size={24} />
        </div>
        <p className="font-bold text-sm text-slate-200">{wpt.loadingPortal}</p>
        <p className="text-[11px] text-slate-500 mt-0.5">{wpt.syncingSecureData}</p>
      </div>
    );
  }

  if (!worker) {
    return (
      <div className="min-h-screen w-full bg-slate-950 text-white flex flex-col items-center justify-center p-4 text-center">
        <div className="w-14 h-14 bg-rose-500/20 text-rose-400 rounded-2xl flex items-center justify-center mb-3">
          <AlertCircle size={28} />
        </div>
        <h2 className="text-lg font-bold text-white tracking-tight">{wpt.workerNotFound}</h2>
        <p className="text-slate-400 text-xs max-w-xs mt-1.5 leading-relaxed">
          {wpt.invalidWorkerLinkDesc}
        </p>
        {onBackToHome && (
          <button
            onClick={onBackToHome}
            className="mt-4 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer"
          >
            {wpt.home}
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full max-w-full bg-slate-950 text-slate-100 flex flex-col items-center py-4 px-3 sm:px-4 sm:py-6 relative overflow-y-auto overflow-x-hidden font-sans selection:bg-amber-500 selection:text-slate-950 box-border">
      
      {/* Background Decorativo Seguro */}
      <div className="fixed inset-0 pointer-events-none opacity-20 overflow-hidden">
        <div className="absolute -top-32 -left-32 w-72 h-72 bg-amber-500 rounded-full blur-[100px]" />
        <div className="absolute top-1/2 -right-32 w-72 h-72 bg-blue-600 rounded-full blur-[120px]" />
      </div>

      {/* Container Principal */}
      <div className="w-full max-w-md mx-auto space-y-3.5 relative z-10 box-border pb-10">
        
        {/* Top Header Bar with Language Selector */}
        <div className="w-full flex items-center justify-between gap-2 min-w-0">
          <div className="flex items-center gap-1.5">
            {onBackToHome && (
              <button
                onClick={onBackToHome}
                className="px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold flex items-center gap-1 border border-slate-800 transition-all cursor-pointer shrink-0"
              >
                <ArrowLeft size={13} />
                <span>{wpt.home}</span>
              </button>
            )}

            {/* Language Selector */}
            <select
              value={portalLocale}
              onChange={(e) => {
                const newLoc = e.target.value as Locale;
                setPortalLocale(newLoc);
                try {
                  localStorage.setItem('atrios_locale', newLoc);
                } catch {}
              }}
              className="bg-slate-900 border border-slate-800 text-slate-200 text-xs font-bold rounded-xl px-2 py-1.5 outline-none focus:border-amber-500 cursor-pointer"
              title="Idioma / Language"
            >
              <option value="pt-PT">🇵🇹 PT</option>
              <option value="pt-BR">🇧🇷 BR</option>
              <option value="en-US">🇬🇧 EN</option>
              <option value="es-ES">🇪🇸 ES</option>
              <option value="fr-FR">🇫🇷 FR</option>
              <option value="it-IT">🇮🇹 IT</option>
              <option value="ru-RU">🇷🇺 RU</option>
              <option value="hi-IN">🇮🇳 HI</option>
              <option value="bn-BD">🇧🇩 BN</option>
            </select>
          </div>

          <button
            onClick={copyPortalLink}
            className="px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-400 text-xs font-bold uppercase tracking-wider flex items-center gap-1 border border-slate-800 transition-all cursor-pointer shrink-0"
            title="Guardar link"
          >
            {copiedLink ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
            <span>{copiedLink ? wpt.linkCopied : wpt.saveLink}</span>
          </button>
        </div>

        {/* Card de Identificação do Colaborador */}
        <div className="w-full bg-slate-900/90 border border-slate-800/90 backdrop-blur-md rounded-2xl p-3.5 sm:p-4 shadow-xl box-border">
          <div className="flex items-center justify-between gap-2.5 min-w-0">
            <div className="flex items-center gap-2.5 min-w-0 flex-1">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 text-slate-950 font-black flex items-center justify-center shadow-md shadow-amber-500/20 shrink-0">
                <HardHat size={20} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-400 font-mono font-bold text-[8.5px] uppercase tracking-wider border border-amber-500/25">
                    {wpt.digitalTimesheet}
                  </span>
                  {worker.active ? (
                    <span className="px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-400 font-semibold text-[8.5px]">
                      ● {wpt.active}
                    </span>
                  ) : (
                    <span className="px-1.5 py-0.5 rounded bg-rose-500/15 text-rose-400 font-semibold text-[8.5px]">
                      {wpt.inactive}
                    </span>
                  )}
                </div>
                <h1 className="text-sm sm:text-base font-bold text-white tracking-tight mt-0.5 truncate">
                  {worker.name}
                </h1>
                <p className="text-slate-400 text-[11px] font-medium truncate">
                  {worker.role} {worker.nif ? `• ${worker.nif}` : ''}
                </p>
              </div>
            </div>

            {company && (
              <div className="text-right shrink-0 max-w-[100px] sm:max-w-[130px]">
                <span className="text-[8px] font-bold uppercase tracking-widest text-slate-500 block">
                  {wpt.company}
                </span>
                <span className="text-[11px] font-bold text-slate-300 truncate block">
                  {company.name || company.companyName}
                </span>
              </div>
            )}
          </div>

          {/* Mini Dashboard de Horas do Mês */}
          <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-slate-800/70">
            <div className="bg-slate-950/70 rounded-xl p-2 border border-slate-800/80 min-w-0">
              <span className="text-[8.5px] font-bold uppercase tracking-wider text-slate-400 block truncate">
                {wpt.monthDays}
              </span>
              <span className="text-sm font-bold text-white mt-0.5 block truncate">
                {currentMonthStats.daysCount} <span className="text-[9px] font-normal text-slate-400">{wpt.days}</span>
              </span>
            </div>

            <div className="bg-slate-950/70 rounded-xl p-2 border border-slate-800/80 min-w-0">
              <span className="text-[8.5px] font-bold uppercase tracking-wider text-slate-400 block truncate">
                {wpt.accumulatedHours}
              </span>
              <span className="text-sm font-bold text-amber-400 mt-0.5 block font-mono truncate">
                {currentMonthStats.totalHours} <span className="text-[9px] font-normal text-slate-400">h</span>
              </span>
            </div>
          </div>
        </div>

        {/* Notificação de Sucesso */}
        <AnimatePresence>
          {submitSuccess && (
            <motion.div 
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className="bg-emerald-500/20 border border-emerald-500/40 text-emerald-200 rounded-xl p-3 flex items-center gap-2.5 shadow-lg box-border"
            >
              <div className="w-7 h-7 rounded-lg bg-emerald-500 text-slate-950 flex items-center justify-center shrink-0">
                <CheckCircle2 size={16} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-bold text-xs text-emerald-300">{wpt.successMessage}</p>
                <p className="text-[10.5px] font-normal text-emerald-200/90 truncate">
                  ({calculatedTotalHours}h)
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Formulário de Registo de Ponto */}
        <div className="w-full bg-slate-900/95 border border-slate-800 rounded-2xl p-3.5 sm:p-4 shadow-xl box-border">
          <div className="flex items-center justify-between mb-3 pb-2.5 border-b border-slate-800 gap-2">
            <div className="min-w-0">
              <h2 className="text-xs sm:text-sm font-bold text-white tracking-tight flex items-center gap-1.5">
                <Clock className="text-amber-500 shrink-0" size={14} />
                <span>{wpt.recordToday}</span>
              </h2>
              <p className="text-[10px] text-slate-400 font-medium truncate">
                {wpt.recordSubtitle}
              </p>
            </div>

            {/* Totalizador Flutuante de Horas */}
            <div className="text-right bg-amber-500/10 border border-amber-500/25 px-2 py-1 rounded-xl shrink-0">
              <span className="text-[7.5px] font-black uppercase tracking-widest text-amber-400 block">
                {wpt.netTotal}
              </span>
              <span className="text-sm font-black text-amber-400 font-mono">
                {calculatedTotalHours}h
              </span>
            </div>
          </div>

          {errorMessage && (
            <div className="mb-3 bg-rose-500/20 border border-rose-500/40 text-rose-200 rounded-xl p-2 text-xs font-semibold flex items-center gap-1.5 box-border">
              <AlertCircle size={13} className="shrink-0" />
              <span className="break-words">{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmitLog} className="space-y-3">
            
            {/* Campo de Data com Atalhos Rápidos */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1">
                  <Calendar size={11} className="text-amber-500" />
                  <span>{wpt.workDate}</span>
                </label>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setLogDate(new Date().toISOString().split('T')[0])}
                    className="px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-[9px] font-semibold text-slate-300 transition-colors cursor-pointer"
                  >
                    {wpt.today}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const d = new Date();
                      d.setDate(d.getDate() - 1);
                      setLogDate(d.toISOString().split('T')[0]);
                    }}
                    className="px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-[9px] font-semibold text-slate-300 transition-colors cursor-pointer"
                  >
                    {wpt.yesterday}
                  </button>
                </div>
              </div>
              <input
                type="date"
                required
                value={logDate}
                onChange={e => setLogDate(e.target.value)}
                className="w-full box-border min-w-0 px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white font-semibold text-sm outline-none focus:border-amber-500 transition-all"
              />
            </div>

            {/* Presets Rápidos de Turno */}
            <div className="space-y-1">
              <span className="text-[9.5px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                <Zap size={10} className="text-amber-400" />
                <span>{wpt.commonSchedules}</span>
              </span>
              <div className="grid grid-cols-3 gap-1.5">
                <button
                  type="button"
                  onClick={() => applyPresetShift('08:00', '17:00', '12:00 - 13:00 (1h)')}
                  className={`py-1.5 px-1 rounded-lg text-[9.5px] font-bold border transition-all text-center truncate min-w-0 cursor-pointer ${
                    startTime === '08:00' && endTime === '17:00'
                      ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                  title="08:00 - 17:00 (8h)"
                >
                  {wpt.shift8h}
                </button>
                <button
                  type="button"
                  onClick={() => applyPresetShift('07:30', '16:30', '12:00 - 13:00 (1h)')}
                  className={`py-1.5 px-1 rounded-lg text-[9.5px] font-bold border transition-all text-center truncate min-w-0 cursor-pointer ${
                    startTime === '07:30' && endTime === '16:30'
                      ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                  title="07:30 - 16:30 (8h)"
                >
                  {wpt.shiftEarly}
                </button>
                <button
                  type="button"
                  onClick={() => applyPresetShift('08:00', '12:00', 'Sem pausa (0m)')}
                  className={`py-1.5 px-1 rounded-lg text-[9.5px] font-bold border transition-all text-center truncate min-w-0 cursor-pointer ${
                    startTime === '08:00' && endTime === '12:00'
                      ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                  title="08:00 - 12:00 (4h)"
                >
                  {wpt.shiftHalf}
                </button>
              </div>
            </div>

            {/* Horários: Entrada e Saída */}
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1 min-w-0">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1 truncate">
                  <Clock size={11} className="text-emerald-400 shrink-0" />
                  <span>{wpt.entryTime}</span>
                </label>
                <input
                  type="time"
                  required
                  value={startTime}
                  onChange={e => setStartTime(e.target.value)}
                  className="w-full box-border min-w-0 px-2.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono font-bold text-sm outline-none focus:border-amber-500 transition-all"
                />
              </div>

              <div className="space-y-1 min-w-0">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1 truncate">
                  <Clock size={11} className="text-rose-400 shrink-0" />
                  <span>{wpt.exitTime}</span>
                </label>
                <input
                  type="time"
                  required
                  value={endTime}
                  onChange={e => setEndTime(e.target.value)}
                  className="w-full box-border min-w-0 px-2.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono font-bold text-sm outline-none focus:border-amber-500 transition-all"
                />
              </div>
            </div>

            {/* Pausas: Café (Pequeno-almoço) e Almoço */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              
              {/* Pausa Café */}
              <div className="space-y-1 min-w-0">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1">
                    <Coffee size={11} className="text-amber-400 shrink-0" />
                    <span>{wpt.coffeeBreak}</span>
                  </label>
                  <span className="text-[8.5px] text-emerald-400 font-bold">
                    {wpt.paidBreak}
                  </span>
                </div>
                <input
                  type="text"
                  value={coffeeBreak}
                  onChange={e => setCoffeeBreak(e.target.value)}
                  placeholder="10:00 - 10:15 (15 min)"
                  className="w-full box-border min-w-0 px-2.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white font-medium text-xs outline-none focus:border-amber-500 transition-all"
                />
              </div>

              {/* Pausa de Almoço */}
              <div className="space-y-1 min-w-0">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1">
                    <Utensils size={11} className="text-blue-400 shrink-0" />
                    <span>{wpt.lunchBreak}</span>
                  </label>
                  <span className="text-[8.5px] text-amber-400 font-bold">
                    {wpt.lunchDeduction}
                  </span>
                </div>
                <select
                  value={lunchBreak}
                  onChange={e => setLunchBreak(e.target.value)}
                  className="w-full box-border min-w-0 px-2 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white font-medium text-xs outline-none focus:border-amber-500 transition-all cursor-pointer"
                >
                  <option value="12:00 - 13:00 (1h)">12:00 - 13:00 (1h)</option>
                  <option value="12:30 - 13:30 (1h)">12:30 - 13:30 (1h)</option>
                  <option value="13:00 - 14:00 (1h)">13:00 - 14:00 (1h)</option>
                  <option value="30 min (30m)">30 min (30m)</option>
                  <option value="1h30 (90m)">1h30 (90m)</option>
                  <option value="Sem pausa (0m)">{wpt.noBreak}</option>
                </select>
              </div>
            </div>

            {/* Local da Obra / Localização */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1">
                <MapPin size={11} className="text-rose-400 shrink-0" />
                <span>{wpt.workLocation} *</span>
              </label>
              <input
                type="text"
                required
                value={workLocation}
                onChange={e => setWorkLocation(e.target.value)}
                placeholder={wpt.locationPlaceholder}
                className="w-full box-border min-w-0 px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white font-medium text-xs sm:text-sm outline-none focus:border-amber-500 transition-all placeholder:text-slate-600"
              />
            </div>

            {/* Detalhes / Descrição dos Trabalhos */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1">
                <FileText size={11} className="text-slate-400 shrink-0" />
                <span>{wpt.workDetails}</span>
              </label>
              <textarea
                rows={2}
                value={details}
                onChange={e => setDetails(e.target.value)}
                placeholder={wpt.detailsPlaceholder}
                className="w-full box-border min-w-0 px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white font-normal text-xs outline-none focus:border-amber-500 transition-all placeholder:text-slate-600 resize-none"
              />
            </div>

            {/* Botão de Submissão */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full box-border py-2.5 px-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-[0.99] cursor-pointer disabled:opacity-50 mt-1"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw size={14} className="animate-spin" />
                  <span>{wpt.submitting}</span>
                </>
              ) : (
                <>
                  <Send size={14} />
                  <span>{wpt.submit} ({calculatedTotalHours}h)</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Histórico Recente do Colaborador */}
        <div className="w-full bg-slate-900/95 border border-slate-800 rounded-2xl p-3.5 sm:p-4 shadow-xl box-border">
          <div className="flex items-center justify-between mb-2.5 pb-2 border-b border-slate-800">
            <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
              <History size={13} className="text-slate-400" />
              <span>{wpt.myRecentLogs}</span>
            </h3>
            <button
              onClick={loadLogs}
              disabled={isLoadingLogs}
              className="text-[10px] font-semibold text-slate-400 hover:text-amber-400 flex items-center gap-1 transition-colors cursor-pointer"
            >
              <RefreshCw size={10} className={isLoadingLogs ? 'animate-spin text-amber-500' : ''} />
              <span>{wpt.refresh}</span>
            </button>
          </div>

          {recentLogs.length === 0 ? (
            <div className="text-center py-4 text-slate-500">
              <Clock size={20} className="mx-auto mb-1 opacity-40" />
              <p className="text-xs font-semibold">{wpt.noLogsYet}</p>
              <p className="text-[9.5px] mt-0.5 text-slate-600">{wpt.submitFirstDayPrompt}</p>
            </div>
          ) : (
            <div className="space-y-1.5">
              {recentLogs.slice(0, 5).map((log) => (
                <div
                  key={log.id}
                  className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-2.5 flex items-center justify-between gap-2 hover:border-slate-700 transition-all min-w-0"
                >
                  <div className="space-y-0.5 min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 font-mono font-bold text-[9px]">
                        {new Date(log.date).toLocaleDateString(portalLocale, { day: '2-digit', month: '2-digit', weekday: 'short' })}
                      </span>
                      <span className="text-[10px] font-semibold text-slate-300">
                        {log.startTime} - {log.endTime}
                      </span>
                    </div>
                    <p className="text-[10px] font-medium text-slate-400 flex items-center gap-1 truncate">
                      <MapPin size={10} className="text-rose-400 shrink-0" />
                      <span className="truncate">{log.workLocation || 'Obra Principal'}</span>
                    </p>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-lg bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 font-mono font-bold text-[11px]">
                      {log.totalHours}h
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Rodapé */}
        <div className="text-center py-2 text-[9.5px] text-slate-500">
          <p>{wpt.secureFooter}</p>
        </div>

      </div>
    </div>
  );
};
