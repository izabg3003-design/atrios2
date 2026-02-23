
import React, { useState, useMemo } from 'react';
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
import { 
  Calendar, 
  TrendingUp, 
  Download, 
  LayoutGrid,
  CheckCircle2,
  Clock,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  Target,
  ChevronLeft,
  ChevronRight,
  BarChart3,
  Receipt
} from 'lucide-react';
import { Budget, BudgetStatus, CurrencyCode, CURRENCIES, ExpenseRecord } from '../types';
import { Locale, translations } from '../translations';

interface ReportsProps {
  budgets: Budget[];
  locale: Locale;
  currencyCode: CurrencyCode;
  onExportPdf: (budget: Budget) => void;
}

type Period = 'weekly' | 'monthly' | 'annual';

const Reports: React.FC<ReportsProps> = ({ budgets, locale, currencyCode, onExportPdf }) => {
  const t = translations[locale];
  const [selectedPeriod, setSelectedPeriod] = useState<Period>('monthly');
  
  const [reportMonth, setReportMonth] = useState(new Date().getMonth());
  const [reportYear, setReportYear] = useState(new Date().getFullYear());
  
  const currencyInfo = CURRENCIES[currencyCode];

  const monthNames: (keyof typeof t)[] = [
    'monthShort_jan', 'monthShort_feb', 'monthShort_mar', 'monthShort_apr', 
    'monthShort_may', 'monthShort_jun', 'monthShort_jul', 'monthShort_aug', 
    'monthShort_sep', 'monthShort_oct', 'monthShort_nov', 'monthShort_dec'
  ];

  const isInPeriod = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    
    if (selectedPeriod === 'weekly') {
      const lastWeek = new Date();
      lastWeek.setDate(now.getDate() - 7);
      return date >= lastWeek;
    }
    
    if (selectedPeriod === 'monthly') {
      return date.getMonth() === reportMonth && date.getFullYear() === reportYear;
    }
    
    if (selectedPeriod === 'annual') {
      return date.getFullYear() === reportYear;
    }
    
    return false;
  };

  const periodSales = useMemo(() => {
    return budgets.filter(b => b.status === BudgetStatus.APPROVED && isInPeriod(b.createdAt));
  }, [budgets, selectedPeriod, reportMonth, reportYear]);

  const periodExpenses = useMemo(() => {
    const allExpenses: (ExpenseRecord & { clientName: string })[] = [];
    budgets.forEach(budget => {
      if (budget.expenses) {
        budget.expenses.forEach(exp => {
          if (isInPeriod(exp.date)) {
            allExpenses.push({ ...exp, clientName: budget.clientName });
          }
        });
      }
    });
    return allExpenses.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [budgets, selectedPeriod, reportMonth, reportYear]);

  const chartData = useMemo(() => {
    const data: any[] = [];

    if (selectedPeriod === 'weekly') {
      const now = new Date();
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(now.getDate() - i);
        const dayStr = d.toISOString().split('T')[0];
        
        const daySales = periodSales.filter(s => s.createdAt.startsWith(dayStr)).reduce((sum, s) => sum + s.totalAmount, 0);
        const dayExpenses = periodExpenses.filter(e => e.date.startsWith(dayStr)).reduce((sum, e) => sum + e.amount, 0);
        
        data.push({
          name: d.toLocaleDateString(locale, { weekday: 'short' }),
          vendas: daySales * currencyInfo.rate,
          gastos: dayExpenses * currencyInfo.rate,
          lucro: (daySales - dayExpenses) * currencyInfo.rate
        });
      }
    } else if (selectedPeriod === 'monthly') {
      const daysInMonth = new Date(reportYear, reportMonth + 1, 0).getDate();
      for (let i = 1; i <= daysInMonth; i++) {
        const d = new Date(reportYear, reportMonth, i);
        const dayStr = d.toISOString().split('T')[0];
        
        const daySales = periodSales.filter(s => s.createdAt.startsWith(dayStr)).reduce((sum, s) => sum + s.totalAmount, 0);
        const dayExpenses = periodExpenses.filter(e => e.date.startsWith(dayStr)).reduce((sum, e) => sum + e.amount, 0);
        
        data.push({
          name: i.toString(),
          vendas: daySales * currencyInfo.rate,
          gastos: dayExpenses * currencyInfo.rate,
          lucro: (daySales - dayExpenses) * currencyInfo.rate
        });
      }
    } else if (selectedPeriod === 'annual') {
      for (let i = 0; i < 12; i++) {
        const monthSales = periodSales.filter(s => new Date(s.createdAt).getMonth() === i).reduce((sum, s) => sum + s.totalAmount, 0);
        const monthExpenses = periodExpenses.filter(e => new Date(e.date).getMonth() === i).reduce((sum, e) => sum + e.amount, 0);
        
        data.push({
          name: t[monthNames[i]],
          vendas: monthSales * currencyInfo.rate,
          gastos: monthExpenses * currencyInfo.rate,
          lucro: (monthSales - monthExpenses) * currencyInfo.rate
        });
      }
    }
    return data;
  }, [selectedPeriod, periodSales, periodExpenses, currencyInfo, locale, t, reportMonth, reportYear, monthNames]);

  const stats = useMemo(() => {
    const revenue = periodSales.reduce((sum, b) => sum + b.totalAmount, 0);
    const expenses = periodExpenses.reduce((sum, e) => sum + e.amount, 0);
    const profit = revenue - expenses;
    const margin = revenue > 0 ? (profit / revenue) * 100 : 0;
    const avgTicket = periodSales.length > 0 ? revenue / periodSales.length : 0;

    return {
      revenue: revenue * currencyInfo.rate,
      expenses: expenses * currencyInfo.rate,
      profit: profit * currencyInfo.rate,
      margin,
      avgTicket: avgTicket * currencyInfo.rate,
      salesCount: periodSales.length,
      expensesCount: periodExpenses.length
    };
  }, [periodSales, periodExpenses, currencyInfo]);

  const pieData = [
    { name: t.reportLucroLabel, value: Math.max(0, stats.profit), color: '#10b981' },
    { name: t.reportGastosLabel, value: stats.expenses, color: '#ef4444' }
  ];

  const periods = [
    { id: 'weekly' as Period, label: t.weekly, icon: <Clock size={24} />, color: 'bg-blue-500' },
    { id: 'monthly' as Period, label: t.monthly, icon: <Calendar size={24} />, color: 'bg-amber-500' },
    { id: 'annual' as Period, label: t.annual, icon: <TrendingUp size={24} />, color: 'bg-emerald-500' }
  ];

  return (
    <div className="space-y-8 lg:space-y-12 animate-in fade-in duration-700 pb-20">
      <div className="text-center space-y-2 lg:space-y-4">
        <h2 className="text-3xl lg:text-5xl font-black text-slate-900 tracking-tight">{t.reports}</h2>
        <p className="text-slate-500 font-bold uppercase tracking-[0.2em] lg:tracking-[0.3em] text-[10px] lg:text-xs">{t.reportPerformanceOverview}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-8">
        {periods.map(period => {
          const isActive = selectedPeriod === period.id;
          return (
            <button
              key={period.id}
              onClick={() => setSelectedPeriod(period.id)}
              className={`p-6 lg:p-10 rounded-[2rem] lg:rounded-[3rem] border transition-all flex flex-col items-center text-center gap-4 lg:gap-6 group relative overflow-hidden ${
                isActive 
                ? 'bg-slate-900 border-slate-900 text-white shadow-2xl scale-105' 
                : 'bg-white border-slate-100 text-slate-900 hover:border-slate-300 shadow-sm'
              }`}
            >
              {isActive && (
                <div className={`absolute top-0 right-0 w-24 h-24 lg:w-32 lg:h-32 ${period.color} opacity-20 blur-3xl -mr-12 -mt-12 lg:-mr-16 lg:-mt-16`} />
              )}
              <div className={`p-4 lg:p-5 rounded-xl lg:rounded-[1.5rem] transition-transform group-hover:scale-110 ${isActive ? 'bg-white/10' : 'bg-slate-50 text-slate-400'}`}>
                {React.cloneElement(period.icon as React.ReactElement, { size: 20, className: 'lg:w-6 lg:h-6' })}
              </div>
              <div>
                <p className={`text-[8px] lg:text-[10px] font-black uppercase tracking-widest mb-0.5 lg:mb-1 ${isActive ? 'text-slate-400' : 'text-slate-400'}`}>{t.reports}</p>
                <h3 className="text-lg lg:text-2xl font-black italic">{period.label}</h3>
              </div>
            </button>
          );
        })}
      </div>

      {selectedPeriod === 'monthly' && (
        <div className="flex justify-center animate-in slide-in-from-top-4 duration-500">
          <div className="bg-white border border-slate-100 p-3 lg:p-4 rounded-[2rem] lg:rounded-[2.5rem] shadow-xl flex items-center gap-4 lg:gap-8 px-6 lg:px-10">
            <button 
              onClick={() => {
                if (reportMonth === 0) {
                  setReportMonth(11);
                  setReportYear(reportYear - 1);
                } else {
                  setReportMonth(reportMonth - 1);
                }
              }}
              className="p-2 lg:p-3 bg-slate-50 text-slate-400 hover:bg-slate-900 hover:text-white rounded-xl lg:rounded-2xl transition-all"
            >
              <ChevronLeft size={18} className="lg:w-5 lg:h-5" />
            </button>
            
            <div className="flex items-center gap-3 lg:gap-4 text-center min-w-[120px] lg:min-w-[160px]">
              <Calendar className="text-amber-500 w-5 h-5 lg:w-6 lg:h-6" size={24} />
              <div>
                <p className="text-[8px] lg:text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-0.5 lg:mb-1">{t.reportMonthSelector}</p>
                <h4 className="text-base lg:text-xl font-black text-slate-900 italic uppercase">
                  {t[monthNames[reportMonth]]} <span className="text-slate-400 not-italic ml-1">{reportYear}</span>
                </h4>
              </div>
            </div>

            <button 
              onClick={() => {
                if (reportMonth === 11) {
                  setReportMonth(0);
                  setReportYear(reportYear + 1);
                } else {
                  setReportMonth(reportMonth + 1);
                }
              }}
              className="p-2 lg:p-3 bg-slate-50 text-slate-400 hover:bg-slate-900 hover:text-white rounded-xl lg:rounded-2xl transition-all"
            >
              <ChevronRight size={18} className="lg:w-5 lg:h-5" />
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        <div className="lg:col-span-2 bg-white p-6 sm:p-8 lg:p-10 rounded-[2rem] lg:rounded-[3rem] shadow-sm border border-slate-100 space-y-6 lg:space-y-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h3 className="text-lg lg:text-xl font-black text-slate-900 flex items-center gap-2 lg:gap-3 uppercase tracking-tight">
              <BarChart3 size={20} className="text-blue-500 lg:w-6 lg:h-6" />
              {t.reportFinancialFlow} ({selectedPeriod === 'weekly' ? `7 ${t.reportDays}` : selectedPeriod === 'monthly' ? t[monthNames[reportMonth]] : t.reportYear})
            </h3>
            <div className="flex gap-4">
               <div className="flex items-center gap-2">
                 <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
                 <span className="text-[8px] lg:text-[9px] font-black text-slate-400 uppercase">{t.reportVendasLabel}</span>
               </div>
               <div className="flex items-center gap-2">
                 <div className="w-2.5 h-2.5 rounded-full bg-red-500"></div>
                 <span className="text-[8px] lg:text-[9px] font-black text-slate-400 uppercase">{t.reportGastosLabel}</span>
               </div>
            </div>
          </div>
          <div className="h-[250px] lg:h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 'bold'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 'bold'}} />
                <Tooltip 
                  cursor={{fill: '#f8fafc'}}
                  contentStyle={{borderRadius: '20px', border: 'none', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.1)', padding: '12px', fontSize: '12px'}}
                  formatter={(value: any) => [value.toLocaleString(locale, { style: 'currency', currency: currencyCode })]}
                />
                <Bar dataKey="vendas" fill="#10b981" radius={[4, 4, 0, 0]} barSize={selectedPeriod === 'monthly' ? 6 : 20} lg:barSize={selectedPeriod === 'monthly' ? 10 : 30} />
                <Bar dataKey="gastos" fill="#ef4444" radius={[4, 4, 0, 0]} barSize={selectedPeriod === 'monthly' ? 6 : 20} lg:barSize={selectedPeriod === 'monthly' ? 10 : 30} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 sm:p-8 lg:p-10 rounded-[2rem] lg:rounded-[3rem] shadow-sm border border-slate-100 flex flex-col items-center justify-between text-center gap-6">
           <div className="space-y-1 lg:space-y-2">
            <h3 className="text-lg lg:text-xl font-black text-slate-900 uppercase tracking-tight">{t.reportComposition}</h3>
            <p className="text-[10px] lg:text-xs font-bold text-slate-400 uppercase tracking-widest">{t.reportProfitMargin}: {stats.margin.toFixed(1)}%</p>
           </div>
           <div className="h-[200px] lg:h-[250px] w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    lg:innerRadius={60}
                    lg:outerRadius={90}
                    paddingAngle={6}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex items-center justify-center flex-col">
                <span className="text-[8px] lg:text-[10px] font-black text-slate-400 uppercase">{t.reportLucroLabel}</span>
                <span className="text-xl lg:text-2xl font-black text-emerald-600">{stats.margin.toFixed(0)}%</span>
              </div>
           </div>
           <div className="w-full space-y-3 lg:space-y-4 pt-4 lg:pt-6 border-t border-slate-50">
              <div className="flex justify-between items-center">
                <span className="text-[8px] lg:text-[10px] font-black text-slate-400 uppercase">{t.reportRevenueTotal}</span>
                <span className="text-xs lg:text-sm font-black text-slate-900">{stats.revenue.toLocaleString(locale, { style: 'currency', currency: currencyCode })}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[8px] lg:text-[10px] font-black text-slate-400 uppercase">{t.reportExpensesTotal}</span>
                <span className="text-xs lg:text-sm font-black text-red-500">-{stats.expenses.toLocaleString(locale, { style: 'currency', currency: currencyCode })}</span>
              </div>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <div className="bg-white p-6 lg:p-8 rounded-[1.5rem] lg:rounded-[2.5rem] border border-slate-100 shadow-sm space-y-3 lg:space-y-4 group hover:shadow-xl transition-all">
          <div className="flex justify-between items-start">
            <div className="p-3 lg:p-4 bg-emerald-50 text-emerald-600 rounded-xl lg:rounded-2xl"><ArrowUpRight size={20} className="lg:w-6 lg:h-6" /></div>
            <span className="text-[8px] lg:text-[10px] font-black text-emerald-500 bg-emerald-50 px-2 lg:px-3 py-1 rounded-full uppercase">{t.reportRevenue}</span>
          </div>
          <div>
            <p className="text-2xl lg:text-3xl font-black text-slate-900">{stats.revenue.toLocaleString(locale, { style: 'currency', currency: currencyCode })}</p>
            <p className="text-[8px] lg:text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{stats.salesCount} {t.salesInPeriod}</p>
          </div>
        </div>

        <div className="bg-white p-6 lg:p-8 rounded-[1.5rem] lg:rounded-[2.5rem] border border-slate-100 shadow-sm space-y-3 lg:space-y-4 group hover:shadow-xl transition-all">
          <div className="flex justify-between items-start">
            <div className="p-3 lg:p-4 bg-red-50 text-red-600 rounded-xl lg:rounded-2xl"><ArrowDownRight size={20} className="lg:w-6 lg:h-6" /></div>
            <span className="text-[8px] lg:text-[10px] font-black text-red-500 bg-red-50 px-2 lg:px-3 py-1 rounded-full uppercase">{t.reportCosts}</span>
          </div>
          <div>
            <p className="text-2xl lg:text-3xl font-black text-slate-900">{stats.expenses.toLocaleString(locale, { style: 'currency', currency: currencyCode })}</p>
            <p className="text-[8px] lg:text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{stats.expensesCount} {t.recordExpenses}</p>
          </div>
        </div>

        <div className="bg-slate-900 p-6 lg:p-8 rounded-[1.5rem] lg:rounded-[2.5rem] shadow-2xl space-y-3 lg:space-y-4 group relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 lg:w-24 lg:h-24 bg-emerald-500 opacity-10 blur-2xl -mr-8 -mt-8 lg:-mr-10 lg:-mt-10"></div>
          <div className="flex justify-between items-start">
            <div className="p-3 lg:p-4 bg-white/10 text-emerald-400 rounded-xl lg:rounded-2xl"><Target size={20} className="lg:w-6 lg:h-6" /></div>
            <span className="text-[8px] lg:text-[10px] font-black text-emerald-400 bg-white/5 px-2 lg:px-3 py-1 rounded-full uppercase">{t.reportResult}</span>
          </div>
          <div>
            <p className="text-2xl lg:text-3xl font-black text-white">{stats.profit.toLocaleString(locale, { style: 'currency', currency: currencyCode })}</p>
            <p className="text-[8px] lg:text-[10px] font-bold text-emerald-400/60 uppercase tracking-widest mt-1">{t.reportRealProfit}</p>
          </div>
        </div>

        <div className="bg-white p-6 lg:p-8 rounded-[1.5rem] lg:rounded-[2.5rem] border border-slate-100 shadow-sm space-y-3 lg:space-y-4 group hover:shadow-xl transition-all">
          <div className="flex justify-between items-start">
            <div className="p-3 lg:p-4 bg-blue-50 text-blue-600 rounded-xl lg:rounded-2xl"><BarChart3 size={20} className="lg:w-6 lg:h-6" /></div>
            <span className="text-[8px] lg:text-[10px] font-black text-blue-500 bg-blue-50 px-2 lg:px-3 py-1 rounded-full uppercase">{t.reportAvgTicket}</span>
          </div>
          <div>
            <p className="text-2xl lg:text-3xl font-black text-slate-900">{stats.avgTicket.toLocaleString(locale, { style: 'currency', currency: currencyCode })}</p>
            <p className="text-[8px] lg:text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{t.reportAvgPerClient}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 pt-6 lg:pt-12">
        <div className="space-y-4 lg:space-y-6">
          <div className="flex items-center justify-between border-b border-slate-200 pb-4 lg:pb-6">
            <h3 className="text-xl lg:text-2xl font-black text-slate-900 flex items-center gap-2 lg:gap-3 italic">
              <LayoutGrid size={20} className="text-slate-400 lg:w-6 lg:h-6" />
              {t.reportSalesDetail}
            </h3>
          </div>

          <div className="space-y-3 lg:space-y-4 max-h-[380px] overflow-y-auto pr-2 custom-scrollbar">
            {periodSales.length === 0 ? (
              <div className="py-12 lg:py-16 text-center bg-white rounded-[1.5rem] lg:rounded-[2.5rem] border border-slate-100 border-dashed">
                <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] lg:text-xs">{t.reportNoSalesFound} {selectedPeriod === 'monthly' ? t[monthNames[reportMonth]] : ''}</p>
              </div>
            ) : (
              periodSales.map(budget => (
                <div key={budget.id} className="bg-white p-4 lg:p-6 rounded-[1.5rem] lg:rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-4 lg:gap-6 group hover:border-slate-300 transition-all">
                  <div className="w-10 h-10 lg:w-12 lg:h-12 bg-emerald-50 text-emerald-600 rounded-xl lg:rounded-2xl flex items-center justify-center shrink-0"><CheckCircle2 size={20} className="lg:w-6 lg:h-6" /></div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-black text-slate-900 truncate text-sm lg:text-base">{budget.clientName}</h4>
                    <p className="text-[8px] lg:text-[10px] font-bold text-slate-400 uppercase tracking-widest">{new Date(budget.createdAt).toLocaleDateString(locale)}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-black text-slate-900 text-sm lg:text-base">{(budget.totalAmount * currencyInfo.rate).toLocaleString(locale, { style: 'currency', currency: currencyCode })}</p>
                    <button onClick={() => onExportPdf(budget)} className="text-[8px] font-black text-blue-500 uppercase tracking-widest hover:underline flex items-center gap-1 mt-1 ml-auto"><Download size={10} /> PDF</button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="space-y-4 lg:space-y-6">
          <div className="flex items-center justify-between border-b border-slate-200 pb-4 lg:pb-6">
            <h3 className="text-xl lg:text-2xl font-black text-slate-900 flex items-center gap-2 lg:gap-3 italic">
              <Receipt size={20} className="text-slate-400 lg:w-6 lg:h-6" />
              {t.reportExpensesDetail}
            </h3>
          </div>

          <div className="space-y-3 lg:space-y-4 max-h-[380px] overflow-y-auto pr-2 custom-scrollbar">
            {periodExpenses.length === 0 ? (
              <div className="py-12 lg:py-16 text-center bg-white rounded-[1.5rem] lg:rounded-[2.5rem] border border-slate-100 border-dashed">
                <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] lg:text-xs">{t.reportNoExpensesFound} {selectedPeriod === 'monthly' ? t[monthNames[reportMonth]] : ''}</p>
              </div>
            ) : (
              periodExpenses.map(expense => (
                <div key={expense.id} className="bg-white p-4 lg:p-6 rounded-[1.5rem] lg:rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-4 lg:gap-6 group hover:border-slate-300 transition-all">
                  <div className="w-10 h-10 lg:w-12 lg:h-12 bg-red-50 text-red-600 rounded-xl lg:rounded-2xl flex items-center justify-center shrink-0"><Wallet size={20} className="lg:w-6 lg:h-6" /></div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-black text-slate-900 truncate text-sm lg:text-base">{expense.description}</h4>
                    <p className="text-[8px] lg:text-[10px] font-bold text-slate-400 uppercase tracking-widest truncate">{expense.clientName}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-black text-red-600 text-sm lg:text-base">- {(expense.amount * currencyInfo.rate).toLocaleString(locale, { style: 'currency', currency: currencyCode })}</p>
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{new Date(expense.date).toLocaleDateString(locale)}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
