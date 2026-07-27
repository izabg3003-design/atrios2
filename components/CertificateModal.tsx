import React, { useState } from 'react';
import { 
  ShieldCheck, 
  CheckCircle2, 
  Award, 
  Building2, 
  Phone, 
  Mail, 
  Globe, 
  MapPin, 
  Copy, 
  Check, 
  ExternalLink, 
  Printer, 
  X, 
  BadgeCheck, 
  Sparkles
} from 'lucide-react';
import { Company } from '../types';

interface CertificateModalProps {
  company: Company | null;
  onClose?: () => void;
  isStandalone?: boolean;
}

export const CertificateModal: React.FC<CertificateModalProps> = ({ company, onClose, isStandalone = false }) => {
  const [copied, setCopied] = useState(false);

  const certId = company ? `ATR-CERT-2026-${String(company.id).slice(0, 8).toUpperCase()}` : 'ATR-CERT-2026-ACTIVE';
  const verifyUrl = company ? `${window.location.origin}/?cert=${company.id}` : window.location.href;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(verifyUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  if (!company) {
    return (
      <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-slate-950/90 backdrop-blur-xl p-4">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 max-w-md w-full text-center text-white space-y-4">
          <div className="w-16 h-16 bg-red-500/10 text-red-400 rounded-full flex items-center justify-center mx-auto">
            <X size={32} />
          </div>
          <h3 className="text-xl font-black">Empresa Não Encontrada</h3>
          <p className="text-sm text-slate-400">O certificado consultado é inválido ou não se encontra registado no sistema Átrios.</p>
          {onClose && (
            <button onClick={onClose} className="w-full py-3 bg-slate-800 hover:bg-slate-700 rounded-xl font-bold text-sm transition-all">
              Fechar
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`fixed inset-0 z-[10000] flex items-center justify-center p-3 sm:p-6 overflow-y-auto ${isStandalone ? 'bg-slate-950/95' : 'bg-slate-950/80 backdrop-blur-md'}`}>
      {/* Background Decorative Lighting */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/10 blur-[140px] rounded-full" />
        <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-amber-500/10 blur-[130px] rounded-full" />
      </div>

      <div id="certificate-print-area" className="relative bg-slate-900 text-slate-100 rounded-[2.5rem] border-2 border-emerald-500/30 shadow-[0_0_80px_rgba(16,185,129,0.15)] max-w-2xl w-full overflow-hidden my-auto animate-in zoom-in-95 duration-300">
        
        {/* Top Metallic Gold Accent Bar */}
        <div className="h-3 w-full bg-gradient-to-r from-amber-400 via-emerald-400 to-amber-500" />

        {/* Modal Header Controls */}
        <div className="flex items-center justify-between px-6 pt-6 pb-2 border-b border-slate-800/80">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              Selo Oficial Átrios Verified
            </span>
          </div>
          {onClose && (
            <button 
              onClick={onClose} 
              className="w-10 h-10 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-all"
              aria-label="Fechar Certificado"
              title="Fechar Certificado"
            >
              <X size={20} />
            </button>
          )}
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-10 space-y-8">
          
          {/* Main Badge & Title */}
          <div className="text-center space-y-4">
            <div className="relative inline-block">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-gradient-to-br from-slate-800 to-slate-950 border-2 border-emerald-500/40 p-1 flex items-center justify-center mx-auto shadow-2xl shadow-emerald-500/20">
                <div className="w-full h-full rounded-[1.3rem] bg-slate-900 flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-emerald-500/10 animate-pulse" />
                  <ShieldCheck size={52} className="text-emerald-400 relative z-10" />
                </div>
              </div>
              <div className="absolute -bottom-2 -right-2 bg-amber-500 text-slate-950 p-2 rounded-xl shadow-lg border-2 border-slate-900">
                <Award size={18} />
              </div>
            </div>

            <div className="space-y-1">
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight uppercase">
                Certificado Átrios Ativo
              </h1>
              <p className="text-emerald-400 font-extrabold text-sm sm:text-base flex items-center justify-center gap-2 tracking-wide uppercase">
                <BadgeCheck size={18} /> Confiança Total & Autenticidade
              </p>
            </div>
          </div>

          {/* Active Status Ribbon */}
          <div className="bg-gradient-to-r from-emerald-950/60 via-slate-900 to-emerald-950/60 border border-emerald-500/30 rounded-2xl p-4 sm:p-5 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30">
                <CheckCircle2 size={28} />
              </div>
              <div>
                <div className="text-xs font-black uppercase text-emerald-400 tracking-wider">Estado da Licença</div>
                <div className="text-base sm:text-lg font-black text-white">Empresa Auditada e Ativa</div>
              </div>
            </div>
            <div className="hidden sm:block text-right">
              <div className="text-[10px] font-bold uppercase text-slate-400">ID de Segurança</div>
              <div className="text-xs font-mono font-bold text-amber-400">{certId}</div>
            </div>
          </div>

          {/* Company Main Information Card */}
          <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-5 sm:p-6 space-y-5">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800/80">
              <div className="flex items-center gap-3">
                {company.logo ? (
                  <img src={company.logo} alt={company.name} className="w-12 h-12 rounded-xl object-contain bg-white/5 p-1 border border-slate-800" />
                ) : (
                  <div className="w-12 h-12 rounded-xl bg-slate-800 text-slate-300 flex items-center justify-center">
                    <Building2 size={24} />
                  </div>
                )}
                <div>
                  <h2 className="text-lg sm:text-xl font-black text-white">{company.name}</h2>
                  {company.nif && (
                    <p className="text-xs font-semibold text-slate-400">NIF / NIPC: <span className="text-slate-200 font-bold">{company.nif}</span></p>
                  )}
                </div>
              </div>
              <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <Sparkles size={14} /> Prestador Certificado
              </div>
            </div>

            {/* Grid Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
              {company.email && (
                <div className="flex items-center gap-2.5 text-slate-300">
                  <Mail size={16} className="text-emerald-400 shrink-0" />
                  <span className="truncate">{company.email}</span>
                </div>
              )}

              {company.phone && (
                <div className="flex items-center gap-2.5 text-slate-300">
                  <Phone size={16} className="text-emerald-400 shrink-0" />
                  <span>{company.phone}</span>
                </div>
              )}

              {company.website && (
                <div className="flex items-center gap-2.5 text-slate-300 col-span-1 sm:col-span-2">
                  <Globe size={16} className="text-emerald-400 shrink-0" />
                  <a href={company.website.startsWith('http') ? company.website : `https://${company.website}`} target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:underline font-bold truncate flex items-center gap-1">
                    {company.website} <ExternalLink size={12} />
                  </a>
                </div>
              )}

              {company.address && (
                <div className="flex items-start gap-2.5 text-slate-300 col-span-1 sm:col-span-2">
                  <MapPin size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                  <span>{company.address}</span>
                </div>
              )}
            </div>
          </div>

          {/* Footer Guarantee Statement */}
          <div className="pt-2 text-center space-y-2 border-t border-slate-800/80">
            <p className="text-[11px] text-slate-400 leading-relaxed max-w-lg mx-auto">
              Garantia de Autenticidade emitida pela infraestrutura <strong className="text-white">Átrios Software & Gestão</strong>. Os orçamentos e documentos desta empresa são protegidos contra modificações não autorizadas.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
            <button
              onClick={handleCopyLink}
              className="w-full sm:flex-1 py-3.5 px-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all active:scale-95 cursor-pointer"
            >
              {copied ? (
                <>
                  <Check size={18} /> Link Copiado!
                </>
              ) : (
                <>
                  <Copy size={18} /> Copiar Link do Certificado
                </>
              )}
            </button>

            <button
              onClick={handlePrint}
              className="w-full sm:w-auto py-3.5 px-5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Printer size={18} /> Imprimir
            </button>

            {isStandalone && (
              <a
                href="/"
                className="w-full sm:w-auto py-3.5 px-5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all"
              >
                Conhecer o Átrios <ExternalLink size={16} />
              </a>
            )}
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="py-3 px-6 bg-slate-950/80 text-center border-t border-slate-800/80 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
          © {new Date().getFullYear()} Átrios Platform • Certificado de Segurança & Confiança Total
        </div>

      </div>
    </div>
  );
};
