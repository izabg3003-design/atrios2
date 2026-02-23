import React, { useState, useRef } from 'react';
import { 
  X, 
  CreditCard, 
  Plus, 
  Trash2, 
  Calendar, 
  Upload, 
  FileCheck,
  Check,
  Crown,
  Eye,
  FileText,
  Download
} from 'lucide-react';
import { Budget, PaymentRecord, PlanType, CurrencyCode, CURRENCIES } from '../types';
import { FREE_PAYMENT_LIMIT } from '../constants';
import { v4 as uuidv4 } from 'uuid';
import { Locale, translations } from '../translations';

interface PaymentManagerProps {
  budget: Budget;
  plan: PlanType;
  onSave: (updatedBudget: Budget) => void;
  onClose: () => void;
  onUpgrade: () => void;
  locale: Locale;
  currencyCode: CurrencyCode;
}

const PaymentManager: React.FC<PaymentManagerProps> = ({ budget, plan, onSave, onClose, onUpgrade, locale, currencyCode }) => {
  const t = translations[locale];
  const currencyInfo = CURRENCIES[currencyCode];
  const isPremium = plan !== PlanType.FREE;
  const canAddPayment = isPremium || (budget.payments || []).length < FREE_PAYMENT_LIMIT;
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [amount, setAmount] = useState<number>(0);
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState<string>('');
  const [proofUrl, setProofUrl] = useState<string>('');
  const [showForm, setShowForm] = useState(false);

  const totalPaid = (budget.payments || []).reduce((sum, p) => sum + p.amount, 0);
  const remaining = budget.totalAmount - totalPaid;
  const percentage = budget.totalAmount > 0 ? Math.min(100, Math.round((totalPaid / budget.totalAmount) * 100)) : 0;

  const formatValue = (val: number) => {
    return (val * currencyInfo.rate).toLocaleString(locale, { style: 'currency', currency: currencyCode });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 500000) { // 500kb limit
        alert(translations[locale].imageTooLarge);
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setProofUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const downloadProof = (url: string, id: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = `comprovativo_pagamento_${id}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const viewProof = (url: string) => {
    const win = window.open();
    if (win) {
      win.document.write(`<img src="${url}" style="max-width:100%">`);
    }
  };

  const handleAddPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0 || !canAddPayment) return;

    // Converter para base EUR antes de salvar
    const eurEquivalent = amount / currencyInfo.rate;

    const newPayment: PaymentRecord = {
      id: uuidv4(),
      amount: eurEquivalent,
      date,
      notes,
      proofUrl: proofUrl || undefined
    };

    const updatedBudget = {
      ...budget,
      payments: [...(budget.payments || []), newPayment]
    };

    onSave(updatedBudget);
    setAmount(0);
    setNotes('');
    setProofUrl('');
    setShowForm(false);
  };

  const removePayment = (id: string) => {
    const updatedBudget = {
      ...budget,
      payments: (budget.payments || []).filter(p => p.id !== id)
    };
    onSave(updatedBudget);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white w-full max-w-2xl rounded-[2rem] sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[95dvh] sm:max-h-[90vh]">
        <div className="px-6 sm:px-8 py-4 sm:py-6 bg-slate-900 text-white flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/20 rounded-lg">
              <CreditCard size={20} className="text-emerald-400 sm:w-6 sm:h-6" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold">{t.historyPayments}</h2>
              <p className="text-[10px] sm:text-xs text-white/60 truncate max-w-[150px] sm:max-w-none">{t.clientName}: {budget.clientName}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6 sm:space-y-8 no-scrollbar">
          <div className="space-y-2 sm:space-y-3">
            <div className="flex justify-between items-end">
              <p className="text-[10px] sm:text-sm font-black text-slate-900 uppercase tracking-tighter">{t.percentagePaid}</p>
              <p className="text-xl sm:text-2xl font-black text-emerald-600">{percentage}%</p>
            </div>
            <div className="w-full h-3 sm:h-4 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
              <div className="h-full bg-emerald-500 transition-all duration-1000 ease-out" style={{ width: `${percentage}%` }} />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            <div className="p-3 lg:p-4 bg-slate-50 rounded-xl lg:rounded-2xl border border-slate-100">
              <p className="text-[8px] lg:text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5 lg:mb-1">{t.total}</p>
              <p className="text-base lg:text-lg font-bold text-slate-900">{formatValue(budget.totalAmount)}</p>
            </div>
            <div className="p-3 lg:p-4 bg-emerald-50 rounded-xl lg:rounded-2xl border border-emerald-100">
              <p className="text-[8px] lg:text-[10px] font-bold text-emerald-600 uppercase tracking-widest mb-0.5 lg:mb-1">{t.totalReceived}</p>
              <p className="text-base lg:text-lg font-bold text-emerald-700">{formatValue(totalPaid)}</p>
            </div>
            <div className="p-3 lg:p-4 bg-amber-50 rounded-xl lg:rounded-2xl border border-amber-100">
              <p className="text-[8px] lg:text-[10px] font-bold text-amber-600 uppercase tracking-widest mb-0.5 lg:mb-1">{t.remaining}</p>
              <p className="text-base lg:text-lg font-bold text-amber-700">{formatValue(remaining)}</p>
            </div>
          </div>

          {!isPremium && (budget.payments || []).length >= FREE_PAYMENT_LIMIT && !showForm && (
            <div className="p-3 lg:p-4 bg-amber-50 border border-amber-200 rounded-xl lg:rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-4">
              <div className="flex items-center gap-3 text-amber-800 text-[10px] lg:text-xs font-bold text-center sm:text-left">
                <Crown size={18} className="text-amber-500 shrink-0" />
                {t.paymentLimitReached}
              </div>
              <button onClick={onUpgrade} className="text-[8px] lg:text-[10px] font-black uppercase text-amber-600 hover:underline">{t.updatePlanBtn}</button>
            </div>
          )}

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-slate-900 flex items-center gap-2 text-sm sm:text-base">
                <FileCheck size={18} className="text-blue-500" /> {t.historyPayments}
              </h3>
              {!showForm && canAddPayment && (
                <button onClick={() => setShowForm(true)} className="px-3 sm:px-4 py-2 bg-slate-900 text-white rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2">
                  <Plus size={16} /> {t.registerPayment}
                </button>
              )}
            </div>

            {showForm && (
              <form onSubmit={handleAddPayment} className="p-4 sm:p-6 bg-slate-50 rounded-2xl border border-slate-200 animate-in slide-in-from-top duration-300">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-[10px] sm:text-xs font-bold text-slate-500 uppercase mb-1.5 sm:mb-2">{t.amountLabel} ({currencyCode})</label>
                    <input 
                      required 
                      type="number" 
                      step="0.01" 
                      value={amount === 0 ? '' : amount} 
                      onChange={e => setAmount(e.target.value === '' ? 0 : Number(e.target.value))} 
                      placeholder="0.00"
                      className="w-full px-4 py-2 sm:py-2.5 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-slate-900 font-bold text-base sm:text-lg text-slate-900" 
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] sm:text-xs font-bold text-slate-500 uppercase mb-1.5 sm:mb-2">{t.date}</label>
                    <input required type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full px-4 py-2 sm:py-2.5 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-slate-900 font-bold text-sm sm:text-base" />
                  </div>
                </div>

                <div className="mb-6">
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 sm:mb-3">{t.proofLabel}</label>
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-2xl lg:rounded-[1.5rem] p-4 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all ${
                      proofUrl ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200 hover:border-slate-400 bg-white'
                    }`}
                  >
                    {proofUrl ? (
                      <div className="flex items-center gap-3 text-emerald-600 font-bold">
                        <FileCheck size={20} />
                        <span className="text-[10px] uppercase tracking-widest">{t.confirmRegister}</span>
                        <div className="w-8 h-8 rounded-lg overflow-hidden border border-emerald-200">
                          <img src={proofUrl} className="w-full h-full object-cover" alt="Proof preview" />
                        </div>
                      </div>
                    ) : (
                      <>
                        <Upload size={20} className="text-slate-400" />
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.uploadProofBtn}</span>
                      </>
                    )}
                    <input ref={fileInputRef} type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <button type="submit" className="flex-1 py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-all flex items-center justify-center gap-2 order-1 sm:order-2">
                    <Check size={18} /> {t.confirmRegister}
                  </button>
                  <button type="button" onClick={() => {setShowForm(false); setProofUrl('');}} className="py-3 px-6 bg-white border border-slate-200 text-slate-600 rounded-xl font-bold order-2 sm:order-1">
                    {t.cancel}
                  </button>
                </div>
              </form>
            )}

            <div className="space-y-3">
              {(budget.payments || []).map(payment => (
                <div key={payment.id} className="p-3 sm:p-4 bg-white border border-slate-100 rounded-2xl flex items-center justify-between group shadow-sm gap-3">
                  <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center font-bold shrink-0 text-sm sm:text-base">{currencyInfo.symbol}</div>
                    <div className="min-w-0">
                      <p className="font-bold text-slate-900 text-sm sm:text-base truncate">{formatValue(payment.amount)}</p>
                      <p className="text-[10px] sm:text-xs text-slate-400 flex items-center gap-1"><Calendar size={12} /> {new Date(payment.date).toLocaleDateString(locale)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                    {payment.proofUrl && (
                      <>
                        <button 
                          onClick={() => viewProof(payment.proofUrl!)}
                          className="p-1.5 sm:p-2 text-emerald-600 bg-emerald-50 rounded-lg sm:rounded-xl hover:bg-emerald-600 hover:text-white transition-all"
                          title={t.viewProof}
                        >
                          <Eye size={16} className="sm:w-[18px] sm:h-[18px]" />
                        </button>
                        <button 
                          onClick={() => downloadProof(payment.proofUrl!, payment.id)}
                          className="p-1.5 sm:p-2 text-blue-600 bg-blue-50 rounded-lg sm:rounded-xl hover:bg-blue-600 hover:text-white transition-all"
                          title={t.exportPdf}
                        >
                          <Download size={16} className="sm:w-[18px] sm:h-[18px]" />
                        </button>
                      </>
                    )}
                    <button onClick={() => removePayment(payment.id)} className="p-1.5 sm:p-2 text-slate-200 hover:text-red-500 transition-all"><Trash2 size={16} className="sm:w-[18px] sm:h-[18px]" /></button>
                  </div>
                </div>
              ))}
              {(budget.payments || []).length === 0 && (
                <div className="py-8 sm:py-12 text-center bg-slate-50 border-2 border-dashed border-slate-100 rounded-[1.5rem] sm:rounded-[2rem]">
                   <FileText className="mx-auto text-slate-200 mb-3 sm:mb-4 w-10 h-10 sm:w-12 sm:h-12" size={48} />
                   <p className="text-[8px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.noPaymentsFound}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentManager;