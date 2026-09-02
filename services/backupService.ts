import { 
  Company, 
  Budget, 
  Worker, 
  WorkTimeLog, 
  StoreOrder, 
  CustomOrderRequest, 
  SupportMessage, 
  Transaction,
  Product,
  Coupon,
  JobOffer,
  Candidate,
  ClientServiceRequest,
  IntroBannerItem,
  HeroVideoConfig,
  ActionVideoConfig,
  GlobalNotification,
  PlanType 
} from '../types';
import { 
  getStoredCompanies, 
  saveCompany, 
  getAllStoredBudgets,
  getStoredBudgets, 
  saveBudget, 
  getWorkers, 
  saveWorker, 
  getWorkTimeLogs, 
  saveWorkTimeLog, 
  getStoredStoreOrders, 
  saveStoreOrder, 
  getStoredProducts,
  saveProduct,
  getCoupons,
  saveCoupon,
  getStoredCustomOrders, 
  saveCustomOrderRequest, 
  getMessages, 
  saveMessage, 
  getTransactions, 
  saveTransaction,
  getStoredJobOffers,
  saveJobOffer,
  getStoredCandidates,
  saveCandidate,
  getStoredClientRequests,
  saveClientServiceRequest,
  getStoredIntroBanners,
  saveIntroBanner,
  getStoredHeroVideoConfig,
  saveHeroVideoConfig,
  getStoredActionVideoConfig,
  saveActionVideoConfig,
  getGlobalNotifications,
  saveGlobalNotifications,
  safeSetItem,
  safeGetItem
} from './storage';
import { syncToCloud, supabase } from './supabase';

export interface GlobalDatabaseBackupPayload {
  version: string;
  app: string;
  type: 'GLOBAL_MASTER_BACKUP' | 'COMPANY_BACKUP';
  timestamp: string;
  exportedAtFormatted: string;
  companies: Company[];
  budgets: Budget[];
  workers: Worker[];
  workTimeLogs: WorkTimeLog[];
  storeOrders: StoreOrder[];
  products: Product[];
  coupons: Coupon[];
  customOrders: CustomOrderRequest[];
  messages: SupportMessage[];
  transactions: Transaction[];
  jobOffers: JobOffer[];
  candidates: Candidate[];
  clientRequests: ClientServiceRequest[];
  introBanners: IntroBannerItem[];
  heroVideoConfig?: HeroVideoConfig;
  actionVideoConfig?: ActionVideoConfig;
  globalNotifications: GlobalNotification[];
  metadata: {
    totalCompanies: number;
    totalBudgets: number;
    totalWorkers: number;
    totalWorkTimeLogs: number;
    totalStoreOrders: number;
    totalProducts: number;
    totalCoupons: number;
    totalCustomOrders: number;
    totalMessages: number;
    totalJobOffers: number;
    totalCandidates: number;
    totalClientRequests: number;
    totalBanners: number;
    totalNotifications: number;
    totalCalculatedRevenue: number;
  };
}

export interface GlobalBackupValidationResult {
  isValid: boolean;
  error?: string;
  payload?: GlobalDatabaseBackupPayload;
  summary?: {
    exportedAt: string;
    totalCompanies: number;
    totalBudgets: number;
    totalWorkers: number;
    totalWorkTimeLogs: number;
    totalStoreOrders: number;
    totalProducts: number;
    totalJobOffers: number;
    totalCandidates: number;
    totalClientRequests: number;
  };
}

export interface GlobalRestoreResult {
  success: boolean;
  error?: string;
  stats: {
    companiesRestored: number;
    budgetsRestored: number;
    workersRestored: number;
    workTimeLogsRestored: number;
    storeOrdersRestored: number;
    productsRestored: number;
    couponsRestored: number;
    customOrdersRestored: number;
    messagesRestored: number;
    jobOffersRestored: number;
    candidatesRestored: number;
    clientRequestsRestored: number;
    bannersRestored: number;
  };
}

/**
 * Cria um Backup Global de TODO o Banco de Dados (Exclusivo Master Admin)
 */
