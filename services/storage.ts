import { Company, Budget, PlanType, GlobalNotification, SupportMessage, Transaction, Coupon, StoreOrder, Product, CustomOrderRequest, JobOffer, JobOfferStatus, Candidate, HeroVideoConfig, HeroVideoType, ActionVideoConfig, ActionVideoType, ClientServiceRequest, ServiceCategory, ClientRequestStatus, IntroBannerItem, Worker, WorkTimeLog } from '../types';
import { syncToCloud, supabase, safeFetch } from './supabase';

export const safeGetItem = (key: string): string | null => {
  try {
    return localStorage.getItem(key);
  } catch (e) {
    console.warn(`[Storage] Erro ao ler '${key}' do localStorage:`, e);
    return null;
  }
};

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
const STORAGE_KEY_HERO_VIDEO = 'atrios_hero_video_config';
const STORAGE_KEY_ACTION_VIDEO = 'atrios_action_video_config';
export const STORAGE_KEY_INTRO_BANNERS = 'atrios_intro_banners';

/**
 * Helper para salvar no localStorage com tratamento avançado de erro de cota excedida.
 */
export const safeSetItem = (key: string, value: string) => {
  try {
    localStorage.setItem(key, value);
  } catch (e) {
    if (
      e instanceof DOMException &&
      (e.code === 22 ||
        e.code === 1014 ||
        e.name === 'QuotaExceededError' ||
        e.name === 'NS_ERROR_DOM_QUOTA_REACHED')
    ) {
      console.warn(`[Storage] Cota do LocalStorage excedida ao salvar '${key}'. Aplicando estratégia de otimização e limpeza...`);

      // 1. Tenta remover dados temporários ou menos críticos
      const disposableKeys = [
        'atrios_notifications',
        'atrios_messages',
        'atrios_transactions',
        'atrios_pdf_downloads',
        'atrios_intro_banners',
        'atrios_action_video_config',
        'atrios_hero_video_config'
      ];

      for (const k of disposableKeys) {
        if (k !== key) {
          try {
            localStorage.removeItem(k);
          } catch {}
        }
      }

      // Tenta salvar após remover chaves descartáveis
      try {
        localStorage.setItem(key, value);
        console.log(`[Storage] Salvo com sucesso para '${key}' após limpeza de cache secundário.`);
        return;
      } catch {}

      // 2. Se o valor for um JSON com array ou fotos pesadas em base64, comprime/higieniza
      let compactedValue = value;
      try {
        const parsed = JSON.parse(value);
        if (Array.isArray(parsed)) {
          // Mantém os 25 registos mais recentes e reduz fotos em base64
          const sanitized = parsed.slice(0, 25).map((item: any) => {
            if (item && typeof item === 'object') {
              const copy = { ...item };
              if (Array.isArray(copy.photos)) {
                // Remove fotos base64 pesadas (>20KB) do cache local
                copy.photos = copy.photos.filter((p: any) => typeof p === 'string' && (p.startsWith('http') || p.length < 20000));
              }
              if (copy.projectFiles && Array.isArray(copy.projectFiles)) {
                copy.projectFiles = copy.projectFiles.slice(0, 2).map((f: any) => ({
                  name: f.name || 'Ficheiro',
                  size: f.size || 0
                }));
              }
              return copy;
            }
            return item;
          });

          compactedValue = JSON.stringify(sanitized);
          localStorage.setItem(key, compactedValue);
          console.log(`[Storage] Salvo com sucesso para '${key}' após compactação dos dados.`);
          return;
        }
      } catch (jsonErr) {
        // Se falhar o parse, continua para limpeza profunda
      }

      // 3. Se ainda exceder, remove todas as fotos de itens no array e tenta salvar
      try {
        const parsed = JSON.parse(compactedValue);
        if (Array.isArray(parsed)) {
          const stripped = parsed.slice(0, 20).map((item: any) => {
            if (item && typeof item === 'object') {
              const copy = { ...item };
              if (Array.isArray(copy.photos)) {
                copy.photos = copy.photos.filter((p: any) => typeof p === 'string' && p.startsWith('http'));
              }
              return copy;
            }
            return item;
          });
          const strippedValue = JSON.stringify(stripped);
          localStorage.setItem(key, strippedValue);
          console.log(`[Storage] Salvo com sucesso para '${key}' com dados compactados sem mídia pesada.`);
          return;
        }
      } catch {}

      // 4. Limpeza profunda de outras coleções com dados pesados
      try {
        for (let i = localStorage.length - 1; i >= 0; i--) {
          const storageKey = localStorage.key(i);
          if (storageKey && storageKey !== key && storageKey.startsWith('atrios_')) {
            try {
              const itemVal = localStorage.getItem(storageKey);
              if (itemVal && itemVal.length > 200000) {
                localStorage.removeItem(storageKey);
              }
            } catch {}
          }
        }
        localStorage.setItem(key, compactedValue);
        console.log(`[Storage] Salvo com sucesso para '${key}' após limpeza profunda.`);
      } catch (finalError) {
        console.warn(`[Storage] Aviso: Não foi possível persistir no LocalStorage para '${key}' devido ao limite do navegador. Os dados continuam disponíveis na sessão e na nuvem.`);
      }
    } else {
      console.warn(`[Storage] Erro ao salvar no LocalStorage para '${key}':`, e);
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

  const rawFirstLogin = raw.firstLoginAt || raw.first_login_at || raw.firstloginat || localComp?.firstLoginAt || rawLastSeen;

  const mapped: Company = {
    ...localComp,
    ...raw,
    id: String(raw.id || raw.company_id || raw.companyid || localComp?.id || ''),
    name: (raw.name || raw.company_name || localComp?.name || 'Empresa').trim() || localComp?.name || 'Empresa',
    email: raw.email || localComp?.email || '',
    password: raw.password || localComp?.password || '',
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
    firstLoginAt: rawFirstLogin,
    first_login_at: rawFirstLogin,
    lastSeenAt: rawLastSeen || localComp?.lastSeenAt,
    last_seen_at: rawLastSeen || (localComp as any)?.last_seen_at,
    isManual: Boolean(raw.isManual || raw.is_manual || localComp?.isManual),
    canEditSensitiveData: canEdit,
    unlockRequested: unlockReq,
    isBlocked: Boolean(raw.isBlocked || raw.is_blocked || localComp?.isBlocked),
    verified: raw.verified !== undefined ? Boolean(raw.verified) : (localComp?.verified !== undefined ? localComp.verified : true),
    customServices: parsedCustomServices,
    masterNotes: raw.masterNotes || raw.master_notes || raw.masternotes || localComp?.masterNotes || ''
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
  
  // Sincroniza em background com o servidor Express híbrido (para contingência quando o Supabase excede a cota)
  try {
    fetch('/api/hybrid/sync-company', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ company: updatedCompany })
    }).catch(err => console.warn('[Hybrid] Erro ao sincronizar com servidor híbrido:', err));
  } catch (e) {}

  // Sincroniza plano e dados sensíveis com Supabase (se a cota permitir)
  try {
    return await syncToCloud('companies', updatedCompany);
  } catch (cloudErr) {
    console.warn('[Storage] Falha ao enviar para Supabase (cota ou rede), dados preservados localmente:', cloudErr);
    return { success: false, error: cloudErr };
  }
};

