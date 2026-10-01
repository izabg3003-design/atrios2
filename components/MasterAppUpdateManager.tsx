import React, { useState, useEffect } from 'react';
import { 
  RefreshCw, 
  Sparkles, 
  CheckCircle, 
  AlertTriangle, 
  Loader2, 
  Smartphone, 
  ShieldCheck, 
  Zap, 
  Radio, 
  Layers, 
  Info,
  Send,
  X
} from 'lucide-react';
import { 
  fetchServerAppVersion, 
  triggerMasterForceUpdate, 
  AppVersionInfo, 
  getLocalAppliedVersion 
} from '../services/appUpdateService';

interface MasterAppUpdateManagerProps {
  onSuccess?: () => void;
  className?: string;
}

export const MasterAppUpdateManager: React.FC<MasterAppUpdateManagerProps> = ({ 
  onSuccess,
  className = '' 
}) => {
  const [versionInfo, setVersionInfo] = useState<AppVersionInfo | null>(null);
  const [loadingVersion, setLoadingVersion] = useState<boolean>(true);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [customMessage, setCustomMessage] = useState<string>('');
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);
  const [lastUpdateResult, setLastUpdateResult] = useState<{
    success: boolean;
    version?: string;
    message?: string;
    timestamp?: string;
  } | null>(null);

  const loadVersion = async () => {
    setLoadingVersion(true);
    try {
      const info = await fetchServerAppVersion();
      if (info) {
        setVersionInfo(info);
      }
    } catch (e) {
      console.warn('Erro ao obter versão do servidor:', e);
    } finally {
      setLoadingVersion(false);
    }
  };

  useEffect(() => {
    loadVersion();
  }, []);

  const handleTriggerUpdate = async () => {
    setIsUpdating(true);
    setShowConfirmModal(false);
    try {
      const msg = customMessage.trim() || undefined;
      const res = await triggerMasterForceUpdate(msg);
      
      if (res.success) {
        setLastUpdateResult({
          success: true,
          version: res.version,
          message: 'Atualização remota forçada com sucesso! Todos os aparelhos receberam a ordem de renovação de cache e atualização do Service Worker.',
          timestamp: new Date().toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
        });
        setCustomMessage('');
        await loadVersion();
        if (onSuccess) onSuccess();
      } else {
        setLastUpdateResult({
          success: false,
          message: res.error || 'Falha ao comunicar com o servidor de atualização.',
          timestamp: new Date().toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
        });
      }
    } catch (err: any) {
      setLastUpdateResult({
        success: false,
        message: err?.message || 'Erro inesperado ao forçar atualização.',
        timestamp: new Date().toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const formattedDate = versionInfo?.updatedAt 
    ? new Date(versionInfo.updatedAt).toLocaleString('pt-PT', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    : 'A carregar...';

  return (
    <div className={`bg-white/5 border border-white/10 rounded-[3rem] p-8 md:p-10 shadow-2xl relative overflow-hidden ${className}`}>
      {/* Glow decorativo de fundo */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
      <div className="absolute bottom-0 left-0 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20" />

      {/* Cabeçalho */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 border-b border-white/10 relative z-10">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 text-slate-950 flex items-center justify-center font-black shadow-xl shadow-amber-500/20 shrink-0">
            <RefreshCw size={28} className={isUpdating ? "animate-spin" : ""} />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-black text-white italic tracking-tight uppercase">
                Atualização Remota Forçada (OTA)
              </h2>
              <span className="px-3 py-1 bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-full text-[11px] font-black tracking-wider uppercase flex items-center gap-1.5 shadow-sm">
                <Radio size={12} className="text-amber-400 animate-pulse" />
                Over-The-Air
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium mt-1">
              Garante que todos os utilizadores (PWA instalado no telemóvel, navegadores e computadores) recebam a versão mais recente <strong className="text-amber-400">sem precisarem de desinstalar e reinstalar o app</strong>.
            </p>
          </div>
        </div>

        {/* Badges de Versão do Servidor */}
        <div className="flex items-center gap-3 bg-white/5 border border-white/10 px-5 py-3 rounded-2xl shrink-0">
          <div className="text-right">
            <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest">Versão do App</p>
            <div className="flex items-center gap-2 justify-end">
              <span className="text-lg font-black text-amber-400">
                {versionInfo?.version ? `v${versionInfo.version}` : 'v1.2.0'}
              </span>
              <span className="text-[10px] text-slate-500 font-bold">
                (build {versionInfo?.versionCode || 120})
              </span>
            </div>
          </div>
          <button 
            onClick={loadVersion}
            disabled={loadingVersion}
            title="Recarregar informações de versão"
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition cursor-pointer"
          >
            <RefreshCw size={14} className={loadingVersion ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {/* Grid de 3 Pilares da Tecnologia de Atualização */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-8 relative z-10">
        <div className="bg-white/5 border border-white/5 p-5 rounded-2xl">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
              <Smartphone size={18} />
            </div>
            <h4 className="text-xs font-black uppercase text-white">Sem Reinstalação</h4>
          </div>
          <p className="text-xs text-slate-400">
            Nenhum cliente precisará apagar o ícone ou reinstalar. O app atualiza-se sozinho e em segundo plano.
          </p>
        </div>

        <div className="bg-white/5 border border-white/5 p-5 rounded-2xl">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
              <Zap size={18} />
            </div>
            <h4 className="text-xs font-black uppercase text-white">Purga Total de Caches</h4>
          </div>
          <p className="text-xs text-slate-400">
            Limpa o CacheStorage e força a ativação imediata do novo Service Worker (<code className="text-emerald-400">skipWaiting</code>).
          </p>
        </div>

        <div className="bg-white/5 border border-white/5 p-5 rounded-2xl">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-xl bg-blue-500/20 text-blue-400">
              <ShieldCheck size={18} />
            </div>
            <h4 className="text-xs font-black uppercase text-white">Disparo Multicanal</h4>
          </div>
          <p className="text-xs text-slate-400">
            Transmissão instantânea via Supabase Realtime (online) e Web Push + FCM (app em segundo plano).
          </p>
        </div>
      </div>

      {/* Feedback de Último Disparo */}
      {lastUpdateResult && (
        <div className={`p-5 rounded-2xl mb-8 border flex items-start gap-4 animate-in fade-in ${
          lastUpdateResult.success 
            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' 
            : 'bg-red-500/10 border-red-500/30 text-red-300'
        }`}>
          {lastUpdateResult.success ? (
            <CheckCircle size={22} className="text-emerald-400 shrink-0 mt-0.5" />
          ) : (
            <AlertTriangle size={22} className="text-red-400 shrink-0 mt-0.5" />
          )}
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <p className="text-sm font-black uppercase tracking-wide">
                {lastUpdateResult.success ? `Versão ${lastUpdateResult.version} Disparada com Sucesso!` : 'Falha ao Disparar'}
              </p>
              {lastUpdateResult.timestamp && (
                <span className="text-[11px] opacity-75 font-mono">{lastUpdateResult.timestamp}</span>
              )}
            </div>
            <p className="text-xs mt-1 leading-relaxed">{lastUpdateResult.message}</p>
          </div>
          <button 
            onClick={() => setLastUpdateResult(null)}
            className="text-slate-400 hover:text-white p-1"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Painel de Controlo / Ação */}
      <div className="bg-slate-900/60 border border-white/10 p-6 md:p-8 rounded-3xl relative z-10 space-y-6">
        <div>
          <label className="block text-xs font-black uppercase text-slate-300 mb-2">
            Mensagem Opcional de Novidades aos Utilizadores:
          </label>
          <input
            type="text"
            value={customMessage}
            onChange={(e) => setCustomMessage(e.target.value)}
            placeholder="Ex: Atualização com notificações instantâneas e melhorias gerais de estabilidade!"
            className="w-full bg-slate-950/80 border border-white/10 rounded-2xl px-5 py-3.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition shadow-inner"
          />
          <p className="text-[11px] text-slate-500 mt-2 flex items-center gap-1.5">
            <Info size={13} className="text-slate-400" />
            Se deixar em branco, o sistema usará o aviso padrão de atualização de segurança e novidades.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
          <div className="text-xs text-slate-400">
            Última atualização forçada: <span className="text-white font-bold">{formattedDate}</span>
          </div>

          <button
            onClick={() => setShowConfirmModal(true)}
            disabled={isUpdating}
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-sm uppercase tracking-wider flex items-center justify-center gap-3 transition-all shadow-xl shadow-amber-500/20 hover:scale-[1.02] active:scale-[0.98] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isUpdating ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                A Disparar Ordem de Atualização...
              </>
            ) : (
              <>
                <Sparkles size={18} className="text-slate-950" />
                Forçar Atualização Remota em Todos os Aparelhos
              </>
            )}
          </button>
        </div>
      </div>

      {/* Modal de Confirmação de Segurança */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-lg bg-slate-950 border border-white/15 rounded-[2.5rem] p-8 shadow-2xl space-y-6 relative overflow-hidden">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center shrink-0">
                <AlertTriangle size={24} />
              </div>
              <div>
                <h3 className="text-lg font-black uppercase text-white tracking-tight">
                  Confirmar Atualização Remota Global
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Esta ação tem impacto em todos os utilizadores ativos e instalados.
                </p>
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-xs text-slate-300 space-y-2">
              <p className="font-semibold text-white">Ao confirmar, o sistema irá automaticamente:</p>
              <ul className="list-disc pl-5 space-y-1 text-slate-400">
                <li>Incrementar a versão do app e registar o novo selo de tempo.</li>
                <li>Enviar sinal de <strong className="text-amber-400">Purga Imediata de Cache</strong> a todos os navegadores abertos.</li>
                <li>Forçar o Service Worker a assumir o controle sem esperar reinício manual.</li>
                <li>Disparar Push Notification para os aparelhos que estiverem em segundo plano.</li>
                <li><strong className="text-white">Garantir que nenhum utilizador precise desinstalar o app.</strong></li>
              </ul>
            </div>

            {customMessage && (
              <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs text-amber-300">
                <strong>Mensagem:</strong> "{customMessage}"
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-black uppercase tracking-wider transition cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleTriggerUpdate}
                className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black uppercase tracking-wider flex items-center gap-2 transition shadow-lg shadow-amber-500/20 cursor-pointer"
              >
                <Sparkles size={14} />
                Sim, Forçar Atualização Agora
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
