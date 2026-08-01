import { Company, Budget, PlanType, GlobalNotification, SupportMessage, Transaction, Coupon, StoreOrder, Product, CustomOrderRequest, JobOffer, JobOfferStatus } from '../types';
import { syncToCloud, supabase, safeFetch } from './supabase';

const STORAGE_KEY_COMPANIES = 'atrios_companies';
const STORAGE_KEY_BUDGETS = 'atrios_budgets';
const STORAGE_KEY_PDF_COUNT = 'atrios_pdf_downloads';
const STORAGE_KEY_NOTIFICATIONS = 'atrios_notifications';
const STORAGE_KEY_MESSAGES = 'atrios_messages';
const STORAGE_KEY_TRANSACTIONS = 'atrios_transactions';
const STORAGE_KEY_COUPONS = 'atrios_coupons';
const STORAGE_KEY_SESSION = 'atrios_session';
const STORAGE_KEY_STORE_ORDERS = 'atrios_store_orders';
const STORAGE_KEY_PRODUCTS = 'atrios_products';
const STORAGE_KEY_CUSTOM_ORDERS = 'atrios_custom_orders';
const STORAGE_KEY_JOB_OFFERS = 'atrios_job_offers';

/**
 * Helper para salvar no localStorage com tratamento de erro de cota excedida.
 */
export const safeSetItem = (key: string, value: string) => {
  try {
    localStorage.setItem(key, value);
  } catch (e) {
    if (e instanceof DOMException && (
      e.code === 22 || 
      e.code === 1014 || 
      e.name === 'QuotaExceededError' || 
      e.name === 'NS_ERROR_DOM_QUOTA_REACHED')
    ) {
      console.warn(`[Storage] Cota do LocalStorage excedida ao salvar '${key}'. Tentando liberar espaço...`);
      
      // Tenta remover dados menos críticos para abrir espaço
      const keysToRemove = [
        'atrios_notifications',
        'atrios_messages',
        'atrios_transactions',
        'atrios_pdf_downloads'
      ];
      
      for (const k of keysToRemove) {
        if (k !== key) {
          localStorage.removeItem(k);
        }
      }
      
      // Tenta salvar novamente após a limpeza
      try {
        localStorage.setItem(key, value);
        console.log(`[Storage] Salvo com sucesso após limpeza parcial.`);
      } catch (retryError) {
        console.error(`[Storage] Falha crítica: Mesmo após limpeza, a cota foi excedida para '${key}'.`, retryError);
        // Se ainda falhar, não podemos fazer muito além de não travar o app
      }
    } else {
      console.error(`[Storage] Erro ao salvar no LocalStorage:`, e);
    }
  }
};