export async function createGlobalDatabaseBackup(): Promise<GlobalDatabaseBackupPayload> {
  const now = new Date();

  // 1. Todas as Empresas
  const companies = getStoredCompanies();

  // 2. Todos os Orçamentos de todas as empresas
  const budgets = getAllStoredBudgets();

  // 3. Todos os Trabalhadores e Registos de Horas de todas as empresas
  const allWorkers: Worker[] = [];
  const allWorkTimeLogs: WorkTimeLog[] = [];
  companies.forEach(comp => {
    const compWorkers = getWorkers(comp.id);
    const compLogs = getWorkTimeLogs(comp.id);
    allWorkers.push(...compWorkers);
    allWorkTimeLogs.push(...compLogs);
  });

  // 4. Pedidos da Loja e Produtos
  const storeOrders = getStoredStoreOrders();
  const products = getStoredProducts();
  const coupons = getCoupons();

  // 5. Pedidos Personalizados e Mensagens
  const customOrders = getStoredCustomOrders();
  const messages = getMessages();
  const transactions = getTransactions();

  // 6. Vagas & Candidatos
  const jobOffers = getStoredJobOffers();
  const candidates = getStoredCandidates();

  // 7. Obras & Pedidos de Clientes
  const clientRequests = getStoredClientRequests();

  // 8. Banners, Vídeos e Notificações
  const introBanners = getStoredIntroBanners();
  const heroVideoConfig = getStoredHeroVideoConfig();
  const actionVideoConfig = getStoredActionVideoConfig();
  const globalNotifications = getGlobalNotifications();

  // Receita Total estimada
  let totalCalculatedRevenue = 0;
  budgets.forEach(b => {
    if (b.items && Array.isArray(b.items)) {
      totalCalculatedRevenue += b.items.reduce((sum, it) => sum + (it.total || 0), 0);
    }
  });

  const payload: GlobalDatabaseBackupPayload = {
    version: '3.0',
    app: 'ÁTRIOS - Plataforma Master & Gestão',
    type: 'GLOBAL_MASTER_BACKUP',
    timestamp: now.toISOString(),
    exportedAtFormatted: now.toLocaleString('pt-PT'),
    companies,
    budgets,
    workers: allWorkers,
    workTimeLogs: allWorkTimeLogs,
    storeOrders,
    products,
    coupons,
    customOrders,
    messages,
    transactions,
    jobOffers,
    candidates,
    clientRequests,
    introBanners,
    heroVideoConfig,
    actionVideoConfig,
    globalNotifications,
    metadata: {
      totalCompanies: companies.length,
      totalBudgets: budgets.length,
      totalWorkers: allWorkers.length,
      totalWorkTimeLogs: allWorkTimeLogs.length,
      totalStoreOrders: storeOrders.length,
      totalProducts: products.length,
      totalCoupons: coupons.length,
      totalCustomOrders: customOrders.length,
      totalMessages: messages.length,
      totalJobOffers: jobOffers.length,
      totalCandidates: candidates.length,
      totalClientRequests: clientRequests.length,
      totalBanners: introBanners.length,
      totalNotifications: globalNotifications.length,
      totalCalculatedRevenue
    }
  };

  return payload;
}

/**
 * Descarrega o ficheiro de Backup Global em formato .json
 */
export function downloadGlobalBackupJSON(payload: GlobalDatabaseBackupPayload): void {
  const jsonContent = JSON.stringify(payload, null, 2);
  const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8' });
  const url = URL.createObjectURL(blob);

  const dateStr = new Date(payload.timestamp || new Date())
    .toISOString()
    .slice(0, 10);
  
  const timeStr = new Date(payload.timestamp || new Date())
    .toTimeString()
    .slice(0, 5)
    .replace(':', 'h');

  const fileName = `ATRIOS_DATABASE_GLOBAL_BACKUP_${dateStr}_${timeStr}.json`;

  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 1000);
}

/**
 * Valida um ficheiro de backup global do Master
 */
