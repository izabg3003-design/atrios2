import React, { useState } from 'react';
import { Check, Star, Ticket, Percent } from 'lucide-react';
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

  const plans = [
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
      color: "bg-slate-100",
      textColor: "text-slate-900",
      buttonColor: "bg-slate-200 text-slate-900"
    },
    {
      id: PlanType.PREMIUM_MONTHLY,
      name: t.planMonthly,
      basePrice: basePrices.monthly,
      period: t.planPeriodMonth,
      features: [
        t.featUnlimitedItems,
        t.featAdvancedDash,
        t.featProfitReports,
        t.featUnlimitedPdf,
        t.featPrioritySupport
      ],
      color: "bg-slate-900",
      textColor: "text-white",
      buttonColor: "bg-amber-500 text-slate-900"
    },
    {
      id: PlanType.PREMIUM_ANNUAL,
      name: t.planAnnual,
      basePrice: basePrices.annual,
      period: t.planPeriodYear,
      savings: t.planPromoAnnual,
      bestValue: true,
      features: [
        t.featEverythingMonthly,
        t.planWebsiteBonus,
        t.planDomainBonus,
        t.featCloudBackup,
        t.featHdLogo
      ],
      color: "bg-amber-500",
      textColor: "text-slate-900",
      buttonColor: "bg-slate-900 text-white"
    }
  ];

  return (
    <div className="space-y-8 lg:space-y-12 py-4 lg:py-8 animate-in fade-in duration-700">
      <div className="text-center space-y-2 lg:space-y-4">
        <h2 className="text-3xl lg:text-5xl font-black text-slate-900 tracking-tight">{t.plans}</h2>
        <p className="text-slate-500 text-base lg:text-xl max-w-2xl mx-auto font-medium px-4">
          {t.planDescriptionSub}
        </p>
      </div>

      <div className="max-w-md mx-auto bg-white p-4 lg:p-6 rounded-[2rem] lg:rounded-[2.5rem] border border-slate-100 shadow-xl flex items-center gap-3 lg:gap-4 mx-4 sm:mx-auto">
        <div className="p-2 lg:p-3 bg-amber-50 text-amber-500 rounded-xl lg:rounded-2xl shrink-0">
          <Ticket size={20} className="lg:w-6 lg:h-6" />
        </div>
        <div className="flex-1 min-w-0 space-y-0.5 lg:space-y-1">
          <input 
            type="text" 
            value={couponCode} 
            onChange={e => setCouponCode(e.target.value)} 
            placeholder={t.plansCouponPlaceholder}
            className="w-full bg-transparent outline-none font-black text-slate-900 uppercase placeholder:normal-case text-sm lg:text-base"
          />
          {couponError && <p className="text-[8px] lg:text-[10px] font-bold text-red-500">{couponError}</p>}
          {appliedDiscount > 0 && <p className="text-[8px] lg:text-[10px] font-bold text-emerald-500">{t.plansCouponApplied} (-{appliedDiscount}%)</p>}
        </div>
        <button 
          onClick={handleApplyCoupon}
          className="px-4 lg:px-6 py-2.5 lg:py-3 bg-slate-900 text-white rounded-xl lg:rounded-2xl font-black text-[10px] lg:text-xs uppercase tracking-widest hover:bg-slate-800 transition-all shrink-0"
        >
          {t.plansCouponApply}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-8 max-w-7xl mx-auto px-4 pb-10">
        {plans.map((plan, index) => {
          const finalPriceEur = calculatePrice(plan.basePrice);
          return (
            <div 
              key={index} 
              className={`relative flex flex-col p-8 lg:p-10 rounded-[2.5rem] lg:rounded-[3rem] shadow-xl transition-all transform hover:-translate-y-2 ${plan.color} ${plan.textColor} ${plan.bestValue ? 'ring-4 lg:ring-8 ring-amber-500/20 md:scale-105' : ''} ${index === 1 ? 'md:mt-0' : ''}`}
            >
              {plan.bestValue && (
                <div className="absolute -top-4 lg:-top-5 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-4 lg:px-6 py-1.5 lg:py-2 rounded-full text-[10px] lg:text-xs font-black uppercase tracking-widest flex items-center gap-1.5 lg:gap-2 whitespace-nowrap z-10">
                  <Star size={12} className="fill-amber-400 text-amber-400 lg:w-3.5 lg:h-3.5" /> {t.bestValue}
                </div>
              )}

              <div className="space-y-1 lg:space-y-2 mb-6 lg:mb-8">
                <h3 className="text-xl lg:text-2xl font-black uppercase tracking-tighter italic">{plan.name}</h3>
                <div className="flex flex-col">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl lg:text-4xl font-black">{formatPrice(finalPriceEur)}</span>
                    <span className="text-xs lg:text-sm font-bold opacity-60">{plan.period}</span>
                  </div>
                  {appliedDiscount > 0 && plan.basePrice > 0 && (
                    <span className="text-xs lg:text-sm line-through opacity-40 font-bold">
                      {formatPrice(plan.basePrice)}
                    </span>
                  )}
                </div>
                {plan.savings && (
                  <p className="text-[8px] lg:text-[10px] font-black text-red-500 bg-white/90 inline-block px-2 lg:px-3 py-1 rounded-lg mt-1 lg:mt-2">
                    {plan.savings}
                  </p>
                )}
              </div>

              <div className="flex-1 space-y-3 lg:space-y-4 mb-8 lg:mb-10">
                {plan.features.map((feature, fIndex) => (
                  <div key={fIndex} className="flex items-start gap-2 lg:gap-3">
                    <div className={`mt-0.5 lg:mt-1 p-0.5 rounded-full shrink-0 ${plan.textColor === 'text-white' ? 'bg-white/20' : 'bg-slate-900/10'}`}>
                      <Check size={10} className="lg:w-3 lg:h-3" />
                    </div>
                    <span className="text-[11px] lg:text-xs font-bold leading-tight">{feature}</span>
                  </div>
                ))}
              </div>

              <button 
                onClick={() => onSelect(plan.id, finalPriceEur, appliedDiscount > 0 ? couponCode : undefined)}
                disabled={isProcessing || currentPlan === plan.id}
                className={`w-full py-4 lg:py-5 rounded-2xl lg:rounded-[2rem] font-black text-base lg:text-lg transition-all shadow-lg active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${plan.buttonColor}`}
              >
                {isProcessing ? (
                  <div className="w-5 h-5 lg:w-6 lg:h-6 border-4 border-slate-900/20 border-t-slate-900 rounded-full animate-spin" />
                ) : (
                  currentPlan === plan.id ? t.currentPlan : t.selectPlan
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