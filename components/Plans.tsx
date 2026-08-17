import React, { useState } from 'react';
import { Check, Star, Ticket, Sparkles, Shirt, Globe, Gift, FileText, X, ShieldAlert } from 'lucide-react';
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
      name: t.planFree || 'Grátis',
      basePrice: basePrices.free,
      period: "",
      features: [
        t.featItemsLimit || "3 Itens por Orçamento",
        t.featExpenseLimit || "3 Registos de Despesas",
        t.featPdfLimit || "3 Downloads de PDF",
        t.featServiceLimit || "3 Serviços Incluídos",
        { text: t.featUnlimitedItems || "Orçamentos e Itens Ilimitados", notIncluded: true },
        { text: t.featProfitReports || "Relatórios de Lucro e Gráficos", notIncluded: true },
        { text: t.featUnlimitedPdf || "Exportação de PDFs Ilimitada", notIncluded: true },
        { text: t.featCloudBackup || "Sincronização na Nuvem em Tempo Real", notIncluded: true },
        { text: t.featHdLogo || "Logótipo HD Personalizado no PDF", notIncluded: true },
        { text: "Oferta de Brindes e Vestuário Pro", notIncluded: true, boxed: true }
      ],
      color: "bg-slate-100 border border-slate-200",
      textColor: "text-slate-900",
      buttonColor: "bg-slate-300 text-slate-900 hover:bg-slate-400 font-black"
    },
    {
      id: PlanType.PREMIUM_MONTHLY,
      name: t.planMonthly || 'Mensal',
      basePrice: basePrices.monthly,
      period: t.planPeriodMonth || '/mês',
      features: [
        t.featUnlimitedItems || "Orçamentos e Itens Ilimitados",
        t.featExpenseLimit ? "Despesas Ilimitadas" : "Despesas Ilimitadas",
        t.featUnlimitedPdf || "Downloads de PDF Ilimitados",
        t.featCloudBackup || "Sincronização na Nuvem em Tempo Real",
        t.featProfitReports || "Relatórios Financeiros e de Lucro",
        t.featHdLogo || "Logótipo HD no Orçamento e PDF",
        t.featPrioritySupport || "Suporte Prioritário",
        { text: "Desconto Especial Anual (25% Poupança)", notIncluded: true },
        { text: "Oferta de Brindes (Exclusivo Anual)", notIncluded: true, boxed: true }
      ],
      color: "bg-slate-900 border border-slate-800",
      textColor: "text-white",
      buttonColor: "bg-amber-500 text-slate-900 hover:bg-amber-400 font-black"
    },
    {
      id: PlanType.PREMIUM_ANNUAL,
      name: t.planAnnual || 'Anual',
      basePrice: basePrices.annual,
      period: t.planPeriodYear || '/ano',
      savings: t.planPromoAnnual || 'De 118,80€ por 89,90€',
      bestValue: true,
      features: [
        t.featUnlimitedItems || "Orçamentos e Itens Ilimitados",
        "Despesas e Serviços Ilimitados",
        t.featUnlimitedPdf || "Downloads de PDF Ilimitados",
        t.featCloudBackup || "Sincronização na Nuvem em Tempo Real",
        t.featProfitReports || "Relatórios Financeiros e de Lucro",
        t.featHdLogo || "Logótipo HD no Orçamento e PDF",
        t.featPrioritySupport || "Suporte VIP Prioritário",
        t.planAnnualSavings || "Poupança de 25% face ao mensal",
        {
          text: "OFERTA EXCLUSIVA: 3 T-Shirts + 3 Coletes com o seu Logótipo",
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
        <h2 className="text-2xl sm:text-3xl lg:text-5xl font-black text-slate-900 tracking-tight">{t.plans || 'Planos'}</h2>
        <p className="text-slate-500 text-xs sm:text-base lg:text-xl max-w-2xl mx-auto font-medium px-2">
          {t.planDescriptionSub || 'Transforme a sua gestão com o ÁTRIOS premium.'}
        </p>
      </div>

      {/* Mobile Plan Segmented Filter Control */}
      <div className="flex md:hidden items-center justify-center gap-1 bg-slate-200/90 p-1 rounded-2xl max-w-[20rem] mx-auto text-[10px] font-black uppercase tracking-wider">
        <button 
          onClick={() => setSelectedPlanTab('all')} 
          className={`flex-1 py-2 rounded-xl transition-all text-center font-bold ${selectedPlanTab === 'all' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-600 hover:text-slate-900'}`}
        >
          {locale === 'pt-PT' || locale === 'pt-BR' ? 'Todos' : (t.filterAll || 'All')}
        </button>
        <button 
          onClick={() => setSelectedPlanTab(PlanType.PREMIUM_ANNUAL)} 
          className={`flex-1 py-2 rounded-xl transition-all flex items-center justify-center gap-1 font-bold ${selectedPlanTab === PlanType.PREMIUM_ANNUAL ? 'bg-amber-500 text-slate-900 shadow-md font-black' : 'text-slate-600 hover:text-slate-900'}`}
        >
          <Star size={11} className="fill-slate-900 text-slate-900" /> {t.planAnnual || 'Anual'}
        </button>
        <button 
          onClick={() => setSelectedPlanTab(PlanType.PREMIUM_MONTHLY)} 
          className={`flex-1 py-2 rounded-xl transition-all text-center font-bold ${selectedPlanTab === PlanType.PREMIUM_MONTHLY ? 'bg-slate-900 text-white shadow-md' : 'text-slate-600 hover:text-slate-900'}`}
        >
          {t.planMonthly || 'Mensal'}
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
                            <span className="animate-pulse">⚡</span> Oferta limitada para 250 assinaturas Premium
                          </span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowRegulationModal(true);
                            }}
                            className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-slate-900 bg-amber-400 hover:bg-amber-300 px-3 py-1.5 rounded-lg transition-all shadow-sm flex items-center justify-center gap-1.5 active:scale-95"
                          >
                            <FileText size={12} /> Consulte Regulamento
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
                                    <FileText size={10} /> Consulte Regulamento
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
                  isCurrentPlan(plan.id) ? (t.currentPlan || 'Plano Atual') : (t.selectPlan || 'Começar Agora')
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
                  <h3 className="font-black text-base sm:text-lg uppercase tracking-tight text-white">Regulamento da Promoção</h3>
                  <p className="text-[10px] text-amber-400 font-bold uppercase tracking-wider">Plano Anual Premium</p>
                </div>
              </div>
              <button 
                onClick={() => setShowRegulationModal(false)}
                className="p-2 text-slate-400 hover:text-white bg-white/10 hover:bg-white/20 rounded-xl transition-all"
                title="Fechar"
              >
                <X size={18} />
              </button>
            </div>

            {/* Content */}
            <div className="p-5 sm:p-7 overflow-y-auto max-h-[65vh] space-y-5 text-slate-700 text-xs sm:text-sm leading-relaxed scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100 pr-4 sm:pr-6">
              <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl flex items-start gap-3 text-amber-950 shadow-sm">
                <Sparkles size={20} className="text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-black text-xs uppercase tracking-wide text-amber-900 mb-0.5">OFERTA EXCLUSIVA PLANO PREMIUM — ATRIOSBUILD</h4>
                  <p className="text-[11px] sm:text-xs text-amber-800 font-medium">
                    A presente promoção é uma oferta exclusiva destinada aos clientes que subscreverem o <strong>Plano Premium do AtriosBuild</strong>.
                  </p>
                </div>
              </div>

              <div className="space-y-5 divide-y divide-slate-100">
                {/* 1. OBJETO DA PROMOÇÃO */}
                <div className="pt-2">
                  <h4 className="font-black text-slate-900 uppercase text-xs sm:text-sm mb-2 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-slate-900 text-amber-400 flex items-center justify-center text-[10px] font-black shrink-0">1</span>
                    OBJETO DA PROMOÇÃO
                  </h4>
                  <p className="mb-2">
                    A presente promoção é uma oferta exclusiva destinada aos clientes que subscreverem o <strong>Plano Premium do AtriosBuild</strong>.
                  </p>
                  <p className="mb-2">Como benefício promocional, o cliente elegível receberá:</p>
                  <ul className="list-disc list-inside space-y-1 font-bold text-slate-900 pl-2 mb-2">
                    <li>3 T-shirts personalizadas com o logótipo da sua empresa;</li>
                    <li>3 coletes personalizados com o logótipo da sua empresa.</li>
                  </ul>
                  <p className="text-slate-600 text-[11px] italic">
                    A oferta está limitada ao stock disponível, incluindo cores e tamanhos, e poderá ser encerrada quando o stock promocional se esgotar.
                  </p>
                </div>

                {/* 2. QUEM PODE PARTICIPAR */}
                <div className="pt-4">
                  <h4 className="font-black text-slate-900 uppercase text-xs sm:text-sm mb-2 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-slate-900 text-amber-400 flex items-center justify-center text-[10px] font-black shrink-0">2</span>
                    QUEM PODE PARTICIPAR
                  </h4>
                  <p className="mb-2">
                    A promoção é exclusiva para clientes que tenham uma <strong>subscrição ativa do Plano Premium do AtriosBuild</strong>, de acordo com as condições comerciais apresentadas no momento da adesão.
                  </p>
                  <p className="mb-2">
                    A oferta não é válida para os planos Gratuito, Básico ou outros planos que não sejam o Plano Premium.
                  </p>
                  <p>
                    A atribuição dos brindes está condicionada à confirmação da subscrição Premium e ao cumprimento de todas as condições previstas neste regulamento.
                  </p>
                </div>

                {/* 3. ENVIO DO LOGÓTIPO */}
                <div className="pt-4">
                  <h4 className="font-black text-slate-900 uppercase text-xs sm:text-sm mb-2 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-slate-900 text-amber-400 flex items-center justify-center text-[10px] font-black shrink-0">3</span>
                    ENVIO DO LOGÓTIPO
                  </h4>
                  <p className="mb-2">
                    Para a personalização dos brindes, o cliente deverá enviar o logótipo que pretende utilizar.
                  </p>
                  <p className="mb-1 font-semibold text-slate-900">São aceites, preferencialmente, os seguintes formatos:</p>
                  <ul className="list-disc list-inside space-y-1 font-medium text-slate-800 pl-2 mb-2">
                    <li><strong>PDF aberto/editável;</strong></li>
                    <li><strong>PNG</strong>, preferencialmente com boa resolução e fundo transparente;</li>
                    <li><strong>CDR — CorelDRAW</strong>, preferencialmente em formato editável.</li>
                  </ul>
                  <p className="mb-2">
                    O ficheiro enviado será submetido a uma <strong>avaliação técnica</strong> para verificar se apresenta condições adequadas para utilização na personalização das T-shirts e dos coletes.
                  </p>
                  <p>
                    A aceitação do ficheiro não depende apenas do formato. O logótipo deverá possuir qualidade, resolução, definição e características técnicas adequadas ao processo de personalização.
                  </p>
                </div>

                {/* 4. AVALIAÇÃO E EDIÇÃO DO LOGÓTIPO */}
                <div className="pt-4">
                  <h4 className="font-black text-slate-900 uppercase text-xs sm:text-sm mb-2 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-slate-900 text-amber-400 flex items-center justify-center text-[10px] font-black shrink-0">4</span>
                    AVALIAÇÃO E EDIÇÃO DO LOGÓTIPO
                  </h4>
                  <p className="mb-2">
                    Após o envio, o ficheiro será analisado pela equipa responsável pela personalização.
                  </p>
                  <p className="mb-2">
                    Caso o logótipo esteja em condições adequadas, será utilizado na produção dos brindes.
                  </p>
                  <p className="mb-2">
                    Caso o ficheiro apresente problemas que impeçam ou dificultem a sua utilização, o cliente será informado sobre o resultado da avaliação e sobre as alterações necessárias.
                  </p>
                  <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl mb-2">
                    <p className="font-semibold text-slate-900">
                      Caso o cliente pretenda que o AtriosBuild realize a preparação ou edição do logótipo para o tornar adequado à personalização, este serviço poderá ser realizado pelo valor de <strong>10,00 €</strong>.
                    </p>
                  </div>
                  <p className="mb-2">
                    A edição somente será realizada mediante autorização do cliente.
                  </p>
                  <p className="mb-2">
                    Após a conclusão e aprovação da edição, o ficheiro final do logótipo será enviado ao cliente através do <strong>e-mail ou WhatsApp</strong> informado pelo próprio cliente.
                  </p>
                  <p className="mb-2">
                    O ficheiro editado continuará a pertencer ao cliente, sendo disponibilizado para sua utilização.
                  </p>
                  <p className="text-slate-600 text-[11px]">
                    O pagamento do serviço de edição do logótipo <strong>não constitui requisito para participação na promoção</strong>, sendo aplicável apenas quando o cliente optar por contratar esse serviço.
                  </p>
                </div>

                {/* 5. T-SHIRTS PERSONALIZADAS */}
                <div className="pt-4">
                  <h4 className="font-black text-slate-900 uppercase text-xs sm:text-sm mb-2 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-slate-900 text-amber-400 flex items-center justify-center text-[10px] font-black shrink-0">5</span>
                    T-SHIRTS PERSONALIZADAS
                  </h4>
                  <p className="mb-3">
                    Cada cliente elegível receberá <strong>3 T-shirts personalizadas</strong>.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                      <span className="font-bold text-slate-900 text-xs block uppercase mb-1">Cores disponíveis:</span>
                      <p className="text-slate-700 font-medium">Branco, Azul, Preto, Vermelho, Cinza escuro, Cinza claro, Rosa, Verde, Amarelo.</p>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                      <span className="font-bold text-slate-900 text-xs block uppercase mb-1">Tamanhos disponíveis:</span>
                      <p className="text-slate-700 font-medium">XS, S, M, L, XL, XXL.</p>
                    </div>
                  </div>
                  <p className="mb-2">
                    A escolha de cores e tamanhos estará sujeita ao <strong>stock disponível no momento da confirmação da oferta</strong>.
                  </p>
                  <p className="mb-2">
                    A personalização das T-shirts será realizada com o logótipo fornecido e aprovado pelo cliente.
                  </p>
                  <p className="font-semibold text-slate-900 mb-1">Localização e dimensões máximas do logótipo:</p>
                  <ul className="list-disc list-inside space-y-1 font-medium text-slate-800 pl-2 mb-2">
                    <li><strong>Frente:</strong> máximo de 10 cm × 10 cm;</li>
                    <li><strong>Costas:</strong> máximo de 15 cm × 20 cm;</li>
                    <li><strong>Mangas:</strong> a personalização das mangas <u>não está incluída na promoção</u>.</li>
                  </ul>
                  <p className="text-slate-600 text-[11px]">
                    A posição final da personalização poderá ser ajustada tecnicamente de acordo com o modelo da peça e com as características do logótipo.
                  </p>
                </div>

                {/* 6. COLETES PERSONALIZADOS */}
                <div className="pt-4">
                  <h4 className="font-black text-slate-900 uppercase text-xs sm:text-sm mb-2 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-slate-900 text-amber-400 flex items-center justify-center text-[10px] font-black shrink-0">6</span>
                    COLETES PERSONALIZADOS
                  </h4>
                  <p className="mb-3">
                    Cada cliente elegível receberá <strong>3 coletes personalizados</strong>.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                      <span className="font-bold text-slate-900 text-xs block uppercase mb-1">Cores disponíveis:</span>
                      <p className="text-slate-700 font-medium">Verde, Laranja.</p>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                      <span className="font-bold text-slate-900 text-xs block uppercase mb-1">Tamanhos disponíveis:</span>
                      <p className="text-slate-700 font-medium">M, L, XL, XXL.</p>
                    </div>
                  </div>
                  <p className="mb-2">
                    A escolha da cor e do tamanho estará condicionada ao <strong>stock disponível no momento da confirmação da oferta</strong>.
                  </p>
                  <p className="mb-2">
                    A personalização será realizada com o logótipo fornecido e aprovado pelo cliente.
                  </p>
                  <p className="text-slate-600 text-[11px]">
                    As dimensões e a posição da personalização poderão ser ajustadas tecnicamente de acordo com o modelo do colete e com as características do logótipo.
                  </p>
                </div>

                {/* 7. LIMITAÇÃO AO STOCK */}
                <div className="pt-4">
                  <h4 className="font-black text-slate-900 uppercase text-xs sm:text-sm mb-2 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-slate-900 text-amber-400 flex items-center justify-center text-[10px] font-black shrink-0">7</span>
                    LIMITAÇÃO AO STOCK
                  </h4>
                  <p className="mb-2">
                    A promoção está <strong>limitada ao stock disponível</strong> de T-shirts e coletes, incluindo modelos, cores e tamanhos.
                  </p>
                  <p className="mb-2">
                    A existência da promoção não garante a disponibilidade de todas as combinações de cores e tamanhos.
                  </p>
                  <p className="mb-2">
                    Caso determinada cor ou tamanho escolhido pelo cliente esteja esgotado, o cliente poderá escolher outra opção disponível dentro das alternativas existentes em stock.
                  </p>
                  <p className="mb-2">
                    O AtriosBuild não será obrigado a disponibilizar uma cor ou tamanho que se encontre esgotado.
                  </p>
                  <p className="font-semibold text-slate-900">
                    A promoção poderá ser encerrada quando o stock destinado à campanha terminar.
                  </p>
                </div>

                {/* 8. APROVAÇÃO DA PERSONALIZAÇÃO */}
                <div className="pt-4">
                  <h4 className="font-black text-slate-900 uppercase text-xs sm:text-sm mb-2 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-slate-900 text-amber-400 flex items-center justify-center text-[10px] font-black shrink-0">8</span>
                    APROVAÇÃO DA PERSONALIZAÇÃO
                  </h4>
                  <p className="mb-2">
                    Antes da produção, o cliente poderá ser solicitado a confirmar a arte final que será utilizada na personalização.
                  </p>
                  <p className="mb-2">
                    Após a aprovação da arte final pelo cliente, serão produzidos os brindes de acordo com a versão aprovada.
                  </p>
                  <p className="mb-2">
                    O cliente é responsável por garantir que possui os direitos de utilização do logótipo, símbolos, imagens, textos ou demais elementos enviados para personalização.
                  </p>
                  <p className="text-slate-600 text-[11px]">
                    O AtriosBuild não se responsabiliza por eventuais violações de direitos de terceiros decorrentes da utilização de materiais fornecidos pelo cliente.
                  </p>
                </div>

                {/* 9. PRAZO DE PRODUÇÃO E POSTAGEM */}
                <div className="pt-4">
                  <h4 className="font-black text-slate-900 uppercase text-xs sm:text-sm mb-2 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-slate-900 text-amber-400 flex items-center justify-center text-[10px] font-black shrink-0">9</span>
                    PRAZO DE PRODUÇÃO E POSTAGEM
                  </h4>
                  <p className="mb-2 font-semibold text-slate-900">
                    Após a conclusão de todas as etapas necessárias para a produção, os brindes personalizados serão <strong>produzidos e estarão prontos para postagem no prazo máximo de 30 (trinta) dias corridos</strong>.
                  </p>
                  <p className="mb-2 text-slate-700">
                    O prazo de 30 dias corridos refere-se <strong>exclusivamente ao prazo para preparação, produção e postagem/expedição dos brindes pelo AtriosBuild</strong>, não correspondendo ao prazo de transporte ou entrega pela transportadora.
                  </p>
                  <p className="mb-1 text-xs font-bold text-slate-800">
                    O prazo de 30 dias corridos começa a contar somente após estarem reunidas todas as seguintes condições:
                  </p>
                  <ol className="list-decimal list-inside space-y-1 font-medium text-slate-800 pl-2 mb-3">
                    <li>confirmação da subscrição Premium;</li>
                    <li>recebimento do logótipo pelo AtriosBuild;</li>
                    <li>aprovação técnica do ficheiro;</li>
                    <li>definição das cores e tamanhos dos brindes, de acordo com o stock disponível;</li>
                    <li>aprovação da arte final pelo cliente, quando aplicável;</li>
                    <li>confirmação dos dados necessários para o envio;</li>
                    <li>confirmação do pagamento do respetivo custo de envio.</li>
                  </ol>
                  <p className="text-slate-600 text-[11px]">
                    Eventuais atrasos decorrentes de informações incorretas ou incompletas fornecidas pelo cliente, demora no envio ou aprovação do logótipo/arte, alteração dos dados de envio, indisponibilidade temporária de determinados materiais ou situações de força maior poderão suspender ou alterar o prazo de produção e postagem.
                  </p>
                </div>

                {/* 10. CUSTOS E CONDIÇÕES DE ENVIO */}
                <div className="pt-4">
                  <h4 className="font-black text-slate-900 uppercase text-xs sm:text-sm mb-2 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-slate-900 text-amber-400 flex items-center justify-center text-[10px] font-black shrink-0">10</span>
                    CUSTOS E CONDIÇÕES DE ENVIO
                  </h4>
                  <p className="mb-3 font-semibold text-slate-900">
                    Os brindes da promoção são gratuitos, porém <strong>os custos de envio não estão incluídos na oferta</strong> e serão suportados pelo cliente.
                  </p>

                  <div className="space-y-3 mb-3">
                    <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                      <h5 className="font-bold text-slate-900 text-xs uppercase mb-1">Portugal Continental</h5>
                      <p className="text-slate-700">
                        Para entregas em <strong>Portugal Continental</strong>, será aplicado um custo de envio de: <strong className="text-amber-700 bg-amber-100 px-2 py-0.5 rounded">8,00 €</strong>
                      </p>
                    </div>

                    <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                      <h5 className="font-bold text-slate-900 text-xs uppercase mb-1">Regiões Autónomas dos Açores e da Madeira</h5>
                      <p className="text-slate-700 mb-1">
                        Para envios destinados às <strong>Ilhas dos Açores ou da Madeira</strong>, o cliente deverá consultar previamente o AtriosBuild para obter:
                      </p>
                      <ul className="list-disc list-inside text-xs pl-2 space-y-0.5 text-slate-800">
                        <li>valor do transporte;</li>
                        <li>prazo estimado de entrega;</li>
                        <li>condições aplicáveis ao envio.</li>
                      </ul>
                      <p className="text-slate-600 text-[11px] mt-1 italic">
                        O envio somente será realizado após a confirmação do respetivo valor pelo cliente.
                      </p>
                    </div>

                    <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                      <h5 className="font-bold text-slate-900 text-xs uppercase mb-1">Outros países da União Europeia</h5>
                      <p className="text-slate-700 mb-1">
                        Para envios destinados a outros países da <strong>União Europeia</strong>, o cliente deverá consultar previamente o AtriosBuild para obter:
                      </p>
                      <ul className="list-disc list-inside text-xs pl-2 space-y-0.5 text-slate-800">
                        <li>valor do transporte;</li>
                        <li>prazo estimado de entrega;</li>
                        <li>condições aplicáveis ao envio.</li>
                      </ul>
                      <p className="text-slate-600 text-[11px] mt-1">
                        O valor do transporte poderá variar de acordo com o país, código postal, peso, volume e condições da transportadora.
                      </p>
                    </div>
                  </div>

                  <p className="text-slate-600 text-[11px] italic">
                    O prazo de <strong>30 dias corridos indicado neste regulamento refere-se à postagem/expedição pelo AtriosBuild</strong>, não incluindo o tempo de transporte e entrega no destino.
                  </p>
                </div>

                {/* 11. CARÁTER PESSOAL DA OFERTA */}
                <div className="pt-4">
                  <h4 className="font-black text-slate-900 uppercase text-xs sm:text-sm mb-2 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-slate-900 text-amber-400 flex items-center justify-center text-[10px] font-black shrink-0">11</span>
                    CARÁTER PESSOAL DA OFERTA
                  </h4>
                  <p className="mb-2">
                    Os brindes são destinados ao titular da subscrição Premium e não poderão ser convertidos em dinheiro.
                  </p>
                  <p>
                    A oferta não poderá ser trocada por outro produto ou pelo seu equivalente monetário.
                  </p>
                </div>

                {/* 12. CANCELAMENTO OU INATIVAÇÃO DA SUBSCRIÇÃO */}
                <div className="pt-4">
                  <h4 className="font-black text-slate-900 uppercase text-xs sm:text-sm mb-2 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-slate-900 text-amber-400 flex items-center justify-center text-[10px] font-black shrink-0">12</span>
                    CANCELAMENTO OU INATIVAÇÃO DA SUBSCRIÇÃO
                  </h4>
                  <p className="mb-2">
                    A atribuição da oferta está vinculada à subscrição do Plano Premium.
                  </p>
                  <p className="mb-2">
                    Caso a subscrição seja cancelada antes da conclusão do processo de produção ou postagem dos brindes, o direito à oferta poderá ser cancelado, salvo quando a produção já tiver sido iniciada e as condições específicas da campanha determinarem o contrário.
                  </p>
                  <p>
                    A oferta não constitui saldo, crédito ou valor monetário na conta do cliente.
                  </p>
                </div>

                {/* 13. RESPONSABILIDADE PELOS DADOS FORNECIDOS */}
                <div className="pt-4">
                  <h4 className="font-black text-slate-900 uppercase text-xs sm:text-sm mb-2 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-slate-900 text-amber-400 flex items-center justify-center text-[10px] font-black shrink-0">13</span>
                    RESPONSABILIDADE PELOS DADOS FORNECIDOS
                  </h4>
                  <p className="mb-2">
                    O cliente é responsável pela correta indicação dos seus dados de contacto e de entrega.
                  </p>
                  <p>
                    O AtriosBuild não se responsabiliza por atrasos, devoluções ou impossibilidade de entrega decorrentes de informações incorretas, incompletas ou desatualizadas fornecidas pelo cliente.
                  </p>
                </div>

                {/* 14. ALTERAÇÃO OU ENCERRAMENTO DA PROMOÇÃO */}
                <div className="pt-4">
                  <h4 className="font-black text-slate-900 uppercase text-xs sm:text-sm mb-2 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-slate-900 text-amber-400 flex items-center justify-center text-[10px] font-black shrink-0">14</span>
                    ALTERAÇÃO OU ENCERRAMENTO DA PROMOÇÃO
                  </h4>
                  <p className="mb-2">
                    O AtriosBuild reserva-se o direito de alterar, suspender ou encerrar a promoção, nomeadamente em caso de esgotamento do stock ou por motivos de força maior.
                  </p>
                  <p>
                    Qualquer alteração relevante será comunicada através dos canais oficiais do AtriosBuild.
                  </p>
                </div>

                {/* 15. ACEITAÇÃO DO REGULAMENTO */}
                <div className="pt-4 pb-2">
                  <h4 className="font-black text-slate-900 uppercase text-xs sm:text-sm mb-2 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-slate-900 text-amber-400 flex items-center justify-center text-[10px] font-black shrink-0">15</span>
                    ACEITAÇÃO DO REGULAMENTO
                  </h4>
                  <p className="mb-2">
                    A subscrição do Plano Premium e a participação na promoção pressupõem a leitura e aceitação integral deste regulamento.
                  </p>
                  <p className="mb-4">
                    Ao participar na promoção, o cliente declara ter compreendido e aceite todas as condições aqui estabelecidas.
                  </p>
                  
                  <div className="bg-slate-900 text-white p-4 rounded-2xl border border-slate-800 text-center space-y-1 mt-4">
                    <p className="font-black text-amber-400 text-sm uppercase tracking-wider">AtriosBuild</p>
                    <p className="text-xs text-slate-300 italic">Construímos ferramentas para quem constrói.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setShowRegulationModal(false)}
                className="px-6 py-2.5 bg-slate-900 text-white rounded-xl font-black text-xs uppercase tracking-wider hover:bg-slate-800 transition-all shadow-md active:scale-95"
              >
                {t.understood}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Plans;