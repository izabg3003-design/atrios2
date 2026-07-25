import React, { useState } from 'react';
import { Check, Star, Ticket, Sparkles } from 'lucide-react';
import { Locale, translations } from '../translations';
import { PlanType, CurrencyCode, CURRENCIES } from '../types';
import { getCoupons } from '../services/storage';

interface PlansProps {
  currentPlan: PlanType;
  onSelect: (plan: PlanType, finalPrice: number, coupon?: string) => void;
  locale: Locale;
  currencyCode: CurrencyCode;
  isProcessing?: boolean;
}

type FeatureItem = string | { text: string; highlighted?: boolean };

const Plans: React.FC<PlansProps> = ({ currentPlan, onSelect, locale, currencyCode, isProcessing }) => {
  const t = translations[locale];
  const currencyInfo = CURRENCIES[currencyCode];
  const [couponCode, setCouponCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState<number>(0);
  const [couponError, setCouponError] = useState('');

  const basePrices = {
    free: 0,
    monthly: 9.90,
    annual: 89.90
  };

  const handleApplyCoupon = () => {
    const coupons = getCoupons();
    const coupon = coupons.find(c => c.code.toUpperCase() === couponCode.toUpperCase() && c.active);
    
    if (coupon) {
      setAppliedDiscount(coupon.discountPercentage);
      setCouponError('');
    } else {
      setAppliedDiscount(0);
      setCouponError(t.plansCouponInvalid);
    }
  };

  const calculatePrice = (baseEur: number) => {
    let finalEur = baseEur;
    if (appliedDiscount > 0 && baseEur > 0) {
      finalEur = baseEur * (1 - appliedDiscount / 100);
    }
    return finalEur;
  };

  const formatPrice = (eurValue: number) => {
    const convertedValue = eurValue * currencyInfo.rate;
    return convertedValue.toLocaleString(locale, { 
      style: 'currency', 
      currency: currencyCode,
      minimumFractionDigits: eurValue === 0 ? 0 : 2
    });
  };

  const [selectedPlanTab, setSelectedPlanTab] = useState<'all' | PlanType>('all');

  const plans: Array<{
    id: PlanType;
    name: string;
    basePrice: number;
    period: string;
    savings?: string;
    bestValue?: boolean;
    features: FeatureItem[];
    color: string;
    textColor: string;
    buttonColor: string;
  }> = [
    {
      id: PlanType.FREE,
      name: t.planFree,
      basePrice: basePrices.free,
      period: "",
      features: [
        t.featItemsLimit,
        t.featExpenseLimit,
        t.featPdfLimit,
        t.featServiceLimit
      ],
      color: "bg-slate-100 border border-slate-200",
      textColor: "text-slate-900",
      buttonColor: "bg-slate-300 text-slate-900 hover:bg-slate-400"
    },
    {
      id: PlanType.PREMIUM_MONTHLY,
      name: t.planMonthly,
      basePrice: basePrices.monthly,
      period: t.planPeriodMonth,
      features: [
        "Orçamentos ilimitados",
        "Registos de despesas ilimitados",
        "Downloads ilimitados",
        "Escolha e inclusão de serviços sem limites",
        "Acesso a todos os relatórios",
        "Upload de mapa do projeto"
      ],
      color: "bg-slate-900 border border-slate-800",
      textColor: "text-white",
      buttonColor: "bg-amber-500 text-slate-900 hover:bg-amber-400 font-black"
    },
    {
      id: PlanType.PREMIUM_ANNUAL,
      name: t.planAnnual,
      basePrice: basePrices.annual,
      period: t.planPeriodYear,
      savings: t.planPromoAnnual,
      bestValue: true,
      features: [
        "Orçamentos ilimitados",
        "Registos de despesas ilimitados",
        "Downloads ilimitados",
        "Escolha e inclusão de serviços sem limites",
        "Acesso a todos os relatórios",
        "Upload de mapa do projeto",
        "Backup na Nuvem Ilimitado",
        "Logótipo HD no PDF",
        {
          text: "GANHE UM SITE PROFISSIONAL COMPLETO (4 PÁGINAS)",
          highlighted: true
        }
      ],
      color: "bg-amber-500 border-2 border-slate-900",
      textColor: "text-slate-900",
      buttonColor: "bg-slate-900 text-white hover:bg-slate-800 font-black"
    }
  ];

  const visiblePlans = selectedPlanTab === 'all' ? plans : plans.filter(p => p.id === selectedPlanTab);

  return (
    <div className="space-y-4 sm:space-y-8 lg:space-y-12 py-2 sm:py-4 lg:py-8 animate-in fade-in duration-700 max-w-full overflow-hidden box-border px-1 sm:px-2">
      <div className="text-center space-y-1.5 sm:space-y-2 lg:space-y-4 px-2">
        <h2 className="text-2xl sm:text-3xl lg:text-5xl font-black text-slate-900 tracking-tight">{t.plans}</h2>
        <p className="text-slate-500 text-xs sm:text-base lg:text-xl max-w-2xl mx-auto font-medium px-2">
          {t.planDescriptionSub}
        </p>
      </div>

      {/* Mobile Plan Segmented Filter Control */}
      <div className="flex md:hidden items-center justify-center gap-1 bg-slate-200/90 p-1 rounded-2xl max-w-[20rem] mx-auto text-[10px] font-black uppercase tracking-wider">
        <button 
          onClick={() => setSelectedPlanTab('all')} 
          className={`flex-1 py-1.5 rounded-xl transition-all text-center ${selectedPlanTab === 'all' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-600'}`}
        >
          Todos
        </button>
        <button 
          onClick={() => setSelectedPlanTab(PlanType.PREMIUM_ANNUAL)} 
          className={`flex-1 py-1.5 rounded-xl transition-all flex items-center justify-center gap-1 ${selectedPlanTab === PlanType.PREMIUM_ANNUAL ? 'bg-amber-500 text-slate-900 shadow-md font-black' : 'text-slate-600'}`}
        >
          <Star size={10} className="fill-slate-900 text-slate-900" /> Anual
        </button>
        <button 
          onClick={() => setSelectedPlanTab(PlanType.PREMIUM_MONTHLY)} 
          className={`flex-1 py-1.5 rounded-xl transition-all text-center ${selectedPlanTab === PlanType.PREMIUM_MONTHLY ? 'bg-slate-900 text-white shadow-md' : 'text-slate-600'}`}
        >
          Mensal
        </button>
      </div>

      <div className="max-w-md mx-auto bg-white p-3 sm:p-4 lg:p-6 rounded-2xl sm:rounded-[2rem] border border-slate-100 shadow-md flex items-center gap-2 sm:gap-4 mx-2 sm:mx-auto">
        <div className="p-2 sm:p-2.5 bg-amber-50 text-amber-500 rounded-xl shrink-0">
          <Ticket size={18} className="sm:w-5 sm:h-5 lg:w-6 lg:h-6" />
        </div>
        <div className="flex-1 min-w-0 space-y-0.5">
          <input 
            type="text" 
            value={couponCode} 
            onChange={e => setCouponCode(e.target.value)} 
            placeholder={t.plansCouponPlaceholder}
            className="w-full bg-transparent outline-none font-black text-slate-900 uppercase placeholder:normal-case text-xs sm:text-sm lg:text-base"
          />
          {couponError && <p className="text-[8px] sm:text-[10px] font-bold text-red-500">{couponError}</p>}
          {appliedDiscount > 0 && <p className="text-[8px] sm:text-[10px] font-bold text-emerald-500">{t.plansCouponApplied} (-{appliedDiscount}%)</p>}
        </div>
        <button 
          onClick={handleApplyCoupon}
          className="px-3 sm:px-5 lg:px-6 py-2 sm:py-2.5 lg:py-3 bg-slate-900 text-white rounded-xl lg:rounded-2xl font-black text-[9px] sm:text-[10px] lg:text-xs uppercase tracking-wider hover:bg-slate-800 transition-all shrink-0"
        >
          {t.plansCouponApply}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 max-w-7xl mx-auto px-2 sm:px-4 pb-10">
        {visiblePlans.map((plan, index) => {
          const finalPriceEur = calculatePrice(plan.basePrice);
          return (
            <div 
              key={index} 
              className={`relative flex flex-col p-4 sm:p-8 lg:p-10 rounded-2xl sm:rounded-[2.5rem] lg:rounded-[3rem] shadow-lg transition-all transform hover:-translate-y-1 ${plan.color} ${plan.textColor} ${plan.bestValue ? 'md:scale-105 shadow-xl shadow-amber-500/20' : ''}`}
            >
              {plan.bestValue && (
                <div className="absolute -top-3.5 sm:-top-4 lg:-top-5 left-1/2 -translate-x-1/2 bg-slate-900 text-amber-400 px-3 sm:px-5 lg:px-6 py-1 sm:py-1.5 rounded-full text-[9px] sm:text-[10px] lg:text-xs font-black uppercase tracking-wider flex items-center gap-1 sm:gap-1.5 whitespace-nowrap z-10 shadow-lg border border-amber-400/30">
                  <Star size={11} className="fill-amber-400 text-amber-400 sm:w-3 sm:h-3" /> {t.bestValue}
                </div>
              )}

              <div className="space-y-1 lg:space-y-2 mb-3 sm:mb-6 lg:mb-8 mt-1">
                <h3 className="text-base sm:text-xl lg:text-2xl font-black uppercase tracking-tighter italic">{plan.name}</h3>
                <div className="flex flex-col">
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl sm:text-3xl lg:text-4xl font-black">{formatPrice(finalPriceEur)}</span>
                    <span className="text-xs sm:text-sm font-bold opacity-60">{plan.period}</span>
                  </div>
                  {appliedDiscount > 0 && plan.basePrice > 0 && (
                    <span className="text-xs sm:text-sm line-through opacity-40 font-bold">
                      {formatPrice(plan.basePrice)}
                    </span>
                  )}
                </div>
                {plan.savings && (
                  <p className="text-[8px] sm:text-[9px] lg:text-[10px] font-black text-red-600 bg-white inline-block px-2 sm:px-2.5 py-0.5 rounded-md mt-1 font-mono uppercase tracking-wider shadow-sm">
                    {plan.savings}
                  </p>
                )}
              </div>

              <div className="flex-1 space-y-2 sm:space-y-3 lg:space-y-4 mb-5 sm:mb-8 lg:mb-10">
                {plan.features.map((featureItem, fIndex) => {
                  const isObj = typeof featureItem === 'object';
                  const text = isObj ? featureItem.text : featureItem;
                  const isHighlighted = isObj && featureItem.highlighted;

                  if (isHighlighted) {
                    return (
                      <div 
                        key={fIndex} 
                        className="bg-slate-900 text-amber-400 p-3 sm:p-3.5 lg:p-4 rounded-xl sm:rounded-2xl shadow-lg border border-amber-400/30 flex items-start gap-2 sm:gap-3 my-2 sm:my-3 transition-all"
                      >
                        <div className="p-1 bg-amber-400/20 text-amber-400 rounded-lg shrink-0 mt-0.5">
                          <Sparkles size={14} className="animate-pulse text-amber-400" />
                        </div>
                        <div className="space-y-0.5 min-w-0">
                          <span className="text-[8px] sm:text-[9px] lg:text-[10px] font-black uppercase tracking-wider text-amber-300 block leading-none">
                            ✨ OFERTA EXCLUSIVA EM DESTAQUE
                          </span>
                          <span className="text-xs sm:text-sm font-black tracking-tight leading-snug block text-amber-400 break-words">
                            {text}
                          </span>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div key={fIndex} className="flex items-start gap-2 lg:gap-3">
                      <div className={`mt-0.5 p-0.5 rounded-full shrink-0 ${plan.textColor === 'text-white' ? 'bg-white/20 text-white' : 'bg-slate-900/10 text-slate-900'}`}>
                        <Check size={10} className="sm:w-3 sm:h-3" />
                      </div>
                      <span className="text-[11px] sm:text-xs font-bold leading-snug">{text}</span>
                    </div>
                  );
                })}
              </div>

              <button 
                onClick={() => onSelect(plan.id, finalPriceEur, appliedDiscount > 0 ? couponCode : undefined)}
                disabled={isProcessing || currentPlan === plan.id}
                className={`w-full max-w-full min-h-[44px] sm:min-h-[48px] px-3 py-3 sm:py-4 rounded-xl sm:rounded-2xl font-black text-xs sm:text-base transition-all shadow-md active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 uppercase tracking-wide shrink-0 ${plan.buttonColor}`}
              >
                {isProcessing ? (
                  <div className="w-5 h-5 border-2 border-slate-900/20 border-t-slate-900 rounded-full animate-spin" />
                ) : (
                  currentPlan === plan.id ? t.currentPlan : (t.selectPlan || 'Começar Agora')
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Plans;