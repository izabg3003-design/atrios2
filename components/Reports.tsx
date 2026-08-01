
import React, { useState, useMemo } from 'react';
import { 
  BarChart, 
  ComposedChart,
  Line,
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
  Receipt,
  Filter,
  Plus,
  X,
  Info,
  Pencil,
  Trash2
} from 'lucide-react';
import { Budget, BudgetStatus, CurrencyCode, CURRENCIES, ExpenseRecord, PlanType } from '../types';
import { Locale, translations } from '../translations';
import ExpenseManager from './ExpenseManager';

interface ReportsProps {
  budgets: Budget[];
  locale: Locale;
  currencyCode: CurrencyCode;
  onExportPdf: (budget: Budget) => void;
  onSaveBudget?: (budget: Budget) => void;
  plan?: PlanType;
  onUpgrade?: () => void;
}

type Period = 'weekly' | 'monthly' | 'annual';

const Reports: React.FC<ReportsProps> = ({ 
  budgets, 
  locale, 
  currencyCode, 
  onExportPdf,
  onSaveBudget,
  plan = PlanType.FREE,
  onUpgrade
}) => {
  const t = translations[locale];
  const [selectedPeriod, setSelectedPeriod] = useState<Period>('monthly');
  
  const [reportMonth, setReportMonth] = useState(new Date().getMonth());
  const [reportYear, setReportYear] = useState(new Date().getFullYear());
  
  const [selectedBudgetId, setSelectedBudgetId] = useState<string | null>(null);
  const [managingExpensesBudget, setManagingExpensesBudget] = useState<Budget | null>(null);

  // States for Editing Expense
  const [editingExpense, setEditingExpense] = useState<{
    expense: ExpenseRecord;
    budgetId: string;
  } | null>(null);

  const [editDescription, setEditDescription] = useState('');
  const [editQuantity, setEditQuantity] = useState<number>(1);
  const [editUnit, setEditUnit] = useState<string>('un');
  const [editPricePerUnit, setEditPricePerUnit] = useState<number>(0);
  const [editDate, setEditDate] = useState<string>('');

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
    return budgets.filter(b => (b.status === BudgetStatus.APPROVED || b.status === BudgetStatus.COMPLETED) && isInPeriod(b.createdAt || b.created_at));
  }, [budgets, selectedPeriod, reportMonth, reportYear]);

  const periodExpenses = useMemo(() => {
    const allExpenses: (ExpenseRecord & { clientName: string; budgetId: string })[] = [];
    budgets.forEach(budget => {
      if (budget.expenses) {
        budget.expenses.forEach(exp => {
          if (isInPeriod(exp.date)) {
            allExpenses.push({ ...exp, clientName: budget.clientName, budgetId: budget.id });
          }
        });
      }
    });
    return allExpenses.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [budgets, selectedPeriod, reportMonth, reportYear]);

  const handleStartEditExpense = (expense: ExpenseRecord & { budgetId: string }) => {
    setEditingExpense({ expense, budgetId: expense.budgetId });
    setEditDescription(expense.description);
    setEditQuantity(expense.quantity || 1);
    setEditUnit(expense.unit || 'un');
    setEditPricePerUnit(Number((expense.pricePerUnit * currencyInfo.rate).toFixed(2)));
    setEditDate(expense.date ? expense.date.split('T')[0] : new Date().toISOString().split('T')[0]);
  };

  const handleSaveEditExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingExpense || !onSaveBudget) return;

    const targetBudget = budgets.find(b => b.id === editingExpense.budgetId);
    if (!targetBudget) return;

    const eurPricePerUnit = editPricePerUnit / currencyInfo.rate;
    const eurTotalAmount = (editQuantity * editPricePerUnit) / currencyInfo.rate;

    const updatedExpenses = (targetBudget.expenses || []).map(exp => {
      if (exp.id === editingExpense.expense.id) {
        return {
          ...exp,
          description: editDescription,
          quantity: editQuantity,
          unit: editUnit,
          pricePerUnit: eurPricePerUnit,
          amount: eurTotalAmount,
          date: editDate
        };
      }
      return exp;
    });

    const updatedBudget = {
      ...targetBudget,
      expenses: updatedExpenses
    };

    onSaveBudget(updatedBudget);
    setEditingExpense(null);
  };

  const handleDeleteExpense = (expenseId: string, budgetId: string) => {
    if (!onSaveBudget) return;
    const targetBudget = budgets.find(b => b.id === budgetId);
    if (!targetBudget) return;

    const confirmMsg = locale.startsWith('pt') 
      ? 'Deseja realmente excluir esta despesa?' 
      : 'Are you sure you want to delete this expense?';

    if (window.confirm(confirmMsg)) {
      const updatedBudget = {
        ...targetBudget,
        expenses: (targetBudget.expenses || []).filter(e => e.id !== expenseId)
      };
      onSaveBudget(updatedBudget);
    }
  };

  const selectedBudget = useMemo(() => {
    if (!selectedBudgetId) return null;
    return budgets.find(b => b.id === selectedBudgetId) || null;
  }, [budgets, selectedBudgetId]);

  const displayedExpenses = useMemo(() => {
    if (selectedBudget) {
      const clientExps = (selectedBudget.expenses || []).map(exp => ({
        ...exp,
        clientName: selectedBudget.clientName,
        budgetId: selectedBudget.id
      }));
      return clientExps.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }
    return periodExpenses;
  }, [selectedBudget, periodExpenses]);

  const displayedExpensesTotal = useMemo(() => {
    return displayedExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);
  }, [displayedExpenses]);

  const selectedBudgetIva = useMemo(() => {
    if (selectedBudget && selectedBudget.includeIva && selectedBudget.ivaPercentage > 0) {
      const subtotal = selectedBudget.totalAmount / (1 + selectedBudget.ivaPercentage / 100);
      return selectedBudget.totalAmount - subtotal;
    }
    return 0;
  }, [selectedBudget]);

  const selectedBudgetSubtotal = useMemo(() => {
    if (selectedBudget) {
      if (selectedBudget.includeIva && selectedBudget.ivaPercentage > 0) {
        return selectedBudget.totalAmount / (1 + selectedBudget.ivaPercentage / 100);
      }
      return selectedBudget.totalAmount;
    }
    return 0;
  }, [selectedBudget]);

  const chartData = useMemo(() => {
    const data: any[] = [];

    const calculateIva = (budgetList: Budget[]) => {
      return budgetList.reduce((sum, b) => {
        if (b.includeIva && b.ivaPercentage > 0) {
          const subtotal = b.totalAmount / (1 + b.ivaPercentage / 100);
          return sum + (b.totalAmount - subtotal);
        }
        return sum;
      }, 0);
    };

    const isSameDay = (dateStr: string | undefined, year: number, month: number, day: number) => {
      if (!dateStr) return false;
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return false;
      return d.getFullYear() === year && d.getMonth() === month && d.getDate() === day;
    };

    if (selectedPeriod === 'weekly') {
      const now = new Date();
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(now.getDate() - i);
        const yr = d.getFullYear();
        const mo = d.getMonth();
        const da = d.getDate();

        const dayBudgets = periodSales.filter(s => isSameDay(s.createdAt || s.created_at, yr, mo, da));
        const daySales = dayBudgets.reduce((sum, s) => sum + (s.totalAmount || 0), 0);
        const dayExpenses = periodExpenses.filter(e => isSameDay(e.date, yr, mo, da)).reduce((sum, e) => sum + (e.amount || 0), 0);
        const dayIva = calculateIva(dayBudgets);

        data.push({
          name: d.toLocaleDateString(locale, { weekday: 'short' }),
          vendas: Math.max(0, daySales * currencyInfo.rate),
          gastos: Math.max(0, dayExpenses * currencyInfo.rate),
          iva: Math.max(0, dayIva * currencyInfo.rate),
          lucro: (daySales - dayExpenses - dayIva) * currencyInfo.rate
        });
      }
    } else if (selectedPeriod === 'monthly') {
      const daysInMonth = new Date(reportYear, reportMonth + 1, 0).getDate();
      for (let i = 1; i <= daysInMonth; i++) {
        const dayBudgets = periodSales.filter(s => isSameDay(s.createdAt || s.created_at, reportYear, reportMonth, i));
        const daySales = dayBudgets.reduce((sum, s) => sum + (s.totalAmount || 0), 0);
        const dayExpenses = periodExpenses.filter(e => isSameDay(e.date, reportYear, reportMonth, i)).reduce((sum, e) => sum + (e.amount || 0), 0);
        const dayIva = calculateIva(dayBudgets);

        data.push({
          name: i.toString(),
          vendas: Math.max(0, daySales * currencyInfo.rate),
          gastos: Math.max(0, dayExpenses * currencyInfo.rate),
          iva: Math.max(0, dayIva * currencyInfo.rate),
          lucro: (daySales - dayExpenses - dayIva) * currencyInfo.rate
        });
      }
    } else if (selectedPeriod === 'annual') {
      for (let i = 0; i < 12; i++) {
        const monthBudgets = periodSales.filter(s => {
          const d = new Date(s.createdAt || s.created_at);
          return !isNaN(d.getTime()) && d.getFullYear() === reportYear && d.getMonth() === i;
        });
        const monthSales = monthBudgets.reduce((sum, s) => sum + (s.totalAmount || 0), 0);
        const monthExpenses = periodExpenses.filter(e => {
          const d = new Date(e.date);
          return !isNaN(d.getTime()) && d.getFullYear() === reportYear && d.getMonth() === i;
        }).reduce((sum, e) => sum + (e.amount || 0), 0);
        const monthIva = calculateIva(monthBudgets);

        data.push({
          name: t[monthNames[i]],
          vendas: Math.max(0, monthSales * currencyInfo.rate),
          gastos: Math.max(0, monthExpenses * currencyInfo.rate),
          iva: Math.max(0, monthIva * currencyInfo.rate),
          lucro: (monthSales - monthExpenses - monthIva) * currencyInfo.rate
        });
      }
    }
    return data;
  }, [selectedPeriod, periodSales, periodExpenses, currencyInfo, locale, t, reportMonth, reportYear, monthNames]);

  const stats = useMemo(() => {
    const revenue = periodSales.reduce((sum, b) => sum + b.totalAmount, 0);
    const expenses = periodExpenses.reduce((sum, e) => sum + e.amount, 0);
    
    const totalIva = periodSales.reduce((sum, b) => {
      if (b.includeIva && b.ivaPercentage > 0) {
        const subtotal = b.totalAmount / (1 + b.ivaPercentage / 100);
        return sum + (b.totalAmount - subtotal);
      }
      return sum;
    }, 0);

    const profit = revenue - expenses - totalIva;
    const margin = revenue > 0 ? (profit / revenue) * 100 : 0;
    const avgTicket = periodSales.length > 0 ? revenue / periodSales.length : 0;

    return {
      revenue: revenue * currencyInfo.rate,
      expenses: expenses * currencyInfo.rate,
      totalIva: totalIva * currencyInfo.rate,
      profit: profit * currencyInfo.rate,
      margin,
      avgTicket: avgTicket * currencyInfo.rate,
      salesCount: periodSales.length,
      expensesCount: periodExpenses.length
    };
  }, [periodSales, periodExpenses, currencyInfo]);

  const pieData = [
    { name: t.reportLucroLabel, value: Math.max(0, stats.profit), color: '#10b981' },
    { name: t.reportGastosLabel, value: stats.expenses, color: '#ef4444' },
    { name: t.masterTotalIva, value: stats.totalIva, color: '#f59e0b' }
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
              className={`p-5 sm:p-6 lg:p-10 rounded-[1.5rem] sm:rounded-[2rem] lg:rounded-[3rem] border transition-all flex flex-row sm:flex-col items-center text-left sm:text-center gap-4 lg:gap-6 group relative overflow-hidden ${
                isActive 
                ? 'bg-slate-900 border-slate-900 text-white shadow-2xl scale-105' 
                : 'bg-white border-slate-100 text-slate-900 hover:border-slate-300 shadow-sm'
              }`}
            >
              {isActive && (
                <div className={`absolute top-0 right-0 w-24 h-24 lg:w-32 lg:h-32 ${period.color} opacity-20 blur-3xl -mr-12 -mt-12 lg:-mr-16 lg:-mt-16`} />
              )}
              <div className={`p-3 sm:p-4 lg:p-5 rounded-xl lg:rounded-[1.5rem] transition-transform group-hover:scale-110 shrink-0 ${isActive ? 'bg-white/10' : 'bg-slate-50 text-slate-400'}`}>
                {React.cloneElement(period.icon as React.ReactElement, { size: 18, className: 'sm:w-5 sm:h-5 lg:w-6 lg:h-6' })}
              </div>
              <div>
                <p className={`text-[7px] sm:text-[8px] lg:text-[10px] font-black uppercase tracking-widest mb-0.5 lg:mb-1 ${isActive ? 'text-slate-400' : 'text-slate-400'}`}>{t.reports}</p>
                <h3 className="text-base sm:text-lg lg:text-2xl font-black italic">{period.label}</h3>
              </div>
            </button>
          );
        })}
      </div>

      {selectedPeriod === 'monthly' && (
        <div className="flex justify-center animate-in slide-in-from-top-4 duration-500">
          <div className="bg-white border border-slate-100 p-2 sm:p-3 lg:p-4 rounded-2xl sm:rounded-[2rem] lg:rounded-[2.5rem] shadow-xl flex items-center gap-3 sm:gap-4 lg:gap-8 px-4 sm:px-6 lg:px-10">
            <button 
              onClick={() => {
                if (reportMonth === 0) {
                  setReportMonth(11);
                  setReportYear(reportYear - 1);
                } else {
                  setReportMonth(reportMonth - 1);
                }
              }}
              className="p-1.5 sm:p-2 lg:p-3 bg-slate-50 text-slate-400 hover:bg-slate-900 hover:text-white rounded-lg sm:rounded-xl lg:rounded-2xl transition-all"
            >
              <ChevronLeft size={16} className="sm:w-[18px] sm:h-[18px] lg:w-5 lg:h-5" />
            </button>
            
            <div className="flex items-center gap-2 sm:gap-3 lg:gap-4 text-center min-w-[100px] sm:min-w-[120px] lg:min-w-[160px]">
              <Calendar className="text-amber-500 w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6" size={20} />
              <div>
                <p className="text-[7px] sm:text-[8px] lg:text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-0.5 lg:mb-1">{t.reportMonthSelector}</p>
                <h4 className="text-xs sm:text-base lg:text-xl font-black text-slate-900 italic uppercase">
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
              className="p-1.5 sm:p-2 lg:p-3 bg-slate-50 text-slate-400 hover:bg-slate-900 hover:text-white rounded-lg sm:rounded-xl lg:rounded-2xl transition-all"
            >
              <ChevronRight size={16} className="sm:w-[18px] sm:h-[18px] lg:w-5 lg:h-5" />
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        <div className="lg:col-span-2 bg-white p-5 sm:p-8 lg:p-10 rounded-[1.5rem] sm:rounded-[2rem] lg:rounded-[3rem] shadow-sm border border-slate-100 space-y-6 lg:space-y-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h3 className="text-base sm:text-lg lg:text-xl font-black text-slate-900 flex items-center gap-2 lg:gap-3 uppercase tracking-tight">
              <BarChart3 size={18} className="text-blue-500 sm:w-5 sm:h-5 lg:w-6 lg:h-6" />
              {t.reportFinancialFlow} <span className="hidden xs:inline">({selectedPeriod === 'weekly' ? `7 ${t.reportDays}` : selectedPeriod === 'monthly' ? t[monthNames[reportMonth]] : t.reportYear})</span>
            </h3>
            <div className="flex flex-wrap gap-2.5 sm:gap-4">
               <div className="flex items-center gap-1.5">
                 <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
                 <span className="text-[7px] sm:text-[8px] lg:text-[9px] font-black text-slate-400 uppercase">{t.reportVendasLabel}</span>
               </div>
               <div className="flex items-center gap-1.5">
                 <div className="w-2.5 h-2.5 rounded-full bg-red-500"></div>
                 <span className="text-[7px] sm:text-[8px] lg:text-[9px] font-black text-slate-400 uppercase">{t.reportGastosLabel}</span>
               </div>
               <div className="flex items-center gap-1.5">
                 <div className="w-2.5 h-2.5 rounded-full bg-amber-500"></div>
                 <span className="text-[7px] sm:text-[8px] lg:text-[9px] font-black text-slate-400 uppercase">{t.masterTotalIva}</span>
               </div>
               <div className="flex items-center gap-1.5">
                 <div className="w-2.5 h-2.5 rounded-full bg-blue-500"></div>
                 <span className="text-[7px] sm:text-[8px] lg:text-[9px] font-black text-slate-400 uppercase">{t.reportLucroLabel}</span>
               </div>
            </div>
          </div>
          <div className="h-[220px] sm:h-[300px] lg:h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 9, fontWeight: 'bold'}} />
                <YAxis domain={[0, 'auto']} axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 9, fontWeight: 'bold'}} />
                <Tooltip 
                  cursor={{fill: '#f8fafc'}}
                  contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.15)', padding: '12px', fontSize: '11px'}}
                  formatter={(value: any, name: any) => {
                    const labelMap: Record<string, string> = {
                      vendas: t.reportVendasLabel,
                      gastos: t.reportGastosLabel,
                      iva: t.masterTotalIva,
                      lucro: t.reportLucroLabel
                    };
                    const formattedValue = Number(value).toLocaleString(locale, { style: 'currency', currency: currencyCode });
                    return [formattedValue, labelMap[name] || name];
                  }}
                />
                <Bar dataKey="vendas" fill="#10b981" radius={[4, 4, 0, 0]} barSize={selectedPeriod === 'monthly' ? 4 : 12} sm:barSize={selectedPeriod === 'monthly' ? 6 : 20} lg:barSize={selectedPeriod === 'monthly' ? 10 : 26} />
                <Bar dataKey="gastos" fill="#ef4444" radius={[4, 4, 0, 0]} barSize={selectedPeriod === 'monthly' ? 4 : 12} sm:barSize={selectedPeriod === 'monthly' ? 6 : 20} lg:barSize={selectedPeriod === 'monthly' ? 10 : 26} />
                <Bar dataKey="iva" fill="#f59e0b" radius={[4, 4, 0, 0]} barSize={selectedPeriod === 'monthly' ? 4 : 12} sm:barSize={selectedPeriod === 'monthly' ? 6 : 20} lg:barSize={selectedPeriod === 'monthly' ? 10 : 26} />
                <Line type="monotone" dataKey="lucro" stroke="#3b82f6" strokeWidth={3} dot={{ r: 3, fill: '#3b82f6' }} activeDot={{ r: 6 }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-5 sm:p-8 lg:p-10 rounded-[1.5rem] sm:rounded-[2rem] lg:rounded-[3rem] shadow-sm border border-slate-100 flex flex-col items-center justify-between text-center gap-6">
           <div className="space-y-1 lg:space-y-2">
            <h3 className="text-base sm:text-lg lg:text-xl font-black text-slate-900 uppercase tracking-tight">{t.reportComposition}</h3>
            <p className="text-[9px] sm:text-[10px] lg:text-xs font-bold text-slate-400 uppercase tracking-widest">{t.reportProfitMargin}: {stats.margin.toFixed(1)}%</p>
           </div>
           <div className="h-[180px] sm:h-[200px] lg:h-[250px] w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={70}
                    lg:innerRadius={60}
                    lg:outerRadius={90}
                    paddingAngle={6}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(val: any) => Number(val).toLocaleString(locale, { style: 'currency', currency: currencyCode })} />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex items-center justify-center flex-col">
                <span className="text-[7px] sm:text-[8px] lg:text-[10px] font-black text-slate-400 uppercase">{t.reportLucroLabel}</span>
                <span className="text-base sm:text-lg lg:text-xl font-black text-emerald-600">{stats.margin.toFixed(0)}%</span>
              </div>
           </div>
           <div className="w-full space-y-2 sm:space-y-3 lg:space-y-4 pt-4 lg:pt-6 border-t border-slate-50">
              <div className="flex justify-between items-center gap-2">
                <span className="text-[7px] sm:text-[8px] lg:text-[10px] font-black text-slate-400 uppercase truncate">{t.reportRevenueTotal}</span>
                <span className="text-[10px] sm:text-xs font-black text-slate-900 shrink-0">{stats.revenue.toLocaleString(locale, { style: 'currency', currency: currencyCode })}</span>
              </div>
              <div className="flex justify-between items-center gap-2">
                <span className="text-[7px] sm:text-[8px] lg:text-[10px] font-black text-slate-400 uppercase truncate">{t.reportExpensesTotal}</span>
                <span className="text-[10px] sm:text-xs font-black text-red-500 shrink-0">-{stats.expenses.toLocaleString(locale, { style: 'currency', currency: currencyCode })}</span>
              </div>
              <div className="flex justify-between items-center gap-2">
                <span className="text-[7px] sm:text-[8px] lg:text-[10px] font-black text-slate-400 uppercase truncate">{t.masterTotalIva}</span>
                <span className="text-[10px] sm:text-xs font-black text-amber-500 shrink-0">{stats.totalIva.toLocaleString(locale, { style: 'currency', currency: currencyCode })}</span>
              </div>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 lg:gap-4">
        <div className="bg-white p-3.5 sm:p-4 lg:p-5 rounded-[1.25rem] sm:rounded-[1.5rem] lg:rounded-[2rem] border border-slate-100 shadow-sm space-y-2 group hover:shadow-xl transition-all overflow-hidden">
          <div className="flex justify-between items-start">
            <div className="p-1.5 sm:p-2 bg-emerald-50 text-emerald-600 rounded-lg shrink-0"><ArrowUpRight size={16} /></div>
            <span className="text-[7px] sm:text-[8px] font-black text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded-full uppercase">{t.reportRevenue}</span>
          </div>
          <div className="min-w-0">
            <p className="text-xs sm:text-sm lg:text-base font-black text-slate-900 leading-tight tracking-tight truncate" title={stats.revenue.toLocaleString(locale, { style: 'currency', currency: currencyCode })}>
              {stats.revenue.toLocaleString(locale, { style: 'currency', currency: currencyCode })}
            </p>
            <p className="text-[7px] sm:text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{stats.salesCount} {t.salesInPeriod}</p>
          </div>
        </div>

        <div className="bg-white p-3.5 sm:p-4 lg:p-5 rounded-[1.25rem] sm:rounded-[1.5rem] lg:rounded-[2rem] border border-slate-100 shadow-sm space-y-2 group hover:shadow-xl transition-all overflow-hidden">
          <div className="flex justify-between items-start">
            <div className="p-1.5 sm:p-2 bg-red-50 text-red-600 rounded-lg shrink-0"><ArrowDownRight size={16} /></div>
            <span className="text-[7px] sm:text-[8px] font-black text-red-500 bg-red-50 px-2 py-0.5 rounded-full uppercase">{t.reportCosts}</span>
          </div>
          <div className="min-w-0">
            <p className="text-xs sm:text-sm lg:text-base font-black text-slate-900 leading-tight tracking-tight truncate" title={stats.expenses.toLocaleString(locale, { style: 'currency', currency: currencyCode })}>
              {stats.expenses.toLocaleString(locale, { style: 'currency', currency: currencyCode })}
            </p>
            <p className="text-[7px] sm:text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{stats.expensesCount} {t.recordExpenses}</p>
          </div>
        </div>

        <div className="bg-white p-3.5 sm:p-4 lg:p-5 rounded-[1.25rem] sm:rounded-[1.5rem] lg:rounded-[2rem] border border-slate-100 shadow-sm space-y-2 group hover:shadow-xl transition-all overflow-hidden">
          <div className="flex justify-between items-start">
            <div className="p-1.5 sm:p-2 bg-amber-50 text-amber-600 rounded-lg shrink-0"><Receipt size={16} /></div>
            <span className="text-[7px] sm:text-[8px] font-black text-amber-500 bg-amber-50 px-2 py-0.5 rounded-full uppercase">{t.masterTotalIva}</span>
          </div>
          <div className="min-w-0">
            <p className="text-xs sm:text-sm lg:text-base font-black text-slate-900 leading-tight tracking-tight truncate" title={stats.totalIva.toLocaleString(locale, { style: 'currency', currency: currencyCode })}>
              {stats.totalIva.toLocaleString(locale, { style: 'currency', currency: currencyCode })}
            </p>
            <p className="text-[7px] sm:text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{t.ivaValue}</p>
          </div>
        </div>

        <div className="bg-slate-900 p-3.5 sm:p-4 lg:p-5 rounded-[1.25rem] sm:rounded-[1.5rem] lg:rounded-[2rem] shadow-2xl space-y-2 group relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-500 opacity-10 blur-2xl -mr-8 -mt-8"></div>
          <div className="flex justify-between items-start">
            <div className="p-1.5 sm:p-2 bg-white/10 text-emerald-400 rounded-lg shrink-0"><Target size={16} /></div>
            <span className="text-[7px] sm:text-[8px] font-black text-emerald-400 bg-white/5 px-2 py-0.5 rounded-full uppercase">{t.reportResult}</span>
          </div>
          <div className="min-w-0">
            <p className="text-xs sm:text-sm lg:text-base font-black text-white leading-tight tracking-tight truncate" title={stats.profit.toLocaleString(locale, { style: 'currency', currency: currencyCode })}>
              {stats.profit.toLocaleString(locale, { style: 'currency', currency: currencyCode })}
            </p>
            <p className="text-[7px] sm:text-[8px] font-bold text-emerald-400/60 uppercase tracking-widest mt-0.5">{t.reportRealProfit}</p>
          </div>
        </div>

        <div className="bg-white p-3.5 sm:p-4 lg:p-5 rounded-[1.25rem] sm:rounded-[1.5rem] lg:rounded-[2rem] border border-slate-100 shadow-sm space-y-2 group hover:shadow-xl transition-all overflow-hidden">
          <div className="flex justify-between items-start">
            <div className="p-1.5 sm:p-2 bg-blue-50 text-blue-600 rounded-lg shrink-0"><BarChart3 size={16} /></div>
            <span className="text-[7px] sm:text-[8px] font-black text-blue-500 bg-blue-50 px-2 py-0.5 rounded-full uppercase">{t.reportAvgTicket}</span>
          </div>
          <div className="min-w-0">
            <p className="text-xs sm:text-sm lg:text-base font-black text-slate-900 leading-tight tracking-tight truncate" title={stats.avgTicket.toLocaleString(locale, { style: 'currency', currency: currencyCode })}>
              {stats.avgTicket.toLocaleString(locale, { style: 'currency', currency: currencyCode })}
            </p>
            <p className="text-[7px] sm:text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{t.reportAvgPerClient}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 pt-6 lg:pt-12">
        {/* Detalhamento de Vendas */}
        <div className="space-y-4 lg:space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-4 lg:pb-6 gap-2">
            <div>
              <h3 className="text-xl lg:text-2xl font-black text-slate-900 flex items-center gap-2 lg:gap-3 italic">
                <LayoutGrid size={20} className="text-slate-400 lg:w-6 lg:h-6" />
                {t.reportSalesDetail}
              </h3>
              <p className="text-[10px] sm:text-xs font-bold text-slate-400 mt-0.5">
                Clique em uma venda para carregar as despesas do cliente
              </p>
            </div>
            {selectedBudgetId && (
              <button
                onClick={() => setSelectedBudgetId(null)}
                className="text-[10px] font-black uppercase tracking-wider px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all self-start sm:self-auto flex items-center gap-1 cursor-pointer"
              >
                <X size={12} /> Ver Todas as Vendas
              </button>
            )}
          </div>

          <div className="space-y-3 lg:space-y-4 max-h-[440px] overflow-y-auto pr-2 custom-scrollbar">
            {periodSales.length === 0 ? (
              <div className="py-12 lg:py-16 text-center bg-white rounded-[1.5rem] lg:rounded-[2.5rem] border border-slate-100 border-dashed">
                <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] lg:text-xs">
                  {t.reportNoSalesFound} {selectedPeriod === 'monthly' ? t[monthNames[reportMonth]] : ''}
                </p>
              </div>
            ) : (
              periodSales.map(budget => {
                const isSelected = selectedBudgetId === budget.id;
                const clientExpCount = (budget.expenses || []).length;
                const clientExpSum = (budget.expenses || []).reduce((s, e) => s + (e.amount || 0), 0);
                const hasIva = budget.includeIva && budget.ivaPercentage > 0;
                const subtotal = hasIva ? budget.totalAmount / (1 + budget.ivaPercentage / 100) : budget.totalAmount;

                return (
                  <div
                    key={budget.id}
                    onClick={() => setSelectedBudgetId(isSelected ? null : budget.id)}
                    className={`p-4 lg:p-6 rounded-[1.5rem] lg:rounded-[2rem] border transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 group ${
                      isSelected
                        ? 'bg-amber-500/10 border-amber-500 shadow-md ring-2 ring-amber-500/20'
                        : 'bg-white border-slate-100 shadow-sm hover:border-slate-300 hover:shadow-md'
                    }`}
                  >
                    <div className="flex items-center gap-4 lg:gap-6 min-w-0">
                      <div
                        className={`w-10 h-10 lg:w-12 lg:h-12 rounded-xl lg:rounded-2xl flex items-center justify-center shrink-0 transition-colors ${
                          isSelected
                            ? 'bg-amber-500 text-slate-950 font-black'
                            : 'bg-emerald-50 text-emerald-600'
                        }`}
                      >
                        <CheckCircle2 size={20} className="lg:w-6 lg:h-6" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-black text-slate-900 truncate text-sm lg:text-base">
                            {budget.clientName}
                          </h4>
                          {isSelected && (
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-amber-500 text-slate-950 uppercase tracking-wider shrink-0 flex items-center gap-1">
                              <Filter size={10} /> Selecionado
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-[9px] lg:text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1 flex-wrap">
                          <span>{new Date(budget.createdAt || budget.created_at).toLocaleDateString(locale)}</span>
                          <span className={`px-2 py-0.5 rounded-md font-black ${clientExpCount > 0 ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-slate-100 text-slate-400'}`}>
                            {clientExpCount} despesa(s) ({ (clientExpSum * currencyInfo.rate).toLocaleString(locale, { style: 'currency', currency: currencyCode }) })
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100">
                      <div className="text-left sm:text-right">
                        <p className="font-black text-slate-900 text-sm lg:text-base">
                          {(subtotal * currencyInfo.rate).toLocaleString(locale, { style: 'currency', currency: currencyCode })}
                          {hasIva && <span className="text-[9px] text-slate-400 font-bold ml-1 font-sans">s/ IVA</span>}
                        </p>
                        {hasIva && (
                          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                            c/ IVA: {(budget.totalAmount * currencyInfo.rate).toLocaleString(locale, { style: 'currency', currency: currencyCode })}
                          </p>
                        )}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onExportPdf(budget);
                          }}
                          className="text-[8px] font-black text-blue-500 uppercase tracking-widest hover:underline flex items-center gap-1 mt-1 sm:ml-auto"
                        >
                          <Download size={10} /> PDF
                        </button>
                      </div>
                      <ChevronRight
                        size={18}
                        className={`transition-transform text-slate-400 ${isSelected ? 'rotate-90 text-amber-600' : 'group-hover:translate-x-1'}`}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Detalhamento de Despesas */}
        <div className="space-y-4 lg:space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-4 lg:pb-6 gap-2">
            <div>
              <h3 className="text-xl lg:text-2xl font-black text-slate-900 flex items-center gap-2 lg:gap-3 italic">
                <Receipt size={20} className="text-slate-400 lg:w-6 lg:h-6" />
                {t.reportExpensesDetail}
              </h3>
              {selectedBudget ? (
                <p className="text-[10px] sm:text-xs font-bold text-amber-600 mt-0.5 flex items-center gap-1">
                  <Filter size={12} /> Filtrado para: <strong className="underline">{selectedBudget.clientName}</strong>
                </p>
              ) : (
                <p className="text-[10px] sm:text-xs font-bold text-slate-400 mt-0.5">
                  Exibindo todas as despesas no período
                </p>
              )}
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {selectedBudget && (
                <button
                  onClick={() => setSelectedBudgetId(null)}
                  className="text-[10px] font-black uppercase tracking-wider px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all flex items-center gap-1 cursor-pointer"
                >
                  <X size={12} /> Limpar Filtro
                </button>
              )}

              {selectedBudget && onSaveBudget && (
                <button
                  onClick={() => setManagingExpensesBudget(selectedBudget)}
                  className="bg-red-500 hover:bg-red-600 text-white text-xs font-black px-3.5 py-1.5 rounded-xl shadow-md transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer"
                >
                  <Plus size={14} /> + Adicionar Despesa
                </button>
              )}
            </div>
          </div>

          {/* Banner de Total de Despesas com Soma Automática */}
          <div className="bg-slate-900 text-white p-5 lg:p-6 rounded-[1.5rem] lg:rounded-[2.5rem] shadow-xl space-y-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-36 h-36 bg-red-500 opacity-15 blur-3xl -mr-12 -mt-12"></div>

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative z-10">
              <div>
                <span className="text-[9px] font-black uppercase tracking-widest text-red-400 bg-red-500/10 border border-red-500/20 px-2.5 py-1 rounded-full inline-block">
                  {selectedBudget ? `Total de Despesas do Cliente` : `Total de Despesas no Período`}
                </span>
                <h4 className="text-2xl sm:text-3xl font-black tracking-tight text-white mt-2">
                  {(displayedExpensesTotal * currencyInfo.rate).toLocaleString(locale, { style: 'currency', currency: currencyCode })}
                </h4>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                  {displayedExpenses.length} despesa(s) registrada(s) {selectedBudget ? `para ${selectedBudget.clientName}` : ''}
                </p>
              </div>

              {selectedBudget && (
                <div className="bg-white/10 p-3.5 rounded-2xl border border-white/10 text-right min-w-[170px] w-full sm:w-auto shrink-0">
                  <div className="text-[9px] font-bold text-white/60 uppercase">Venda (sem IVA)</div>
                  <div className="text-sm font-black text-emerald-400">
                    {(selectedBudgetSubtotal * currencyInfo.rate).toLocaleString(locale, { style: 'currency', currency: currencyCode })}
                  </div>
                  {selectedBudget.includeIva && selectedBudget.ivaPercentage > 0 && (
                    <div className="text-[8px] font-medium text-white/40">
                      Total c/ IVA: {(selectedBudget.totalAmount * currencyInfo.rate).toLocaleString(locale, { style: 'currency', currency: currencyCode })}
                    </div>
                  )}
                  <div className="text-[9px] font-bold text-white/60 uppercase mt-1.5">Lucro Estimado</div>
                  <div className={`text-sm font-black ${(selectedBudgetSubtotal - displayedExpensesTotal) >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {((selectedBudgetSubtotal - displayedExpensesTotal) * currencyInfo.rate).toLocaleString(locale, { style: 'currency', currency: currencyCode })}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Lista de Despesas */}
          <div className="space-y-3 lg:space-y-4 max-h-[340px] overflow-y-auto pr-2 custom-scrollbar">
            {displayedExpenses.length === 0 ? (
              <div className="py-12 lg:py-16 text-center bg-white rounded-[1.5rem] lg:rounded-[2.5rem] border border-slate-100 border-dashed space-y-3">
                <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] lg:text-xs">
                  {selectedBudget
                    ? `Nenhuma despesa registrada para ${selectedBudget.clientName}`
                    : `${t.reportNoExpensesFound} ${selectedPeriod === 'monthly' ? t[monthNames[reportMonth]] : ''}`}
                </p>
                {selectedBudget && onSaveBudget && (
                  <button
                    onClick={() => setManagingExpensesBudget(selectedBudget)}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-black text-xs rounded-xl shadow-md transition-all cursor-pointer"
                  >
                    <Plus size={14} /> + Adicionar Primeira Despesa
                  </button>
                )}
              </div>
            ) : (
              displayedExpenses.map((expense) => (
                <div
                  key={expense.id}
                  className="bg-white p-4 lg:p-5 rounded-[1.5rem] lg:rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-4 lg:gap-6 group hover:border-slate-300 transition-all"
                >
                  <div className="w-10 h-10 lg:w-12 lg:h-12 bg-red-50 text-red-600 rounded-xl lg:rounded-2xl flex items-center justify-center shrink-0">
                    <Wallet size={20} className="lg:w-6 lg:h-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-black text-slate-900 truncate text-sm lg:text-base">
                      {expense.description}
                    </h4>
                    <div className="flex items-center gap-2 flex-wrap mt-0.5">
                      <span className="text-[8px] lg:text-[10px] font-bold text-slate-400 uppercase tracking-widest truncate">
                        {expense.clientName}
                      </span>
                      {expense.quantity && expense.pricePerUnit && (
                        <span className="text-[9px] font-medium text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded-md">
                          {expense.quantity} {expense.unit || 'un'} x {(expense.pricePerUnit * currencyInfo.rate).toLocaleString(locale, { style: 'currency', currency: currencyCode })}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-black text-red-600 text-sm lg:text-base">
                      - {(expense.amount * currencyInfo.rate).toLocaleString(locale, { style: 'currency', currency: currencyCode })}
                    </p>
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">
                      {new Date(expense.date).toLocaleDateString(locale)}
                    </p>
                  </div>

                  {onSaveBudget && (
                    <div className="flex items-center gap-1 sm:gap-2 shrink-0 border-l border-slate-100 pl-2 lg:pl-3">
                      <button
                        type="button"
                        onClick={() => handleStartEditExpense(expense)}
                        className="p-1.5 sm:p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-xl transition-all cursor-pointer"
                        title={locale.startsWith('pt') ? 'Editar despesa' : 'Edit expense'}
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteExpense(expense.id, expense.budgetId)}
                        className="p-1.5 sm:p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all cursor-pointer"
                        title={locale.startsWith('pt') ? 'Excluir despesa' : 'Delete expense'}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Modal de Editar Despesa */}
      {editingExpense && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-lg rounded-[2rem] shadow-2xl overflow-hidden border border-slate-100 flex flex-col">
            <div className="px-6 py-4 bg-slate-900 text-white flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-500/20 text-amber-400 rounded-xl">
                  <Pencil size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-base sm:text-lg">
                    {locale.startsWith('pt') ? 'Editar Despesa' : 'Edit Expense'}
                  </h3>
                  <p className="text-[10px] text-slate-400 uppercase tracking-widest">
                    {editingExpense.expense.description}
                  </p>
                </div>
              </div>
              <button 
                type="button"
                onClick={() => setEditingExpense(null)}
                className="p-2 hover:bg-white/10 rounded-full transition-colors text-slate-400 hover:text-white cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveEditExpense} className="p-6 space-y-4">
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">
                  {t.expenseDescription || (locale.startsWith('pt') ? 'Descrição' : 'Description')}
                </label>
                <input
                  required
                  type="text"
                  value={editDescription}
                  onChange={e => setEditDescription(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-slate-900 font-bold text-sm"
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">
                    {t.quantity || (locale.startsWith('pt') ? 'Qtd.' : 'Qty.')}
                  </label>
                  <input
                    required
                    type="number"
                    min="1"
                    value={editQuantity === 0 ? '' : editQuantity}
                    onChange={e => setEditQuantity(e.target.value === '' ? 0 : Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none font-bold text-sm"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">
                    {t.unit || (locale.startsWith('pt') ? 'Unid.' : 'Unit')}
                  </label>
                  <input
                    required
                    type="text"
                    value={editUnit}
                    onChange={e => setEditUnit(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none font-bold text-sm"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">
                    {t.unitPrice || 'Preço Un.'} ({currencyCode})
                  </label>
                  <input
                    required
                    type="number"
                    step="0.01"
                    value={editPricePerUnit === 0 ? '' : editPricePerUnit}
                    onChange={e => setEditPricePerUnit(e.target.value === '' ? 0 : Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none font-bold text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">
                    {t.expenseDate || (locale.startsWith('pt') ? 'Data' : 'Date')}
                  </label>
                  <input
                    required
                    type="date"
                    value={editDate}
                    onChange={e => setEditDate(e.target.value)}
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 outline-none font-bold text-sm"
                  />
                </div>
                <div className="flex flex-col justify-end text-right">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    {t.total || 'Total'}
                  </p>
                  <p className="text-xl font-black text-slate-900">
                    {(editQuantity * editPricePerUnit).toLocaleString(locale, { style: 'currency', currency: currencyCode })}
                  </p>
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingExpense(null)}
                  className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition-all text-sm cursor-pointer"
                >
                  {t.cancel || 'Cancelar'}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-amber-500 text-slate-950 font-black rounded-xl hover:bg-amber-400 transition-all text-sm shadow-md cursor-pointer"
                >
                  {t.saveChanges || 'Salvar Alterações'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {managingExpensesBudget && (
        <ExpenseManager
          budget={managingExpensesBudget}
          plan={plan}
          onSave={(updated) => {
            onSaveBudget?.(updated);
            setManagingExpensesBudget(updated);
          }}
          onClose={() => setManagingExpensesBudget(null)}
          onUpgrade={onUpgrade || (() => {})}
          locale={locale}
          currencyCode={currencyCode}
        />
      )}
    </div>
  );
};

export default Reports;
