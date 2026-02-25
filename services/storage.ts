import { Company, Budget, GlobalNotification, SupportMessage, Transaction, Coupon } from '../types';
import { syncToCloud, supabase } from './supabase';

const STORAGE_KEY_COMPANIES = 'atrios_companies';
const STORAGE_KEY_BUDGETS = 'atrios_budgets';
const STORAGE_KEY_PDF_COUNT = 'atrios_pdf_downloads';
const STORAGE_KEY_NOTIFICATIONS = 'atrios_notifications';
const STORAGE_KEY_MESSAGES = 'atrios_messages';
const STORAGE_KEY_TRANSACTIONS = 'atrios_transactions';
const STORAGE_KEY_COUPONS = 'atrios_coupons';
const STORAGE_KEY_SESSION = 'atrios_session';

export const generateShortId = () => {
  return `ATR-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
};

export const getStoredCompanies = (): Company[] => {
  const data = localStorage.getItem(STORAGE_KEY_COMPANIES);
  return data ? JSON.parse(data) : [];
};

export const saveCompany = (company: Company) => {
  const companies = getStoredCompanies();
  const index = companies.findIndex(c => c.id === company.id);
  if (index > -1) {
    companies[index] = company;
  } else {
    companies.push(company);
  }
  localStorage.setItem(STORAGE_KEY_COMPANIES, JSON.stringify(companies));
  
  // Sincroniza plano e dados sensíveis com Supabase
  syncToCloud('companies', company);
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

export const getStoredBudgets = (companyId: string): Budget[] => {
  const data = localStorage.getItem(STORAGE_KEY_BUDGETS);
  const budgets: Budget[] = data ? JSON.parse(data) : [];
  return budgets.filter(b => b.companyId === companyId);
};

/**
 * Salva o orçamento completo no Supabase.
 * Inclui as tabelas aninhadas de itens, despesas e pagamentos com comprovativos (Base64).
 */
export const saveBudget = (budget: Budget) => {
  const data = localStorage.getItem(STORAGE_KEY_BUDGETS);
  const budgets: Budget[] = data ? JSON.parse(data) : [];
  const index = budgets.findIndex(b => b.id === budget.id);
  
  if (index > -1) {
    budgets[index] = budget;
  } else {
    budgets.push(budget);
  }
  
  localStorage.setItem(STORAGE_KEY_BUDGETS, JSON.stringify(budgets));

  // O Supabase recebe o objeto completo via UPSERT (Insert ou Update automático pelo ID)
  syncToCloud('budgets', budget);
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
    return messages.filter(m => m.companyId === companyId);
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
    if (m.companyId === companyId && m.senderRole !== role) {
      return { ...m, read: true };
    }
    return m;
  });
  localStorage.setItem(STORAGE_KEY_MESSAGES, JSON.stringify(updated));

  await supabase.from('messages')
    .update({ read: true })
    .eq('companyId', companyId)
    .neq('senderRole', role);
};

export const getTransactions = (): Transaction[] => {
  const data = localStorage.getItem(STORAGE_KEY_TRANSACTIONS);
  return data ? JSON.parse(data) : [];
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

/**
 * Recupera todos os dados do Supabase e atualiza o armazenamento local.
 * Garante que orçamentos antigos, despesas e status de plano apareçam na página do usuário.
 */
export const hydrateLocalData = async (companyId: string) => {
  try {
    // 1. Hidratar Empresa (Garante Plano Premium/Free correto)
    const { data: companyData } = await supabase.from('companies').select('*').eq('id', companyId).single();
    if (companyData) {
      const companies = getStoredCompanies();
      const idx = companies.findIndex(c => c.id === companyId);
      if (idx > -1) {
        companies[idx] = companyData;
      } else {
        companies.push(companyData);
      }
      localStorage.setItem(STORAGE_KEY_COMPANIES, JSON.stringify(companies));
    }

    // 2. Hidratar Orçamentos (Histórico completo de despesas e pagamentos)
    const { data: budgets } = await supabase.from('budgets').select('*').eq('companyId', companyId);
    if (budgets) {
      const localBudgetsStr = localStorage.getItem(STORAGE_KEY_BUDGETS);
      let allBudgets: Budget[] = localBudgetsStr ? JSON.parse(localBudgetsStr) : [];
      
      // Filtra orçamentos de outras empresas e combina com os baixados da nuvem
      const otherBudgets = allBudgets.filter(b => b.companyId !== companyId);
      localStorage.setItem(STORAGE_KEY_BUDGETS, JSON.stringify([...otherBudgets, ...budgets]));
    }

    // 3. Hidratar Mensagens de Suporte
    const { data: messages } = await supabase.from('messages').select('*').eq('companyId', companyId);
    if (messages) {
      const localMsgsStr = localStorage.getItem(STORAGE_KEY_MESSAGES);
      let allMessages: SupportMessage[] = localMsgsStr ? JSON.parse(localMsgsStr) : [];
      const otherMessages = allMessages.filter(m => m.companyId !== companyId);
      localStorage.setItem(STORAGE_KEY_MESSAGES, JSON.stringify([...otherMessages, ...messages]));
    }
  } catch (err) {
    console.error("Falha ao recuperar dados remotos:", err);
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
