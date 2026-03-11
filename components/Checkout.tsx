import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { ShieldCheck, ArrowLeft, CreditCard, Lock } from 'lucide-react';
import { Locale, translations } from '../translations';
import { CurrencyCode, CURRENCIES, PlanType } from '../types';

// Load Stripe outside of component to avoid re-initializing
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY || '');

interface CheckoutFormProps {
  clientSecret: string;
  onCancel: () => void;
  onSuccess: () => void;
  locale: Locale;
  planName: string;
  price: string;
}

const CheckoutForm: React.FC<CheckoutFormProps> = ({ clientSecret, onCancel, onSuccess, locale, planName, price }) => {
  const stripe = useStripe();
  const elements = useElements();
  const t = translations[locale];
  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) return;

    setIsLoading(true);

    const isSetupIntent = clientSecret.startsWith('seti_');
    
    const { error } = isSetupIntent 
      ? await stripe.confirmSetup({
          elements,
          confirmParams: {
            return_url: window.location.origin,
          },
          redirect: 'if_required',
        })
      : await stripe.confirmPayment({
          elements,
          confirmParams: {
            return_url: window.location.origin,
          },
          redirect: 'if_required',
        });

    if (error) {
      if (error.type === "card_error" || error.type === "validation_error") {
        setMessage(error.message || "Ocorreu um erro no pagamento.");
      } else {
        setMessage("Ocorreu um erro inesperado.");
      }
      setIsLoading(false);
    } else {
      // Success!
      onSuccess();
    }
  };

  return (
    <form id="payment-form" onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs font-black text-slate-400 uppercase tracking-widest">{t.plan}</span>
          <span className="text-xs font-black text-slate-900 uppercase italic">{planName}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-xs font-black text-slate-400 uppercase tracking-widest">{t.total}</span>
          <span className="text-xl font-black text-slate-900">{price}</span>
        </div>
      </div>

      <PaymentElement id="payment-element" options={{ layout: 'tabs' }} />
      
      {message && (
        <div className="p-4 bg-red-50 text-red-600 rounded-2xl text-xs font-bold border border-red-100 animate-in fade-in slide-in-from-top-2">
          {message}
        </div>
      )}

      <div className="flex flex-col gap-3 pt-4">
        <button
          disabled={isLoading || !stripe || !elements}
          id="submit"
          className="w-full py-5 bg-amber-500 text-slate-900 rounded-[2rem] font-black text-lg shadow-xl hover:bg-amber-400 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <div className="w-6 h-6 border-4 border-slate-900/20 border-t-slate-900 rounded-full animate-spin" />
          ) : (
            <>
              <Lock size={20} />
              {t.confirmPayment || 'Confirmar Pagamento'}
            </>
          )}
        </button>
        
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          className="w-full py-4 text-slate-400 font-black text-xs uppercase tracking-widest hover:text-slate-600 transition-all flex items-center justify-center gap-2"
        >
          <ArrowLeft size={14} />
          {t.cancel || 'Cancelar'}
        </button>
      </div>

      <div className="flex items-center justify-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest pt-4">
        <ShieldCheck size={14} className="text-emerald-500" />
        {t.stripeSecurePayment}
      </div>
    </form>
  );
};

interface CheckoutProps {
  clientSecret: string;
  onCancel: () => void;
  onSuccess: () => void;
  locale: Locale;
  planType: PlanType;
  price: number;
  currencyCode: CurrencyCode;
}

const Checkout: React.FC<CheckoutProps> = ({ clientSecret, onCancel, onSuccess, locale, planType, price, currencyCode }) => {
  const t = translations[locale];
  const currencyInfo = CURRENCIES[currencyCode];
  
  const planName = planType === PlanType.PREMIUM_MONTHLY ? t.planMonthly : t.planAnnual;
  const formattedPrice = (price * currencyInfo.rate).toLocaleString(locale, {
    style: 'currency',
    currency: currencyCode,
  });

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-slate-900/90 backdrop-blur-xl p-4 animate-in fade-in duration-500">
      <div className="bg-white p-8 lg:p-12 rounded-[3rem] lg:rounded-[4rem] shadow-2xl max-w-xl w-full space-y-8 transform animate-in zoom-in-95 duration-500 border border-slate-100 overflow-y-auto max-h-[90vh] custom-scrollbar">
        <div className="text-center space-y-4">
          <div className="w-20 h-20 bg-amber-50 text-amber-500 rounded-[1.5rem] flex items-center justify-center mx-auto shadow-inner">
            <CreditCard size={40} />
          </div>
          <div className="space-y-2">
            <h3 className="text-3xl font-black text-slate-900 tracking-tighter italic uppercase">
              {t.checkoutTitle || 'Checkout Seguro'}
            </h3>
            <p className="text-slate-500 text-sm font-bold">
              {t.checkoutSubtitle || 'Finalize a sua subscrição para desbloquear todos os recursos.'}
            </p>
          </div>
        </div>

        <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: 'stripe' } }}>
          <CheckoutForm 
            clientSecret={clientSecret} 
            onCancel={onCancel} 
            onSuccess={onSuccess} 
            locale={locale}
            planName={planName}
            price={formattedPrice}
          />
        </Elements>
      </div>
    </div>
  );
};

export default Checkout;
