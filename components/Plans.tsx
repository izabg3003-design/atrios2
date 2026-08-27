import React, { useState } from 'react';
import { Check, Star, Ticket, Sparkles, Shirt, Globe, Gift, FileText, X, ShieldAlert } from 'lucide-react';
import { Locale, translations } from '../translations';
import { PlanType, CurrencyCode, CURRENCIES } from '../types';
import { getCoupons } from '../services/storage';
import { plansTranslations } from './plansTranslations';

interface PlansProps {
  currentPlan: PlanType;
  onSelect: (plan: PlanType, finalPrice: number, coupon?: string) => void;
  locale: Locale;
  currencyCode: CurrencyCode;
  isProcessing?: boolean;
}

type FeatureItem = string | { 
  text: string; 
  highlighted?: boolean; 
  icon?: 'shirt' | 'globe' | 'gift' | 'sparkles'; 
  badge?: string; 
  notIncluded?: boolean;
  boxed?: boolean;
  promoDetails?: {
    limitText: string;
    showRegulation?: boolean;
  };
};

const Plans: React.FC<PlansProps> = ({ currentPlan, onSelect, locale, currencyCode, isProcessing }) => {
  const t = translations[locale];
  const pt = plansTranslations[locale] || plansTranslations['pt-PT'];
  const currencyInfo = CURRENCIES[currencyCode];
  const [couponCode, setCouponCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState<number>(0);
  const [couponError, setCouponError] = useState('');
  const [showRegulationModal, setShowRegulationModal] = useState(false);

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
      setCouponError(pt.couponInvalid || t.plansCouponInvalid);
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

  const isCurrentPlan = (planId: PlanType) => {
    if (currentPlan === planId) return true;
    if (currentPlan === PlanType.PREMIUM && planId === PlanType.PREMIUM_MONTHLY) return true;
    return false;
  };

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
      name: pt.planFree,
      basePrice: basePrices.free,
      period: "",
      features: [
        pt.featItemsLimit,
        pt.featExpenseLimit,
        pt.featPdfLimit,
        pt.featServiceLimit,
        { text: pt.featClientRequestsNotIncluded, notIncluded: true },
        { text: pt.featUnlimitedItemsNotIncluded, notIncluded: true },
        { text: pt.featProfitReportsNotIncluded, notIncluded: true },
        { text: pt.featUnlimitedPdfNotIncluded, notIncluded: true },
        { text: pt.featCloudBackupNotIncluded, notIncluded: true },
        { text: pt.featHdLogoNotIncluded, notIncluded: true },
        { text: pt.featGiftsNotIncluded, notIncluded: true, boxed: true }
      ],
      color: "bg-slate-100 border border-slate-200",
      textColor: "text-slate-900",
      buttonColor: "bg-slate-300 text-slate-900 hover:bg-slate-400 font-black"
    },
    {
      id: PlanType.PREMIUM_MONTHLY,
      name: pt.planMonthly,
      basePrice: basePrices.monthly,
      period: pt.periodMonth,
      features: [
        pt.featUnlimitedItems,
        pt.featClientRequestsMonthly,
        pt.featUnlimitedExpenses,
        pt.featUnlimitedPdf,
        pt.featCloudBackup,
        pt.featProfitReports,
        pt.featHdLogo,
        pt.featPrioritySupport,
        { text: pt.featAnnualDiscountNotIncluded, notIncluded: true },
        { text: pt.featGiftsMonthlyNotIncluded, notIncluded: true, boxed: true }
      ],
      color: "bg-slate-900 border border-slate-800",
      textColor: "text-white",
      buttonColor: "bg-amber-500 text-slate-900 hover:bg-amber-400 font-black"
    },
    {
      id: PlanType.PREMIUM_ANNUAL,
      name: pt.planAnnual,
      basePrice: basePrices.annual,
      period: pt.periodYear,
      savings: pt.savingsAnnual,
      bestValue: true,
      features: [
        pt.featUnlimitedItems,
        pt.featClientRequestsAnnual,
        pt.featUnlimitedExpenses,
        pt.featUnlimitedPdf,
        pt.featCloudBackup,
        pt.featProfitReports,
        pt.featHdLogo,
        pt.featPrioritySupportVip,
        pt.featAnnualSavingsText,
        {
          text: pt.featGiftsAnnualExclusive,
          highlighted: true,
          icon: 'shirt'
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
        <h2 className="text-2xl sm:text-3xl lg:text-5xl font-black text-slate-900 tracking-tight">{pt.title}</h2>
        <p className="text-slate-500 text-xs sm:text-base lg:text-xl max-w-2xl mx-auto font-medium px-2">
          {pt.subtitle}
        </p>
      </div>

      {/* Mobile Plan Segmented Filter Control */}
      <div className="flex md:hidden items-center justify-center gap-1 bg-slate-200/90 p-1 rounded-2xl max-w-[20rem] mx-auto text-[10px] font-black uppercase tracking-wider">
        <button 
          onClick={() => setSelectedPlanTab('all')} 
          className={`flex-1 py-2 rounded-xl transition-all text-center font-bold ${selectedPlanTab === 'all' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-600 hover:text-slate-900'}`}
        >
          {pt.filterAll}
        </button>
        <button 
          onClick={() => setSelectedPlanTab(PlanType.PREMIUM_ANNUAL)} 
          className={`flex-1 py-2 rounded-xl transition-all flex items-center justify-center gap-1 font-bold ${selectedPlanTab === PlanType.PREMIUM_ANNUAL ? 'bg-amber-500 text-slate-900 shadow-md font-black' : 'text-slate-600 hover:text-slate-900'}`}
        >
          <Star size={11} className="fill-slate-900 text-slate-900" /> {pt.planAnnual}
        </button>
        <button 
          onClick={() => setSelectedPlanTab(PlanType.PREMIUM_MONTHLY)} 
          className={`flex-1 py-2 rounded-xl transition-all text-center font-bold ${selectedPlanTab === PlanType.PREMIUM_MONTHLY ? 'bg-slate-900 text-white shadow-md' : 'text-slate-600 hover:text-slate-900'}`}
        >
          {pt.planMonthly}
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
            placeholder={pt.couponPlaceholder || t.plansCouponPlaceholder}
            className="w-full bg-transparent outline-none font-black text-slate-900 uppercase placeholder:normal-case text-xs sm:text-sm lg:text-base"
          />
          {couponError && <p className="text-[8px] sm:text-[10px] font-bold text-red-500">{couponError}</p>}
          {appliedDiscount > 0 && <p className="text-[8px] sm:text-[10px] font-bold text-emerald-500">{pt.couponApplied} (-{appliedDiscount}%)</p>}
        </div>
        <button 
          onClick={handleApplyCoupon}
          className="px-3 sm:px-5 lg:px-6 py-2 sm:py-2.5 lg:py-3 bg-slate-900 text-white rounded-xl lg:rounded-2xl font-black text-[9px] sm:text-[10px] lg:text-xs uppercase tracking-wider hover:bg-slate-800 transition-all shrink-0"
        >
          {pt.couponApply}
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
                  <Star size={11} className="fill-amber-400 text-amber-400 sm:w-3 sm:h-3" /> {plan.bestValue ? pt.bestValue : t.bestValue}
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
                    const iconType = isObj && featureItem.icon ? featureItem.icon : 'sparkles';
                    const IconComp = iconType === 'shirt' ? Shirt : (iconType === 'globe' ? Globe : Sparkles);

                    return (
                      <div key={fIndex} className="space-y-2 my-2.5">
                        <div className="bg-white text-slate-900 p-3 sm:p-3.5 rounded-xl sm:rounded-2xl border-2 border-slate-900 shadow-md hover:shadow-lg transition-all flex items-center gap-2.5">
                          <div className="p-2 bg-slate-900 text-amber-400 rounded-lg font-black shrink-0 shadow-sm">
                            <IconComp size={16} />
                          </div>
                          <p className="text-[11px] sm:text-xs font-black tracking-tight leading-snug text-slate-900 uppercase break-words flex-1">
                            {text}
                          </p>
                        </div>

                        <div className="bg-slate-900 text-white p-3 rounded-xl flex flex-col items-center justify-center gap-2 shadow-inner border border-slate-800 text-center">
                          <span className="text-[10px] sm:text-[11px] font-black uppercase text-amber-300 tracking-tight flex items-center justify-center gap-1">
                            <span className="animate-pulse">⚡</span> {pt.promoLimitedOffer}
                          </span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowRegulationModal(true);
                            }}
                            className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-slate-900 bg-amber-400 hover:bg-amber-300 px-3 py-1.5 rounded-lg transition-all shadow-sm flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer"
                          >
                            <FileText size={12} /> {pt.viewRegulation}
                          </button>
                        </div>
                      </div>
                    );
                  }

                  const isNotIncluded = isObj && featureItem.notIncluded;

                  if (isNotIncluded) {
                    if (featureItem.boxed) {
                      return (
                        <div key={fIndex} className="my-2.5">
                          <div className={`p-3 sm:p-3.5 rounded-xl sm:rounded-2xl border-2 flex items-center gap-2.5 transition-all shadow-sm ${
                            plan.textColor === 'text-white' 
                              ? 'bg-slate-800/90 border-slate-700 text-slate-300' 
                              : 'bg-slate-200/90 border-slate-300 text-slate-800'
                          }`}>
                            <div className="p-1 rounded-full shrink-0 bg-red-500/20 text-red-500 border border-red-500/30">
                              <X size={12} className="sm:w-3.5 sm:h-3.5" />
                            </div>
                            <p className={`text-[11px] sm:text-xs font-black tracking-tight leading-snug uppercase break-words flex-1 ${
                              plan.textColor === 'text-white' ? 'text-slate-300' : 'text-slate-700'
                            }`}>
                              {text}
                            </p>
                          </div>
                        </div>
                      );
                    }

                    if (featureItem.promoDetails) {
                      return (
                        <div key={fIndex} className="space-y-2 my-2.5 opacity-85">
                          <div className={`p-3 sm:p-3.5 rounded-xl sm:rounded-2xl border-2 flex items-start gap-2.5 transition-all shadow-sm ${
                            plan.textColor === 'text-white' 
                              ? 'bg-slate-800/80 border-slate-700 text-slate-300' 
                              : 'bg-slate-200/80 border-slate-300 text-slate-700'
                          }`}>
                            <div className="mt-0.5 p-1 rounded-full shrink-0 bg-red-500/20 text-red-500 border border-red-500/30">
                              <X size={12} className="sm:w-3.5 sm:h-3.5" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className={`text-[11px] sm:text-xs font-black tracking-tight leading-snug uppercase line-through break-words ${
                                plan.textColor === 'text-white' ? 'text-slate-400' : 'text-slate-600'
                              }`}>
                                {text}
                              </p>
                              <div className="mt-2.5 pt-2 border-t border-dashed border-slate-400/30 flex flex-wrap items-center justify-between gap-2">
                                <span className={`text-[9px] sm:text-[10px] font-black uppercase flex items-center gap-1 ${
                                  plan.textColor === 'text-white' ? 'text-amber-400' : 'text-amber-700'
                                }`}>
                                  <span>⚡</span> {featureItem.promoDetails.limitText}
                                </span>
                                {featureItem.promoDetails.showRegulation && (
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setShowRegulationModal(true);
                                    }}
                                    className={`text-[8px] sm:text-[9px] font-black uppercase tracking-wider px-2 py-1 rounded-lg transition-all shadow-sm flex items-center gap-1 active:scale-95 cursor-pointer ${
                                      plan.textColor === 'text-white'
                                        ? 'bg-slate-700 text-slate-200 hover:bg-slate-600 border border-slate-600'
                                        : 'bg-slate-300 text-slate-800 hover:bg-slate-400 border border-slate-400/50'
                                    }`}
                                  >
                                    <FileText size={10} /> {pt.viewRegulation}
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    }

                    return (
                      <div key={fIndex} className="flex items-start gap-2 lg:gap-3 opacity-60">
                        <div className={`mt-0.5 p-0.5 rounded-full shrink-0 ${plan.textColor === 'text-white' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-red-100 text-red-500 border border-red-200'}`}>
                          <X size={10} className="sm:w-3 sm:h-3" />
                        </div>
                        <span className={`text-[11px] sm:text-xs font-semibold leading-snug line-through ${plan.textColor === 'text-white' ? 'text-slate-400' : 'text-slate-500'}`}>{text}</span>
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
                disabled={isProcessing || isCurrentPlan(plan.id)}
                className={`w-full max-w-full min-h-[44px] sm:min-h-[48px] px-3 py-3 sm:py-4 rounded-xl sm:rounded-2xl font-black text-xs sm:text-base transition-all shadow-md active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 uppercase tracking-wide shrink-0 ${plan.buttonColor}`}
              >
                {isProcessing ? (
                  <div className="w-5 h-5 border-2 border-slate-900/20 border-t-slate-900 rounded-full animate-spin" />
                ) : (
                  isCurrentPlan(plan.id) ? pt.currentPlan : pt.startNow
                )}
              </button>
            </div>
          );
        })}
      </div>

      {/* Modal de Regulamento da Promoção */}
      {showRegulationModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
            {/* Header */}
            <div className="p-5 sm:p-6 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 bg-amber-500 text-slate-900 rounded-xl font-black">
                  <FileText size={20} />
                </div>
                <div>
                  <h3 className="font-black text-base sm:text-lg uppercase tracking-tight text-white">{pt.regulationModalTitle}</h3>
                  <p className="text-[10px] text-amber-400 font-bold uppercase tracking-wider">{pt.regulationModalSubtitle}</p>
                </div>
              </div>
              <button 
                onClick={() => setShowRegulationModal(false)}
                className="p-2 text-slate-400 hover:text-white bg-white/10 hover:bg-white/20 rounded-xl transition-all"
                title={pt.closeModal}
              >
                <X size={18} />
              </button>
            </div>

            {/* Content */}
            <div className="p-5 sm:p-7 overflow-y-auto max-h-[65vh] space-y-5 text-slate-700 text-xs sm:text-sm leading-relaxed scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100 pr-4 sm:pr-6">
              <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl flex items-start gap-3 text-amber-950 shadow-sm">
                <Sparkles size={20} className="text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-black text-xs uppercase tracking-wide text-amber-900 mb-0.5">{pt.regulationBannerTitle}</h4>
                  <p className="text-[11px] sm:text-xs text-amber-800 font-medium">
                    {pt.regulationBannerSubtitle}
                  </p>
                </div>
              </div>

              <div className="space-y-5 divide-y divide-slate-100">
                {/* 1. OBJETO DA PROMOÇÃO */}
                <div className="pt-2">
                  <h4 className="font-black text-slate-900 uppercase text-xs sm:text-sm mb-2 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-slate-900 text-amber-400 flex items-center justify-center text-[10px] font-black shrink-0">1</span>
                    {pt.regSec1Title}
                  </h4>
                  <p className="mb-2">
                    {pt.regSec1P1}
                  </p>
                  <p className="mb-2">{pt.regSec1P2}</p>
                  <ul className="list-disc list-inside space-y-1 font-bold text-slate-900 pl-2 mb-2">
                    <li>{pt.regSec1Item1}</li>
                    <li>{pt.regSec1Item2}</li>
                  </ul>
                  <p className="text-slate-600 text-[11px] italic">
                    {pt.regSec1StockNote}
                  </p>
                </div>

                {/* 2. QUEM PODE PARTICIPAR */}
                <div className="pt-4">
                  <h4 className="font-black text-slate-900 uppercase text-xs sm:text-sm mb-2 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-slate-900 text-amber-400 flex items-center justify-center text-[10px] font-black shrink-0">2</span>
                    {pt.regSec2Title}
                  </h4>
                  <p className="mb-2">
                    {pt.regSec2P1}
                  </p>
                  <p className="mb-2">
                    {pt.regSec2P2}
                  </p>
                  <p>
                    {pt.regSec2P3}
                  </p>
                </div>

                {/* 3. ENVIO DO LOGÓTIPO */}
                <div className="pt-4">
                  <h4 className="font-black text-slate-900 uppercase text-xs sm:text-sm mb-2 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-slate-900 text-amber-400 flex items-center justify-center text-[10px] font-black shrink-0">3</span>
                    {pt.regSec3Title}
                  </h4>
                  <p className="mb-2">
                    {pt.regSec3P1}
                  </p>
                  <p className="mb-1 font-semibold text-slate-900">{pt.regSec3P2}</p>
                  <ul className="list-disc list-inside space-y-1 font-medium text-slate-800 pl-2 mb-2">
                    <li><strong>{pt.regSec3Format1}</strong></li>
                    <li><strong>{pt.regSec3Format2}</strong></li>
                    <li><strong>{pt.regSec3Format3}</strong></li>
                  </ul>
                  <p className="mb-2">
                    {pt.regSec3P3}
                  </p>
                  <p>
                    {pt.regSec3P4}
                  </p>
                </div>

                {/* 4. AVALIAÇÃO E EDIÇÃO DO LOGÓTIPO */}
                <div className="pt-4">
                  <h4 className="font-black text-slate-900 uppercase text-xs sm:text-sm mb-2 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-slate-900 text-amber-400 flex items-center justify-center text-[10px] font-black shrink-0">4</span>
                    {pt.regSec4Title}
                  </h4>
                  <p className="mb-2">
                    {pt.regSec4P1}
                  </p>
                  <p className="mb-2">
                    {pt.regSec4P2}
                  </p>
                  <p className="mb-2">
                    {pt.regSec4P3}
                  </p>
                  <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl mb-2">
                    <p className="font-semibold text-slate-900">
                      {pt.regSec4PaidServiceBox}
                    </p>
                  </div>
                  <p className="mb-2">
                    {pt.regSec4P4}
                  </p>
                  <p className="mb-2">
                    {pt.regSec4P5}
                  </p>
                  <p className="mb-2">
                    {pt.regSec4P6}
                  </p>
                  <p className="text-slate-600 text-[11px]">
                    {pt.regSec4P7}
                  </p>
                </div>

                {/* 5. T-SHIRTS PERSONALIZADAS */}
                <div className="pt-4">
                  <h4 className="font-black text-slate-900 uppercase text-xs sm:text-sm mb-2 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-slate-900 text-amber-400 flex items-center justify-center text-[10px] font-black shrink-0">5</span>
                    {pt.regSec5Title}
                  </h4>
                  <p className="mb-3">
                    {pt.regSec5P1}
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                      <span className="font-bold text-slate-900 text-xs block uppercase mb-1">{pt.regSec5ColorsTitle}</span>
                      <p className="text-slate-700 font-medium">{pt.regSec5Colors}</p>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                      <span className="font-bold text-slate-900 text-xs block uppercase mb-1">{pt.regSec5SizesTitle}</span>
                      <p className="text-slate-700 font-medium">{pt.regSec5Sizes}</p>
                    </div>
                  </div>
                  <p className="mb-2">
                    {pt.regSec5P2}
                  </p>
                  <p className="mb-2">
                    {pt.regSec5P3}
                  </p>
                  <p className="font-semibold text-slate-900 mb-1">{pt.regSec5DimTitle}</p>
                  <ul className="list-disc list-inside space-y-1 font-medium text-slate-800 pl-2 mb-2">
                    <li>{pt.regSec5DimFront}</li>
                    <li>{pt.regSec5DimBack}</li>
                    <li>{pt.regSec5DimSleeves}</li>
                  </ul>
                  <p className="text-slate-600 text-[11px]">
                    {pt.regSec5Note}
                  </p>
                </div>

                {/* 6. COLETES PERSONALIZADOS */}
                <div className="pt-4">
                  <h4 className="font-black text-slate-900 uppercase text-xs sm:text-sm mb-2 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-slate-900 text-amber-400 flex items-center justify-center text-[10px] font-black shrink-0">6</span>
                    {pt.regSec6Title}
                  </h4>
                  <p className="mb-3">
                    {pt.regSec6P1}
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                      <span className="font-bold text-slate-900 text-xs block uppercase mb-1">{pt.regSec6ColorsTitle}</span>
                      <p className="text-slate-700 font-medium">{pt.regSec6Colors}</p>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                      <span className="font-bold text-slate-900 text-xs block uppercase mb-1">{pt.regSec6SizesTitle}</span>
                      <p className="text-slate-700 font-medium">{pt.regSec6Sizes}</p>
                    </div>
                  </div>
                  <p className="mb-2">
                    {pt.regSec6P2}
                  </p>
                  <p className="mb-2">
                    {pt.regSec6P3}
                  </p>
                  <p className="text-slate-600 text-[11px]">
                    {pt.regSec6Note}
                  </p>
                </div>

                {/* 7. LIMITAÇÃO AO STOCK */}
                <div className="pt-4">
                  <h4 className="font-black text-slate-900 uppercase text-xs sm:text-sm mb-2 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-slate-900 text-amber-400 flex items-center justify-center text-[10px] font-black shrink-0">7</span>
                    {pt.regSec7Title}
                  </h4>
                  <p className="mb-2">
                    {pt.regSec7P1}
                  </p>
                  <p className="mb-2">
                    {pt.regSec7P2}
                  </p>
                  <p className="mb-2">
                    {pt.regSec7P3}
                  </p>
                  <p className="mb-2">
                    {pt.regSec7P4}
                  </p>
                  <p className="font-semibold text-slate-900">
                    {pt.regSec7P5}
                  </p>
                </div>

                {/* 8. APROVAÇÃO DA PERSONALIZAÇÃO */}
                <div className="pt-4">
                  <h4 className="font-black text-slate-900 uppercase text-xs sm:text-sm mb-2 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-slate-900 text-amber-400 flex items-center justify-center text-[10px] font-black shrink-0">8</span>
                    {pt.regSec8Title}
                  </h4>
                  <p className="mb-2">
                    {pt.regSec8P1}
                  </p>
                  <p className="mb-2">
                    {pt.regSec8P2}
                  </p>
                  <p className="mb-2">
                    {pt.regSec8P3}
                  </p>
                  <p className="text-slate-600 text-[11px]">
                    {pt.regSec8P4}
                  </p>
                </div>

                {/* 9. PRAZO DE PRODUÇÃO E POSTAGEM */}
                <div className="pt-4">
                  <h4 className="font-black text-slate-900 uppercase text-xs sm:text-sm mb-2 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-slate-900 text-amber-400 flex items-center justify-center text-[10px] font-black shrink-0">9</span>
                    {pt.regSec9Title}
                  </h4>
                  <p className="mb-2 font-semibold text-slate-900">
                    {pt.regSec9P1}
                  </p>
                  <p className="mb-2 text-slate-700">
                    {pt.regSec9P2}
                  </p>
                  <p className="mb-1 text-xs font-bold text-slate-800">
                    {pt.regSec9P3}
                  </p>
                  <ol className="list-decimal list-inside space-y-1 font-medium text-slate-800 pl-2 mb-3">
                    <li>{pt.regSec9Item1}</li>
                    <li>{pt.regSec9Item2}</li>
                    <li>{pt.regSec9Item3}</li>
                    <li>{pt.regSec9Item4}</li>
                    <li>{pt.regSec9Item5}</li>
                    <li>{pt.regSec9Item6}</li>
                    <li>{pt.regSec9Item7}</li>
                  </ol>
                  <p className="text-slate-600 text-[11px]">
                    {pt.regSec9P4}
                  </p>
                </div>

                {/* 10. CUSTOS E CONDIÇÕES DE ENVIO */}
                <div className="pt-4">
                  <h4 className="font-black text-slate-900 uppercase text-xs sm:text-sm mb-2 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-slate-900 text-amber-400 flex items-center justify-center text-[10px] font-black shrink-0">10</span>
                    {pt.regSec10Title}
                  </h4>
                  <p className="mb-3 font-semibold text-slate-900">
                    {pt.regSec10P1}
                  </p>

                  <div className="space-y-3 mb-3">
                    <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                      <h5 className="font-bold text-slate-900 text-xs uppercase mb-1">{pt.regSec10PtTitle}</h5>
                      <p className="text-slate-700">
                        {pt.regSec10PtText}
                      </p>
                    </div>

                    <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                      <h5 className="font-bold text-slate-900 text-xs uppercase mb-1">{pt.regSec10IslandsTitle}</h5>
                      <p className="text-slate-700 mb-1">
                        {pt.regSec10IslandsP1}
                      </p>
                      <ul className="list-disc list-inside text-xs pl-2 space-y-0.5 text-slate-800">
                        <li>{pt.regSec10IslandsItem1}</li>
                        <li>{pt.regSec10IslandsItem2}</li>
                        <li>{pt.regSec10IslandsItem3}</li>
                      </ul>
                      <p className="text-slate-600 text-[11px] mt-1 italic">
                        {pt.regSec10IslandsP2}
                      </p>
                    </div>

                    <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                      <h5 className="font-bold text-slate-900 text-xs uppercase mb-1">{pt.regSec10EuTitle}</h5>
                      <p className="text-slate-700 mb-1">
                        {pt.regSec10EuP1}
                      </p>
                      <ul className="list-disc list-inside text-xs pl-2 space-y-0.5 text-slate-800">
                        <li>{pt.regSec10EuItem1}</li>
                        <li>{pt.regSec10EuItem2}</li>
                        <li>{pt.regSec10EuItem3}</li>
                      </ul>
                      <p className="text-slate-600 text-[11px] mt-1">
                        {pt.regSec10EuP2}
                      </p>
                    </div>
                  </div>

                  <p className="text-slate-600 text-[11px] italic">
                    {pt.regSec10Note}
                  </p>
                </div>

                {/* 11. CARÁTER PESSOAL DA OFERTA */}
                <div className="pt-4">
                  <h4 className="font-black text-slate-900 uppercase text-xs sm:text-sm mb-2 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-slate-900 text-amber-400 flex items-center justify-center text-[10px] font-black shrink-0">11</span>
                    {pt.regSec11Title}
                  </h4>
                  <p className="mb-2">
                    {pt.regSec11P1}
                  </p>
                  <p>
                    {pt.regSec11P2}
                  </p>
                </div>

                {/* 12. CANCELAMENTO OU INATIVAÇÃO DA SUBSCRIÇÃO */}
                <div className="pt-4">
                  <h4 className="font-black text-slate-900 uppercase text-xs sm:text-sm mb-2 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-slate-900 text-amber-400 flex items-center justify-center text-[10px] font-black shrink-0">12</span>
                    {pt.regSec12Title}
                  </h4>
                  <p className="mb-2">
                    {pt.regSec12P1}
                  </p>
                  <p className="mb-2">
                    {pt.regSec12P2}
                  </p>
                  <p>
                    {pt.regSec12P3}
                  </p>
                </div>

                {/* 13. RESPONSABILIDADE PELOS DADOS FORNECIDOS */}
                <div className="pt-4">
                  <h4 className="font-black text-slate-900 uppercase text-xs sm:text-sm mb-2 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-slate-900 text-amber-400 flex items-center justify-center text-[10px] font-black shrink-0">13</span>
                    {pt.regSec13Title}
                  </h4>
                  <p className="mb-2">
                    {pt.regSec13P1}
                  </p>
                  <p>
                    {pt.regSec13P2}
                  </p>
                </div>

                {/* 14. ALTERAÇÃO OU ENCERRAMENTO DA PROMOÇÃO */}
                <div className="pt-4">
                  <h4 className="font-black text-slate-900 uppercase text-xs sm:text-sm mb-2 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-slate-900 text-amber-400 flex items-center justify-center text-[10px] font-black shrink-0">14</span>
                    {pt.regSec14Title}
                  </h4>
                  <p className="mb-2">
                    {pt.regSec14P1}
                  </p>
                  <p>
                    {pt.regSec14P2}
                  </p>
                </div>

                {/* 15. ACEITAÇÃO DO REGULAMENTO */}
                <div className="pt-4 pb-2">
                  <h4 className="font-black text-slate-900 uppercase text-xs sm:text-sm mb-2 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-slate-900 text-amber-400 flex items-center justify-center text-[10px] font-black shrink-0">15</span>
                    {pt.regSec15Title}
                  </h4>
                  <p className="mb-2">
                    {pt.regSec15P1}
                  </p>
                  <p className="mb-4">
                    {pt.regSec15P2}
                  </p>
                  
                  <div className="bg-slate-900 text-white p-4 rounded-2xl border border-slate-800 text-center space-y-1 mt-4">
                    <p className="font-black text-amber-400 text-sm uppercase tracking-wider">AtriosBuild</p>
                    <p className="text-xs text-slate-300 italic">{pt.regTagline}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setShowRegulationModal(false)}
                className="px-6 py-2.5 bg-slate-900 text-white rounded-xl font-black text-xs uppercase tracking-wider hover:bg-slate-800 transition-all shadow-md active:scale-95 cursor-pointer"
              >
                {pt.understood}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Plans;