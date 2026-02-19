
import React, { useState, useMemo } from 'react';
import { 
  Plus, 
  Trash2, 
  X, 
  FileText, 
  User, 
  Phone, 
  Briefcase,
  DollarSign,
  Tag,
  CreditCard,
  Wallet,
  Upload,
  Calendar,
  Crown,
  MapPin,
  Hash,
  Mail,
  MessageSquare,
  Percent,
  Clock,
  Banknote
} from 'lucide-react';
import { 
  Budget, 
  BudgetStatus, 
  Company, 
  PlanType, 
  ServiceItem,
  ExpenseRecord,
  PaymentRecord,
  CurrencyCode,
  CURRENCIES
} from '../types';
import { 
  SERVICE_CATEGORIES, 
  FREE_ITEM_LIMIT, 
  FREE_SERVICE_LIMIT, 
  FREE_EXPENSE_LIMIT, 
  FREE_PAYMENT_LIMIT 
} from '../constants';
import { Locale, translations, Translation } from '../translations';
import { generateShortId } from '../App';
import { v4 as uuidv4 } from 'uuid';

interface BudgetFormProps {
  company: Company;
  onSave: (budget: Budget) => void;
  onCancel: () => void;
  onUpgrade: () => void;
  initialData?: Budget;
  locale: Locale;
  currencyCode: CurrencyCode;
}

type FormTab = 'items' | 'expenses' | 'payments';

