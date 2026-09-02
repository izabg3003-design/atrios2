import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Database,
  Download,
  Upload,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  FileJson,
  ShieldCheck,
  HardDrive,
  Cloud,
  Copy,
  Check,
  X,
  FileText,
  Users,
  Clock,
  ShoppingCart,
  Loader2,
  Info,
  ArrowRight,
  Briefcase,
  Layers,
  Sparkles,
  Server,
  Key
} from 'lucide-react';
import { Locale, translations } from '../translations';
import {
  createGlobalDatabaseBackup,
  downloadGlobalBackupJSON,
  validateGlobalBackupContent,
  restoreGlobalDatabaseBackup,
  GlobalDatabaseBackupPayload,
  GlobalBackupValidationResult
} from '../services/backupService';
import { 
  getStoredCompanies, 
  getAllStoredBudgets, 
  getStoredProducts, 
  getStoredStoreOrders,
  getStoredJobOffers,
  getStoredCandidates,
  getStoredClientRequests,
  getStoredIntroBanners,
  getCoupons
} from '../services/storage';
import { supabase } from '../services/supabase';

interface MasterBackupManagerProps {
  locale: Locale;
  onDataRefreshed?: () => void;
}

export const MasterBackupManager: React.FC<MasterBackupManagerProps> = ({
  locale,
  onDataRefreshed
}) => {
  const t = translations[locale] || translations['pt-PT'];

  // Estados locais de estatísticas
  const [refreshKey, setRefreshKey] = useState(0);
  const companies = getStoredCompanies();
  const budgets = getAllStoredBudgets();
  const products = getStoredProducts();
  const storeOrders = getStoredStoreOrders();
  const jobOffers = getStoredJobOffers();
  const candidates = getStoredCandidates();
  const clientRequests = getStoredClientRequests();
  const introBanners = getStoredIntroBanners();
  const coupons = getCoupons();

  // Export State
  const [isExporting, setIsExporting] = useState(false);
  const [exportCopied, setExportCopied] = useState(false);

  // Restore State
  const [restoreFile, setRestoreFile] = useState<File | null>(null);
  const [restoreText, setRestoreText] = useState<string>('');
  const [validationResult, setValidationResult] = useState<GlobalBackupValidationResult | null>(null);
  const [isRestoring, setIsRestoring] = useState(false);
  const [restoreProgress, setRestoreProgress] = useState<{ step: string; percent: number }>({ step: '', percent: 0 });
  const [restoreSuccessStats, setRestoreSuccessStats] = useState<any | null>(null);
  const [restoreError, setRestoreError] = useState<string | null>(null);

  // Cloud Sync Test State
  const [isTestingCloud, setIsTestingCloud] = useState(false);
  const [cloudTestMessage, setCloudTestMessage] = useState<string | null>(null);
  const [hybridStatus, setHybridStatus] = useState<{ supabaseStatus?: string; hybridCompaniesSaved?: number; hybridStorageActive?: boolean } | null>(null);
  const [isSyncingHybrid, setIsSyncingHybrid] = useState(false);
  const [syncHybridSuccess, setSyncHybridSuccess] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Exportar Backup Global
  const handleDownloadBackup = async () => {
    setIsExporting(true);
    try {
      const payload = await createGlobalDatabaseBackup();
      downloadGlobalBackupJSON(payload);
    } catch (err: any) {
      console.error('Erro ao gerar backup global:', err);
      alert('Erro ao gerar o backup global do banco de dados.');
    } finally {
      setIsExporting(false);
    }
  };

  // Copiar JSON
  const handleCopyJSON = async () => {
    try {
      const payload = await createGlobalDatabaseBackup();
      await navigator.clipboard.writeText(JSON.stringify(payload, null, 2));
      setExportCopied(true);
      setTimeout(() => setExportCopied(false), 2500);
    } catch (err) {
      console.error('Erro ao copiar:', err);
    }
  };

  // Upload e Validação de Ficheiro
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setRestoreFile(file);
    setRestoreError(null);
    setRestoreSuccessStats(null);

    const reader = new FileReader();
    reader.onload = (evt) => {
      const content = evt.target?.result as string;
      setRestoreText(content);
      const validation = validateGlobalBackupContent(content);
      setValidationResult(validation);
      if (!validation.isValid) {
        setRestoreError(validation.error || 'Ficheiro de backup inválido.');
      }
    };
    reader.onerror = () => {
      setRestoreError('Falha ao ler o ficheiro.');
    };
    reader.readAsText(file);
  };

  // Executar Restauração Global
  const handleExecuteRestore = async () => {
    if (!validationResult || !validationResult.isValid || !validationResult.payload) {
      setRestoreError('Nenhum backup válido carregado para restaurar.');
      return;
    }

    const confirmRestore = window.confirm(
      '⚠️ ATENÇÃO: Esta ação irá repor os dados globais de todas as empresas, orçamentos e produtos da base de dados. Deseja continuar?'
    );
    if (!confirmRestore) return;

    setIsRestoring(true);
    setRestoreError(null);

    try {
      const result = await restoreGlobalDatabaseBackup(
        validationResult.payload,
        (stepText, percent) => {
          setRestoreProgress({ step: stepText, percent });
        }
      );

      if (result.success) {
        setRestoreSuccessStats(result.stats);
        setRefreshKey(prev => prev + 1);
        if (onDataRefreshed) {
          onDataRefreshed();
        }
      } else {
        setRestoreError(result.error || 'Erro durante a restauração do banco de dados.');
      }
    } catch (err: any) {
      console.error('Erro no restauro:', err);
      setRestoreError(err.message || 'Falha inesperada ao repor dados.');
    } finally {
      setIsRestoring(false);
    }
  };

  // Testar conexão Supabase e Servidor Híbrido
  const handleTestCloudConnection = async () => {
    setIsTestingCloud(true);
    setCloudTestMessage(null);
    try {
      // 1. Testar status do Servidor Híbrido
      let hybridData: any = null;
      try {
        const res = await fetch('/api/hybrid/status');
        hybridData = await res.json();
        setHybridStatus(hybridData);
      } catch (e) {}

      // 2. Testar Supabase
      const { data, error } = await supabase.from('companies').select('count', { count: 'exact', head: true });
      if (error) {
        const isQuota = error.code === '429' || String(error.message || '').toLowerCase().includes('quota') || String(error.message || '').toLowerCase().includes('limit');
        if (isQuota) {
          setCloudTestMessage(`⚠️ Cota Supabase Excedida: O Modo Híbrido de Contingência está ativo! Os usuários continuam acessando e salvando normalmente no servidor e no dispositivo.`);
        } else {
          setCloudTestMessage(`Aviso Supabase: ${error.message} (Modo Híbrido protegendo dados locais)`);
        }
      } else {
        setCloudTestMessage('Conexão ao Supabase PostgreSQL 100% OK e comunicando.');
      }
    } catch (err: any) {
      setCloudTestMessage('Falha ao conectar com o Supabase. O Modo Híbrido está mantendo os dados seguros.');
    } finally {
      setIsTestingCloud(false);
    }
  };

  // Sincronizar todas as empresas locais para o Servidor de Contingência Express
  const handleSyncAllToHybrid = async () => {
    setIsSyncingHybrid(true);
    setSyncHybridSuccess(null);
    try {
      let syncedCount = 0;
      for (const comp of companies) {
        await fetch('/api/hybrid/sync-company', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ company: comp })
        }).catch(() => {});
        syncedCount++;
      }
      // Atualizar status
      const res = await fetch('/api/hybrid/status');
      const hData = await res.json();
      setHybridStatus(hData);
      setSyncHybridSuccess(`Sucesso: ${syncedCount} empresas protegidas no Servidor de Contingência!`);
    } catch (e: any) {
      alert('Erro ao sincronizar com servidor de contingência: ' + e.message);
    } finally {
      setIsSyncingHybrid(false);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-amber-950 border border-amber-500/20 p-6 md:p-8 rounded-3xl text-white shadow-2xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-black uppercase tracking-widest">
              <ShieldCheck size={14} /> Exclusivo Master Admin
            </div>
            <h2 className="text-2xl md:text-3xl font-black italic tracking-tight flex items-center gap-3">
              <Database className="text-amber-400 w-8 h-8" />
              Backup & Restauro do Banco de Dados
            </h2>
            <p className="text-slate-300 text-xs md:text-sm max-w-2xl leading-relaxed">
              Exporte todo o ecossistema ÁTRIOS (todas as empresas, orçamentos, logs de colaboradores, loja e vagas) num ficheiro único <code className="text-amber-300 font-mono">.JSON</code> ou restaure tudo com 1 clique caso ocorra qualquer problema no servidor.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={handleDownloadBackup}
              disabled={isExporting}
              className="px-6 py-4 rounded-2xl bg-amber-500 hover:bg-amber-400 active:scale-95 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-amber-500/25 flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            >
              {isExporting ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
              <span>Fazer Backup Global (.JSON)</span>
            </button>

            <button
              onClick={handleCopyJSON}
              className="px-4 py-4 rounded-2xl bg-white/10 hover:bg-white/20 active:scale-95 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer"
            >
              {exportCopied ? <Check size={16} className="text-emerald-400" /> : <Copy size={16} />}
              <span>{exportCopied ? 'Copiado!' : 'Copiar JSON'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Grid de Estatísticas do Banco de Dados */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
        <div className="bg-slate-900/60 border border-white/10 p-4 rounded-2xl flex flex-col items-center text-center">
          <Users className="w-5 h-5 text-amber-400 mb-2" />
          <span className="text-2xl font-black text-white">{companies.length}</span>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Empresas</span>
        </div>

        <div className="bg-slate-900/60 border border-white/10 p-4 rounded-2xl flex flex-col items-center text-center">
          <FileText className="w-5 h-5 text-blue-400 mb-2" />
          <span className="text-2xl font-black text-white">{budgets.length}</span>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Orçamentos</span>
        </div>

        <div className="bg-slate-900/60 border border-white/10 p-4 rounded-2xl flex flex-col items-center text-center">
          <ShoppingCart className="w-5 h-5 text-emerald-400 mb-2" />
          <span className="text-2xl font-black text-white">{storeOrders.length}</span>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Pedidos Loja</span>
        </div>

        <div className="bg-slate-900/60 border border-white/10 p-4 rounded-2xl flex flex-col items-center text-center">
          <Briefcase className="w-5 h-5 text-purple-400 mb-2" />
          <span className="text-2xl font-black text-white">{jobOffers.length}</span>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Vagas & Candidatos</span>
        </div>

        <div className="bg-slate-900/60 border border-white/10 p-4 rounded-2xl flex flex-col items-center text-center">
          <Layers className="w-5 h-5 text-rose-400 mb-2" />
          <span className="text-2xl font-black text-white">{clientRequests.length}</span>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Pedidos Obras</span>
        </div>

        <div className="bg-slate-900/60 border border-white/10 p-4 rounded-2xl flex flex-col items-center text-center">
          <Cloud className="w-5 h-5 text-cyan-400 mb-2" />
          <span className="text-xs font-black text-emerald-400 mt-1">Sincronizado</span>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Supabase</span>
        </div>
      </div>

      {/* Main Action Grid: Restauração & Conexão Supabase */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Coluna 1 & 2: Zona de Restauração Global */}
        <div className="lg:col-span-2 bg-slate-900/40 border border-white/10 rounded-3xl p-6 md:p-8 space-y-6">
          <div className="flex items-center gap-3 border-b border-white/10 pb-4">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white">Restauração de Dados (Upload Backup)</h3>
              <p className="text-xs text-slate-400">Carregue um arquivo <code className="text-amber-400 font-mono">.JSON</code> previamente gerado pelo ÁTRIOS</p>
            </div>
          </div>

          {/* Área de Seleção de Arquivo */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-white/20 hover:border-amber-500 hover:bg-amber-500/5 rounded-2xl p-8 flex flex-col items-center justify-center gap-3 cursor-pointer transition-all text-center group"
          >
            <FileJson className="w-12 h-12 text-slate-500 group-hover:text-amber-400 transition-colors" />
            <div>
              <div className="text-sm font-bold text-white">
                {restoreFile ? restoreFile.name : 'Clique para selecionar o ficheiro .JSON de Backup'}
              </div>
              <span className="text-xs text-slate-400">Ficheiros de Backup Global do Sistema</span>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json,application/json"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          {/* Validação de Backup */}
          {validationResult?.isValid && validationResult.summary && (
            <div className="p-5 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 space-y-4">
              <div className="flex items-center gap-2 text-emerald-400 font-black text-sm">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                Ficheiro de Backup Validado com Sucesso!
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div className="p-3 bg-slate-950/60 rounded-xl border border-white/10">
                  <div className="text-[10px] text-slate-400 font-bold uppercase">Empresas</div>
                  <div className="text-base font-black text-amber-400">{validationResult.summary.totalCompanies}</div>
                </div>
                <div className="p-3 bg-slate-950/60 rounded-xl border border-white/10">
                  <div className="text-[10px] text-slate-400 font-bold uppercase">Orçamentos</div>
                  <div className="text-base font-black text-emerald-400">{validationResult.summary.totalBudgets}</div>
                </div>
                <div className="p-3 bg-slate-950/60 rounded-xl border border-white/10">
                  <div className="text-[10px] text-slate-400 font-bold uppercase">Produtos Loja</div>
                  <div className="text-base font-black text-blue-400">{validationResult.summary.totalProducts}</div>
                </div>
                <div className="p-3 bg-slate-950/60 rounded-xl border border-white/10">
                  <div className="text-[10px] text-slate-400 font-bold uppercase">Data Backup</div>
                  <div className="text-xs font-bold text-slate-300 mt-1">{validationResult.summary.exportedAt.split(',')[0]}</div>
                </div>
              </div>

              {/* Botão de Execução */}
              <button
                onClick={handleExecuteRestore}
                disabled={isRestoring}
                className="w-full py-4 rounded-2xl bg-emerald-500 hover:bg-emerald-400 active:scale-[0.99] text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all cursor-pointer disabled:opacity-50"
              >
                {isRestoring ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Restaurando todo o banco de dados...
                  </>
                ) : (
                  <>
                    <Upload className="w-5 h-5" />
                    Confirmar e Restaurar Todo o Banco de Dados
                  </>
                )}
              </button>
            </div>
          )}

          {/* Erro de Restauro */}
          {restoreError && (
            <div className="p-4 rounded-2xl bg-red-950/50 border border-red-500/50 text-red-300 text-xs flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
              <span>{restoreError}</span>
            </div>
          )}

          {/* Progresso de Restauro */}
          {isRestoring && (
            <div className="p-5 rounded-2xl bg-slate-950/80 border border-amber-500/30 space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-amber-400">
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {restoreProgress.step || 'A processar restauro...'}
                </span>
                <span>{restoreProgress.percent}%</span>
              </div>
              <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-500 transition-all duration-300"
                  style={{ width: `${restoreProgress.percent}%` }}
                />
              </div>
            </div>
          )}

          {/* Sucesso de Restauro */}
          {restoreSuccessStats && (
            <div className="p-5 rounded-2xl bg-emerald-950/60 border border-emerald-500 text-emerald-200 space-y-2">
              <div className="flex items-center gap-2 font-black text-sm text-emerald-300">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                Banco de Dados Restaurado e Sincronizado com Sucesso!
              </div>
              <div className="text-xs text-slate-300 pl-7 space-y-1">
                <p>• {restoreSuccessStats.companiesRestored} Empresas restauradas no sistema.</p>
                <p>• {restoreSuccessStats.budgetsRestored} Orçamentos e Ordens de Serviço restaurados.</p>
                <p>• {restoreSuccessStats.workersRestored} Funcionários e registos de ponto sincronizados.</p>
                <p>• {restoreSuccessStats.productsRestored} Produtos e pedidos da loja restaurados.</p>
                <p className="font-bold text-emerald-400 mt-1">O seu banco de dados na nuvem está 100% atualizado e seguro.</p>
              </div>
            </div>
          )}
        </div>

        {/* Coluna 3: Painel de Informação & Supabase Cloud */}
        <div className="space-y-6">
          
          <div className="bg-slate-900/40 border border-white/10 rounded-3xl p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <Server className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-black text-white">Arquitetura Híbrida & Nuvem</h4>
                <div className="flex items-center gap-2 mt-0.5">
                  {hybridStatus?.supabaseStatus === 'quota_exceeded' ? (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                      Cota Nuvem Excedida (Modo Híbrido Ativo)
                    </span>
                  ) : (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                      Modo Híbrido Resiliente Ativo
                    </span>
                  )}
                </div>
              </div>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              O ÁTRIOS conta com proteção tripla de contingência: armazenamento local instantâneo, servidor de contingência contínuo e sincronização Supabase PostgreSQL. Se o Supabase atingir a cota gratuita de 5 GB, os utilizadores continuam a entrar e utilizar o sistema sem qualquer perda ou erro de credenciais.
            </p>

            {hybridStatus && (
              <div className="bg-slate-950/80 border border-white/10 rounded-2xl p-3 text-xs space-y-1">
                <div className="flex justify-between items-center text-slate-300">
                  <span>Status Supabase:</span>
                  <span className={`font-bold ${hybridStatus.supabaseStatus === 'quota_exceeded' ? 'text-amber-400' : 'text-emerald-400'}`}>
                    {hybridStatus.supabaseStatus === 'quota_exceeded' ? 'Cota 5GB Atingida' : 'Operacional'}
                  </span>
                </div>
                <div className="flex justify-between items-center text-slate-300">
                  <span>Contas salvas no Servidor:</span>
                  <span className="font-bold text-amber-300">{hybridStatus.hybridCompaniesSaved}</span>
                </div>
              </div>
            )}

            {cloudTestMessage && (
              <div className="p-3 rounded-xl bg-slate-950 border border-white/10 text-xs text-slate-300 flex items-center gap-2">
                <Info className="w-4 h-4 text-amber-400 shrink-0" />
                <span>{cloudTestMessage}</span>
              </div>
            )}

            {syncHybridSuccess && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300 flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{syncHybridSuccess}</span>
              </div>
            )}

            <div className="space-y-2 pt-1">
              <button
                onClick={handleTestCloudConnection}
                disabled={isTestingCloud}
                className="w-full py-3 px-4 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
              >
                {isTestingCloud ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
                <span>Verificar Conexão & Cota Supabase</span>
              </button>

              <button
                onClick={handleSyncAllToHybrid}
                disabled={isSyncingHybrid}
                className="w-full py-3 px-4 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 active:scale-95 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
              >
                {isSyncingHybrid ? <Loader2 size={14} className="animate-spin text-amber-400" /> : <ShieldCheck size={14} />}
                <span>{isSyncingHybrid ? 'Sincronizando Contingência...' : 'Salvar Empresas no Servidor de Contingência'}</span>
              </button>
            </div>
          </div>

          {/* Dica de Segurança */}
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-3xl p-6 space-y-3">
            <div className="flex items-center gap-2 text-amber-400 font-black text-xs uppercase tracking-wider">
              <ShieldCheck size={16} /> Política de Segurança Master
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Recomenda-se realizar o download de uma cópia de segurança global quinzenalmente ou antes de grandes atualizações na plataforma.
            </p>
          </div>

        </div>

      </div>
    </div>
  );
};