export const generateShortId = () => {
  return `ATR-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
};

export const mapCompanyFromSupabase = (data: any): Company => {
  if (!data) return data;
  const raw = { ...data };
  const rawPlanStr = String(raw.plan || '').toLowerCase().trim();
  
  let normalizedPlan: PlanType = PlanType.FREE;
  if (rawPlanStr.includes('annual') || rawPlanStr.includes('anual')) {
    normalizedPlan = PlanType.PREMIUM_ANNUAL;
  } else if (rawPlanStr.includes('month') || rawPlanStr.includes('mensal') || rawPlanStr.includes('premium')) {
    normalizedPlan = PlanType.PREMIUM_MONTHLY;
  } else if (rawPlanStr !== 'free' && rawPlanStr !== 'gratis' && rawPlanStr !== 'grátis' && rawPlanStr !== 'gráti' && rawPlanStr !== '') {
    normalizedPlan = PlanType.PREMIUM_MONTHLY;
  }

  let subExpiry = raw.subscriptionExpiresAt || raw.subscription_expires_at || raw.subscriptionExpiresat;

  if (normalizedPlan !== PlanType.FREE) {
    const isExpValid = subExpiry && !isNaN(new Date(subExpiry).getTime());
    const isExpInPast = isExpValid && new Date(subExpiry).getTime() < Date.now();
    if (!isExpValid || isExpInPast) {
      const daysToAdd = normalizedPlan === PlanType.PREMIUM_ANNUAL ? 365 : 30;
      subExpiry = new Date(Date.now() + daysToAdd * 24 * 60 * 60 * 1000).toISOString();
    }
  } else {
    subExpiry = undefined;
  }

  const rawLastSeen = raw.lastSeenAt || raw.last_seen_at || raw.lastseenat;

  const localCompanies = getStoredCompanies();
  const localComp = localCompanies.find(c => String(c.id) === String(raw.id || raw.company_id || raw.companyid) || (c.email && raw.email && c.email.toLowerCase().trim() === String(raw.email).toLowerCase().trim()));

  const rawCanEditVal = raw.can_edit_sensitive_data ?? raw.canEditSensitiveData ?? raw.caneditsensitivedata;
  const rawUnlockVal = raw.unlock_requested ?? raw.unlockRequested ?? raw.unlockrequested;

  let unlockReq = false;
  if (rawUnlockVal !== undefined && rawUnlockVal !== null) {
    unlockReq = Boolean(rawUnlockVal);
  } else if (localComp && localComp.unlockRequested !== undefined) {
    unlockReq = localComp.unlockRequested;
  }

  let canEdit = false;
  if (rawCanEditVal !== undefined && rawCanEditVal !== null) {
    canEdit = Boolean(rawCanEditVal);
  } else if (localComp && localComp.canEditSensitiveData !== undefined) {
    canEdit = localComp.canEditSensitiveData;
  } else {
    canEdit = false;
  }

  let parsedCustomServices: { id: string; name: string }[] = [];
  const rawCS = raw.customServices || raw.custom_services || (localComp as any)?.customServices;
  if (typeof rawCS === 'string') {
    try {
      parsedCustomServices = JSON.parse(rawCS);
    } catch (e) {
      parsedCustomServices = [];
    }
  } else if (Array.isArray(rawCS)) {
    parsedCustomServices = rawCS;
  } else if (localComp?.customServices && Array.isArray(localComp.customServices)) {
    parsedCustomServices = localComp.customServices;
  }

  const mapped: Company = {
    ...localComp,
    ...raw,
    id: String(raw.id || raw.company_id || raw.companyid || localComp?.id || ''),
    name: (raw.name || raw.company_name || localComp?.name || 'Empresa').trim() || localComp?.name || 'Empresa',
    email: raw.email || localComp?.email || '',
    logo: raw.logo || raw.logo_url || raw.logourl || localComp?.logo || '',
    qrCode: raw.qrCode || raw.qr_code || raw.qrcode || localComp?.qrCode || '',
    address: raw.address || raw.fiscal_address || raw.fiscaladdress || localComp?.address || '',
    nif: raw.nif || raw.tax_id || raw.taxid || localComp?.nif || '',
    phone: raw.phone || raw.telephone || raw.phone_number || localComp?.phone || '',
    website: raw.website || raw.site || raw.web_site || raw.website_url || raw.site_url || localComp?.website || '',
    pdfTemplate: raw.pdfTemplate || raw.pdf_template || raw.pdftemplate || localComp?.pdfTemplate || 'default',
    plan: normalizedPlan,
    subscriptionExpiresAt: subExpiry,
    subscription_expires_at: subExpiry,
    lastSeenAt: rawLastSeen || localComp?.lastSeenAt,
    last_seen_at: rawLastSeen || (localComp as any)?.last_seen_at,
    isManual: Boolean(raw.isManual || raw.is_manual || localComp?.isManual),
    canEditSensitiveData: canEdit,
    unlockRequested: unlockReq,
    isBlocked: Boolean(raw.isBlocked || raw.is_blocked || localComp?.isBlocked),
    verified: raw.verified !== undefined ? Boolean(raw.verified) : (localComp?.verified !== undefined ? localComp.verified : true),
    customServices: parsedCustomServices
  };

  return mapped;
};

export const getStoredCompanies = (): Company[] => {
  const data = localStorage.getItem(STORAGE_KEY_COMPANIES);
  return data ? JSON.parse(data) : [];
};

export const saveCompany = async (company: Company) => {
  const companies = getStoredCompanies();
  const index = companies.findIndex(c => c.id === company.id || (c.email && company.email && c.email.toLowerCase().trim() === company.email.toLowerCase().trim()));
  
  const nowIso = new Date().toISOString();
  const existing = index > -1 ? companies[index] : null;

  const validTimes = [
    company.lastSeenAt,
    (company as any).last_seen_at,
    existing?.lastSeenAt,
    (existing as any)?.last_seen_at
  ].filter(Boolean)
   .map(t => new Date(t!).getTime())
   .filter(t => !isNaN(t));

  const maxTime = validTimes.length > 0 ? Math.max(...validTimes) : new Date().getTime();
  const bestLastSeen = new Date(maxTime).toISOString();

  const updatedCompany: Company = {
    ...existing,
    ...company,
    lastSeenAt: bestLastSeen,
    last_seen_at: bestLastSeen
  };

  if (index > -1) {
    companies[index] = updatedCompany;
  } else {
    companies.push(updatedCompany);
  }
  safeSetItem(STORAGE_KEY_COMPANIES, JSON.stringify(companies));
  
  // Sincroniza plano e dados sensíveis com Supabase
  return await syncToCloud('companies', updatedCompany);
};

export const saveCustomServiceToCloud = async (companyId: string, service: { id: string; name: string }) => {
  if (!companyId || !service?.id) return;
  try {
    const record = {
      id: `${companyId}_${service.id.toLowerCase()}`,
      company_id: companyId,
      service_id: service.id,
      name: service.name,
      created_at: new Date().toISOString()
    };
    await safeFetch(supabase.from('company_services').upsert(record));
  } catch (e) {
    console.warn("[Storage] Erro ao sincronizar serviço para company_services:", e);
  }
};

export const removeCustomServiceFromCloud = async (companyId: string, serviceId: string) => {
  if (!companyId || !serviceId) return;
  try {
    const recId = `${companyId}_${serviceId.toLowerCase()}`;
    await safeFetch(
      supabase.from('company_services')
        .delete()
        .eq('company_id', companyId)
        .or(`id.eq.${recId},service_id.eq.${serviceId}`)
    );
  } catch (e) {
    console.warn("[Storage] Erro ao remover serviço de company_services:", e);
  }
};

export const removeCompany = async (id: string, email?: string) => {
  const normEmail = email ? email.toLowerCase().trim() : '';
  const companies = getStoredCompanies().filter(c => c.id !== id && (!normEmail || c.email?.toLowerCase().trim() !== normEmail));
  safeSetItem(STORAGE_KEY_COMPANIES, JSON.stringify(companies));
  
  const allBudgetsStr = localStorage.getItem(STORAGE_KEY_BUDGETS);
  if (allBudgetsStr) {
    const allBudgets = JSON.parse(allBudgetsStr);
    const filteredBudgets = allBudgets.filter((b: Budget) => String(b.companyId) !== String(id));
    safeSetItem(STORAGE_KEY_BUDGETS, JSON.stringify(filteredBudgets));
  }

  const allOrdersStr = localStorage.getItem(STORAGE_KEY_STORE_ORDERS);
  if (allOrdersStr) {
    const allOrders = JSON.parse(allOrdersStr);
    const filteredOrders = allOrders.filter((o: StoreOrder) => String(o.companyId) !== String(id));
    safeSetItem(STORAGE_KEY_STORE_ORDERS, JSON.stringify(filteredOrders));
  }

  const allMsgsStr = localStorage.getItem(STORAGE_KEY_MESSAGES);
  if (allMsgsStr) {
    const allMsgs = JSON.parse(allMsgsStr);
    const filteredMsgs = allMsgs.filter((m: SupportMessage) => String(m.companyId) !== String(id));
    safeSetItem(STORAGE_KEY_MESSAGES, JSON.stringify(filteredMsgs));
  }

  const allCustomStr = localStorage.getItem(STORAGE_KEY_CUSTOM_ORDERS);
  if (allCustomStr) {
    const allCustom = JSON.parse(allCustomStr);
    const filteredCustom = allCustom.filter((c: CustomOrderRequest) => String(c.companyId) !== String(id));
    safeSetItem(STORAGE_KEY_CUSTOM_ORDERS, JSON.stringify(filteredCustom));
  }

  const allTxStr = localStorage.getItem(STORAGE_KEY_TRANSACTIONS);
  if (allTxStr) {
    const allTx = JSON.parse(allTxStr);
    const filteredTx = allTx.filter((t: Transaction) => String(t.companyId) !== String(id));
    safeSetItem(STORAGE_KEY_TRANSACTIONS, JSON.stringify(filteredTx));
  }

  if (supabase) {
    try {
      await Promise.all([
        supabase.from('companies').delete().eq('id', id),
        supabase.from('companies').delete().eq('company_id', id),
        normEmail ? supabase.from('companies').delete().eq('email', normEmail) : Promise.resolve(),
        supabase.from('budgets').delete().eq('company_id', id),
        supabase.from('messages').delete().eq('company_id', id),
        supabase.from('store_orders').delete().eq('company_id', id),
        supabase.from('custom_order_requests').delete().eq('company_id', id),
        supabase.from('transactions').delete().eq('company_id', id)
      ]);
    } catch (err) {
      console.error("[Storage] Erro ao deletar empresa e dados no Supabase:", err);
    }
  }
};

export const getAllStoredBudgets = (): Budget[] => {
  const data = localStorage.getItem(STORAGE_KEY_BUDGETS);
  return data ? JSON.parse(data) : [];
};

export const getStoredBudgets = (companyId: string): Budget[] => {
  const budgets = getAllStoredBudgets();
  return budgets.filter(b => String(b.companyId) === String(companyId));
};

export const getStoredStoreOrders = (companyId?: string): StoreOrder[] => {
  const data = localStorage.getItem(STORAGE_KEY_STORE_ORDERS);
  const orders: StoreOrder[] = data ? JSON.parse(data) : [];
  if (companyId) {
    return orders.filter(o => String(o.companyId) === String(companyId));
  }
  return orders;
};

export const getStoredProducts = (): Product[] => {
  const data = localStorage.getItem(STORAGE_KEY_PRODUCTS);
  return data ? JSON.parse(data) : [];
};

export const getStoredCustomOrders = (companyId?: string): CustomOrderRequest[] => {
  const data = localStorage.getItem(STORAGE_KEY_CUSTOM_ORDERS);
  const requests: CustomOrderRequest[] = data ? JSON.parse(data) : [];
  if (companyId) {
    return requests.filter(r => String(r.companyId) === String(companyId));
  }
  return requests;
};

export const saveCustomOrderRequest = async (request: CustomOrderRequest): Promise<boolean> => {
  try {
    const requests = getStoredCustomOrders();
    requests.unshift(request);
    safeSetItem(STORAGE_KEY_CUSTOM_ORDERS, JSON.stringify(requests));
    
    // Sync to Supabase
    const { error } = await supabase
      .from('custom_order_requests')
      .insert([{
        id: request.id,
        company_id: request.companyId,
        item_id: request.itemId,
        item_name: request.itemName,
        quantity: request.quantity,
        description: request.description,
        image_url: request.imageUrl,
        status: request.status,
        created_at: request.createdAt
      }]);

    if (error) {
      console.error('Error syncing custom order to cloud:', error);
    }
    return true;
  } catch (error) {
    console.error('Error saving custom order:', error);
    return false;
  }
};

/**
 * Salva o orçamento completo no Supabase.
 * Inclui as tabelas aninhadas de itens, despesas e pagamentos com comprovativos (Base64).
 */
export const saveBudget = (budget: Budget) => {
  try {
    const data = localStorage.getItem(STORAGE_KEY_BUDGETS);
    const budgets: Budget[] = data ? JSON.parse(data) : [];
    const index = budgets.findIndex(b => b.id === budget.id);
    
    if (index > -1) {
      budgets[index] = budget;
    } else {
      budgets.push(budget);
    }
    
    safeSetItem(STORAGE_KEY_BUDGETS, JSON.stringify(budgets));
    console.log(`[Storage] Orçamento ${budget.id} salvo localmente. Sincronizando com a nuvem...`);
  } catch (err) {
    console.error("Error saving budget to localStorage:", err);
    throw err;
  }

  // O Supabase recebe o objeto completo via UPSERT (Insert ou Update automático pelo ID)
  syncToCloud('budgets', budget).then(res => {
    if (res.success) {
      console.log(`[Storage] Orçamento ${budget.id} sincronizado com sucesso no Supabase.`);
    } else {
      console.error(`[Storage] Falha ao sincronizar orçamento ${budget.id}:`, res.error);
    }
  });
};

export const removeBudget = async (id: string) => {
  try {
    const data = localStorage.getItem(STORAGE_KEY_BUDGETS);
    let budgets: Budget[] = data ? JSON.parse(data) : [];
    budgets = budgets.filter(b => b.id !== id);
    safeSetItem(STORAGE_KEY_BUDGETS, JSON.stringify(budgets));
    console.log(`[Storage] Orçamento ${id} removido localmente. Sincronizando com a nuvem...`);
    
    // Sync deletion to Supabase
    const { error } = await supabase.from('budgets').delete().eq('id', id);
    if (error) {
      console.error("Error deleting from Supabase:", error);
    }
    
    return true;
  } catch (err) {
    console.error("Error removing budget:", err);
    return false;
  }
};

export const getPdfDownloadCount = (companyId: string): number => {
  const data = localStorage.getItem(STORAGE_KEY_PDF_COUNT);
  const counts = data ? JSON.parse(data) : {};
  return counts[companyId] || 0;
};

export const incrementPdfDownloadCount = (companyId: string) => {
  const data = localStorage.getItem(STORAGE_KEY_PDF_COUNT);
  const counts = data ? JSON.parse(data) : {};
  counts[companyId] = (counts[companyId] || 0) + 1;
  safeSetItem(STORAGE_KEY_PDF_COUNT, JSON.stringify(counts));
};

export const getGlobalNotifications = (): GlobalNotification[] => {
  const data = localStorage.getItem(STORAGE_KEY_NOTIFICATIONS);
  return data ? JSON.parse(data) : [];
};

export const saveGlobalNotifications = (notifications: GlobalNotification[]) => {
  safeSetItem(STORAGE_KEY_NOTIFICATIONS, JSON.stringify(notifications));
  notifications.forEach(n => syncToCloud('notifications', n));
};

export const getMessages = (companyId?: string): SupportMessage[] => {
  const data = localStorage.getItem(STORAGE_KEY_MESSAGES);
  const messages: SupportMessage[] = data ? JSON.parse(data) : [];
  if (companyId) {
    return messages.filter(m => String(m.companyId) === String(companyId));
  }
  return messages;
};

export const saveMessage = async (message: SupportMessage) => {
  const messages = getMessages();
  const index = messages.findIndex(m => String(m.id) === String(message.id));
  if (index > -1) {
    messages[index] = message;
  } else {
    messages.push(message);
  }
  safeSetItem(STORAGE_KEY_MESSAGES, JSON.stringify(messages));
  
  return await syncToCloud('messages', message);
};

export const markMessagesAsRead = async (companyId: string, role: 'user' | 'master') => {
  const data = localStorage.getItem(STORAGE_KEY_MESSAGES);
  if (!data) return;
  const messages: SupportMessage[] = JSON.parse(data);
  const updated = messages.map(m => {
    if (String(m.companyId) === String(companyId) && m.senderRole !== role) {
      return { ...m, read: true };
    }
    return m;
  });
  safeSetItem(STORAGE_KEY_MESSAGES, JSON.stringify(updated));

  // Tenta atualizar no Supabase com mapeamento de coluna resiliente
  try {
    const { error } = await supabase.from('messages')
      .update({ read: true })
      .eq('companyId', companyId)
      .neq('senderRole', role);
      
    if (error && (error.code === 'PGRST204' || error.message.includes('companyId'))) {
      await supabase.from('messages')
        .update({ read: true })
        .eq('company_id', companyId)
        .neq('sender_role', role);
    }
  } catch (err) {
    console.error("Erro ao marcar mensagens como lidas no cloud:", err);
  }
};

export const getTransactions = (companyId?: string): Transaction[] => {
  const data = localStorage.getItem(STORAGE_KEY_TRANSACTIONS);
  const transactions: Transaction[] = data ? JSON.parse(data) : [];
  if (companyId) {
    return transactions.filter(t => String(t.companyId) === String(companyId));
  }
  return transactions;
};

export const saveTransaction = (tx: Transaction) => {
  const txs = getTransactions();
  txs.push(tx);
  safeSetItem(STORAGE_KEY_TRANSACTIONS, JSON.stringify(txs));
  
  syncToCloud('transactions', tx);
};

export const getCoupons = (): Coupon[] => {
  const data = localStorage.getItem(STORAGE_KEY_COUPONS);
  return data ? JSON.parse(data) : [];
};

export const saveCoupon = (coupon: Coupon) => {
  const coupons = getCoupons();
  coupons.push(coupon);
  safeSetItem(STORAGE_KEY_COUPONS, JSON.stringify(coupons));
  
  syncToCloud('coupons', coupon);
};

export const removeCoupon = async (id: string) => {
  const coupons = getCoupons().filter(c => c.id !== id);
  safeSetItem(STORAGE_KEY_COUPONS, JSON.stringify(coupons));
  await supabase.from('coupons').delete().eq('id', id);
};

export const getStoreOrders = (): StoreOrder[] => {
  const data = localStorage.getItem(STORAGE_KEY_STORE_ORDERS);
  return data ? JSON.parse(data) : [];
};

export const saveStoreOrder = async (order: StoreOrder): Promise<boolean> => {
  try {
    const orders = getStoreOrders();
    const index = orders.findIndex(o => o.id === order.id);
    if (index > -1) {
      orders[index] = order;
    } else {
      orders.push(order);
    }
    safeSetItem(STORAGE_KEY_STORE_ORDERS, JSON.stringify(orders));
    
    // Tenta sincronizar com a nuvem, mas não bloqueia o sucesso local
    const result = await syncToCloud('store_orders', order);
    if (!result.success) {
      console.warn("saveStoreOrder: Falha na sincronização cloud, mas o pedido foi salvo localmente.", result.error);
      // Retornamos true pois o pedido foi salvo localmente com sucesso
    }
    
    return true;
  } catch (error) {
    console.error("saveStoreOrder: Erro ao salvar pedido:", error);
    return false;
  }
};

export const deleteStoreOrder = async (id: string): Promise<boolean> => {
  try {
    const orders = getStoreOrders().filter(o => o.id !== id);
    safeSetItem(STORAGE_KEY_STORE_ORDERS, JSON.stringify(orders));
    
    const { error } = await supabase.from('store_orders').delete().eq('id', id);
    if (error) {
      console.error("deleteStoreOrder: Erro ao deletar no Supabase:", error);
      return false;
    }
    return true;
  } catch (error) {
    console.error("deleteStoreOrder: Erro inesperado:", error);
    return false;
  }
};

// Cache para evitar buscas excessivas no Supabase (reduz egress)
const lastFetch: Record<string, number> = {};
const CACHE_TTL = 5 * 60 * 1000; // 5 minutos

export const getProducts = async (forceRefresh = false): Promise<Product[]> => {
  const now = new Date().getTime();
  const localData = localStorage.getItem(STORAGE_KEY_PRODUCTS);
  const local = localData ? JSON.parse(localData) : [];

  // Se tivermos dados locais e não for um refresh forçado, e a última busca foi recente, retornamos o local
  if (!forceRefresh && local.length > 0 && lastFetch['products'] && (now - lastFetch['products'] < CACHE_TTL)) {
    console.log("getProducts: Retornando dados do cache local (TTL ativo).");
    return local;
  }

  console.log(`getProducts: Iniciando busca no Supabase (force: ${forceRefresh})...`);
  try {
    // Revertendo para select('*') para garantir compatibilidade total, 
    // mas mantendo o cache para economizar egress em acessos repetidos.
    const { data, error } = await supabase
      .from('products')
      .select('*');
    
    if (data && data.length > 0) {
      lastFetch['products'] = now;
      const mapped = data.map(mapProductFromSupabase);
      const sorted = mapped.sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
      });
      safeSetItem(STORAGE_KEY_PRODUCTS, JSON.stringify(sorted));
      return sorted;
    }
    
    if (error) {
      console.warn("getProducts: Erro Supabase:", error);
    }
  } catch (err) {
    console.warn("getProducts: Exceção:", err);
  }
  
  return local;
};

export const saveProduct = async (product: Product): Promise<{ success: boolean, error?: any }> => {
  console.log("saveProduct: Iniciando salvamento do produto:", product.id);
  const products = await getProducts();
  const index = products.findIndex(p => p.id === product.id);
  if (index > -1) {
    products[index] = product;
  } else {
    products.push(product);
  }
  safeSetItem(STORAGE_KEY_PRODUCTS, JSON.stringify(products));
  console.log("saveProduct: Salvo no localStorage. Total de produtos:", products.length);
  
  const syncResult = await syncToCloud('products', product);
  console.log("saveProduct: Resultado da sincronização cloud:", syncResult);
  return syncResult;
};

export const deleteProduct = async (id: string) => {
  const products = (await getProducts()).filter(p => p.id !== id);
  safeSetItem(STORAGE_KEY_PRODUCTS, JSON.stringify(products));
  
  return await supabase.from('products').delete().eq('id', id);
};

/**
 * Recupera todos os dados do Supabase e atualiza o armazenamento local.
 * Garante que orçamentos antigos, despesas e status de plano apareçam na página do usuário.
 */
const safeParse = (data: any) => {
  if (typeof data === 'string') {
    try {
      return JSON.parse(data);
    } catch (e) {
      console.error("Error parsing JSON field:", e);
      return [];
    }
  }
  return data || [];
};

export const mapBudgetFromSupabase = (b: any): Budget => {
  const mapped: any = { ...b };
  if (b.company_id && !b.companyId) mapped.companyId = b.company_id;
  if (b.companyid && !b.companyId) mapped.companyId = b.companyid;
  if (b.client_name && !b.clientName) mapped.clientName = b.client_name;
  if (b.contact_name && !b.contactName) mapped.contactName = b.contact_name;
  if (b.contact_phone && !b.contactPhone) mapped.contactPhone = b.contact_phone;
  if (b.work_location && !b.workLocation) mapped.workLocation = b.work_location;
  if (b.work_number && !b.workNumber) mapped.workNumber = b.work_number;
  if (b.work_postal_code && !b.workPostalCode) mapped.workPostalCode = b.work_postal_code;
  if (b.client_nif && !b.clientNif) mapped.clientNif = b.client_nif;
  if (b.services_selected && !b.servicesSelected) mapped.servicesSelected = b.services_selected;
  if (b.total_amount && !b.totalAmount) mapped.totalAmount = b.total_amount;
  if (b.project_files && !b.projectFiles) mapped.projectFiles = b.project_files;
  if (b.include_iva !== undefined && b.includeIva === undefined) mapped.includeIva = b.include_iva;
  if (b.iva_percentage !== undefined && b.ivaPercentage === undefined) mapped.ivaPercentage = b.iva_percentage;
  if (b.payment_method && !b.paymentMethod) mapped.paymentMethod = b.payment_method;
  if (b.created_at && !b.createdAt) mapped.createdAt = b.created_at;
  
  // Garantir que arrays sejam arrays (caso venham como string JSON)
  mapped.items = safeParse(b.items);
  mapped.expenses = safeParse(b.expenses);
  mapped.payments = safeParse(b.payments);
  mapped.servicesSelected = safeParse(b.servicesSelected || b.services_selected);
  mapped.projectFiles = safeParse(b.projectFiles || b.project_files);
  
  return mapped as Budget;
};

export const mapMessageFromSupabase = (m: any): SupportMessage => {
  if (!m) return m;
  const mapped: any = { ...m };
  const rawCompanyId = m.companyId || m.company_id || m.companyid || m.company_id_raw || '';
  if (rawCompanyId) mapped.companyId = String(rawCompanyId);
  const senderRole = m.senderRole || m.sender_role || m.senderrole || 'user';
  mapped.senderRole = senderRole;
  if (m.translated_content && !m.translatedContent) mapped.translatedContent = m.translated_content;
  if (m.translatedcontent && !m.translatedContent) mapped.translatedContent = m.translatedcontent;
  if (m.created_at && !m.createdAt) mapped.createdAt = m.created_at;
  if (m.created_at && !m.timestamp) mapped.timestamp = m.created_at;
  if (m.timestamp && !m.createdAt) mapped.createdAt = m.timestamp;
  if (!mapped.timestamp && mapped.createdAt) mapped.timestamp = mapped.createdAt;
  if (!mapped.timestamp) {
    mapped.timestamp = new Date().toISOString();
    mapped.createdAt = mapped.timestamp;
  }
  mapped.read = Boolean(m.read);
  return mapped as SupportMessage;
};

export const mapOrderFromSupabase = (o: any): StoreOrder => {
  const mapped: any = { ...o };
  if (o.company_id && !o.companyId) mapped.companyId = o.company_id;
  if (o.product_id && !o.productId) mapped.productId = o.product_id;
  if (o.product_name && !o.productName) mapped.productName = o.product_name;
  if (o.uploaded_image && !o.uploadedImage) mapped.uploadedImage = o.uploaded_image;
  if (o.needs_customization !== undefined && o.needsCustomization === undefined) mapped.needsCustomization = o.needs_customization;
  if (o.created_at && !o.createdAt) mapped.createdAt = o.created_at;
  return mapped as StoreOrder;
};

export const mapProductFromSupabase = (p: any): Product => {
  const mapped: any = { ...p };
  if (p.additional_images && !p.additionalImages) mapped.additionalImages = p.additional_images;
  if (p.created_at && !p.createdAt) mapped.createdAt = p.created_at;
  
  // Ensure additionalImages is an array
  if (mapped.additionalImages && typeof mapped.additionalImages === 'string') {
    try {
      mapped.additionalImages = JSON.parse(mapped.additionalImages);
    } catch (e) {
      mapped.additionalImages = [];
    }
  }
  
  if (!mapped.additionalImages) {
    mapped.additionalImages = [];
  }
  
  return mapped as Product;
};

export const mapCustomOrderFromSupabase = (c: any): CustomOrderRequest => {
  const mapped: any = { ...c };
  if (c.company_id && !c.companyId) mapped.companyId = c.company_id;
  if (c.item_id && !c.itemId) mapped.itemId = c.item_id;
  if (c.item_name && !c.itemName) mapped.itemName = c.item_name;
  if (c.image_url && !c.imageUrl) mapped.imageUrl = c.image_url;
  if (c.created_at && !c.createdAt) mapped.createdAt = c.created_at;
  return mapped as CustomOrderRequest;
};

export const mapJobOfferFromSupabase = (j: any): JobOffer => {
  if (!j) return j;
  const mapped: any = { ...j };
  
  const cId = j.companyId || j.company_id || j.companyid;
  const cName = j.companyName || j.company_name || j.companyname;
  const sDate = j.startDate || j.start_date || j.startdate;
  const cAt = j.createdAt || j.created_at || j.createdat || j.timestamp;
  const uAt = j.updatedAt || j.updated_at || j.updatedat;

  mapped.id = String(j.id || '');
  mapped.companyId = String(cId || '');
  mapped.companyName = String(cName || 'Empresa');
  mapped.location = String(j.location || '');
  mapped.specialty = String(j.specialty || '');
  mapped.salary = String(j.salary || '');
  mapped.startDate = String(sDate || '');
  mapped.duration = String(j.duration || '');
  mapped.description = String(j.description || '');
  mapped.contact = String(j.contact || '');
  mapped.status = (j.status || 'pending') as JobOfferStatus;
  mapped.feedback = j.feedback || '';
  mapped.createdAt = String(cAt || new Date().toISOString());
  mapped.updatedAt = String(uAt || new Date().toISOString());

  return mapped as JobOffer;
};

export const mapJobOfferToSupabasePayload = (offer: JobOffer) => {
  return {
    id: String(offer.id),
    company_id: String(offer.companyId || ''),
    company_name: String(offer.companyName || 'Empresa'),
    location: String(offer.location || ''),
    specialty: String(offer.specialty || ''),
    salary: String(offer.salary || ''),
    start_date: String(offer.startDate || ''),
    duration: String(offer.duration || ''),
    description: String(offer.description || ''),
    contact: String(offer.contact || ''),
    status: String(offer.status || 'pending'),
    feedback: offer.feedback || null,
    created_at: offer.createdAt || new Date().toISOString(),
    updated_at: offer.updatedAt || new Date().toISOString()
  };
};

export const getStoredJobOffers = (companyId?: string): JobOffer[] => {
  const data = localStorage.getItem(STORAGE_KEY_JOB_OFFERS);
  const offers: JobOffer[] = data ? JSON.parse(data) : [];
  if (companyId) {
    return offers.filter(o => String(o.companyId) === String(companyId));
  }
  return offers;
};

export const saveJobOffer = async (offer: JobOffer): Promise<{ success: boolean; error?: any }> => {
  try {
    const offers = getStoredJobOffers();
    const index = offers.findIndex(o => String(o.id) === String(offer.id));
    if (index > -1) {
      offers[index] = offer;
    } else {
      offers.unshift(offer);
    }
    safeSetItem(STORAGE_KEY_JOB_OFFERS, JSON.stringify(offers));
    
    // Sincronizar via syncToCloud para garantias de resiliência e tratamento de schema
    const result = await syncToCloud('job_offers', offer);
    if (!result.success) {
      console.warn("saveJobOffer: Falha na sincronização cloud (salvo localmente):", result.error);
    } else {
      console.log("saveJobOffer: Vaga de trabalho sincronizada no Supabase com sucesso!");
    }
    return result;
  } catch (err) {
    console.error("saveJobOffer error:", err);
    return { success: false, error: err };
  }
};

export const deleteJobOffer = async (id: string): Promise<{ success: boolean; error?: any }> => {
  try {
    console.log(`[deleteJobOffer] Deletando vaga ${id} localmente e no Supabase...`);
    const offers = getStoredJobOffers().filter(o => String(o.id) !== String(id));
    safeSetItem(STORAGE_KEY_JOB_OFFERS, JSON.stringify(offers));

    const { error } = await safeFetch<any>(supabase.from('job_offers').delete().eq('id', String(id)));
    if (error) {
      console.warn("[deleteJobOffer] Erro/Aviso ao deletar no Supabase:", error);
      return { success: false, error };
    }
    console.log(`[deleteJobOffer] Vaga ${id} deletada no Supabase!`);
    return { success: true };
  } catch (err) {
    console.error("[deleteJobOffer] Exceção ao deletar vaga:", err);
    return { success: false, error: err };
  }
};

export const updateJobOfferStatus = async (id: string, status: JobOfferStatus, feedback?: string): Promise<{ success: boolean; error?: any }> => {
  try {
    const offers = getStoredJobOffers();
    const index = offers.findIndex(o => String(o.id) === String(id));
    let updatedOffer: JobOffer;
    if (index > -1) {
      updatedOffer = {
        ...offers[index],
        status,
        feedback: feedback !== undefined ? feedback : offers[index].feedback,
        updatedAt: new Date().toISOString()
      };
      offers[index] = updatedOffer;
    } else {
      updatedOffer = {
        id: String(id),
        companyId: '',
        companyName: '',
        location: '',
        specialty: '',
        salary: '',
        startDate: '',
        duration: '',
        description: '',
        contact: '',
        status,
        feedback: feedback || '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      offers.unshift(updatedOffer);
    }
    safeSetItem(STORAGE_KEY_JOB_OFFERS, JSON.stringify(offers));
    
    // Envia o objeto de vaga completo atualizado para preservar colunas NOT NULL
    const result = await syncToCloud('job_offers', updatedOffer);
    if (!result.success) {
      console.warn("updateJobOfferStatus: Falha na atualização cloud (salvo localmente):", result.error);
    } else {
      console.log("updateJobOfferStatus: Atualizado no Supabase com sucesso!");
    }
    return result;
  } catch (err) {
    console.error("updateJobOfferStatus error:", err);
    return { success: false, error: err };
  }
};

// Helper para buscar dados de forma resiliente tentando diferentes nomes de coluna para o ID da empresa
export const fetchResilient = async (table: string, companyId: string, orderCol?: string, select = '*') => {
  const columns = ['companyId', 'company_id', 'companyid'];
  let lastError = null;
  
  for (const col of columns) {
    try {
      let query = supabase.from(table).select(select).eq(col, companyId);
      if (orderCol) {
        query = query.order(orderCol, { ascending: false });
      }
      
      const { data, error, status } = await safeFetch<any[]>(query) as any;
      
      if (!error) {
        return { data, error: null };
      }
      
      // Se o erro for relacionado à coluna de ordenação, tentamos sem ordenação
      if (orderCol && (error.message?.includes('column') || error.message?.includes('order'))) {
        console.warn(`fetchResilient: Coluna de ordenação '${orderCol}' não encontrada em ${table}. Tentando sem ordenação...`);
        const { data: fallbackData, error: fallbackError } = await supabase.from(table).select(select).eq(col, companyId);
        if (!fallbackError) {
          return { data: fallbackData, error: null };
        }
      }
      
      lastError = error;
      // Se o erro for "coluna não encontrada", tentamos a próxima
      if (error.code === 'PGRST204' || error.message?.includes('column')) {
        continue;
      }
      
      // Se for outro erro (ex: 400 Bad Request genérico que pode ser coluna), continuamos tentando
      if (status === 400) {
        continue;
      }
      
      // Para outros erros (500, etc), paramos
      break;
    } catch (err) {
      console.error(`Erro ao tentar buscar na coluna ${col} da tabela ${table}:`, err);
    }
  }
  
  return { data: null, error: lastError };
};

export const hydrateLocalData = async (companyId: string): Promise<{ budgets: Budget[], orders: StoreOrder[], messages: SupportMessage[], customOrders: CustomOrderRequest[], jobOffers?: JobOffer[] }> => {
  if (!companyId) {
    console.warn("[Hydrate] companyId não fornecido. Abortando hidratação.");
    return { budgets: [], orders: [], messages: [], customOrders: [], jobOffers: [] };
  }
  let fetchedBudgets: Budget[] = getStoredBudgets(companyId);
  let fetchedOrders: StoreOrder[] = getStoredStoreOrders(companyId);
  let fetchedMessages: SupportMessage[] = getMessages(companyId);
  let fetchedCustomOrders: CustomOrderRequest[] = getStoredCustomOrders(companyId);

  try {
    // 1. Hidratar Empresa (Garante Plano Premium/Free correto)
    let { data: companyData, error: companyError } = await safeFetch<any>(supabase.from('companies').select('*').eq('id', companyId).single());
    
    // Fallback para company_id se id falhar
    if (companyError && (companyError.code === 'PGRST204' || companyError.message?.includes('column'))) {
      const { data: fallbackData, error: fallbackError } = await safeFetch<any>(supabase.from('companies').select('*').eq('company_id', companyId).single());
      if (!fallbackError) {
        companyData = fallbackData;
        companyError = null;
      }
    }
    
    if (!companyData || (companyError && (companyError.code === 'PGRST116' || companyError.code === 'PGRST204'))) {
      console.warn(`[Hydrate] Empresa ${companyId} não encontrada no Supabase. Removendo localmente.`);
      const companies = getStoredCompanies();
      const filtered = companies.filter(c => String(c.id) !== String(companyId));
      safeSetItem(STORAGE_KEY_COMPANIES, JSON.stringify(filtered));
      return { budgets: [], orders: [], messages: [], customOrders: [], jobOffers: [] }; 
    }

    if (companyData) {
      // Mapeamento de campos da empresa
      const mappedCompany = mapCompanyFromSupabase(companyData);
      
      const companies = getStoredCompanies();
      const idx = companies.findIndex(c => String(c.id) === String(companyId));
      if (idx > -1) {
        if (!mappedCompany.website && companies[idx].website) {
          mappedCompany.website = companies[idx].website;
        }
        companies[idx] = mappedCompany;
      } else {
        companies.push(mappedCompany);
      }
      safeSetItem(STORAGE_KEY_COMPANIES, JSON.stringify(companies));
    }

    // 1.5 Hidratar Pedidos Personalizados
    console.log(`[Hydrate] Buscando pedidos personalizados para a empresa ${companyId}...`);
    const { data: customOrders, error: customOrdersError } = await fetchResilient('custom_order_requests', companyId, undefined, '*');
    
    if (customOrdersError) {
      console.warn("[Hydrate] Erro ao buscar pedidos personalizados:", customOrdersError);
    }

    if (customOrders) {
      fetchedCustomOrders = customOrders.map(mapCustomOrderFromSupabase);
      const localCustomOrdersStr = localStorage.getItem(STORAGE_KEY_CUSTOM_ORDERS);
      let allCustomOrders: CustomOrderRequest[] = localCustomOrdersStr ? JSON.parse(localCustomOrdersStr) : [];
      const otherCustomOrders = allCustomOrders.filter(o => String(o.companyId) !== String(companyId));
      safeSetItem(STORAGE_KEY_CUSTOM_ORDERS, JSON.stringify([...otherCustomOrders, ...fetchedCustomOrders]));
    }

    // 2. Hidratar Orçamentos (Histórico completo de despesas e pagamentos)
    console.log(`[Hydrate] Buscando orçamentos para a empresa ${companyId}...`);
    
    const { data: budgets, error: budgetsError } = await fetchResilient('budgets', companyId, 'created_at', '*');
      
    if (budgetsError) {
      console.warn("[Hydrate] Erro ao buscar orçamentos:", budgetsError);
    }

    if (budgets) {
      fetchedBudgets = budgets.map(mapBudgetFromSupabase);
      const localBudgetsStr = localStorage.getItem(STORAGE_KEY_BUDGETS);
      let allBudgets: Budget[] = localBudgetsStr ? JSON.parse(localBudgetsStr) : [];
      const otherBudgets = allBudgets.filter(b => String(b.companyId) !== String(companyId));
      const currentCompanyLocalBudgets = allBudgets.filter(b => String(b.companyId) === String(companyId));
      
      // Merge: keep local budgets that are not in the fetched list (unsynced)
      // Mas apenas se forem muito recentes (criados no último minuto), 
      // para evitar que orçamentos excluídos em outros dispositivos reapareçam.
      const oneMinuteAgo = new Date(Date.now() - 60 * 1000).toISOString();
      const mergedBudgets = [...fetchedBudgets];
      
      currentCompanyLocalBudgets.forEach(lb => {
        if (!mergedBudgets.some(mb => mb.id === lb.id)) {
          // Se não está no Supabase, mas é local, só mantemos se for "novo" (possivelmente ainda não sincronizado)
          const isNew = lb.createdAt && lb.createdAt > oneMinuteAgo;
          if (isNew) {
            console.log(`[Hydrate] Mantendo orçamento local não sincronizado: ${lb.id}`);
            mergedBudgets.push(lb);
          } else {
            console.log(`[Hydrate] Removendo orçamento local que não existe mais no Supabase: ${lb.id}`);
          }
        }
      });
      
      safeSetItem(STORAGE_KEY_BUDGETS, JSON.stringify([...otherBudgets, ...mergedBudgets]));
      fetchedBudgets = mergedBudgets;
    }

    // 3. Hidratar Mensagens de Suporte
    console.log(`[Hydrate] Buscando mensagens para a empresa ${companyId}...`);
    const { data: messages, error: messagesError } = await fetchResilient('messages', companyId, undefined, '*');
    
    if (messagesError) {
      console.warn("[Hydrate] Erro ao buscar mensagens:", messagesError);
    }

    if (messages) {
      fetchedMessages = messages.map(mapMessageFromSupabase);
      const localMsgsStr = localStorage.getItem(STORAGE_KEY_MESSAGES);
      let allMessages: SupportMessage[] = localMsgsStr ? JSON.parse(localMsgsStr) : [];
      const otherMessages = allMessages.filter(m => String(m.companyId) !== String(companyId));
      const currentCompanyLocalMessages = allMessages.filter(m => String(m.companyId) === String(companyId));
      
      // Merge: preserve local messages that are not in the fetched list
      const mergedMessages = [...fetchedMessages];
      
      currentCompanyLocalMessages.forEach(lm => {
        if (!mergedMessages.some(mm => String(mm.id) === String(lm.id))) {
          mergedMessages.push(lm);
          // Se a mensagem existe localmente mas ainda não está no Supabase, sincroniza com a nuvem
          syncToCloud('messages', lm).catch(e => console.warn('[Hydrate] Erro ao re-sincronizar mensagem local:', e));
        }
      });
      
      safeSetItem(STORAGE_KEY_MESSAGES, JSON.stringify([...otherMessages, ...mergedMessages]));
      fetchedMessages = mergedMessages;
    }

    // 4. Hidratar Pedidos da Loja
    console.log(`[Hydrate] Buscando pedidos da loja para a empresa ${companyId}...`);
    const { data: storeOrders, error: ordersError } = await fetchResilient('store_orders', companyId, undefined, '*');

    if (ordersError) {
      console.warn("[Hydrate] Erro ao buscar pedidos:", ordersError);
    }

    if (storeOrders) {
      fetchedOrders = storeOrders.map(mapOrderFromSupabase);
      const localOrdersStr = localStorage.getItem(STORAGE_KEY_STORE_ORDERS);
      let allOrders: StoreOrder[] = localOrdersStr ? JSON.parse(localOrdersStr) : [];
      const otherOrders = allOrders.filter(o => String(o.companyId) !== String(companyId));
      const currentCompanyLocalOrders = allOrders.filter(o => String(o.companyId) === String(companyId));
      
      // Merge: keep local orders that are not in the fetched list (unsynced)
      // Mas apenas se forem muito recentes (criados no último minuto)
      const oneMinuteAgo = new Date(Date.now() - 60 * 1000).toISOString();
      const mergedOrders = [...fetchedOrders];
      
      currentCompanyLocalOrders.forEach(lo => {
        if (!mergedOrders.some(mo => mo.id === lo.id)) {
          const isNew = lo.createdAt && lo.createdAt > oneMinuteAgo;
          if (isNew) {
            mergedOrders.push(lo);
          }
        }
      });
      
      safeSetItem(STORAGE_KEY_STORE_ORDERS, JSON.stringify([...otherOrders, ...mergedOrders]));
      fetchedOrders = mergedOrders;
    }

    // 5. Hidratar Produtos (apenas se necessário)
    const now = new Date().getTime();
    if (!lastFetch['products'] || (now - lastFetch['products'] > CACHE_TTL)) {
      const { data: products, error: prodError } = await safeFetch<any[]>(supabase.from('products').select('*'));
      if (prodError) {
        console.warn("[Hydrate] Erro ao buscar produtos:", prodError);
      }
      if (products && products.length > 0) {
        lastFetch['products'] = now;
        safeSetItem(STORAGE_KEY_PRODUCTS, JSON.stringify(products));
      }
    }

    // 6. Hidratar Transações
    console.log(`[Hydrate] Buscando transações para a empresa ${companyId}...`);
    const { data: transactions } = await fetchResilient('transactions', companyId, undefined, '*');
    
    if (transactions) {
      const localTransStr = localStorage.getItem(STORAGE_KEY_TRANSACTIONS);
      let allTrans: Transaction[] = localTransStr ? JSON.parse(localTransStr) : [];
      const otherTrans = allTrans.filter(t => String(t.companyId) !== String(companyId));
      safeSetItem(STORAGE_KEY_TRANSACTIONS, JSON.stringify([...otherTrans, ...transactions]));
    }

    // 7. Hidratar Cupons (apenas se necessário)
    if (!lastFetch['coupons'] || (now - lastFetch['coupons'] > CACHE_TTL)) {
      const { data: coupons } = await safeFetch<any[]>(supabase.from('coupons').select('id, code, discount_percentage, active, created_at'));
      if (coupons) {
        lastFetch['coupons'] = now;
        safeSetItem(STORAGE_KEY_COUPONS, JSON.stringify(coupons));
      }
    }
    
    // 8. Hidratar Vagas de Trabalho
    let fetchedJobOffers: JobOffer[] = getStoredJobOffers(companyId);
    try {
      console.log(`[Hydrate] Buscando vagas de trabalho para a empresa ${companyId}...`);
      const { data: jobOffersRemote } = await fetchResilient('job_offers', companyId, undefined, '*');
      const allJobs = getStoredJobOffers();
      const currentCompanyLocalJobs = allJobs.filter(j => String(j.companyId) === String(companyId));
      const otherJobs = allJobs.filter(j => String(j.companyId) !== String(companyId));

      if (jobOffersRemote && Array.isArray(jobOffersRemote)) {
        const mapped = jobOffersRemote.map(mapJobOfferFromSupabase);
        // Apenas manter vagas locais não sincronizadas (rascunhos offline)
        const unsyncedLocal = currentCompanyLocalJobs.filter(lj => (lj as any).synced === false && !mapped.some(m => String(m.id) === String(lj.id)));
        const finalCompanyJobs = [...mapped, ...unsyncedLocal];
        safeSetItem(STORAGE_KEY_JOB_OFFERS, JSON.stringify([...otherJobs, ...finalCompanyJobs]));
        fetchedJobOffers = finalCompanyJobs;
      }
    } catch (e) {
      console.warn("[Hydrate] Aviso ao carregar vagas de trabalho remota:", e);
    }
    
    // 9. Consolidar e Hidratar Categorias de Serviços Customizados da Empresa
    try {
      const customServicesList: { id: string; name: string }[] = [];
      const customServicesIds: string[] = [];

      const addCustomService = (id: string, name: string) => {
        if (!id || !name) return;
        const norm = id.toLowerCase();
        if (!customServicesIds.includes(norm)) {
          customServicesIds.push(norm);
          customServicesList.push({ id, name });
        }
      };

      // a. Do objeto companyData / mappedCompany
      if (mappedCompany?.customServices && Array.isArray(mappedCompany.customServices)) {
        mappedCompany.customServices.forEach(cs => addCustomService(cs.id, cs.name));
      }

      // b. Da tabela 'company_services' no Supabase
      const { data: cloudServices } = await safeFetch<any[]>(
        supabase.from('company_services').select('*').eq('company_id', companyId)
      );
      if (cloudServices && Array.isArray(cloudServices)) {
        cloudServices.forEach((s: any) => {
          const sId = s.service_id || s.name || (s.id ? String(s.id).replace(`${companyId}_`, '') : null);
          const sName = s.name || sId;
          if (sId && sName) addCustomService(sId, sName);
        });
      }

      // c. Dos orçamentos buscados no Supabase para esta empresa
      if (fetchedBudgets && Array.isArray(fetchedBudgets)) {
        fetchedBudgets.forEach(b => {
          if (b.servicesSelected && Array.isArray(b.servicesSelected)) {
            b.servicesSelected.forEach(sId => addCustomService(sId, sId));
          }
        });
      }

      // d. Do cache do localStorage anterior
      const storedLocalCats = localStorage.getItem('atrios_custom_service_categories');
      if (storedLocalCats) {
        try {
          const parsedLocal = JSON.parse(storedLocalCats);
          if (Array.isArray(parsedLocal)) {
            parsedLocal.forEach((cs: any) => addCustomService(cs.id || cs.name, cs.name || cs.id));
          }
        } catch (e) {}
      }

      if (customServicesList.length > 0) {
        if (mappedCompany) {
          mappedCompany.customServices = customServicesList;
          const companies = getStoredCompanies();
          const idx = companies.findIndex(c => String(c.id) === String(companyId));
          if (idx > -1) {
            companies[idx] = mappedCompany;
            safeSetItem(STORAGE_KEY_COMPANIES, JSON.stringify(companies));
          }
        }
        safeSetItem('atrios_custom_service_categories', JSON.stringify(customServicesList));
      }
    } catch (e) {
      console.warn("[Hydrate] Erro ao consolidar serviços customizados:", e);
    }
    
    return { budgets: fetchedBudgets, orders: fetchedOrders, messages: fetchedMessages, customOrders: fetchedCustomOrders, jobOffers: fetchedJobOffers };
  } catch (err) {
    console.warn("Falha ao recuperar dados remotos (esperado em modo offline/sandboxed):", err);
    return { budgets: fetchedBudgets, orders: fetchedOrders, messages: fetchedMessages, customOrders: fetchedCustomOrders, jobOffers: getStoredJobOffers(companyId) };
  }
};

export const saveSession = (companyId: string | null, view?: string, activeTab?: string, currencyCode?: string) => {
  const finalView = view || (getSession()?.view) || 'landing';
  
  if (finalView === 'landing' || (!companyId && finalView !== 'master' && finalView !== 'login' && finalView !== 'signup' && finalView !== 'verify')) {
    localStorage.removeItem(STORAGE_KEY_SESSION);
    return;
  }
  
  const session = getSession() || { companyId: null, view: 'landing', activeTab: 'dashboard', currencyCode: 'EUR' };
  safeSetItem(STORAGE_KEY_SESSION, JSON.stringify({
    ...session,
    companyId: companyId || null,
    view: finalView,
    activeTab: activeTab || session.activeTab || 'dashboard',
    currencyCode: currencyCode || session.currencyCode || 'EUR'
  }));
};

export const getSession = (): { companyId: string | null; view: string; activeTab: string; currencyCode: string } | null => {
  const data = localStorage.getItem(STORAGE_KEY_SESSION);
  return data ? JSON.parse(data) : null;
};

export const fetchCompanyForVerification = async (companyId: string): Promise<Company | null> => {
  if (!companyId) return null;
  
  // First check local storage companies
  const localCompanies = getStoredCompanies();
  const localMatch = localCompanies.find(c => String(c.id) === String(companyId));
  
  try {
    let { data: companyData, error } = await safeFetch<any>(supabase.from('companies').select('*').eq('id', companyId).single());
    if (error && (error.code === 'PGRST204' || error.message?.includes('column'))) {
      const { data: fallbackData } = await safeFetch<any>(supabase.from('companies').select('*').eq('company_id', companyId).single());
      if (fallbackData) companyData = fallbackData;
    }
    if (companyData) {
      const mapped = mapCompanyFromSupabase(companyData);
      if (localMatch) {
        if (!mapped.website && localMatch.website) mapped.website = localMatch.website;
        if (!mapped.qrCode && localMatch.qrCode) mapped.qrCode = localMatch.qrCode;
      }
      return mapped;
    }
  } catch (err) {
    console.warn('[Verification] Failed to fetch remote company, falling back to local:', err);
  }

  return localMatch || null;
};