export const checkHybridAuth = async (email: string, password: string): Promise<Company | null> => {
  try {
    const res = await fetch('/api/hybrid/auth-check', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (data && data.success && data.company) {
      return mapCompanyFromSupabase(data.company);
    }
  } catch (err) {
    console.warn('[Hybrid Engine] checkHybridAuth error:', err);
  }
  return null;
};

export const saveCustomServiceToCloud = async (companyId: string, service: { id: string; name: string; description?: string }) => {
  if (!companyId || !service?.id) return;
  try {
    const record = {
      id: `${companyId}_${service.id.toLowerCase()}`,
      company_id: companyId,
      name: service.name,
      description: service.description || '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    // Sincroniza prioritariamente com a tabela service_categories
    await safeFetch(supabase.from('service_categories').upsert(record));
    // Sincroniza também com company_services para compatibilidade
    await safeFetch(supabase.from('company_services').upsert({
      id: record.id,
      company_id: companyId,
      service_id: service.id,
      name: service.name,
      created_at: record.created_at
    }));
  } catch (e) {
    console.warn("[Storage] Erro ao sincronizar serviço para service_categories:", e);
  }
};

export const removeCustomServiceFromCloud = async (companyId: string, serviceId: string) => {
  if (!companyId || !serviceId) return;
  try {
    const recId = `${companyId}_${serviceId.toLowerCase()}`;
    await safeFetch(
      supabase.from('service_categories')
        .delete()
        .eq('company_id', companyId)
        .or(`id.eq.${recId},name.ilike.${serviceId}`)
    );
    await safeFetch(
      supabase.from('company_services')
        .delete()
        .eq('company_id', companyId)
        .or(`id.eq.${recId},service_id.eq.${serviceId}`)
    );
  } catch (e) {
    console.warn("[Storage] Erro ao remover serviço de service_categories:", e);
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
  const cJson = j.candidatesJson || j.candidates_json || j.candidatesjson;

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
  if (cJson) {
    if (typeof cJson === 'object') {
      mapped.candidatesJson = JSON.stringify(cJson);
    } else {
      mapped.candidatesJson = String(cJson);
    }
  } else {
    mapped.candidatesJson = '';
  }
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
    candidates_json: offer.candidatesJson || null,
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
      // Se a tabela não existe no Supabase (404/PGRST205), cancela tentativas adicionais
      if (error.code === 'PGRST205' || status === 404 || error.message?.includes('schema cache') || error.message?.includes('Could not find the table')) {
        return { data: null, error };
      }

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
    
    if (!companyData || companyError) {
      console.warn(`[Hydrate] Supabase offline, sem cota ou empresa ${companyId} indisponível na nuvem. Preservando 100% dos dados locais em Modo Híbrido.`);
      // NUNCA apagar os dados locais por falha na nuvem
      return { 
        budgets: fetchedBudgets, 
        orders: fetchedOrders, 
        messages: fetchedMessages, 
        customOrders: fetchedCustomOrders, 
        jobOffers: getStoredJobOffers(companyId) 
      }; 
    }

    let mappedCompany: Company | null = null;
    if (companyData) {
      // Mapeamento de campos da empresa
      mappedCompany = mapCompanyFromSupabase(companyData);
      
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
          // Preservar orçamentos locais que foram criados offline ou enquanto o Supabase estava com cota excedida
          console.log(`[Hydrate] Preservando orçamento local em modo híbrido: ${lb.id}`);
          mergedBudgets.push(lb);
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

    // 8.5 Hidratar Candidatos da Tabela Remote
    try {
      const { data: remoteCandidates } = await safeFetch<any[]>(supabase.from('candidates').select('*'));
      if (remoteCandidates && Array.isArray(remoteCandidates)) {
        const mappedCand = remoteCandidates.map(mapCandidateFromSupabase);
        const localCandidates = getStoredCandidates();
        const candMap = new Map<string, Candidate>();
        localCandidates.forEach(cand => candMap.set(String(cand.id), cand));
        mappedCand.forEach(cand => candMap.set(String(cand.id), cand));
        safeSetItem(STORAGE_KEY_CANDIDATES, JSON.stringify(Array.from(candMap.values())));
      }
    } catch (e) {
      console.warn("[Hydrate] Erro ao carregar candidatos remotos:", e);
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

      // b. Da tabela 'service_categories' no Supabase (isolado por company_id)
      const { data: cloudCategories } = await safeFetch<any[]>(
        supabase.from('service_categories').select('*').eq('company_id', companyId)
      );
      if (cloudCategories && Array.isArray(cloudCategories)) {
        cloudCategories.forEach((s: any) => {
          const sId = s.id ? String(s.id).replace(`${companyId}_`, '') : (s.name || null);
          const sName = s.name || sId;
          if (sId && sName) addCustomService(sId, sName);
        });
      }

      // c. Da tabela 'company_services' no Supabase
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

      // d. Dos orçamentos buscados no Supabase para esta empresa
      if (fetchedBudgets && Array.isArray(fetchedBudgets)) {
        fetchedBudgets.forEach(b => {
          if (b.servicesSelected && Array.isArray(b.servicesSelected)) {
            b.servicesSelected.forEach(sId => addCustomService(sId, sId));
          }
        });
      }

      // e. Do cache do localStorage da própria empresa
      const storedLocalCats = localStorage.getItem(`atrios_custom_service_categories_${companyId}`) || localStorage.getItem('atrios_custom_service_categories');
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
        safeSetItem(`atrios_custom_service_categories_${companyId}`, JSON.stringify(customServicesList));
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

const STORAGE_KEY_CANDIDATES = 'atrios_candidates';

export const getStoredCandidates = (jobOfferId?: string): Candidate[] => {
  const data = localStorage.getItem(STORAGE_KEY_CANDIDATES);
  const candidates: Candidate[] = data ? JSON.parse(data) : [];
  if (jobOfferId) {
    return candidates.filter(c => String(c.jobOfferId) === String(jobOfferId));
  }
  return candidates;
};

export const mapCandidateFromSupabase = (c: any): Candidate => {
  let jobOfferId = String(c.job_offer_id || c.jobOfferId || c.job_id || c.jobId || c.jobofferid || '');
  let rawCoverLetter = String(c.cover_letter || c.coverLetter || '');

  // Extrai jobOfferId embutido no cover_letter se a coluna da tabela não existir ou estiver vazia
  const match = rawCoverLetter.match(/\[JOB_OFFER_ID:(.+?)\]/);
  if (match) {
    if (!jobOfferId) {
      jobOfferId = match[1].trim();
    }
    rawCoverLetter = rawCoverLetter.replace(/\[JOB_OFFER_ID:.+?\]/, '').trim();
  }

  return {
    id: String(c.id || generateShortId()),
    jobOfferId,
    full_name: String(c.full_name || c.fullName || c.name || ''),
    email: String(c.email || ''),
    phone: String(c.phone || ''),
    cover_letter: rawCoverLetter,
    has_residence_permit: Boolean(c.has_residence_permit ?? c.hasResidencePermit ?? false),
    document_type: String(c.document_type || c.documentType || ''),
    has_drivers_license: Boolean(c.has_drivers_license ?? c.hasDriversLicense ?? false),
    has_construction_experience: Boolean(c.has_construction_experience ?? c.hasConstructionExperience ?? false),
    experience_duration: String(c.experience_duration || c.experienceDuration || ''),
    photo_url: String(c.photo_url || c.photoUrl || ''),
    created_at: String(c.created_at || c.createdAt || new Date().toISOString())
  };
};

export const notifyJobOwnerNewCandidate = async (candidate: Partial<Candidate>, jobOfferId?: string, customJobOffer?: JobOffer) => {
  try {
    const targetJobId = jobOfferId || candidate.jobOfferId;
    let job: JobOffer | null = customJobOffer || null;

    if (!job && targetJobId) {
      const allJobs = getStoredJobOffers();
      job = allJobs.find(j => String(j.id) === String(targetJobId)) || null;

      if (!job) {
        const { data } = await safeFetch<any>(supabase.from('job_offers').select('*').eq('id', targetJobId).single());
        if (data) {
          job = mapJobOfferFromSupabase(data);
        }
      }
    }

    if (!job || !job.companyId) {
      console.warn('[Push Candidate] Vaga ou empresa criadora não encontrada para notificar candidato.');
      return;
    }

    const candidateName = candidate.full_name || (candidate as any).name || 'Novo Candidato';
    const specialty = job.specialty || 'Trabalho';
    const location = job.location ? ` (${job.location})` : '';

    const title = `Novo Candidato para Vaga de ${specialty}! 👷‍♂️`;
    const body = `O candidato "${candidateName}" foi atribuído à sua vaga (${specialty}${location}). Clique para ver a ficha completa!`;

    console.log(`[Push Candidate] Notificando empresa '${job.companyId}' sobre o candidato '${candidateName}'...`);

    // 1. Notificação Push no servidor (Web Push VAPID + Firebase FCM)
    fetch('/api/push/notify-user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        companyId: job.companyId,
        title,
        body
      })
    }).catch(err => console.warn('[Push Candidate Error]', err));

    // 2. Transmissão em tempo real via Supabase Realtime Channel
    try {
      const channel = supabase.channel(`company-job-offers-${job.companyId}`);
      channel.send({
        type: 'broadcast',
        event: 'new-candidate-push',
        payload: {
          jobId: job.id,
          jobSpecialty: job.specialty,
          candidateName,
          title,
          body,
          createdAt: new Date().toISOString()
        }
      }).catch(err => console.warn('[Realtime Candidate Error]', err));
    } catch (rtErr) {
      console.warn('[Realtime Candidate Exception]', rtErr);
    }
  } catch (err) {
    console.error('[notifyJobOwnerNewCandidate Exception]', err);
  }
};

export const saveCandidate = async (candidate: Candidate, skipNotification = false): Promise<{ success: boolean; error?: any }> => {
  try {
    const candidates = getStoredCandidates();
    const existingIndex = candidates.findIndex(c => String(c.id) === String(candidate.id));
    const isNew = existingIndex === -1;

    if (existingIndex >= 0) {
      candidates[existingIndex] = candidate;
    } else {
      candidates.push(candidate);
    }
    safeSetItem(STORAGE_KEY_CANDIDATES, JSON.stringify(candidates));

    let coverLetterToSend = String(candidate.cover_letter || '');
    if (candidate.jobOfferId && !coverLetterToSend.includes('[JOB_OFFER_ID:')) {
      coverLetterToSend = (coverLetterToSend ? coverLetterToSend + '\n\n' : '') + `[JOB_OFFER_ID:${candidate.jobOfferId}]`;
    }

    const payload = {
      id: String(candidate.id),
      job_offer_id: String(candidate.jobOfferId || ''),
      full_name: String(candidate.full_name || ''),
      email: String(candidate.email || ''),
      phone: String(candidate.phone || ''),
      cover_letter: coverLetterToSend,
      has_residence_permit: Boolean(candidate.has_residence_permit),
      document_type: String(candidate.document_type || ''),
      has_drivers_license: Boolean(candidate.has_drivers_license),
      has_construction_experience: Boolean(candidate.has_construction_experience),
      experience_duration: String(candidate.experience_duration || ''),
      photo_url: String(candidate.photo_url || ''),
      created_at: candidate.created_at || new Date().toISOString()
    };

    const result = await syncToCloud('candidates', payload);

    if (isNew && !skipNotification && candidate.jobOfferId) {
      notifyJobOwnerNewCandidate(candidate, candidate.jobOfferId);
    }

    return result;
  } catch (err) {
    console.error('saveCandidate error:', err);
    return { success: false, error: err };
  }
};

export const deleteCandidate = async (id: string): Promise<{ success: boolean; error?: any }> => {
  try {
    const candidates = getStoredCandidates().filter(c => String(c.id) !== String(id));
    safeSetItem(STORAGE_KEY_CANDIDATES, JSON.stringify(candidates));
    const { error } = await safeFetch<any>(supabase.from('candidates').delete().eq('id', String(id)));
    return { success: !error, error };
  } catch (err) {
    return { success: false, error: err };
  }
};

/**
 * Utilitário para extrair o ID de vídeo do YouTube a partir de múltiplos formatos de link
 */
export const extractYouTubeId = (url: string): string | null => {
  if (!url || typeof url !== 'string') return null;
  const trimmed = url.trim();
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return trimmed;
  }
  const regExp = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|shorts)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
  const match = trimmed.match(regExp);
  return match && match[1] ? match[1] : null;
};

export const DEFAULT_HERO_VIDEO_CONFIG: HeroVideoConfig = {
  type: 'default',
  youtubeUrl: '',
  youtubeId: '',
  videoUrl: '',
  title: 'Demonstração Átrios Build',
  autoPlay: true,
  muted: true,
  loop: true,
  showControls: true
};

export const getStoredHeroVideoConfig = (): HeroVideoConfig => {
  try {
    const data = localStorage.getItem(STORAGE_KEY_HERO_VIDEO);
    if (!data) return DEFAULT_HERO_VIDEO_CONFIG;
    const parsed = JSON.parse(data);
    return {
      ...DEFAULT_HERO_VIDEO_CONFIG,
      ...parsed
    };
  } catch (err) {
    console.error('Error reading hero video config from storage:', err);
    return DEFAULT_HERO_VIDEO_CONFIG;
  }
};

export const saveHeroVideoConfig = async (config: HeroVideoConfig): Promise<{ success: boolean; error?: any }> => {
  try {
    const enrichedConfig: HeroVideoConfig = {
      ...config,
      updatedAt: new Date().toISOString()
    };

    if (enrichedConfig.type === 'youtube' && enrichedConfig.youtubeUrl) {
      const extractedId = extractYouTubeId(enrichedConfig.youtubeUrl);
      if (extractedId) {
        enrichedConfig.youtubeId = extractedId;
      }
    }

    safeSetItem(STORAGE_KEY_HERO_VIDEO, JSON.stringify(enrichedConfig));

    // Broadcast across windows/tabs and local listeners
    try {
      window.dispatchEvent(new CustomEvent('atrios_hero_video_changed', { detail: enrichedConfig }));
      if ('BroadcastChannel' in window) {
        const bc = new BroadcastChannel('atrios_hero_video_channel');
        bc.postMessage(enrichedConfig);
        bc.close();
      }
    } catch (e) {
      console.warn('Broadcast hero video event error:', e);
    }

    // Try persisting to cloud sync as well (optional global config table)
    try {
      await syncToCloud('app_settings', {
        id: 'hero_video_config',
        config_data: JSON.stringify(enrichedConfig),
        updated_at: enrichedConfig.updatedAt
      });
    } catch (cloudErr) {
      // Ignorable if app_settings table does not exist
    }

    return { success: true };
  } catch (err) {
    console.error('saveHeroVideoConfig error:', err);
    return { success: false, error: err };
  }
};

export const resetHeroVideoConfig = async (): Promise<{ success: boolean; error?: any }> => {
  return await saveHeroVideoConfig(DEFAULT_HERO_VIDEO_CONFIG);
};

// ==========================================
// CONFIGURAÇÕES DO VÍDEO "VEJA EM AÇÃO" (60s)
// ==========================================

export const DEFAULT_ACTION_VIDEO_CONFIG: ActionVideoConfig = {
  type: 'default',
  youtubeUrl: '',
  youtubeId: '',
  videoUrl: '',
  title: 'Veja como funciona em 60 segundos',
  autoPlay: false,
  muted: false,
  loop: false,
  showControls: true
};

export const getStoredActionVideoConfig = (): ActionVideoConfig => {
  try {
    const data = localStorage.getItem(STORAGE_KEY_ACTION_VIDEO);
    if (!data) return DEFAULT_ACTION_VIDEO_CONFIG;
    const parsed = JSON.parse(data);
    return {
      ...DEFAULT_ACTION_VIDEO_CONFIG,
      ...parsed
    };
  } catch (err) {
    console.error('Error reading action video config from storage:', err);
    return DEFAULT_ACTION_VIDEO_CONFIG;
  }
};

export const saveActionVideoConfig = async (config: ActionVideoConfig): Promise<{ success: boolean; error?: any }> => {
  try {
    const enrichedConfig: ActionVideoConfig = {
      ...config,
      updatedAt: new Date().toISOString()
    };

    if (enrichedConfig.type === 'youtube' && enrichedConfig.youtubeUrl) {
      const extractedId = extractYouTubeId(enrichedConfig.youtubeUrl);
      if (extractedId) {
        enrichedConfig.youtubeId = extractedId;
      }
    }

    safeSetItem(STORAGE_KEY_ACTION_VIDEO, JSON.stringify(enrichedConfig));

    // Broadcast across windows/tabs and local listeners
    try {
      window.dispatchEvent(new CustomEvent('atrios_action_video_changed', { detail: enrichedConfig }));
      if ('BroadcastChannel' in window) {
        const bc = new BroadcastChannel('atrios_action_video_channel');
        bc.postMessage(enrichedConfig);
        bc.close();
      }
    } catch (e) {
      console.warn('Broadcast action video event error:', e);
    }

    // Try persisting to cloud sync as well
    try {
      await syncToCloud('app_settings', {
        id: 'action_video_config',
        config_data: JSON.stringify(enrichedConfig),
        updated_at: enrichedConfig.updatedAt
      });
    } catch (cloudErr) {
      // Ignorable if table does not exist
    }

    return { success: true };
  } catch (err) {
    console.error('saveActionVideoConfig error:', err);
    return { success: false, error: err };
  }
};

export const resetActionVideoConfig = async (): Promise<{ success: boolean; error?: any }> => {
  return await saveActionVideoConfig(DEFAULT_ACTION_VIDEO_CONFIG);
};

// ==========================================
// CLIENT SERVICE REQUESTS (PEDIDOS DE ORÇAMENTO / OBRAS DE PARTICULARES)
// ==========================================
export const STORAGE_KEY_CLIENT_REQUESTS = 'atrios_client_service_requests';

export const mapClientRequestFromSupabase = (item: any): ClientServiceRequest => {
  const rawBudget = item.budget_range || item.budgetRange;
  const budgetRange = (rawBudget && rawBudget !== '500€ - 2.000€') ? String(rawBudget) : undefined;

  return {
    id: String(item.id || generateShortId()),
    clientName: String(item.client_name || item.clientName || item.name || ''),
    clientEmail: String(item.client_email || item.clientEmail || item.email || ''),
    clientPhone: String(item.client_phone || item.clientPhone || item.phone || ''),
    accessCode: item.access_code || item.accessCode || undefined,
    category: (item.category || item.service_category || 'other') as ServiceCategory,
    title: String(item.title || ''),
    description: String(item.description || ''),
    location: String(item.location || item.city || ''),
    postalCode: item.postal_code || item.postalCode || undefined,
    propertyType: item.property_type || item.propertyType || undefined,
    urgency: item.urgency || undefined,
    budgetRange,
    photos: Array.isArray(item.photos) ? item.photos : (typeof item.photos === 'string' ? JSON.parse(item.photos || '[]') : []),
    status: (item.status || 'pending') as ClientRequestStatus,
    proposalsCount: Number(item.proposals_count || item.proposalsCount || 0),
    assignedCompanyId: item.assigned_company_id || item.assignedCompanyId || undefined,
    assignedCompanyName: item.assigned_company_name || item.assignedCompanyName || undefined,
    createdAt: String(item.created_at || item.createdAt || new Date().toISOString()),
    updatedAt: item.updated_at || item.updatedAt || undefined
  };
};

export const getStoredClientRequests = (): ClientServiceRequest[] => {
  const local = safeGetItem(STORAGE_KEY_CLIENT_REQUESTS);
  if (!local) return [];
  try {
    const parsed = JSON.parse(local);
    return Array.isArray(parsed) ? parsed.map(mapClientRequestFromSupabase) : [];
  } catch (e) {
    return [];
  }
};

export const fetchBudgetsFromSupabase = async (): Promise<Budget[]> => {
  try {
    const { data, error } = await safeFetch<any[]>(
      supabase.from('budgets').select('*').order('created_at', { ascending: false })
    );
    if (error || !data || !Array.isArray(data)) {
      return getAllStoredBudgets();
    }
    return data.map(mapBudgetFromSupabase);
  } catch (e) {
    return getAllStoredBudgets();
  }
};

export const saveClientRequestLocally = (requests: ClientServiceRequest[]) => {
  // Limita a 30 pedidos mais recentes e evita guardar base64 gigante no localStorage
  const sanitized = requests.slice(0, 30).map(req => ({
    ...req,
    photos: Array.isArray(req.photos) 
      ? req.photos.filter(p => typeof p === 'string' && (p.startsWith('http') || p.length < 25000))
      : []
  }));
  safeSetItem(STORAGE_KEY_CLIENT_REQUESTS, JSON.stringify(sanitized));
};

export const fetchClientRequestsFromSupabase = async (): Promise<ClientServiceRequest[]> => {
  try {
    const { data, error } = await safeFetch<any[]>(
      supabase.from('client_service_requests').select('*').order('created_at', { ascending: false })
    );

    if (error) {
      console.warn('[Storage] Erro ao buscar client_service_requests no Supabase:', error.message);
      return getStoredClientRequests();
    }

    if (data && Array.isArray(data)) {
      const mapped = data.map(mapClientRequestFromSupabase);
      saveClientRequestLocally(mapped);
      return mapped;
    }
    return getStoredClientRequests();
  } catch (err) {
    console.warn('[Storage] Exceção ao buscar client_service_requests:', err);
    return getStoredClientRequests();
  }
};

export const saveClientServiceRequest = async (
  request: Partial<ClientServiceRequest>
): Promise<{ success: boolean; data?: ClientServiceRequest; error?: any }> => {
  try {
    const rawPhone = request.clientPhone || '';
    const cleanPhone = rawPhone.replace(/\D/g, '');
    const cleanEmail = (request.clientEmail || '').trim().toLowerCase();

    // 1. Obter pedidos existentes para verificar se o cliente já tem um código de acesso
    const current = getStoredClientRequests();
    let existingAccessCode = request.accessCode;

    if (!existingAccessCode) {
      // Procurar em pedidos anteriores pelo mesmo telemóvel ou email
      const previousRequest = current.find(r => {
        const rCleanPhone = (r.clientPhone || '').replace(/\D/g, '');
        const rEmail = (r.clientEmail || '').trim().toLowerCase();
        return (
          (cleanPhone && rCleanPhone && (rCleanPhone === cleanPhone || rCleanPhone.includes(cleanPhone) || cleanPhone.includes(rCleanPhone))) ||
          (cleanEmail && rEmail && rEmail === cleanEmail)
        );
      });

      if (previousRequest && previousRequest.accessCode) {
        existingAccessCode = previousRequest.accessCode;
      } else if (cleanPhone) {
        const storedCode = localStorage.getItem(`atrios_client_code_${cleanPhone}`) || localStorage.getItem(`atrios_client_code_${rawPhone.trim()}`);
        if (storedCode) {
          existingAccessCode = storedCode;
        }
      }
    }

    // Se ainda não existir código de acesso para este cliente, gera um novo de 4 dígitos
    const accessCode = existingAccessCode || Math.floor(1000 + Math.random() * 9000).toString();

    // Guardar o código do cliente no localStorage para futuros pedidos
    if (cleanPhone) {
      localStorage.setItem(`atrios_client_code_${cleanPhone}`, accessCode);
      localStorage.setItem(`atrios_client_code_${rawPhone.trim()}`, accessCode);
    }

    // ID único exclusivo para cada solicitação (evita duplicidade)
    const newReq: ClientServiceRequest = {
      id: request.id || `REQ-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
      clientName: request.clientName || '',
      clientEmail: request.clientEmail || '',
      clientPhone: request.clientPhone || '',
      accessCode: accessCode,
      category: request.category || 'other',
      title: request.title || '',
      description: request.description || '',
      location: request.location || '',
      postalCode: request.postalCode,
      propertyType: request.propertyType,
      urgency: request.urgency,
      budgetRange: request.budgetRange,
      photos: request.photos || [],
      status: request.status || 'pending',
      proposalsCount: request.proposalsCount || 0,
      assignedCompanyId: request.assignedCompanyId,
      assignedCompanyName: request.assignedCompanyName,
      createdAt: request.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // 2. Guardar localmente
    const existingIndex = current.findIndex(r => r.id === newReq.id);
    let updated: ClientServiceRequest[];
    if (existingIndex >= 0) {
      updated = [...current];
      updated[existingIndex] = newReq;
    } else {
      updated = [newReq, ...current];
    }
    saveClientRequestLocally(updated);

    // 3. Disparar evento para a UI atualizar em tempo real
    window.dispatchEvent(new CustomEvent('atrios_client_requests_changed', { detail: newReq }));

    // 3. Sincronizar com Supabase
    try {
      const supabasePayload = {
        id: newReq.id,
        client_name: newReq.clientName,
        client_email: newReq.clientEmail,
        client_phone: newReq.clientPhone,
        access_code: newReq.accessCode,
        service_category: newReq.category,
        category: newReq.category,
        title: newReq.title,
        description: newReq.description,
        location: newReq.location,
        city: newReq.location,
        postal_code: newReq.postalCode,
        property_type: newReq.propertyType,
        urgency: newReq.urgency,
        budget_range: newReq.budgetRange,
        photos: JSON.stringify(newReq.photos || []),
        status: newReq.status,
        proposals_count: newReq.proposalsCount || 0,
        assigned_company_id: newReq.assignedCompanyId,
        assigned_company_name: newReq.assignedCompanyName,
        created_at: newReq.createdAt,
        updated_at: newReq.updatedAt
      };

      await supabase.from('client_service_requests').upsert(supabasePayload);
    } catch (sbErr) {
      console.warn('[Storage] Erro ao sincronizar client_service_requests no Supabase:', sbErr);
    }

    // 4. Notificar administradores / construtores via push e som
    try {
      fetch('/api/push/notify-all', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: `Novo Pedido de Orçamento: ${newReq.title} 🛠️`,
          body: `${newReq.clientName} em ${newReq.location} está a solicitar orçamento para "${newReq.title}". Clique para ver!`,
          url: '/'
        })
      }).catch(() => {});
    } catch (e) {}

    return { success: true, data: newReq };
  } catch (err) {
    console.error('saveClientServiceRequest error:', err);
    return { success: false, error: err };
  }
};

export const deleteClientServiceRequest = async (id: string): Promise<{ success: boolean; error?: any }> => {
  try {
    const current = getStoredClientRequests();
    const filtered = current.filter(r => r.id !== id);
    saveClientRequestLocally(filtered);

    window.dispatchEvent(new CustomEvent('atrios_client_requests_changed', { detail: { id, deleted: true } }));

    try {
      await supabase.from('client_service_requests').delete().eq('id', id);
    } catch (e) {}

    return { success: true };
  } catch (err) {
    return { success: false, error: err };
  }
};

/**
 * Carrega as configurações da nuvem (Supabase tabela app_settings)
 * permitindo que os vídeos e preferências fiquem sincronizados para todos os visitantes.
 */
export const fetchCloudAppSettings = async () => {
  try {
    const { data, error } = await safeFetch<any[]>(
      supabase.from('app_settings').select('*')
    );

    if (error || !data || !Array.isArray(data)) return;

    data.forEach((item) => {
      if (item.id === 'hero_video_config' && item.config_data) {
        try {
          const parsed = typeof item.config_data === 'string' ? JSON.parse(item.config_data) : item.config_data;
          safeSetItem(STORAGE_KEY_HERO_VIDEO, JSON.stringify(parsed));
          window.dispatchEvent(new CustomEvent('atrios_hero_video_changed', { detail: parsed }));
        } catch (e) {
          console.warn('Error parsing cloud hero_video_config:', e);
        }
      } else if (item.id === 'action_video_config' && item.config_data) {
        try {
          const parsed = typeof item.config_data === 'string' ? JSON.parse(item.config_data) : item.config_data;
          safeSetItem(STORAGE_KEY_ACTION_VIDEO, JSON.stringify(parsed));
          window.dispatchEvent(new CustomEvent('atrios_action_video_changed', { detail: parsed }));
        } catch (e) {
          console.warn('Error parsing cloud action_video_config:', e);
        }
      }
    });
  } catch (err) {
    console.warn('fetchCloudAppSettings error:', err);
  }
};

/**
 * ============================================================================
 * FULLSCREEN INTRO BANNERS (Apresentação Inicial de Funcionalidades)
 * Tabela Supabase: intro_banners
 * ============================================================================
 */

export const DEFAULT_INTRO_BANNERS: IntroBannerItem[] = [
  {
    id: 'banner_companies',
    tag: 'PARA EMPRESAS & EMPREITEIROS',
    tagColor: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    title: 'Receba Pedidos, Crie Orçamentos em Minutos e Faça a Gestão de Obras',
    subtitle: 'A solução definitiva para construtores, técnicos e empresas de remodelação.',
    description: 'Receba pedidos reais de clientes, crie propostas em PDF com apoio de Inteligência Artificial e acompanhe cada etapa da obra.',
    imageUrl: '/banners/banner_1.jpg',
    accentColor: '#ff5722',
    highlights: [
      'Receção de pedidos qualificados na sua região',
      'Orçamentos detalhados e propostas em PDF profissional',
      'Diário de obra, fotos e cronograma de execução'
    ],
    mockupBadge: 'PAINEL EMPRESA & OBRAS',
    mockupHeadline: 'Proposta Comercial & Gestão Integrada',
    sortOrder: 0,
    active: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'banner_clients',
    tag: 'PARA CLIENTES & PROPRIETÁRIOS',
    tagColor: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    title: 'Peça Orçamentos Grátis e Encontre Profissionais de Confiança',
    subtitle: 'Publique o seu pedido em 2 passos e compare propostas transparentes.',
    description: 'Acompanhe as suas solicitações a qualquer hora com o seu Código PIN único e aprove as melhores ofertas.',
    imageUrl: '/banners/banner_2.jpg',
    accentColor: '#f59e0b',
    highlights: [
      'Pedido de orçamento simples, rápido e sem compromisso',
      'Código PIN exclusivo para consulta de propostas',
      'Comparação clara de mão de obra, materiais e prazos'
    ],
    mockupBadge: 'PORTAL DO CLIENTE',
    mockupHeadline: 'Acompanhe Orçamentos com Código PIN',
    sortOrder: 1,
    active: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'banner_workers',
    tag: 'PARA COLABORADORES & EQUIPAS',
    tagColor: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    title: 'Relógio de Ponto no Telemóvel e Controlo de Horas por Obra',
    subtitle: 'Picagem rápida por QR Code, registo de pausas e cálculo de horas extraordinárias.',
    description: 'Elimine folhas de papel. Cada colaborador regista o ponto com facilidade e os custos de mão de obra são calculados automaticamente por projeto.',
    imageUrl: '/banners/banner_3.jpg',
    accentColor: '#3b82f6',
    highlights: [
      'Picagem de ponto rápida por telemóvel ou QR Code',
      'Cálculo automático de horas normais e extraordinárias',
      'Associação direta dos custos de pessoal a cada obra'
    ],
    mockupBadge: 'PONTO ELETRÓNICO & EQUIPA',
    mockupHeadline: 'Registo de Horas & Turnos por Obra',
    sortOrder: 2,
    active: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'banner_finances',
    tag: 'GESTÃO FINANCEIRA & RENTABILIDADE',
    tagColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    title: 'Controle Pagamentos, Custos Reais e Lucro Líquido em Tempo Real',
    subtitle: 'Tenha clareza total sobre o fluxo de caixa e margens de cada projeto.',
    description: 'Gestão de adiantamentos, pagamentos faseados por auto de medição e relatórios de rentabilidade em PDF e Excel.',
    imageUrl: '/banners/banner_4.jpg',
    accentColor: '#10b981',
    highlights: [
      'Controlo de adiantamentos, sinais e valores pendentes',
      'Gestão de compras, materiais e despesas por obra',
      'Relatórios gráficos de rentabilidade e margem real'
    ],
    mockupBadge: 'SAÚDE FINANCEIRA 360°',
    mockupHeadline: 'Relatórios de Margem & Fluxo de Caixa',
    sortOrder: 3,
    active: true,
    createdAt: new Date().toISOString()
  }
];

export const mapIntroBannerFromSupabase = (raw: any): IntroBannerItem => {
  if (!raw) return raw;
  
  let highlightsArray: string[] = [];
  if (Array.isArray(raw.highlights)) {
    highlightsArray = raw.highlights;
  } else if (typeof raw.highlights === 'string') {
    try {
      const parsed = JSON.parse(raw.highlights);
      highlightsArray = Array.isArray(parsed) ? parsed : [raw.highlights];
    } catch {
      highlightsArray = raw.highlights.split('\n').filter(Boolean);
    }
  }

  let mockupDetailsArray: any[] = [];
  const rawDetails = raw.mockup_details || raw.mockupDetails;
  if (Array.isArray(rawDetails)) {
    mockupDetailsArray = rawDetails;
  } else if (typeof rawDetails === 'string') {
    try {
      mockupDetailsArray = JSON.parse(rawDetails);
    } catch {}
  }

  return {
    id: String(raw.id || raw.banner_id || `banner_${Date.now()}`),
    tag: raw.tag || raw.category || 'NOVIDADE',
    tagColor: raw.tag_color || raw.tagColor || 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    title: raw.title || '',
    subtitle: raw.subtitle || '',
    description: raw.description || raw.desc || '',
    imageUrl: raw.image_url || raw.imageUrl || raw.image || raw.photo_url || '',
    desktopImageUrl: raw.desktop_image_url || raw.desktopImageUrl || raw.desktop_image || '',
    accentColor: raw.accent_color || raw.accentColor || '#ff5722',
    highlights: highlightsArray.length > 0 ? highlightsArray : ['Funcionalidade completa', 'Interface intuitiva', 'Sincronização em nuvem'],
    mockupBadge: raw.mockup_badge || raw.mockupBadge || 'DESTAQUE',
    mockupHeadline: raw.mockup_headline || raw.mockupHeadline || raw.title || '',
    mockupDetails: mockupDetailsArray.length > 0 ? mockupDetailsArray : undefined,
    sortOrder: typeof raw.sort_order === 'number' ? raw.sort_order : (typeof raw.sortOrder === 'number' ? raw.sortOrder : (typeof raw.order_index === 'number' ? raw.order_index : 0)),
    active: raw.active !== undefined ? Boolean(raw.active) : (raw.is_active !== undefined ? Boolean(raw.is_active) : true),
    createdAt: raw.created_at || raw.createdAt || new Date().toISOString(),
    updatedAt: raw.updated_at || raw.updatedAt || new Date().toISOString()
  };
};

export const uploadBannerImageToSupabase = async (
  fileOrBlob: File | Blob,
  bannerId: string
): Promise<{ url: string; isCloudUrl: boolean }> => {
  try {
    const fileExt = (fileOrBlob instanceof File && fileOrBlob.name.split('.').pop()) || 'jpg';
    const cleanBannerId = (bannerId || 'banner').replace(/[^a-zA-Z0-9_-]/g, '_');
    const fileName = `banner_${cleanBannerId}_${Date.now()}.${fileExt}`;
    const filePath = `intro_banners/${fileName}`;

    // Tenta os buckets de armazenamento configurados no Supabase
    const candidateBuckets = ['banners', 'intro_banners', 'public', 'app_media', 'construction_photos', 'project_files'];

    for (const bucket of candidateBuckets) {
      try {
        const { data, error } = await supabase.storage.from(bucket).upload(filePath, fileOrBlob, {
          cacheControl: '3600',
          upsert: true
        });

        if (!error && data) {
          const { data: publicData } = supabase.storage.from(bucket).getPublicUrl(filePath);
          if (publicData?.publicUrl) {
            console.log(`[Storage] Imagem de banner enviada para bucket '${bucket}' no Supabase:`, publicData.publicUrl);
            return { url: publicData.publicUrl, isCloudUrl: true };
          }
        }
      } catch (bucketErr) {
        // Tenta próximo bucket
      }
    }
  } catch (e) {
    console.warn('[Storage] Erro ao tentar upload para Supabase Storage:', e);
  }

  return { url: '', isCloudUrl: false };
};

export const getStoredIntroBanners = (): IntroBannerItem[] => {
  try {
    const raw = safeGetItem(STORAGE_KEY_INTRO_BANNERS);
    if (!raw) return DEFAULT_INTRO_BANNERS;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      return DEFAULT_INTRO_BANNERS;
    }
    return parsed.sort((a: IntroBannerItem, b: IntroBannerItem) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
  } catch (e) {
    console.warn('[Storage] Erro ao carregar banners do localStorage:', e);
    return DEFAULT_INTRO_BANNERS;
  }
};

export const saveIntroBannersLocally = (banners: IntroBannerItem[]) => {
  const sorted = [...banners].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
  safeSetItem(STORAGE_KEY_INTRO_BANNERS, JSON.stringify(sorted));
  window.dispatchEvent(new CustomEvent('atrios_intro_banners_changed', { detail: sorted }));
};

export const fetchIntroBannersFromSupabase = async (): Promise<IntroBannerItem[]> => {
  try {
    const { data, error } = await safeFetch<any[]>(
      supabase.from('intro_banners').select('*').order('sort_order', { ascending: true })
    );

    let supabaseBanners: any[] | null = null;

    if (!error && data && Array.isArray(data) && data.length > 0) {
      supabaseBanners = data;
    } else {
      // Fallback sem order se a coluna sort_order for diferente
      const fallbackRes = await safeFetch<any[]>(supabase.from('intro_banners').select('*'));
      if (!fallbackRes.error && fallbackRes.data && Array.isArray(fallbackRes.data) && fallbackRes.data.length > 0) {
        supabaseBanners = fallbackRes.data;
      }
    }

    const localBanners = getStoredIntroBanners();

    if (supabaseBanners && supabaseBanners.length > 0) {
      const mappedFromCloud = supabaseBanners.map(mapIntroBannerFromSupabase).sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
      
      // Inteligente: se o banner local tiver imagem personalizada ou data mais recente, mantemos e sincronizamos
      const mergedList = mappedFromCloud.map(cloudBanner => {
        const localMatch = localBanners.find(l => l.id === cloudBanner.id);
        if (localMatch) {
          const localTime = new Date(localMatch.updatedAt || localMatch.createdAt || 0).getTime();
          const cloudTime = new Date(cloudBanner.updatedAt || cloudBanner.createdAt || 0).getTime();
          
          // Se o local tiver novos dados ainda não salvos na nuvem
          if (localTime > cloudTime && (localMatch.imageUrl !== cloudBanner.imageUrl || localMatch.desktopImageUrl !== cloudBanner.desktopImageUrl)) {
            syncToCloud('intro_banners', localMatch);
            return {
              ...cloudBanner,
              ...localMatch,
              desktopImageUrl: localMatch.desktopImageUrl || cloudBanner.desktopImageUrl || '',
              imageUrl: localMatch.imageUrl || cloudBanner.imageUrl || ''
            };
          }

          // Se a nuvem tem imagem de desktop, garante que prevalece
          return {
            ...localMatch,
            ...cloudBanner,
            desktopImageUrl: cloudBanner.desktopImageUrl || localMatch.desktopImageUrl || '',
            imageUrl: cloudBanner.imageUrl || localMatch.imageUrl || ''
          };
        }
        return cloudBanner;
      });

      // Inclui banners criados localmente que ainda não existam no Supabase
      localBanners.forEach(localBanner => {
        if (!mergedList.some(m => m.id === localBanner.id)) {
          mergedList.push(localBanner);
          syncToCloud('intro_banners', localBanner);
        }
      });

      const sorted = mergedList.sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
      saveIntroBannersLocally(sorted);
      return sorted;
    }

    // Se o Supabase estiver sem dados ou inacessível, usamos local e semeamos os banners locais para a tabela Supabase
    if (localBanners && localBanners.length > 0) {
      for (const b of localBanners) {
        syncToCloud('intro_banners', b);
      }
    }

    return localBanners;
  } catch (err) {
    console.warn('[Storage] fetchIntroBannersFromSupabase error:', err);
    return getStoredIntroBanners();
  }
};

export const saveIntroBanner = async (banner: IntroBannerItem): Promise<{ success: boolean; data?: IntroBannerItem; error?: any }> => {
  try {
    const current = getStoredIntroBanners();
    const nowIso = new Date().toISOString();

    const bannerToSave: IntroBannerItem = {
      ...banner,
      id: banner.id || `banner_${Date.now()}`,
      active: banner.active ?? true,
      sortOrder: typeof banner.sortOrder === 'number' ? banner.sortOrder : current.length,
      createdAt: banner.createdAt || nowIso,
      updatedAt: nowIso
    };

    const existingIndex = current.findIndex(b => b.id === bannerToSave.id);
    let updatedList: IntroBannerItem[];
    if (existingIndex >= 0) {
      updatedList = [...current];
      updatedList[existingIndex] = bannerToSave;
    } else {
      updatedList = [...current, bannerToSave];
    }

    saveIntroBannersLocally(updatedList);

    // Sincronizar com Supabase na tabela intro_banners usando syncToCloud (com auto-retry e suporte de colunas)
    try {
      const syncRes = await syncToCloud('intro_banners', bannerToSave);
      if (!syncRes.success) {
        console.warn('[Storage] Aviso ao sincronizar intro_banners no Supabase:', syncRes.error);
      }
    } catch (sbErr) {
      console.warn('[Storage] Falha ao sincronizar intro_banners no Supabase:', sbErr);
    }

    return { success: true, data: bannerToSave };
  } catch (err) {
    console.error('saveIntroBanner error:', err);
    return { success: false, error: err };
  }
};

export const deleteIntroBanner = async (id: string): Promise<{ success: boolean; error?: any }> => {
  try {
    const current = getStoredIntroBanners();
    const filtered = current.filter(b => b.id !== id);
    saveIntroBannersLocally(filtered);

    try {
      await supabase.from('intro_banners').delete().eq('id', id);
    } catch (e) {
      console.warn('[Storage] Erro ao deletar intro_banner no Supabase:', e);
    }

    return { success: true };
  } catch (err) {
    return { success: false, error: err };
  }
};

export const saveIntroBannersOrder = async (banners: IntroBannerItem[]): Promise<{ success: boolean }> => {
  try {
    const updated = banners.map((b, idx) => ({ ...b, sortOrder: idx, updatedAt: new Date().toISOString() }));
    saveIntroBannersLocally(updated);

    try {
      for (const banner of updated) {
        await syncToCloud('intro_banners', banner);
      }
    } catch (e) {}

    return { success: true };
  } catch (err) {
    return { success: false };
  }
};

export const resetIntroBannersToDefault = async (): Promise<{ success: boolean }> => {
  try {
    saveIntroBannersLocally(DEFAULT_INTRO_BANNERS);
    
    // Tenta salvar os defaults no Supabase
    try {
      for (const banner of DEFAULT_INTRO_BANNERS) {
        await saveIntroBanner(banner);
      }
    } catch (e) {}

    return { success: true };
  } catch (err) {
    return { success: false };
  }
};

// ==========================================
// TRABALHADORES & REGISTO DE HORAS / PONTO
// ==========================================

const getWorkersStorageKey = (companyId: string) => `atrios_workers_${companyId}`;
const getWorkLogsStorageKey = (companyId: string) => `atrios_work_logs_${companyId}`;

export const mapWorkerFromSupabase = (data: any): Worker => {
  return {
    id: String(data.id),
    companyId: String(data.company_id || data.companyId || ''),
    name: data.name || '',
    nif: data.nif || '',
    role: data.role || '',
    address: data.address || '',
    phone: data.phone || '',
    email: data.email || undefined,
    hourlyRate: data.hourly_rate !== undefined && data.hourly_rate !== null ? Number(data.hourly_rate) : (data.hourlyRate ? Number(data.hourlyRate) : undefined),
    admissionDate: data.admission_date || data.admissionDate || undefined,
    active: data.active !== undefined ? Boolean(data.active) : true,
    createdAt: data.created_at || data.createdAt || new Date().toISOString()
  };
};

export const mapWorkTimeLogFromSupabase = (data: any): WorkTimeLog => {
  return {
    id: String(data.id),
    companyId: String(data.company_id || data.companyId || ''),
    workerId: String(data.worker_id || data.workerId || ''),
    date: data.date || new Date().toISOString().split('T')[0],
    startTime: data.start_time || data.startTime || '08:00',
    coffeeBreak: data.coffee_break || data.coffeeBreak || '15 min',
    lunchBreak: data.lunch_break || data.lunchBreak || '12:00 - 13:00 (1h)',
    endTime: data.end_time || data.endTime || '17:00',
    totalHours: Number(data.total_hours ?? data.totalHours ?? 8),
    workLocation: data.work_location || data.workLocation || '',
    details: data.details || '',
    createdAt: data.created_at || data.createdAt || new Date().toISOString()
  };
};

export const getWorkers = (companyId: string): Worker[] => {
  if (!companyId) return [];
  const stored = safeGetItem(getWorkersStorageKey(companyId));
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.warn('[Storage] Erro ao carregar trabalhadores:', e);
    }
  }
  return [];
};

export const getWorkerById = (companyId: string, workerId: string): Worker | null => {
  if (!companyId || !workerId) return null;
  const workers = getWorkers(companyId);
  return workers.find(w => w.id === workerId) || null;
};

export const fetchWorkerById = async (companyId: string, workerId: string): Promise<Worker | null> => {
  if (!companyId || !workerId) return null;
  const local = getWorkerById(companyId, workerId);
  try {
    const { data, error } = await supabase
      .from('workers')
      .select('*')
      .eq('id', workerId)
      .maybeSingle();

    if (!error && data) {
      return mapWorkerFromSupabase(data);
    }
  } catch (err) {
    console.warn('[Supabase] Erro ao buscar worker por id:', err);
  }
  return local;
};

export const fetchWorkersFromCloud = async (companyId: string): Promise<Worker[]> => {
  if (!companyId) return [];
  try {
    const { data, error } = await supabase
      .from('workers')
      .select('*')
      .eq('company_id', companyId)
      .order('created_at', { ascending: false });

    if (!error && data && Array.isArray(data)) {
      const mapped = data.map(mapWorkerFromSupabase);
      safeSetItem(getWorkersStorageKey(companyId), JSON.stringify(mapped));
      return mapped;
    } else if (error) {
      console.warn('[Supabase] Erro ao buscar workers:', error);
    }
  } catch (err) {
    console.warn('[Supabase] Falha de conexão ao buscar workers:', err);
  }
  return getWorkers(companyId);
};

export const saveWorker = async (worker: Worker): Promise<void> => {
  if (!worker || !worker.companyId) return;
  const list = getWorkers(worker.companyId);
  const existingIdx = list.findIndex(w => w.id === worker.id);
  let updated: Worker[];
  if (existingIdx >= 0) {
    updated = [...list];
    updated[existingIdx] = worker;
  } else {
    updated = [worker, ...list];
  }
  safeSetItem(getWorkersStorageKey(worker.companyId), JSON.stringify(updated));

  // Sincroniza com o Supabase
  try {
    const payload = {
      id: worker.id,
      company_id: worker.companyId,
      name: worker.name,
      nif: worker.nif,
      role: worker.role,
      address: worker.address || null,
      phone: worker.phone || null,
      email: worker.email || null,
      hourly_rate: worker.hourlyRate || 0,
      admission_date: worker.admissionDate || null,
      active: worker.active !== undefined ? worker.active : true,
      created_at: worker.createdAt || new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    const { error } = await supabase.from('workers').upsert(payload);
    if (error) {
      console.warn('[Supabase] Erro ao sincronizar worker no Supabase:', error);
    }
  } catch (err) {
    console.warn('[Supabase] Falha ao upsert worker:', err);
  }
};

export const deleteWorker = async (workerId: string, companyId: string): Promise<void> => {
  if (!workerId || !companyId) return;
  const list = getWorkers(companyId);
  const updated = list.filter(w => w.id !== workerId);
  safeSetItem(getWorkersStorageKey(companyId), JSON.stringify(updated));

  // Também remove os logs associados localmente
  const logs = getWorkTimeLogs(companyId);
  const updatedLogs = logs.filter(l => l.workerId !== workerId);
  safeSetItem(getWorkLogsStorageKey(companyId), JSON.stringify(updatedLogs));

  // Sincroniza exclusão com o Supabase
  try {
    await supabase.from('work_time_logs').delete().eq('worker_id', workerId);
    await supabase.from('workers').delete().eq('id', workerId);
  } catch (err) {
    console.warn('[Supabase] Erro ao deletar worker no Supabase:', err);
  }
};

export const getWorkTimeLogs = (companyId: string, workerId?: string): WorkTimeLog[] => {
  if (!companyId) return [];
  const stored = safeGetItem(getWorkLogsStorageKey(companyId));
  let logs: WorkTimeLog[] = [];
  if (stored) {
    try {
      logs = JSON.parse(stored);
    } catch (e) {
      console.warn('[Storage] Erro ao carregar registos de ponto:', e);
    }
  }
  if (workerId) {
    return logs.filter(l => l.workerId === workerId);
  }
  return logs;
};

export const fetchWorkTimeLogsFromCloud = async (companyId: string, workerId?: string): Promise<WorkTimeLog[]> => {
  if (!companyId) return [];
  try {
    let query = supabase
      .from('work_time_logs')
      .select('*')
      .eq('company_id', companyId);

    if (workerId) {
      query = query.eq('worker_id', workerId);
    }

    const { data, error } = await query.order('date', { ascending: false });

    if (!error && data && Array.isArray(data)) {
      const mapped = data.map(mapWorkTimeLogFromSupabase);
      if (!workerId) {
        safeSetItem(getWorkLogsStorageKey(companyId), JSON.stringify(mapped));
      }
      return mapped;
    } else if (error) {
      console.warn('[Supabase] Erro ao buscar work_time_logs:', error);
    }
  } catch (err) {
    console.warn('[Supabase] Falha de conexão ao buscar work_time_logs:', err);
  }
  return getWorkTimeLogs(companyId, workerId);
};

export const saveWorkTimeLog = async (log: WorkTimeLog): Promise<void> => {
  if (!log || !log.companyId) return;
  const list = getWorkTimeLogs(log.companyId);
  const existingIdx = list.findIndex(l => l.id === log.id);
  let updated: WorkTimeLog[];
  if (existingIdx >= 0) {
    updated = [...list];
    updated[existingIdx] = log;
  } else {
    updated = [log, ...list];
  }
  // Ordena por data mais recente primeiro
  updated.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  safeSetItem(getWorkLogsStorageKey(log.companyId), JSON.stringify(updated));

  // Sincroniza com o Supabase
  try {
    const payload = {
      id: log.id,
      company_id: log.companyId,
      worker_id: log.workerId,
      date: log.date,
      start_time: log.startTime,
      coffee_break: log.coffeeBreak || null,
      lunch_break: log.lunchBreak || null,
      end_time: log.endTime,
      total_hours: Number(log.totalHours) || 0,
      work_location: log.workLocation || '',
      details: log.details || null,
      created_at: log.createdAt || new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    const { error } = await supabase.from('work_time_logs').upsert(payload);
    if (error) {
      console.warn('[Supabase] Erro ao sincronizar work_time_logs no Supabase:', error);
    }
  } catch (err) {
    console.warn('[Supabase] Falha ao upsert work_time_logs:', err);
  }
};

export const deleteWorkTimeLog = async (logId: string, companyId: string): Promise<void> => {
  if (!logId || !companyId) return;
  const list = getWorkTimeLogs(companyId);
  const updated = list.filter(l => l.id !== logId);
  safeSetItem(getWorkLogsStorageKey(companyId), JSON.stringify(updated));

  // Sincroniza exclusão com o Supabase
  try {
    await supabase.from('work_time_logs').delete().eq('id', logId);
  } catch (err) {
    console.warn('[Supabase] Erro ao deletar work_time_log no Supabase:', err);
  }
};