const BudgetForm: React.FC<BudgetFormProps> = ({ company, onSave, onCancel, onUpgrade, initialData, locale, currencyCode }) => {
  const t = translations[locale];
  const currencyInfo = CURRENCIES[currencyCode];
  const [activeTab, setActiveTab] = useState<FormTab>('items');
  
  const [clientName, setClientName] = useState(initialData?.clientName || '');
  const [contactName, setContactName] = useState(initialData?.contactName || '');
  const [contactPhone, setContactPhone] = useState(initialData?.contactPhone || '');
  const [workLocation, setWorkLocation] = useState(initialData?.workLocation || '');
  const [workNumber, setWorkNumber] = useState(initialData?.workNumber || '');
  const [workPostalCode, setWorkPostalCode] = useState(initialData?.workPostalCode || '');
  const [clientNif, setClientNif] = useState(initialData?.clientNif || '');
  const [observations, setObservations] = useState(initialData?.observations || '');
  const [validity, setValidity] = useState(initialData?.validity || '');
  const [paymentMethod, setPaymentMethod] = useState(initialData?.paymentMethod || '');
  const [includeIva, setIncludeIva] = useState(initialData?.includeIva || false);
  const [ivaPercentage, setIvaPercentage] = useState(initialData?.ivaPercentage || 23);
  
  const [budgetDate, setBudgetDate] = useState(
    initialData?.createdAt 
    ? initialData.createdAt.split('T')[0] 
    : new Date().toISOString().split('T')[0]
  );
  
  const [status, setStatus] = useState<BudgetStatus>(initialData?.status || BudgetStatus.PENDING);
  const [selectedServices, setSelectedServices] = useState<string[]>(initialData?.servicesSelected || []);
  const [items, setItems] = useState<ServiceItem[]>(initialData?.items || [
    { id: uuidv4(), description: '', quantity: 1, unit: t.unitDefault, pricePerUnit: 0, total: 0 }
  ]);
  const [expenses, setExpenses] = useState<ExpenseRecord[]>(initialData?.expenses || []);
  const [payments, setPayments] = useState<PaymentRecord[]>(initialData?.payments || []);

  const isPremium = company.plan !== PlanType.FREE;
  const canAddItem = isPremium || items.length < FREE_ITEM_LIMIT;
  const canAddService = (id: string) => isPremium || selectedServices.includes(id) || selectedServices.length < FREE_SERVICE_LIMIT;
  const canAddExpense = isPremium || expenses.length < FREE_EXPENSE_LIMIT;
  const canAddPayment = isPremium || payments.length < FREE_PAYMENT_LIMIT;

  const subtotalAmount = useMemo(() => items.reduce((sum, item) => sum + item.total, 0), [items]);
  const ivaValue = useMemo(() => includeIva ? (subtotalAmount * ivaPercentage) / 100 : 0, [subtotalAmount, includeIva, ivaPercentage]);
  const totalAmount = useMemo(() => subtotalAmount + ivaValue, [subtotalAmount, ivaValue]);

  const totalExpenses = useMemo(() => expenses.reduce((sum, exp) => sum + exp.amount, 0), [expenses]);
  const totalPaid = useMemo(() => payments.reduce((sum, p) => sum + p.amount, 0), [payments]);
  const estimatedProfit = totalAmount - totalExpenses;
  const remainingToPay = totalAmount - totalPaid;

  const addItem = () => {
    if (!canAddItem) return;
    setItems([...items, { id: uuidv4(), description: '', quantity: 1, unit: t.unitDefault, pricePerUnit: 0, total: 0 }]);
  };

  const removeItem = (id: string) => {
    if (items.length === 1) return;
    setItems(items.filter(item => item.id !== id));
  };

  const updateItem = (id: string, field: keyof ServiceItem, value: any) => {
    const updatedItems = items.map(item => {
      if (item.id === id) {
        const newItem = { ...item, [field]: value };
        if (field === 'quantity' || field === 'pricePerUnit') {
          newItem.total = newItem.quantity * newItem.pricePerUnit;
        }
        return newItem;
      }
      return item;
    });
    setItems(updatedItems);
  };

  const addExpense = () => {
    if (!canAddExpense) return;
    setExpenses([...expenses, { 
      id: uuidv4(), 
      description: '', 
      quantity: 1, 
      unit: t.unitDefault, 
      pricePerUnit: 0, 
      amount: 0, 
      date: new Date().toISOString().split('T')[0] 
    }]);
  };

  const removeExpense = (id: string) => {
    setExpenses(expenses.filter(exp => exp.id !== id));
  };

  const updateExpense = (id: string, field: keyof ExpenseRecord, value: any) => {
    const updatedExpenses = expenses.map(exp => {
      if (exp.id === id) {
        const newExp = { ...exp, [field]: value };
        if (field === 'quantity' || field === 'pricePerUnit') {
          newExp.amount = newExp.quantity * newExp.pricePerUnit;
        }
        return newExp;
      }
      return exp;
    });
    setExpenses(updatedExpenses);
  };

  const addPayment = () => {
    if (!canAddPayment) return;
    setPayments([...payments, { id: uuidv4(), amount: 0, date: new Date().toISOString().split('T')[0], proofUrl: '' }]);
  };

  const removePayment = (id: string) => {
    setPayments(payments.filter(p => p.id !== id));
  };

  const updatePayment = (id: string, field: keyof PaymentRecord, value: any) => {
    const updatedPayments = payments.map(p => {
      if (p.id === id) return { ...p, [field]: value };
      return p;
    });
    setPayments(updatedPayments);
  };

  const toggleService = (serviceId: string) => {
    if (selectedServices.includes(serviceId)) {
      setSelectedServices(prev => prev.filter(s => s !== serviceId));
    } else if (canAddService(serviceId)) {
      setSelectedServices(prev => [...prev, serviceId]);
    }
  };

  const getTranslatedServiceLabel = (id: string) => {
    const key = `service_${id}` as keyof Translation;
    return t[key] || id;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalDate = new Date(budgetDate);
    if (isNaN(finalDate.getTime())) {
      finalDate.setTime(new Date().getTime());
    }

    onSave({
      ...initialData,
      id: initialData?.id || generateShortId(),
      companyId: company.id,
      clientName,
      contactName,
      contactPhone,
      workLocation,
      workNumber,
      workPostalCode,
      clientNif,
      servicesSelected: selectedServices,
      items,
      expenses,
      payments,
      totalAmount,
      status,
      observations,
      validity,
      paymentMethod,
      includeIva,
      ivaPercentage,
      createdAt: finalDate.toISOString(),
    } as any);
  };

  const formatValue = (val: number) => {
    return (val * currencyInfo.rate).toLocaleString(locale, { style: 'currency', currency: currencyCode });
  };

  return (
    <div className="bg-white rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in duration-500">
      <div className="px-10 py-6 bg-slate-900 text-white flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex flex-wrap items-center gap-4">
          <h2 className="text-2xl font-black flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('items')}>
            <FileText size={24} /> {initialData ? t.saveBudget : t.newBudget} 
            {initialData && <span className="text-xs bg-white/20 px-3 py-1 rounded-full uppercase ml-2">#{initialData.id}</span>}
          </h2>
          <div className="h-8 w-[1px] bg-white/20 hidden lg:block" />
          
          <div className="flex items-center gap-3 bg-white/10 px-4 py-1.5 rounded-full">
            <Calendar size={14} className="text-blue-400" />
            <span className="text-[10px] font-black uppercase tracking-widest">{t.date}:</span>
            <input 
              type="date" 
              value={budgetDate} 
              onChange={e => setBudgetDate(e.target.value)}
              className="bg-transparent text-[10px] font-black uppercase outline-none cursor-pointer text-white [color-scheme:dark]"
            />
          </div>

          <div className="flex items-center gap-3 bg-white/10 px-4 py-1.5 rounded-full">
            <Tag size={14} className="text-amber-400" />
            <span className="text-[10px] font-black uppercase tracking-widest">{t.budgetStatusLabel}:</span>
            <select 
              value={status} 
              onChange={e => setStatus(e.target.value as BudgetStatus)}
              className="bg-transparent text-[10px] font-black uppercase outline-none cursor-pointer text-white"
            >
              <option value={BudgetStatus.PENDING} className="text-slate-900">{t.statusPending}</option>
              <option value={BudgetStatus.APPROVED} className="text-slate-900">{t.statusApproved}</option>
              <option value={BudgetStatus.REJECTED} className="text-slate-900">{t.statusRejected}</option>
            </select>
          </div>

          <div className="flex gap-2">
            <button 
              type="button"
              onClick={() => setActiveTab('items')}
              className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all shadow-sm ${
                activeTab === 'items' ? 'bg-white text-slate-900 scale-105' : 'bg-white/10 text-white/70 hover:bg-white/20'
              }`}
            >
              <Briefcase size={16} /> {t.serviceItems}
            </button>
            <button 
              type="button"
              onClick={() => setActiveTab('expenses')}
              className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all shadow-sm ${
                activeTab === 'expenses' ? 'bg-red-50 text-white scale-105' : 'bg-white/10 text-white/70 hover:bg-white/20'
              }`}
            >
              <Wallet size={16} /> {t.recordExpenses}
            </button>
            <button 
              type="button"
              onClick={() => setActiveTab('payments')}
              className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all shadow-sm ${
                activeTab === 'payments' ? 'bg-emerald-50 text-white scale-105' : 'bg-white/10 text-white/70 hover:bg-white/20'
              }`}
            >
              <CreditCard size={16} /> {t.recordPayments}
            </button>
          </div>
        </div>
        <button type="button" onClick={onCancel} className="p-2 hover:bg-white/10 rounded-full transition-colors"><X size={24} /></button>
      </div>

      <form onSubmit={handleSubmit} className="p-10 space-y-12">
        <section className="space-y-6">
          <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 px-1"><User size={16} /> {t.clientIdentification}</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 ml-1">{t.clientName}</label>
              <input required type="text" value={clientName} onChange={e => setClientName(e.target.value)} placeholder={t.clientPlaceholder} className="w-full px-5 py-3.5 rounded-2xl bg-slate-50 border-2 border-slate-100 outline-none focus:border-slate-900 transition-all font-bold" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 ml-1">{t.contactName}</label>
              <input required type="text" value={contactName} onChange={e => setContactName(e.target.value)} placeholder={t.contactPlaceholder} className="w-full px-5 py-3.5 rounded-2xl bg-slate-50 border-2 border-slate-100 outline-none focus:border-slate-900 transition-all font-bold" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 ml-1">{t.phone}</label>
              <input required type="tel" value={contactPhone} onChange={e => setContactPhone(e.target.value)} placeholder={t.phonePlaceholder} className="w-full px-5 py-3.5 rounded-2xl bg-slate-50 border-2 border-slate-100 outline-none focus:border-slate-900 transition-all font-bold" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 ml-1">{t.clientNif}</label>
              <input type="text" value={clientNif} onChange={e => setClientNif(e.target.value)} placeholder={t.nifPlaceholder} className="w-full px-5 py-3.5 rounded-2xl bg-slate-50 border-2 border-slate-100 outline-none focus:border-slate-900 transition-all font-bold" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 ml-1 flex items-center gap-1"><MapPin size={12} /> {t.workLocation}</label>
              <input type="text" value={workLocation} onChange={e => setWorkLocation(e.target.value)} placeholder={t.locationPlaceholder} className="w-full px-5 py-3.5 rounded-2xl bg-slate-50 border-2 border-slate-100 outline-none focus:border-slate-900 transition-all font-bold" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 ml-1 flex items-center gap-1"><Hash size={12} /> {t.workNumber}</label>
              <input type="text" value={workNumber} onChange={e => setWorkNumber(e.target.value)} placeholder={t.numberPlaceholder} className="w-full px-5 py-3.5 rounded-2xl bg-slate-50 border-2 border-slate-100 outline-none focus:border-slate-900 transition-all font-bold" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 ml-1 flex items-center gap-1"><Mail size={12} /> {t.workPostalCode}</label>
              <input type="text" value={workPostalCode} onChange={e => setWorkPostalCode(e.target.value)} placeholder={t.postalCodePlaceholder} className="w-full px-5 py-3.5 rounded-2xl bg-slate-50 border-2 border-slate-100 outline-none focus:border-slate-900 transition-all font-bold" />
            </div>
          </div>
        </section>

        {activeTab === 'items' && (
          <div className="space-y-12 animate-in fade-in duration-300">
            <section className="space-y-6">
              <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 px-1"><Briefcase size={16} /> {t.servicesIncluded}</h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-4">
                {SERVICE_CATEGORIES.map(category => (
                  <button 
                    key={category.id} 
                    type="button" 
                    onClick={() => toggleService(category.id)} 
                    className={`flex flex-col items-center justify-center p-4 rounded-[1.5rem] border-2 transition-all group ${
                      selectedServices.includes(category.id) 
                      ? 'border-slate-900 bg-slate-900 text-white shadow-xl shadow-slate-900/10' 
                      : canAddService(category.id) 
                        ? 'border-slate-100 bg-white text-slate-500 hover:border-slate-300'
                        : 'border-slate-50 bg-slate-50 text-slate-200 cursor-not-allowed'
                    }`}
                  >
                    <div className="mb-2">{category.icon}</div>
                    <span className="text-[9px] font-black uppercase">{getTranslatedServiceLabel(category.id)}</span>
                  </button>
                ))}
              </div>
            </section>

            <section className="space-y-6">
              <div className="flex flex-wrap justify-between items-end px-1 gap-4">
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><Plus size={16} /> {t.serviceItems}</h4>
                <div className="flex flex-wrap items-center gap-4 sm:gap-6">
                   <div className="flex items-center gap-3 bg-slate-50 px-4 py-2 rounded-xl border border-slate-100">
                      <input 
                        type="checkbox" 
                        id="includeIva"
                        checked={includeIva} 
                        onChange={e => setIncludeIva(e.target.checked)} 
                        className="w-5 h-5 accent-slate-900 rounded"
                      />
                      <label htmlFor="includeIva" className="text-[10px] font-black text-slate-500 uppercase tracking-widest cursor-pointer select-none">{t.includeIva}</label>
                   </div>
                   {includeIva && (
                     <div className="flex items-center gap-3 bg-slate-50 px-4 py-2 rounded-xl border border-slate-100 animate-in fade-in slide-in-from-right-2 duration-300">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{t.ivaRate}</label>
                        <input 
                          type="number" 
                          value={ivaPercentage === 0 ? '' : ivaPercentage} 
                          onChange={e => setIvaPercentage(e.target.value === '' ? 0 : Number(e.target.value))} 
                          placeholder="0"
                          className="w-16 bg-transparent outline-none font-black text-slate-900"
                        />
                     </div>
                   )}
                   <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">{t.currencyLabel}: <span className="text-slate-900 font-black">{currencyCode}</span></div>
                </div>
              </div>
              
              <div className="overflow-x-auto border-2 border-slate-100 rounded-[2rem]">
                <table className="w-full border-collapse min-w-[900px]">
                  <thead>
                    <tr className="text-left text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50">
                      <th className="p-5 border-b border-slate-100">{t.description}</th>
                      <th className="p-5 border-b border-slate-100 w-24">{t.quantity}</th>
                      <th className="p-5 border-b border-slate-100 w-44">{t.unitPrice}</th>
                      <th className="p-5 border-b border-slate-100 w-24">{t.unit}</th>
                      <th className="p-5 border-b border-slate-100 w-64 text-right">{t.total}</th>
                      <th className="p-5 border-b border-slate-100 w-16"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {items.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="p-5">
                          <input type="text" value={item.description} onChange={e => updateItem(item.id, 'description', e.target.value)} className="w-full bg-transparent outline-none font-bold text-slate-900" placeholder={t.descriptionPlaceholder} />
                        </td>
                        <td className="p-5">
                          <input type="number" value={item.quantity === 0 ? '' : item.quantity} onChange={e => updateItem(item.id, 'quantity', e.target.value === '' ? 0 : Number(e.target.value))} placeholder="0" className="w-full bg-transparent outline-none font-black text-slate-900" />
                        </td>
                        <td className="p-5">
                          <div className="flex items-center gap-1">
                            <span className="text-[10px] font-black text-slate-400">{currencyInfo.symbol}</span>
                            <input 
                              type="number" 
                              step="0.01" 
                              value={item.pricePerUnit === 0 ? '' : (item.pricePerUnit * currencyInfo.rate)} 
                              onChange={e => updateItem(item.id, 'pricePerUnit', e.target.value === '' ? 0 : Number(e.target.value) / currencyInfo.rate)} 
                              placeholder="0.00"
                              className="w-full bg-transparent outline-none font-black" 
                            />
                          </div>
                        </td>
                        <td className="p-5">
                          <input type="text" value={item.unit} onChange={e => updateItem(item.id, 'unit', e.target.value)} className="w-full bg-transparent outline-none font-bold text-slate-500" placeholder={t.unitDefault} />
                        </td>
                        <td className="p-5 font-black text-slate-900 text-right whitespace-nowrap text-lg">
                          {formatValue(item.total)}
                        </td>
                        <td className="p-5 text-right">
                          <button type="button" onClick={() => removeItem(item.id)} className="p-2 text-slate-200 hover:text-red-500 transition-all">
                            <Trash2 size={18} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {canAddItem ? (
                <button type="button" onClick={addItem} className="w-full py-6 border-2 border-dashed border-slate-200 rounded-[2rem] text-slate-400 font-black uppercase tracking-widest text-xs hover:border-slate-900 hover:text-slate-900 transition-all flex items-center justify-center gap-2">
                  <Plus size={18} /> {t.addItem}
                </button>
              ) : (
                <div className="p-6 bg-amber-50 rounded-2xl border border-amber-100 text-xs font-bold text-amber-700 flex items-center gap-3">
                  <Crown size={16} className="text-amber-500" />
                  {t.itemsLimitReached}
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-8 mt-8">
                <div className="flex flex-col gap-6">
                  <div className="space-y-4">
                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 px-1">
                      <Clock size={16} /> {t.estimateValidity}
                    </h4>
                    <input 
                      type="text" 
                      value={validity} 
                      onChange={e => setValidity(e.target.value)} 
                      placeholder={t.validityPlaceholder}
                      className="w-full px-6 py-5 rounded-[2rem] bg-slate-50 border-2 border-slate-100 outline-none focus:border-slate-900 transition-all font-bold text-slate-700"
                    />
                  </div>
                  <div className="space-y-4">
                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 px-1">
                      <Banknote size={16} /> {t.paymentMethodLabel}
                    </h4>
                    <input 
                      type="text" 
                      value={paymentMethod} 
                      onChange={e => setPaymentMethod(e.target.value)} 
                      placeholder={t.paymentMethodPlaceholder}
                      className="w-full px-6 py-5 rounded-[2rem] bg-slate-50 border-2 border-slate-100 outline-none focus:border-slate-900 transition-all font-bold text-slate-700"
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 px-1">
                    <MessageSquare size={16} /> {t.observationsLabel}
                  </h4>
                  <textarea 
                    value={observations} 
                    onChange={e => setObservations(e.target.value)} 
                    placeholder={t.observationsPlaceholder}
                    className="w-full h-full px-6 py-5 rounded-[2rem] bg-slate-50 border-2 border-slate-100 outline-none focus:border-slate-900 transition-all font-bold text-slate-700 resize-none min-h-[220px]"
                  />
                </div>
              </div>
            </section>
          </div>
        )}

        {activeTab === 'expenses' && (
          <div className="space-y-8 animate-in fade-in duration-300">
            <div className="p-8 bg-red-50 rounded-[2rem] border border-red-100 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black text-red-400 uppercase tracking-widest mb-1">{t.totalExpenses}</p>
                <p className="text-3xl font-black text-red-600">{formatValue(totalExpenses)}</p>
              </div>
              <div className="p-4 bg-white/50 rounded-2xl"><Wallet className="text-red-500" size={32} /></div>
            </div>

            <div className="overflow-x-auto border-2 border-slate-100 rounded-[2rem]">
              <table className="w-full border-collapse min-w-[900px]">
                <thead>
                  <tr className="text-left text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50">
                    <th className="p-5 border-b border-slate-100">{t.description}</th>
                    <th className="p-5 border-b border-slate-100 w-32">{t.date}</th>
                    <th className="p-5 border-b border-slate-100 w-24 text-center">{t.quantity}</th>
                    <th className="p-5 border-b border-slate-100 w-44">{t.unitPrice}</th>
                    <th className="p-5 border-b border-slate-100 w-24">{t.unit}</th>
                    <th className="p-5 border-b border-slate-100 w-64 text-right">{t.total}</th>
                    <th className="p-5 border-b border-slate-100 w-16"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {expenses.map((expense) => (
                    <tr key={expense.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-5">
                        <input type="text" value={expense.description} onChange={e => updateExpense(expense.id, 'description', e.target.value)} className="w-full bg-transparent outline-none font-bold text-slate-900" placeholder={t.expenseDescription} />
                      </td>
                      <td className="p-5">
                        <input type="date" value={expense.date} onChange={e => updateExpense(expense.id, 'date', e.target.value)} className="w-full bg-transparent outline-none font-bold text-slate-500" />
                      </td>
                      <td className="p-5">
                        <input type="number" value={expense.quantity === 0 ? '' : expense.quantity} onChange={e => updateExpense(expense.id, 'quantity', e.target.value === '' ? 0 : Number(e.target.value))} placeholder="0" className="w-full bg-transparent outline-none font-black text-slate-900 text-center" />
                      </td>
                      <td className="p-5">
                        <div className="flex items-center gap-1">
                          <span className="text-[10px] font-black text-slate-400">{currencyInfo.symbol}</span>
                          <input 
                            type="number" 
                            step="0.01" 
                            value={expense.pricePerUnit === 0 ? '' : (expense.pricePerUnit * currencyInfo.rate)} 
                            onChange={e => updateExpense(expense.id, 'pricePerUnit', e.target.value === '' ? 0 : Number(e.target.value) / currencyInfo.rate)} 
                            placeholder="0.00"
                            className="w-full bg-transparent outline-none font-black" 
                          />
                        </div>
                      </td>
                      <td className="p-5">
                        <input type="text" value={expense.unit} onChange={e => updateExpense(expense.id, 'unit', e.target.value)} className="w-full bg-transparent outline-none font-bold text-slate-500" placeholder={t.unitDefault} />
                      </td>
                      <td className="p-5 font-black text-slate-900 text-right whitespace-nowrap text-lg">
                        {formatValue(expense.amount)}
                      </td>
                      <td className="p-5 text-right">
                        <button type="button" onClick={() => removeExpense(expense.id)} className="p-2 text-slate-200 hover:text-red-500 transition-all">
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {canAddExpense ? (
              <button type="button" onClick={addExpense} className="w-full py-6 border-2 border-dashed border-slate-200 rounded-[2rem] text-slate-400 font-black uppercase tracking-widest text-xs hover:border-red-500 hover:text-red-500 transition-all flex items-center justify-center gap-2">
                <Plus size={18} /> {t.addExpense}
              </button>
            ) : (
              <div className="p-6 bg-amber-50 rounded-2xl border border-amber-100 text-xs font-bold text-amber-700 flex items-center gap-3">
                <Crown size={16} className="text-amber-500" />
                {t.expenseLimitReached}
              </div>
            )}
          </div>
        )}

        {activeTab === 'payments' && (
          <div className="space-y-8 animate-in fade-in duration-300">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-8 bg-emerald-50 rounded-[2rem] border border-emerald-100 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-1">{t.totalReceived}</p>
                  <p className="text-3xl font-black text-emerald-600">{formatValue(totalPaid)}</p>
                </div>
                <div className="p-4 bg-white/50 rounded-2xl"><CreditCard className="text-emerald-500" size={32} /></div>
              </div>
              <div className="p-8 bg-slate-900 rounded-[2rem] border border-slate-800 flex items-center justify-between text-white">
                <div>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{t.remaining}</p>
                  <p className="text-3xl font-black text-white">{formatValue(remainingToPay)}</p>
                </div>
                <div className="p-4 bg-white/10 rounded-2xl"><DollarSign className="text-amber-400" size={32} /></div>
              </div>
            </div>

            <div className="overflow-x-auto border-2 border-slate-100 rounded-[2rem]">
              <table className="w-full border-collapse min-w-[700px]">
                <thead>
                  <tr className="text-left text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50">
                    <th className="p-5 border-b border-slate-100 w-48">{t.date}</th>
                    <th className="p-5 border-b border-slate-100">{t.amountLabel}</th>
                    <th className="p-5 border-b border-slate-100 w-24 text-center">%</th>
                    <th className="p-5 border-b border-slate-100 w-48 text-center">{t.proofLabel}</th>
                    <th className="p-5 border-b border-slate-100 w-16"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {payments.map((payment) => (
                    <tr key={payment.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-5">
                        <input type="date" value={payment.date} onChange={e => updatePayment(payment.id, 'date', e.target.value)} className="w-full bg-transparent outline-none font-bold text-slate-500" />
                      </td>
                      <td className="p-5">
                        <div className="flex items-center gap-1">
                          <span className="text-[10px] font-black text-slate-400">{currencyInfo.symbol}</span>
                          <input 
                            type="number" 
                            step="0.01" 
                            value={payment.amount === 0 ? '' : (payment.amount * currencyInfo.rate)} 
                            onChange={e => updatePayment(payment.id, 'amount', e.target.value === '' ? 0 : Number(e.target.value) / currencyInfo.rate)} 
                            placeholder="0.00"
                            className="bg-transparent outline-none font-black w-full text-lg" 
                          />
                        </div>
                      </td>
                      <td className="p-5 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <span className="inline-block px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-black">
                            {totalAmount > 0 ? ((payment.amount / totalAmount) * 100).toFixed(1) : '0'}%
                          </span>
                        </div>
                      </td>
                      <td className="p-5 text-center">
                        <button type="button" className="text-[10px] font-black uppercase text-slate-400 hover:text-slate-900 transition-colors flex items-center gap-2 mx-auto">
                          <Upload size={14} /> {t.uploadProofBtn}
                        </button>
                      </td>
                      <td className="p-5 text-right">
                        <button type="button" onClick={() => removePayment(payment.id)} className="p-2 text-slate-200 hover:text-red-500 transition-all">
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {canAddPayment ? (
              <button type="button" onClick={addPayment} className="w-full py-6 border-2 border-dashed border-slate-200 rounded-[2rem] text-slate-400 font-black uppercase tracking-widest text-xs hover:border-emerald-500 hover:text-emerald-500 transition-all flex items-center justify-center gap-2">
                <Plus size={18} /> {t.registerPayment}
              </button>
            ) : (
              <div className="p-6 bg-amber-50 rounded-2xl border border-amber-100 text-xs font-bold text-amber-700 flex items-center gap-3">
                <Crown size={16} className="text-amber-500" />
                {t.paymentLimitReached}
              </div>
            )}
          </div>
        )}

        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-stretch p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100 gap-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12 w-full">
            {includeIva && (
              <div className="space-y-1">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.ivaValue} ({ivaPercentage}%)</p>
                <p className="text-2xl font-black text-slate-600 break-all">{formatValue(ivaValue)}</p>
              </div>
            )}
            <div className="space-y-1">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.total}</p>
              <p className="text-4xl font-black text-slate-900 break-all">{formatValue(totalAmount)}</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.totalExpenses}</p>
              <p className="text-2xl font-black text-red-500 break-all">{formatValue(totalExpenses)}</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.totalReceived}</p>
              <p className="text-2xl font-black text-emerald-600 break-all">{formatValue(totalPaid)}</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.profitEstimate}</p>
              <p className="text-2xl font-black text-blue-600 break-all">{formatValue(estimatedProfit)}</p>
            </div>
          </div>
          
          <div className="flex flex-col gap-4 w-full xl:w-80 shrink-0 pt-8 xl:pt-0 border-t xl:border-t-0 xl:border-l border-slate-200 xl:pl-8">
            <button type="submit" className="w-full py-6 rounded-3xl bg-slate-900 text-white font-black text-2xl hover:bg-slate-800 transition-all shadow-2xl">
              {t.saveBudget}
            </button>
            <button type="button" onClick={onCancel} className="w-full py-4 rounded-3xl border-2 border-slate-200 bg-white font-black text-slate-600 hover:bg-slate-50 transition-all">
              {t.cancel}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default BudgetForm;