export function validateGlobalBackupContent(jsonText: string): GlobalBackupValidationResult {
  try {
    const data = JSON.parse(jsonText);

    if (!data || typeof data !== 'object') {
      return { isValid: false, error: 'O ficheiro fornecido não é um JSON válido.' };
    }

    const companies = Array.isArray(data.companies) ? data.companies : [];
    const budgets = Array.isArray(data.budgets) ? data.budgets : [];

    if (companies.length === 0 && budgets.length === 0) {
      return { 
        isValid: false, 
        error: 'O ficheiro não contém registos de empresas nem orçamentos da plataforma ÁTRIOS.' 
      };
    }

    const payload: GlobalDatabaseBackupPayload = {
      version: data.version || '3.0',
      app: data.app || 'ÁTRIOS',
      type: 'GLOBAL_MASTER_BACKUP',
      timestamp: data.timestamp || new Date().toISOString(),
      exportedAtFormatted: data.exportedAtFormatted || new Date().toLocaleString('pt-PT'),
      companies,
      budgets,
      workers: Array.isArray(data.workers) ? data.workers : [],
      workTimeLogs: Array.isArray(data.workTimeLogs) ? data.workTimeLogs : [],
      storeOrders: Array.isArray(data.storeOrders) ? data.storeOrders : [],
      products: Array.isArray(data.products) ? data.products : [],
      coupons: Array.isArray(data.coupons) ? data.coupons : [],
      customOrders: Array.isArray(data.customOrders) ? data.customOrders : [],
      messages: Array.isArray(data.messages) ? data.messages : [],
      transactions: Array.isArray(data.transactions) ? data.transactions : [],
      jobOffers: Array.isArray(data.jobOffers) ? data.jobOffers : [],
      candidates: Array.isArray(data.candidates) ? data.candidates : [],
      clientRequests: Array.isArray(data.clientRequests) ? data.clientRequests : [],
      introBanners: Array.isArray(data.introBanners) ? data.introBanners : [],
      heroVideoConfig: data.heroVideoConfig,
      actionVideoConfig: data.actionVideoConfig,
      globalNotifications: Array.isArray(data.globalNotifications) ? data.globalNotifications : [],
      metadata: data.metadata || {
        totalCompanies: companies.length,
        totalBudgets: budgets.length,
        totalWorkers: (data.workers || []).length,
        totalWorkTimeLogs: (data.workTimeLogs || []).length,
        totalStoreOrders: (data.storeOrders || []).length,
        totalProducts: (data.products || []).length,
        totalCoupons: (data.coupons || []).length,
        totalCustomOrders: (data.customOrders || []).length,
        totalMessages: (data.messages || []).length,
        totalJobOffers: (data.jobOffers || []).length,
        totalCandidates: (data.candidates || []).length,
        totalClientRequests: (data.clientRequests || []).length,
        totalBanners: (data.introBanners || []).length,
        totalNotifications: (data.globalNotifications || []).length,
        totalCalculatedRevenue: 0
      }
    };

    return {
      isValid: true,
      payload,
      summary: {
        exportedAt: payload.exportedAtFormatted,
        totalCompanies: payload.companies.length,
        totalBudgets: payload.budgets.length,
        totalWorkers: payload.workers.length,
        totalWorkTimeLogs: payload.workTimeLogs.length,
        totalStoreOrders: payload.storeOrders.length,
        totalProducts: payload.products.length,
        totalJobOffers: payload.jobOffers.length,
        totalCandidates: payload.candidates.length,
        totalClientRequests: payload.clientRequests.length
      }
    };
  } catch (err: any) {
    return {
      isValid: false,
      error: `Erro ao analisar o JSON do backup: ${err.message || 'Formato incorreto'}`
    };
  }
}

/**
 * Restaura TODO o Banco de Dados (Global Master Restore) e sincroniza com o Supabase
 */
