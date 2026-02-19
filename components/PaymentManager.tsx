
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
  FileText
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
  const percentage = Math.min(100, Math.round((totalPaid / budget.totalAmount) * 100));

  const formatValue = (val: number) => {
    return (val * currencyInfo.rate).toLocaleString(locale, { style: 'currency', currency: currencyCode });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 200000) {
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="px-8 py-6 bg-slate-900 text-white flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/20 rounded-lg">
              <CreditCard size={24} className="text-emerald-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold">{t.historyPayments}</h2>
              <p className="text-xs text-white/60">{t.clientName}: {budget.clientName}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-8 no-scrollbar">
          <div className="space-y-3">
            <div className="flex justify-between items-end">
              <p className="text-sm font-black text-slate-900 uppercase tracking-tighter">{t.percentagePaid}</p>
              <p className="text-2xl font-black text-emerald-600">{percentage}%</p>
            </div>
            <div className="w-full h-4 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
              <div className="h-full bg-emerald-500 transition-all duration-1000 ease-out" style={{ width: `${percentage}%` }} />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{t.total}</p>
              <p className="text-lg font-bold text-slate-900">{formatValue(budget.totalAmount)}</p>
            </div>
            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
              <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mb-1">{t.totalReceived}</p>
              <p className="text-lg font-bold text-emerald-700">{formatValue(totalPaid)}</p>
            </div>
            <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100">
              <p className="text-[10px] font-bold text-amber-600 uppercase tracking-widest mb-1">{t.remaining}</p>
              <p className="text-lg font-bold text-amber-700">{formatValue(remaining)}</p>
            </div>
          </div>

          {!isPremium && (budget.payments || []).length >= FREE_PAYMENT_LIMIT && !showForm && (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 text-amber-800 text-xs font-bold">
                <Crown size={18} className="text-amber-500" />
                {t.paymentLimitReached}
              </div>
              <button onClick={onUpgrade} className="text-[10px] font-black uppercase text-amber-600 hover:underline">{t.updatePlanBtn}</button>
            </div>
          )}

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-slate-900 flex items-center gap-2">
                <FileCheck size={18} className="text-blue-500" /> {t.historyPayments}
              </h3>
              {!showForm && canAddPayment && (
                <button onClick={() => setShowForm(true)} className="px-4 py-2 bg-slate-900 text-white rounded-xl text-sm font-bold flex items-center gap-2">
                  <Plus size={16} /> {t.registerPayment}
                </button>
              )}
            </div>

            {showForm && (
              <form onSubmit={handleAddPayment} className="p-6 bg-slate-50 rounded-2xl border border-slate-200 animate-in slide-in-from-top duration-300">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">{t.amountLabel} ({currencyCode})</label>
                    <input 
                      required 
                      type="number" 
                      step="0.01" 
                      value={amount === 0 ? '' : amount} 
                      onChange={e => setAmount(e.target.value === '' ? 0 : Number(e.target.value))} 
                      placeholder="0.00"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-slate-900 font-bold text-lg text-slate-900" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">{t.date}</label>
                    <input required type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-slate-900 font-bold" />
                  </div>
                </div>

                <div className="mb-6">
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">{t.proofLabel}</label>
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-[1.5rem] p-4 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all ${
                      proofUrl ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200 hover:border-slate-400 bg-white'
                    }`}
                  >
                    {proofUrl ? (
                      <div className="flex items-center gap-3 text-emerald-600 font-bold">
                        <FileCheck size={20} />
                        <span className="text-xs uppercase tracking-widest">{t.confirmRegister}</span>
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

                <div className="flex gap-3">
                  <button type="submit" className="flex-1 py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-all flex items-center justify-center gap-2">
                    <Check size={18} /> {t.confirmRegister}
                  </button>
                  <button type="button" onClick={() => {setShowForm(false); setProofUrl('');}} className="px-6 py-3 bg-white border border-slate-200 text-slate-600 rounded-xl font-bold">
                    {t.cancel}
                  </button>
                </div>
              </form>
            )}

            <div className="space-y-3">
              {(budget.payments || []).map(payment => (
                <div key={payment.id} className="p-4 bg-white border border-slate-100 rounded-2xl flex items-center justify-between group shadow-sm">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center font-bold">{currencyInfo.symbol}</div>
                    <div>
                      <p className="font-bold text-slate-900">{formatValue(payment.amount)}</p>
                      <p className="text-xs text-slate-400 flex items-center gap-1"><Calendar size={12} /> {new Date(payment.date).toLocaleDateString(locale)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {payment.proofUrl && (
                      <button 
                        onClick={() => window.open(payment.proofUrl, '_blank')}
                        className="p-2 text-blue-500 bg-blue-50 rounded-xl hover:bg-blue-500 hover:text-white transition-all"
                        title={t.viewProof}
                      >
                        <Eye size={18} />
                      </button>
                    )}
                    <button onClick={() => removePayment(payment.id)} className="p-2 text-slate-200 hover:text-red-500 transition-all"><Trash2 size={18} /></button>
                  </div>
                </div>
              ))}
              {(budget.payments || []).length === 0 && (
                <div className="py-12 text-center bg-slate-50 border-2 border-dashed border-slate-100 rounded-[2rem]">
                   <FileText className="mx-auto text-slate-200 mb-4" size={48} />
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.noPaymentsFound}</p>
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
