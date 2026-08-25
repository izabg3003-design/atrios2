import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, 
  Image as ImageIcon, 
  Upload, 
  Plus, 
  Trash2, 
  Edit3, 
  ArrowUp, 
  ArrowDown, 
  CheckCircle2, 
  Eye, 
  RefreshCw, 
  Layers, 
  Palette, 
  Sliders, 
  Check, 
  X, 
  AlertCircle, 
  Database, 
  FileText, 
  Users, 
  HardHat, 
  CreditCard, 
  Smartphone, 
  RotateCcw,
  Copy,
  ExternalLink,
  Monitor,
  Maximize2,
  Info,
  Ruler
} from 'lucide-react';
import { IntroBannerItem } from '../types';
import { 
  getStoredIntroBanners, 
  saveIntroBanner, 
  deleteIntroBanner, 
  saveIntroBannersOrder, 
  fetchIntroBannersFromSupabase, 
  resetIntroBannersToDefault,
  DEFAULT_INTRO_BANNERS 
} from '../services/storage';
import FullscreenIntroBanner from './FullscreenIntroBanner';

interface MasterIntroBannersSettingsProps {
  onSuccessToast?: (msg: string) => void;
}

const COLOR_PRESETS = [
  { label: 'Laranja Átrios', value: '#ff5722', tagClass: 'bg-orange-500/20 text-orange-400 border-orange-500/30' },
  { label: 'Dourado Âmbar', value: '#f59e0b', tagClass: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
  { label: 'Azul Gestão', value: '#3b82f6', tagClass: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
  { label: 'Verde Finanças', value: '#10b981', tagClass: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
  { label: 'Roxo Cloud', value: '#a855f7', tagClass: 'bg-purple-500/20 text-purple-400 border-purple-500/30' },
  { label: 'Rosa Destaque', value: '#ec4899', tagClass: 'bg-pink-500/20 text-pink-400 border-pink-500/30' },
  { label: 'Ciano Inovação', value: '#06b6d4', tagClass: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30' },
];

const TAG_SUGGESTIONS = [
  'OPORTUNIDADES DE NEGÓCIO',
  'ORÇAMENTOS RÁPIDOS & PRECISOS',
  'GESTÃO & CRONOGRAMAS',
  'SAÚDE FINANCEIRA',
  'MULTIPLATAFORMA & CLOUD',
  'PORTAL DO CLIENTE EXCLUSIVO',
  'REDE DE PROFISSIONAIS',
  'INTELIGÊNCIA ARTIFICIAL',
  'NOVA FUNCIONALIDADE'
];

export const MasterIntroBannersSettings: React.FC<MasterIntroBannersSettingsProps> = ({ onSuccessToast }) => {
  const [banners, setBanners] = useState<IntroBannerItem[]>(getStoredIntroBanners);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingBanner, setEditingBanner] = useState<IntroBannerItem | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [showLivePreview, setShowLivePreview] = useState(false);
  const [showSqlGuide, setShowSqlGuide] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);

  // Form State
  const [formTag, setFormTag] = useState('');
  const [formTitle, setFormTitle] = useState('');
  const [formSubtitle, setFormSubtitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formImageUrl, setFormImageUrl] = useState('');
  const [formAccentColor, setFormAccentColor] = useState('#ff5722');
  const [formTagColor, setFormTagColor] = useState('bg-orange-500/20 text-orange-400 border-orange-500/30');
  const [formHighlights, setFormHighlights] = useState<string[]>(['', '', '']);
  const [formMockupBadge, setFormMockupBadge] = useState('');
  const [formMockupHeadline, setFormMockupHeadline] = useState('');
  const [formActive, setFormActive] = useState(true);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Listen for storage events
  useEffect(() => {
    const handleBannersChanged = (e: any) => {
      if (e.detail && Array.isArray(e.detail)) {
        setBanners(e.detail);
      }
    };
    window.addEventListener('atrios_intro_banners_changed', handleBannersChanged);
    return () => window.removeEventListener('atrios_intro_banners_changed', handleBannersChanged);
  }, []);

  // Sync from Supabase on mount
  useEffect(() => {
    syncFromSupabase();
  }, []);

  const syncFromSupabase = async () => {
    setIsSyncing(true);
    try {
      const fetched = await fetchIntroBannersFromSupabase();
      setBanners(fetched);
      if (onSuccessToast) onSuccessToast('Banners sincronizados com o Supabase com sucesso!');
    } catch (err) {
      console.warn('Erro ao sincronizar banners:', err);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleOpenCreate = () => {
    setIsCreating(true);
    setEditingBanner(null);
    setFormTag('NOVA FUNCIONALIDADE');
    setFormTagColor('bg-orange-500/20 text-orange-400 border-orange-500/30');
    setFormTitle('Novo Banner de Apresentação');
    setFormSubtitle('Descreva o benefício principal desta funcionalidade');
    setFormDescription('Explique aos utilizadores como esta ferramenta vai transformar e facilitar o seu dia a dia na construção civil.');
    setFormImageUrl('');
    setFormAccentColor('#ff5722');
    setFormHighlights(['Funcionalidade 100% prática', 'Disponível no telemóvel e computador', 'Acesso imediato']);
    setFormMockupBadge('DESTAQUE DA PLATAFORMA');
    setFormMockupHeadline('Gestão Inteligente Átrios');
    setFormActive(true);
    setUploadError(null);
  };

  const handleOpenEdit = (banner: IntroBannerItem) => {
    setIsCreating(false);
    setEditingBanner(banner);
    setFormTag(banner.tag || '');
    setFormTagColor(banner.tagColor || 'bg-orange-500/20 text-orange-400 border-orange-500/30');
    setFormTitle(banner.title || '');
    setFormSubtitle(banner.subtitle || '');
    setFormDescription(banner.description || '');
    setFormImageUrl(banner.imageUrl || '');
    setFormAccentColor(banner.accentColor || '#ff5722');
    setFormHighlights(
      banner.highlights && banner.highlights.length > 0 
        ? [...banner.highlights] 
        : ['', '', '']
    );
    setFormMockupBadge(banner.mockupBadge || '');
    setFormMockupHeadline(banner.mockupHeadline || '');
    setFormActive(banner.active ?? true);
    setUploadError(null);
  };

  const handleCloseForm = () => {
    setIsCreating(false);
    setEditingBanner(null);
    setUploadError(null);
  };

  // Image Upload and Compression
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setUploadError('Por favor seleccione um ficheiro de imagem válido (PNG, JPG, WEBP).');
      return;
    }

    setUploadError(null);

    // Read and compress image
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 1200;
        const MAX_HEIGHT = 800;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.85);
          setFormImageUrl(compressedDataUrl);
        } else {
          setFormImageUrl(event.target?.result as string);
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleSaveForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      setUploadError('Por favor insira um título para o banner.');
      return;
    }

    setIsSaving(true);
    setUploadError(null);

    try {
      const cleanedHighlights = formHighlights.filter(h => h.trim().length > 0);

      const bannerPayload: IntroBannerItem = {
        id: editingBanner ? editingBanner.id : `banner_${Date.now()}`,
        tag: formTag.trim() || 'DESTAQUE',
        tagColor: formTagColor,
        title: formTitle.trim(),
        subtitle: formSubtitle.trim(),
        description: formDescription.trim(),
        imageUrl: formImageUrl.trim(),
        accentColor: formAccentColor,
        highlights: cleanedHighlights.length > 0 ? cleanedHighlights : ['Funcionalidade completa', 'Interface intuitiva', 'Sincronização em nuvem'],
        mockupBadge: formMockupBadge.trim() || 'MÓDULO ÁTRIOS',
        mockupHeadline: formMockupHeadline.trim() || formTitle.trim(),
        mockupDetails: editingBanner?.mockupDetails,
        sortOrder: editingBanner ? editingBanner.sortOrder : banners.length,
        active: formActive,
        createdAt: editingBanner?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const res = await saveIntroBanner(bannerPayload);
      if (res.success) {
        setBanners(getStoredIntroBanners());
        handleCloseForm();
        if (onSuccessToast) {
          onSuccessToast(isCreating ? 'Novo banner adicionado e salvo no Supabase!' : 'Banner atualizado com sucesso no Supabase!');
        }
      } else {
        setUploadError('Erro ao guardar banner. Verifique a consola.');
      }
    } catch (err: any) {
      setUploadError(`Erro ao salvar: ${err.message || err}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteBanner = async (id: string, title: string) => {
    if (!window.confirm(`Tem a certeza que deseja eliminar o banner "${title}"?`)) {
      return;
    }

    const res = await deleteIntroBanner(id);
    if (res.success) {
      setBanners(getStoredIntroBanners());
      if (onSuccessToast) onSuccessToast('Banner eliminado com sucesso.');
    }
  };

  const handleToggleActive = async (banner: IntroBannerItem) => {
    const updated = { ...banner, active: !banner.active, updatedAt: new Date().toISOString() };
    await saveIntroBanner(updated);
    setBanners(getStoredIntroBanners());
  };

  const handleMoveOrder = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= banners.length) return;

    const newBanners = [...banners];
    const [moved] = newBanners.splice(index, 1);
    newBanners.splice(targetIndex, 0, moved);

    const reordered = newBanners.map((b, idx) => ({ ...b, sortOrder: idx }));
    setBanners(reordered);
    await saveIntroBannersOrder(reordered);
  };

  const handleResetDefaults = async () => {
    if (!window.confirm('Deseja restaurar todos os 4 banners originais de apresentação em tela cheia? As suas alterações personalizadas serão substituídas pelos padrões.')) {
      return;
    }

    setIsSyncing(true);
    await resetIntroBannersToDefault();
    setBanners(getStoredIntroBanners());
    setIsSyncing(false);
    if (onSuccessToast) onSuccessToast('Banners restaurados para os padrões com sucesso!');
  };

  const sqlSchemaCode = `-- =========================================================
-- TABELA: intro_banners (Supabase)
-- Banners de Apresentação em Tela Cheia do Átrios Build
-- =========================================================

CREATE TABLE IF NOT EXISTS public.intro_banners (
  id TEXT PRIMARY KEY,
  tag TEXT DEFAULT 'OPORTUNIDADES',
  tag_color TEXT DEFAULT 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  title TEXT NOT NULL,
  subtitle TEXT,
  description TEXT,
  image_url TEXT,
  accent_color TEXT DEFAULT '#ff5722',
  highlights JSONB DEFAULT '[]'::jsonb,
  mockup_badge TEXT,
  mockup_headline TEXT,
  mockup_details JSONB DEFAULT '[]'::jsonb,
  sort_order INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT true,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ativar RLS (Row Level Security) e permitir leitura e escrita pública/autenticada
ALTER TABLE public.intro_banners ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Permitir Leitura Pública de intro_banners"
ON public.intro_banners FOR SELECT
USING (true);

CREATE POLICY "Permitir Inserção e Atualização de intro_banners"
ON public.intro_banners FOR ALL
USING (true)
WITH CHECK (true);`;

  const copySqlToClipboard = () => {
    navigator.clipboard.writeText(sqlSchemaCode);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2500);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-16">
      
      {/* HEADER SECTION */}
      <div className="bg-slate-900 border border-white/10 rounded-[2.5rem] p-6 lg:p-8 space-y-6 shadow-2xl relative overflow-hidden">
        
        {/* Glow backdrop */}
        <div className="absolute -right-20 -top-20 w-80 h-80 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-20 -bottom-20 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/30 text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles size={12} /> TABELA SUPABASE: intro_banners
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
                {banners.filter(b => b.active !== false).length} Ativos / {banners.length} Total
              </span>
            </div>
            <h2 className="text-2xl lg:text-3xl font-black italic uppercase text-white tracking-tight flex items-center gap-3">
              <Layers className="text-[#ff5722]" />
              Banners de Apresentação Tela Cheia
            </h2>
            <p className="text-slate-400 text-xs font-medium max-w-3xl leading-relaxed">
              Faça upload de fotos, configure títulos, destaques e cores dos slides em tela cheia que aparecem aos visitantes e clientes antes de aceder à plataforma.
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            
            {/* Live Preview Button */}
            <button
              onClick={() => setShowLivePreview(true)}
              className="px-4 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-orange-500/20 transition-all cursor-pointer active:scale-95"
              title="Testar apresentação tela cheia agora"
            >
              <Eye size={15} />
              <span>Testar Apresentação</span>
            </button>

            {/* Add New Banner Button */}
            <button
              onClick={handleOpenCreate}
              className="px-4 py-2.5 bg-white text-slate-950 hover:bg-slate-100 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer active:scale-95 shadow-md"
            >
              <Plus size={15} />
              <span>Novo Banner</span>
            </button>

            {/* Sync Supabase */}
            <button
              onClick={syncFromSupabase}
              disabled={isSyncing}
              className="px-3.5 py-2.5 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 border border-white/10 transition-all cursor-pointer active:scale-95"
              title="Sincronizar com tabela intro_banners no Supabase"
            >
              <RefreshCw size={14} className={isSyncing ? "animate-spin text-orange-400" : "text-orange-400"} />
              <span>{isSyncing ? 'A Sincronizar...' : 'Sincronizar'}</span>
            </button>

            {/* SQL Guide Toggle */}
            <button
              onClick={() => setShowSqlGuide(!showSqlGuide)}
              className={`p-2.5 rounded-xl text-xs font-black border transition-all cursor-pointer ${
                showSqlGuide 
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' 
                  : 'bg-white/5 text-slate-400 border-white/10 hover:text-white'
              }`}
              title="Ver estrutura SQL da tabela intro_banners"
            >
              <Database size={15} />
            </button>
          </div>
        </div>

        {/* SQL Guide Collapsible */}
        {showSqlGuide && (
          <div className="bg-slate-950/80 border border-amber-500/30 rounded-2xl p-5 space-y-3 animate-in fade-in duration-300">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Database size={16} className="text-amber-400" />
                <span className="text-xs font-black uppercase tracking-wider text-amber-300">
                  Estrutura da Tabela Supabase (intro_banners)
                </span>
              </div>
              <button
                onClick={copySqlToClipboard}
                className="px-3 py-1 bg-amber-500/20 hover:bg-amber-500 text-amber-300 hover:text-slate-950 rounded-lg text-[11px] font-black uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                {copiedSql ? <Check size={13} /> : <Copy size={13} />}
                {copiedSql ? 'Copiado!' : 'Copiar SQL'}
              </button>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Caso precise criar ou ajustar as colunas no painel do Supabase SQL Editor, execute o script abaixo:
            </p>
            <pre className="p-3.5 rounded-xl bg-slate-950 text-emerald-400 font-mono text-[11px] overflow-x-auto border border-white/5 max-h-48 no-scrollbar select-all">
              {sqlSchemaCode}
            </pre>
          </div>
        )}

        {/* IDEAL IMAGE DIMENSIONS & GUIDELINES CARD */}
        <div className="bg-slate-950/90 border border-orange-500/30 rounded-2xl p-4 sm:p-5 shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between gap-2 pb-3 border-b border-white/10 flex-wrap">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-orange-500/20 text-orange-400 border border-orange-500/30 flex items-center justify-center">
                <Ruler size={16} />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-black uppercase text-white tracking-wide flex items-center gap-2">
                  <span>Tamanho e Resolução Ideal das Imagens (Tela Cheia)</span>
                  <span className="px-2 py-0.5 rounded-md bg-orange-500/20 text-orange-400 text-[10px] font-bold">16:9 Widescreen</span>
                </h4>
                <p className="text-[11px] text-slate-400">
                  Para garantir nitidez perfeita e adaptação impecável em monitores, portáteis, tablets e telemóveis.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-1 rounded-lg">
              <Monitor size={13} />
              <span>Full HD / 2K Ready</span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3.5">
            <div className="bg-slate-900/80 p-3 rounded-xl border border-white/5 space-y-1">
              <span className="text-[10px] font-black uppercase text-slate-400 block">Resolução Recomendada</span>
              <span className="text-xs sm:text-sm font-black text-white font-mono block text-orange-400">1920 × 1080 px</span>
              <span className="text-[10px] text-slate-400 block">(Ou 2560 × 1440 px para 2K)</span>
            </div>

            <div className="bg-slate-900/80 p-3 rounded-xl border border-white/5 space-y-1">
              <span className="text-[10px] font-black uppercase text-slate-400 block">Proporção (Aspect Ratio)</span>
              <span className="text-xs sm:text-sm font-black text-white font-mono block text-amber-400">16:9 (Horizontal)</span>
              <span className="text-[10px] text-slate-400 block">Preenchimento total do ecrã</span>
            </div>

            <div className="bg-slate-900/80 p-3 rounded-xl border border-white/5 space-y-1">
              <span className="text-[10px] font-black uppercase text-slate-400 block">Formatos Aceites</span>
              <span className="text-xs sm:text-sm font-black text-white font-mono block text-emerald-400">JPG, PNG, WEBP</span>
              <span className="text-[10px] text-slate-400 block">Comprime automaticamente</span>
            </div>

            <div className="bg-slate-900/80 p-3 rounded-xl border border-white/5 space-y-1">
              <span className="text-[10px] font-black uppercase text-slate-400 block">Peso Máximo do Ficheiro</span>
              <span className="text-xs sm:text-sm font-black text-white font-mono block text-blue-400">Até 2 MB</span>
              <span className="text-[10px] text-slate-400 block">Carregamento ultrarrápido</span>
            </div>
          </div>

          <div className="mt-3 pt-2.5 border-t border-white/5 flex items-center gap-2 text-[11px] text-slate-400">
            <Info size={14} className="text-orange-400 shrink-0" />
            <span>
              <strong>Dica de Enquadramento:</strong> Os banners utilizam preenchimento total de ecrã (<em>object-cover</em>). Mantenha o assunto principal e áreas de foco no centro da imagem para garantir corte harmonioso em qualquer proporção de ecrã (inclusive smartphones na vertical).
            </span>
          </div>
        </div>

      </div>

      {/* BANNER EDIT / CREATE FORM MODAL OR PANEL */}
      {(isCreating || editingBanner) && (
        <div className="bg-slate-900 border-2 border-orange-500/60 rounded-[2.5rem] p-6 lg:p-8 space-y-6 shadow-2xl animate-in zoom-in-95 duration-300">
          
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-500/20 text-orange-400 border border-orange-500/30 flex items-center justify-center font-black">
                {isCreating ? <Plus size={20} /> : <Edit3 size={20} />}
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-black text-white uppercase tracking-tight">
                  {isCreating ? 'Criar Novo Banner de Apresentação' : `Editar Banner: ${editingBanner?.title}`}
                </h3>
                <span className="text-xs text-slate-400 font-medium">
                  Preencha os campos abaixo e faça upload da imagem de destaque.
                </span>
              </div>
            </div>

            <button
              onClick={handleCloseForm}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSaveForm} className="space-y-6">
            
            {uploadError && (
              <div className="p-4 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-bold flex items-center gap-2">
                <AlertCircle size={16} />
                <span>{uploadError}</span>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Left Column: Form Info */}
              <div className="lg:col-span-7 space-y-4">
                
                {/* Tag & Color Selection */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                      Etiqueta / Tag da Categoria
                    </label>
                    <input
                      type="text"
                      required
                      value={formTag}
                      onChange={e => setFormTag(e.target.value.toUpperCase())}
                      placeholder="Ex: NOVIDADE, ORÇAMENTOS, GESTÃO"
                      className="w-full px-4 py-2.5 bg-slate-950 border border-white/10 rounded-xl text-xs font-bold text-white outline-none focus:border-orange-500 transition-colors"
                    />
                    {/* Quick Tag suggestions */}
                    <div className="flex flex-wrap gap-1 pt-1">
                      {TAG_SUGGESTIONS.slice(0, 4).map((tag, tIdx) => (
                        <button
                          key={tIdx}
                          type="button"
                          onClick={() => setFormTag(tag)}
                          className="px-2 py-0.5 rounded-md bg-white/5 hover:bg-white/10 text-[9px] font-bold text-slate-400 hover:text-white transition-colors"
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                      Cor de Destaque (Accent Color)
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={formAccentColor}
                        onChange={e => setFormAccentColor(e.target.value)}
                        className="w-10 h-10 rounded-xl bg-transparent border-0 cursor-pointer"
                      />
                      <div className="flex-1 flex items-center gap-1.5 overflow-x-auto py-1">
                        {COLOR_PRESETS.map((preset, pIdx) => (
                          <button
                            key={pIdx}
                            type="button"
                            onClick={() => {
                              setFormAccentColor(preset.value);
                              setFormTagColor(preset.tagClass);
                            }}
                            className={`w-6 h-6 rounded-full shrink-0 border-2 transition-transform ${
                              formAccentColor === preset.value ? 'scale-125 border-white shadow-md' : 'border-transparent opacity-70 hover:opacity-100'
                            }`}
                            style={{ backgroundColor: preset.value }}
                            title={preset.label}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Title */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                    Título Principal do Slide
                  </label>
                  <input
                    type="text"
                    required
                    value={formTitle}
                    onChange={e => setFormTitle(e.target.value)}
                    placeholder="Ex: Encontre Novos Clientes e Receba Pedidos de Obra"
                    className="w-full px-4 py-3 bg-slate-950 border border-white/10 rounded-xl text-sm font-bold text-white outline-none focus:border-orange-500 transition-colors"
                  />
                </div>

                {/* Subtitle / Description */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                    Subtítulo Resumido
                  </label>
                  <input
                    type="text"
                    value={formSubtitle}
                    onChange={e => setFormSubtitle(e.target.value)}
                    placeholder="Ex: Conectamos clientes particulares a profissionais de topo."
                    className="w-full px-4 py-2.5 bg-slate-950 border border-white/10 rounded-xl text-xs font-bold text-white outline-none focus:border-orange-500 transition-colors"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                    Descrição Detalhada
                  </label>
                  <textarea
                    rows={3}
                    value={formDescription}
                    onChange={e => setFormDescription(e.target.value)}
                    placeholder="Explicação mais completa da funcionalidade..."
                    className="w-full px-4 py-2.5 bg-slate-950 border border-white/10 rounded-xl text-xs font-medium text-white outline-none focus:border-orange-500 transition-colors resize-none leading-relaxed"
                  />
                </div>

                {/* Highlights (3 bullet points) */}
                <div className="space-y-2 pt-1">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                    3 Pontos Chave com Visto (Highlights)
                  </label>
                  {formHighlights.map((hl, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                        <CheckCircle2 size={14} />
                      </div>
                      <input
                        type="text"
                        value={hl}
                        onChange={e => {
                          const updated = [...formHighlights];
                          updated[idx] = e.target.value;
                          setFormHighlights(updated);
                        }}
                        placeholder={`Ponto chave #${idx + 1}`}
                        className="flex-1 px-3 py-2 bg-slate-950 border border-white/10 rounded-xl text-xs font-medium text-white outline-none focus:border-orange-500 transition-colors"
                      />
                    </div>
                  ))}
                </div>

              </div>

              {/* Right Column: Image Upload & Mockup Config */}
              <div className="lg:col-span-5 space-y-4">
                
                {/* IMAGE UPLOAD SECTION */}
                <div className="p-5 rounded-2xl bg-slate-950 border border-white/10 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                      <ImageIcon size={14} className="text-orange-400" />
                      Imagem / Foto do Banner
                    </label>
                    {formImageUrl && (
                      <button
                        type="button"
                        onClick={() => setFormImageUrl('')}
                        className="text-[10px] text-rose-400 hover:text-rose-300 font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <Trash2 size={12} /> Remover Imagem
                      </button>
                    )}
                  </div>

                  {/* Dimension recommendation pill */}
                  <div className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-orange-500/10 border border-orange-500/20 text-[10px] text-orange-300">
                    <span className="font-bold flex items-center gap-1">
                      <Ruler size={12} /> Tamanho Ideal: <strong>1920 × 1080 px</strong>
                    </span>
                    <span className="font-mono bg-orange-500/20 px-1.5 py-0.5 rounded text-orange-200 font-bold">16:9 Widescreen</span>
                  </div>

                  {/* Upload Box / Dropzone */}
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className={`relative border-2 border-dashed rounded-2xl p-4 text-center cursor-pointer transition-all ${
                      formImageUrl 
                        ? 'border-orange-500/40 bg-orange-500/5 hover:border-orange-500' 
                        : 'border-white/20 bg-white/5 hover:border-orange-500 hover:bg-white/10'
                    }`}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageFileChange}
                      className="hidden"
                    />

                    {formImageUrl ? (
                      <div className="space-y-2">
                        <div className="relative max-h-44 rounded-xl overflow-hidden shadow-md border border-white/10 mx-auto">
                          <img
                            src={formImageUrl}
                            alt="Pré-visualização do banner"
                            className="w-full h-36 object-cover"
                          />
                        </div>
                        <span className="text-[11px] text-emerald-400 font-bold block">
                          ✓ Imagem carregada e pronta para o Supabase
                        </span>
                        <span className="text-[10px] text-slate-400 block">
                          Clique para alterar a imagem (1920×1080 recomendado)
                        </span>
                      </div>
                    ) : (
                      <div className="py-4 space-y-2">
                        <div className="w-12 h-12 rounded-2xl bg-orange-500/20 text-orange-400 flex items-center justify-center mx-auto shadow-md">
                          <Upload size={22} />
                        </div>
                        <div>
                          <span className="text-xs font-black text-white block">
                            Clique para fazer upload de imagem
                          </span>
                          <span className="text-[10px] text-slate-400 block mt-0.5">
                            Ideal: <strong>1920×1080px (16:9)</strong> • JPG, PNG, WEBP (Máx 2MB)
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Or Direct URL */}
                  <div className="space-y-1">
                    <span className="text-[9px] font-bold text-slate-500 uppercase">
                      Ou insira o URL direto da imagem:
                    </span>
                    <input
                      type="url"
                      value={formImageUrl}
                      onChange={e => setFormImageUrl(e.target.value)}
                      placeholder="https://exemplo.com/minha-imagem.jpg"
                      className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-xl text-xs font-mono text-slate-300 outline-none focus:border-orange-500"
                    />
                  </div>
                </div>

                {/* Mockup Fallback Settings (if no image is uploaded) */}
                <div className="p-5 rounded-2xl bg-slate-950 border border-white/10 space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-300 block">
                    Etiqueta & Headline do Card Visual
                  </label>
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={formMockupBadge}
                      onChange={e => setFormMockupBadge(e.target.value)}
                      placeholder="Ex: NOVO PEDIDO DISPONÍVEL"
                      className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-xl text-xs font-bold text-white outline-none focus:border-orange-500"
                    />
                    <input
                      type="text"
                      value={formMockupHeadline}
                      onChange={e => setFormMockupHeadline(e.target.value)}
                      placeholder="Ex: Remodelação Geral de Moradia T3"
                      className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-xl text-xs font-bold text-white outline-none focus:border-orange-500"
                    />
                  </div>
                </div>

                {/* Active Toggle */}
                <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-950 border border-white/10">
                  <div>
                    <span className="text-xs font-bold text-white block">Status do Banner</span>
                    <span className="text-[10px] text-slate-400 block">Visível na apresentação tela cheia</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFormActive(!formActive)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                      formActive 
                        ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20' 
                        : 'bg-slate-800 text-slate-400 border border-white/10'
                    }`}
                  >
                    {formActive ? '🟢 Ativo' : '⚪ Oculto'}
                  </button>
                </div>

              </div>

            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
              <button
                type="button"
                onClick={handleCloseForm}
                className="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
              >
                Cancelar
              </button>

              <button
                type="submit"
                disabled={isSaving}
                className="px-6 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-orange-500/25 transition-all cursor-pointer active:scale-95 disabled:opacity-50"
              >
                {isSaving ? (
                  <>
                    <RefreshCw size={14} className="animate-spin" />
                    <span>A Salvar no Supabase...</span>
                  </>
                ) : (
                  <>
                    <Check size={14} />
                    <span>Salvar no Supabase</span>
                  </>
                )}
              </button>
            </div>

          </form>

        </div>
      )}

      {/* BANNERS LIST TABLE / CARDS */}
      <div className="space-y-4">
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-base sm:text-lg font-black text-white uppercase tracking-tight">
              Banners Cadastrados ({banners.length})
            </h3>
            <span className="text-xs text-slate-400 font-medium hidden sm:inline">
              • A ordem abaixo é a mesma exibida na apresentação
            </span>
          </div>

          <button
            onClick={handleResetDefaults}
            className="text-[11px] text-slate-400 hover:text-amber-300 font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <RotateCcw size={12} />
            <span>Restaurar Padrões</span>
          </button>
        </div>

        {banners.length === 0 ? (
          <div className="p-12 text-center bg-slate-900 border border-white/10 rounded-3xl space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-orange-500/20 text-orange-400 flex items-center justify-center mx-auto">
              <Layers size={28} />
            </div>
            <div>
              <h4 className="text-base font-black text-white uppercase">Nenhum banner cadastrado</h4>
              <p className="text-xs text-slate-400 mt-1">
                Clique no botão abaixo para restaurar os 4 banners originais de tela cheia ou criar um novo.
              </p>
            </div>
            <button
              onClick={handleResetDefaults}
              className="px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-black uppercase tracking-wider"
            >
              Restaurar Banners Padrão
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {banners.map((banner, index) => (
              <div 
                key={banner.id}
                className={`p-5 rounded-3xl border transition-all duration-300 bg-slate-900 ${
                  banner.active !== false 
                    ? 'border-white/10 hover:border-orange-500/40 shadow-xl' 
                    : 'border-white/5 opacity-60 bg-slate-950'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
                  
                  {/* Left: Order, Thumbnail & Content */}
                  <div className="flex items-start sm:items-center gap-4 flex-1">
                    
                    {/* Order Controls */}
                    <div className="flex flex-col items-center gap-1 shrink-0">
                      <button
                        onClick={() => handleMoveOrder(index, 'up')}
                        disabled={index === 0}
                        className="p-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-slate-400 hover:text-white disabled:opacity-20 transition-colors cursor-pointer"
                        title="Subir ordem"
                      >
                        <ArrowUp size={14} />
                      </button>
                      <span className="text-xs font-mono font-black text-slate-400">
                        {String(index + 1).padStart(2, '0')}
                      </span>
                      <button
                        onClick={() => handleMoveOrder(index, 'down')}
                        disabled={index === banners.length - 1}
                        className="p-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-slate-400 hover:text-white disabled:opacity-20 transition-colors cursor-pointer"
                        title="Descer ordem"
                      >
                        <ArrowDown size={14} />
                      </button>
                    </div>

                    {/* Image Thumbnail or Icon */}
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-slate-950 border border-white/10 overflow-hidden shrink-0 flex items-center justify-center relative group">
                      {banner.imageUrl ? (
                        <img
                          src={banner.imageUrl}
                          alt={banner.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div 
                          className="w-full h-full flex flex-col items-center justify-center p-2 text-center"
                          style={{ backgroundColor: `${banner.accentColor || '#ff5722'}15` }}
                        >
                          <Layers size={22} style={{ color: banner.accentColor || '#ff5722' }} />
                          <span className="text-[8px] font-bold text-slate-400 uppercase mt-1">Mockup</span>
                        </div>
                      )}
                      
                      {/* Color strip indicator */}
                      <div 
                        className="absolute bottom-0 inset-x-0 h-1.5"
                        style={{ backgroundColor: banner.accentColor || '#ff5722' }}
                      />
                    </div>

                    {/* Text Details */}
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`px-2.5 py-0.5 rounded-full border text-[10px] font-black uppercase tracking-wider ${banner.tagColor || 'bg-orange-500/20 text-orange-400 border-orange-500/30'}`}>
                          {banner.tag}
                        </span>
                        {banner.active !== false ? (
                          <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Ativo
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-500 font-bold">
                            ⚪ Oculto
                          </span>
                        )}
                        {banner.imageUrl && (
                          <span className="px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[9px] font-bold">
                            🖼️ Imagem Personalizada
                          </span>
                        )}
                      </div>

                      <h4 className="text-sm sm:text-base font-black text-white leading-snug truncate">
                        {banner.title}
                      </h4>

                      <p className="text-xs text-slate-400 line-clamp-1">
                        {banner.description}
                      </p>

                      {banner.highlights && banner.highlights.length > 0 && (
                        <div className="flex items-center gap-3 pt-0.5 text-[11px] text-slate-300 font-medium overflow-x-auto no-scrollbar">
                          {banner.highlights.slice(0, 2).map((hl, hIdx) => (
                            <span key={hIdx} className="flex items-center gap-1 shrink-0">
                              <Check size={12} className="text-emerald-400" />
                              <span className="truncate max-w-[200px]">{hl}</span>
                            </span>
                          ))}
                          {banner.highlights.length > 2 && (
                            <span className="text-slate-500 font-bold shrink-0">
                              +{banner.highlights.length - 2}
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                  </div>

                  {/* Right Action Controls */}
                  <div className="flex items-center justify-end gap-2 shrink-0 border-t lg:border-t-0 border-white/5 pt-3 lg:pt-0">
                    
                    {/* Toggle Active Button */}
                    <button
                      onClick={() => handleToggleActive(banner)}
                      className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        banner.active !== false
                          ? 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-white/5 hover:bg-white/10 text-slate-400'
                      }`}
                      title={banner.active !== false ? "Clique para ocultar" : "Clique para ativar"}
                    >
                      {banner.active !== false ? 'Desativar' : 'Ativar'}
                    </button>

                    {/* Edit Button */}
                    <button
                      onClick={() => handleOpenEdit(banner)}
                      className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/15 text-white text-xs font-black uppercase tracking-wider flex items-center gap-1.5 border border-white/10 transition-all cursor-pointer"
                    >
                      <Edit3 size={14} />
                      <span>Editar</span>
                    </button>

                    {/* Delete Button */}
                    <button
                      onClick={() => handleDeleteBanner(banner.id, banner.title)}
                      className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/25 text-rose-400 hover:text-rose-300 border border-rose-500/20 transition-all cursor-pointer"
                      title="Excluir banner"
                    >
                      <Trash2 size={16} />
                    </button>

                  </div>

                </div>
              </div>
            ))}
          </div>
        )}

      </div>

      {/* FULLSCREEN REAL-TIME LIVE PREVIEW MODAL */}
      {showLivePreview && (
        <FullscreenIntroBanner
          onFinish={() => setShowLivePreview(false)}
        />
      )}

    </div>
  );
};

export default MasterIntroBannersSettings;