export async function restoreGlobalDatabaseBackup(
  payload: GlobalDatabaseBackupPayload,
  onProgress?: (step: string, percent: number) => void
): Promise<GlobalRestoreResult> {
  const stats = {
    companiesRestored: 0,
    budgetsRestored: 0,
    workersRestored: 0,
    workTimeLogsRestored: 0,
    storeOrdersRestored: 0,
    productsRestored: 0,
    couponsRestored: 0,
    customOrdersRestored: 0,
    messagesRestored: 0,
    jobOffersRestored: 0,
    candidatesRestored: 0,
    clientRequestsRestored: 0,
    bannersRestored: 0
  };

  try {
    // 1. Restaurar Empresas
    onProgress?.('Restaurando todas as empresas cadastradas...', 10);
    if (payload.companies && Array.isArray(payload.companies)) {
      safeSetItem('atrios_companies', JSON.stringify(payload.companies));
      for (const comp of payload.companies) {
        await syncToCloud('companies', comp).catch(e => console.warn('Sync comp error:', e));
        stats.companiesRestored++;
      }
    }

    // 2. Restaurar Orçamentos
    onProgress?.('Restaurando todos os orçamentos e ordens de serviço...', 25);
    if (payload.budgets && Array.isArray(payload.budgets)) {
      safeSetItem('atrios_budgets', JSON.stringify(payload.budgets));
      for (const b of payload.budgets) {
        syncToCloud('budgets', b).catch(e => console.warn('Sync budget error:', e));
        stats.budgetsRestored++;
      }
    }

    // 3. Restaurar Colaboradores e Logs de Ponto
    onProgress?.('Restaurando colaboradores e registos de ponto...', 40);
    if (payload.workers && Array.isArray(payload.workers)) {
      for (const w of payload.workers) {
        await saveWorker(w);
        stats.workersRestored++;
      }
    }
    if (payload.workTimeLogs && Array.isArray(payload.workTimeLogs)) {
      for (const log of payload.workTimeLogs) {
        await saveWorkTimeLog(log);
        stats.workTimeLogsRestored++;
      }
    }

    // 4. Restaurar Produtos da Loja e Pedidos
    onProgress?.('Restaurando produtos da loja e pedidos...', 55);
    if (payload.products && Array.isArray(payload.products)) {
      safeSetItem('atrios_products', JSON.stringify(payload.products));
      for (const p of payload.products) {
        await saveProduct(p);
        stats.productsRestored++;
      }
    }
    if (payload.storeOrders && Array.isArray(payload.storeOrders)) {
      safeSetItem('atrios_store_orders', JSON.stringify(payload.storeOrders));
      for (const o of payload.storeOrders) {
        await saveStoreOrder(o);
        stats.storeOrdersRestored++;
      }
    }
    if (payload.coupons && Array.isArray(payload.coupons)) {
      safeSetItem('atrios_coupons', JSON.stringify(payload.coupons));
      stats.couponsRestored = payload.coupons.length;
    }

    // 5. Restaurar Pedidos Customizados & Mensagens de Suporte
    onProgress?.('Restaurando mensagens de suporte e pedidos customizados...', 70);
    if (payload.customOrders && Array.isArray(payload.customOrders)) {
      safeSetItem('atrios_custom_orders', JSON.stringify(payload.customOrders));
      stats.customOrdersRestored = payload.customOrders.length;
    }
    if (payload.messages && Array.isArray(payload.messages)) {
      safeSetItem('atrios_messages', JSON.stringify(payload.messages));
      stats.messagesRestored = payload.messages.length;
    }

    // 6. Restaurar Vagas e Candidatos
    onProgress?.('Restaurando vagas de trabalho e candidaturas...', 85);
    if (payload.jobOffers && Array.isArray(payload.jobOffers)) {
      safeSetItem('atrios_job_offers', JSON.stringify(payload.jobOffers));
      for (const j of payload.jobOffers) {
        await saveJobOffer(j);
        stats.jobOffersRestored++;
      }
    }
    if (payload.candidates && Array.isArray(payload.candidates)) {
      safeSetItem('atrios_candidates', JSON.stringify(payload.candidates));
      for (const c of payload.candidates) {
        await saveCandidate(c, true);
        stats.candidatesRestored++;
      }
    }

    // 7. Restaurar Pedidos de Obras (Client Requests) e Banners
    onProgress?.('Restaurando pedidos de clientes, banners e configurações...', 95);
    if (payload.clientRequests && Array.isArray(payload.clientRequests)) {
      safeSetItem('atrios_client_service_requests', JSON.stringify(payload.clientRequests));
      stats.clientRequestsRestored = payload.clientRequests.length;
    }
    if (payload.introBanners && Array.isArray(payload.introBanners)) {
      safeSetItem('atrios_intro_banners', JSON.stringify(payload.introBanners));
      stats.bannersRestored = payload.introBanners.length;
    }
    if (payload.heroVideoConfig) {
      await saveHeroVideoConfig(payload.heroVideoConfig);
    }
    if (payload.actionVideoConfig) {
      await saveActionVideoConfig(payload.actionVideoConfig);
    }
    if (payload.globalNotifications) {
      saveGlobalNotifications(payload.globalNotifications);
    }

    onProgress?.('Banco de dados global 100% restaurado e sincronizado!', 100);

    return {
      success: true,
      stats
    };

  } catch (err: any) {
    console.error('[GlobalRestore] Erro:', err);
    return {
      success: false,
      error: err.message || 'Falha ao restaurar banco de dados global.',
      stats
    };
  }
}
