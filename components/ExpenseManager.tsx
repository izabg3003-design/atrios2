
import React, { useState } from 'react';
import { 
  X, 
  Wallet, 
  Plus, 
  Trash2, 
  Calendar, 
  TrendingDown,
  Crown,
  Hash,
  Layers,
  DollarSign
} from 'lucide-react';
import { Budget, ExpenseRecord, PlanType, CurrencyCode, CURRENCIES } from '../types';
import { FREE_EXPENSE_LIMIT } from '../constants';
import { v4 as uuidv4 } from 'uuid';
import { Locale, translations } from '../translations';

interface ExpenseManagerProps {
  budget: Budget;
  plan: PlanType;
  onSave: (updatedBudget: Budget) => void;
  onClose: () => void;
  onUpgrade: () => void;
  locale: Locale;
  currencyCode: CurrencyCode;
}

const ExpenseManager: React.FC<ExpenseManagerProps> = ({ budget, plan, onSave, onClose, onUpgrade, locale, currencyCode }) => {
  const t = translations[locale];
  const currencyInfo = CURRENCIES[currencyCode];
  const isPremium = plan !== PlanType.FREE;
  const canAddExpense = isPremium || (budget.expenses || []).length < FREE_EXPENSE_LIMIT;
  
  const [description, setDescription] = useState('');
  const [quantity, setQuantity] = useState<number>(1);
  const [unit, setUnit] = useState<string>('un');
  const [pricePerUnit, setPricePerUnit] = useState<number>(0);
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [showForm, setShowForm] = useState(false);

  const totalExpenses = (budget.expenses || []).reduce((sum, e) => sum + e.amount, 0);

  const formatValue = (val: number) => {
    return (val * currencyInfo.rate).toLocaleString(locale, { style: 'currency', currency: currencyCode });
  };

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !canAddExpense) return;

    // Converter para base EUR antes de salvar (assumindo que os cálculos internos são em EUR)
    const eurPricePerUnit = pricePerUnit / currencyInfo.rate;
    const eurTotalAmount = (quantity * pricePerUnit) / currencyInfo.rate;

    const newExpense: ExpenseRecord = {
      id: uuidv4(),
      description,
      quantity,
      unit,
      pricePerUnit: eurPricePerUnit,
      amount: eurTotalAmount,
      date
    };

    const updatedBudget = {
      ...budget,
      expenses: [...(budget.expenses || []), newExpense]
    };

    onSave(updatedBudget);
    setDescription('');
    setQuantity(1);
    setUnit('un');
    setPricePerUnit(0);
    setShowForm(false);
  };

  const removeExpense = (id: string) => {
    const updatedBudget = {
      ...budget,
      expenses: (budget.expenses || []).filter(e => e.id !== id)
    };
    onSave(updatedBudget);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white w-full max-w-2xl rounded-[2rem] sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[95dvh] sm:max-h-[90vh]">
        <div className="px-6 sm:px-8 py-4 sm:py-6 bg-slate-900 text-white flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-500/20 rounded-lg">
              <Wallet size={20} className="text-red-400 sm:w-6 sm:h-6" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold">{t.expensesTitle}</h2>
              <p className="text-[10px] sm:text-xs text-white/60 truncate max-w-[150px] sm:max-w-none">{t.clientName}: {budget.clientName}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6 sm:space-y-8 no-scrollbar">
          <div className="p-5 sm:p-6 bg-red-50 rounded-2xl border border-red-100 flex items-center justify-between gap-4">
            <div>
              <p className="text-[8px] sm:text-[10px] font-bold text-red-600 uppercase tracking-widest mb-0.5 sm:mb-1">{t.totalExpenses}</p>
              <p className="text-2xl sm:text-3xl font-black text-red-700">{formatValue(totalExpenses)}</p>
            </div>
            <TrendingDown size={40} className="text-red-200 sm:w-12 sm:h-12" />
          </div>

          {!isPremium && (budget.expenses || []).length >= FREE_EXPENSE_LIMIT && !showForm && (
            <div className="p-3 sm:p-4 bg-amber-50 border border-amber-200 rounded-xl sm:rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-4">
              <div className="flex items-center gap-3 text-amber-800 text-[10px] sm:text-xs font-bold text-center sm:text-left">
                <Crown size={18} className="text-amber-500 shrink-0" />
                {t.expenseLimitReached}
              </div>
              <button onClick={onUpgrade} className="text-[8px] sm:text-[10px] font-black uppercase text-amber-600 hover:underline">{t.updatePlanBtn}</button>
            </div>
          )}

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-slate-900 flex items-center gap-2 text-sm sm:text-base">
                <Plus size={18} className="text-red-500" /> {t.addExpense}
              </h3>
              {!showForm && canAddExpense && (
                <button onClick={() => setShowForm(true)} className="px-3 sm:px-4 py-2 bg-slate-900 text-white rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2">
                  <Plus size={16} /> {t.addExpense}
                </button>
              )}
            </div>

            {showForm && (
              <form onSubmit={handleAddExpense} className="p-4 sm:p-6 bg-slate-50 rounded-2xl border border-slate-200 animate-in slide-in-from-top duration-300">
                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 sm:mb-2">{t.expenseDescription}</label>
                    <input required type="text" value={description} onChange={e => setDescription(e.target.value)} className="w-full px-4 py-2 sm:py-2.5 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-slate-900 font-bold text-sm sm:text-base" placeholder={t.expensePlaceholder} />
                  </div>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                    <div>
                      <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 sm:mb-2 flex items-center gap-1"><Hash size={10}/> {t.quantity}</label>
                      <input 
                        required 
                        type="number" 
                        value={quantity === 0 ? '' : quantity} 
                        onChange={e => setQuantity(e.target.value === '' ? 0 : Number(e.target.value))} 
                        className="w-full px-4 py-2 sm:py-2.5 rounded-xl border border-slate-200 outline-none font-bold text-sm sm:text-base" 
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 sm:mb-2 flex items-center gap-1"><Layers size={10}/> {t.unit}</label>
                      <input 
                        required 
                        type="text" 
                        value={unit} 
                        onChange={e => setUnit(e.target.value)} 
                        className="w-full px-4 py-2 sm:py-2.5 rounded-xl border border-slate-200 outline-none font-bold text-sm sm:text-base" 
                        placeholder="un"
                      />
                    </div>
                    <div className="col-span-2 sm:col-span-2">
                      <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 sm:mb-2 flex items-center gap-1"><DollarSign size={10}/> {t.unitPrice} ({currencyCode})</label>
                      <input 
                        required 
                        type="number" 
                        step="0.01" 
                        value={pricePerUnit === 0 ? '' : pricePerUnit} 
                        onChange={e => setPricePerUnit(e.target.value === '' ? 0 : Number(e.target.value))} 
                        placeholder="0.00"
                        className="w-full px-4 py-2 sm:py-2.5 rounded-xl border border-slate-200 outline-none font-bold text-sm sm:text-base" 
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 sm:mb-2">{t.expenseDate}</label>
                      <input required type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full px-4 py-2 sm:py-2.5 rounded-xl border border-slate-200 outline-none font-bold text-sm sm:text-base" />
                    </div>
                    <div className="flex flex-row sm:flex-col justify-between sm:justify-end items-center sm:items-end pb-1">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.total}</p>
                      <p className="text-xl font-black text-slate-900">{formatValue(quantity * pricePerUnit)}</p>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 mt-6">
                  <button type="submit" className="flex-1 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-all order-1 sm:order-2">
                    {t.addExpense}
                  </button>
                  <button type="button" onClick={() => setShowForm(false)} className="py-3 px-6 bg-white border border-slate-200 text-slate-600 rounded-xl font-bold order-2 sm:order-1">
                    {t.cancel}
                  </button>
                </div>
              </form>
            )}

            <div className="space-y-3">
              {(budget.expenses || []).map(expense => (
                <div key={expense.id} className="p-3 sm:p-4 bg-white border border-slate-100 rounded-2xl flex items-center justify-between group shadow-sm gap-3">
                  <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-red-50 text-red-600 rounded-full flex items-center justify-center font-bold shrink-0 text-sm sm:text-base">{currencyInfo.symbol}</div>
                    <div className="min-w-0">
                      <p className="font-bold text-slate-900 text-sm sm:text-base truncate">{expense.description}</p>
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[8px] sm:text-[10px] font-black text-slate-400 uppercase">
                        <span>{expense.quantity} {expense.unit} x {formatValue(expense.pricePerUnit)}</span>
                        <span className="hidden sm:inline text-slate-200">|</span>
                        <span className="flex items-center gap-1"><Calendar size={10} /> {new Date(expense.date).toLocaleDateString(locale)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 sm:gap-4 shrink-0">
                    <p className="font-black text-red-600 text-sm sm:text-base">-{formatValue(expense.amount)}</p>
                    <button onClick={() => removeExpense(expense.id)} className="p-1.5 sm:p-2 text-slate-200 hover:text-red-500 transition-all"><Trash2 size={16} className="sm:w-[18px] sm:h-[18px]" /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExpenseManager;
