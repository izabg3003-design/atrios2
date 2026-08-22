import React, { useState, useEffect, useRef } from 'react';
import { 
  Image as ImageIcon, 
  Upload, 
  Trash2, 
  Plus, 
  Check, 
  MoveUp, 
  MoveDown, 
  Eye, 
  RefreshCw, 
  Sparkles, 
  Layers, 
  CheckCircle2, 
  AlertCircle,
  Link as LinkIcon,
  HelpCircle,
  FileImage,
  ArrowRight,
  ExternalLink,
  Database,
  Copy
} from 'lucide-react';
import { IntroBanner } from '../types';
import { 
  getStoredIntroBanners, 
  saveIntroBanners, 
  resetIntroBanners, 
  fetchIntroBannersFromCloud,
  DEFAULT_INTRO_BANNERS 
} from '../services/storage';

interface MasterIntroBannersSettingsProps {
  onSuccessToast?: (msg: string) => void;
}

export const MasterIntroBannersSettings: React.FC<MasterIntroBannersSettingsProps> = ({ onSuccessToast }) => {
  const [banners, setBanners] = useState<IntroBanner[]>(getStoredIntroBanners);
  const [editingBannerId, setEditingBannerId] = useState<string | null>(null);
  const [showSqlModal, setShowSqlModal] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);
  
  // Form fields state
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [badge, setBadge] = useState('');
  const [ctaText, setCtaText] = useState('Próximo');
  const [imageUrl, setImageUrl] = useState('');
  
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [previewBanner, setPreviewBanner] = useState<IntroBanner | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchIntroBannersFromCloud().then((cloudList) => {
      if (Array.isArray(cloudList) && cloudList.length > 0) {
        setBanners(cloudList);
      } else {
        setBanners(getStoredIntroBanners());
      }
    });
  }, []);

  const handleSelectBannerForEdit = (b: IntroBanner) => {
    setEditingBannerId(b.id);
    setTitle(b.title || '');
    setSubtitle(b.subtitle || '');
    setBadge(b.badge || '');
    setCtaText(b.ctaText || 'Próximo');
    setImageUrl(b.imageUrl || '');
    setFeedback(null);
  };

  const handleResetForm = () => {
    setEditingBannerId(null);
    setTitle('');
    setSubtitle('');
    setBadge('');
    setCtaText('Próximo');
    setImageUrl('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setFeedback({ type: 'error', message: 'Por favor, selecione um arquivo de imagem válido (JPG, PNG, WEBP).' });
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setFeedback({ type: 'error', message: 'A imagem deve ter no máximo 2MB para garantir carregamento instantâneo.' });
      return;
    }

    setIsUploading(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setImageUrl(base64);
      setIsUploading(false);
      setFeedback({ type: 'success', message: 'Imagem carregada com sucesso!' });
    };
    reader.onerror = () => {
      setIsUploading(false);
      setFeedback({ type: 'error', message: 'Erro ao processar o arquivo de imagem.' });
    };
    reader.readAsDataURL(file);
  };

  const handleSaveBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setFeedback({ type: 'error', message: 'Por favor, informe o título principal do banner.' });
      return;
    }
    if (!imageUrl.trim()) {
      setFeedback({ type: 'error', message: 'Por favor, adicione uma imagem ou faça o upload de um banner.' });
      return;
    }

    setIsSaving(true);
    let updatedList: IntroBanner[];

    if (editingBannerId) {
      // Atualizar existente
      updatedList = banners.map(b => {
        if (b.id === editingBannerId) {
          return {
            ...b,
            title: title.trim(),
            subtitle: subtitle.trim() || undefined,
            badge: badge.trim() || undefined,
            ctaText: ctaText.trim() || undefined,
            imageUrl: imageUrl.trim()
          };
        }
        return b;
      });
    } else {
      // Criar novo banner
      const newBanner: IntroBanner = {
        id: `banner-${Date.now()}`,
        title: title.trim(),
        subtitle: subtitle.trim() || undefined,
        badge: badge.trim() || undefined,
        ctaText: ctaText.trim() || undefined,
        imageUrl: imageUrl.trim(),
        order: banners.length + 1,
        active: true,
        createdAt: new Date().toISOString()
      };
      updatedList = [...banners, newBanner];
    }

    const result = await saveIntroBanners(updatedList);
    setIsSaving(false);

    if (result.success) {
      setBanners(updatedList);
      handleResetForm();
      const msg = editingBannerId ? 'Banner atualizado com sucesso!' : 'Novo banner adicionado com sucesso!';
      setFeedback({ type: 'success', message: msg });
      if (onSuccessToast) onSuccessToast(msg);
    } else {
      setFeedback({ type: 'error', message: 'Erro ao salvar configurações do banner.' });
    }
  };

  const handleDeleteBanner = async (id: string) => {
    if (banners.length <= 1) {
      alert('É necessário manter pelo menos 1 banner configurado para a apresentação inicial.');
      return;
    }

    if (!window.confirm('Tem certeza que deseja excluir este banner da apresentação inicial?')) {
      return;
    }

    const updated = banners.filter(b => b.id !== id).map((b, idx) => ({ ...b, order: idx + 1 }));
    const result = await saveIntroBanners(updated);
    if (result.success) {
      setBanners(updated);
      if (editingBannerId === id) handleResetForm();
      setFeedback({ type: 'success', message: 'Banner excluído com sucesso!' });
    }
  };

  const handleToggleActive = async (id: string) => {
    const updated = banners.map(b => b.id === id ? { ...b, active: !b.active } : b);
    const result = await saveIntroBanners(updated);
    if (result.success) {
      setBanners(updated);
    }
  };

  const handleMove = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= banners.length) return;

    const list = [...banners];
    const item = list.splice(index, 1)[0];
    list.splice(targetIndex, 0, item);

    const reordered = list.map((b, idx) => ({ ...b, order: idx + 1 }));
    setBanners(reordered);
    await saveIntroBanners(reordered);
  };

  const handleRestoreDefaults = async () => {
    if (!window.confirm('Deseja restaurar os banners padrão da ÁTRIOS BUILD? Suas alterações manuais serão substituídas pelos modelos iniciais.')) {
      return;
    }
    const result = await resetIntroBanners();
    if (result.success) {
      setBanners(DEFAULT_INTRO_BANNERS);
      handleResetForm();
      setFeedback({ type: 'success', message: 'Banners padrão restaurados com sucesso!' });
      if (onSuccessToast) onSuccessToast('Banners padrão restaurados!');
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header Info Box */}
      <div className="bg-gradient-to-r from-amber-500/15 via-slate-900 to-slate-900 border border-amber-500/30 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xl">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/30 shadow-inner">
            <Layers size={28} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-black uppercase tracking-wider">
                Apresentação Inicial (Intro)
              </span>
              <span className="text-xs text-slate-400 font-bold">
                {banners.filter(b => b.active).length} Ativos / {banners.length} Total
              </span>
            </div>
            <h2 className="text-2xl font-black text-white italic tracking-tight mt-1">
              Gestão de Banners de Início
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl mt-1 leading-relaxed">
              Faça o upload ou adicione imagens/banners para a apresentação interativa inicial exibida aos visitantes antes da Landing Page.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setShowSqlModal(true)}
            className="px-4 py-2.5 rounded-xl bg-amber-500/20 hover:bg-amber-500 text-amber-300 hover:text-slate-950 border border-amber-500/40 text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer active:scale-95 shrink-0"
            title="Ver SQL para o Supabase"
          >
            <Database size={14} /> SQL Supabase
          </button>

          <button
            type="button"
            onClick={handleRestoreDefaults}
            className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer active:scale-95 shrink-0"
          >
            <RefreshCw size={14} /> Restaurar Padrões
          </button>
        </div>
      </div>

      {feedback && (
        <div className={`p-4 rounded-2xl border flex items-center gap-3 animate-in slide-in-from-top duration-300 ${
          feedback.type === 'success' 
            ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300' 
            : 'bg-red-500/15 border-red-500/30 text-red-300'
        }`}>
          {feedback.type === 'success' ? <CheckCircle2 size={20} className="shrink-0" /> : <AlertCircle size={20} className="shrink-0" />}
          <p className="text-xs sm:text-sm font-bold">{feedback.message}</p>
        </div>
      )}

      {/* Main Grid: Upload & Edit Form + Banner Carousel List */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Banner Form & Upload Box */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-slate-900/90 border border-white/10 rounded-3xl p-6 sm:p-7 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <h3 className="text-base font-black text-white uppercase tracking-wider flex items-center gap-2">
                {editingBannerId ? <Sparkles size={18} className="text-amber-400" /> : <Plus size={18} className="text-amber-400" />}
                {editingBannerId ? 'Editar Banner Selecionado' : 'Fazer Upload de Novo Banner'}
              </h3>
              {editingBannerId && (
                <button
                  type="button"
                  onClick={handleResetForm}
                  className="text-[11px] text-slate-400 hover:text-amber-400 font-bold uppercase transition-colors"
                >
                  Cancelar Edição
                </button>
              )}
            </div>

            <form onSubmit={handleSaveBanner} className="space-y-4">
              {/* Image Upload Drag & Drop Area */}
              <div className="space-y-2">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-wider flex items-center justify-between">
                  <span>Imagem / Arte do Banner *</span>
                  <span className="text-slate-500 text-[10px] lowercase">recomendado: 16:9 ou 1600x900px</span>
                </label>

                {imageUrl ? (
                  <div className="relative group rounded-2xl overflow-hidden border border-amber-500/40 bg-slate-950 aspect-video flex items-center justify-center">
                    <img 
                      src={imageUrl} 
                      alt="Banner Preview" 
                      className="w-full h-full object-cover" 
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-slate-950/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 backdrop-blur-xs">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-3.5 py-2 rounded-xl bg-amber-500 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-lg active:scale-95"
                      >
                        <Upload size={14} /> Trocar Imagem
                      </button>
                      <button
                        type="button"
                        onClick={() => setImageUrl('')}
                        className="p-2 rounded-xl bg-red-500/80 text-white font-black text-xs uppercase tracking-wider flex items-center shadow-lg hover:bg-red-500 active:scale-95"
                        title="Remover Imagem"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-white/15 hover:border-amber-400/60 rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all bg-slate-950/50 hover:bg-slate-950/80 group aspect-video"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-white/5 group-hover:bg-amber-500/20 text-slate-400 group-hover:text-amber-400 flex items-center justify-center transition-all mb-3 border border-white/10 group-hover:border-amber-500/30">
                      <Upload size={22} className="group-hover:-translate-y-0.5 transition-transform" />
                    </div>
                    <p className="text-xs font-black text-white uppercase tracking-wider">
                      Clique para fazer Upload da Imagem
                    </p>
                    <p className="text-[11px] text-slate-400 mt-1">
                      PNG, JPG, WEBP até 2MB
                    </p>
                  </div>
                )}

                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileUpload} 
                  accept="image/png, image/jpeg, image/webp" 
                  className="hidden" 
                />

                {/* Alternative Direct URL Input */}
                <div className="pt-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-slate-500 font-bold uppercase">Ou link direto de imagem (URL):</span>
                  </div>
                  <div className="relative mt-1">
                    <LinkIcon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type="url"
                      placeholder="https://exemplo.com/banner.jpg"
                      value={imageUrl.startsWith('data:') ? '' : imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-white/10 rounded-xl text-xs text-white placeholder-slate-600 focus:border-amber-400 focus:outline-hidden"
                    />
                  </div>
                </div>
              </div>

              {/* Title Field */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-wider">
                  Título do Banner *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Gestão de Orçamentos Profissionais"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-white/10 rounded-xl text-sm font-bold text-white placeholder-slate-600 focus:border-amber-400 focus:outline-hidden"
                />
              </div>

              {/* Subtitle Field */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-wider">
                  Subtítulo / Descrição (Opcional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Ex: Elabore propostas completas em menos de 2 minutos e envie no WhatsApp."
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-white/10 rounded-xl text-xs text-white placeholder-slate-600 focus:border-amber-400 focus:outline-hidden resize-none"
                />
              </div>

              {/* Badge & CTA text */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-wider">
                    Etiqueta / Badge
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Inovação & Obras"
                    value={badge}
                    onChange={(e) => setBadge(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-950 border border-white/10 rounded-xl text-xs text-white placeholder-slate-600 focus:border-amber-400 focus:outline-hidden"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-wider">
                    Texto do Botão
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Próximo / Aceder"
                    value={ctaText}
                    onChange={(e) => setCtaText(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-950 border border-white/10 rounded-xl text-xs text-white placeholder-slate-600 focus:border-amber-400 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center gap-3">
                <button
                  type="submit"
                  disabled={isSaving || isUploading}
                  className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 disabled:opacity-50"
                >
                  <Check size={16} />
                  <span>{editingBannerId ? 'Salvar Alterações' : 'Adicionar Banner'}</span>
                </button>

                {editingBannerId && (
                  <button
                    type="button"
                    onClick={handleResetForm}
                    className="py-3 px-4 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-bold text-xs uppercase tracking-wider transition-colors"
                  >
                    Novo
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>

        {/* Right Column: Ordered Banners List with Controls */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between pb-1">
            <h3 className="text-base font-black text-white uppercase tracking-wider flex items-center gap-2">
              <FileImage size={18} className="text-amber-400" />
              Banners Ativos na Apresentação ({banners.length})
            </h3>
            <span className="text-xs text-slate-400">
              Arraste ou use as setas para reordenar
            </span>
          </div>

          <div className="space-y-3">
            {banners.map((banner, index) => {
              const isFirst = index === 0;
              const isLast = index === banners.length - 1;
              const isSelected = editingBannerId === banner.id;

              return (
                <div
                  key={banner.id}
                  className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                    isSelected 
                      ? 'bg-amber-500/10 border-amber-400 shadow-xl shadow-amber-500/10' 
                      : banner.active 
                        ? 'bg-slate-900/80 hover:bg-slate-900 border-white/10' 
                        : 'bg-slate-950/40 border-white/5 opacity-60'
                  }`}
                >
                  {/* Thumbnail & Info */}
                  <div className="flex items-center gap-3.5 flex-1 min-w-0">
                    <div className="relative w-24 sm:w-28 h-16 rounded-xl overflow-hidden bg-slate-950 border border-white/10 shrink-0 group">
                      <img
                        src={banner.imageUrl}
                        alt={banner.title}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                      <span className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded-md bg-slate-950/80 text-white font-mono text-[9px] font-black">
                        #{index + 1}
                      </span>
                    </div>

                    <div className="min-w-0 space-y-1">
                      <div className="flex items-center gap-2">
                        {banner.badge && (
                          <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 text-[10px] font-black uppercase tracking-wider">
                            {banner.badge}
                          </span>
                        )}
                        <span className={`text-[10px] font-bold uppercase ${banner.active ? 'text-emerald-400' : 'text-slate-500'}`}>
                          {banner.active ? '● Ativo' : '○ Inativo'}
                        </span>
                      </div>
                      <h4 className="text-sm font-black text-white truncate">
                        {banner.title}
                      </h4>
                      {banner.subtitle && (
                        <p className="text-xs text-slate-400 line-clamp-1">
                          {banner.subtitle}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Actions & Reordering Controls */}
                  <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                    {/* Order Up/Down */}
                    <button
                      type="button"
                      onClick={() => handleMove(index, 'up')}
                      disabled={isFirst}
                      className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white disabled:opacity-20 disabled:cursor-not-allowed transition-all"
                      title="Mover para Cima"
                    >
                      <MoveUp size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleMove(index, 'down')}
                      disabled={isLast}
                      className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white disabled:opacity-20 disabled:cursor-not-allowed transition-all"
                      title="Mover para Baixo"
                    >
                      <MoveDown size={14} />
                    </button>

                    {/* Preview Modal Trigger */}
                    <button
                      type="button"
                      onClick={() => setPreviewBanner(banner)}
                      className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all"
                      title="Visualizar Banner"
                    >
                      <Eye size={14} />
                    </button>

                    {/* Edit Form Trigger */}
                    <button
                      type="button"
                      onClick={() => handleSelectBannerForEdit(banner)}
                      className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500 text-amber-300 hover:text-slate-950 font-black text-xs uppercase tracking-wider transition-all"
                    >
                      Editar
                    </button>

                    {/* Active Switch */}
                    <button
                      type="button"
                      onClick={() => handleToggleActive(banner.id)}
                      className={`px-2.5 py-1.5 rounded-xl text-xs font-black uppercase transition-all ${
                        banner.active 
                          ? 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30' 
                          : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                      }`}
                      title={banner.active ? "Desativar Banner" : "Ativar Banner"}
                    >
                      {banner.active ? 'Ativo' : 'Oculto'}
                    </button>

                    {/* Delete */}
                    <button
                      type="button"
                      onClick={() => handleDeleteBanner(banner.id)}
                      className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-all"
                      title="Excluir Banner"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* SQL Supabase Query Modal */}
      {showSqlModal && (
        <div className="fixed inset-0 z-[10005] bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-in fade-in">
          <div className="bg-slate-900 border border-amber-500/40 rounded-3xl max-w-3xl w-full overflow-hidden shadow-2xl space-y-4 p-6 flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                  <Database size={20} />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">
                    Query SQL para Tabela de Banners no Supabase
                  </h3>
                  <p className="text-xs text-slate-400">
                    Execute no <b>SQL Editor</b> do seu painel Supabase para criar a tabela com suporte a RLS.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowSqlModal(false)}
                className="text-slate-400 hover:text-white p-1 text-lg"
              >
                ✕
              </button>
            </div>

            <div className="relative flex-1 overflow-auto rounded-2xl bg-slate-950 border border-white/10 p-4 font-mono text-xs text-amber-200/90 leading-relaxed">
              <pre className="whitespace-pre-wrap select-all">
{`-- =======================================================
-- TABELA: intro_banners (Banners da Apresentação Inicial)
-- =======================================================

CREATE TABLE IF NOT EXISTS public.intro_banners (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    subtitle TEXT,
    badge TEXT,
    image_url TEXT NOT NULL,
    cta_text TEXT DEFAULT 'Próximo',
    order_index INT DEFAULT 1,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habilitar Row Level Security (RLS)
ALTER TABLE public.intro_banners ENABLE ROW LEVEL SECURITY;

-- 1. Permitir leitura pública (todos os visitantes podem ver os banners)
CREATE POLICY "Permitir leitura publica de intro_banners"
ON public.intro_banners
FOR SELECT
USING (true);

-- 2. Permitir inserção/edição para usuários autenticados e chave anon/master
CREATE POLICY "Permitir gerenciamento de intro_banners"
ON public.intro_banners
FOR ALL
USING (true)
WITH CHECK (true);

-- Inserir os 4 Banners Padrão da ÁTRIOS BUILD
INSERT INTO public.intro_banners (id, title, subtitle, badge, image_url, cta_text, order_index, active)
VALUES 
(
  'banner-1',
  'Bem-vindo ao Ecossistema ÁTRIOS BUILD',
  'A solução mais rápida, intuitiva e completa para a gestão de orçamentos, obras e captação de clientes.',
  'Inovação & Gestão',
  'https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?auto=format&fit=crop&q=80&w=1600',
  'Avançar',
  1,
  true
),
(
  'banner-2',
  'Orçamentos Profissionais em 2 Minutos',
  'Elabore propostas em PDF personalizadas com logotipo, cálculo automático de IVA e envio instantâneo.',
  'Propostas Rápidas',
  'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&q=80&w=1600',
  'Próximo',
  2,
  true
),
(
  'banner-3',
  'Radar de Oportunidades & Pedidos de Obras',
  'Receba contactos diretos de clientes à procura de profissionais qualificados na sua região.',
  'Mais Clientes',
  'https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&q=80&w=1600',
  'Próximo',
  3,
  true
),
(
  'banner-4',
  'Portal do Cliente com Aprovação Online',
  'O seu cliente acompanha a evolução dos serviços, visualiza pagamentos e aprova propostas no telemóvel.',
  '100% Digital',
  'https://images.unsplash.com/photo-1590402494587-44b71d7772f6?auto=format&fit=crop&q=80&w=1600',
  'Aceder à Plataforma',
  4,
  true
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  subtitle = EXCLUDED.subtitle,
  badge = EXCLUDED.badge,
  image_url = EXCLUDED.image_url,
  cta_text = EXCLUDED.cta_text,
  order_index = EXCLUDED.order_index,
  active = EXCLUDED.active,
  updated_at = NOW();`}
              </pre>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-white/10">
              <span className="text-[11px] text-slate-400">
                Após executar, a tabela estará pronta para sincronização automática.
              </span>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    const sqlText = `-- =======================================================
-- TABELA: intro_banners (Banners da Apresentação Inicial)
-- =======================================================

CREATE TABLE IF NOT EXISTS public.intro_banners (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    subtitle TEXT,
    badge TEXT,
    image_url TEXT NOT NULL,
    cta_text TEXT DEFAULT 'Próximo',
    order_index INT DEFAULT 1,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habilitar Row Level Security (RLS)
ALTER TABLE public.intro_banners ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Permitir leitura publica de intro_banners"
ON public.intro_banners
FOR SELECT
USING (true);

CREATE POLICY "Permitir gerenciamento de intro_banners"
ON public.intro_banners
FOR ALL
USING (true)
WITH CHECK (true);

INSERT INTO public.intro_banners (id, title, subtitle, badge, image_url, cta_text, order_index, active)
VALUES 
(
  'banner-1',
  'Bem-vindo ao Ecossistema ÁTRIOS BUILD',
  'A solução mais rápida, intuitiva e completa para a gestão de orçamentos, obras e captação de clientes.',
  'Inovação & Gestão',
  'https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?auto=format&fit=crop&q=80&w=1600',
  'Avançar',
  1,
  true
),
(
  'banner-2',
  'Orçamentos Profissionais em 2 Minutos',
  'Elabore propostas em PDF personalizadas com logotipo, cálculo automático de IVA e envio instantâneo.',
  'Propostas Rápidas',
  'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&q=80&w=1600',
  'Próximo',
  2,
  true
),
(
  'banner-3',
  'Radar de Oportunidades & Pedidos de Obras',
  'Receba contactos diretos de clientes à procura de profissionais qualificados na sua região.',
  'Mais Clientes',
  'https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&q=80&w=1600',
  'Próximo',
  3,
  true
),
(
  'banner-4',
  'Portal do Cliente com Aprovação Online',
  'O seu cliente acompanha a evolução dos serviços, visualiza pagamentos e aprova propostas no telemóvel.',
  '100% Digital',
  'https://images.unsplash.com/photo-1590402494587-44b71d7772f6?auto=format&fit=crop&q=80&w=1600',
  'Aceder à Plataforma',
  4,
  true
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  subtitle = EXCLUDED.subtitle,
  badge = EXCLUDED.badge,
  image_url = EXCLUDED.image_url,
  cta_text = EXCLUDED.cta_text,
  order_index = EXCLUDED.order_index,
  active = EXCLUDED.active,
  updated_at = NOW();`;
                    navigator.clipboard.writeText(sqlText);
                    setCopiedSql(true);
                    setTimeout(() => setCopiedSql(false), 3000);
                  }}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-lg active:scale-95"
                >
                  {copiedSql ? <Check size={14} /> : <Copy size={14} />}
                  <span>{copiedSql ? 'Copiado!' : 'Copiar SQL'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowSqlModal(false)}
                  className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-slate-300 font-bold text-xs uppercase tracking-wider transition-colors"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Full Preview Modal */}
      {previewBanner && (
        <div className="fixed inset-0 z-[10005] bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-in fade-in">
          <div className="bg-slate-900 border border-white/10 rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl space-y-4 p-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <span className="text-xs font-black uppercase tracking-wider text-amber-400">
                Visualização do Banner
              </span>
              <button
                type="button"
                onClick={() => setPreviewBanner(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            <div className="relative rounded-2xl overflow-hidden aspect-video bg-slate-950 border border-white/10 shadow-lg">
              <img
                src={previewBanner.imageUrl}
                alt={previewBanner.title}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent flex flex-col justify-end p-6 space-y-2">
                {previewBanner.badge && (
                  <span className="self-start px-2.5 py-1 rounded-full bg-amber-500 text-slate-950 text-[10px] font-black uppercase tracking-wider">
                    {previewBanner.badge}
                  </span>
                )}
                <h3 className="text-xl font-black text-white tracking-tight">
                  {previewBanner.title}
                </h3>
                {previewBanner.subtitle && (
                  <p className="text-xs text-slate-300 font-medium">
                    {previewBanner.subtitle}
                  </p>
                )}
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setPreviewBanner(null)}
                className="px-5 py-2.5 rounded-xl bg-amber-500 text-slate-950 font-black text-xs uppercase tracking-wider"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
