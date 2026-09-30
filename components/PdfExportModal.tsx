import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, 
  Wrench, 
  Sparkles, 
  Download, 
  Check, 
  X, 
  Globe, 
  Loader2, 
  AlertCircle,
  CheckCircle2,
  FileCheck
} from 'lucide-react';
import { Budget, Company, CurrencyCode, PlanType } from '../types';
import { Locale, translations } from '../translations';
import { 
  SUPPORTED_PDF_LANGUAGES, 
  SupportedPdfLanguage, 
  generateBudgetPDF, 
  generateServiceOrderPDF 
} from '../services/pdfExportService';

interface PdfExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  budget: Budget;
  company: Company;
  currentLocale: Locale;
  currencyCode: CurrencyCode;
  initialDocumentType?: 'budget' | 'service_order';
  onPdfGenerated?: () => void;
  onUpgrade?: () => void;
  freePdfLimitReached?: boolean;
}

export const PdfExportModal: React.FC<PdfExportModalProps> = ({
  isOpen,
  onClose,
  budget,
  company,
  currentLocale,
  currencyCode,
  initialDocumentType = 'budget',
  onPdfGenerated,
  onUpgrade,
  freePdfLimitReached = false
}) => {
  const t = translations[currentLocale] || translations['pt-PT'];
  
  const [docType, setDocType] = useState<'budget' | 'service_order'>(initialDocumentType);
  const [selectedLanguage, setSelectedLanguage] = useState<Locale>(currentLocale);
  const [autoTranslate, setAutoTranslate] = useState<boolean>(selectedLanguage !== currentLocale);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progressStage, setProgressStage] = useState<string>('');
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleLanguageChange = (langCode: Locale) => {
    setSelectedLanguage(langCode);
    // Auto-enable AI translation if target language differs from current app locale
    if (langCode !== currentLocale) {
      setAutoTranslate(true);
    }
  };

  const handleExport = async () => {
    if (freePdfLimitReached) {
      alert(t.pdfLimitReached || 'Limite de PDFs atingido no plano Gratuito.');
      if (onUpgrade) onUpgrade();
      onClose();
      return;
    }

    setIsGenerating(true);
    setIsSuccess(false);

    try {
      const options = {
        targetLocale: selectedLanguage,
        currencyCode: currencyCode,
        company: company,
        activeQrCode: company.qrCode,
        autoTranslateContent: autoTranslate,
        onProgress: (stage: string) => setProgressStage(stage)
      };

      if (docType === 'service_order') {
        await generateServiceOrderPDF(budget, options);
      } else {
        await generateBudgetPDF(budget, options);
      }

      setIsSuccess(true);
      if (onPdfGenerated) onPdfGenerated();

      setTimeout(() => {
        setIsGenerating(false);
        setIsSuccess(false);
        onClose();
      }, 1400);

    } catch (err: any) {
      console.error('Erro ao gerar PDF:', err);
      alert('Ocorreu um erro ao gerar o documento PDF. Por favor tente novamente.');
      setIsGenerating(false);
    }
  };

  const selectedLangObj = SUPPORTED_PDF_LANGUAGES.find(l => l.code === selectedLanguage) || SUPPORTED_PDF_LANGUAGES[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header with gradient badge */}
        <div className="p-5 sm:p-6 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                Exportar PDF Multilíngue
                <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-medium">
                  9 Idiomas
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Cliente: <strong className="text-slate-200">{budget.clientName}</strong> · #{budget.id.toUpperCase()}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isGenerating}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-5 overflow-y-auto">
          
          {/* Document Type Selector */}
          <div>
            <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block mb-2">
              Tipo de Documento
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setDocType('budget')}
                className={`flex items-center gap-3 p-3.5 rounded-xl border text-left transition-all ${
                  docType === 'budget'
                    ? 'border-amber-500 bg-amber-50/50 text-slate-900 shadow-sm ring-2 ring-amber-500/20'
                    : 'border-slate-200 hover:border-slate-300 text-slate-600 bg-white'
                }`}
              >
                <div className={`p-2 rounded-lg ${docType === 'budget' ? 'bg-amber-500 text-white' : 'bg-slate-100 text-slate-500'}`}>
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold">Orçamento / Pedido</div>
                  <div className="text-[11px] text-slate-500">Valores, itens & totais</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setDocType('service_order')}
                className={`flex items-center gap-3 p-3.5 rounded-xl border text-left transition-all ${
                  docType === 'service_order'
                    ? 'border-amber-500 bg-amber-50/50 text-slate-900 shadow-sm ring-2 ring-amber-500/20'
                    : 'border-slate-200 hover:border-slate-300 text-slate-600 bg-white'
                }`}
              >
                <div className={`p-2 rounded-lg ${docType === 'service_order' ? 'bg-amber-500 text-white' : 'bg-slate-100 text-slate-500'}`}>
                  <Wrench className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold">Ordem de Serviço (OS)</div>
                  <div className="text-[11px] text-slate-500">Tarefas, local & assinaturas</div>
                </div>
              </button>
            </div>
          </div>

          {/* 9 Language Selector Grid */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-amber-500" />
                Idioma do Documento ({SUPPORTED_PDF_LANGUAGES.length})
              </label>
              <span className="text-[11px] text-slate-400">
                Selecionado: <strong className="text-slate-700">{selectedLangObj.nativeLabel}</strong>
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {SUPPORTED_PDF_LANGUAGES.map((lang) => {
                const isSelected = selectedLanguage === lang.code;
                const isCurrent = currentLocale === lang.code;
                return (
                  <button
                    key={lang.code}
                    type="button"
                    onClick={() => handleLanguageChange(lang.code)}
                    className={`flex items-center justify-between p-2.5 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'border-amber-500 bg-amber-50 text-amber-950 font-semibold ring-2 ring-amber-500/20 shadow-sm'
                        : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-base leading-none">{lang.flag}</span>
                      <div className="min-w-0">
                        <div className="text-xs truncate">{lang.nativeLabel}</div>
                        {isCurrent && (
                          <div className="text-[9px] text-emerald-600 font-medium leading-none">Atual do App</div>
                        )}
                      </div>
                    </div>
                    {isSelected && (
                      <Check className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* AI Translation Toggle Card */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-2.5">
                <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-600 shrink-0 mt-0.5">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    Traduzir conteúdo da obra com IA (Gemini)
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 font-semibold">
                      Automático
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                    Traduz automaticamente as descrições dos serviços, unidades, observações e método de pagamento para <strong>{selectedLangObj.nativeLabel}</strong>.
                  </p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-1">
                <input
                  type="checkbox"
                  checked={autoTranslate}
                  onChange={(e) => setAutoTranslate(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-500"></div>
              </label>
            </div>
          </div>

          {/* Progress / Status feedback */}
          {isGenerating && (
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 flex items-center gap-3 text-amber-900">
              <Loader2 className="w-4 h-4 animate-spin text-amber-600 shrink-0" />
              <div className="text-xs font-medium">
                {progressStage || 'Gerando documento PDF...'}
              </div>
            </div>
          )}

          {isSuccess && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-3 text-emerald-900">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <div className="text-xs font-bold">
                Documento gerado com sucesso! O download começará de imediato.
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isGenerating}
            className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-200/50 rounded-xl transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={handleExport}
            disabled={isGenerating || isSuccess}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 active:scale-95 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Processando...
              </>
            ) : isSuccess ? (
              <>
                <FileCheck className="w-4 h-4" />
                Descarregado!
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                Descarregar em {selectedLangObj.shortCode} ({selectedLangObj.flag})
              </>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
};
