import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Users, 
  TrendingUp, 
  ShieldCheck, 
  Calendar, 
  ArrowLeft,
  Bell,
  Upload,
  Trash2,
  CheckCircle,
  X,
  Lock,
  Unlock,
  AlertCircle,
  MessageSquare,
  Send,
  Loader2,
  Ticket,
  Percent,
  LayoutDashboard,
  ArrowUpRight,
  UserPlus,
  Ban,
  CreditCard
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell,
  PieChart,
  Pie
} from 'recharts';
import { Company, PlanType, AudienceType, GlobalNotification, SupportMessage, Transaction, Coupon } from '../types';
import { 
  getStoredCompanies, 
  saveCompany, 
  removeCompany,
  getGlobalNotifications, 
  saveGlobalNotifications, 
  getMessages, 
  saveMessage, 
  markMessagesAsRead,
  getTransactions,
  getCoupons,
  saveCoupon,
  removeCoupon
} from '../services/storage';
import { supabase } from '../services/supabase';
import { Locale, translations } from '../translations';
import { translateMessage } from '../services/gemini';

interface MasterPanelProps {
  onLogout: () => void;
  locale: Locale;
}

const MasterPanel: React.FC<MasterPanelProps> = ({ onLogout, locale }) => {
  const t = translations[locale];
  const [activeTab, setActiveTab] = useState<'home' | 'users' | 'notifications' | 'messages' | 'coupons'>('home');
  const [activeNotifications, setActiveNotifications] = useState<GlobalNotification[]>([]);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [targetAudience, setTargetAudience] = useState<AudienceType>('all');
  const [companies, setCompanies] = useState<Company[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  
  const [lastMessageAlert, setLastMessageAlert] = useState<{name: string, content: string} | null>(null);
  const [lastUnlockAlert, setLastUnlockAlert] = useState<string | null>(null);
  
  const prevUnlockCount = useRef(0);
  const prevUnreadCount = useRef(0);
  const companiesRef = useRef<Company[]>([]);

  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null);
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [manualUserName, setManualUserName] = useState('');
  const [manualUserEmail, setManualUserEmail] = useState('');
  const [manualUserPass, setManualUserPass] = useState('');
  const [manualUserPlan, setManualUserPlan] = useState<PlanType>(PlanType.PREMIUM_MONTHLY);
  const [manualProofPreview, setManualProofPreview] = useState<string | null>(null);
  const [showProofModal, setShowProofModal] = useState<string | null>(null);

  const [newCouponCode, setNewCouponCode] = useState('');
  const [newCouponDiscount, setNewCouponDiscount] = useState(10);

  const loadData = () => {
    setActiveNotifications(getGlobalNotifications());
    const allCompanies = getStoredCompanies().filter(c => c.email !== 'jeferson.goes36@gmail.com');
    
    // Alertas de Desbloqueio
    const unlockCount = allCompanies.filter(c => c.unlockRequested).length;
    if (unlockCount > prevUnlockCount.current) {
       const newReq = allCompanies.find(c => c.unlockRequested && !companiesRef.current.find(old => old.id === c.id && old.unlockRequested));
       if (newReq) setLastUnlockAlert(newReq.name);
    }
    prevUnlockCount.current = unlockCount;

    // Alertas de Mensagem
    const allMsgs = getMessages();
    const unreadMessages = allMsgs.filter(m => m.senderRole === 'user' && !m.read);
    const unreadCount = unreadMessages.length;
    if (unreadCount > prevUnreadCount.current) {
       const last = unreadMessages[unreadMessages.length - 1];
       const sender = allCompanies.find(c => c.id === last.companyId);
       if (sender && activeTab !== 'messages') setLastMessageAlert({ name: sender.name, content: last.content });
    }
    prevUnreadCount.current = unreadCount;

    setCompanies(allCompanies);
    companiesRef.current = allCompanies;
    setTransactions(getTransactions().sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    setCoupons(getCoupons());

    if (selectedCompanyId) {
      setMessages(getMessages(selectedCompanyId));
    }
  };

  useEffect(() => {
    loadData();

    // Subscrição para novas mensagens (todas, para o Master)
    const msgChannel = supabase
      .channel('master-messages')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'messages' },
        (payload) => {
          const newMessage = payload.new as SupportMessage;
          if (!newMessage || !newMessage.id) return;
          
          // Atualizar localStorage
          const allMsgs = getMessages();
          const existingIdx = allMsgs.findIndex(m => m.id === newMessage.id);
          if (existingIdx === -1) {
            allMsgs.push(newMessage);
          } else {
            allMsgs[existingIdx] = { ...allMsgs[existingIdx], ...newMessage };
          }
          localStorage.setItem('atrios_messages', JSON.stringify(allMsgs));

          // Se for do usuário, mostrar alerta se não estiver no chat dele
          if (newMessage.senderRole === 'user' && payload.eventType === 'INSERT') {
            const allCompanies = getStoredCompanies();
            const sender = allCompanies.find(c => c.id === newMessage.companyId);
            if (sender && (activeTab !== 'messages' || selectedCompanyId !== newMessage.companyId)) {
              setLastMessageAlert({ name: sender.name, content: newMessage.content });
            }
          }

          // Recarregar mensagens se o chat estiver aberto
          if (selectedCompanyId === newMessage.companyId) {
            setMessages(getMessages(selectedCompanyId));
          }
        }
      )
      .subscribe();

    // Subscrição para mudanças nas empresas (pedidos de desbloqueio)
    const companyChannel = supabase
      .channel('master-companies')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'companies' },
        (payload) => {
          const updatedCompany = payload.new as Company;
          if (!updatedCompany) return;
          
          // Atualizar localStorage
          const companies = getStoredCompanies();
          const idx = companies.findIndex(c => c.id === updatedCompany.id);
          if (idx > -1) {
            const old = companies[idx];
            if (!old.unlockRequested && updatedCompany.unlockRequested) {
              setLastUnlockAlert(updatedCompany.name);
            }
            companies[idx] = updatedCompany;
            localStorage.setItem('atrios_companies', JSON.stringify(companies));
            setCompanies(companies.filter(c => c.email !== 'jeferson.goes36@gmail.com'));
          }
        }
      )
      .subscribe();

    // Fallback polling para o Master
    const fallback = setInterval(loadData, 15000);

    return () => {
      supabase.removeChannel(msgChannel);
      supabase.removeChannel(companyChannel);
      clearInterval(fallback);
    };
  }, [activeTab, selectedCompanyId]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const pendingRequestsCount = useMemo(() => companies.filter(c => c.unlockRequested).length, [companies]);

  const unreadMessagesTotalCount = useMemo(() => {
    const allMsgs = getMessages();
    return allMsgs.filter(m => m.senderRole === 'user' && !m.read).length;
  }, [companies]);

  const financialStats = useMemo(() => {
    const totalRevenue = transactions.reduce((sum, tx) => sum + tx.totalAmount, 0);
    const totalIva = transactions.reduce((sum, tx) => sum + tx.ivaAmount, 0);
    const monthlySales = transactions.filter(tx => tx.planType === PlanType.PREMIUM_MONTHLY).reduce((sum, tx) => sum + tx.totalAmount, 0);
    const annualSales = transactions.filter(tx => tx.planType === PlanType.PREMIUM_ANNUAL).reduce((sum, tx) => sum + tx.totalAmount, 0);
    return { totalRevenue, totalIva, monthlySales, annualSales };
  }, [transactions]);

  const userStats = {
    total: companies.length,
    free: companies.filter(c => c.plan === PlanType.FREE).length,
    monthly: companies.filter(c => c.plan === PlanType.PREMIUM_MONTHLY).length,
    annual: companies.filter(c => c.plan === PlanType.PREMIUM_ANNUAL).length,
  };

  const chartDataPlans = [
    { name: t.planFree, value: userStats.free, color: '#94a3b8' },
    { name: t.planMonthly, value: userStats.monthly, color: '#3b82f6' },
    { name: t.planAnnual, value: userStats.annual, color: '#f59e0b' },
  ];

  const chartDataSales = [
    { name: t.planMonthly, value: financialStats.monthlySales },
    { name: t.planAnnual, value: financialStats.annualSales },
  ];

  const getAudienceLabel = (audience: AudienceType) => {
    switch (audience) {
      case 'all': return t.masterAudienceAll;
      case 'free': return t.masterAudienceFree;
      case 'premium_monthly': return t.masterAudienceMonthly;
      case 'premium_annual': return t.masterAudienceAnnual;
      case 'all_premium': return t.masterAudiencePremiumAll;
      default: return audience;
    }
  };

  const getTranslatedPlan = (plan: PlanType) => {
    switch (plan) {
      case PlanType.FREE: return t.planFree;
      case PlanType.PREMIUM_MONTHLY: return t.planMonthly;
      case PlanType.PREMIUM_ANNUAL: return t.planAnnual;
      default: return plan;
    }
  };

  const handleCreateCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCouponCode) return;
    saveCoupon({ id: Math.random().toString(36).substr(2, 9), code: newCouponCode.toUpperCase(), discountPercentage: newCouponDiscount, active: true, createdAt: new Date().toISOString() });
    setCoupons(getCoupons());
    setNewCouponCode('');
  };

  const handleDeleteCoupon = (id: string) => { removeCoupon(id); setCoupons(getCoupons()); };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedCompanyId || isTranslating) return;
    setIsTranslating(true);
    const targetComp = companies.find(c => c.id === selectedCompanyId);
    const targetLocale = (targetComp?.lastLocale as Locale) || 'pt-PT';
    let translated = newMessage;
    if (targetLocale !== 'pt-PT') translated = await translateMessage(newMessage, targetLocale);
    const msg: SupportMessage = { id: Math.random().toString(36).substr(2, 9), companyId: selectedCompanyId, senderRole: 'master', content: newMessage, translatedContent: translated, timestamp: new Date().toISOString(), read: false };
    saveMessage(msg);
    setMessages(prev => [...prev, msg]);
    setNewMessage('');
    setIsTranslating(false);
  };

  const selectChat = (companyId: string) => {
    setSelectedCompanyId(companyId);
    setMessages(getMessages(companyId));
    markMessagesAsRead(companyId, 'master');
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 200000) { alert(t.imageTooLarge); return; }
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const saveConfig = () => {
    if (!imagePreview) { alert(t.masterBannerSelectError); return; }
    const updated = [...activeNotifications, { id: Math.random().toString(36).substr(2, 9).toUpperCase(), imageUrl: imagePreview, targetAudience, active: true, createdAt: new Date().toISOString() }];
    saveGlobalNotifications(updated);
    setActiveNotifications(updated);
    setImagePreview(null);
    alert(t.masterConfigSuccess);
  };

  const removeNotification = (id: string) => {
    const updated = activeNotifications.filter(n => n.id !== id);
    saveGlobalNotifications(updated);
    setActiveNotifications(updated);
  };

  const toggleUnlock = (company: Company) => {
    const updated = { ...company, canEditSensitiveData: !company.canEditSensitiveData, unlockRequested: false };
    saveCompany(updated);
    loadData();
  };

  const toggleBlock = (company: Company) => { saveCompany({ ...company, isBlocked: !company.isBlocked }); loadData(); };

  const handleDeleteUser = (id: string, name: string) => {
    if (window.confirm(`${t.masterDeleteUser} "${name}"?`)) { removeCompany(id); setCompanies(prev => prev.filter(c => c.id !== id)); if (selectedCompanyId === id) setSelectedCompanyId(null); }
  };

  const handleManualUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualProofPreview) { alert(t.masterBannerSelectError); return; }
    saveCompany({ id: Math.random().toString(36).substr(2, 9).toUpperCase(), name: manualUserName, email: manualUserEmail, password: manualUserPass, plan: manualUserPlan, verified: true, createdAt: new Date().toISOString(), isManual: true, manualPaymentProof: manualProofPreview, subscriptionExpiresAt: manualUserPlan === PlanType.FREE ? undefined : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() });
    loadData();
    setShowAddUserModal(false);
    setManualUserName(''); setManualUserEmail(''); setManualUserPass(''); setManualProofPreview(null);
    alert(t.masterManualUserCreated);
  };

  const getDaysInfo = (company: Company) => {
    if (!company.firstLoginAt) return t.masterWaitingLogin;
    const now = Date.now();
    const firstLogin = new Date(company.firstLoginAt).getTime();
    if (company.plan === PlanType.FREE) return `${Math.floor((now - firstLogin) / 86400000)} ${t.masterDaysOfUse}`;
    if (company.subscriptionExpiresAt) return `${Math.max(0, Math.ceil((new Date(company.subscriptionExpiresAt).getTime() - now) / 86400000))} ${t.masterDaysRemaining}`;
    return "-";
  };

  const getUnreadCount = (companyId: string) => {
    return getMessages(companyId).filter(m => m.senderRole === 'user' && !m.read).length;
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-8 font-sans relative">
      
      {lastMessageAlert && (
        <div className="fixed top-8 left-1/2 -translate-x-1/2 z-[10002] bg-blue-600 text-white px-8 py-4 rounded-[2rem] shadow-2xl flex items-center gap-4 animate-in slide-in-from-top border border-blue-400">
           <MessageSquare size={24} className="animate-bounce" />
           <div><p className="font-black text-xs uppercase tracking-widest">{lastMessageAlert.name}</p><p className="text-[10px] font-bold opacity-80 truncate max-w-[200px]">{lastMessageAlert.content}</p></div>
           <button onClick={() => { setActiveTab('messages'); setLastMessageAlert(null); }} className="px-4 py-2 bg-white/20 rounded-xl text-[10px] font-black uppercase tracking-widest">{t.viewProof}</button>
           <button onClick={() => setLastMessageAlert(null)}><X size={18} /></button>
        </div>
      )}

      {lastUnlockAlert && (
        <div className="fixed top-8 left-1/2 -translate-x-1/2 z-[10002] bg-amber-600 text-white px-8 py-4 rounded-[2rem] shadow-2xl flex items-center gap-4 animate-in slide-in-from-top border border-amber-400">
           <AlertCircle size={24} className="animate-pulse" />
           <div><p className="font-black text-xs uppercase tracking-widest">{t.notifyMasterUnlockRequest}</p><p className="text-[10px] font-bold opacity-80">{lastUnlockAlert}</p></div>
           <button onClick={() => { setActiveTab('users'); setLastUnlockAlert(null); }} className="px-4 py-2 bg-white/20 rounded-xl text-[10px] font-black uppercase tracking-widest">{t.viewProof}</button>
           <button onClick={() => setLastUnlockAlert(null)}><X size={18} /></button>
        </div>
      )}

      {showProofModal && (
        <div className="fixed inset-0 z-[10001] flex items-center justify-center bg-slate-950/95 p-12 backdrop-blur-md animate-in fade-in">
           <button onClick={() => setShowProofModal(null)} className="absolute top-8 right-8 p-4 bg-white/10 rounded-full hover:bg-red-500"><X size={32} /></button>
           <div className="max-w-4xl w-full h-full flex flex-col items-center justify-center gap-6"><h3 className="text-3xl font-black italic">{t.masterViewPaymentProof}</h3><div className="flex-1 w-full bg-white/5 rounded-[3rem] overflow-hidden border border-white/10 shadow-2xl"><img src={showProofModal} className="w-full h-full object-contain p-4" alt="Comprovativo" /></div></div>
        </div>
      )}

      {showAddUserModal && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-slate-950/80 p-6 backdrop-blur-sm animate-in fade-in">
           <div className="bg-slate-900 w-full max-w-2xl rounded-[3rem] border border-white/10 shadow-2xl overflow-hidden">
              <div className="p-8 border-b border-white/10 flex justify-between items-center bg-white/5"><h2 className="text-2xl font-black italic flex items-center gap-3 text-amber-500 uppercase"><UserPlus size={28} /> {t.masterCreateManualUser}</h2><button onClick={() => setShowAddUserModal(false)} className="p-2 hover:bg-white/10 rounded-full"><X size={24} /></button></div>
              <form onSubmit={handleManualUserSubmit} className="p-10 space-y-8 max-h-[70vh] overflow-y-auto no-scrollbar">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <input required type="text" value={manualUserName} onChange={e => setManualUserName(e.target.value)} placeholder={t.companyLabel} className="bg-white/5 border border-white/10 rounded-2xl px-5 py-3.5 outline-none font-bold" />
                    <input required type="email" value={manualUserEmail} onChange={e => setManualUserEmail(e.target.value)} placeholder={t.emailLabel} className="bg-white/5 border border-white/10 rounded-2xl px-5 py-3.5 outline-none font-bold" />
                    <input required type="password" value={manualUserPass} onChange={e => setManualUserPass(e.target.value)} placeholder={t.passwordLabel} className="bg-white/5 border border-white/10 rounded-2xl px-5 py-3.5 outline-none font-bold" />
                    <select value={manualUserPlan} onChange={e => setManualUserPlan(e.target.value as PlanType)} className="bg-white/5 border border-white/10 rounded-2xl px-5 py-3.5 outline-none font-bold uppercase text-xs">
                       <option value={PlanType.FREE}>{t.planFree}</option><option value={PlanType.PREMIUM_MONTHLY}>{t.planMonthly}</option><option value={PlanType.PREMIUM_ANNUAL}>{t.planAnnual}</option>
                    </select>
                 </div>
                 <label className={`border-4 border-dashed border-white/10 rounded-[2.5rem] p-10 flex flex-col items-center justify-center cursor-pointer hover:bg-white/5 h-48 relative ${manualProofPreview ? 'bg-emerald-500/5' : ''}`}>{manualProofPreview ? <img src={manualProofPreview} className="h-24 rounded-lg shadow-xl" /> : <div className="flex flex-col items-center"><Upload size={24} className="mb-2 text-slate-400" /><span className="text-[10px] font-black uppercase">{t.masterUploadClick}</span></div>}<input required type="file" className="hidden" accept="image/*" onChange={e => {const f=e.target.files?.[0]; if(f){const r=new FileReader(); r.onloadend=()=>setManualProofPreview(r.result as string); r.readAsDataURL(f);}}} /></label>
                 <div className="flex gap-4"><button type="submit" className="flex-1 py-5 bg-amber-500 text-slate-950 rounded-[1.5rem] font-black text-lg hover:bg-amber-400 shadow-xl uppercase">{t.masterAddUser}</button><button type="button" onClick={() => setShowAddUserModal(false)} className="px-10 py-5 bg-white/5 rounded-[1.5rem] font-black text-sm uppercase">{t.cancel}</button></div>
              </form>
           </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto space-y-10">
        <div className="flex flex-col md:flex-row justify-between items-center border-b border-white/10 pb-8 gap-8">
          <div className="flex items-center gap-4"><div className="bg-amber-500 p-3 rounded-2xl shadow-lg shadow-amber-500/20"><ShieldCheck size={32} className="text-slate-950" /></div><div><h1 className="text-4xl font-black tracking-tighter italic uppercase">{t.masterPanelTitle}</h1><p className="text-slate-400 font-bold uppercase tracking-widest text-xs">{t.masterPanelSub}</p></div></div>
          <nav className="flex bg-white/5 p-1 rounded-2xl border border-white/10">
            {[
              { id: 'home', label: t.masterHomeTab, icon: LayoutDashboard },
              { id: 'users', label: t.masterUsersTab, icon: Users },
              { id: 'messages', label: t.masterMessagesTab, icon: MessageSquare },
              { id: 'coupons', label: t.masterCouponsTab, icon: Ticket },
              { id: 'notifications', label: t.masterNotificationsTab, icon: Bell },
            ].map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`relative px-6 py-2.5 rounded-xl font-black text-xs uppercase transition-all flex items-center gap-2 ${activeTab === tab.id ? 'bg-amber-50 text-slate-950 shadow-lg' : 'text-slate-400 hover:text-white'}`}>
                <tab.icon size={16} /> {tab.label}
                {tab.id === 'users' && pendingRequestsCount > 0 && <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-[10px] border-2 border-slate-950 animate-bounce">{pendingRequestsCount}</span>}
                {tab.id === 'messages' && unreadMessagesTotalCount > 0 && <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-[10px] border-2 border-slate-950 animate-pulse">{unreadMessagesTotalCount}</span>}
              </button>
            ))}
            <button onClick={onLogout} className="ml-2 px-6 py-2.5 hover:bg-red-500/20 text-red-400 rounded-xl transition-all font-black text-xs uppercase"><ArrowLeft size={16} className="inline mr-2" /> {t.logout}</button>
          </nav>
        </div>

        {activeTab === 'home' && (
          <div className="space-y-10 animate-in fade-in">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white/5 border border-white/10 p-8 rounded-[2.5rem]"><TrendingUp className="text-emerald-400 mb-4" /><p className="text-[10px] text-slate-500 uppercase font-black mb-1">{t.salesInPeriod}</p><p className="text-3xl font-black">{financialStats.totalRevenue.toLocaleString(locale, { style: 'currency', currency: 'EUR' })}</p></div>
              <div className="bg-white/5 border border-white/10 p-8 rounded-[2.5rem]"><ArrowUpRight className="text-blue-400 mb-4" /><p className="text-[10px] text-slate-500 uppercase font-black mb-1">{t.masterTotalIva}</p><p className="text-3xl font-black">{financialStats.totalIva.toLocaleString(locale, { style: 'currency', currency: 'EUR' })}</p></div>
              <div className="bg-white/5 border border-white/10 p-8 rounded-[2.5rem]"><Users className="text-amber-400 mb-4" /><p className="text-[10px] text-slate-500 uppercase font-black mb-1">{t.masterTotalUsers}</p><p className="text-3xl font-black">{userStats.total}</p></div>
              <div className="bg-white/5 border border-white/10 p-8 rounded-[2.5rem]"><CreditCard className="text-purple-400 mb-4" /><p className="text-[10px] text-slate-500 uppercase font-black mb-1">{t.masterPremiumUsers}</p><p className="text-3xl font-black">{userStats.monthly + userStats.annual}</p></div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
               <div className="bg-white/5 border border-white/10 p-10 rounded-[3rem] h-[400px]"><h3 className="text-sm font-black uppercase mb-8 italic">{t.salesInPeriod}</h3><ResponsiveContainer width="100%" height="80%"><BarChart data={chartDataSales}><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff10" /><XAxis dataKey="name" tick={{fill: '#94a3b8', fontSize: 11}} /><YAxis tick={{fill: '#94a3b8', fontSize: 11}} /><Tooltip contentStyle={{backgroundColor: '#0f172a', border: 'none', borderRadius: '12px'}} /><Bar dataKey="value" fill="#3b82f6" radius={[8, 8, 0, 0]} /></BarChart></ResponsiveContainer></div>
               <div className="bg-white/5 border border-white/10 p-10 rounded-[3rem] h-[400px]"><h3 className="text-sm font-black uppercase mb-8 italic">{t.masterPlanDistribution}</h3><ResponsiveContainer width="100%" height="80%"><PieChart><Pie data={chartDataPlans} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">{chartDataPlans.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}</Pie><Tooltip /></PieChart></ResponsiveContainer></div>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="bg-white/5 border border-white/10 rounded-[3rem] overflow-hidden animate-in fade-in">
            <div className="p-8 border-b border-white/10 flex justify-between items-center bg-white/5"><h2 className="text-xl font-black flex items-center gap-3 italic text-amber-500 uppercase"><Users size={24} /> {t.masterUserManagement}</h2><button onClick={() => setShowAddUserModal(true)} className="px-6 py-3 bg-amber-500 text-slate-950 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-amber-400 flex items-center gap-2"><UserPlus size={18} /> {t.masterAddUser}</button></div>
            <div className="overflow-x-auto"><table className="w-full text-left"><thead><tr className="text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-white/5"><th className="px-8 py-6">{t.masterTableIdCompany}</th><th className="px-8 py-6">{t.masterTableEmail}</th><th className="px-8 py-6">{t.masterTablePlan}</th><th className="px-8 py-6">{t.masterTableStatus}</th><th className="px-8 py-6 text-right">{t.masterTableActions}</th></tr></thead><tbody className="divide-y divide-white/5">{companies.map(user => (<tr key={user.id} className={`hover:bg-white/5 transition-colors group ${user.isBlocked ? 'opacity-50' : ''}`}><td className="px-8 py-6"><div className="flex items-center gap-3"><div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black uppercase ${user.isBlocked ? 'bg-red-500/20 text-red-500' : 'bg-white/10 text-amber-500'}`}>{user.name.charAt(0)}</div><div><p className="font-black text-sm">{user.name}</p><p className="text-[9px] font-bold text-slate-500 uppercase tracking-tighter">ID: {user.id}</p></div></div></td><td className="px-8 py-6 font-bold text-slate-400 text-sm">{user.email}</td><td className="px-8 py-6"><span className="text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full border border-amber-500/50 text-amber-500">{getTranslatedPlan(user.plan)}</span></td><td className="px-8 py-6"><p className="text-xs font-black text-emerald-400 flex items-center gap-2"><Calendar size={12} /> {getDaysInfo(user)}</p></td><td className="px-8 py-6 text-right"><div className="flex items-center justify-end gap-3">{getUnreadCount(user.id) > 0 && <button onClick={() => selectChat(user.id)} className="flex items-center gap-2 bg-blue-500 text-white px-3 py-1.5 rounded-xl text-[10px] font-black uppercase animate-pulse"><MessageSquare size={12} /> {getUnreadCount(user.id)}</button>}{user.unlockRequested && <span className="text-[8px] font-black uppercase bg-red-500 text-white px-2 py-1 rounded-md animate-pulse">{t.unlockRequestedNotify}</span>}<button onClick={() => toggleUnlock(user)} className={`p-2 rounded-xl transition-all ${user.canEditSensitiveData ? 'bg-emerald-500 text-slate-900' : 'bg-white/5 text-slate-400 hover:text-white'}`} title={t.masterUnlockAction}>{user.canEditSensitiveData ? <Unlock size={18} /> : <Lock size={18} />}</button><button onClick={() => toggleBlock(user)} className={`p-2 rounded-xl transition-all ${user.isBlocked ? 'bg-red-500 text-white' : 'bg-white/5 text-slate-400 hover:text-red-500'}`} title={t.masterBlockUser}><Ban size={18} /></button><button onClick={() => handleDeleteUser(user.id, user.name)} className="p-2 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all" title={t.masterDeleteUser}><Trash2 size={18} /></button></div></td></tr>))}</tbody></table></div>
          </div>
        )}

        {activeTab === 'messages' && (
          <div className="bg-white/5 border border-white/10 rounded-[3rem] overflow-hidden flex h-[600px] animate-in fade-in">
             <div className="w-80 border-r border-white/10 flex flex-col bg-slate-950/50"><div className="p-6 border-b border-white/10"><h3 className="font-black text-sm uppercase tracking-widest text-slate-400 italic">{t.masterChatConversations}</h3></div><div className="flex-1 overflow-y-auto no-scrollbar">{companies.map(comp => { const unread = getMessages(comp.id).filter(m => m.senderRole === 'user' && !m.read).length; return (<button key={comp.id} onClick={() => selectChat(comp.id)} className={`w-full p-6 text-left flex items-start gap-4 hover:bg-white/5 border-b border-white/5 ${selectedCompanyId === comp.id ? 'bg-white/10' : ''} relative`}><div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center font-black text-amber-500 shrink-0">{comp.name.charAt(0)}</div><div className="flex-1 min-w-0"><p className="font-black text-sm truncate">{comp.name}</p><p className="text-[10px] text-slate-500 truncate mt-1">{t.viewProof}</p></div>{unread > 0 && <span className="absolute top-6 right-6 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-[10px] font-black">{unread}</span>}</button>);})}</div></div>
             <div className="flex-1 flex flex-col bg-slate-900/20">{selectedCompanyId ? (<><div className="p-6 border-b border-white/10 bg-white/5 flex items-center gap-4"><div className="w-10 h-10 bg-amber-500 text-slate-950 rounded-xl flex items-center justify-center font-black">{companies.find(c => c.id === selectedCompanyId)?.name.charAt(0)}</div><p className="font-black italic">{companies.find(c => c.id === selectedCompanyId)?.name}</p></div><div className="flex-1 overflow-y-auto p-8 space-y-6 no-scrollbar">{messages.length === 0 ? <div className="h-full flex items-center justify-center text-slate-500 uppercase font-black text-[10px]">{t.supportNoMessages}</div> : messages.map(m => (<div key={m.id} className={`flex ${m.senderRole === 'master' ? 'justify-end' : 'justify-start'}`}><div className={`max-w-[70%] p-4 rounded-2xl text-sm font-medium ${m.senderRole === 'master' ? 'bg-amber-500 text-slate-950 rounded-tr-none' : 'bg-white/10 text-white rounded-tl-none border border-white/10'}`}>{m.senderRole === 'user' ? (m.translatedContent || m.content) : m.content}</div></div>))}<div ref={chatEndRef} /></div><form onSubmit={handleSendMessage} className="p-6 bg-white/5 border-t border-white/10 flex gap-4"><input disabled={isTranslating} type="text" value={newMessage} onChange={e => setNewMessage(e.target.value)} placeholder={t.supportChatPlaceholder} className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm font-bold outline-none" /><button type="submit" disabled={!newMessage.trim() || isTranslating} className="bg-amber-500 text-slate-950 p-4 rounded-2xl hover:scale-110 transition-all">{isTranslating ? <Loader2 className="animate-spin" /> : <Send />}</button></form></>) : <div className="flex-1 flex items-center justify-center opacity-40 uppercase font-black text-xs">{t.masterChatSelectUser}</div>}</div>
          </div>
        )}

        {activeTab === 'coupons' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 animate-in fade-in"><div className="bg-white/5 border border-white/10 p-10 rounded-[3rem] space-y-8"><h2 className="text-2xl font-black italic flex items-center gap-3 text-amber-500 uppercase"><Ticket size={28} /> {t.masterCouponCreate}</h2><form onSubmit={handleCreateCoupon} className="space-y-6"><div><label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">{t.masterCouponCode}</label><input required type="text" value={newCouponCode} onChange={e => setNewCouponCode(e.target.value)} placeholder="EX: ATRIOS20" className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm font-black outline-none uppercase" /></div><div><label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">{t.masterCouponDiscount}</label><div className="flex items-center gap-4"><input required type="range" min="5" max="90" step="5" value={newCouponDiscount} onChange={e => setNewCouponDiscount(Number(e.target.value))} className="flex-1 accent-amber-500" /><span className="w-20 text-center bg-white/10 py-3 rounded-xl font-black text-amber-500">{newCouponDiscount}%</span></div></div><button type="submit" className="w-full py-5 bg-amber-500 text-slate-950 rounded-[1.5rem] font-black text-lg hover:bg-amber-400 uppercase">{t.masterSaveActivate}</button></form></div><div className="bg-white/5 border border-white/10 p-10 rounded-[3rem] space-y-8"><h2 className="text-2xl font-black italic flex items-center gap-3 text-blue-400 uppercase"><Percent size={28} /> {t.masterCouponActive}</h2><div className="space-y-4 max-h-[400px] overflow-y-auto no-scrollbar">{coupons.length === 0 ? <div className="py-12 text-center text-slate-500 uppercase font-black text-xs border border-white/10 border-dashed rounded-[2rem]">{t.masterCouponEmpty}</div> : coupons.map(cp => (<div key={cp.id} className="bg-white/5 border border-white/10 p-6 rounded-[2rem] flex justify-between items-center group"><div className="flex items-center gap-6"><div className="w-14 h-14 bg-amber-500/10 text-amber-500 rounded-2xl flex items-center justify-center"><Ticket /></div><div><p className="text-xl font-black italic uppercase tracking-tighter">{cp.code}</p><p className="text-[10px] font-black text-emerald-400 uppercase">{cp.discountPercentage}% {t.masterDiscountOff}</p></div></div><button onClick={() => handleDeleteCoupon(cp.id)} className="p-4 text-red-500 rounded-xl hover:bg-red-500 transition-all"><Trash2 size={18} /></button></div>))}</div></div></div>
        )}

        {activeTab === 'notifications' && (
          <div className="space-y-10 animate-in fade-in"><div className="flex justify-center"><div className="bg-white/5 border border-white/10 rounded-[3rem] p-10 space-y-8 w-full max-w-2xl"><h2 className="text-2xl font-black italic flex items-center gap-3 text-amber-500 uppercase"><Bell size={28} /> {t.newAdBanner}</h2><div className="space-y-6"><label className="relative border-4 border-dashed border-white/10 rounded-[2rem] p-10 flex flex-col items-center justify-center gap-4 cursor-pointer hover:bg-white/5 transition-all overflow-hidden h-64">{imagePreview ? <img src={imagePreview} className="absolute inset-0 w-full h-full object-cover opacity-60" /> : <div className="flex flex-col items-center"><Upload size={32} className="text-slate-400 mb-2" /><span className="text-xs font-black uppercase">{t.masterUploadClick}</span></div>}<input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} /></label><div className="grid grid-cols-2 gap-3">{['all', 'free', 'premium_monthly', 'premium_annual', 'all_premium'].map(aud => (<button key={aud} onClick={() => setTargetAudience(aud as AudienceType)} className={`px-4 py-3 rounded-xl font-black text-[10px] uppercase border ${targetAudience === aud ? 'bg-amber-50 border-amber-500 text-slate-950' : 'bg-white/5 border-white/10 text-slate-400'}`}>{getAudienceLabel(aud as AudienceType)}</button>))}</div><button onClick={saveConfig} className="w-full py-5 bg-emerald-600 text-white rounded-[1.5rem] font-black text-lg hover:bg-emerald-500 shadow-xl flex items-center justify-center gap-3 uppercase"><CheckCircle size={22} /> {t.masterSaveActivate}</button></div></div></div><div className="bg-white/5 border border-white/10 rounded-[3rem] p-10 space-y-8"><h2 className="text-2xl font-black italic flex items-center gap-3 text-blue-400 uppercase"><Bell size={28} /> {t.activeBanners}</h2><div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">{activeNotifications.length === 0 ? (<div className="col-span-full py-12 text-center text-slate-500 uppercase font-black text-xs border border-white/10 border-dashed rounded-[2rem]">{t.noActiveBanners}</div>) : (activeNotifications.map(n => (<div key={n.id} className="bg-white/5 border border-white/10 rounded-[2rem] overflow-hidden group relative"><div className="aspect-video w-full relative"><img src={n.imageUrl} className="w-full h-full object-cover" alt="Banner" /><div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"><button onClick={() => removeNotification(n.id)} className="p-4 bg-red-500 text-white rounded-full hover:scale-110 transition-transform"><Trash2 size={24} /></button></div></div><div className="p-4 flex justify-between items-center bg-white/5"><span className="text-[10px] font-black uppercase text-amber-500">{getAudienceLabel(n.targetAudience)}</span><span className="text-[10px] font-black uppercase text-slate-500">{new Date(n.createdAt).toLocaleDateString(locale)}</span></div></div>)))}</div></div></div>
        )}
      </div>
    </div>
  );
};

export default MasterPanel;