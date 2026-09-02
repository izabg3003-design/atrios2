
export enum PdfTemplate {
  DEFAULT = 'default',
  BLUE_MODERN = 'blue_modern',
  GREEN_PROFESSIONAL = 'green_professional',
  LIGHT_BLUE_CLEAN = 'light_blue_clean',
  DARK_ELEGANT = 'dark_elegant',
  MODERN_V2 = 'modern_v2'
}

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

export interface SupplyItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  estimatedPrice?: number;
  purchased: boolean;
  notes?: string;
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
  supplies?: SupplyItem[];
  totalAmount: number;
  projectFiles?: { name: string; url: string; id: string }[];
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
  website?: string;
  plan: PlanType;
  verified: boolean;
  createdAt: string;
  firstLoginAt?: string;
  first_login_at?: string;
  subscriptionExpiresAt?: string;
  subscription_expires_at?: string;
  canEditSensitiveData?: boolean;
  unlockRequested?: boolean;
  lastLocale?: string;
  pdfTemplate?: PdfTemplate;
  // Novos campos para gestão administrativa
  isBlocked?: boolean;
  isManual?: boolean;
  manualPaymentProof?: string;
  stripe_customer_id?: string;
  stripe_subscription_id?: string;
  lastSeenAt?: string;
  last_seen_at?: string;
  customServices?: { id: string; name: string }[];
  masterNotes?: string;
}

export type AudienceType = 'all' | 'free' | 'premium_monthly' | 'premium_annual' | 'all_premium' | 'monthly_purchase' | 'annual_purchase';

export interface GlobalNotification {
  id: string;
  imageUrl: string;
  targetAudience: AudienceType;
  active: boolean;
  createdAt: string;
}

export interface PushNotification {
  id: string;
  title: string;
  body: string;
  targetAudience: AudienceType;
  createdAt: string;
}

export interface CustomOrderItem {
  id: string;
  name: string;
  icon: string;
}

export interface CustomOrderRequest {
  id: string;
  companyId: string;
  itemId: string;
  itemName: string;
  quantity: number;
  description: string;
  imageUrl?: string;
  status: 'pending' | 'processing' | 'completed';
  createdAt: string;
}

export interface Product {
  id: string;
  name: string;
  code: string;
  category: string;
  description: string;
  image: string;
  additionalImages?: string[];
  price?: number;
  active: boolean;
  createdAt?: string;
}

export interface StoreOrder {
  id: string;
  companyId: string;
  productId: string;
  productName: string;
  quantity: number;
  notes: string;
  needsCustomization?: boolean;
  uploadedImage?: string;
  status: 'pending' | 'processing' | 'completed';
  createdAt?: string;
}

export interface AuthState {
  user: Company | null;
  isAuthenticated: boolean;
}

export type JobOfferStatus = 'pending' | 'approved' | 'rejected' | 'adjustment_requested';

export interface JobOffer {
  id: string;
  companyId: string;
  companyName: string;
  location: string;
  specialty: string;
  salary: string;
  startDate: string;
  duration: string;
  description: string;
  contact: string;
  status: JobOfferStatus;
  feedback?: string;
  candidatesJson?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface Candidate {
  id: string;
  jobOfferId: string;
  full_name: string;
  email: string;
  phone: string;
  cover_letter: string;
  has_residence_permit: boolean;
  document_type: string;
  has_drivers_license: boolean;
  has_construction_experience: boolean;
  experience_duration: string;
  photo_url: string;
  created_at: string;
}

export type HeroVideoType = 'default' | 'youtube' | 'upload';
export type ActionVideoType = HeroVideoType;

export interface HeroVideoConfig {
  type: HeroVideoType;
  youtubeUrl?: string;
  youtubeId?: string;
  videoUrl?: string;
  title?: string;
  autoPlay?: boolean;
  muted?: boolean;
  loop?: boolean;
  showControls?: boolean;
  updatedAt?: string;
}
export type ActionVideoConfig = HeroVideoConfig;

export type ClientRequestStatus = 'pending' | 'approved' | 'open' | 'in_progress' | 'completed' | 'cancelled';

export type ServiceCategory = 
  | 'painting'           // Pintura
  | 'electrical'         // Eletricidade & Fichas
  | 'doors_windows'      // Portas & Janelas
  | 'plumbing'           // Canalização
  | 'construction'       // Construção do Zero / Alvenaria
  | 'renovation'         // Remodelação Geral
  | 'plasterboard'       // Pladur & Teto Falso
  | 'roofing'            // Telhados & Isolamentos
  | 'flooring'           // Pisos & Revestimentos
  | 'carpentry'          // Carpintaria & Marcenaria
  | 'remodelacao'
  | 'pintura'
  | 'eletricidade'
  | 'canalizacao'
  | 'carpintaria'
  | 'construcao_raiz'
  | 'pladur'
  | 'telhados'
  | 'jardim'
  | 'outro'
  | 'other';             // Outro Serviço

export interface ClientServiceRequest {
  id: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  accessCode?: string;
  category: ServiceCategory | string;
  title?: string;
  projectTitle?: string;
  description?: string;
  projectDescription?: string;
  location?: string;
  city?: string;
  postalCode?: string;
  propertyType?: 'apartment' | 'house' | 'commercial' | 'land' | 'other' | string;
  urgency?: 'immediate' | 'few_weeks' | 'flexible' | string;
  budgetRange?: string;
  estimatedBudget?: string;
  photos?: string[];
  status: ClientRequestStatus | string;
  proposalsCount?: number;
  assignedCompanyId?: string;
  assignedCompanyName?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface IntroBannerItem {
  id: string;
  tag: string;
  tagColor?: string;
  title: string;
  subtitle?: string;
  description: string;
  imageUrl?: string;
  desktopImageUrl?: string;
  accentColor?: string;
  highlights: string[];
  mockupBadge?: string;
  mockupHeadline?: string;
  mockupDetails?: Array<{ label: string; value: string; color?: string }>;
  sortOrder: number;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Worker {
  id: string;
  companyId: string;
  name: string;
  nif: string;
  role: string;
  address: string;
  phone: string;
  email?: string;
  hourlyRate?: number;
  admissionDate?: string;
  active: boolean;
  createdAt: string;
}

export interface WorkTimeLog {
  id: string;
  companyId: string;
  workerId: string;
  date: string; // YYYY-MM-DD
  startTime: string; // ex: "08:00"
  coffeeBreak: string; // ex: "15 min" ou "10:00 - 10:15"
  lunchBreak: string; // ex: "1h00" ou "12:00 - 13:00"
  endTime: string; // ex: "17:00"
  totalHours: number; // calculated hours
  workLocation: string; // Local da obra / serviço
  details: string; // Detalhes do dia / tarefas executadas
  createdAt: string;
}


