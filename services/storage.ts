import { Company, Budget, GlobalNotification, SupportMessage, Transaction, Coupon, StoreOrder, Product } from '../types';
import { syncToCloud, supabase } from './supabase';

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

export const generateShortId = () => {
  return `ATR-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
};

export const getStoredCompanies = (): Company[] => {
  const data = localStorage.getItem(STORAGE_KEY_COMPANIES);
  return data ? JSON.parse(data) : [];
};

export const saveCompany = async (company: Company) => {
  const companies = getStoredCompanies();
  const index = companies.findIndex(c => c.id === company.id);
  if (index > -1) {
    companies[index] = company;
  } else {
    companies.push(company);
  }
  localStorage.setItem(STORAGE_KEY_COMPANIES, JSON.stringify(companies));
  
  // Sincroniza plano e dados sensíveis com Supabase
  return await syncToCloud('companies', company);
};

export const removeCompany = async (id: string) => {
  const companies = getStoredCompanies().filter(c => c.id !== id);
  localStorage.setItem(STORAGE_KEY_COMPANIES, JSON.stringify(companies));
  
  const allBudgetsStr = localStorage.getItem(STORAGE_KEY_BUDGETS);
  if (allBudgetsStr) {
    const allBudgets = JSON.parse(allBudgetsStr);
    const filteredBudgets = allBudgets.filter((b: Budget) => b.companyId !== id);
    localStorage.setItem(STORAGE_KEY_BUDGETS, JSON.stringify(filteredBudgets));
  }

  await supabase.from('companies').delete().eq('id', id);
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
    
    localStorage.setItem(STORAGE_KEY_BUDGETS, JSON.stringify(budgets));
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

export const getPdfDownloadCount = (companyId: string): number => {
  const data = localStorage.getItem(STORAGE_KEY_PDF_COUNT);
  const counts = data ? JSON.parse(data) : {};
  return counts[companyId] || 0;
};

export const incrementPdfDownloadCount = (companyId: string) => {
  const data = localStorage.getItem(STORAGE_KEY_PDF_COUNT);
  const counts = data ? JSON.parse(data) : {};
  counts[companyId] = (counts[companyId] || 0) + 1;
  localStorage.setItem(STORAGE_KEY_PDF_COUNT, JSON.stringify(counts));
};

export const getGlobalNotifications = (): GlobalNotification[] => {
  const data = localStorage.getItem(STORAGE_KEY_NOTIFICATIONS);
  return data ? JSON.parse(data) : [];
};

export const saveGlobalNotifications = (notifications: GlobalNotification[]) => {
  localStorage.setItem(STORAGE_KEY_NOTIFICATIONS, JSON.stringify(notifications));
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

export const saveMessage = (message: SupportMessage) => {
  const messages = getMessages();
  messages.push(message);
  localStorage.setItem(STORAGE_KEY_MESSAGES, JSON.stringify(messages));
  
  syncToCloud('messages', message);
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
  localStorage.setItem(STORAGE_KEY_MESSAGES, JSON.stringify(updated));

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
  localStorage.setItem(STORAGE_KEY_TRANSACTIONS, JSON.stringify(txs));
  
  syncToCloud('transactions', tx);
};

export const getCoupons = (): Coupon[] => {
  const data = localStorage.getItem(STORAGE_KEY_COUPONS);
  return data ? JSON.parse(data) : [];
};

export const saveCoupon = (coupon: Coupon) => {
  const coupons = getCoupons();
  coupons.push(coupon);
  localStorage.setItem(STORAGE_KEY_COUPONS, JSON.stringify(coupons));
  
  syncToCloud('coupons', coupon);
};

export const removeCoupon = async (id: string) => {
  const coupons = getCoupons().filter(c => c.id !== id);
  localStorage.setItem(STORAGE_KEY_COUPONS, JSON.stringify(coupons));
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
    localStorage.setItem(STORAGE_KEY_STORE_ORDERS, JSON.stringify(orders));
    
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

export const getProducts = async (): Promise<Product[]> => {
  const timestamp = new Date().getTime();
  console.log(`getProducts: Iniciando busca (ts: ${timestamp})...`);
  try {
    // Adicionamos um parâmetro dummy para evitar cache agressivo se houver
    const { data, error } = await supabase.from('products').select('*');
    
    console.log("getProducts: Resposta do Supabase:", { 
      hasData: !!data, 
      count: data?.length, 
      error: error ? { message: error.message, code: error.code } : null 
    });
    
    if (data && data.length > 0) {
      console.log("getProducts: Sucesso! Atualizando localStorage com", data.length, "produtos.");
      const sorted = data.sort((a, b) => {
        const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
        const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
        return dateB - dateA;
      });
      localStorage.setItem(STORAGE_KEY_PRODUCTS, JSON.stringify(sorted));
      return sorted;
    }
    
    if (error) {
      console.warn("getProducts: Erro Supabase:", error.message);
    } else {
      console.log("getProducts: Supabase retornou vazio.");
    }
  } catch (err) {
    console.error("getProducts: Exceção:", err);
  }
  
  const localData = localStorage.getItem(STORAGE_KEY_PRODUCTS);
  console.log("getProducts: Lendo do localStorage:", localData ? "Encontrado" : "Vazio");
  const local = localData ? JSON.parse(localData) : [];
  console.log("getProducts: Retornando", local.length, "produtos locais.");
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
  localStorage.setItem(STORAGE_KEY_PRODUCTS, JSON.stringify(products));
  console.log("saveProduct: Salvo no localStorage. Total de produtos:", products.length);
  
  const syncResult = await syncToCloud('products', product);
  console.log("saveProduct: Resultado da sincronização cloud:", syncResult);
  return syncResult;
};

export const deleteProduct = async (id: string) => {
  const products = (await getProducts()).filter(p => p.id !== id);
  localStorage.setItem(STORAGE_KEY_PRODUCTS, JSON.stringify(products));
  
  return await supabase.from('products').delete().eq('id', id);
};

/**
 * Recupera todos os dados do Supabase e atualiza o armazenamento local.
 * Garante que orçamentos antigos, despesas e status de plano apareçam na página do usuário.
 */
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
  return mapped as Budget;
};

export const mapMessageFromSupabase = (m: any): SupportMessage => {
  const mapped: any = { ...m };
  if (m.company_id && !m.companyId) mapped.companyId = m.company_id;
  if (m.sender_role && !m.senderRole) mapped.senderRole = m.sender_role;
  if (m.translated_content && !m.translatedContent) mapped.translatedContent = m.translated_content;
  return mapped as SupportMessage;
};

export const mapOrderFromSupabase = (o: any): StoreOrder => {
  const mapped: any = { ...o };
  if (o.company_id && !o.companyId) mapped.companyId = o.company_id;
  if (o.product_id && !o.productId) mapped.productId = o.product_id;
  if (o.product_name && !o.productName) mapped.productName = o.product_name;
  if (o.uploaded_image && !o.uploadedImage) mapped.uploadedImage = o.uploaded_image;
  return mapped as StoreOrder;
};

export const hydrateLocalData = async (companyId: string): Promise<{ budgets: Budget[], orders: StoreOrder[], messages: SupportMessage[] }> => {
  let fetchedBudgets: Budget[] = [];
  let fetchedOrders: StoreOrder[] = [];
  let fetchedMessages: SupportMessage[] = [];

  try {
    // 1. Hidratar Empresa (Garante Plano Premium/Free correto)
    const { data: companyData, error: companyError } = await supabase.from('companies').select('*').eq('id', companyId).single();
    
    if (companyError && companyError.code === 'PGRST116') {
      console.warn(`[Hydrate] Empresa ${companyId} não encontrada no Supabase. Removendo localmente.`);
      const companies = getStoredCompanies();
      const filtered = companies.filter(c => String(c.id) !== String(companyId));
      localStorage.setItem(STORAGE_KEY_COMPANIES, JSON.stringify(filtered));
      return { budgets: [], orders: [], messages: [] }; 
    }

    if (companyData) {
      const companies = getStoredCompanies();
      const idx = companies.findIndex(c => String(c.id) === String(companyId));
      if (idx > -1) {
        companies[idx] = companyData;
      } else {
        companies.push(companyData);
      }
      localStorage.setItem(STORAGE_KEY_COMPANIES, JSON.stringify(companies));
    }

    // 2. Hidratar Orçamentos (Histórico completo de despesas e pagamentos)
    console.log(`[Hydrate] Buscando orçamentos para a empresa ${companyId}...`);
    
    let { data: budgets, error: budgetsError } = await supabase
      .from('budgets')
      .select('*')
      .or(`companyId.eq.${companyId},company_id.eq.${companyId},companyid.eq.${companyId}`)
      .order('created_at', { ascending: false });
      
    if (budgetsError) {
      const { data: b1 } = await supabase.from('budgets').select('*').eq('companyId', companyId).order('created_at', { ascending: false });
      const { data: b2 } = await supabase.from('budgets').select('*').eq('company_id', companyId).order('created_at', { ascending: false });
      const { data: b3 } = await supabase.from('budgets').select('*').eq('companyid', companyId).order('created_at', { ascending: false });
      budgets = [...(b1 || []), ...(b2 || []), ...(b3 || [])];
      const uniqueIds = new Set();
      budgets = budgets.filter(b => {
        if (uniqueIds.has(b.id)) return false;
        uniqueIds.add(b.id);
        return true;
      });
    }

    if (budgets) {
      fetchedBudgets = budgets.map(mapBudgetFromSupabase);
      const localBudgetsStr = localStorage.getItem(STORAGE_KEY_BUDGETS);
      let allBudgets: Budget[] = localBudgetsStr ? JSON.parse(localBudgetsStr) : [];
      const otherBudgets = allBudgets.filter(b => String(b.companyId) !== String(companyId));
      localStorage.setItem(STORAGE_KEY_BUDGETS, JSON.stringify([...otherBudgets, ...fetchedBudgets]));
    }

    // 3. Hidratar Mensagens de Suporte
    console.log(`Buscando mensagens para a empresa ${companyId}...`);
    let { data: messages, error: messagesError } = await supabase.from('messages').select('*').eq('companyId', companyId);
    
    if (messagesError || !messages) {
      const { data: msgsSnake, error: msgsSnakeError } = await supabase.from('messages').select('*').eq('company_id', companyId);
      if (!msgsSnakeError && msgsSnake) {
        messages = msgsSnake;
        messagesError = null;
      }
    }

    if (messages) {
      fetchedMessages = messages.map(mapMessageFromSupabase);
      const localMsgsStr = localStorage.getItem(STORAGE_KEY_MESSAGES);
      let allMessages: SupportMessage[] = localMsgsStr ? JSON.parse(localMsgsStr) : [];
      const otherMessages = allMessages.filter(m => String(m.companyId) !== String(companyId));
      localStorage.setItem(STORAGE_KEY_MESSAGES, JSON.stringify([...otherMessages, ...fetchedMessages]));
    }

    // 4. Hidratar Pedidos da Loja
    console.log(`Buscando pedidos da loja para a empresa ${companyId}...`);
    let { data: storeOrders, error: ordersError } = await supabase.from('store_orders').select('*').eq('companyId', companyId);

    if (ordersError || !storeOrders) {
      const { data: ordersSnake, error: ordersSnakeError } = await supabase.from('store_orders').select('*').eq('company_id', companyId);
      if (!ordersSnakeError && ordersSnake) {
        storeOrders = ordersSnake;
        ordersError = null;
      }
    }

    if (storeOrders) {
      fetchedOrders = storeOrders.map(mapOrderFromSupabase);
      const localOrdersStr = localStorage.getItem(STORAGE_KEY_STORE_ORDERS);
      let allOrders: StoreOrder[] = localOrdersStr ? JSON.parse(localOrdersStr) : [];
      const otherOrders = allOrders.filter(o => String(o.companyId) !== String(companyId));
      localStorage.setItem(STORAGE_KEY_STORE_ORDERS, JSON.stringify([...otherOrders, ...fetchedOrders]));
    }

    // 5. Hidratar Produtos
    const { data: products } = await supabase.from('products').select('*');
    if (products) {
      localStorage.setItem(STORAGE_KEY_PRODUCTS, JSON.stringify(products));
    }

    // 6. Hidratar Transações
    let { data: transactions } = await supabase.from('transactions').select('*').eq('companyId', companyId);
    if (!transactions) {
      const { data: transSnake } = await supabase.from('transactions').select('*').eq('company_id', companyId);
      transactions = transSnake;
    }
    if (transactions) {
      const localTransStr = localStorage.getItem(STORAGE_KEY_TRANSACTIONS);
      let allTrans: Transaction[] = localTransStr ? JSON.parse(localTransStr) : [];
      const otherTrans = allTrans.filter(t => String(t.companyId) !== String(companyId));
      localStorage.setItem(STORAGE_KEY_TRANSACTIONS, JSON.stringify([...otherTrans, ...transactions]));
    }

    // 7. Hidratar Cupons
    const { data: coupons } = await supabase.from('coupons').select('*');
    if (coupons) {
      localStorage.setItem(STORAGE_KEY_COUPONS, JSON.stringify(coupons));
    }
    
    return { budgets: fetchedBudgets, orders: fetchedOrders, messages: fetchedMessages };
  } catch (err) {
    console.error("Falha ao recuperar dados remotos:", err);
    return { budgets: [], orders: [], messages: [] };
  }
};

export const saveSession = (companyId: string | null, view?: string, activeTab?: string, currencyCode?: string) => {
  const finalView = view || (getSession()?.view) || 'landing';
  
  if (finalView === 'landing' || (!companyId && finalView !== 'master' && finalView !== 'login' && finalView !== 'signup' && finalView !== 'verify')) {
    localStorage.removeItem(STORAGE_KEY_SESSION);
    return;
  }
  
  const session = getSession() || { companyId: null, view: 'landing', activeTab: 'dashboard', currencyCode: 'EUR' };
  localStorage.setItem(STORAGE_KEY_SESSION, JSON.stringify({
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
