import React, { useState, useEffect, useRef } from 'react';
import { 
  Video, 
  Youtube, 
  Upload, 
  CheckCircle2, 
  AlertCircle, 
  Play, 
  RefreshCw, 
  Sparkles, 
  Trash2, 
  Film, 
  Link as LinkIcon, 
  Sliders, 
  Eye, 
  ExternalLink,
  Volume2,
  VolumeX,
  Repeat,
  Tv,
  Zap
} from 'lucide-react';
import { HeroVideoConfig, HeroVideoType } from '../types';
import { 
  getStoredHeroVideoConfig, 
  saveHeroVideoConfig, 
  resetHeroVideoConfig, 
  extractYouTubeId, 
  DEFAULT_HERO_VIDEO_CONFIG 
} from '../services/storage';
import { MasterActionVideoSettings } from './MasterActionVideoSettings';

interface MasterHeroVideoSettingsProps {
  onSuccessToast?: (msg: string) => void;
  defaultVideoTab?: 'hero' | 'action';
}

export const MasterHeroVideoSettings: React.FC<MasterHeroVideoSettingsProps> = ({ onSuccessToast, defaultVideoTab = 'hero' }) => {
  const [activeVideoTab, setActiveVideoTab] = useState<'hero' | 'action'>(defaultVideoTab);
  const [config, setConfig] = useState<HeroVideoConfig>(getStoredHeroVideoConfig);
  const [selectedType, setSelectedType] = useState<HeroVideoType>(config.type || 'default');
  const [youtubeInput, setYoutubeInput] = useState(config.youtubeUrl || '');
  const [videoUrlInput, setVideoUrlInput] = useState(config.videoUrl || '');
  const [videoTitle, setVideoTitle] = useState(config.title || 'Demonstração Átrios Build');
  const [autoPlay, setAutoPlay] = useState(config.autoPlay ?? true);
  const [muted, setMuted] = useState(config.muted ?? true);
  const [loop, setLoop] = useState(config.loop ?? true);
  const [showControls, setShowControls] = useState(config.showControls ?? true);
  
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileSizeText, setFileSizeText] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [previewKey, setPreviewKey] = useState(0);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync state when config updates externally
  useEffect(() => {
    const handleConfigChange = (e: any) => {
      if (e.detail) {
        setConfig(e.detail);
        setSelectedType(e.detail.type || 'default');
        setYoutubeInput(e.detail.youtubeUrl || '');
        setVideoUrlInput(e.detail.videoUrl || '');
        setVideoTitle(e.detail.title || 'Demonstração Átrios Build');
        setAutoPlay(e.detail.autoPlay ?? true);
        setMuted(e.detail.muted ?? true);
        setLoop(e.detail.loop ?? true);
        setShowControls(e.detail.showControls ?? true);
      }
    };
    window.addEventListener('atrios_hero_video_changed', handleConfigChange);
    return () => window.removeEventListener('atrios_hero_video_changed', handleConfigChange);
  }, []);

  const detectedYouTubeId = extractYouTubeId(youtubeInput);
  const isYouTubeValid = Boolean(detectedYouTubeId);

  // Handle local file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('video/')) {
      setFeedback({ type: 'error', message: 'Por favor seleccione um ficheiro de vídeo válido (.mp4, .webm, .mov, etc).' });
      return;
    }

    // Check size (warn if > 30MB for local base64 storage)
    const sizeInMb = file.size / (1024 * 1024);
    setFileName(file.name);
    setFileSizeText(`${sizeInMb.toFixed(1)} MB`);

    setIsUploading(true);
    setUploadProgress(10);

    const reader = new FileReader();

    reader.onprogress = (event) => {
      if (event.lengthComputable) {
        const percent = Math.round((event.loaded / event.total) * 100);
        setUploadProgress(percent);
      }
    };

    reader.onload = () => {
      const dataUrl = reader.result as string;
      setVideoUrlInput(dataUrl);
      setSelectedType('upload');
      setIsUploading(false);
      setUploadProgress(100);
      setPreviewKey(prev => prev + 1);
      setFeedback({ type: 'success', message: `Vídeo "${file.name}" carregado com sucesso!` });
    };

    reader.onerror = () => {
      setIsUploading(false);
      setFeedback({ type: 'error', message: 'Erro ao processar ficheiro de vídeo.' });
    };

    reader.readAsDataURL(file);
  };

  // Save changes
  const handleSave = async () => {
    setIsSaving(true);
    setFeedback(null);

    let parsedYtId = '';
    if (selectedType === 'youtube') {
      if (!youtubeInput.trim()) {
        setFeedback({ type: 'error', message: 'Insira o link ou URL do vídeo do YouTube.' });
        setIsSaving(false);
        return;
      }
      parsedYtId = extractYouTubeId(youtubeInput) || '';
      if (!parsedYtId) {
        setFeedback({ type: 'error', message: 'Link do YouTube inválido. Exemplo suportado: https://www.youtube.com/watch?v=XXXX ou https://youtu.be/XXXX' });
        setIsSaving(false);
        return;
      }
    } else if (selectedType === 'upload') {
      if (!videoUrlInput.trim()) {
        setFeedback({ type: 'error', message: 'Faça upload de um vídeo ou insira um link direto de vídeo.' });
        setIsSaving(false);
        return;
      }
    }

    const newConfig: HeroVideoConfig = {
      type: selectedType,
      youtubeUrl: youtubeInput.trim(),
      youtubeId: parsedYtId || (selectedType === 'youtube' ? detectedYouTubeId || '' : ''),
      videoUrl: videoUrlInput.trim(),
      title: videoTitle.trim() || 'Demonstração Átrios Build',
      autoPlay,
      muted,
      loop,
      showControls
    };

    const res = await saveHeroVideoConfig(newConfig);
    setIsSaving(false);

    if (res.success) {
      setConfig(newConfig);
      setPreviewKey(prev => prev + 1);
      setFeedback({ type: 'success', message: 'Configurações de vídeo da Landing Page guardadas e publicadas com sucesso!' });
      if (onSuccessToast) {
        onSuccessToast('Vídeo do Hero atualizado com sucesso na Landing Page!');
      }
    } else {
      setFeedback({ type: 'error', message: 'Erro ao guardar configurações. Tente novamente.' });
    }
  };

  // Reset to default interactive demo
  const handleReset = async () => {
    if (!window.confirm('Tem a certeza que deseja restaurar a demonstração padrão da landing page?')) {
      return;
    }
    setIsSaving(true);
    const res = await resetHeroVideoConfig();
    setIsSaving(false);
    if (res.success) {
      setConfig(DEFAULT_HERO_VIDEO_CONFIG);
      setSelectedType('default');
      setYoutubeInput('');
      setVideoUrlInput('');
      setFileName(null);
      setFileSizeText(null);
      setPreviewKey(prev => prev + 1);
      setFeedback({ type: 'success', message: 'Demonstração padrão restaurada com sucesso!' });
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 text-left">
      {/* Subtab Selector for Landing Page Videos */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900/90 border border-white/10 p-2 rounded-2xl">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveVideoTab('hero')}
            className={`px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider transition-all flex items-center gap-2 ${
              activeVideoTab === 'hero'
                ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Film size={15} />
            <span>1. Vídeo do Hero (Topo)</span>
          </button>

          <button
            onClick={() => setActiveVideoTab('action')}
            className={`px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider transition-all flex items-center gap-2 ${
              activeVideoTab === 'action'
                ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Zap size={15} />
            <span>2. Vídeo "Veja em Ação" (60s)</span>
          </button>
        </div>

        <span className="text-[11px] font-bold text-slate-400 px-3 hidden sm:inline-block">
          Gestão de Vídeos da Landing Page
        </span>
      </div>

      {activeVideoTab === 'action' ? (
        <MasterActionVideoSettings onSuccessToast={onSuccessToast} />
      ) : (
        <>
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-amber-500/20 via-slate-900 to-amber-500/10 border border-amber-500/30 p-6 sm:p-8 rounded-[2.5rem] shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center shadow-xl shadow-amber-500/30 shrink-0">
                <Film size={28} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-black uppercase tracking-wider">
                    Landing Page Hero
                  </span>
                  <span className="text-xs text-slate-400 font-bold">• Controlo de Exibição</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-1">
                  Vídeo de Apresentação no Hero
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 font-medium max-w-2xl mt-1">
                  Personalize o elemento visual principal da Landing Page. Escolha entre o mockup interativo padrão, um vídeo incorporado do YouTube ou faça upload de um vídeo demonstrativo.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <button
                onClick={handleReset}
                disabled={isSaving}
                className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 font-black text-xs uppercase tracking-wider transition-all flex items-center gap-2"
                title="Restaurar visual padrão"
              >
                <RefreshCw size={14} /> Restaurar Padrão
              </button>
            </div>
          </div>


      {/* Feedback alerts */}
      {feedback && (
        <div className={`p-4 rounded-2xl border flex items-center justify-between gap-3 animate-in slide-in-from-top-2 duration-300 ${
          feedback.type === 'success' 
            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' 
            : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
        }`}>
          <div className="flex items-center gap-3">
            {feedback.type === 'success' ? <CheckCircle2 size={20} className="shrink-0" /> : <AlertCircle size={20} className="shrink-0" />}
            <span className="text-xs font-bold">{feedback.message}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="p-1 hover:bg-white/10 rounded-full">
            &times;
          </button>
        </div>
      )}

      {/* Main Grid: Options & Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column (Configuration): 7 Cols */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* 1. Mode Selection Cards */}
          <div className="bg-white/5 border border-white/10 p-6 rounded-[2rem] space-y-4 shadow-xl">
            <h3 className="text-sm font-black uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <Tv size={16} className="text-amber-400" />
              1. Seleccione o Formato de Apresentação
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Option: Default */}
              <button
                type="button"
                onClick={() => setSelectedType('default')}
                className={`p-4 rounded-2xl border text-left transition-all relative overflow-hidden flex flex-col justify-between ${
                  selectedType === 'default'
                    ? 'bg-amber-500/20 border-amber-500 text-white shadow-lg ring-2 ring-amber-500/40'
                    : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 hover:border-white/20'
                }`}
              >
                <div>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${
                    selectedType === 'default' ? 'bg-amber-500 text-slate-950 font-black' : 'bg-white/10 text-slate-400'
                  }`}>
                    <Sparkles size={20} />
                  </div>
                  <h4 className="text-xs font-black uppercase tracking-tight block">Demonstração Padrão</h4>
                  <p className="text-[11px] text-slate-400 mt-1 leading-tight">
                    Mockup interativo com prévia real de orçamento em ecrã de portátil.
                  </p>
                </div>
                {selectedType === 'default' && (
                  <span className="mt-3 inline-block px-2 py-0.5 bg-amber-500 text-slate-950 rounded text-[9px] font-black uppercase">
                    Activo
                  </span>
                )}
              </button>

              {/* Option: YouTube */}
              <button
                type="button"
                onClick={() => setSelectedType('youtube')}
                className={`p-4 rounded-2xl border text-left transition-all relative overflow-hidden flex flex-col justify-between ${
                  selectedType === 'youtube'
                    ? 'bg-red-500/20 border-red-500 text-white shadow-lg ring-2 ring-red-500/40'
                    : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 hover:border-white/20'
                }`}
              >
                <div>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${
                    selectedType === 'youtube' ? 'bg-red-600 text-white font-black' : 'bg-white/10 text-slate-400'
                  }`}>
                    <Youtube size={20} />
                  </div>
                  <h4 className="text-xs font-black uppercase tracking-tight block">Vídeo do YouTube</h4>
                  <p className="text-[11px] text-slate-400 mt-1 leading-tight">
                    Incorpora a janela / player oficial do YouTube no ecrã do Hero.
                  </p>
                </div>
                {selectedType === 'youtube' && (
                  <span className="mt-3 inline-block px-2 py-0.5 bg-red-600 text-white rounded text-[9px] font-black uppercase">
                    Activo
                  </span>
                )}
              </button>

              {/* Option: Upload File / Direct URL */}
              <button
                type="button"
                onClick={() => setSelectedType('upload')}
                className={`p-4 rounded-2xl border text-left transition-all relative overflow-hidden flex flex-col justify-between ${
                  selectedType === 'upload'
                    ? 'bg-blue-500/20 border-blue-500 text-white shadow-lg ring-2 ring-blue-500/40'
                    : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 hover:border-white/20'
                }`}
              >
                <div>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${
                    selectedType === 'upload' ? 'bg-blue-600 text-white font-black' : 'bg-white/10 text-slate-400'
                  }`}>
                    <Upload size={20} />
                  </div>
                  <h4 className="text-xs font-black uppercase tracking-tight block">Upload de Vídeo</h4>
                  <p className="text-[11px] text-slate-400 mt-1 leading-tight">
                    Ficheiro MP4 / WebM com reprodutor nativo de alta performance.
                  </p>
                </div>
                {selectedType === 'upload' && (
                  <span className="mt-3 inline-block px-2 py-0.5 bg-blue-600 text-white rounded text-[9px] font-black uppercase">
                    Activo
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* 2. Specific Settings based on selected mode */}
          {selectedType === 'youtube' && (
            <div className="bg-white/5 border border-white/10 p-6 rounded-[2rem] space-y-4 shadow-xl animate-in fade-in">
              <h3 className="text-sm font-black uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <Youtube size={18} className="text-red-500" />
                2. Configurar Link do YouTube
              </h3>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-300">
                  Link ou URL do Vídeo no YouTube:
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <LinkIcon size={16} />
                  </div>
                  <input
                    type="url"
                    value={youtubeInput}
                    onChange={(e) => setYoutubeInput(e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=dQw4w9WgXcQ ou https://youtu.be/..."
                    className="w-full pl-10 pr-24 py-3.5 bg-slate-950/80 border border-white/10 rounded-xl text-xs font-bold text-white outline-none focus:border-red-500 transition-all font-mono"
                  />
                  {youtubeInput && (
                    <button
                      type="button"
                      onClick={() => setYoutubeInput('')}
                      className="absolute inset-y-0 right-2 px-2.5 my-1.5 bg-white/10 hover:bg-white/20 text-slate-300 rounded-lg text-[10px] font-black uppercase"
                    >
                      Limpar
                    </button>
                  )}
                </div>

                {/* Validation message */}
                {youtubeInput.trim() ? (
                  isYouTubeValid ? (
                    <div className="flex items-center gap-2 p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold">
                      <CheckCircle2 size={16} className="shrink-0" />
                      <span>ID do YouTube detectado com sucesso: <strong className="font-mono">{detectedYouTubeId}</strong></span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold">
                      <AlertCircle size={16} className="shrink-0" />
                      <span>Formato não reconhecido. Certifique-se de colar um link completo do YouTube.</span>
                    </div>
                  )
                ) : (
                  <p className="text-[11px] text-slate-400">
                    Suporta links padrão (<code className="text-red-400 font-mono">youtube.com/watch?v=...</code>), links curtos (<code className="text-red-400 font-mono">youtu.be/...</code>) e YouTube Shorts.
                  </p>
                )}
              </div>

              {/* Video Title */}
              <div className="space-y-2 pt-2 border-t border-white/5">
                <label className="block text-xs font-bold text-slate-300">
                  Título da Apresentação:
                </label>
                <input
                  type="text"
                  value={videoTitle}
                  onChange={(e) => setVideoTitle(e.target.value)}
                  placeholder="Ex: Conheça o Átrios Build em 1 Minuto"
                  className="w-full px-4 py-3 bg-slate-950/80 border border-white/10 rounded-xl text-xs font-bold text-white outline-none focus:border-amber-500 transition-all"
                />
              </div>
            </div>
          )}

          {selectedType === 'upload' && (
            <div className="bg-white/5 border border-white/10 p-6 rounded-[2rem] space-y-5 shadow-xl animate-in fade-in">
              <h3 className="text-sm font-black uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <Upload size={18} className="text-blue-400" />
                2. Fazer Upload ou Inserir URL Direta do Vídeo
              </h3>

              {/* Drag & drop / Click box */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-white/20 hover:border-blue-500/80 bg-white/5 hover:bg-blue-500/5 p-6 rounded-2xl text-center cursor-pointer transition-all group"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="video/mp4,video/webm,video/ogg,video/quicktime"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                
                <div className="w-12 h-12 rounded-2xl bg-blue-500/20 text-blue-400 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 group-hover:bg-blue-500 group-hover:text-white transition-all shadow-lg">
                  <Upload size={22} />
                </div>
                
                <p className="text-xs font-black uppercase tracking-wider text-white">
                  Clique para seleccionar o ficheiro de vídeo
                </p>
                <p className="text-[11px] text-slate-400 mt-1">
                  Formatos suportados: MP4, WebM, MOV, OGG (Recomendado: MP4 1080p ou 720p)
                </p>

                {fileName && (
                  <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 bg-blue-500/20 border border-blue-500/30 rounded-full text-blue-300 text-[11px] font-bold">
                    <Film size={12} />
                    <span>{fileName}</span>
                    {fileSizeText && <span className="opacity-75">({fileSizeText})</span>}
                  </div>
                )}
              </div>

              {isUploading && (
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[11px] text-slate-300 font-bold">
                    <span>A processar vídeo...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Direct URL Alternative */}
              <div className="space-y-2 pt-2 border-t border-white/5">
                <label className="block text-xs font-bold text-slate-300">
                  Ou cole um link direto de vídeo (URL .mp4 / .webm):
                </label>
                <div className="relative">
                  <input
                    type="url"
                    value={videoUrlInput}
                    onChange={(e) => setVideoUrlInput(e.target.value)}
                    placeholder="https://exemplo.com/meu-video-hero.mp4"
                    className="w-full px-4 py-3 bg-slate-950/80 border border-white/10 rounded-xl text-xs font-bold text-white outline-none focus:border-blue-500 transition-all font-mono"
                  />
                  {videoUrlInput && (
                    <button
                      type="button"
                      onClick={() => { setVideoUrlInput(''); setFileName(null); }}
                      className="absolute inset-y-0 right-2 px-2.5 my-1.5 bg-white/10 hover:bg-white/20 text-slate-300 rounded-lg text-[10px] font-black uppercase"
                    >
                      Limpar
                    </button>
                  )}
                </div>
              </div>

              {/* Video Title */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-300">
                  Título da Apresentação:
                </label>
                <input
                  type="text"
                  value={videoTitle}
                  onChange={(e) => setVideoTitle(e.target.value)}
                  placeholder="Ex: Conheça o Átrios Build em 1 Minuto"
                  className="w-full px-4 py-3 bg-slate-950/80 border border-white/10 rounded-xl text-xs font-bold text-white outline-none focus:border-blue-500 transition-all"
                />
              </div>
            </div>
          )}

          {/* 3. Playback Controls & Preferences (For YouTube & Upload) */}
          {selectedType !== 'default' && (
            <div className="bg-white/5 border border-white/10 p-6 rounded-[2rem] space-y-4 shadow-xl animate-in fade-in">
              <h3 className="text-sm font-black uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <Sliders size={16} className="text-amber-400" />
                3. Opções de Reprodução e Controlos
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Autoplay */}
                <label className="flex items-center justify-between p-3.5 rounded-2xl bg-white/5 border border-white/10 cursor-pointer hover:bg-white/10 transition-all">
                  <div className="space-y-0.5">
                    <span className="text-xs font-black text-white uppercase block">Reprodução Automática</span>
                    <span className="text-[10px] text-slate-400 block">Inicia ao carregar a página</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={autoPlay}
                    onChange={(e) => setAutoPlay(e.target.checked)}
                    className="w-5 h-5 rounded-lg accent-amber-500 cursor-pointer"
                  />
                </label>

                {/* Muted */}
                <label className="flex items-center justify-between p-3.5 rounded-2xl bg-white/5 border border-white/10 cursor-pointer hover:bg-white/10 transition-all">
                  <div className="space-y-0.5">
                    <span className="text-xs font-black text-white uppercase block flex items-center gap-1.5">
                      {muted ? <VolumeX size={13} className="text-slate-400" /> : <Volume2 size={13} className="text-amber-400" />}
                      Áudio Inicial Mudo
                    </span>
                    <span className="text-[10px] text-slate-400 block">Exigido pelos navegadores p/ autoplay</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={muted}
                    onChange={(e) => setMuted(e.target.checked)}
                    className="w-5 h-5 rounded-lg accent-amber-500 cursor-pointer"
                  />
                </label>

                {/* Loop */}
                <label className="flex items-center justify-between p-3.5 rounded-2xl bg-white/5 border border-white/10 cursor-pointer hover:bg-white/10 transition-all">
                  <div className="space-y-0.5">
                    <span className="text-xs font-black text-white uppercase block flex items-center gap-1.5">
                      <Repeat size={13} className="text-slate-400" /> Repetição Contínua (Loop)
                    </span>
                    <span className="text-[10px] text-slate-400 block">Reinicia após terminar</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={loop}
                    onChange={(e) => setLoop(e.target.checked)}
                    className="w-5 h-5 rounded-lg accent-amber-500 cursor-pointer"
                  />
                </label>

                {/* Show Controls */}
                <label className="flex items-center justify-between p-3.5 rounded-2xl bg-white/5 border border-white/10 cursor-pointer hover:bg-white/10 transition-all">
                  <div className="space-y-0.5">
                    <span className="text-xs font-black text-white uppercase block">Mostrar Barra de Controlos</span>
                    <span className="text-[10px] text-slate-400 block">Permite pausar e ajustar volume</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={showControls}
                    onChange={(e) => setShowControls(e.target.checked)}
                    className="w-5 h-5 rounded-lg accent-amber-500 cursor-pointer"
                  />
                </label>
              </div>
            </div>
          )}

          {/* Action Bar / Save Button */}
          <div className="flex items-center gap-4 pt-2">
            <button
              onClick={handleSave}
              disabled={isSaving || isUploading}
              className="flex-1 py-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 rounded-2xl font-black text-sm uppercase tracking-wider transition-all shadow-xl shadow-amber-500/25 active:scale-95 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <RefreshCw size={18} className="animate-spin" />
                  <span>A Guardar e Publicar...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 size={18} />
                  <span>Guardar e Publicar na Landing Page</span>
                </>
              )}
            </button>
          </div>

        </div>

        {/* Right Column (Live Hero Laptop Preview): 5 Cols */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white/5 border border-white/10 p-6 rounded-[2rem] shadow-xl">
            <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
              <div className="flex items-center gap-2">
                <Eye size={16} className="text-amber-400" />
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-300">
                  Pré-visualização em Tempo Real
                </h3>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white/10 text-slate-400">
                Moldura Hero Laptop
              </span>
            </div>

            {/* Simulated Laptop Frame */}
            <div className="bg-slate-950 rounded-2xl p-2.5 sm:p-3 border-2 border-slate-800 shadow-2xl">
              
              {/* Browser Bar */}
              <div className="flex items-center justify-between pb-2 px-2 border-b border-slate-800 mb-2.5">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-rose-500" />
                  <div className="w-2 h-2 rounded-full bg-amber-500" />
                  <div className="w-2 h-2 rounded-full bg-emerald-500" />
                </div>
                <span className="text-[9px] font-mono text-slate-400">app.atriosbuild.com</span>
                <div className="w-6" />
              </div>

              {/* Inner Screen Content */}
              <div className="relative rounded-xl overflow-hidden bg-slate-900 aspect-video flex items-center justify-center" key={previewKey}>
                
                {selectedType === 'youtube' ? (
                  detectedYouTubeId ? (
                    <iframe
                      className="w-full h-full border-0"
                      src={`https://www.youtube.com/embed/${detectedYouTubeId}?autoplay=${autoPlay ? 1 : 0}&mute=${muted ? 1 : 0}&loop=${loop ? 1 : 0}&playlist=${detectedYouTubeId}&controls=${showControls ? 1 : 0}&rel=0&modestbranding=1`}
                      title={videoTitle || "Demonstração Átrios Build"}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                    />
                  ) : (
                    <div className="text-center p-6 space-y-2">
                      <div className="w-12 h-12 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center mx-auto">
                        <Youtube size={24} />
                      </div>
                      <p className="text-xs font-bold text-slate-300">Aguardando link válido do YouTube</p>
                      <p className="text-[10px] text-slate-500">Insira a URL no campo à esquerda</p>
                    </div>
                  )
                ) : selectedType === 'upload' ? (
                  videoUrlInput ? (
                    <video
                      className="w-full h-full object-cover"
                      src={videoUrlInput}
                      autoPlay={autoPlay}
                      muted={muted}
                      loop={loop}
                      controls={showControls}
                      playsInline
                    />
                  ) : (
                    <div className="text-center p-6 space-y-2">
                      <div className="w-12 h-12 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center mx-auto">
                        <Upload size={24} />
                      </div>
                      <p className="text-xs font-bold text-slate-300">Nenhum vídeo carregado</p>
                      <p className="text-[10px] text-slate-500">Faça upload ou cole um link direto</p>
                    </div>
                  )
                ) : (
                  /* Default estimate builder preview mockup */
                  <div className="w-full h-full bg-white p-3 text-slate-900 flex flex-col justify-between text-left select-none">
                    <div className="flex justify-between items-center border-b pb-1.5">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-black uppercase text-slate-900">ORÇAMENTO #2026-084</span>
                        <span className="px-1.5 py-0.2 bg-amber-100 text-amber-800 text-[8px] font-black rounded">PENDENTE</span>
                      </div>
                      <span className="text-[10px] font-black text-amber-600">6.840,00 €</span>
                    </div>

                    <div className="space-y-1 my-1">
                      <div className="bg-slate-50 p-1.5 rounded-md border border-slate-100 flex justify-between text-[9px]">
                        <span className="font-bold text-slate-700">Materiais & Insumos</span>
                        <span className="font-mono font-bold text-slate-900">916,00 €</span>
                      </div>
                      <div className="bg-slate-50 p-1.5 rounded-md border border-slate-100 flex justify-between text-[9px]">
                        <span className="font-bold text-slate-700">Mão de Obra Especializada</span>
                        <span className="font-mono font-bold text-slate-900">1.660,00 €</span>
                      </div>
                    </div>

                    <div className="flex justify-between items-center pt-1 border-t text-[8px] text-slate-400">
                      <span>IVA incluído (23%)</span>
                      <span className="px-2 py-0.5 bg-slate-900 text-white rounded font-bold text-[8px]">PDF Pronto</span>
                    </div>
                  </div>
                )}

              </div>
            </div>

            <div className="mt-4 p-4 rounded-xl bg-white/5 border border-white/5 text-[11px] text-slate-400 leading-relaxed">
              <strong className="text-slate-200 block mb-1">💡 Dica de Apresentação:</strong>
              Ao configurar um vídeo do YouTube ou upload, os visitantes da landing page verão imediatamente o player rodando com alta nitidez dentro do mockup do Hero.
            </div>
          </div>
        </div>

      </div>
        </>
      )}
    </div>
  );
};

