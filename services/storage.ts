import { Company, Budget, GlobalNotification, SupportMessage, Transaction, Coupon, StoreOrder, Product, CustomOrderRequest } from '../types';
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
const STORAGE_KEY_CUSTOM_ORDERS = 'atrios_custom_orders';

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
    localStorage.setItem(STORAGE_KEY_CUSTOM_ORDERS, JSON.stringify(requests));
    
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
  const mapped: any = { ...m };
  if (m.company_id && !m.companyId) mapped.companyId = m.company_id;
  if (m.sender_role && !m.senderRole) mapped.senderRole = m.sender_role;
  if (m.translated_content && !m.translatedContent) mapped.translatedContent = m.translated_content;
  if (m.created_at && !m.createdAt) mapped.createdAt = m.created_at;
  if (m.created_at && !m.timestamp) mapped.timestamp = m.created_at;
  if (m.timestamp && !m.created_at) mapped.created_at = m.timestamp;
  return mapped as SupportMessage;
};

export const mapOrderFromSupabase = (o: any): StoreOrder => {
  const mapped: any = { ...o };
  if (o.company_id && !o.companyId) mapped.companyId = o.company_id;
  if (o.product_id && !o.productId) mapped.productId = o.product_id;
  if (o.product_name && !o.productName) mapped.productName = o.product_name;
  if (o.uploaded_image && !o.uploadedImage) mapped.uploadedImage = o.uploaded_image;
  if (o.created_at && !o.createdAt) mapped.createdAt = o.created_at;
  return mapped as StoreOrder;
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

// Helper para buscar dados de forma resiliente tentando diferentes nomes de coluna para o ID da empresa
const fetchResilient = async (table: string, companyId: string, orderCol?: string) => {
  const columns = ['companyId', 'company_id', 'companyid'];
  let lastError = null;
  
  for (const col of columns) {
    try {
      let query = supabase.from(table).select('*').eq(col, companyId);
      if (orderCol) {
        query = query.order(orderCol, { ascending: false });
      }
      
      const { data, error, status } = await query;
      
      if (!error) {
        return { data, error: null };
      }
      
      // Se o erro for relacionado à coluna de ordenação, tentamos sem ordenação
      if (orderCol && (error.message?.includes('column') || error.message?.includes('order'))) {
        console.warn(`fetchResilient: Coluna de ordenação '${orderCol}' não encontrada em ${table}. Tentando sem ordenação...`);
        const { data: fallbackData, error: fallbackError } = await supabase.from(table).select('*').eq(col, companyId);
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

export const hydrateLocalData = async (companyId: string): Promise<{ budgets: Budget[], orders: StoreOrder[], messages: SupportMessage[], customOrders: CustomOrderRequest[] }> => {
  if (!companyId) {
    console.warn("[Hydrate] companyId não fornecido. Abortando hidratação.");
    return { budgets: [], orders: [], messages: [], customOrders: [] };
  }
  let fetchedBudgets: Budget[] = getStoredBudgets(companyId);
  let fetchedOrders: StoreOrder[] = getStoredStoreOrders(companyId);
  let fetchedMessages: SupportMessage[] = getMessages(companyId);
  let fetchedCustomOrders: CustomOrderRequest[] = getStoredCustomOrders(companyId);

  try {
    // 1. Hidratar Empresa (Garante Plano Premium/Free correto)
    let { data: companyData, error: companyError } = await supabase.from('companies').select('*').eq('id', companyId).single();
    
    // Fallback para company_id se id falhar
    if (companyError && (companyError.code === 'PGRST204' || companyError.message?.includes('column'))) {
      const { data: fallbackData, error: fallbackError } = await supabase.from('companies').select('*').eq('company_id', companyId).single();
      if (!fallbackError) {
        companyData = fallbackData;
        companyError = null;
      }
    }
    
    if (companyError && companyError.code === 'PGRST116') {
      console.warn(`[Hydrate] Empresa ${companyId} não encontrada no Supabase. Removendo localmente.`);
      const companies = getStoredCompanies();
      const filtered = companies.filter(c => String(c.id) !== String(companyId));
      localStorage.setItem(STORAGE_KEY_COMPANIES, JSON.stringify(filtered));
      return { budgets: [], orders: [], messages: [], customOrders: [] }; 
    }

    if (companyData) {
      // Mapeamento de campos da empresa
      const mappedCompany: any = { ...companyData };
      if (companyData.company_id && !companyData.id) mappedCompany.id = companyData.company_id;
      if (companyData.companyid && !companyData.id) mappedCompany.id = companyData.companyid;
      
      const companies = getStoredCompanies();
      const idx = companies.findIndex(c => String(c.id) === String(companyId));
      if (idx > -1) {
        companies[idx] = mappedCompany;
      } else {
        companies.push(mappedCompany);
      }
      localStorage.setItem(STORAGE_KEY_COMPANIES, JSON.stringify(companies));
    }

    // 1.5 Hidratar Pedidos Personalizados
    console.log(`[Hydrate] Buscando pedidos personalizados para a empresa ${companyId}...`);
    const { data: customOrders, error: customOrdersError } = await fetchResilient('custom_order_requests', companyId);
    
    if (customOrdersError) {
      console.error("[Hydrate] Erro ao buscar pedidos personalizados:", customOrdersError);
    }

    if (customOrders) {
      fetchedCustomOrders = customOrders.map(mapCustomOrderFromSupabase);
      const localCustomOrdersStr = localStorage.getItem(STORAGE_KEY_CUSTOM_ORDERS);
      let allCustomOrders: CustomOrderRequest[] = localCustomOrdersStr ? JSON.parse(localCustomOrdersStr) : [];
      const otherCustomOrders = allCustomOrders.filter(o => String(o.companyId) !== String(companyId));
      localStorage.setItem(STORAGE_KEY_CUSTOM_ORDERS, JSON.stringify([...otherCustomOrders, ...fetchedCustomOrders]));
    }

    // 2. Hidratar Orçamentos (Histórico completo de despesas e pagamentos)
    console.log(`[Hydrate] Buscando orçamentos para a empresa ${companyId}...`);
    
    const { data: budgets, error: budgetsError } = await fetchResilient('budgets', companyId, 'created_at');
      
    if (budgetsError) {
      console.error("[Hydrate] Erro ao buscar orçamentos:", budgetsError);
    }

    if (budgets) {
      fetchedBudgets = budgets.map(mapBudgetFromSupabase);
      const localBudgetsStr = localStorage.getItem(STORAGE_KEY_BUDGETS);
      let allBudgets: Budget[] = localBudgetsStr ? JSON.parse(localBudgetsStr) : [];
      const otherBudgets = allBudgets.filter(b => String(b.companyId) !== String(companyId));
      const currentCompanyLocalBudgets = allBudgets.filter(b => String(b.companyId) === String(companyId));
      
      // Merge: keep local budgets that are not in the fetched list (unsynced)
      const mergedBudgets = [...fetchedBudgets];
      currentCompanyLocalBudgets.forEach(lb => {
        if (!mergedBudgets.some(mb => mb.id === lb.id)) {
          mergedBudgets.push(lb);
        }
      });
      
      localStorage.setItem(STORAGE_KEY_BUDGETS, JSON.stringify([...otherBudgets, ...mergedBudgets]));
      fetchedBudgets = mergedBudgets;
    }

    // 3. Hidratar Mensagens de Suporte
    console.log(`[Hydrate] Buscando mensagens para a empresa ${companyId}...`);
    const { data: messages, error: messagesError } = await fetchResilient('messages', companyId);
    
    if (messagesError) {
      console.error("[Hydrate] Erro ao buscar mensagens:", messagesError);
    }

    if (messages) {
      fetchedMessages = messages.map(mapMessageFromSupabase);
      const localMsgsStr = localStorage.getItem(STORAGE_KEY_MESSAGES);
      let allMessages: SupportMessage[] = localMsgsStr ? JSON.parse(localMsgsStr) : [];
      const otherMessages = allMessages.filter(m => String(m.companyId) !== String(companyId));
      const currentCompanyLocalMessages = allMessages.filter(m => String(m.companyId) === String(companyId));
      
      const mergedMessages = [...fetchedMessages];
      currentCompanyLocalMessages.forEach(lm => {
        if (!mergedMessages.some(mm => mm.id === lm.id)) {
          mergedMessages.push(lm);
        }
      });
      
      localStorage.setItem(STORAGE_KEY_MESSAGES, JSON.stringify([...otherMessages, ...mergedMessages]));
      fetchedMessages = mergedMessages;
    }

    // 4. Hidratar Pedidos da Loja
    console.log(`[Hydrate] Buscando pedidos da loja para a empresa ${companyId}...`);
    const { data: storeOrders, error: ordersError } = await fetchResilient('store_orders', companyId);

    if (ordersError) {
      console.error("[Hydrate] Erro ao buscar pedidos:", ordersError);
    }

    if (storeOrders) {
      fetchedOrders = storeOrders.map(mapOrderFromSupabase);
      const localOrdersStr = localStorage.getItem(STORAGE_KEY_STORE_ORDERS);
      let allOrders: StoreOrder[] = localOrdersStr ? JSON.parse(localOrdersStr) : [];
      const otherOrders = allOrders.filter(o => String(o.companyId) !== String(companyId));
      const currentCompanyLocalOrders = allOrders.filter(o => String(o.companyId) === String(companyId));
      
      const mergedOrders = [...fetchedOrders];
      currentCompanyLocalOrders.forEach(lo => {
        if (!mergedOrders.some(mo => mo.id === lo.id)) {
          mergedOrders.push(lo);
        }
      });
      
      localStorage.setItem(STORAGE_KEY_STORE_ORDERS, JSON.stringify([...otherOrders, ...mergedOrders]));
      fetchedOrders = mergedOrders;
    }

    // 5. Hidratar Produtos
    const { data: products } = await supabase.from('products').select('*');
    if (products) {
      localStorage.setItem(STORAGE_KEY_PRODUCTS, JSON.stringify(products));
    }

    // 6. Hidratar Transações
    console.log(`[Hydrate] Buscando transações para a empresa ${companyId}...`);
    const { data: transactions } = await fetchResilient('transactions', companyId);
    
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
    
    return { budgets: fetchedBudgets, orders: fetchedOrders, messages: fetchedMessages, customOrders: fetchedCustomOrders };
  } catch (err) {
    console.error("Falha ao recuperar dados remotos:", err);
    return { budgets: fetchedBudgets, orders: fetchedOrders, messages: fetchedMessages, customOrders: fetchedCustomOrders };
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
