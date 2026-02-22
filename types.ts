export enum PlanType {
  FREE = 'free',
  PREMIUM_MONTHLY = 'premium_monthly',
  PREMIUM_ANNUAL = 'premium_annual',
  // Keep for backward compatibility
  PREMIUM = 'premium'
}

export enum BudgetStatus {
  PENDING = 'pendente',
  APPROVED = 'aprovado',
  REJECTED = 'rejeitado',
  COMPLETED = 'concluído'
}

export type CurrencyCode = 'EUR' | 'BRL' | 'USD' | 'RUB' | 'INR' | 'BDT';

export interface CurrencyInfo {
  code: CurrencyCode;
  symbol: string;
  rate: number; // Rate relative to 1 EUR
  label: string;
}

export const CURRENCIES: Record<CurrencyCode, CurrencyInfo> = {
  EUR: { code: 'EUR', symbol: '€', rate: 1, label: 'Euro (€)' },
  BRL: { code: 'BRL', symbol: 'R$', rate: 6.12, label: 'Real (R$)' },
  USD: { code: 'USD', symbol: '$', rate: 1.08, label: 'Dollar ($)' },
  RUB: { code: 'RUB', symbol: '₽', rate: 99.45, label: 'Rublo (₽)' },
  INR: { code: 'INR', symbol: '₹', rate: 89.90, label: 'Rupia (₹)' },
  BDT: { code: 'BDT', symbol: '৳', rate: 128.50, label: 'Taka (৳)' }
};

export interface ServiceItem {
  id: string;
  description: string;
  quantity: number;
  unit: string;
  pricePerUnit: number;
  total: number;
}

export interface PaymentRecord {
  id: string;
  date: string;
  amount: number;
  proofUrl?: string;
  notes?: string;
}

export interface ExpenseRecord {
  id: string;
  description: string;
  quantity: number;
  unit: string;
  pricePerUnit: number;
  amount: number;
  date: string;
}

export interface Budget {
  id: string;
  companyId: string;
  clientName: string;
  contactName: string;
  contactPhone: string;
  workLocation: string;
  workNumber: string;
  workPostalCode: string;
  clientNif: string;
  servicesSelected: string[];
  items: ServiceItem[];
  expenses: ExpenseRecord[];
  totalAmount: number;
  status: BudgetStatus;
  createdAt: string;
  payments: PaymentRecord[];
  observations?: string;
  includeIva: boolean;
  ivaPercentage: number;
  validity?: string;
  paymentMethod?: string;
}

export interface SupportMessage {
  id: string;
  companyId: string;
  senderRole: 'user' | 'master';
  content: string;
  translatedContent?: string;
  timestamp: string;
  read: boolean;
}

export interface Transaction {
  id: string;
  companyId: string;
  companyName: string;
  planType: PlanType;
  amount: number; // Base price in EUR
  ivaAmount: number;
  totalAmount: number;
  couponUsed?: string;
  date: string;
}

export interface Coupon {
  id: string;
  code: string;
  discountPercentage: number;
  active: boolean;
  createdAt: string;
}

export interface Company {
  id: string;
  name: string;
  email: string;
  password?: string;
  logo?: string;
  qrCode?: string;
  address?: string;
  nif?: string;
  phone?: string;
  plan: PlanType;
  verified: boolean;
  createdAt: string;
  firstLoginAt?: string;
  subscriptionExpiresAt?: string;
  canEditSensitiveData?: boolean;
  unlockRequested?: boolean;
  lastLocale?: string;
  // Novos campos para gestão administrativa
  isBlocked?: boolean;
  isManual?: boolean;
  manualPaymentProof?: string;
  stripe_customer_id?: string;
  stripe_subscription_id?: string;
}

export type AudienceType = 'all' | 'free' | 'premium_monthly' | 'premium_annual' | 'all_premium';

export interface GlobalNotification {
  id: string;
  imageUrl: string;
  targetAudience: AudienceType;
  active: boolean;
  createdAt: string;
}

export interface AuthState {
  user: Company | null;
  isAuthenticated: boolean;
}