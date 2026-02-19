
import React, { useMemo } from 'react';
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
import { Budget, BudgetStatus, PlanType, CurrencyCode, CURRENCIES } from '../types';
import { Locale, translations } from '../translations';
import { Lock, TrendingUp, DollarSign, Clock, CheckCircle } from 'lucide-react';

interface DashboardProps {
  budgets: Budget[];
  plan: PlanType;
  locale: Locale;
  currencyCode: CurrencyCode;
  onUpgrade: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ budgets, plan, locale, currencyCode, onUpgrade }) => {
  const t = translations[locale];
  const isPremium = plan !== PlanType.FREE;
  const currencyInfo = CURRENCIES[currencyCode];

  const stats = useMemo(() => {
    const approvedBudgets = budgets.filter(b => b.status === BudgetStatus.APPROVED || b.status === BudgetStatus.COMPLETED);
    const totalApprovedValue = approvedBudgets.reduce((sum, b) => sum + b.totalAmount, 0);

    const pendingBudgets = budgets.filter(b => b.status === BudgetStatus.PENDING);
    const totalPendingValue = pendingBudgets.reduce((sum, b) => sum + b.totalAmount, 0);

    const totalReceived = budgets.reduce((sum, b) => {
      const budgetPayments = (b.payments || []).reduce((pSum, p) => pSum + p.amount, 0);
      return sum + budgetPayments;
    }, 0);

    return { 
      totalApproved: totalApprovedValue * currencyInfo.rate, 
      totalPending: totalPendingValue * currencyInfo.rate, 
      totalReceived: totalReceived * currencyInfo.rate 
    };
  }, [budgets, currencyInfo]);

  const chartData = useMemo(() => {
    const lastSixMonths = [];
    const now = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthIndex = d.getMonth();
      const monthKeys: (keyof typeof t)[] = [
        'monthShort_jan', 'monthShort_feb', 'monthShort_mar', 'monthShort_apr', 
        'monthShort_may', 'monthShort_jun', 'monthShort_jul', 'monthShort_aug', 
        'monthShort_sep', 'monthShort_oct', 'monthShort_nov', 'monthShort_dec'
      ];
      const monthName = t[monthKeys[monthIndex]] as string;
      const monthKey = `${d.getFullYear()}-${d.getMonth()}`;
      
      const monthlyTotal = budgets
        .filter(b => {
          const bDate = new Date(b.createdAt);
          return bDate.getFullYear() === d.getFullYear() && bDate.getMonth() === d.getMonth();
        })
        .reduce((sum, b) => sum + b.totalAmount, 0);

      lastSixMonths.push({
        name: monthName,
        value: monthlyTotal * currencyInfo.rate,
        key: monthKey
      });
    }
    
    return lastSixMonths;
  }, [budgets, currencyInfo, locale, t]);

  const pieData = useMemo(() => {
    const approved = budgets.filter(b => b.status === BudgetStatus.APPROVED || b.status === BudgetStatus.COMPLETED).length;
    const pending = budgets.filter(b => b.status === BudgetStatus.PENDING).length;
    const rejected = budgets.filter(b => b.status === BudgetStatus.REJECTED).length;

    if (budgets.length === 0) {
      return [
        { name: t.statusApproved, value: 0, color: '#10b981' },
        { name: t.statusPending, value: 0, color: '#f59e0b' },
        { name: t.statusRejected, value: 0, color: '#ef4444' },
      ];
    }

    return [
      { name: t.statusApproved, value: approved, color: '#10b981' },
      { name: t.statusPending, value: pending, color: '#f59e0b' },
      { name: t.statusRejected, value: rejected, color: '#ef4444' },
    ];
  }, [budgets, t]);

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 flex items-center gap-6 group hover:shadow-xl hover:shadow-emerald-500/10 transition-all">
          <div className="p-5 bg-emerald-50 text-emerald-600 rounded-[1.5rem] group-hover:scale-110 transition-transform">
            <CheckCircle size={32} />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mb-1">{t.totalApproved}</p>
            <p className="text-2xl font-black text-slate-900">{stats.totalApproved.toLocaleString(locale, { style: 'currency', currency: currencyCode })}</p>
          </div>
        </div>
        <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 flex items-center gap-6 group hover:shadow-xl hover:shadow-amber-500/10 transition-all">
          <div className="p-5 bg-amber-50 text-amber-600 rounded-[1.5rem] group-hover:scale-110 transition-transform">
            <Clock size={32} />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mb-1">{t.totalPending}</p>
            <p className="text-2xl font-black text-slate-900">{stats.totalPending.toLocaleString(locale, { style: 'currency', currency: currencyCode })}</p>
          </div>
        </div>
        <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 flex items-center gap-6 group hover:shadow-xl hover:shadow-blue-500/10 transition-all">
          <div className="p-5 bg-blue-50 text-blue-600 rounded-[1.5rem] group-hover:scale-110 transition-transform">
            <DollarSign size={32} />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mb-1">{t.totalReceived}</p>
            <p className="text-2xl font-black text-slate-900">{stats.totalReceived.toLocaleString(locale, { style: 'currency', currency: currencyCode })}</p>
          </div>
        </div>
      </div>

      <div className="relative">
        {!isPremium && (
          <div className="absolute inset-0 z-20 glass rounded-[3rem] flex flex-col items-center justify-center p-12 text-center border-2 border-dashed border-slate-200 backdrop-blur-md">
            <div className="w-20 h-20 bg-amber-100 p-6 rounded-[2rem] mb-6 animate-bounce">
              <Lock className="text-amber-600" size={32} />
            </div>
            <h4 className="text-3xl font-black text-slate-900 mb-4">{t.premiumAnalysisTitle}</h4>
            <p className="text-slate-500 max-w-sm mb-10 font-medium leading-relaxed">{t.premiumAnalysisDesc}</p>
            <button 
              onClick={onUpgrade}
              className="bg-slate-900 text-white px-10 py-5 rounded-[1.5rem] font-black hover:bg-slate-800 transition-all shadow-2xl shadow-slate-900/20 flex items-center gap-3"
            >
              <TrendingUp size={20} /> {t.viewPremiumPlans}
            </button>
          </div>
        )}
        
        <div className={`grid grid-cols-1 lg:grid-cols-2 gap-8 ${!isPremium ? 'blur-[4px] pointer-events-none grayscale' : ''}`}>
          <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-slate-100">
            <h3 className="text-xl font-black text-slate-900 mb-10 flex items-center gap-3 uppercase tracking-tight">
              <TrendingUp size={24} className="text-blue-500" />
              {t.volumeChartTitle}
            </h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11, fontWeight: 'bold'}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11, fontWeight: 'bold'}} />
                  <Tooltip 
                    cursor={{fill: '#f8fafc'}}
                    formatter={(value: any) => [value.toLocaleString(locale, { style: 'currency', currency: currencyCode }), t.chartVolumeLabel]}
                    contentStyle={{borderRadius: '24px', border: 'none', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.1)', padding: '16px', fontWeight: 'bold'}}
                  />
                  <Bar dataKey="value" radius={[12, 12, 0, 0]} barSize={40}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index === chartData.length - 1 ? '#3b82f6' : '#94a3b8'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-slate-100">
            <h3 className="text-xl font-black text-slate-900 mb-10 flex items-center gap-3 uppercase tracking-tight">
              <CheckCircle size={24} className="text-emerald-500" />
              {t.statusChartTitle}
            </h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={110}
                    paddingAngle={10}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{borderRadius: '24px', border: 'none', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.1)', padding: '16px', fontWeight: 'bold'}}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex justify-center gap-8 mt-4">
                {pieData.map(d => (
                  <div key={d.name} className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full" style={{backgroundColor: d.color}}></div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{d.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
