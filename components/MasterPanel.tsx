import React, { useState, useEffect, useMemo, useRef } from 'react';
import EmojiPicker, { EmojiClickData, Theme as EmojiTheme } from 'emoji-picker-react';
import { 
  Users, 
  TrendingUp, 
  ShieldCheck, 
  Calendar, 
  ArrowLeft,
  Bell,
  Palette,
  Upload,
  Trash2,
  CheckCircle,
  X,
  Lock,
  Unlock,
  AlertCircle,
  MessageSquare,
  Send,
  Loader2,
  Ticket,
  Percent,
  LayoutDashboard,
  Package,
  ArrowUpRight,
  Search,
  Zap,
  Settings,
  UserPlus,
  Ban,
  BarChart3,
  Plus,
  Crown,
  CreditCard,
  Download,
  Globe,
  ShoppingBag,
  Smartphone,
  PieChart as PieChartIcon,
  Clock,
  Activity,
  Key,
  HardHat,
  MapPin,
  Euro,
  Phone,
  LogOut,
  Code,
  Eye,
  User,
  Mail,
  FileText,
  Award,
  Briefcase,
  Film,
  Video,
  Wrench,
  Hammer,
  Sparkles
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell,
  PieChart,
  Pie
} from 'recharts';
import { Company, PlanType, AudienceType, GlobalNotification, SupportMessage, Transaction, Coupon, StoreOrder, Product, CustomOrderRequest, PushNotification, JobOffer, JobOfferStatus, Candidate, ClientServiceRequest, ServiceCategory } from '../types';
import { generateCompanyQrCode } from '../services/qrcode';
import { 
  getStoredCompanies, 
  saveCompany, 
  removeCompany,
  getGlobalNotifications, 
  saveGlobalNotifications, 
  getMessages, 
  saveMessage, 
  markMessagesAsRead,
  getTransactions,
  saveTransaction,
  getCoupons,
  saveCoupon,
  removeCoupon,
  getStoreOrders,
  deleteStoreOrder,
  getStoredCustomOrders,
  getProducts,
  saveProduct,
  deleteProduct,
  generateShortId,
  mapCompanyFromSupabase,
  mapMessageFromSupabase,
  mapOrderFromSupabase,
  mapCustomOrderFromSupabase,
  mapBudgetFromSupabase,
  getStoredJobOffers,
  saveJobOffer,
  updateJobOfferStatus,
  deleteJobOffer,
  mapJobOfferFromSupabase,
  mapJobOfferToSupabasePayload,
  safeSetItem,
  getStoredCandidates,
  saveCandidate,
  deleteCandidate,
  mapCandidateFromSupabase,
  notifyJobOwnerNewCandidate,
  getStoredClientRequests,
  fetchClientRequestsFromSupabase,
  saveClientServiceRequest,
  deleteClientServiceRequest
} from '../services/storage';
import { supabase, testTableAccess, safeFetch, syncToCloud } from '../services/supabase';
import { Locale, translations } from '../translations';
import { translateMessage } from '../services/gemini';
import { MasterHeroVideoSettings } from './MasterHeroVideoSettings';

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

const registerMasterPushSubscription = async () => {
  if (!('serviceWorker' in navigator) || !('PushManager' in window) || !('Notification' in window)) {
    console.warn('Web Push is not fully supported on this device/browser');
    return;
  }
  try {
    await navigator.serviceWorker.register('/firebase-messaging-sw.js').catch(() => {});
    const reg = await navigator.serviceWorker.ready;
    let subscription = await reg.pushManager.getSubscription();
    
    if (!subscription) {
      const keyRes = await fetch('/api/push/public-key');
      if (!keyRes.ok) throw new Error('Failed to fetch public key');
      const { publicKey } = await keyRes.json();
      if (!publicKey) throw new Error('Public key empty');

      const convertedKey = urlBase64ToUint8Array(publicKey);
      try {
        subscription = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: convertedKey
        });
      } catch (subErr: any) {
        console.warn('[Master Push] Browser PushManager.subscribe failed, continuing with fallback:', subErr.message || subErr);
      }
    }

    if (subscription) {
      await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subscription,
          companyId: 'master',
          plan: 'master'
        })
      });
      console.log('[Master Push] Subscribed successfully');
    } else {
      console.info('[Master Push] Subscription skipped or unavailable in this environment.');
    }
  } catch (err: any) {
    console.warn('[Master Push] Error registering subscription:', err.message || err);
  }
};

const triggerPushNotificationSubmit = (title: string, body: string) => {
  if (typeof window === 'undefined' || !title || !body) return;

  // Disparar o balão informativo in-app
  try {
    window.dispatchEvent(
      new CustomEvent('in_app_push_toast', {
        detail: {
          id: String(Date.now() + Math.random()),
          title,
          body,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      })
    );
  } catch (err) {
    console.error('Erro ao disparar balão in-app em MasterPanel:', err);
  }
};

interface MasterPanelProps {
  onLogout: () => void;
  locale: Locale;
}

const MasterPanel: React.FC<MasterPanelProps> = ({ onLogout, locale }) => {
  const t = translations[locale];
  const [isSyncing, setIsSyncing] = useState(false);
  const [activeTab, setActiveTab] = useState<'home' | 'users' | 'notifications' | 'messages' | 'coupons' | 'store' | 'products' | 'push' | 'jobs' | 'hero_video' | 'client_requests'>('home');
  const [activeNotifications, setActiveNotifications] = useState<GlobalNotification[]>([]);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [targetAudience, setTargetAudience] = useState<AudienceType>('all');
  
  // Client Service Requests (Obras & Clientes) State for Master
  const [clientRequestsList, setClientRequestsList] = useState<ClientServiceRequest[]>([]);
  const [clientRequestStatusFilter, setClientRequestStatusFilter] = useState<'all' | string>('all');
  const [clientRequestCategoryFilter, setClientRequestCategoryFilter] = useState<'all' | string>('all');
  const [clientRequestSearch, setClientRequestSearch] = useState('');
  const [selectedClientRequestModal, setSelectedClientRequestModal] = useState<ClientServiceRequest | null>(null);
  
  // Job Offers State for Master
  const [jobOffers, setJobOffers] = useState<JobOffer[]>([]);
  const [jobStatusFilter, setJobStatusFilter] = useState<'all' | JobOfferStatus>('all');
  const [jobSearch, setJobSearch] = useState('');
  const [jobFeedbackModal, setJobFeedbackModal] = useState<{ id: string; status: JobOfferStatus; companyId: string; specialty?: string; title: string } | null>(null);
  const [jobFeedbackText, setJobFeedbackText] = useState('');
  
  // Candidates and JSON draft state
  const [candidatesList, setCandidatesList] = useState<Candidate[]>([]);
  const [candidateJsonInputs, setCandidateJsonInputs] = useState<Record<string, string>>({});
  const candidateJsonInputsRef = useRef<Record<string, string>>({});
  candidateJsonInputsRef.current = candidateJsonInputs;
  const [selectedCandidatePreview, setSelectedCandidatePreview] = useState<Partial<Candidate> | null>(null);
  
  // Custom Push notifications composer states
  const [pushTitle, setPushTitle] = useState('');
  const [pushBody, setPushBody] = useState('');
  const [showEmojiPickerFor, setShowEmojiPickerFor] = useState<'title' | 'body' | null>(null);
  const [pushAudience, setPushAudience] = useState<AudienceType>('all');
  const [pushHistory, setPushHistory] = useState<PushNotification[]>(() => {
    try {
      const stored = localStorage.getItem('atrios_push_history');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });
  const [isScheduled, setIsScheduled] = useState(false);
  const [scheduledTime, setScheduledTime] = useState('');
  const [scheduledPushes, setScheduledPushes] = useState<any[]>([]);

  const loadScheduledPushes = () => {
    fetch('/api/push/scheduled')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setScheduledPushes(data.scheduled || []);
        }
      })
      .catch(err => {
        console.error('Error loading scheduled pushes:', err);
      });
  };

  useEffect(() => {
    if (activeTab === 'push') {
      loadScheduledPushes();
    }
  }, [activeTab]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [serverLastSeenMap, setServerLastSeenMap] = useState<Record<string, string>>({});
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [storeOrders, setStoreOrders] = useState<StoreOrder[]>([]);
  const [customOrders, setCustomOrders] = useState<CustomOrderRequest[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  
  // Product Form State
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productName, setProductName] = useState('');
  const [productCode, setProductCode] = useState('');
  const [productCategory, setProductCategory] = useState('Branding');
  const [productDescription, setProductDescription] = useState('');
  const [productPrice, setProductPrice] = useState<number | ''>('');
  const [productImage, setProductImage] = useState<string | null>(null);
  const [additionalProductImages, setAdditionalProductImages] = useState<string[]>([]);
  
  const [lastMessageAlert, setLastMessageAlert] = useState<{name: string, content: string} | null>(null);
  const [lastUnlockAlert, setLastUnlockAlert] = useState<string | null>(null);
  
  const [pushPermission, setPushPermission] = useState<NotificationPermission>(
    'Notification' in window ? Notification.permission : 'denied'
  );

  const requestPushPermission = async () => {
    if (!('Notification' in window)) {
      alert('O seu telemóvel ou navegador não suporta notificações nativas.');
      return;
    }
    const perm = await Notification.requestPermission();
    setPushPermission(perm);
    if (perm === 'granted') {
      triggerPushNotificationSubmit(
        "Átrios App",
        "Perfeito! Notificações com o logo oficial da Átrios ativadas com sucesso. 🎉"
      );
      registerMasterPushSubscription();
    } else if (perm === 'denied') {
      alert('As notificações foram negadas. Se desejar receber avisos de cadastro, por favor ative-as nas definições de segurança do seu telemóvel ou navegador.');
    }
  };

  useEffect(() => {
    if (pushPermission === 'granted') {
      registerMasterPushSubscription();
    }
  }, [pushPermission]);

  const testPushNotification = () => {
    if (pushPermission !== 'granted') {
      requestPushPermission();
      return;
    }
    triggerPushNotificationSubmit(
      "Teste de Notificação 🏗️",
      "Esta é uma demonstração de como as notificações com o logotipo oficial do Átrios aparecem no seu telemóvel!"
    );
  };

  const prevUnlockCount = useRef(0);
  const prevUnreadCount = useRef(0);
  const prevCompaniesCount = useRef(0);
  const prevBudgetsCount = useRef(0);
  const companiesRef = useRef<Company[]>([]);

  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null);
  const selectedCompanyIdRef = useRef<string | null>(null);

  useEffect(() => {
    selectedCompanyIdRef.current = selectedCompanyId;
  }, [selectedCompanyId]);
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [manualUserName, setManualUserName] = useState('');
  const [manualUserEmail, setManualUserEmail] = useState('');
  const [manualUserPass, setManualUserPass] = useState('');
  const [manualUserPlan, setManualUserPlan] = useState<PlanType>(PlanType.PREMIUM_MONTHLY);
  const [manualProofPreview, setManualProofPreview] = useState<string | null>(null);
  const [showProofModal, setShowProofModal] = useState<string | null>(null);
  const [showDurationModal, setShowDurationModal] = useState<Company | null>(null);
  const [showResetPassModal, setShowResetPassModal] = useState<Company | null>(null);
  const [showNotesModal, setShowNotesModal] = useState<Company | null>(null);
  const [notesTextValue, setNotesTextValue] = useState('');
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [newPassValue, setNewPassValue] = useState('');
  const [newCouponCode, setNewCouponCode] = useState('');
  const [newCouponDiscount, setNewCouponDiscount] = useState(10);

  const handleDownloadImage = (base64: string, fileName: string) => {
    const link = document.createElement('a');
    link.href = base64;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const loadData = async () => {
    setIsSyncing(true);
    try {
      setActiveNotifications(getGlobalNotifications());

      // Fetch server real-time presence map
      let serverPresenceMap: Record<string, string> = {};
      try {
        const pRes = await fetch('/api/user/last-seen');
        const pJson = await pRes.json();
        if (pJson.success && pJson.lastSeenMap) {
          serverPresenceMap = pJson.lastSeenMap;
          setServerLastSeenMap(prev => ({ ...prev, ...pJson.lastSeenMap }));
        }
      } catch (err) {
        console.warn("Could not fetch presence map:", err);
      }
    
    // Buscar empresas diretamente do Supabase para garantir que todos os usuários apareçam
    const { data: cloudCompanies, error: companiesError } = await safeFetch<Company[]>(supabase
      .from('companies')
      .select('*')
      .not('email', 'in', '("atriossoftware@gmail.com", "jeferson.goes36@gmail.com")'));
    
    if (companiesError) {
      console.warn("MasterPanel: Falha ao buscar empresas (Cloud). Usando cache local.", companiesError.message);
    }
    
    const masterEmails = ['atriossoftware@gmail.com', 'jeferson.goes36@gmail.com'];
    const localCompanies = getStoredCompanies().filter(c => !masterEmails.includes(c.email));
    const localMap = new Map(localCompanies.map(c => [c.id, c]));

    let rawCompanies: Company[] = [];
    if (cloudCompanies) {
      rawCompanies = [...cloudCompanies];
      // Apenas mesclar empresas locais criadas no último minuto (ainda não sincronizadas)
      const oneMinuteAgo = new Date(Date.now() - 60 * 1000).toISOString();
      localCompanies.forEach(lc => {
        const isVeryNew = lc.createdAt && lc.createdAt > oneMinuteAgo;
        if (isVeryNew && !rawCompanies.some(c => c.id === lc.id || (c.email && lc.email && c.email.toLowerCase().trim() === lc.email.toLowerCase().trim()))) {
          rawCompanies.push(lc);
        }
      });
    } else {
      rawCompanies = localCompanies;
    }

    // Mapear empresas garantindo que planos e expirações do Supabase sejam normalizados
    let allCompanies = await Promise.all(rawCompanies.map(async (company) => {
      const mapped = mapCompanyFromSupabase(company);
      const localComp = localMap.get(mapped.id);
      
      const possibleKeys = [
        mapped.id,
        mapped.id ? String(mapped.id).toLowerCase() : null,
        mapped.id ? String(mapped.id).toUpperCase() : null,
        mapped.email ? String(mapped.email).toLowerCase().trim() : null
      ].filter(Boolean) as string[];

      const validTimes: number[] = [];

      for (const key of possibleKeys) {
        if (serverPresenceMap[key]) {
          const t = new Date(serverPresenceMap[key]).getTime();
          if (!isNaN(t)) validTimes.push(t);
        }
      }

      const cloudTime = mapped.lastSeenAt || (mapped as any).last_seen_at;
      const localTime = localComp?.lastSeenAt || (localComp as any)?.last_seen_at;

      if (cloudTime && !isNaN(new Date(cloudTime).getTime())) validTimes.push(new Date(cloudTime).getTime());
      if (localTime && !isNaN(new Date(localTime).getTime())) validTimes.push(new Date(localTime).getTime());

      const existingInState = companiesRef.current?.find(c => c.id === mapped.id || (c.email && mapped.email && c.email.toLowerCase().trim() === mapped.email.toLowerCase().trim()));
      const stateTime = existingInState?.lastSeenAt || (existingInState as any)?.last_seen_at;
      if (stateTime && !isNaN(new Date(stateTime).getTime())) validTimes.push(new Date(stateTime).getTime());

      const maxTime = validTimes.length > 0 ? Math.max(...validTimes) : null;
      const bestLastSeen = maxTime ? new Date(maxTime).toISOString() : undefined;

      const dbUnlockReq = Boolean(mapped.unlockRequested || (mapped as any).unlock_requested || (mapped as any).unlockrequested);
      const dbCanEdit = Boolean(mapped.canEditSensitiveData || (mapped as any).can_edit_sensitive_data || (mapped as any).caneditsensitivedata);

      let isExpired = false;
      if (mapped.plan !== PlanType.FREE && mapped.subscriptionExpiresAt) {
        const expTime = new Date(mapped.subscriptionExpiresAt).getTime();
        if (!isNaN(expTime) && expTime < Date.now()) {
          isExpired = true;
        }
      }

      let finalPlan = isExpired ? PlanType.FREE : mapped.plan;
      let finalExpiresAt = isExpired ? undefined : mapped.subscriptionExpiresAt;
      let finalCanEdit = isExpired ? false : (dbUnlockReq ? false : dbCanEdit);

      const rawFirstLogin = mapped.firstLoginAt || (mapped as any).first_login_at || bestLastSeen || mapped.lastSeenAt || (mapped as any).createdAt || (mapped as any).created_at;

      const updatedCompany: Company = {
        ...mapped,
        firstLoginAt: rawFirstLogin,
        first_login_at: rawFirstLogin,
        plan: finalPlan,
        subscriptionExpiresAt: finalExpiresAt,
        canEditSensitiveData: finalCanEdit,
        unlockRequested: isExpired ? false : dbUnlockReq,
        lastSeenAt: bestLastSeen || mapped.lastSeenAt,
        last_seen_at: bestLastSeen || (mapped as any).last_seen_at
      };

      if (rawFirstLogin && !mapped.firstLoginAt && supabase) {
        supabase.from('companies').update({ firstLoginAt: rawFirstLogin }).eq('id', mapped.id).then(() => {}, () => {});
      }

      // Se o plano no Supabase foi alterado para pago e atualizamos subscriptionExpiresAt para uma data futura válida,
      // salva de volta no Supabase para sincronizar
      if (company.plan !== updatedCompany.plan || (company as any).subscription_expires_at !== updatedCompany.subscriptionExpiresAt) {
        await saveCompany(updatedCompany);
      }

      return updatedCompany;
    }));
    
    // Check for expired subscriptions and downgrade them automatically in background
    const nowTime = Date.now();
    let updatedAny = false;
    
    const checkedCompanies = await Promise.all(allCompanies.map(async (company) => {
      if (company.plan !== PlanType.FREE && company.subscriptionExpiresAt) {
        const expiryDate = new Date(company.subscriptionExpiresAt);
        if (expiryDate.getTime() < nowTime) {
          console.log(`[MasterPanel] Auto-downgrade for ${company.name} (Expired ${company.subscriptionExpiresAt})`);
          const updated = {
            ...company,
            plan: PlanType.FREE,
            subscriptionExpiresAt: undefined,
            canEditSensitiveData: false,
            unlockRequested: false
          };
          await saveCompany(updated);
          updatedAny = true;
          return updated;
        }
      }
      return company;
    }));
    
    if (updatedAny) {
      allCompanies = checkedCompanies;
    }
    
    // Atualizar localStorage com os dados da nuvem
    if (cloudCompanies) {
      safeSetItem('atrios_companies', JSON.stringify(allCompanies));
    }

    // Buscar mensagens do Supabase
    const { data: cloudMessages, error: messagesError } = await safeFetch<any[]>(supabase.from('messages').select('*'));
    
    if (messagesError) {
      console.warn("MasterPanel: Falha ao buscar mensagens (Cloud).", messagesError.message);
    } else if (cloudMessages) {
      const fetchedMsgs = cloudMessages.map(mapMessageFromSupabase);
      const fifteenSecsAgo = new Date(Date.now() - 15 * 1000).toISOString();
      const localMsgsStr = localStorage.getItem('atrios_messages');
      let localMsgs: SupportMessage[] = localMsgsStr ? JSON.parse(localMsgsStr) : [];
      
      const mergedMsgs = [...fetchedMsgs];
      localMsgs.forEach(lm => {
        if (!mergedMsgs.some(mm => String(mm.id) === String(lm.id))) {
          // Apenas preserva mensagens locais super recentes enviadas nos últimos 15s que ainda não chegaram à cloud
          const isBrandNew = lm.timestamp && lm.timestamp > fifteenSecsAgo;
          if (isBrandNew) {
            mergedMsgs.push(lm);
            syncToCloud('messages', lm).catch(e => console.warn('MasterPanel: Erro ao re-sincronizar mensagem local:', e));
          }
        }
      });
      
      safeSetItem('atrios_messages', JSON.stringify(mergedMsgs));
    }

    const allMsgs = getMessages();
    const currentSelected = selectedCompanyIdRef.current;
    if (currentSelected) {
      setMessages(allMsgs.filter(m => String(m.companyId) === String(currentSelected)));
    } else {
      setMessages([]);
    }

    // Normalizar unlockRequested em allCompanies com base em mensagens de solicitação de desbloqueio pendentes
    allCompanies = allCompanies.map(c => {
      const hasUnlockMsg = allMsgs.some(m => 
        String(m.companyId) === String(c.id) && 
        m.senderRole === 'user' && 
        (m.content.includes("SOLICITAÇÃO DE DESBLOQUEIO") || m.content.includes("SOLICITACAO DE DESBLOQUEIO"))
      );
      const isReq = Boolean(
        c.unlockRequested || 
        (c as any).unlock_requested || 
        (c as any).unlockrequested || 
        (hasUnlockMsg && c.canEditSensitiveData === false)
      );
      return {
        ...c,
        unlockRequested: isReq
      };
    });

    // Alertas de Desbloqueio
    const unlockCount = allCompanies.filter(c => c.unlockRequested).length;
    if (unlockCount > prevUnlockCount.current) {
       const newReq = allCompanies.find(c => c.unlockRequested && !companiesRef.current.find(old => old.id === c.id && old.unlockRequested));
       if (newReq) {
         setLastUnlockAlert(newReq.name);
         triggerPushNotificationSubmit(
           "Solicitação de Desbloqueio 🔑",
           `A empresa ${newReq.name} solicitou o desbloqueio da conta para editar dados nas Definições.`
         );
       }
    }
    prevUnlockCount.current = unlockCount;

    // Alertas de Novos Cadastros detectados na sincronização
    if (prevCompaniesCount.current > 0 && allCompanies.length > prevCompaniesCount.current) {
      const newlyAdded = allCompanies.filter(c => !companiesRef.current.some(old => old.id === c.id));
      newlyAdded.forEach(newC => {
        triggerPushNotificationSubmit(
          "Novo Cadastro de Usuário! 👤",
          `A empresa "${newC.name}" (${newC.email}) acabou de se cadastrar no Átrios App!`
        );
      });
    }
    prevCompaniesCount.current = allCompanies.length;

    const unreadMessages = allMsgs.filter(m => m.senderRole === 'user' && !m.read);
    const unreadCount = unreadMessages.length;
    if (unreadCount > prevUnreadCount.current) {
       const last = unreadMessages[unreadMessages.length - 1];
       const sender = allCompanies.find(c => String(c.id) === String(last.companyId));
       if (sender) {
         if (activeTab !== 'messages') setLastMessageAlert({ name: sender.name, content: last.content });
         const isPasswordReset = last.content?.includes("SOLICITAÇÃO DE RECUPERAÇÃO DE SENHA") || 
                                last.content?.includes("RECUPERAÇÃO DE SENHA") || 
                                last.content?.includes("RECUPERACAO DE SENHA") ||
                                last.content?.includes("SOLICITACAO DE SENHA");
         if (isPasswordReset) {
           triggerPushNotificationSubmit(
             "Solicitação de Nova Senha 🔑",
             `O utilizador "${sender.name}" (${sender.email}) solicitou a recuperação/redefinição de senha da sua conta.`
           );
         } else {
           triggerPushNotificationSubmit(
             `Mensagem de ${sender.name} 💬`,
             last.content
           );
         }
       }
    }
    prevUnreadCount.current = unreadCount;

    // Buscar pedidos da loja
    console.log("MasterPanel: Buscando pedidos da loja no Supabase...");
    const { data: cloudOrders, error: ordersError } = await safeFetch<any[]>(supabase.from('store_orders').select('*'));
    const mappedOrders = cloudOrders ? cloudOrders.map(mapOrderFromSupabase) : [];
    
    // Buscar orçamentos no Supabase
    console.log("MasterPanel: Buscando orçamentos no Supabase...");
    const { data: cloudBudgets, error: budgetsError } = await safeFetch<any[]>(supabase.from('budgets').select('*'));
    if (!budgetsError && cloudBudgets) {
      const mappedBudgets = cloudBudgets.map(mapBudgetFromSupabase);
      safeSetItem('atrios_budgets', JSON.stringify(mappedBudgets));

      if (prevBudgetsCount.current > 0 && mappedBudgets.length > prevBudgetsCount.current) {
        const newBudgetCount = mappedBudgets.length - prevBudgetsCount.current;
        triggerPushNotificationSubmit(
          "Novo Pedido de Orçamento! 📑",
          `${newBudgetCount} novo(s) orçamento(s) registado(s) na plataforma.`
        );
      }
      prevBudgetsCount.current = mappedBudgets.length;
    }

    if (ordersError) {
      console.warn("MasterPanel: Erro ao buscar pedidos da loja:", ordersError.message, ordersError.details);
    } else {
      console.log(`MasterPanel: ${mappedOrders.length} pedidos recebidos do cloud.`);
    }
    
    if (!ordersError && cloudOrders) {
      safeSetItem('atrios_store_orders', JSON.stringify(mappedOrders));
      setStoreOrders(mappedOrders.sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
      }));
    } else {
      setStoreOrders(getStoreOrders());
    }

    setCustomOrders(getStoredCustomOrders());

    // Buscar produtos da loja
    const { data: cloudProducts, error: productsError } = await safeFetch<any[]>(supabase.from('products').select('*'));
    if (productsError) {
      console.warn("Erro ao buscar produtos:", productsError.message);
    }
    console.log("Produtos recebidos do cloud:", cloudProducts);

    if (cloudProducts && cloudProducts.length > 0) {
      const syncedProducts = cloudProducts.map(p => ({ ...p, synced: true }));
      safeSetItem('atrios_products', JSON.stringify(syncedProducts));
      setProducts(syncedProducts.sort((a, b) => {
        const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
        const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
        return dateB - dateA;
      }));
    } else {
      const localProducts = await getProducts();
      if (localProducts.length > 0) {
        setProducts(localProducts);
      }
    }

    // Buscar Vagas de Trabalho
    console.log("MasterPanel: Buscando vagas de trabalho no Supabase...");
    const { data: cloudJobOffers } = await safeFetch<any[]>(supabase.from('job_offers').select('*'));
    const localJobs = getStoredJobOffers();
    let finalJobs: JobOffer[] = [];

    if (cloudJobOffers && Array.isArray(cloudJobOffers)) {
      const mappedJobs = cloudJobOffers.map(mapJobOfferFromSupabase);
      const unsyncedLocal = localJobs.filter(lj => (lj as any).synced === false && !mappedJobs.some(mj => String(mj.id) === String(lj.id)));
      finalJobs = [...mappedJobs, ...unsyncedLocal];
    } else {
      finalJobs = localJobs;
    }

    // Retain candidatesJson from local storage if cloud version is empty
    const localJobsMap = new Map(localJobs.map(lj => [String(lj.id), lj]));
    finalJobs = finalJobs.map(fj => {
      const localVer = localJobsMap.get(String(fj.id));
      if (!fj.candidatesJson && localVer?.candidatesJson) {
        return { ...fj, candidatesJson: localVer.candidatesJson };
      }
      return fj;
    });

    safeSetItem('atrios_job_offers', JSON.stringify(finalJobs));
    setJobOffers(finalJobs.sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA;
    }).map(j => {
      if (candidateJsonInputsRef.current[j.id] !== undefined) {
        return { ...j, candidatesJson: candidateJsonInputsRef.current[j.id] };
      }
      return j;
    }));

    // Buscar Candidatos na Tabela candidates
    console.log("MasterPanel: Buscando candidatos no Supabase...");
    const { data: cloudCandidates } = await safeFetch<any[]>(supabase.from('candidates').select('*'));
    const localCandidates = getStoredCandidates();
    let finalCandidates: Candidate[] = [];

    if (cloudCandidates && Array.isArray(cloudCandidates)) {
      const mappedCand = cloudCandidates.map(mapCandidateFromSupabase);
      const candMap = new Map<string, Candidate>();
      localCandidates.forEach(c => candMap.set(String(c.id), c));
      mappedCand.forEach(c => candMap.set(String(c.id), c));
      finalCandidates = Array.from(candMap.values());
    } else {
      finalCandidates = localCandidates;
    }
    setCandidatesList(finalCandidates);

    // Buscar Pedidos de Obras / Serviços de Clientes Particulares
    console.log("MasterPanel: Buscando pedidos de orçamento de particulares...");
    const cloudRequests = await fetchClientRequestsFromSupabase();
    setClientRequestsList(cloudRequests);

    // Buscar transações no Supabase
    let allTransactions: Transaction[] = [];
    try {
      const { data: cloudTransactions, error: txError } = await safeFetch<any[]>(supabase.from('transactions').select('*'));
      if (!txError && Array.isArray(cloudTransactions)) {
        allTransactions = cloudTransactions.map((t: any) => ({
          id: String(t.id),
          companyId: t.companyId || t.company_id || '',
          companyName: t.companyName || t.company_name || 'Cliente',
          planType: t.planType || t.plan_type || PlanType.PREMIUM_MONTHLY,
          amount: Number(t.amount || 0),
          ivaAmount: Number(t.ivaAmount || t.iva_amount || 0),
          totalAmount: Number(t.totalAmount || t.total_amount || 0),
          couponUsed: t.couponUsed || t.coupon_used,
          date: t.date || t.created_at || new Date().toISOString()
        }));
        // Supabase é a fonte de verdade para transações
        safeSetItem('atrios_transactions', JSON.stringify(allTransactions));
      } else {
        allTransactions = getTransactions();
      }
    } catch (txErr) {
      allTransactions = getTransactions();
    }

    setCompanies(prevCompanies => {
      const prevMap = new Map<string, Company>(prevCompanies.map(c => [c.id, c]));
      const merged = allCompanies.map((c: Company) => {
        const prev = prevMap.get(c.id);
        if (!prev) return c;
        const prevTime = prev.lastSeenAt ? new Date(prev.lastSeenAt).getTime() : 0;
        const currTime = c.lastSeenAt ? new Date(c.lastSeenAt).getTime() : 0;
        if (prevTime > currTime) {
          const bestIso = new Date(prevTime).toISOString();
          return { ...c, lastSeenAt: bestIso, last_seen_at: bestIso };
        }
        return c;
      });
      companiesRef.current = merged;
      return merged;
    });
    setTransactions(allTransactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    setCoupons(getCoupons());

    if (selectedCompanyId) {
      setMessages(allMsgs.filter(m => String(m.companyId) === String(selectedCompanyId)));
    }
    } catch (error) {
      console.error("Error loading data in MasterPanel:", error);
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    loadData();

    if (!supabase) return;

    // Subscrição para novas mensagens (todas, para o Master)
    const msgChannel = supabase
      .channel('master-messages')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'messages' },
        (payload) => {
          console.log('Master message change detected:', payload.eventType, payload);
          const newMessage = mapMessageFromSupabase(payload['new'] || payload['old']);
          if (!newMessage || !newMessage.id) return;
          
          const allMsgs = getMessages();
          let changed = false;

          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            const existingIdx = allMsgs.findIndex(m => String(m.id) === String(newMessage.id));
            if (existingIdx === -1) {
              allMsgs.push(newMessage);
              changed = true;
              
              if (newMessage.senderRole === 'user' && payload.eventType === 'INSERT') {
                const allCompanies = getStoredCompanies();
                const sender = allCompanies.find(c => String(c.id) === String(newMessage.companyId));
                const currentSelected = selectedCompanyIdRef.current;
                if (sender && (activeTab !== 'messages' || String(currentSelected) !== String(newMessage.companyId))) {
                  setLastMessageAlert({ name: sender.name, content: newMessage.content });
                }
                const senderName = sender ? sender.name : "Cliente";
                const isPasswordReset = newMessage.content?.includes("SOLICITAÇÃO DE RECUPERAÇÃO DE SENHA") || 
                                       newMessage.content?.includes("RECUPERAÇÃO DE SENHA") || 
                                       newMessage.content?.includes("RECUPERACAO DE SENHA") ||
                                       newMessage.content?.includes("SOLICITACAO DE SENHA");
                if (isPasswordReset) {
                  triggerPushNotificationSubmit(
                    "Solicitação de Nova Senha 🔑",
                    `O utilizador "${senderName}" (${sender ? sender.email : ''}) solicitou recuperação de senha.`
                  );
                } else {
                  triggerPushNotificationSubmit(
                    `Mensagem de ${senderName} 💬`,
                    newMessage.content
                  );
                }
              }
            } else {
              if (JSON.stringify(allMsgs[existingIdx]) !== JSON.stringify(newMessage)) {
                allMsgs[existingIdx] = { ...allMsgs[existingIdx], ...newMessage };
                changed = true;
              }
            }
          } else if (payload.eventType === 'DELETE') {
            const idx = allMsgs.findIndex(m => String(m.id) === String(newMessage.id));
            if (idx > -1) {
              allMsgs.splice(idx, 1);
              changed = true;
            }
          }

          if (changed) {
            safeSetItem('atrios_messages', JSON.stringify(allMsgs));
            const currentSelected = selectedCompanyIdRef.current;
            if (currentSelected && String(currentSelected) === String(newMessage.companyId)) {
              setMessages(allMsgs.filter(m => String(m.companyId) === String(currentSelected)));
            } else {
              setCompanies(prev => [...prev]);
            }
          }
        }
      )
      .subscribe((status) => {
        console.log('Master messages subscription status:', status);
      });

    // Subscrição para mudanças nas empresas (novos usuários e pedidos de desbloqueio)
    const companyChannel = supabase
      .channel('master-companies')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'companies' },
        (payload) => {
          console.log('Master company change detected:', payload.eventType, payload);
          const raw = payload['new'] || payload['old'];
          if (!raw) return;
          const updatedCompany = mapCompanyFromSupabase(raw);
          if (!updatedCompany || ['atriossoftware@gmail.com', 'jeferson.goes36@gmail.com'].includes(updatedCompany.email)) return;
          
          const companies = getStoredCompanies();
          let changed = false;

          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            const idx = companies.findIndex(c => 
              c.id === updatedCompany.id || 
              (c.email && updatedCompany.email && c.email.toLowerCase().trim() === updatedCompany.email.toLowerCase().trim())
            );
            if (idx > -1) {
              const old = companies[idx];
              if (!old.unlockRequested && updatedCompany.unlockRequested) {
                setLastUnlockAlert(updatedCompany.name);
                triggerPushNotificationSubmit(
                  "Acesso Solicitado 🔑",
                  `A empresa ${updatedCompany.name} solicitou o desbloqueio da sua conta.`
                );
              }
              
              const existingInState = companiesRef.current?.find(c => 
                c.id === updatedCompany.id || 
                (c.email && updatedCompany.email && c.email.toLowerCase().trim() === updatedCompany.email.toLowerCase().trim())
              );

              // Preservar a data mais recente de atividade (lastSeenAt / last_seen_at)
              const bestLastSeenTimes = [
                updatedCompany.lastSeenAt,
                (updatedCompany as any).last_seen_at,
                old.lastSeenAt,
                (old as any).last_seen_at,
                existingInState?.lastSeenAt,
                (existingInState as any)?.last_seen_at
              ].filter(Boolean)
               .map(t => new Date(t!).getTime())
               .filter(t => !isNaN(t));

              const maxLastSeenIso = bestLastSeenTimes.length > 0 ? new Date(Math.max(...bestLastSeenTimes)).toISOString() : undefined;

              const dbUnlockReq = Boolean(updatedCompany.unlockRequested || (updatedCompany as any).unlock_requested || (updatedCompany as any).unlockrequested);
              const dbCanEdit = Boolean(updatedCompany.canEditSensitiveData || (updatedCompany as any).can_edit_sensitive_data || (updatedCompany as any).caneditsensitivedata);

              let isExpired = false;
              if (updatedCompany.plan !== PlanType.FREE && updatedCompany.subscriptionExpiresAt) {
                const expTime = new Date(updatedCompany.subscriptionExpiresAt).getTime();
                if (!isNaN(expTime) && expTime < Date.now()) {
                  isExpired = true;
                }
              }

              let finalPlan = isExpired ? PlanType.FREE : updatedCompany.plan;
              let finalExpiresAt = isExpired ? undefined : updatedCompany.subscriptionExpiresAt;
              let finalCanEdit = isExpired ? false : (dbUnlockReq ? false : dbCanEdit);

              const mergedCompany: Company = {
                ...old,
                ...updatedCompany,
                plan: finalPlan,
                subscriptionExpiresAt: finalExpiresAt,
                canEditSensitiveData: finalCanEdit,
                unlockRequested: isExpired ? false : dbUnlockReq,
                lastSeenAt: maxLastSeenIso || old.lastSeenAt || updatedCompany.lastSeenAt,
                last_seen_at: maxLastSeenIso || (old as any).last_seen_at || (updatedCompany as any).last_seen_at
              };

              if (JSON.stringify(old) !== JSON.stringify(mergedCompany)) {
                companies[idx] = mergedCompany;
                changed = true;
              }
            } else {
              companies.push(updatedCompany);
              changed = true;
              if (payload.eventType === 'INSERT') {
                triggerPushNotificationSubmit(
                  "Novo Cadastro de Usuário! 👤",
                  `A empresa "${updatedCompany.name}" acabou de se registar no Átrios App!`
                );
              }
            }
          } else if (payload.eventType === 'DELETE') {
            const oldRaw = payload['old'];
            const delId = oldRaw?.id || oldRaw?.company_id || updatedCompany?.id;
            const delEmail = oldRaw?.email || updatedCompany?.email;
            
            const idx = companies.findIndex(c => 
              (delId && c.id === delId) || 
              (delEmail && c.email && c.email.toLowerCase().trim() === delEmail.toLowerCase().trim())
            );
            if (idx > -1) {
              companies.splice(idx, 1);
              changed = true;
            }
          }
          
          if (changed) {
            safeSetItem('atrios_companies', JSON.stringify(companies));
            const masterEmails = ['atriossoftware@gmail.com', 'jeferson.goes36@gmail.com'];
            const filtered = companies.filter(c => !masterEmails.includes(c.email));
            setCompanies(prevCompanies => {
              return filtered.map(c => {
                const prev = prevCompanies.find(p => p.id === c.id);
                if (prev) {
                  const prevTime = prev.lastSeenAt ? new Date(prev.lastSeenAt).getTime() : 0;
                  const currTime = c.lastSeenAt ? new Date(c.lastSeenAt).getTime() : 0;
                  if (prevTime > currTime) {
                    const bestIso = new Date(prevTime).toISOString();
                    return { ...c, lastSeenAt: bestIso, last_seen_at: bestIso };
                  }
                }
                return c;
              });
            });
          }
        }
      )
      .subscribe((status) => {
        console.log('Master companies subscription status:', status);
      });

    // Subscrição para novos pedidos da loja
    const storeOrdersChannel = supabase
      .channel('master-store-orders')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'store_orders' },
        (payload) => {
          console.log("Master order change detected:", payload.eventType, payload);
          if (payload.eventType === 'INSERT') {
            const prodName = payload['new']?.productName || payload['new']?.product_name || 'Produto';
            triggerPushNotificationSubmit(
              "Novo Pedido na Loja! 🛒",
              `Novo pedido recebido: ${prodName}`
            );
          }
          loadData();
        }
      )
      .subscribe((status) => {
        console.log('Master orders subscription status:', status);
      });

    // Subscrição para vagas de trabalho
    const jobOffersChannel = supabase
      .channel('master-job-offers')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'job_offers' },
        (payload) => {
          console.log("Master job offer change detected:", payload.eventType, payload);
          if (payload.eventType === 'INSERT') {
            const specialty = payload['new']?.specialty || 'Vaga de Trabalho';
            triggerPushNotificationSubmit(
              "Nova Vaga Submetida! 💼",
              `Nova vaga submetida para avaliação: ${specialty}`
            );
          }
          loadData();
        }
      )
      .subscribe();

    // Subscrição para orçamentos
    const budgetsChannel = supabase
      .channel('master-budgets')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'budgets' },
        (payload) => {
          console.log("Master budget change detected:", payload.eventType, payload);
          if (payload.eventType === 'INSERT') {
            const raw = payload['new'];
            const clientName = raw?.client_name || raw?.clientName || raw?.companyName || raw?.company_name || 'Cliente';
            const total = raw?.total_amount || raw?.totalAmount || raw?.total || '';
            const totalStr = total ? ` (€${total})` : '';
            triggerPushNotificationSubmit(
              "Novo Pedido de Orçamento! 📑",
              `Solicitação de orçamento recebida de ${clientName}${totalStr}`
            );
          }
          loadData();
        }
      )
      .subscribe();

    // Subscrição para pedidos personalizados / projetos especiais
    const customOrdersChannel = supabase
      .channel('master-custom-orders')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'custom_order_requests' },
        (payload) => {
          console.log("Master custom order change detected:", payload.eventType, payload);
          if (payload.eventType === 'INSERT') {
            const raw = payload['new'];
            const clientName = raw?.companyName || raw?.company_name || raw?.clientName || raw?.client_name || 'Cliente';
            const projectType = raw?.projectType || raw?.project_type || raw?.title || 'Projeto Especial';
            triggerPushNotificationSubmit(
              "Nova Solicitação Especial! 🎨",
              `Novo projeto personalizado recebido de ${clientName}: ${projectType}`
            );
          }
          loadData();
        }
      )
      .subscribe();

    // Subscrição para novos candidatos a vagas
    const candidatesChannel = supabase
      .channel('master-candidates')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'candidates' },
        (payload) => {
          console.log("Master candidate change detected:", payload.eventType, payload);
          if (payload.eventType === 'INSERT') {
            const raw = payload['new'];
            const candName = raw?.full_name || raw?.fullName || raw?.name || 'Candidato';
            triggerPushNotificationSubmit(
              "Novo Candidato Registado! 👤💼",
              `Nova candidatura submetida por ${candName}`
            );
          }
          loadData();
        }
      )
      .subscribe();

    // Subscrição em tempo real para notificações push globais no Master
    const globalPushChannel = supabase
      .channel('master-global-push-notifications')
      .on(
        'broadcast',
        { event: 'push' },
        (payload) => {
          console.log('[Master Realtime Push Received]', payload);
          if (payload?.payload) {
            const { title, body } = payload.payload;
            if (title && body) {
              triggerPushNotificationSubmit(title, body);
            }
          }
        }
      )
      .subscribe();

    // Sincronização de solicitações de orçamentos e dados gerais a cada 10 minutos (economia de banco)
    const budgetSyncInterval = setInterval(() => {
      console.log("[MasterPanel] Sincronizando dados e orçamentos (intervalo 10 min)...");
      loadData();
    }, 10 * 60 * 1000);

    // Verificação em tempo real de expiração de teste/subscrição (a cada 3 segundos)
    const expiryRealtimeCheckInterval = setInterval(() => {
      const now = Date.now();
      setCompanies(prevCompanies => {
        let changed = false;
        const updatedList = prevCompanies.map(company => {
          if (company.plan !== PlanType.FREE && company.subscriptionExpiresAt) {
            const expTime = new Date(company.subscriptionExpiresAt).getTime();
            if (!isNaN(expTime) && expTime < now) {
              changed = true;
              const downgraded: Company = {
                ...company,
                plan: PlanType.FREE,
                subscriptionExpiresAt: undefined,
                canEditSensitiveData: false,
                unlockRequested: false
              };
              saveCompany(downgraded);
              return downgraded;
            }
          }
          return company;
        });
        return changed ? updatedList : prevCompanies;
      });
    }, 3000);

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'atrios_messages') {
        const currentSelected = selectedCompanyIdRef.current;
        if (currentSelected) {
          setMessages(getMessages(currentSelected));
        }
      }
    };
    window.addEventListener('storage', handleStorageChange);

    return () => {
      supabase.removeChannel(msgChannel);
      supabase.removeChannel(companyChannel);
      supabase.removeChannel(storeOrdersChannel);
      supabase.removeChannel(jobOffersChannel);
      supabase.removeChannel(budgetsChannel);
      supabase.removeChannel(customOrdersChannel);
      supabase.removeChannel(candidatesChannel);
      supabase.removeChannel(globalPushChannel);
      clearInterval(budgetSyncInterval);
      clearInterval(expiryRealtimeCheckInterval);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [activeTab, selectedCompanyId]);

  const pendingJobsCount = useMemo(() => jobOffers.filter(j => j.status === 'pending').length, [jobOffers]);

  const handleApproveJob = async (job: JobOffer) => {
    setJobOffers(prev => prev.map(j => String(j.id) === String(job.id) ? { ...j, status: 'approved', feedback: '' } : j));
    const result = await updateJobOfferStatus(job.id, 'approved', '');
    if (!result.success) {
      console.warn("Aviso na atualização da vaga em nuvem:", result.error);
    }
    fetch('/api/push/notify-user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        companyId: job.companyId,
        title: 'Vaga de Trabalho Aprovada! 🎉',
        body: `A sua vaga para "${job.specialty}" em ${job.location} foi aprovada e já se encontra ativa no Átrios Work.`
      })
    }).catch(err => console.warn("Push notify user failed:", err));
  };

  const handleOpenJobFeedbackModal = (job: JobOffer, status: JobOfferStatus) => {
    setJobFeedbackModal({
      id: job.id,
      status,
      companyId: job.companyId,
      specialty: job.specialty,
      title: status === 'adjustment_requested' ? 'Solicitar Ajuste na Vaga' : 'Desaprovar Vaga de Trabalho'
    });
    setJobFeedbackText(job.feedback || '');
  };

  const handleConfirmJobFeedback = async () => {
    if (!jobFeedbackModal) return;
    const { id, status, companyId, specialty } = jobFeedbackModal;
    setJobOffers(prev => prev.map(j => String(j.id) === String(id) ? { ...j, status, feedback: jobFeedbackText } : j));
    const result = await updateJobOfferStatus(id, status, jobFeedbackText);
    if (!result.success) {
      console.warn("Aviso na atualização da vaga em nuvem:", result.error);
    }
    const isAdjustment = status === 'adjustment_requested';
    const specStr = specialty ? ` ("${specialty}")` : '';
    fetch('/api/push/notify-user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        companyId: companyId,
        title: isAdjustment ? 'Ajuste Solicitado na Vaga ⚠️' : 'Vaga de Trabalho Desaprovada ❌',
        body: isAdjustment
          ? `O suporte solicitou um ajuste na sua vaga${specStr}: "${jobFeedbackText}"`
          : `A sua vaga de trabalho${specStr} não foi aprovada. Motivo: "${jobFeedbackText}"`
      })
    }).catch(err => console.warn("Push notify user failed:", err));
    setJobFeedbackModal(null);
    setJobFeedbackText('');
  };

  const handleDeleteJob = async (id: string) => {
    if (!window.confirm("Excluir esta vaga de trabalho permanentemente?")) return;
    setJobOffers(prev => prev.filter(j => String(j.id) !== String(id)));
    const result = await deleteJobOffer(id);
    if (result.success) {
      alert("Vaga excluída com sucesso!");
    } else {
      const err = result.error;
      if (err?.code === '42501' || String(err?.message || '').includes('row-level security')) {
        alert(`Vaga removida localmente, mas a exclusão no Supabase falhou por RLS (Row Level Security).\n\nCertifique-se de que a tabela 'job_offers' tem permissão de DELETE no Supabase.`);
      } else {
        alert(`Vaga removida localmente! Aviso Supabase: ${err?.message || 'Erro de conexão'}`);
      }
    }
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const pendingRequestsCount = useMemo(() => companies.filter(c => Boolean(c.unlockRequested || (c as any).unlock_requested || (c as any).unlockrequested)).length, [companies]);

  const unreadMessagesTotalCount = useMemo(() => {
    const allMsgs = getMessages();
    return allMsgs.filter(m => m.senderRole === 'user' && !m.read).length;
  }, [companies, messages, storeOrders, customOrders]);

  const pendingStoreOrdersCount = useMemo(() => {
    const pendingStore = storeOrders.filter(o => o.status === 'pending').length;
    const pendingCustom = customOrders.filter(o => o.status === 'pending').length;
    return pendingStore + pendingCustom;
  }, [storeOrders, customOrders]);

  const isFreePlan = (plan?: string) => {
    if (!plan) return true;
    const p = String(plan).toLowerCase().trim();
    return p === PlanType.FREE || p === 'free' || p === 'gratis' || p === 'gráti' || p === 'grátis';
  };

  const isAnnualPlan = (plan?: string) => {
    if (!plan || isFreePlan(plan)) return false;
    const p = String(plan).toLowerCase().trim();
    return p === PlanType.PREMIUM_ANNUAL || p === 'premium_annual' || p === 'annual' || p === 'anual' || p.includes('annual') || p.includes('anual');
  };

  const isMonthlyPlan = (plan?: string) => {
    if (!plan || isFreePlan(plan)) return false;
    if (isAnnualPlan(plan)) return false;
    return true;
  };

  const financialStats = useMemo(() => {
    let monthlySales = transactions
      .filter(tx => isMonthlyPlan(tx.planType))
      .reduce((sum, tx) => sum + (Number(tx.totalAmount) || 0), 0);
    let annualSales = transactions
      .filter(tx => isAnnualPlan(tx.planType))
      .reduce((sum, tx) => sum + (Number(tx.totalAmount) || 0), 0);

    const totalRevenue = monthlySales + annualSales;
    const totalIva = totalRevenue - (totalRevenue / 1.23);
    return { totalRevenue, totalIva, monthlySales, annualSales };
  }, [transactions]);

  const userStats = useMemo(() => ({
    total: companies.length,
    free: companies.filter(c => isFreePlan(c.plan)).length,
    monthly: companies.filter(c => isMonthlyPlan(c.plan)).length,
    annual: companies.filter(c => isAnnualPlan(c.plan)).length,
  }), [companies]);

  const chartDataPlans = [
    { name: t.planFree, value: userStats.free, color: '#94a3b8' },
    { name: t.planMonthly, value: userStats.monthly, color: '#3b82f6' },
    { name: t.planAnnual, value: userStats.annual, color: '#f59e0b' },
  ];

  const chartDataSales = [
    { name: t.planFree, value: 0, color: '#94a3b8' },
    { name: t.planMonthly, value: financialStats.monthlySales, color: '#3b82f6' },
    { name: t.planAnnual, value: financialStats.annualSales, color: '#f59e0b' },
  ];

  const getAudienceLabel = (audience: AudienceType) => {
    switch (audience) {
      case 'all': return t.masterAudienceAll;
      case 'free': return t.masterAudienceFree;
      case 'premium_monthly': return t.masterAudienceMonthly;
      case 'premium_annual': return t.masterAudienceAnnual;
      case 'all_premium': return t.masterAudiencePremiumAll;
      case 'monthly_purchase': return t.masterAudienceMonthlyPurchase;
      case 'annual_purchase': return t.masterAudienceAnnualPurchase;
      default: return audience;
    }
  };

  const getTranslatedPlan = (plan: PlanType | string) => {
    if (isFreePlan(plan)) return t.planFree;
    if (isAnnualPlan(plan)) return t.planAnnual;
    return t.planMonthly;
  };

  const handleCreateCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCouponCode) return;
    saveCoupon({ id: Math.random().toString(36).substr(2, 9), code: newCouponCode.toUpperCase(), discountPercentage: newCouponDiscount, active: true, createdAt: new Date().toISOString() });
    setCoupons(getCoupons());
    setNewCouponCode('');
  };

  const handleDeleteCoupon = (id: string) => { removeCoupon(id); setCoupons(getCoupons()); };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedCompanyId) return;

    const messageText = newMessage;
    setNewMessage('');

    const targetComp = companies.find(c => c.id === selectedCompanyId);
    const targetLocale = (targetComp?.lastLocale as Locale) || 'pt-PT';

    // 1. Enviar notificação push offline para o utilizador IMEDIATAMENTE
    fetch('/api/push/notify-user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        companyId: selectedCompanyId,
        title: "Nova Mensagem de Suporte Átrios 💬",
        body: messageText
      })
    }).catch(err => console.error('Error sending push notify-user:', err));

    // 2. Guardar e atualizar lista de mensagens instantaneamente
    const msg: SupportMessage = {
      id: Math.random().toString(36).substr(2, 9),
      companyId: selectedCompanyId,
      senderRole: 'master',
      content: messageText,
      translatedContent: messageText,
      timestamp: new Date().toISOString(),
      read: false
    };

    saveMessage(msg);
    setMessages(prev => [...prev, msg]);

    // 3. Tradução em segundo plano se o cliente usar outro idioma
    if (targetLocale !== 'pt-PT') {
      setIsTranslating(true);
      translateMessage(messageText, targetLocale).then(translated => {
        if (translated && translated !== messageText) {
          const updatedMsg = { ...msg, translatedContent: translated };
          saveMessage(updatedMsg);
          setMessages(prev => prev.map(m => m.id === msg.id ? updatedMsg : m));
        }
      }).catch(err => console.error('Error translating master reply in background:', err))
        .finally(() => setIsTranslating(false));
    }
  };

  const selectChat = (companyId: string) => {
    setSelectedCompanyId(companyId);
    selectedCompanyIdRef.current = companyId;
    setMessages(getMessages(companyId));
    markMessagesAsRead(companyId, 'master');
  };

  const handleClearChat = async (companyId: string) => {
    if (!window.confirm(locale.startsWith('pt') ? "Tem certeza que deseja apagar todas as mensagens desta conversa?" : "Are you sure you want to clear all messages from this chat?")) return;
    
    try {
      await supabase.from('messages').delete().eq('companyId', companyId);
      await supabase.from('messages').delete().eq('company_id', companyId);
      await supabase.from('messages').delete().eq('companyid', companyId);
    } catch (e) {
      console.warn("Erro ao apagar mensagens no Supabase:", e);
    }

    const allMsgs = getMessages();
    const remaining = allMsgs.filter(m => String(m.companyId) !== String(companyId));
    safeSetItem('atrios_messages', JSON.stringify(remaining));
    
    setMessages([]);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 200000) { alert(t.imageTooLarge); return; }
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const saveConfig = () => {
    if (!imagePreview) { alert(t.masterBannerSelectError); return; }
    const updated = [...activeNotifications, { id: Math.random().toString(36).substr(2, 9).toUpperCase(), imageUrl: imagePreview, targetAudience, active: true, createdAt: new Date().toISOString() }];
    saveGlobalNotifications(updated);
    setActiveNotifications(updated);
    setImagePreview(null);
    alert(t.masterConfigSuccess);
  };

  const removeNotification = (id: string) => {
    const updated = activeNotifications.filter(n => n.id !== id);
    saveGlobalNotifications(updated);
    setActiveNotifications(updated);
  };

  const handleSendPush = () => {
    if (!pushTitle.trim() || !pushBody.trim()) {
      alert(locale.startsWith('pt') ? 'Por favor, preencha o título e a mensagem!' : 'Please fill in both title and message!');
      return;
    }

    if (isScheduled) {
      if (!scheduledTime) {
        alert(locale.startsWith('pt') ? 'Por favor, defina a data e a hora do agendamento!' : 'Please set the date and time for the schedule!');
        return;
      }

      let utcScheduledTime = scheduledTime;
      try {
        utcScheduledTime = new Date(scheduledTime).toISOString();
      } catch (err) {
        console.error('Error parsing scheduled time:', err);
      }

      fetch('/api/push/schedule', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: pushTitle,
          body: pushBody,
          targetAudience: pushAudience,
          scheduledTime: utcScheduledTime
        })
      })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          alert(locale.startsWith('pt') ? 'Notificação agendada com sucesso!' : 'Push notification scheduled successfully!');
          loadScheduledPushes();
          setPushTitle('');
          setPushBody('');
          setScheduledTime('');
        } else {
          alert(locale.startsWith('pt') ? 'Erro ao agendar notificação.' : 'Failed to schedule push notification.');
        }
      })
      .catch(err => {
        console.error('Error scheduling push:', err);
        alert(locale.startsWith('pt') ? 'Erro de rede ao agendar.' : 'Network error scheduling push.');
      });
      return;
    }
    
    const newPush: PushNotification = {
      id: Math.random().toString(36).substr(2, 9).toUpperCase(),
      title: pushTitle,
      body: pushBody,
      targetAudience: pushAudience,
      createdAt: new Date().toISOString()
    };
    
    // Trigger push balloon on Master's screen as well
    triggerPushNotificationSubmit(pushTitle, pushBody);

    // Broadcast real-time to online users!
    const channel = supabase.channel('global-push-notifications');
    channel.subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        channel.send({
          type: 'broadcast',
          event: 'push',
          payload: newPush
        }).then(() => {
          console.log('[MasterPanel] Real-time push broadcast sent.');
          try {
            supabase.removeChannel(channel);
          } catch (e) {
            console.error(e);
          }
        });
      }
    });

    // Enviar broadcast offline/background PWA Push (para que chegue com o app completamente fechado!)
    fetch('/api/push/send-broadcast', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        title: pushTitle,
        body: pushBody,
        targetAudience: pushAudience
      })
    })
    .then(res => res.json())
    .then(data => {
      console.log('[MasterPanel] Offline PWA background push broadcast dispatched:', data);
    })
    .catch(err => {
      console.error('[MasterPanel] Error dispatching offline PWA push:', err);
    });

    const updated = [newPush, ...pushHistory];
    setPushHistory(updated);
    safeSetItem('atrios_push_history', JSON.stringify(updated));
    
    setPushTitle('');
    setPushBody('');
    
    alert(locale.startsWith('pt') ? 'Notificação enviada com sucesso em tempo real com logotipo!' : 'Push notification successfully sent in real-time with logo!');
  };

  const handleDeletePushHistory = (id: string) => {
    if (confirm(locale.startsWith('pt') ? 'Tem a certeza que deseja excluir esta notificação do histórico?' : 'Are you sure you want to delete this notification from history?')) {
      const updated = pushHistory.filter(h => h.id !== id);
      setPushHistory(updated);
      safeSetItem('atrios_push_history', JSON.stringify(updated));
    }
  };

  const handleCancelScheduledPush = (id: string) => {
    if (confirm(locale.startsWith('pt') ? 'Tem a certeza que deseja cancelar este agendamento?' : 'Are you sure you want to cancel this scheduled push?')) {
      fetch(`/api/push/scheduled/${id}`, {
        method: 'DELETE'
      })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          alert(locale.startsWith('pt') ? 'Agendamento cancelado com sucesso!' : 'Scheduled push cancelled successfully!');
          loadScheduledPushes();
        } else {
          alert(locale.startsWith('pt') ? 'Erro ao cancelar agendamento.' : 'Failed to cancel schedule.');
        }
      })
      .catch(err => {
        console.error('Error deleting schedule:', err);
        alert(locale.startsWith('pt') ? 'Erro de rede ao cancelar agendamento.' : 'Network error cancelling schedule.');
      });
    }
  };

  const handleTestLocalPush = () => {
    if (!pushTitle.trim() || !pushBody.trim()) {
      alert(locale.startsWith('pt') ? 'Por favor, insira o título de teste e a mensagem!' : 'Please enter active title and message to test!');
      return;
    }
    triggerPushNotificationSubmit(pushTitle, pushBody);
  };

  const broadcastUnlockStatus = (companyId: string, canEdit: boolean) => {
    try {
      const ch = supabase.channel(`user-company-${companyId}`);
      ch.subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          ch.send({
            type: 'broadcast',
            event: 'unlock-status-change',
            payload: {
              companyId,
              canEditSensitiveData: canEdit,
              unlockRequested: false
            }
          });
          setTimeout(() => {
            try { supabase.removeChannel(ch); } catch (e) {}
          }, 2000);
        }
      });
    } catch (e) {
      console.warn('Broadcast unlock status error:', e);
    }
  };

  const toggleUnlock = async (company: Company) => {
    const newCanEdit = !company.canEditSensitiveData;
    const updatedCompany: Company = {
      ...company,
      canEditSensitiveData: newCanEdit,
      unlockRequested: false
    };

    // Update state immediately in Master UI
    setCompanies(prev => prev.map(c => (c.id === company.id || (c.email && company.email && c.email.toLowerCase().trim() === company.email.toLowerCase().trim())) ? updatedCompany : c));
    if (companiesRef.current) {
      companiesRef.current = companiesRef.current.map(c => (c.id === company.id || (c.email && company.email && c.email.toLowerCase().trim() === company.email.toLowerCase().trim())) ? updatedCompany : c);
    }

    // Direct update to Supabase database
    try {
      if (company.id) {
        await supabase
          .from('companies')
          .update({
            can_edit_sensitive_data: newCanEdit,
            caneditsensitivedata: newCanEdit,
            unlock_requested: false,
            unlockrequested: false
          })
          .eq('id', company.id);
      }
      if (company.email) {
        await supabase
          .from('companies')
          .update({
            can_edit_sensitive_data: newCanEdit,
            caneditsensitivedata: newCanEdit,
            unlock_requested: false,
            unlockrequested: false
          })
          .eq('email', company.email.toLowerCase().trim());
      }
    } catch (err) {
      console.warn("Direct Supabase update error in toggleUnlock:", err);
    }

    // Save locally and sync
    await saveCompany(updatedCompany);

    // Broadcast realtime event on company channel
    broadcastUnlockStatus(company.id, newCanEdit);

    // Send Support Message to company and dispatch Web/FCM Push
    try {
      const content = newCanEdit 
        ? "🔓 DESBLOQUEIO CONCEDIDO: O administrador Master autorizou a alteração dos dados da sua empresa nas Definições."
        : "🔒 DESBLOQUEIO REVOGADO: As Definições da empresa foram bloqueadas novamente pelo administrador Master.";
      
      const notifyMsg: SupportMessage = {
        id: generateShortId(),
        companyId: company.id,
        senderRole: 'master',
        content,
        timestamp: new Date().toISOString(),
        read: false
      };
      await saveMessage(notifyMsg);

      fetch('/api/push/notify-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyId: company.id,
          title: newCanEdit ? "Acesso Liberado! 🔑" : "Acesso Bloqueado 🔒",
          body: content
        })
      }).catch(err => console.error('Error sending unlock push to user:', err));
    } catch (e) {
      console.warn('Error saving support message in toggleUnlock:', e);
    }

    loadData();
  };

  const toggleBlock = async (company: Company) => { 
    await saveCompany({ ...company, isBlocked: !company.isBlocked }); 
    loadData(); 
  };

  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showResetPassModal || !newPassValue) return;
    const updated = { ...showResetPassModal, password: newPassValue };
    await saveCompany(updated);
    loadData();
    setShowResetPassModal(null);
    setNewPassValue('');
    alert("Senha alterada com sucesso!");
  };

  const handleSaveNotesSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showNotesModal) return;
    const updated = { ...showNotesModal, masterNotes: notesTextValue };
    await saveCompany(updated);
    try {
      await supabase.from('companies').update({
        master_notes: notesTextValue,
        masternotes: notesTextValue
      }).eq('id', showNotesModal.id);
    } catch (err) {
      console.warn("Direct Supabase update error in master_notes:", err);
    }
    await loadData();
    setShowNotesModal(null);
    setNotesTextValue('');
  };

  const handleRemoveRestrictions = async (company: Company, minutes: number) => {
    if (minutes === 0) {
      const updated = {
        ...company,
        plan: PlanType.FREE,
        subscriptionExpiresAt: undefined,
        canEditSensitiveData: false,
        unlockRequested: false
      };
      await saveCompany(updated);
      try {
        await supabase.from('companies').update({
          plan: 'free',
          subscription_expires_at: null,
          can_edit_sensitive_data: false,
          caneditsensitivedata: false,
          unlock_requested: false,
          unlockrequested: false
        }).or(`id.eq.${company.id},email.eq.${company.email}`);
      } catch (e) { console.warn("Direct update error:", e); }

      broadcastUnlockStatus(company.id, false);

      setCompanies(prev => prev.map(c => c.id === company.id ? updated : c));
      loadData();
      setShowDurationModal(null);
      alert(`Plano de ${company.name} revertido para Grátis (Bloqueado).`);
      return;
    }

    const isAnn = minutes >= 365 * 24 * 60;
    const selectedPlan = isAnn ? PlanType.PREMIUM_ANNUAL : PlanType.PREMIUM_MONTHLY;
    const expiresDate = new Date(Date.now() + minutes * 60 * 1000).toISOString();

    const currentCanEdit = Boolean(company.canEditSensitiveData);

    const updated = { 
      ...company, 
      plan: selectedPlan, 
      subscriptionExpiresAt: expiresDate,
      isManual: true,
      canEditSensitiveData: currentCanEdit,
      unlockRequested: false
    };
    await saveCompany(updated);
    try {
      await supabase.from('companies').update({
        plan: selectedPlan,
        subscription_expires_at: expiresDate,
        can_edit_sensitive_data: currentCanEdit,
        caneditsensitivedata: currentCanEdit,
        unlock_requested: false,
        unlockrequested: false
      }).or(`id.eq.${company.id},email.eq.${company.email}`);
    } catch (e) { console.warn("Direct update error:", e); }

    broadcastUnlockStatus(company.id, currentCanEdit);

    setCompanies(prev => prev.map(c => c.id === company.id ? updated : c));
    loadData();
    setShowDurationModal(null);
    alert(`Plano/Período ativado para ${company.name} por ${minutes === 2 ? '2 Minutos (Teste Rápido)' : Math.round(minutes / (24 * 60)) + ' Dias'}.${currentCanEdit ? '' : ' (Os dados sensíveis permanecem bloqueados até liberação explícita.)'}`);
  };

  const handleDeleteUser = (id: string, name: string) => {
    if (window.confirm(`${t.masterDeleteUser} "${name}"?`)) {
      const targetCompany = companies.find(c => c.id === id);
      removeCompany(id, targetCompany?.email);
      setCompanies(prev => prev.filter(c => c.id !== id));
      if (selectedCompanyId === id) setSelectedCompanyId(null);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: 'pending' | 'processing' | 'completed') => {
    // 1. Disparar notificação Push instantaneamente
    const targetOrder = storeOrders.find(o => o.id === orderId);
    if (targetOrder?.companyId) {
      const statusText = newStatus === 'completed' ? 'Concluído ✅' : newStatus === 'processing' ? 'Em Processamento ⏳' : 'Pendente 🕒';
      fetch('/api/push/notify-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyId: targetOrder.companyId,
          title: 'Atualização do Pedido da Loja! 🛍️',
          body: `O seu pedido de "${targetOrder.productName}" foi atualizado para: ${statusText}`
        })
      }).catch(err => console.error('Error sending order status push:', err));
    }

    // 2. Atualizar estado visual instantaneamente
    setStoreOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    const localOrders = getStoreOrders();
    const updatedLocal = localOrders.map(o => o.id === orderId ? { ...o, status: newStatus } : o);
    safeSetItem('atrios_store_orders', JSON.stringify(updatedLocal));

    // 3. Atualizar Supabase em segundo plano
    try {
      await supabase
        .from('store_orders')
        .update({ status: newStatus })
        .eq('id', orderId);
    } catch (err) {
      console.error('Error updating order status in cloud:', err);
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    if (!window.confirm("Tem certeza que deseja excluir esta solicitação de orçamento?")) return;
    
    try {
      const success = await deleteStoreOrder(orderId);
      if (success) {
        setStoreOrders(prev => prev.filter(o => o.id !== orderId));
        alert("Solicitação excluída com sucesso!");
      } else {
        alert("Erro ao excluir solicitação.");
      }
    } catch (err) {
      console.error('Error deleting order:', err);
      alert("Erro ao excluir solicitação.");
    }
  };

  const updateCustomOrderStatus = async (orderId: string, newStatus: 'pending' | 'processing' | 'completed') => {
    // 1. Disparar notificação Push instantaneamente
    const targetOrder = customOrders.find(o => o.id === orderId);
    if (targetOrder?.companyId) {
      const statusText = newStatus === 'completed' ? 'Concluído ✅' : newStatus === 'processing' ? 'Em Processamento ⏳' : 'Pendente 🕒';
      fetch('/api/push/notify-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyId: targetOrder.companyId,
          title: 'Atualização do Pedido Personalizado! 🎨',
          body: `O seu pedido de "${targetOrder.itemName}" foi atualizado para: ${statusText}`
        })
      }).catch(err => console.error('Error sending custom order push:', err));
    }

    // 2. Atualizar estado local e storage instantaneamente
    setCustomOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    const localOrders = getStoredCustomOrders();
    const updatedLocal = localOrders.map(o => o.id === orderId ? { ...o, status: newStatus } : o);
    safeSetItem('atrios_custom_orders', JSON.stringify(updatedLocal));

    // 3. Atualizar cloud em segundo plano
    try {
      await supabase
        .from('custom_order_requests')
        .update({ status: newStatus })
        .eq('id', orderId);
    } catch (err) {
      console.error('Error updating custom order status in cloud:', err);
    }
  };

  const handleProductImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 500000) {
        alert('A imagem é muito grande! Por favor, use uma imagem com menos de 500KB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setProductImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAdditionalImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const remainingSlots = 5 - additionalProductImages.length;
      const filesToProcess = Array.from(files).slice(0, remainingSlots);
      
      filesToProcess.forEach((file: any) => {
        if (file.size > 500000) {
          alert(`A imagem ${file.name} é muito grande! Máximo 500KB.`);
          return;
        }
        const reader = new FileReader();
        reader.onloadend = () => {
          setAdditionalProductImages(prev => [...prev, reader.result as string].slice(0, 5));
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeAdditionalImage = (index: number) => {
    setAdditionalProductImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const product: Product = {
      id: editingProduct?.id || generateShortId(),
      code: productCode,
      name: productName,
      category: productCategory,
      description: productDescription,
      price: productPrice === '' ? undefined : Number(productPrice),
      image: productImage || 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&q=80&w=800',
      additionalImages: additionalProductImages,
      active: true,
      createdAt: editingProduct?.createdAt || new Date().toISOString()
    };

    const result = await saveProduct(product);
    
    const finalProduct = { ...product, synced: result.success };
    
    if (!result.success) {
      console.warn("Falha na sincronização cloud, mas salvo localmente.", result.error);
      const err = result.error as any;
      if (err?.code === '42501') {
        alert("ERRO DE PERMISSÃO (RLS):\nO Supabase não permitiu salvar o produto. Clique no botão 'Diagnóstico' para ver como liberar o acesso (SQL).");
      } else if (err?.code === '22P02') {
        alert("ERRO DE TIPO (UUID):\nA coluna 'id' no Supabase parece ser do tipo UUID, mas o app usa Texto. Mude o tipo da coluna para TEXT no Supabase.");
      } else if (err?.message) {
        alert(`Erro ao sincronizar com nuvem: ${err.message}`);
      }
    }
    
    // Update local state immediately to prevent disappearing
    setProducts(prev => {
      const index = prev.findIndex(p => p.id === finalProduct.id);
      if (index > -1) {
        const updated = [...prev];
        updated[index] = finalProduct;
        return updated;
      }
      return [finalProduct, ...prev];
    });
    
    // Reset form
    setEditingProduct(null);
    setProductName('');
    setProductCode('');
    setProductPrice('');
    setProductCategory('Branding');
    setProductDescription('');
    setProductImage(null);
    setAdditionalProductImages([]);
    
    // Refresh from cloud in background with delay to allow sync to complete
    setTimeout(() => {
      loadData();
    }, 3000); // Increased delay to 3s
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setProductName(product.name);
    setProductCode(product.code);
    setProductPrice(product.price !== undefined ? product.price : '');
    setProductCategory(product.category);
    setProductDescription(product.description);
    setProductImage(product.image);
    setAdditionalProductImages(product.additionalImages || []);
    setActiveTab('products');
  };

  const handleDeleteProduct = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este produto?')) {
      await deleteProduct(id);
      loadData();
    }
  };

  const handleManualUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualProofPreview) { alert(t.masterBannerSelectError); return; }
    
    const newCompanyId = Math.random().toString(36).substr(2, 9).toUpperCase();
    const isAnn = isAnnualPlan(manualUserPlan);
    const expiresDays = isAnn ? 365 : 30;

    const qrCode = await generateCompanyQrCode(newCompanyId, window.location.origin);

    const newCompany: Company = {
      id: newCompanyId,
      name: manualUserName,
      email: manualUserEmail,
      password: manualUserPass,
      plan: manualUserPlan,
      verified: true,
      createdAt: new Date().toISOString(),
      isManual: true,
      manualPaymentProof: manualProofPreview,
      qrCode: qrCode || '',
      subscriptionExpiresAt: isFreePlan(manualUserPlan) ? undefined : new Date(Date.now() + expiresDays * 24 * 60 * 60 * 1000).toISOString()
    };
    await saveCompany(newCompany);

    if (!isFreePlan(manualUserPlan)) {
      const total = isAnn ? 89.90 : 9.90;
      const amount = total / 1.23;
      const iva = total - amount;
      const tx: Transaction = {
        id: Math.random().toString(36).substr(2, 9).toUpperCase(),
        companyId: newCompanyId,
        companyName: manualUserName,
        planType: manualUserPlan,
        amount,
        ivaAmount: iva,
        totalAmount: total,
        date: new Date().toISOString()
      };
      saveTransaction(tx);
    }

    loadData();
    setShowAddUserModal(false);
    setManualUserName(''); setManualUserEmail(''); setManualUserPass(''); setManualProofPreview(null);
    alert(t.masterManualUserCreated);
  };

  const [, setTick] = useState(0);

  // Escutar BroadcastChannel para atualizações instantâneas no mesmo navegador
  useEffect(() => {
    let bc: BroadcastChannel | null = null;
    try {
      if ('BroadcastChannel' in window) {
        bc = new BroadcastChannel('atrios_presence_channel');
        bc.onmessage = (event) => {
          if (event.data && (event.data.companyId || event.data.email)) {
            const { companyId, email, lastSeenAt } = event.data;
            setServerLastSeenMap(prev => {
              const updated = { ...prev };
              if (companyId) {
                const cId = String(companyId);
                updated[cId] = lastSeenAt;
                updated[cId.toLowerCase()] = lastSeenAt;
                updated[cId.toUpperCase()] = lastSeenAt;
              }
              if (email) {
                updated[String(email).toLowerCase().trim()] = lastSeenAt;
              }
              return updated;
            });

            setCompanies(prevCompanies => {
              let changed = false;
              const next = prevCompanies.map(c => {
                const isMatch = (companyId && (c.id === companyId || String(c.id).toLowerCase() === String(companyId).toLowerCase())) ||
                                (email && c.email && c.email.toLowerCase().trim() === String(email).toLowerCase().trim());
                if (isMatch) {
                  changed = true;
                  return {
                    ...c,
                    lastSeenAt: lastSeenAt,
                    last_seen_at: lastSeenAt
                  };
                }
                return c;
              });
              return changed ? next : prevCompanies;
            });

            setTick(t => t + 1);
          }
        };
      }
    } catch (e) {}

    const fetchPresence = () => {
      fetch('/api/user/last-seen')
        .then(res => res.json())
        .then(data => {
          if (data.success && data.lastSeenMap) {
            setServerLastSeenMap(prev => {
              const updated = { ...prev };
              Object.entries(data.lastSeenMap).forEach(([k, v]) => {
                const existingTime = updated[k] ? new Date(updated[k]).getTime() : 0;
                const newTime = v ? new Date(v as string).getTime() : 0;
                if (newTime >= existingTime) {
                  updated[k] = v as string;
                }
              });
              return updated;
            });

            setCompanies(prevCompanies => {
              let changed = false;
              const next = prevCompanies.map(c => {
                const possibleKeys = [
                  c.id,
                  c.id ? String(c.id).toLowerCase() : null,
                  c.id ? String(c.id).toUpperCase() : null,
                  c.email ? String(c.email).toLowerCase().trim() : null
                ].filter(Boolean) as string[];

                let bestServerTime = 0;
                for (const key of possibleKeys) {
                  if (data.lastSeenMap[key]) {
                    const t = new Date(data.lastSeenMap[key]).getTime();
                    if (!isNaN(t) && t > bestServerTime) bestServerTime = t;
                  }
                }

                if (bestServerTime > 0) {
                  const currentCompanyTime = c.lastSeenAt ? new Date(c.lastSeenAt).getTime() : 0;
                  if (bestServerTime > currentCompanyTime) {
                    changed = true;
                    const bestIso = new Date(bestServerTime).toISOString();
                    return {
                      ...c,
                      lastSeenAt: bestIso,
                      last_seen_at: bestIso
                    };
                  }
                }
                return c;
              });
              return changed ? next : prevCompanies;
            });
          }
        })
        .catch(() => {});
    };

    fetchPresence();
    const timer = setInterval(() => {
      fetchPresence();
      setTick(t => t + 1);
    }, 5000); // Polling a cada 5 segundos

    return () => {
      if (bc) bc.close();
      clearInterval(timer);
    };
  }, []);

  const getUserOnlineStatus = (company: Company) => {
    if (!company) {
      return {
        isOnline: false,
        label: 'Offline',
        detail: 'Sem registo',
        badgeColor: 'bg-slate-800/80 text-slate-400 border border-slate-700/50',
        dotColor: 'bg-slate-600'
      };
    }

    const possibleKeys = [
      company.id,
      company.id ? String(company.id).toLowerCase() : null,
      company.id ? String(company.id).toUpperCase() : null,
      company.email ? String(company.email).toLowerCase().trim() : null,
      (company as any).company_id ? String((company as any).company_id) : null,
      (company as any).company_id ? String((company as any).company_id).toLowerCase() : null,
      (company as any).companyid ? String((company as any).companyid) : null
    ].filter(Boolean) as string[];

    let serverTimes: number[] = [];
    for (const key of possibleKeys) {
      if (serverLastSeenMap[key]) {
        const t = new Date(serverLastSeenMap[key]).getTime();
        if (!isNaN(t)) serverTimes.push(t);
      }
    }
    const maxServerTime = serverTimes.length > 0 ? Math.max(...serverTimes) : 0;

    // Também verificar armazenamento local de empresas
    const stored = getStoredCompanies();
    const localComp = stored.find(c => 
      c.id === company.id || 
      (c.email && company.email && c.email.toLowerCase().trim() === company.email.toLowerCase().trim())
    );

    const companyTimes = [
      company.lastSeenAt,
      (company as any).last_seen_at,
      localComp?.lastSeenAt,
      (localComp as any)?.last_seen_at
    ].filter(Boolean)
     .map(t => new Date(t!).getTime())
     .filter(t => !isNaN(t));

    const maxCompanyTime = companyTimes.length > 0 ? Math.max(...companyTimes) : 0;
    const timeMs = Math.max(maxServerTime, maxCompanyTime);

    if (!timeMs) {
      return {
        isOnline: false,
        label: 'Offline',
        detail: 'Nunca acedeu',
        badgeColor: 'bg-slate-800/80 text-slate-400 border border-slate-700/50',
        dotColor: 'bg-slate-600'
      };
    }

    const nowMs = Date.now();
    const diffMs = Math.max(0, nowMs - timeMs);
    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    // Menos de 2 minutos (120 segundos) de inatividade = ONLINE
    if (diffSeconds < 120) {
      return {
        isOnline: true,
        label: 'Online',
        detail: 'Ativo agora',
        badgeColor: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40',
        dotColor: 'bg-emerald-500 shadow-[0_0_8px_#10b981]'
      };
    }

    let detail = '';
    if (diffMinutes < 1) {
      detail = 'Há 1 min';
    } else if (diffMinutes < 60) {
      detail = `Há ${diffMinutes} min`;
    } else if (diffHours < 24) {
      detail = `Há ${diffHours} h`;
    } else if (diffDays === 1) {
      detail = `Há 1 dia`;
    } else if (diffDays < 30) {
      detail = `Há ${diffDays} dias`;
    } else {
      detail = `Há +30 dias`;
    }

    return {
      isOnline: false,
      label: 'Offline',
      detail,
      badgeColor: 'bg-slate-800/80 text-slate-400 border border-slate-700/50',
      dotColor: 'bg-slate-500'
    };
  };

  const getDaysInfo = (company: Company) => {
    const rawLogin = company.firstLoginAt || (company as any).first_login_at || company.lastSeenAt || (company as any).last_seen_at || (company as any).createdAt || (company as any).created_at;
    if (!rawLogin) return t.masterWaitingLogin;
    const now = Date.now();
    const firstLogin = new Date(rawLogin).getTime();
    if (isNaN(firstLogin)) return t.masterWaitingLogin;

    if (company.subscriptionExpiresAt) {
      const expTime = new Date(company.subscriptionExpiresAt).getTime();
      if (!isNaN(expTime)) {
        return `${Math.max(0, Math.ceil((expTime - now) / 86400000))} ${t.masterDaysRemaining}`;
      }
    }

    const days = Math.floor((now - firstLogin) / 86400000);
    return `${days <= 0 ? 0 : days} ${t.masterDaysOfUse}`;
  };

  const pendingUnlockCompanies = useMemo(() => {
    return companies.filter(c => Boolean(c.unlockRequested || (c as any).unlock_requested || (c as any).unlockrequested));
  }, [companies]);

  const getUnreadCount = (companyId: string) => {
    return getMessages(companyId).filter(m => m.senderRole === 'user' && !m.read).length;
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-8 font-sans relative">
      
      {/* Balão Flutuante de Notificação de Desbloqueio no Master */}
      {pendingUnlockCompanies.length > 0 && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[10002] bg-gradient-to-r from-red-600 via-amber-600 to-red-600 text-white px-8 py-4 rounded-[2.5rem] shadow-2xl flex items-center gap-5 border-2 border-amber-400 animate-in slide-in-from-top backdrop-blur-xl">
          <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center shrink-0 animate-bounce">
            <Key size={26} className="text-amber-200" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-300 animate-ping" />
              <p className="font-black text-xs uppercase tracking-widest text-amber-200">
                {pendingUnlockCompanies.length === 1 
                  ? '1 Empresa Solicitou Desbloqueio' 
                  : `${pendingUnlockCompanies.length} Empresas Solicitaram Desbloqueio`}
              </p>
            </div>
            <p className="text-xs font-bold text-white/90 truncate max-w-[320px] sm:max-w-[450px]">
              {pendingUnlockCompanies.map(c => c.name).join(', ')}
            </p>
          </div>
          <button 
            onClick={() => { setActiveTab('users'); setLastUnlockAlert(null); }} 
            className="px-5 py-2.5 bg-white text-slate-950 hover:bg-amber-300 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all shadow-xl active:scale-95 shrink-0 flex items-center gap-2"
          >
            <Key size={14} />
            Desbloquear Agora
          </button>
        </div>
      )}

      {lastMessageAlert && (
        <div className="fixed top-8 left-1/2 -translate-x-1/2 z-[10002] bg-blue-600 text-white px-8 py-4 rounded-[2rem] shadow-2xl flex items-center gap-4 animate-in slide-in-from-top border border-blue-400">
           <MessageSquare size={24} className="animate-bounce" />
           <div><p className="font-black text-xs uppercase tracking-widest">{lastMessageAlert.name}</p><p className="text-[10px] font-bold opacity-80 truncate max-w-[200px]">{lastMessageAlert.content}</p></div>
           <button onClick={() => { setActiveTab('messages'); setLastMessageAlert(null); }} className="px-4 py-2 bg-white/20 rounded-xl text-[10px] font-black uppercase tracking-widest">{t.viewProof}</button>
           <button onClick={() => setLastMessageAlert(null)}><X size={18} /></button>
        </div>
      )}

      {lastUnlockAlert && (
        <div className="fixed top-8 left-1/2 -translate-x-1/2 z-[10002] bg-amber-600 text-white px-8 py-4 rounded-[2rem] shadow-2xl flex items-center gap-4 animate-in slide-in-from-top border border-amber-400">
           <AlertCircle size={24} className="animate-pulse" />
           <div><p className="font-black text-xs uppercase tracking-widest">{t.notifyMasterUnlockRequest}</p><p className="text-[10px] font-bold opacity-80">{lastUnlockAlert}</p></div>
           <button onClick={() => { setActiveTab('users'); setLastUnlockAlert(null); }} className="px-4 py-2 bg-white/20 rounded-xl text-[10px] font-black uppercase tracking-widest">{t.viewProof}</button>
           <button onClick={() => setLastUnlockAlert(null)}><X size={18} /></button>
        </div>
      )}

      {showProofModal && (
        <div className="fixed inset-0 z-[10001] flex items-center justify-center bg-slate-950/95 p-12 backdrop-blur-md animate-in fade-in">
           <button onClick={() => setShowProofModal(null)} className="absolute top-8 right-8 p-4 bg-white/10 rounded-full hover:bg-red-500"><X size={32} /></button>
           <div className="max-w-4xl w-full h-full flex flex-col items-center justify-center gap-6"><h3 className="text-3xl font-black italic">{t.masterViewPaymentProof}</h3><div className="flex-1 w-full bg-white/5 rounded-[3rem] overflow-hidden border border-white/10 shadow-2xl"><img src={showProofModal} className="w-full h-full object-contain p-4" alt="Comprovativo" /></div></div>
        </div>
      )}

      {showDurationModal && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-slate-950/80 p-6 backdrop-blur-sm animate-in fade-in">
           <div className="bg-slate-900 w-full max-w-md rounded-[3rem] border border-white/10 shadow-2xl overflow-hidden">
              <div className="p-8 border-b border-white/10 flex justify-between items-center bg-white/5">
                <h2 className="text-xl font-black italic flex items-center gap-3 text-emerald-500 uppercase"><Zap size={24} /> {t.masterUpgradeUser}</h2>
                <button onClick={() => setShowDurationModal(null)} className="p-2 hover:bg-white/10 rounded-full"><X size={24} /></button>
              </div>
              <div className="p-8 space-y-4">
                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest text-center mb-4">{t.masterTableIdCompany}: {showDurationModal.name}</p>
                <div className="grid grid-cols-1 gap-2.5">
                  {[
                    { label: '⚡ Teste Rápido (2 Minutos)', minutes: 2, isTest: true },
                    { label: '7 Dias', minutes: 7 * 24 * 60 },
                    { label: '14 Dias', minutes: 14 * 24 * 60 },
                    { label: '30 Dias (1 Mês)', minutes: 30 * 24 * 60 },
                    { label: '1 Ano', minutes: 365 * 24 * 60 },
                    { label: '❌ Reverter para Plano Grátis (Bloquear)', minutes: 0, isReset: true }
                  ].map(opt => (
                    <button 
                      key={opt.minutes}
                      onClick={() => handleRemoveRestrictions(showDurationModal, opt.minutes)}
                      className={`w-full py-3.5 px-4 rounded-2xl font-black text-xs uppercase tracking-wider transition-all border flex items-center justify-center gap-2 cursor-pointer ${
                        opt.isTest 
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500 hover:text-slate-950 hover:border-amber-400 shadow-lg shadow-amber-500/10'
                          : opt.isReset
                            ? 'bg-red-500/20 text-red-300 border-red-500/40 hover:bg-red-500 hover:text-white hover:border-red-400 mt-2'
                            : 'bg-white/5 hover:bg-emerald-500 hover:text-slate-950 text-slate-200 border-white/5 hover:border-emerald-400'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
                <button onClick={() => setShowDurationModal(null)} className="w-full py-3 mt-2 text-slate-500 font-black text-xs uppercase hover:text-white transition-all">
                  {t.cancel}
                </button>
              </div>
           </div>
        </div>
      )}

      {showResetPassModal && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-slate-950/80 p-6 backdrop-blur-sm animate-in fade-in">
           <div className="bg-slate-900 w-full max-w-md rounded-[3rem] border border-white/10 shadow-2xl overflow-hidden">
              <div className="p-8 border-b border-white/10 flex justify-between items-center bg-white/5">
                <h2 className="text-xl font-black italic flex items-center gap-3 text-amber-500 uppercase"><Lock size={24} /> {t.resetPasswordTitle}</h2>
                <button onClick={() => setShowResetPassModal(null)} className="p-2 hover:bg-white/10 rounded-full"><X size={24} /></button>
              </div>
              <form onSubmit={handleResetPasswordSubmit} className="p-10 space-y-6">
                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest text-center">{showResetPassModal.name}</p>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">{t.passwordLabel}</label>
                  <input 
                    required 
                    type="text" 
                    value={newPassValue || ''} 
                    onChange={e => setNewPassValue(e.target.value)} 
                    placeholder="Nova Senha" 
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm font-bold outline-none"
                  />
                </div>
                <button type="submit" className="w-full py-5 bg-amber-500 text-slate-950 rounded-[1.5rem] font-black text-lg hover:bg-amber-400 uppercase shadow-xl">
                  {t.saveChanges}
                </button>
                <button type="button" onClick={() => setShowResetPassModal(null)} className="w-full py-2 text-slate-500 font-black text-xs uppercase hover:text-white transition-all">
                  {t.cancel}
                </button>
              </form>
           </div>
        </div>
      )}

      {showNotesModal && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-slate-950/80 p-6 backdrop-blur-sm animate-in fade-in">
           <div className="bg-slate-900 w-full max-w-lg rounded-[3rem] border border-white/10 shadow-2xl overflow-hidden">
              <div className="p-8 border-b border-white/10 flex justify-between items-center bg-white/5">
                <h2 className="text-xl font-black italic flex items-center gap-3 text-amber-500 uppercase">
                  <FileText size={24} /> Notas Pessoais do Utilizador
                </h2>
                <button onClick={() => setShowNotesModal(null)} className="p-2 hover:bg-white/10 rounded-full transition-colors text-slate-400 hover:text-white">
                  <X size={24} />
                </button>
              </div>
              <form onSubmit={handleSaveNotesSubmit} className="p-8 space-y-6">
                <div className="bg-white/5 p-4 rounded-2xl border border-white/10 flex items-center gap-3">
                  <div className="w-10 h-10 bg-amber-500/20 text-amber-400 rounded-xl flex items-center justify-center font-black uppercase text-base shrink-0">
                    {showNotesModal.name?.charAt(0)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-black text-sm text-white truncate">{showNotesModal.name}</p>
                    <p className="text-xs font-bold text-slate-400 truncate">{showNotesModal.email}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                    <span>Notas Privadas da Administração Master</span>
                  </label>
                  <textarea 
                    rows={6}
                    value={notesTextValue} 
                    onChange={e => setNotesTextValue(e.target.value)} 
                    placeholder="Escreva aqui observações ou notas pessoais sobre este utilizador (ex: cliente preferencial, detalhes do projeto, acordos, etc)..." 
                    className="w-full bg-slate-950/80 border border-white/10 rounded-2xl p-4 text-xs font-medium text-white placeholder-slate-500 outline-none focus:border-amber-500/50 transition-colors leading-relaxed resize-none"
                  />
                  <p className="text-[10px] text-slate-500 italic ml-1">
                    * Estas notas são <strong>privadas</strong> e visíveis apenas no Painel Master.
                  </p>
                </div>

                <div className="flex gap-3 pt-2">
                  <button 
                    type="submit" 
                    className="flex-1 py-4 bg-amber-500 text-slate-950 rounded-2xl font-black text-sm uppercase tracking-wider hover:bg-amber-400 transition-all shadow-xl shadow-amber-500/10 cursor-pointer"
                  >
                    Guardar Nota
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setShowNotesModal(null)} 
                    className="px-6 py-4 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white rounded-2xl font-black text-xs uppercase tracking-wider transition-all"
                  >
                    {t.cancel}
                  </button>
                </div>
              </form>
           </div>
        </div>
      )}

      {showAddUserModal && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-slate-950/80 p-6 backdrop-blur-sm animate-in fade-in">
           <div className="bg-slate-900 w-full max-w-2xl rounded-[3rem] border border-white/10 shadow-2xl overflow-hidden">
              <div className="p-8 border-b border-white/10 flex justify-between items-center bg-white/5"><h2 className="text-2xl font-black italic flex items-center gap-3 text-amber-500 uppercase"><UserPlus size={28} /> {t.masterCreateManualUser}</h2><button onClick={() => setShowAddUserModal(false)} className="p-2 hover:bg-white/10 rounded-full"><X size={24} /></button></div>
              <form onSubmit={handleManualUserSubmit} className="p-10 space-y-8 max-h-[70vh] overflow-y-auto no-scrollbar">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <input required type="text" value={manualUserName || ''} onChange={e => setManualUserName(e.target.value)} placeholder={t.companyLabel} className="bg-white/5 border border-white/10 rounded-2xl px-5 py-3.5 outline-none font-bold" />
                    <input required type="email" value={manualUserEmail || ''} onChange={e => setManualUserEmail(e.target.value)} placeholder={t.emailLabel} className="bg-white/5 border border-white/10 rounded-2xl px-5 py-3.5 outline-none font-bold" />
                    <input required type="password" value={manualUserPass || ''} onChange={e => setManualUserPass(e.target.value)} placeholder={t.passwordLabel} className="bg-white/5 border border-white/10 rounded-2xl px-5 py-3.5 outline-none font-bold" />
                    <select value={manualUserPlan} onChange={e => setManualUserPlan(e.target.value as PlanType)} className="bg-white/5 border border-white/10 rounded-2xl px-5 py-3.5 outline-none font-bold uppercase text-xs">
                       <option value={PlanType.FREE}>{t.planFree}</option><option value={PlanType.PREMIUM_MONTHLY}>{t.planMonthly}</option><option value={PlanType.PREMIUM_ANNUAL}>{t.planAnnual}</option>
                    </select>
                 </div>
                 <label className={`border-4 border-dashed border-white/10 rounded-[2.5rem] p-10 flex flex-col items-center justify-center cursor-pointer hover:bg-white/5 h-48 relative ${manualProofPreview ? 'bg-emerald-500/5' : ''}`}>{manualProofPreview ? <img src={manualProofPreview} className="h-24 rounded-lg shadow-xl" /> : <div className="flex flex-col items-center"><Upload size={24} className="mb-2 text-slate-400" /><span className="text-[10px] font-black uppercase">{t.masterUploadClick}</span></div>}<input required type="file" className="hidden" accept="image/*" onChange={e => {const f=e.target.files?.[0]; if(f){const r=new FileReader(); r.onloadend=()=>setManualProofPreview(r.result as string); r.readAsDataURL(f);}}} /></label>
                 <div className="flex gap-4"><button type="submit" className="flex-1 py-5 bg-amber-500 text-slate-950 rounded-[1.5rem] font-black text-lg hover:bg-amber-400 shadow-xl uppercase">{t.masterAddUser}</button><button type="button" onClick={() => setShowAddUserModal(false)} className="px-10 py-5 bg-white/5 rounded-[1.5rem] font-black text-sm uppercase">{t.cancel}</button></div>
              </form>
           </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto space-y-10">
        <div className="flex flex-col md:flex-row justify-between items-center border-b border-white/10 pb-8 gap-8">
          <div className="flex items-center justify-between w-full md:w-auto gap-4">
            <div className="flex items-center gap-4">
              <div className="bg-amber-500 p-3 rounded-2xl shadow-lg shadow-amber-500/20"><ShieldCheck size={32} className="text-slate-950" /></div>
              <div><h1 className="text-4xl font-black tracking-tighter italic uppercase">{t.masterPanelTitle}</h1><p className="text-slate-400 font-bold uppercase tracking-widest text-xs">{t.masterPanelSub}</p></div>
            </div>
            <button 
              onClick={onLogout} 
              className="md:hidden flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 transition-all font-black text-xs uppercase tracking-wider shrink-0 cursor-pointer"
            >
              <LogOut size={16} /> {t.logout}
            </button>
          </div>
          <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
            <nav className="flex flex-wrap bg-white/5 p-1 rounded-2xl border border-white/10 gap-1">
            {[
              { id: 'home', label: t.masterHomeTab, icon: LayoutDashboard },
              { id: 'hero_video', label: locale.startsWith('pt') ? 'Vídeos da Landing' : 'Landing Videos', icon: Film },
              { id: 'client_requests', label: locale.startsWith('pt') ? 'Obras & Clientes' : 'Client Requests', icon: Wrench },
              { id: 'users', label: t.masterUsersTab, icon: Users },
              { id: 'messages', label: t.masterMessagesTab, icon: MessageSquare },
              { id: 'jobs', label: 'Vagas de Trabalho', icon: HardHat },
              { id: 'store', label: t.masterStoreTab, icon: ShoppingBag },
              { id: 'products', label: 'Produtos', icon: Package },
              { id: 'coupons', label: t.masterCouponsTab, icon: Ticket },
              { id: 'notifications', label: t.masterNotificationsTab, icon: Bell },
              { id: 'push', label: locale.startsWith('pt') ? 'Disparar Push' : 'Send Push', icon: Smartphone },
            ].map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`relative px-6 py-2.5 rounded-xl font-black text-xs uppercase transition-all flex items-center gap-2 ${activeTab === tab.id ? 'bg-amber-50 text-slate-950 shadow-lg' : 'text-slate-400 hover:text-white'}`}>
                <tab.icon size={16} /> {tab.label}
                
                {tab.id === 'users' && pendingRequestsCount > 0 && (
                  <span className="relative flex h-5 min-w-[22px] px-1.5 items-center justify-center">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-5 min-w-[22px] px-1.5 bg-red-600 text-white items-center justify-center text-[10px] font-black border-2 border-slate-950 shadow-lg animate-pulse">
                      +{pendingRequestsCount}
                    </span>
                  </span>
                )}

                {tab.id === 'messages' && unreadMessagesTotalCount > 0 && (
                  <span className="relative flex h-5 min-w-[22px] px-1.5 items-center justify-center">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-5 min-w-[22px] px-1.5 bg-red-600 text-white items-center justify-center text-[10px] font-black border-2 border-slate-950 shadow-lg animate-pulse">
                      +{unreadMessagesTotalCount}
                    </span>
                  </span>
                )}

                {tab.id === 'jobs' && pendingJobsCount > 0 && (
                  <span className="relative flex h-5 min-w-[22px] px-1.5 items-center justify-center">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-5 min-w-[22px] px-1.5 bg-amber-500 text-slate-950 items-center justify-center text-[10px] font-black border-2 border-slate-950 shadow-lg animate-pulse">
                      +{pendingJobsCount}
                    </span>
                  </span>
                )}

                {tab.id === 'store' && pendingStoreOrdersCount > 0 && (
                  <span className="relative flex h-5 min-w-[22px] px-1.5 items-center justify-center">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-5 min-w-[22px] px-1.5 bg-amber-500 text-slate-950 items-center justify-center text-[10px] font-black border-2 border-slate-950 shadow-lg animate-pulse">
                      +{pendingStoreOrdersCount}
                    </span>
                  </span>
                )}
              </button>
            ))}

            <button onClick={onLogout} className="px-5 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-xl transition-all font-black text-xs uppercase flex items-center gap-2 cursor-pointer shadow-sm">
              <LogOut size={15} /> {t.logout}
            </button>
          </nav>
          </div>
        </div>

        {pendingUnlockCompanies.length > 0 && (
          <div className="bg-gradient-to-r from-red-600 via-amber-600 to-red-600 p-1 rounded-[2.5rem] shadow-2xl shadow-red-600/40 animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="bg-slate-950/95 backdrop-blur-xl rounded-[2.3rem] p-6 sm:p-8 border border-red-500/50 space-y-4">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-white/10 pb-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-red-600 text-white flex items-center justify-center shrink-0 shadow-xl shadow-red-600/80 ring-4 ring-amber-400/80 animate-pulse">
                    <Key size={30} className="animate-bounce text-amber-200" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-3.5 py-1 rounded-full bg-red-600 text-white text-[11px] font-black uppercase tracking-wider animate-pulse border border-amber-300 shadow-md">
                        🚨 {pendingUnlockCompanies.length} SOLICITAÇÃO(ÕES) DE DESBLOQUEIO PENDENTE(S)
                      </span>
                    </div>
                    <h3 className="text-xl font-black text-white italic tracking-tight mt-1">
                      Atenção: Os utilizadores abaixo solicitaram desbloqueio para editar dados nas Definições:
                    </h3>
                  </div>
                </div>
                <button
                  onClick={() => setActiveTab('users')}
                  className="px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all border border-white/20 shrink-0"
                >
                  Ver Tabela de Utilizadores →
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-1">
                {pendingUnlockCompanies.map(c => (
                  <div key={c.id} className="bg-white/5 border-2 border-red-500/60 hover:border-amber-400/80 p-5 rounded-2xl flex flex-col justify-between gap-3 shadow-xl transition-all group">
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="font-black text-base text-amber-300 truncate">{c.name}</span>
                        <span className="shrink-0 px-2 py-0.5 rounded-full bg-red-500/30 text-red-300 border border-red-500/40 text-[9px] font-black uppercase animate-pulse">
                          🔑 PENDENTE
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 font-bold truncate">{c.email}</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">ID: {c.id}</p>
                    </div>

                    <div className="flex items-center gap-2 pt-2 border-t border-white/10">
                      <button
                        onClick={() => toggleUnlock(c)}
                        className="flex-1 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-emerald-500/30 active:scale-95 transition-all flex items-center justify-center gap-2"
                      >
                        <Unlock size={14} /> DESBLOQUEAR AGORA
                      </button>
                      <button
                        onClick={() => selectChat(c.id)}
                        className="p-3 bg-blue-500/20 hover:bg-blue-500 text-blue-300 hover:text-white rounded-xl font-black text-xs transition-all border border-blue-500/30"
                        title="Enviar Mensagem ao Utilizador"
                      >
                        <MessageSquare size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'home' && (
          <div className="space-y-10 animate-in fade-in">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white/5 border border-white/10 p-8 rounded-[2.5rem] shadow-xl">
                <TrendingUp className="text-emerald-400 mb-4" />
                <p className="text-[10px] text-slate-500 uppercase font-black mb-1">{t.salesInPeriod}</p>
                <p className="text-3xl font-black">{financialStats.totalRevenue.toLocaleString(locale, { style: 'currency', currency: 'EUR' })}</p>
              </div>
              
              <div className="bg-white/5 border border-white/10 p-8 rounded-[2.5rem] shadow-xl">
                <Zap className="text-blue-400 mb-4" />
                <p className="text-[10px] text-slate-500 uppercase font-black mb-1">{t.masterMonthlyUsers}</p>
                <div className="flex items-end justify-between">
                  <p className="text-3xl font-black">{userStats.monthly}</p>
                  <p className="text-xs font-bold text-blue-400 mb-1">{financialStats.monthlySales.toLocaleString(locale, { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })}</p>
                </div>
              </div>

              <div className="bg-white/5 border border-white/10 p-8 rounded-[2.5rem] shadow-xl">
                <Crown className="text-amber-400 mb-4" />
                <p className="text-[10px] text-slate-500 uppercase font-black mb-1">{t.masterAnnualUsers}</p>
                <div className="flex items-end justify-between">
                  <p className="text-3xl font-black">{userStats.annual}</p>
                  <p className="text-xs font-bold text-amber-400 mb-1">{financialStats.annualSales.toLocaleString(locale, { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })}</p>
                </div>
              </div>

              <div className="bg-white/5 border border-white/10 p-8 rounded-[2.5rem] shadow-xl">
                <Users className="text-slate-400 mb-4" />
                <p className="text-[10px] text-slate-500 uppercase font-black mb-1">{t.masterFreeUsers}</p>
                <p className="text-3xl font-black">{userStats.free}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
               <div className="bg-white/5 border border-white/10 p-10 rounded-[3rem] h-[400px] shadow-2xl">
                 <h3 className="text-sm font-black uppercase mb-8 italic flex items-center gap-2">
                   <BarChart3 size={18} className="text-blue-400" /> {t.salesInPeriod}
                 </h3>
                 <ResponsiveContainer width="100%" height="80%">
                   <BarChart data={chartDataSales}>
                     <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff10" />
                     <XAxis dataKey="name" tick={{fill: '#94a3b8', fontSize: 11}} />
                     <YAxis tick={{fill: '#94a3b8', fontSize: 11}} />
                     <Tooltip 
                       contentStyle={{backgroundColor: '#0f172a', border: 'none', borderRadius: '12px'}}
                       itemStyle={{fontWeight: 'bold'}}
                     />
                     <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                       {chartDataSales.map((entry, index) => (
                         <Cell key={`cell-${index}`} fill={entry.color} />
                       ))}
                     </Bar>
                   </BarChart>
                 </ResponsiveContainer>
               </div>
               <div className="bg-white/5 border border-white/10 p-10 rounded-[3rem] h-[400px] shadow-2xl">
                 <h3 className="text-sm font-black uppercase mb-8 italic flex items-center gap-2">
                   <PieChartIcon size={18} className="text-amber-400" /> {t.masterPlanDistribution}
                 </h3>
                 <ResponsiveContainer width="100%" height="80%">
                   <PieChart>
                     <Pie 
                       data={chartDataPlans} 
                       cx="50%" 
                       cy="50%" 
                       innerRadius={60} 
                       outerRadius={80} 
                       paddingAngle={5} 
                       dataKey="value"
                     >
                       {chartDataPlans.map((entry, index) => (
                         <Cell key={`cell-${index}`} fill={entry.color} />
                       ))}
                     </Pie>
                     <Tooltip 
                       contentStyle={{backgroundColor: '#0f172a', border: 'none', borderRadius: '12px'}}
                       itemStyle={{fontWeight: 'bold'}}
                     />
                   </PieChart>
                 </ResponsiveContainer>
               </div>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="bg-white/5 border border-white/10 rounded-[3rem] overflow-hidden animate-in fade-in">
            <div className="p-8 border-b border-white/10 flex justify-between items-center bg-white/5">
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-black flex items-center gap-3 italic text-amber-500 uppercase">
                  <Users size={24} /> {t.masterUserManagement}
                </h2>
                {pendingRequestsCount > 0 && (
                  <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-600 text-white text-[10px] font-black uppercase tracking-wider animate-pulse border border-red-400 shadow-lg shadow-red-600/50">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-300"></span>
                    </span>
                    {pendingRequestsCount} Solicitação(ões) de Desbloqueio
                  </span>
                )}
              </div>
              <button 
                onClick={() => setShowAddUserModal(true)} 
                className="px-6 py-3 bg-amber-500 text-slate-950 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-amber-400 flex items-center gap-2"
              >
                <UserPlus size={18} /> {t.masterAddUser}
              </button>
            </div>

            {pendingRequestsCount > 0 && (
              <div className="px-8 py-3.5 bg-gradient-to-r from-red-950/80 via-red-900/60 to-slate-950 border-b border-red-500/30 flex items-center justify-between text-red-200 animate-pulse">
                <div className="flex items-center gap-3 font-black text-xs uppercase tracking-wider">
                  <span className="relative flex h-3 w-3 shrink-0">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-90"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                  </span>
                  <Key size={18} className="text-amber-300 animate-bounce shrink-0" />
                  <span>Atenção: {pendingRequestsCount} usuário(s) na lista abaixo solicitaram DESBLOQUEIO dos dados!</span>
                </div>
                <span className="text-[10px] bg-red-600 text-white font-black px-3 py-1 rounded-xl uppercase tracking-widest shadow-md">
                  Ação Necessária 🚨
                </span>
              </div>
            )}

            <div className="px-8 py-4 bg-white/5 border-b border-white/10 flex items-center gap-4">
              <div className="relative flex-1">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text" 
                  value={userSearchQuery} 
                  onChange={e => setUserSearchQuery(e.target.value)} 
                  placeholder="Pesquisar por nome, email, ID ou notas pessoais..." 
                  className="w-full bg-slate-950/60 border border-white/10 rounded-2xl pl-11 pr-4 py-3 text-xs font-bold text-white placeholder-slate-500 outline-none focus:border-amber-500/50 transition-colors"
                />
              </div>
              {userSearchQuery && (
                <button 
                  onClick={() => setUserSearchQuery('')} 
                  className="text-xs font-black uppercase text-slate-400 hover:text-white px-3 py-2 bg-white/5 rounded-xl transition-all cursor-pointer"
                >
                  Limpar
                </button>
              )}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-white/5">
                    <th className="px-8 py-6">{t.masterTableIdCompany}</th>
                    <th className="px-8 py-6">{t.masterTableEmail}</th>
                    <th className="px-8 py-6">Status Online</th>
                    <th className="px-8 py-6">{t.masterTablePlan}</th>
                    <th className="px-8 py-6">{t.masterTableStatus}</th>
                    <th className="px-8 py-6 text-right">{t.masterTableActions}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {[...companies].filter(u => {
                    if (!userSearchQuery.trim()) return true;
                    const q = userSearchQuery.toLowerCase().trim();
                    return (
                      u.name?.toLowerCase().includes(q) ||
                      u.email?.toLowerCase().includes(q) ||
                      u.id?.toLowerCase().includes(q) ||
                      u.masterNotes?.toLowerCase().includes(q)
                    );
                  }).sort((a, b) => {
                    const reqA = Boolean(a.unlockRequested || (a as any).unlock_requested || (a as any).unlockrequested);
                    const reqB = Boolean(b.unlockRequested || (b as any).unlock_requested || (b as any).unlockrequested);
                    if (reqA && !reqB) return -1;
                    if (!reqA && reqB) return 1;
                    return 0;
                  }).map(user => {
                    const onlineStatus = getUserOnlineStatus(user);
                    const isUnlockReq = Boolean(user.unlockRequested || (user as any).unlock_requested || (user as any).unlockrequested);
                    return (
                      <tr key={user.id} className={`hover:bg-white/5 transition-colors group ${user.isBlocked ? 'opacity-50' : ''} ${isUnlockReq ? 'bg-red-500/20 border-l-4 border-l-red-500' : ''}`}>
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-3">
                            <div className="relative shrink-0">
                              <div className={`w-11 h-11 rounded-2xl flex items-center justify-center font-black uppercase text-base ${user.isBlocked ? 'bg-red-500/20 text-red-500' : isUnlockReq ? 'bg-red-600 text-white shadow-xl shadow-red-600/60 ring-4 ring-red-500/80 animate-pulse' : 'bg-white/10 text-amber-500'}`}>
                                {user.name?.charAt(0)}
                              </div>
                              <span className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-slate-950 ${onlineStatus.dotColor}`} />
                            </div>
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <p className="font-black text-sm">{user.name}</p>
                                {isUnlockReq && (
                                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider bg-red-600 text-white animate-pulse shadow-md shadow-red-600/50 border border-red-400">
                                    <span className="relative flex h-2 w-2 shrink-0">
                                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-300 opacity-90"></span>
                                      <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-400"></span>
                                    </span>
                                    <Key size={12} className="animate-bounce shrink-0 text-amber-200" />
                                    SOLICITOU DESBLOQUEIO
                                  </span>
                                )}
                              </div>
                              <p className="text-[9px] font-bold text-slate-500 uppercase tracking-tighter">ID: {user.id}</p>
                              {user.masterNotes && user.masterNotes.trim() && (
                                <div 
                                  onClick={() => {
                                    setShowNotesModal(user);
                                    setNotesTextValue(user.masterNotes || '');
                                  }}
                                  className="mt-1 flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[10px] font-semibold cursor-pointer hover:bg-amber-500/20 transition-all max-w-xs truncate"
                                  title="Clique para editar nota pessoal"
                                >
                                  <FileText size={12} className="shrink-0 text-amber-400" />
                                  <span className="truncate">{user.masterNotes}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-6 font-bold text-slate-400 text-sm">
                          {user.email}
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2">
                              <span className={`w-2 h-2 rounded-full ${onlineStatus.isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-slate-500'}`} />
                              <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-md ${onlineStatus.badgeColor}`}>
                                {onlineStatus.label}
                              </span>
                            </div>
                            <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1 ml-0.5">
                              <Clock size={11} className="text-slate-500" />
                              {onlineStatus.detail}
                            </span>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <span className="text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full border border-amber-500/50 text-amber-500">
                            {getTranslatedPlan(user.plan)}
                          </span>
                        </td>
                        <td className="px-8 py-6">
                          {isUnlockReq ? (
                            <span className="inline-flex items-center gap-2 text-[10px] font-black uppercase bg-red-600 text-white px-3.5 py-1.5 rounded-xl animate-pulse shadow-lg shadow-red-600/50 border border-red-400">
                              <span className="relative flex h-2 w-2 shrink-0">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-200 opacity-90"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-300"></span>
                              </span>
                              <Key size={12} className="animate-bounce text-amber-200 shrink-0" />
                              SOLICITOU DESBLOQUEIO
                            </span>
                          ) : (
                            <p className="text-xs font-black text-emerald-400 flex items-center gap-2">
                              <Calendar size={12} /> {getDaysInfo(user)}
                            </p>
                          )}
                        </td>
                        <td className="px-8 py-6 text-right">
                          <div className="flex items-center justify-end gap-3">
                            {getUnreadCount(user.id) > 0 && (
                              <button onClick={() => selectChat(user.id)} className="flex items-center gap-2 bg-blue-500 text-white px-3 py-1.5 rounded-xl text-[10px] font-black uppercase animate-pulse">
                                <MessageSquare size={12} /> {getUnreadCount(user.id)}
                              </button>
                            )}
                            <button 
                              onClick={() => toggleUnlock(user)} 
                              className={`relative px-4 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all flex items-center gap-2 shadow-2xl overflow-hidden cursor-pointer active:scale-95 ${
                                isUnlockReq 
                                  ? 'bg-gradient-to-r from-red-600 via-amber-600 to-red-600 text-white animate-bounce ring-4 ring-amber-400 shadow-red-600/90 hover:scale-105 border-2 border-amber-300' 
                                  : user.canEditSensitiveData 
                                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 hover:bg-emerald-500 hover:text-slate-950' 
                                    : 'bg-red-500/20 text-red-400 border border-red-500/40 hover:bg-red-500 hover:text-white'
                              }`} 
                              title={isUnlockReq ? "Clique para Liberar Acesso ao Usuário" : user.canEditSensitiveData ? "Clique para Bloquear Acesso" : "Clique para Desbloquear Acesso"}
                            >
                              {isUnlockReq && (
                                <>
                                  <span className="absolute inset-0 bg-amber-400/20 animate-ping opacity-40 rounded-xl pointer-events-none" />
                                  <span className="relative flex h-3 w-3 shrink-0">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-200 opacity-90"></span>
                                    <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-300"></span>
                                  </span>
                                </>
                              )}
                              <Key size={16} className={isUnlockReq ? "animate-bounce text-amber-200 shrink-0" : ""} />
                              <span className="relative z-10">{isUnlockReq ? "LIBERAR ACESSO (SOLICITADO) 🔑" : user.canEditSensitiveData ? "DESBLOQUEADO" : "BLOQUEADO"}</span>
                            </button>
                            <button 
                              onClick={() => setShowDurationModal(user)} 
                              className={`p-2 rounded-xl transition-all ${
                                user.plan !== PlanType.FREE 
                                  ? 'bg-amber-500/20 text-amber-400 hover:bg-amber-500 hover:text-slate-950 border border-amber-500/30' 
                                  : 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white'
                              }`} 
                              title={user.plan !== PlanType.FREE ? "Gerir Período / Alterar Plano (Raio ⚡)" : t.masterUpgradeUser}
                            >
                              <Zap size={18} />
                            </button>
                            <button 
                              onClick={() => {
                                setShowNotesModal(user);
                                setNotesTextValue(user.masterNotes || '');
                              }} 
                              className={`p-2 rounded-xl transition-all relative ${
                                user.masterNotes && user.masterNotes.trim() 
                                  ? 'bg-amber-500 text-slate-950 hover:bg-amber-400 font-bold shadow-lg shadow-amber-500/20' 
                                  : 'bg-white/5 text-slate-400 hover:text-amber-500'
                              }`} 
                              title={user.masterNotes && user.masterNotes.trim() ? "Notas Pessoais (Com Nota)" : "Adicionar Notas Pessoais"}
                            >
                              <FileText size={18} />
                              {user.masterNotes && user.masterNotes.trim() && (
                                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-300 rounded-full border-2 border-slate-950 animate-pulse" />
                              )}
                            </button>
                            <button onClick={() => setShowResetPassModal(user)} className="p-2 bg-white/5 text-slate-400 hover:text-amber-500 rounded-xl transition-all" title={t.resetPasswordTitle}>
                              <Lock size={18} />
                            </button>
                            <button onClick={() => toggleBlock(user)} className={`p-2 rounded-xl transition-all ${user.isBlocked ? 'bg-red-500 text-white' : 'bg-white/5 text-slate-400 hover:text-red-500'}`} title={user.isBlocked ? t.masterUnblockUser : t.masterBlockUser}>
                              <Ban size={18} />
                            </button>
                            <button onClick={() => handleDeleteUser(user.id, user.name)} className="p-2 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all" title={t.masterDeleteUser}>
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'messages' && (
          <div className="bg-white/5 border border-white/10 rounded-[3rem] overflow-hidden flex h-[600px] animate-in fade-in">
             <div className="w-80 border-r border-white/10 flex flex-col bg-slate-950/50">
               <div className="p-6 border-b border-white/10">
                 <h3 className="font-black text-sm uppercase tracking-widest text-slate-400 italic">{t.masterChatConversations}</h3>
               </div>
               <div className="flex-1 overflow-y-auto no-scrollbar">
                 {companies.map(comp => { 
                   const unread = getMessages(comp.id).filter(m => m.senderRole === 'user' && !m.read).length; 
                   const status = getUserOnlineStatus(comp);
                   return (
                     <button 
                       key={comp.id} 
                       onClick={() => selectChat(comp.id)} 
                       className={`w-full p-5 text-left flex items-start gap-4 hover:bg-white/5 border-b border-white/5 ${selectedCompanyId === comp.id ? 'bg-white/10' : ''} relative transition-colors`}
                     >
                       <div className="relative shrink-0">
                         <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center font-black text-amber-500">
                           {comp.name?.charAt(0)}
                         </div>
                         <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-slate-950 ${status.dotColor}`} />
                       </div>
                       <div className="flex-1 min-w-0">
                         <div className="flex items-center justify-between gap-1">
                           <p className="font-black text-sm truncate">{comp.name}</p>
                           {comp.unlockRequested && (
                             <span className="shrink-0 text-[8px] font-black uppercase bg-red-500 text-white px-1.5 py-0.5 rounded animate-pulse" title="Solicitou Desbloqueio">
                               🔑 DESBLOQUEIO
                             </span>
                           )}
                         </div>
                         <p className="text-[10px] text-slate-400 truncate mt-1 flex items-center gap-1">
                           <span className={`w-1.5 h-1.5 rounded-full ${status.isOnline ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`} />
                           {status.isOnline ? 'Online agora' : status.detail}
                         </p>
                       </div>
                       {unread > 0 && (
                         <span className="shrink-0 relative flex h-5 min-w-[22px] px-1.5 items-center justify-center">
                           <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                           <span className="relative inline-flex rounded-full h-5 min-w-[22px] px-1.5 bg-red-600 text-white items-center justify-center text-[10px] font-black border border-slate-950 animate-pulse">
                             +{unread}
                           </span>
                         </span>
                       )}
                     </button>
                   );
                 })}
               </div>
             </div>
             <div className="flex-1 flex flex-col bg-slate-900/20">
               {selectedCompanyId ? (
                 <>
                   <div className="p-6 border-b border-white/10 bg-white/5 flex items-center justify-between gap-4">
                     {(() => {
                       const activeComp = companies.find(c => c.id === selectedCompanyId);
                       if (!activeComp) return null;
                       const status = getUserOnlineStatus(activeComp);
                       return (
                         <>
                           <div className="flex items-center gap-4 min-w-0">
                             <div className="relative shrink-0">
                               <div className="w-10 h-10 bg-amber-500 text-slate-950 rounded-xl flex items-center justify-center font-black">
                                 {activeComp.name?.charAt(0)}
                               </div>
                               <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-slate-950 ${status.dotColor}`} />
                             </div>
                             <div className="min-w-0">
                               <p className="font-black italic text-sm truncate">{activeComp.name}</p>
                               <p className="text-[10px] font-bold text-slate-400 flex items-center gap-1 mt-0.5">
                                 <span className={`w-1.5 h-1.5 rounded-full ${status.isOnline ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`} />
                                 {status.isOnline ? 'Online agora' : status.detail}
                               </p>
                             </div>
                           </div>
                           <button
                             onClick={() => {
                               setShowNotesModal(activeComp);
                               setNotesTextValue(activeComp.masterNotes || '');
                             }}
                             className={`px-3 py-2 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer ${
                               activeComp.masterNotes && activeComp.masterNotes.trim()
                                 ? 'bg-amber-500 text-slate-950 hover:bg-amber-400 shadow-md'
                                 : 'bg-white/10 text-slate-300 hover:text-white hover:bg-white/20'
                             }`}
                             title="Ver / Editar Notas Pessoais deste utilizador"
                           >
                             <FileText size={16} />
                             <span>{activeComp.masterNotes && activeComp.masterNotes.trim() ? "Notas Pessoais 📝" : "+ Nota"}</span>
                           </button>
                         </>
                       );
                     })()}
                   </div>
                   <div className="flex-1 overflow-y-auto p-8 space-y-6 no-scrollbar">
                     {messages.length === 0 ? (
                       <div className="h-full flex items-center justify-center text-slate-500 uppercase font-black text-[10px]">{t.supportNoMessages}</div>
                     ) : (
                       messages.map(m => (
                         <div key={m.id} className={`flex ${m.senderRole === 'master' ? 'justify-end' : 'justify-start'}`}>
                           <div className={`max-w-[70%] p-4 rounded-2xl text-sm font-medium ${m.senderRole === 'master' ? 'bg-amber-500 text-slate-950 rounded-tr-none' : 'bg-white/10 text-white rounded-tl-none border border-white/10'}`}>
                             {m.senderRole === 'user' ? (m.translatedContent || m.content) : m.content}
                           </div>
                         </div>
                       ))
                     )}
                     <div ref={chatEndRef} />
                   </div>
                   <form onSubmit={handleSendMessage} className="p-6 bg-white/5 border-t border-white/10 flex gap-4">
                     <input disabled={isTranslating} type="text" value={newMessage || ''} onChange={e => setNewMessage(e.target.value)} placeholder={t.supportChatPlaceholder} className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm font-bold outline-none" />
                     <button type="submit" disabled={!newMessage.trim() || isTranslating} className="bg-amber-500 text-slate-950 p-4 rounded-2xl hover:scale-110 transition-all">
                       {isTranslating ? <Loader2 className="animate-spin" /> : <Send />}
                     </button>
                   </form>
                 </>
               ) : (
                 <div className="flex-1 flex items-center justify-center opacity-40 uppercase font-black text-xs">{t.masterChatSelectUser}</div>
               )}
             </div>
          </div>
        )}

        {activeTab === 'store' && (
          <div className="bg-white/5 border border-white/10 rounded-[3rem] overflow-hidden animate-in fade-in">
            <div className="p-8 border-b border-white/10 bg-white/5 flex justify-between items-center">
              <h2 className="text-xl font-black flex items-center gap-3 italic text-amber-500 uppercase">
                <ShoppingBag size={24} /> {t.masterStoreTab}
                {pendingStoreOrdersCount > 0 && (
                  <span className="ml-2 px-3 py-1 bg-amber-500/20 text-amber-400 border border-amber-500/40 rounded-full text-xs font-black animate-pulse flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                    +{pendingStoreOrdersCount} Pendentes
                  </span>
                )}
              </h2>
              <button 
                onClick={() => loadData()}
                className="p-3 bg-white/5 text-amber-500 rounded-2xl hover:bg-white/10 transition-all flex items-center gap-2 text-xs font-black uppercase tracking-widest"
              >
                <TrendingUp size={18} className="rotate-90" /> Atualizar
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-white/5">
                    <th className="px-8 py-6">{t.masterTableIdCompany}</th>
                    <th className="px-8 py-6">Produto</th>
                    <th className="px-8 py-6">Qtd</th>
                    <th className="px-8 py-6">Personalização</th>
                    <th className="px-8 py-6">Imagem</th>
                    <th className="px-8 py-6">Status</th>
                    <th className="px-8 py-6">Observações</th>
                    <th className="px-8 py-6 text-center">Excluir</th>
                    <th className="px-8 py-6 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {storeOrders.map(order => {
                    const company = companies.find(c => c.id === order.companyId);
                    return (
                      <tr key={order.id} className="hover:bg-white/5 transition-colors group">
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-white/10 text-amber-500 flex items-center justify-center font-black uppercase">
                              {company?.name?.charAt(0) || '?'}
                            </div>
                            <div>
                              <p className="font-black text-sm">{company?.name || 'Desconhecido'}</p>
                              <p className="text-[9px] font-bold text-slate-500 uppercase tracking-tighter">ID: {order.companyId}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-6 font-bold text-slate-400 text-sm">
                          {order.productName}
                        </td>
                        <td className="px-8 py-6 font-black text-amber-500">
                          {order.quantity}
                        </td>
                        <td className="px-8 py-6">
                          <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full border ${
                            order.needsCustomization ? 'border-emerald-500/50 text-emerald-500' : 'border-slate-500/50 text-slate-500'
                          }`}>
                            {order.needsCustomization ? t.yes : t.no}
                          </span>
                        </td>
                        <td className="px-8 py-6">
                          {order.uploadedImage ? (
                            <button 
                              onClick={() => window.open(order.uploadedImage, '_blank')}
                              className="w-12 h-12 rounded-lg overflow-hidden border border-white/10 hover:border-amber-500 transition-all"
                            >
                              <img src={order.uploadedImage} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                            </button>
                          ) : (
                            <span className="text-[10px] text-slate-600 uppercase font-black">N/A</span>
                          )}
                        </td>
                        <td className="px-8 py-6">
                          <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full border ${
                            order.status === 'pending' ? 'border-amber-500/50 text-amber-500' :
                            order.status === 'processing' ? 'border-blue-500/50 text-blue-500' :
                            'border-emerald-500/50 text-emerald-500'
                          }`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="px-8 py-6">
                          <p className="text-xs text-slate-400 max-w-[200px] truncate" title={order.notes}>
                            {order.notes || '-'}
                          </p>
                        </td>
                        <td className="px-8 py-6 text-center">
                          <button 
                            onClick={() => handleDeleteOrder(order.id)}
                            className="p-2 text-slate-500 hover:text-red-500 transition-colors"
                            title="Excluir Solicitação"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                        <td className="px-8 py-6 text-right">
                          <div className="flex items-center justify-end gap-3">
                            <select 
                              value={order.status}
                              onChange={(e) => updateOrderStatus(order.id, e.target.value as any)}
                              className="bg-slate-900 border border-white/10 rounded-lg px-2 py-1 text-[10px] font-black uppercase outline-none focus:border-amber-500"
                            >
                              <option value="pending">Pendente</option>
                              <option value="processing">Processando</option>
                              <option value="completed">Concluído</option>
                            </select>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {storeOrders.length === 0 && (
                <div className="p-20 text-center">
                  <ShoppingBag size={48} className="mx-auto text-slate-700 mb-4" />
                  <p className="text-slate-500 font-black uppercase text-xs tracking-widest">Nenhum pedido encontrado</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'coupons' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 animate-in fade-in"><div className="bg-white/5 border border-white/10 p-10 rounded-[3rem] space-y-8"><h2 className="text-2xl font-black italic flex items-center gap-3 text-amber-500 uppercase"><Ticket size={28} /> {t.masterCouponCreate}</h2><form onSubmit={handleCreateCoupon} className="space-y-6"><div><label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">{t.masterCouponCode}</label><input required type="text" value={newCouponCode || ''} onChange={e => setNewCouponCode(e.target.value)} placeholder="EX: ATRIOS20" className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm font-black outline-none uppercase" /></div><div><label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">{t.masterCouponDiscount}</label><div className="flex items-center gap-4"><input required type="range" min="5" max="90" step="5" value={newCouponDiscount} onChange={e => setNewCouponDiscount(Number(e.target.value))} className="flex-1 accent-amber-500" /><span className="w-20 text-center bg-white/10 py-3 rounded-xl font-black text-amber-500">{newCouponDiscount}%</span></div></div><button type="submit" className="w-full py-5 bg-amber-500 text-slate-950 rounded-[1.5rem] font-black text-lg hover:bg-amber-400 uppercase">{t.masterSaveActivate}</button></form></div><div className="bg-white/5 border border-white/10 p-10 rounded-[3rem] space-y-8"><h2 className="text-2xl font-black italic flex items-center gap-3 text-blue-400 uppercase"><Percent size={28} /> {t.masterCouponActive}</h2><div className="space-y-4 max-h-[400px] overflow-y-auto no-scrollbar">{coupons.length === 0 ? <div className="py-12 text-center text-slate-500 uppercase font-black text-xs border border-white/10 border-dashed rounded-[2rem]">{t.masterCouponEmpty}</div> : coupons.map(cp => (<div key={cp.id} className="bg-white/5 border border-white/10 p-6 rounded-[2rem] flex justify-between items-center group"><div className="flex items-center gap-6"><div className="w-14 h-14 bg-amber-500/10 text-amber-500 rounded-2xl flex items-center justify-center"><Ticket /></div><div><p className="text-xl font-black italic uppercase tracking-tighter">{cp.code}</p><p className="text-[10px] font-black text-emerald-400 uppercase">{cp.discountPercentage}% {t.masterDiscountOff}</p></div></div><button onClick={() => handleDeleteCoupon(cp.id)} className="p-4 text-red-500 rounded-xl hover:bg-red-500 transition-all"><Trash2 size={18} /></button></div>))}</div></div></div>
        )}

        {activeTab === 'notifications' && (
          <div className="space-y-10 animate-in fade-in">
            <div className="flex justify-center">
              <div className="bg-white/5 border border-white/10 rounded-[3rem] p-10 space-y-8 w-full max-w-2xl">
                <h2 className="text-2xl font-black italic flex items-center gap-3 text-amber-500 uppercase"><Bell size={28} /> {t.newAdBanner}</h2>
                <div className="space-y-6">
                  <label className="relative border-4 border-dashed border-white/10 rounded-[2rem] p-10 flex flex-col items-center justify-center gap-4 cursor-pointer hover:bg-white/5 transition-all overflow-hidden h-64">
                    {imagePreview ? <img src={imagePreview} className="absolute inset-0 w-full h-full object-cover opacity-60" /> : <div className="flex flex-col items-center"><Upload size={32} className="text-slate-400 mb-2" /><span className="text-xs font-black uppercase">{t.masterUploadClick}</span></div>}
                    <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {['all', 'free', 'premium_monthly', 'premium_annual', 'all_premium', 'monthly_purchase', 'annual_purchase'].map(aud => (
                      <button key={aud} onClick={() => setTargetAudience(aud as AudienceType)} className={`px-4 py-3 rounded-xl font-black text-[10px] uppercase border ${targetAudience === aud ? 'bg-amber-50 border-amber-500 text-slate-950' : 'bg-white/5 border-white/10 text-slate-400'}`}>{getAudienceLabel(aud as AudienceType)}</button>
                    ))}
                  </div>
                  <button onClick={saveConfig} className="w-full py-5 bg-emerald-600 text-white rounded-[1.5rem] font-black text-lg hover:bg-emerald-500 shadow-xl flex items-center justify-center gap-3 uppercase"><CheckCircle size={22} /> {t.masterSaveActivate}</button>
                </div>
              </div>
            </div>

            {/* Seção de Notificações Push no Telemóvel */}
            <div className="flex justify-center mt-10">
              <div className="bg-white/5 border border-white/10 rounded-[3rem] p-10 space-y-8 w-full max-w-2xl relative overflow-hidden group">
                <div className="absolute -top-24 -right-24 w-48 h-48 bg-amber-500/10 blur-[80px] rounded-full group-hover:bg-amber-500/20 transition-all duration-700" />
                
                <h2 className="text-2xl font-black italic flex items-center gap-3 text-amber-500 uppercase">
                  <Smartphone size={28} /> Notificações no Telemóvel
                </h2>
                
                <div className="space-y-6">
                  <div className="bg-white/5 p-6 rounded-2xl border border-white/5 flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl overflow-hidden bg-white flex items-center justify-center p-1.5 shrink-0 shadow-lg border border-white/10">
                      <img src="/icon-192.png" alt="App Logo" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-sm text-slate-200">Alertas em Tempo Real com Logotipo</h3>
                      <p className="text-xs text-slate-400 mt-1">
                        Receba notificações diretamente na tela de bloqueio do seu telemóvel quando houver novos cadastros e mensagens de suporte com o logotipo oficial do Átrios.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between py-4 border-y border-white/5">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Estado das Permissões</span>
                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-tight ${
                      pushPermission === 'granted' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 
                      pushPermission === 'denied' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' : 
                      'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    }`}>
                      {pushPermission === 'granted' ? 'Ativo ✅' : 
                       pushPermission === 'denied' ? 'Bloqueado ⚠️' : 
                       'Não Configurado 🔔'}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <button
                      onClick={requestPushPermission}
                      className="py-4 bg-amber-500 text-slate-950 rounded-2xl font-black text-xs uppercase hover:bg-amber-400 flex items-center justify-center gap-2 tracking-widest transition-all shadow-lg active:scale-95"
                    >
                      <Smartphone size={16} /> Ativar no Telemóvel
                    </button>
                    <button
                      onClick={testPushNotification}
                      disabled={pushPermission !== 'granted'}
                      className={`py-4 rounded-2xl font-black text-xs uppercase flex items-center justify-center gap-2 tracking-widest transition-all ${
                        pushPermission === 'granted' 
                          ? 'bg-white/10 border border-white/10 text-white hover:bg-white/15 cursor-pointer' 
                          : 'bg-white/5 border border-transparent text-slate-600 cursor-not-allowed'
                      }`}
                    >
                      <Zap size={16} /> Testar Notificação
                    </button>
                  </div>

                  {pushPermission !== 'granted' && (
                    <p className="text-[10px] text-slate-500 text-center uppercase font-bold mt-2">
                      Nota: Certifique-se de que instalou o aplicativo (PWA) no seu telemóvel para receber notificações em segundo plano!
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-[3rem] p-10 space-y-8">
              <h2 className="text-2xl font-black italic flex items-center gap-3 text-blue-400 uppercase"><Bell size={28} /> {t.activeBanners}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {activeNotifications.length === 0 ? (
                  <div className="col-span-full py-12 text-center text-slate-500 uppercase font-black text-xs border border-white/10 border-dashed rounded-[2rem]">{t.noActiveBanners}</div>
                ) : (
                  activeNotifications.map(n => (
                    <div key={n.id} className="bg-white/5 border border-white/10 rounded-[2rem] overflow-hidden group relative">
                      <div className="aspect-video w-full relative">
                        <img src={n.imageUrl} className="w-full h-full object-cover" alt="Banner" />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <button onClick={() => removeNotification(n.id)} className="p-4 bg-red-500 text-white rounded-full hover:scale-110 transition-transform"><Trash2 size={24} /></button>
                        </div>
                      </div>
                      <div className="p-4 flex justify-between items-center bg-white/5">
                        <span className="text-[10px] font-black uppercase text-amber-500">{getAudienceLabel(n.targetAudience)}</span>
                        <span className="text-[10px] font-black uppercase text-slate-500">{new Date(n.createdAt).toLocaleDateString(locale)}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'push' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 animate-in fade-in">
            <div className="lg:col-span-2 space-y-10">
              <div className="bg-white/5 border border-white/10 rounded-[3rem] p-10 space-y-8">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <h2 className="text-2xl font-black italic flex items-center gap-3 text-amber-500 uppercase">
                    <Smartphone size={28} /> Disparar Alertas em Massa (Push)
                  </h2>
                  <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-2xl">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[9px] font-black uppercase tracking-wider">FCM Ativo: pushbuild-164d9</span>
                  </div>
                </div>

                {/* Info do Projeto Firebase */}
                <div className="bg-slate-950/40 border border-white/5 p-5 rounded-2xl space-y-2">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Configuração do Firebase Cloud Messaging:</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono text-slate-400">
                    <div>
                      <span className="text-slate-500">Project ID:</span> <span className="text-white font-bold">pushbuild-164d9</span>
                    </div>
                    <div>
                      <span className="text-slate-500">Sender ID:</span> <span className="text-white font-bold">387301085750</span>
                    </div>
                    <div className="sm:col-span-2">
                      <span className="text-slate-500">Chave Pública (VAPID):</span> <span className="text-amber-400 font-bold break-all">BDbP6H-i86jr1AR9GpbUJ6oNxH69LPQE5cntwWdI7Ez01T_isAPCAIyfFirzco3MLpTr9G1EWf-4z8-qqhzvMQU</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Título da Notificação</label>
                      <button 
                        type="button" 
                        onClick={() => setShowEmojiPickerFor(showEmojiPickerFor === 'title' ? null : 'title')}
                        className="text-xs bg-white/5 hover:bg-white/10 text-amber-400 font-bold px-3 py-1.5 rounded-xl border border-white/10 flex items-center gap-1.5 transition-all"
                      >
                        😊 <span className="text-[9px] uppercase tracking-wider">Emoji</span>
                      </button>
                    </div>
                    <div className="relative">
                      <input 
                        type="text" 
                        value={pushTitle} 
                        onChange={e => setPushTitle(e.target.value)} 
                        placeholder="Ex: Nova funcionalidade disponível! 🚀" 
                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm font-black outline-none placeholder:text-slate-600 text-white focus:border-amber-500 transition-colors" 
                      />
                      {showEmojiPickerFor === 'title' && (
                        <div className="absolute z-[100] mt-2 right-0 shadow-2xl rounded-2xl overflow-hidden border border-white/10 bg-slate-900">
                          <EmojiPicker 
                            theme={EmojiTheme.DARK}
                            onEmojiClick={(emojiData: EmojiClickData) => {
                              setPushTitle(prev => prev + emojiData.emoji);
                              setShowEmojiPickerFor(null);
                            }}
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Corpo da Mensagem</label>
                      <button 
                        type="button" 
                        onClick={() => setShowEmojiPickerFor(showEmojiPickerFor === 'body' ? null : 'body')}
                        className="text-xs bg-white/5 hover:bg-white/10 text-amber-400 font-bold px-3 py-1.5 rounded-xl border border-white/10 flex items-center gap-1.5 transition-all"
                      >
                        😊 <span className="text-[9px] uppercase tracking-wider">Emoji</span>
                      </button>
                    </div>
                    <div className="relative">
                      <textarea 
                        value={pushBody} 
                        onChange={e => setPushBody(e.target.value)} 
                        placeholder="Ex: Atualize o aplicativo PWA nos seus dispositivos para desfrutar da nova funcionalidade de orçamentos."
                        rows={3}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm font-black outline-none placeholder:text-slate-600 resize-none animate-in duration-300 text-white focus:border-amber-500 transition-colors" 
                      />
                      {showEmojiPickerFor === 'body' && (
                        <div className="absolute z-[100] mt-2 right-0 shadow-2xl rounded-2xl overflow-hidden border border-white/10 bg-slate-900">
                          <EmojiPicker 
                            theme={EmojiTheme.DARK}
                            onEmojiClick={(emojiData: EmojiClickData) => {
                              setPushBody(prev => prev + emojiData.emoji);
                              setShowEmojiPickerFor(null);
                            }}
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Público-Alvo das Notificações</label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {[
                        { id: 'all', label: 'Todos o Clientes' },
                        { id: 'free', label: 'Plano Grátis' },
                        { id: 'all_premium', label: 'Todos Premium' },
                        { id: 'premium_monthly', label: 'Premium Mensal' }
                      ].map(aud => (
                        <button
                          key={aud.id}
                          type="button"
                          onClick={() => setPushAudience(aud.id as AudienceType)}
                          className={`px-4 py-3 rounded-xl font-black text-[10px] uppercase border transition-all ${
                            pushAudience === aud.id 
                              ? 'bg-amber-500 border-amber-500 text-slate-950 shadow-md shadow-amber-500/10' 
                              : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
                          }`}
                        >
                          {aud.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="block text-xs font-black text-slate-200 uppercase tracking-wider">Agendar Notificação?</span>
                        <span className="block text-[10px] text-slate-400 mt-0.5">Programe um dia e horário específicos para disparo automático</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsScheduled(!isScheduled)}
                        className={`w-12 h-6 rounded-full p-1 transition-all flex items-center ${
                          isScheduled ? 'bg-amber-500 justify-end' : 'bg-slate-700 justify-start'
                        }`}
                      >
                        <div className="w-4 h-4 bg-slate-950 rounded-full" />
                      </button>
                    </div>

                    {isScheduled && (
                      <div className="space-y-3 pt-4 border-t border-white/10 animate-in fade-in duration-200">
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Data e Hora de Disparo</label>
                        <input
                          type="datetime-local"
                          value={scheduledTime}
                          onChange={e => setScheduledTime(e.target.value)}
                          min={new Date().toISOString().slice(0, 16)}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-3 text-sm font-black outline-none text-white focus:border-amber-500"
                        />
                      </div>
                    )}
                  </div>

                  <div className="pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <button 
                      type="button"
                      onClick={handleTestLocalPush}
                      className="py-4.5 bg-white/10 hover:bg-white/15 border border-white/10 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all active:scale-95 flex items-center justify-center gap-2"
                    >
                      <Zap size={16} /> {locale.startsWith('pt') ? 'Testar no meu Ecrã' : 'Test on My Screen'}
                    </button>
                    <button 
                      type="button"
                      onClick={handleSendPush}
                      className="py-4.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-2xl font-black text-xs uppercase tracking-widest transition-all active:scale-95 shadow-xl flex items-center justify-center gap-2"
                    >
                      <Smartphone size={16} /> {isScheduled ? 'Confirmar Agendamento' : 'Disparar para os Telemóveis'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Histórico de Disparos */}
              <div className="bg-white/5 border border-white/10 rounded-[3rem] p-10 space-y-6">
                <h3 className="text-xl font-black italic text-slate-300 uppercase flex items-center gap-2">
                  <Bell size={20} /> Histórico de Campanhas Enviadas nesta Sessão
                </h3>
                
                {pushHistory.length === 0 ? (
                  <div className="py-12 text-center text-slate-500 uppercase font-black text-xs border border-white/10 border-dashed rounded-[2rem]">
                    Nenhuma mensagem disparada recentemente.
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[350px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                    {pushHistory.map(hist => (
                      <div key={hist.id} className="bg-white/5 border border-white/10 p-5 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative group">
                        <div>
                          <p className="font-extrabold text-white text-sm">{hist.title}</p>
                          <p className="text-slate-400 text-xs mt-1 leading-snug">{hist.body}</p>
                        </div>
                        <div className="flex sm:flex-col items-end gap-2 shrink-0 w-full sm:w-auto justify-between sm:justify-end">
                          <div className="flex items-center gap-2">
                            <span className="text-[9px] font-black px-2.5 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/20 uppercase rounded-md">
                              {getAudienceLabel(hist.targetAudience)}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleDeletePushHistory(hist.id)}
                              className="p-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg border border-red-500/20 transition-all"
                              title="Excluir do Histórico"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                          <span className="text-[8px] font-bold text-slate-500 uppercase self-end mt-1">
                            {new Date(hist.createdAt).toLocaleTimeString(locale)} - {new Date(hist.createdAt).toLocaleDateString(locale)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Agendamentos Ativos */}
              <div className="bg-white/5 border border-white/10 rounded-[3rem] p-10 space-y-6">
                <h3 className="text-xl font-black italic text-blue-400 uppercase flex items-center gap-2">
                  <Calendar size={20} /> Agendamentos de Push Ativos
                </h3>
                
                {scheduledPushes.length === 0 ? (
                  <div className="py-12 text-center text-slate-500 uppercase font-black text-xs border border-white/10 border-dashed rounded-[2rem]">
                    Nenhum agendamento ativo no momento.
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[350px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                    {scheduledPushes.map(sched => (
                      <div key={sched.id} className="bg-white/5 border border-white/10 p-5 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative group">
                        <div>
                          <p className="font-extrabold text-white text-sm">{sched.title}</p>
                          <p className="text-slate-400 text-xs mt-1 leading-snug">{sched.body}</p>
                        </div>
                        <div className="flex sm:flex-col items-end gap-2 shrink-0 w-full sm:w-auto justify-between sm:justify-end">
                          <div className="flex items-center gap-2">
                            <span className="text-[9px] font-black px-2.5 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 uppercase rounded-md">
                              {getAudienceLabel(sched.targetAudience)}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleCancelScheduledPush(sched.id)}
                              className="p-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg border border-red-500/20 transition-all"
                              title="Cancelar Agendamento"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                          <span className="text-[8px] font-bold text-amber-500 uppercase self-end mt-1">
                            Disparo: {new Date(sched.scheduledTime).toLocaleString(locale)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Simulador Phone Preview */}
            <div className="lg:col-span-1">
              <div className="bg-slate-900 border border-white/10 rounded-[4rem] p-6 shadow-2xl relative overflow-hidden h-[600px] flex flex-col">
                {/* Speaker e Camera do Telemóvel */}
                <div className="absolute top-4 left-1/2 -translate-x-1/2 w-32 h-6 bg-black rounded-full z-20 flex items-center justify-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-slate-800" />
                  <div className="w-12 h-1 bg-slate-800 rounded-full" />
                </div>

                {/* Ecrã de Fundo */}
                <div className="flex-1 rounded-[3rem] bg-gradient-to-b from-indigo-950 via-slate-950 to-slate-950 relative overflow-hidden p-6 flex flex-col justify-between pt-12">
                  {/* Lockscreen Header Info */}
                  <div className="text-center space-y-1">
                    <p className="text-xs text-white/50 uppercase font-bold tracking-widest">{new Date().toLocaleDateString(locale, { weekday: 'long', day: 'numeric', month: 'long' })}</p>
                    <p className="text-4xl font-extrabold text-white tracking-tighter">
                      {new Date().toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>

                  {/* Simulator Push Notification Notification Card */}
                  <div className="flex-1 flex items-center justify-center">
                    {(pushTitle || pushBody) ? (
                      <div className="w-full bg-slate-900/90 border border-white/10 backdrop-blur-md rounded-2xl p-4 space-y-3 shadow-2xl animate-bounce">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-lg bg-white overflow-hidden p-0.5 border border-white/10 flex items-center justify-center shrink-0">
                              <img src="/icon-192.png" alt="App Icon" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                            </div>
                            <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest font-sans">Átrios App</span>
                          </div>
                          <span className="text-[9px] font-bold text-slate-500 uppercase">Agora mesmo</span>
                        </div>
                        <div>
                          <p className="font-extrabold text-white text-xs tracking-tight line-clamp-1">{pushTitle || 'Título da Notificação'}</p>
                          <p className="text-[10px] text-slate-400 mt-0.5 leading-snug break-words line-clamp-3">{pushBody || 'Digite ao lado para testar...'}</p>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center p-6 space-y-2 border border-dashed border-white/5 rounded-2xl w-full">
                        <p className="text-xs text-slate-500 uppercase font-black">Telemóvel do Cliente</p>
                        <p className="text-[10px] text-slate-600 font-medium">Insira o texto para testar a entrega no telemóvel.</p>
                      </div>
                    )}
                  </div>

                  {/* Lockscreen Swipe hint */}
                  <div className="text-center py-2 border-t border-white/5 shrink-0">
                    <p className="text-[8px] font-black text-slate-500 uppercase tracking-wider animate-pulse">
                      🔒 Deslize para abrir o aplicativo
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'products' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 animate-in fade-in">
            <div className="lg:col-span-1 bg-white/5 border border-white/10 p-10 rounded-[3rem] space-y-8 h-fit">
              <h2 className="text-2xl font-black italic flex items-center gap-3 text-amber-500 uppercase">
                <Package size={28} /> {editingProduct ? 'Editar Produto' : 'Novo Produto'}
              </h2>
              <form onSubmit={handleSaveProduct} className="space-y-6">
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Código do Produto</label>
                  <input 
                    required 
                    type="text" 
                    value={productCode || ''} 
                    onChange={e => setProductCode(e.target.value)} 
                    placeholder="EX: MUG-001" 
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm font-black outline-none uppercase" 
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Nome do Produto</label>
                  <input 
                    required 
                    type="text" 
                    value={productName || ''} 
                    onChange={e => setProductName(e.target.value)} 
                    placeholder="Nome do produto" 
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm font-black outline-none" 
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Preço (Opcional)</label>
                  <input 
                    type="number" 
                    step="0.01"
                    value={productPrice === '' ? '' : productPrice} 
                    onChange={e => setProductPrice(e.target.value === '' ? '' : Number(e.target.value))} 
                    placeholder="EX: 19.90" 
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm font-black outline-none" 
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Categoria</label>
                  <select 
                    value={productCategory} 
                    onChange={e => setProductCategory(e.target.value)} 
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm font-black outline-none uppercase"
                  >
                    <option value="Branding">Branding</option>
                    <option value="Apparel">Vestuário</option>
                    <option value="Safety">Segurança</option>
                    <option value="Tools">Ferramentas</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Descrição</label>
                  <textarea 
                    required 
                    value={productDescription} 
                    onChange={e => setProductDescription(e.target.value)} 
                    placeholder="Descrição do produto..." 
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm font-medium outline-none min-h-[100px] resize-none" 
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Foto Principal</label>
                  <label className="relative border-4 border-dashed border-white/10 rounded-[2rem] p-6 flex flex-col items-center justify-center gap-4 cursor-pointer hover:bg-white/5 transition-all overflow-hidden h-40">
                    {productImage ? (
                      <img src={productImage} className="absolute inset-0 w-full h-full object-cover opacity-60" />
                    ) : (
                      <div className="flex flex-col items-center">
                        <Upload size={24} className="text-slate-400 mb-2" />
                        <span className="text-[10px] font-black uppercase">Upload Foto Principal</span>
                      </div>
                    )}
                    <input type="file" className="hidden" accept="image/*" onChange={handleProductImageUpload} />
                  </label>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Fotos Adicionais (Máx 5)</label>
                  <div className="grid grid-cols-3 gap-3 mb-3">
                    {additionalProductImages.map((img, idx) => (
                      <div key={idx} className="relative aspect-square rounded-xl overflow-hidden group">
                        <img src={img} className="w-full h-full object-cover" />
                        <button 
                          type="button"
                          onClick={() => removeAdditionalImage(idx)}
                          className="absolute inset-0 bg-red-500/80 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                    {additionalProductImages.length < 5 && (
                      <label className="aspect-square border-2 border-dashed border-white/10 rounded-xl flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-white/5 transition-all">
                        <Plus size={20} className="text-slate-400" />
                        <span className="text-[8px] font-black uppercase">Add</span>
                        <input type="file" className="hidden" accept="image/*" multiple onChange={handleAdditionalImageUpload} />
                      </label>
                    )}
                  </div>
                </div>
                <div className="flex gap-3">
                  <button type="submit" className="flex-1 py-5 bg-amber-500 text-slate-950 rounded-[1.5rem] font-black text-lg hover:bg-amber-400 uppercase">
                    {editingProduct ? 'Atualizar' : 'Salvar'}
                  </button>
                  {editingProduct && (
                    <button 
                      type="button" 
                      onClick={() => {
                        setEditingProduct(null);
                        setProductName('');
                        setProductCode('');
                        setProductDescription('');
                        setProductImage(null);
                      }}
                      className="px-6 py-5 bg-white/5 rounded-[1.5rem] font-black text-sm uppercase"
                    >
                      Cancelar
                    </button>
                  )}
                </div>
              </form>
            </div>

            <div className="lg:col-span-2 bg-white/5 border border-white/10 p-10 rounded-[3rem] space-y-8">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-black italic flex items-center gap-3 text-blue-400 uppercase">
                  <Package size={28} /> Produtos Ativos
                </h2>
                <button
                  onClick={async () => {
                    const localProducts = await getProducts();
                    if (localProducts.length === 0) {
                      alert("Nenhum produto local para sincronizar.");
                      return;
                    }
                    
                    if (confirm(`Deseja tentar sincronizar ${localProducts.length} produtos com o Supabase?`)) {
                      let successCount = 0;
                      for (const p of localProducts) {
                        const result = await saveProduct(p);
                        if (result.success) successCount++;
                      }
                      alert(`Sincronização concluída!\nSucesso: ${successCount}\nFalha: ${localProducts.length - successCount}`);
                      loadData();
                    }
                  }}
                  className="px-4 py-2 bg-amber-500/10 text-amber-500 rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-amber-500/20 transition-all flex items-center gap-2"
                >
                  <Zap size={14} />
                  Sincronizar Tudo
                </button>
                <button
                  onClick={async () => {
                    console.log("--- DIAGNÓSTICO DE PRODUTOS ---");
                    const localRaw = localStorage.getItem('atrios_products');
                    const localParsed = localRaw ? JSON.parse(localRaw) : [];
                    console.log("Local Storage 'atrios_products':", localRaw);
                    console.log("Estado 'products':", products);
                    
                    const hasViteUrl = !!import.meta.env.VITE_SUPABASE_URL;
                    const hasViteKey = !!import.meta.env.VITE_SUPABASE_ANON_KEY;
                    
                    console.log("Configuração Supabase:");
                    console.log("- VITE_SUPABASE_URL:", hasViteUrl ? "Definido" : "NÃO DEFINIDO (Usando fallback)");
                    console.log("- VITE_SUPABASE_ANON_KEY:", hasViteKey ? "Definido" : "NÃO DEFINIDO (Usando fallback)");
                    
                    try {
                      console.log("Testando conexão Supabase...");
                      const testProducts = await testTableAccess('products');
                      const testOrders = await testTableAccess('store_orders');
                      const testSubs = await testTableAccess('push_subscriptions');
                      
                      if (!testProducts.success || !testOrders.success || !testSubs.success) {
                        console.warn("Erro na conexão Supabase:", { products: testProducts.error, orders: testOrders.error, subs: testSubs.error });
                        const errP = testProducts.error as any;
                        const errO = testOrders.error as any;
                        const errS = testSubs.error as any;
                        
                        let msg = "DIAGNÓSTICO SUPABASE - TABELAS EM FALTA:\n\n";
                        
                        if (!testProducts.success) {
                          msg += `TABELA 'products':\nStatus: ${testProducts.status}\nMensagem: ${errP?.message || "Erro"}\n\n`;
                        }
                        
                        if (!testOrders.success) {
                          msg += `TABELA 'store_orders':\nStatus: ${testOrders.status}\nMensagem: ${errO?.message || "Erro"}\n\n`;
                        }

                        if (!testSubs.success) {
                          msg += `TABELA 'push_subscriptions' (Necessária para Push PWA/FCM):\nStatus: ${testSubs.status}\nMensagem: ${errS?.message || "Erro"}\n\n`;
                        }
                        
                        msg += "SQL PARA CRIAR TABELAS (Execute isto no SQL Editor do Supabase):\n\n";
                        
                        if (!testProducts.success) {
                          msg += "CREATE TABLE products (\n  id TEXT PRIMARY KEY,\n  name TEXT,\n  code TEXT,\n  category TEXT,\n  description TEXT,\n  image TEXT,\n  price NUMERIC,\n  active BOOLEAN DEFAULT true,\n  created_at TIMESTAMPTZ DEFAULT now()\n);\n\n";
                          msg += "ALTER TABLE products ENABLE ROW LEVEL SECURITY;\nCREATE POLICY \"Public Access\" ON products FOR ALL USING (true) WITH CHECK (true);\n\n";
                        }

                        if (!testOrders.success) {
                          msg += "CREATE TABLE store_orders (\n  id TEXT PRIMARY KEY,\n  \"companyId\" TEXT,\n  \"productId\" TEXT,\n  \"productName\" TEXT,\n  quantity INTEGER,\n  notes TEXT,\n  \"uploadedImage\" TEXT,\n  status TEXT,\n  created_at TIMESTAMPTZ DEFAULT now()\n);\n\n";
                          msg += "ALTER TABLE store_orders ENABLE ROW LEVEL SECURITY;\nCREATE POLICY \"Public Access\" ON store_orders FOR ALL USING (true) WITH CHECK (true);\n\n";
                        }

                        if (!testSubs.success) {
                          msg += "CREATE TABLE push_subscriptions (\n  id TEXT PRIMARY KEY,\n  subscription TEXT,\n  token TEXT,\n  plan TEXT,\n  \"companyId\" TEXT,\n  \"company_id\" TEXT,\n  \"companyid\" TEXT,\n  created_at TIMESTAMPTZ DEFAULT now()\n);\n\n";
                          msg += "ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;\nCREATE POLICY \"Public Access\" ON push_subscriptions FOR ALL USING (true) WITH CHECK (true);\n\n";
                        }
                        
                        alert(msg);
                      } else {
                        console.log("Conexão Supabase OK. Status:", testProducts.status);
                        alert(`CONEXÃO SUPABASE OK!\n\nStatus: ${testProducts.status}\nProdutos Locais: ${localParsed.length}\nPedidos Locais: ${storeOrders.length}\nSubscrições Push: Ativas\n\nTudo pronto para sincronizar dados e enviar notificações push FCM/Web Push de forma resiliente.`);
                      }
                    } catch (e) {
                      console.error("Falha crítica no diagnóstico:", e);
                      alert("Falha crítica: " + (e as Error).message);
                    }
                  }}
                  className="px-4 py-2 bg-white/10 text-slate-400 rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-white/20 transition-all flex items-center gap-2"
                >
                  <Search size={14} />
                  Diagnóstico
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {products.length === 0 ? (
                  <div className="col-span-full py-20 text-center text-slate-500 uppercase font-black text-xs border border-white/10 border-dashed rounded-[2rem]">
                    Nenhum produto cadastrado
                  </div>
                ) : (
                  products.map(p => (
                    <div key={p.id} className="bg-white/5 border border-white/10 rounded-[2rem] overflow-hidden group relative flex flex-col">
                      <div className="aspect-video w-full relative">
                        <img src={p.image} className="w-full h-full object-cover" alt={p.name} />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                          <button 
                            onClick={() => handleEditProduct(p)} 
                            className="p-4 bg-amber-500 text-slate-950 rounded-full hover:scale-110 transition-transform"
                          >
                            <Settings size={24} />
                          </button>
                          <button 
                            onClick={() => handleDeleteProduct(p.id)} 
                            className="p-4 bg-red-500 text-white rounded-full hover:scale-110 transition-transform"
                          >
                            <Trash2 size={24} />
                          </button>
                        </div>
                      </div>
                      <div className="p-6 space-y-3 flex-1 flex flex-col">
                        <div className="space-y-1">
                          <div className="flex justify-between items-center">
                            <span className="text-[10px] font-black uppercase tracking-widest text-amber-500">{p.category}</span>
                            <div className="flex items-center gap-2">
                              <span className="text-[8px] font-black uppercase text-slate-400 bg-slate-400/10 px-2 py-0.5 rounded-md">{p.code}</span>
                              {p.synced === false && (
                                <span className="text-[7px] font-black uppercase text-red-500 bg-red-500/10 px-1 py-0.5 rounded flex items-center gap-1">
                                  <AlertCircle size={8} /> Offline
                                </span>
                              )}
                              {p.synced === true && (
                                <span className="text-[7px] font-black uppercase text-green-500 bg-green-500/10 px-1 py-0.5 rounded flex items-center gap-1">
                                  <CheckCircle size={8} /> Cloud
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex justify-between items-start">
                            <h3 className="text-xl font-black text-slate-900 leading-tight uppercase italic">{p.name}</h3>
                            {p.price != null && (
                              <span className="text-lg font-black text-amber-500 italic">
                                {p.price.toLocaleString('pt-PT', { style: 'currency', currency: 'EUR' })}
                              </span>
                            )}
                          </div>
                        </div>
                        <p className="text-sm text-slate-500 font-medium leading-relaxed flex-1">
                          {p.description}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'jobs' && (
          <div className="space-y-8 animate-in fade-in">
            {/* Top Bar / Stats */}
            <div className="bg-white/5 border border-white/10 p-8 rounded-[3rem] flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold border border-amber-500/30">
                  <HardHat size={14} /> Átrios Build ➔ Átrios Work
                </div>
                <h2 className="text-3xl font-black italic text-white uppercase flex items-center gap-3">
                  Aprovação de Vagas de Trabalho
                </h2>
                <p className="text-slate-400 text-xs font-semibold max-w-xl">
                  Gerencie e analise as oportunidades de trabalho submetidas pelas empresas no **Átrios Build** para a rede de trabalhadores no **Átrios Work**.
                </p>
              </div>

              {/* Status Filter Badges */}
              <div className="flex flex-wrap items-center gap-2 bg-slate-950/60 p-2 rounded-2xl border border-white/10">
                {[
                  { id: 'all', label: 'Todas', count: jobOffers.length },
                  { id: 'pending', label: 'Pendentes', count: jobOffers.filter(j => j.status === 'pending').length },
                  { id: 'approved', label: 'Aprovadas', count: jobOffers.filter(j => j.status === 'approved').length },
                  { id: 'adjustment_requested', label: 'Ajuste Solicitado', count: jobOffers.filter(j => j.status === 'adjustment_requested').length },
                  { id: 'rejected', label: 'Desaprovadas', count: jobOffers.filter(j => j.status === 'rejected').length }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setJobStatusFilter(tab.id as any)}
                    className={`px-4 py-2 rounded-xl text-xs font-black uppercase transition-all flex items-center gap-2 ${
                      jobStatusFilter === tab.id
                        ? 'bg-amber-500 text-slate-950 shadow-lg'
                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {tab.label}
                    {tab.count > 0 && (
                      <span className={`px-2 py-0.5 rounded-full text-[10px] ${
                        jobStatusFilter === tab.id ? 'bg-slate-950 text-white' : 'bg-white/10 text-slate-300'
                      }`}>
                        {tab.count}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* List of Job Offers */}
            {jobOffers.filter(j => jobStatusFilter === 'all' || j.status === jobStatusFilter).length === 0 ? (
              <div className="bg-white/5 border border-white/10 rounded-[3rem] p-16 text-center space-y-4">
                <div className="w-16 h-16 bg-amber-500/10 text-amber-500 rounded-2xl flex items-center justify-center mx-auto">
                  <HardHat size={32} />
                </div>
                <h3 className="text-xl font-black text-white italic uppercase">Nenhuma vaga nesta categoria</h3>
                <p className="text-xs text-slate-400 font-medium">Não existem vagas de trabalho com o estado selecionado.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {jobOffers
                  .filter(j => jobStatusFilter === 'all' || j.status === jobStatusFilter)
                  .map(job => (
                    <div
                      key={job.id}
                      className="bg-white/5 border border-white/10 hover:border-amber-500/40 p-6 rounded-[2.5rem] space-y-5 transition-all flex flex-col justify-between"
                    >
                      <div className="space-y-4">
                        {/* Company & Status */}
                        <div className="flex items-start justify-between gap-3 border-b border-white/10 pb-4">
                          <div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-amber-400 block mb-1">
                              {job.companyName}
                            </span>
                            <h3 className="text-lg font-black text-white italic uppercase flex items-center gap-2">
                              <HardHat size={18} className="text-amber-500 shrink-0" />
                              {job.specialty}
                            </h3>
                          </div>
                          <div>
                            {job.status === 'approved' && (
                              <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                                Aprovada
                              </span>
                            )}
                            {job.status === 'pending' && (
                              <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase bg-amber-500/20 text-amber-400 border border-amber-500/30 animate-pulse">
                                Pendente
                              </span>
                            )}
                            {job.status === 'adjustment_requested' && (
                              <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase bg-amber-500/30 text-amber-300 border border-amber-400">
                                Ajuste Solicitado
                              </span>
                            )}
                            {job.status === 'rejected' && (
                              <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase bg-rose-500/20 text-rose-400 border border-rose-500/30">
                                Desaprovada
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Details */}
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div className="bg-white/5 p-2.5 rounded-xl border border-white/5 text-slate-300 font-semibold truncate flex items-center gap-2">
                            <MapPin size={14} className="text-amber-400 shrink-0" /> {job.location}
                          </div>
                          <div className="bg-white/5 p-2.5 rounded-xl border border-white/5 text-emerald-400 font-black truncate flex items-center gap-2">
                            <Euro size={14} className="shrink-0" /> {job.salary}
                          </div>
                          <div className="bg-white/5 p-2.5 rounded-xl border border-white/5 text-slate-300 font-semibold truncate flex items-center gap-2">
                            <Calendar size={14} className="text-amber-400 shrink-0" /> Início: {job.startDate}
                          </div>
                          <div className="bg-white/5 p-2.5 rounded-xl border border-white/5 text-slate-300 font-semibold truncate flex items-center gap-2">
                            <Clock size={14} className="text-amber-400 shrink-0" /> Duração: {job.duration}
                          </div>
                        </div>

                        {/* Description */}
                        <div className="space-y-1">
                          <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">Descrição</span>
                          <p className="text-xs text-slate-300 leading-relaxed font-medium bg-slate-950/40 p-3 rounded-xl border border-white/5 whitespace-pre-line">
                            {job.description}
                          </p>
                        </div>

                        {/* Contact */}
                        <div className="flex items-center gap-2 text-xs font-bold text-amber-300">
                          <Phone size={14} /> Contacto: {job.contact}
                        </div>

                        {/* Existing feedback if any */}
                        {job.feedback && (
                          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200">
                            <span className="font-black uppercase text-[9px] tracking-wider block mb-1">Observações / Ajustes solicitados:</span>
                            {job.feedback}
                          </div>
                        )}

                        {/* Interested Candidates JSON & Table Candidates */}
                        {(() => {
                          const currentJson = candidateJsonInputs[job.id] !== undefined ? candidateJsonInputs[job.id] : (job.candidatesJson || '');
                          
                          // Parse helper function
                          const parseJsonInfo = (rawStr: string) => {
                            if (!rawStr || !rawStr.trim()) return { valid: true, list: [], count: 0, isEmpty: true };
                            try {
                              const cleaned = rawStr.trim();
                              const parsed = JSON.parse(cleaned);
                              if (Array.isArray(parsed)) {
                                return { valid: true, list: parsed, count: parsed.length, isEmpty: false };
                              } else if (typeof parsed === 'object' && parsed !== null) {
                                return { valid: true, list: [parsed], count: 1, isEmpty: false };
                              } else {
                                return { valid: false, list: [], count: 0, isEmpty: false, error: 'O JSON precisa ser um objeto {...} ou uma lista [...] de candidatos.' };
                              }
                            } catch (err: any) {
                              return { valid: false, list: [], count: 0, isEmpty: false, error: err?.message || 'Formato JSON incompleto ou inválido.' };
                            }
                          };

                          const parseStatus = parseJsonInfo(currentJson);
                          const jobCandidatesFromTable = candidatesList.filter(c => String(c.jobOfferId) === String(job.id));

                          return (
                            <div className="space-y-3 bg-slate-950/60 p-4 rounded-2xl border border-white/10">
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                                  <Code size={13} /> Candidatos (Código JSON)
                                </span>
                                <div>
                                  {parseStatus.isEmpty ? (
                                    <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-slate-800 text-slate-400 border border-white/10">
                                      Nenhum JSON inserido
                                    </span>
                                  ) : parseStatus.valid ? (
                                    <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                                      ✓ JSON Válido ({parseStatus.count} candidato{parseStatus.count === 1 ? '' : 's'})
                                    </span>
                                  ) : (
                                    <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30">
                                      ⚠️ Digitando / JSON Incompleto
                                    </span>
                                  )}
                                </div>
                              </div>

                              <textarea
                                value={currentJson}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setCandidateJsonInputs(prev => ({ ...prev, [job.id]: val }));
                                  setJobOffers(prev => prev.map(j => String(j.id) === String(job.id) ? { ...j, candidatesJson: val } : j));
                                  const localJobs = getStoredJobOffers();
                                  const updatedLocal = localJobs.map(lj => String(lj.id) === String(job.id) ? { ...lj, candidatesJson: val } : lj);
                                  safeSetItem('atrios_job_offers', JSON.stringify(updatedLocal));
                                }}
                                placeholder={`Cole aqui o código JSON dos candidatos interessados (ex: {"full_name": "Ana", "email": "ana@email.com", ...})`}
                                className="w-full h-28 bg-slate-900 border border-white/10 rounded-xl p-3 text-xs text-white font-mono focus:outline-none focus:border-amber-500 resize-y"
                              />

                              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-[10px] text-slate-400">
                                <span>Salva os candidatos diretamente na tabela <strong>candidates</strong> e na vaga.</span>
                                <button
                                  onClick={async () => {
                                    if (currentJson.trim() && !parseStatus.valid) {
                                      alert(`⚠️ Não foi possível guardar. ${parseStatus.error || 'Verifique se o código JSON tem fecho de aspas/chaves válido.'}`);
                                      return;
                                    }

                                    const updatedJob = { ...job, candidatesJson: currentJson };
                                    await saveJobOffer(updatedJob);

                                    let savedCount = 0;
                                    if (parseStatus.valid && parseStatus.list.length > 0) {
                                      for (const c of parseStatus.list) {
                                        const candidateRecord: Candidate = {
                                          id: String(c.id || 'cand_' + Math.random().toString(36).substring(2, 9)),
                                          jobOfferId: String(job.id),
                                          full_name: String(c.full_name || c.fullName || c.name || 'Candidato Sem Nome'),
                                          email: String(c.email || ''),
                                          phone: String(c.phone || ''),
                                          cover_letter: String(c.cover_letter || c.coverLetter || c.notes || ''),
                                          has_residence_permit: Boolean(c.has_residence_permit ?? c.hasResidencePermit ?? false),
                                          document_type: String(c.document_type || c.documentType || ''),
                                          has_drivers_license: Boolean(c.has_drivers_license ?? c.hasDriversLicense ?? false),
                                          has_construction_experience: Boolean(c.has_construction_experience ?? c.hasConstructionExperience ?? false),
                                          experience_duration: String(c.experience_duration || c.experienceDuration || ''),
                                          photo_url: String(c.photo_url || c.photoUrl || ''),
                                          created_at: new Date().toISOString()
                                        };
                                        const resCand = await saveCandidate(candidateRecord);
                                        if (resCand.success) savedCount++;
                                      }
                                    }

                                    // Refresh stored candidates
                                    const { data: cloudCandidates } = await safeFetch<any[]>(supabase.from('candidates').select('*'));
                                    const localCandidates = getStoredCandidates();
                                    if (cloudCandidates && Array.isArray(cloudCandidates)) {
                                      const mappedCand = cloudCandidates.map(mapCandidateFromSupabase);
                                      const candMap = new Map<string, Candidate>();
                                      localCandidates.forEach(cand => candMap.set(String(cand.id), cand));
                                      mappedCand.forEach(cand => candMap.set(String(cand.id), cand));
                                      setCandidatesList(Array.from(candMap.values()));
                                    } else {
                                      setCandidatesList(localCandidates);
                                    }

                                    alert(`✅ Vaga guardada com sucesso! ${savedCount > 0 ? `${savedCount} candidato(s) inserido(s) na tabela 'candidates'.` : ''}`);
                                  }}
                                  className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl uppercase tracking-wider text-[10px] transition-all shadow flex items-center gap-1.5 self-end sm:self-auto"
                                >
                                  Salvar Candidato(s) & Vaga
                                </button>
                              </div>

                              {/* Preview Parsed JSON Candidates */}
                              {parseStatus.valid && parseStatus.list.length > 0 && (
                                <div className="mt-3 space-y-2 pt-3 border-t border-white/10">
                                  <span className="text-[10px] font-black text-amber-300 uppercase tracking-wider flex items-center justify-between">
                                    <span>Pré-Visualização do JSON ({parseStatus.list.length} candidato{parseStatus.list.length === 1 ? '' : 's'}):</span>
                                    <span className="text-[9px] text-slate-400 font-normal">Clique para ver ficha completa</span>
                                  </span>
                                  <div className="max-h-56 overflow-y-auto space-y-2 pr-1">
                                    {parseStatus.list.map((c: any, idx: number) => (
                                      <div 
                                        key={idx} 
                                        onClick={() => setSelectedCandidatePreview(c)}
                                        className="p-3 rounded-xl bg-slate-900 hover:bg-slate-850 border border-white/10 hover:border-amber-500/50 text-xs text-slate-300 flex items-start gap-3 cursor-pointer transition-all group"
                                      >
                                        {c.photo_url ? (
                                          <img src={c.photo_url} alt={c.full_name || 'Candidato'} className="w-11 h-11 rounded-full object-cover border border-amber-500/30 flex-shrink-0 group-hover:scale-105 transition-transform" referrerPolicy="no-referrer" />
                                        ) : (
                                          <div className="w-11 h-11 rounded-full bg-slate-800 flex items-center justify-center font-black text-amber-400 flex-shrink-0 text-xs border border-white/10 group-hover:border-amber-500/30">
                                            {(c.full_name || c.name || 'C').charAt(0).toUpperCase()}
                                          </div>
                                        )}
                                        <div className="flex-1 min-w-0 space-y-1">
                                          <div className="flex items-center justify-between">
                                            <span className="font-bold text-white truncate group-hover:text-amber-300 transition-colors">
                                              {c.full_name || c.fullName || c.name || 'Sem Nome'}
                                            </span>
                                            <span className="text-[10px] text-amber-400 font-bold flex items-center gap-1 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                                              <Eye size={11} /> Ver Perfil
                                            </span>
                                          </div>
                                          <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[10px] text-slate-400">
                                            {c.email && <span className="text-amber-300/90">{c.email}</span>}
                                            {c.phone && <span>Tel: {c.phone}</span>}
                                          </div>
                                          {(c.cover_letter || c.coverLetter || c.notes) && (
                                            <p className="text-[10px] text-slate-400 italic line-clamp-2 mt-1">"{c.cover_letter || c.coverLetter || c.notes}"</p>
                                          )}
                                          <div className="flex flex-wrap gap-1.5 pt-1">
                                            {(c.experience_duration || c.experienceDuration) && (
                                              <span className="px-1.5 py-0.5 rounded text-[9px] bg-slate-800 text-slate-300 border border-white/10 font-mono">
                                                Exp: {c.experience_duration || c.experienceDuration} anos
                                              </span>
                                            )}
                                            {(c.has_residence_permit ?? c.hasResidencePermit) && (
                                              <span className="px-1.5 py-0.5 rounded text-[9px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                                                Permissão Residência
                                              </span>
                                            )}
                                            {(c.has_drivers_license ?? c.hasDriversLicense) && (
                                              <span className="px-1.5 py-0.5 rounded text-[9px] bg-blue-500/20 text-blue-300 border border-blue-500/30">
                                                Carta Condução
                                              </span>
                                            )}
                                            {(c.has_construction_experience ?? c.hasConstructionExperience) && (
                                              <span className="px-1.5 py-0.5 rounded text-[9px] bg-amber-500/20 text-amber-300 border border-amber-500/30">
                                                Exp. Construção
                                              </span>
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Saved Candidates in Candidates Table */}
                              {jobCandidatesFromTable.length > 0 && (
                                <div className="mt-3 space-y-2 pt-3 border-t border-emerald-500/20">
                                  <span className="text-[10px] font-black text-emerald-400 uppercase tracking-wider block">
                                    Candidatos Guardados na Tabela 'candidates' ({jobCandidatesFromTable.length}):
                                  </span>
                                  <div className="max-h-56 overflow-y-auto space-y-2 pr-1">
                                    {jobCandidatesFromTable.map((cand) => (
                                      <div 
                                        key={cand.id} 
                                        onClick={() => setSelectedCandidatePreview(cand)}
                                        className="p-3 rounded-xl bg-slate-900/90 hover:bg-slate-850 border border-emerald-500/20 hover:border-emerald-500/50 text-xs text-slate-300 flex items-start gap-3 cursor-pointer transition-all group"
                                      >
                                        {cand.photo_url ? (
                                          <img src={cand.photo_url} alt={cand.full_name} className="w-11 h-11 rounded-full object-cover border border-emerald-500/40 flex-shrink-0 group-hover:scale-105 transition-transform" referrerPolicy="no-referrer" />
                                        ) : (
                                          <div className="w-11 h-11 rounded-full bg-emerald-950 flex items-center justify-center font-black text-emerald-400 border border-emerald-500/30 flex-shrink-0 text-xs">
                                            {(cand.full_name || 'C').charAt(0).toUpperCase()}
                                          </div>
                                        )}
                                        <div className="flex-1 min-w-0 space-y-1">
                                          <div className="flex items-center justify-between">
                                            <span className="font-bold text-white truncate group-hover:text-emerald-300 transition-colors">{cand.full_name}</span>
                                            <div className="flex items-center gap-1.5">
                                              <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                                                <Eye size={11} /> Ver Ficha
                                              </span>
                                              <button
                                                onClick={async (e) => {
                                                  e.stopPropagation();
                                                  if (confirm(`Remover candidato ${cand.full_name} da tabela candidates?`)) {
                                                    await deleteCandidate(cand.id);
                                                    setCandidatesList(prev => prev.filter(c => c.id !== cand.id));
                                                  }
                                                }}
                                                className="text-[10px] text-rose-400 hover:text-rose-300 p-1 rounded hover:bg-rose-500/10 transition-all"
                                                title="Remover Candidato"
                                              >
                                                <Trash2 size={12} />
                                              </button>
                                            </div>
                                          </div>
                                          <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[10px] text-slate-400">
                                            {cand.email && <span className="text-emerald-300/90">{cand.email}</span>}
                                            {cand.phone && <span>Tel: {cand.phone}</span>}
                                          </div>
                                          {cand.cover_letter && (
                                            <p className="text-[10px] text-slate-400 italic line-clamp-2 mt-1">"{cand.cover_letter}"</p>
                                          )}
                                          <div className="flex flex-wrap gap-1.5 pt-1">
                                            {cand.experience_duration && (
                                              <span className="px-1.5 py-0.5 rounded text-[9px] bg-slate-800 text-slate-300 border border-white/10 font-mono">
                                                Exp: {cand.experience_duration} anos
                                              </span>
                                            )}
                                            {cand.has_residence_permit && (
                                              <span className="px-1.5 py-0.5 rounded text-[9px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                                                Permissão Residência
                                              </span>
                                            )}
                                            {cand.has_drivers_license && (
                                              <span className="px-1.5 py-0.5 rounded text-[9px] bg-blue-500/20 text-blue-300 border border-blue-500/30">
                                                Carta Condução
                                              </span>
                                            )}
                                            {cand.has_construction_experience && (
                                              <span className="px-1.5 py-0.5 rounded text-[9px] bg-amber-500/20 text-amber-300 border border-amber-500/30">
                                                Exp. Construção
                                              </span>
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })()}
                      </div>

                      {/* Action Buttons for Master */}
                      <div className="pt-4 border-t border-white/10 space-y-2">
                        <div className="grid grid-cols-3 gap-2">
                          <button
                            onClick={() => handleApproveJob(job)}
                            className="py-2.5 px-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs uppercase flex items-center justify-center gap-1 transition-all shadow-lg shadow-emerald-500/10"
                            title="Aprovar e publicar no Átrios Work"
                          >
                            <CheckCircle size={14} /> Aprovar
                          </button>

                          <button
                            onClick={() => handleOpenJobFeedbackModal(job, 'adjustment_requested')}
                            className="py-2.5 px-2 rounded-xl bg-amber-500/20 hover:bg-amber-500 text-amber-300 hover:text-slate-950 border border-amber-500/30 font-black text-xs uppercase flex items-center justify-center gap-1 transition-all"
                            title="Solicitar alterações ao utilizador"
                          >
                            <AlertCircle size={14} /> Ajuste
                          </button>

                          <button
                            onClick={() => handleOpenJobFeedbackModal(job, 'rejected')}
                            className="py-2.5 px-2 rounded-xl bg-rose-500/20 hover:bg-rose-500 text-rose-300 hover:text-white border border-rose-500/30 font-black text-xs uppercase flex items-center justify-center gap-1 transition-all"
                            title="Desaprovar vaga"
                          >
                            <X size={14} /> Rejeitar
                          </button>
                        </div>

                        <div className="flex justify-between items-center text-[10px] text-slate-500 pt-1">
                          <span>Publicado: {new Date(job.createdAt).toLocaleDateString('pt-PT')}</span>
                          <button
                            onClick={() => handleDeleteJob(job.id)}
                            className="text-rose-400 hover:text-rose-300 flex items-center gap-1 font-bold"
                          >
                            <Trash2 size={12} /> Excluir Vaga
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'hero_video' && (
          <MasterHeroVideoSettings 
            onSuccessToast={(msg) => triggerPushNotificationSubmit('Vídeo Hero', msg)} 
          />
        )}

        {/* TAB: Obras & Clientes (Pedidos de Orçamento Particulares) */}
        {activeTab === 'client_requests' && (
          <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header & Controls */}
            <div className="bg-slate-900 border border-white/10 rounded-[2.5rem] p-6 lg:p-8 space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-black italic uppercase text-white flex items-center gap-3">
                    <Wrench className="text-amber-400" />
                    Pedidos de Obras e Serviços de Particulares
                  </h2>
                  <p className="text-slate-400 text-xs font-medium mt-1">
                    Gerencie e acompanhe todos os pedidos de orçamento submetidos por clientes particulares na Landing Page.
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={async () => {
                      setIsSyncing(true);
                      const reqs = await fetchClientRequestsFromSupabase();
                      setClientRequestsList(reqs);
                      setIsSyncing(false);
                    }}
                    className="px-4 py-2.5 bg-white/5 hover:bg-white/10 text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 border border-white/10 transition-all cursor-pointer"
                  >
                    <Activity size={14} className={isSyncing ? "animate-spin text-amber-400" : "text-amber-400"} />
                    Atualizar Lista
                  </button>
                </div>
              </div>

              {/* Filters & Search */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <div className="relative">
                  <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    value={clientRequestSearch}
                    onChange={(e) => setClientRequestSearch(e.target.value)}
                    placeholder="Pesquisar por título, cliente, cidade..."
                    className="w-full bg-slate-950 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder:text-slate-600 focus:border-amber-500 outline-none"
                  />
                </div>

                <div>
                  <select
                    value={clientRequestStatusFilter}
                    onChange={(e) => setClientRequestStatusFilter(e.target.value)}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:border-amber-500 outline-none cursor-pointer"
                  >
                    <option value="all">Todos os Estados</option>
                    <option value="open">Aberto (Disponível)</option>
                    <option value="in_progress">Em Andamento</option>
                    <option value="completed">Concluído</option>
                    <option value="cancelled">Cancelado</option>
                  </select>
                </div>

                <div>
                  <select
                    value={clientRequestCategoryFilter}
                    onChange={(e) => setClientRequestCategoryFilter(e.target.value)}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:border-amber-500 outline-none cursor-pointer"
                  >
                    <option value="all">Todas as Categorias</option>
                    <option value="remodelacao">Remodelação Geral</option>
                    <option value="pintura">Pintura & Acabamentos</option>
                    <option value="eletricidade">Eletricidade</option>
                    <option value="canalizacao">Canalização & Plumber</option>
                    <option value="carpintaria">Carpintaria & Portas/Janelas</option>
                    <option value="construcao_raiz">Construção do Zero</option>
                    <option value="pladur">Pladur & Tetos Falsos</option>
                    <option value="telhados">Telhados & Coberturas</option>
                    <option value="jardim">Jardins & Exteriores</option>
                    <option value="outro">Outro Serviço</option>
                  </select>
                </div>
              </div>
            </div>

            {/* List Cards */}
            {clientRequestsList.length === 0 ? (
              <div className="bg-slate-900/60 border border-dashed border-white/10 rounded-[2.5rem] p-12 text-center">
                <Wrench size={40} className="text-slate-600 mx-auto mb-3 animate-bounce" />
                <h3 className="text-lg font-black text-white">Nenhum pedido registado ainda</h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
                  Os pedidos submetidos por clientes particulares na Landing Page aparecerão aqui em tempo real.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {clientRequestsList
                  .filter((req) => {
                    const matchesSearch =
                      clientRequestSearch === '' ||
                      req.projectTitle?.toLowerCase().includes(clientRequestSearch.toLowerCase()) ||
                      req.clientName?.toLowerCase().includes(clientRequestSearch.toLowerCase()) ||
                      req.city?.toLowerCase().includes(clientRequestSearch.toLowerCase()) ||
                      req.projectDescription?.toLowerCase().includes(clientRequestSearch.toLowerCase());
                    const matchesStatus = clientRequestStatusFilter === 'all' || req.status === clientRequestStatusFilter;
                    const matchesCategory = clientRequestCategoryFilter === 'all' || req.category === clientRequestCategoryFilter;
                    return matchesSearch && matchesStatus && matchesCategory;
                  })
                  .map((req) => (
                    <div
                      key={req.id}
                      className="bg-slate-900 border border-white/10 hover:border-amber-500/40 rounded-[2rem] p-5 space-y-4 transition-all flex flex-col justify-between"
                    >
                      <div className="space-y-3">
                        <div className="flex items-start justify-between gap-2">
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/20">
                            {req.category}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                              req.status === 'open'
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                : req.status === 'in_progress'
                                ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                                : req.status === 'completed'
                                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                                : 'bg-slate-800 text-slate-400'
                            }`}
                          >
                            {req.status === 'open' ? 'Aberto' : req.status === 'in_progress' ? 'Em Andamento' : req.status === 'completed' ? 'Concluído' : 'Cancelado'}
                          </span>
                        </div>

                        <div>
                          <h3 className="text-base font-black text-white tracking-tight leading-snug line-clamp-1">
                            {req.projectTitle}
                          </h3>
                          <p className="text-xs text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                            {req.projectDescription}
                          </p>
                        </div>

                        <div className="bg-slate-950/60 p-3 rounded-xl border border-white/5 space-y-1.5 text-xs text-slate-300">
                          <div className="flex items-center gap-2">
                            <User size={13} className="text-slate-500 shrink-0" />
                            <span className="font-bold text-white truncate">{req.clientName}</span>
                          </div>
                          {req.clientPhone && (
                            <div className="flex items-center gap-2">
                              <Phone size={13} className="text-emerald-400 shrink-0" />
                              <a href={`tel:${req.clientPhone}`} className="hover:underline font-mono text-[11px] text-emerald-300">{req.clientPhone}</a>
                            </div>
                          )}
                          {req.clientEmail && (
                            <div className="flex items-center gap-2">
                              <Mail size={13} className="text-amber-400 shrink-0" />
                              <a href={`mailto:${req.clientEmail}`} className="hover:underline text-[11px] text-slate-300 truncate">{req.clientEmail}</a>
                            </div>
                          )}
                          <div className="flex items-center gap-2">
                            <MapPin size={13} className="text-rose-400 shrink-0" />
                            <span className="truncate text-slate-400 text-[11px]">{req.city || req.location || 'Local não indicado'}</span>
                          </div>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-white/5 space-y-2">
                        <div className="flex items-center justify-between text-[10px] text-slate-500">
                          <span>Submetido: {new Date(req.createdAt).toLocaleDateString('pt-PT')}</span>
                          {req.estimatedBudget ? <span className="font-bold text-amber-400">{req.estimatedBudget}</span> : null}
                        </div>

                        <div className="flex gap-2">
                          <button
                            onClick={() => setSelectedClientRequestModal(req)}
                            className="flex-1 py-2 bg-amber-500/20 hover:bg-amber-500 text-amber-300 hover:text-slate-950 rounded-xl text-xs font-black uppercase transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            <Eye size={13} /> Ver Detalhes
                          </button>
                          <button
                            onClick={async () => {
                              if (confirm(`Deseja excluir o pedido de "${req.clientName}"?`)) {
                                await deleteClientServiceRequest(req.id);
                                setClientRequestsList(prev => prev.filter(r => r.id !== req.id));
                              }
                            }}
                            className="p-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 rounded-xl text-xs font-black transition-all cursor-pointer"
                            title="Eliminar Pedido"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}

        {/* Modal de Detalhes do Pedido de Cliente (Master) */}
        {selectedClientRequestModal && (
          <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-slate-950/85 p-4 sm:p-6 backdrop-blur-md animate-in fade-in">
            <div className="bg-slate-900 w-full max-w-2xl rounded-[2.5rem] border border-white/10 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
              <div className="bg-gradient-to-r from-amber-500/20 via-slate-900 to-emerald-500/20 p-6 border-b border-white/10 flex items-start justify-between">
                <div>
                  <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500 text-slate-950 inline-block mb-2">
                    {selectedClientRequestModal.category}
                  </span>
                  <h3 className="text-xl font-black text-white tracking-tight">
                    {selectedClientRequestModal.projectTitle}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Submetido em {new Date(selectedClientRequestModal.createdAt).toLocaleString('pt-PT')}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedClientRequestModal(null)}
                  className="p-2 text-slate-400 hover:text-white rounded-full hover:bg-white/10 cursor-pointer"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-6 space-y-6 overflow-y-auto max-h-[60vh]">
                {/* Description */}
                <div className="space-y-1.5 bg-slate-950/60 p-4 rounded-2xl border border-white/10">
                  <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                    <FileText size={13} /> Descrição da Obra / Serviço
                  </span>
                  <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">
                    {selectedClientRequestModal.projectDescription}
                  </p>
                </div>

                {/* Client Info Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3 bg-slate-950/60 rounded-xl border border-white/5 space-y-1">
                    <span className="text-[10px] uppercase font-bold text-slate-500">Nome do Cliente</span>
                    <p className="text-xs font-black text-white">{selectedClientRequestModal.clientName}</p>
                  </div>
                  <div className="p-3 bg-slate-950/60 rounded-xl border border-white/5 space-y-1">
                    <span className="text-[10px] uppercase font-bold text-slate-500">Telemóvel</span>
                    <p className="text-xs font-mono font-bold text-emerald-400">
                      {selectedClientRequestModal.clientPhone ? (
                        <a href={`tel:${selectedClientRequestModal.clientPhone}`} className="hover:underline">{selectedClientRequestModal.clientPhone}</a>
                      ) : 'Não fornecido'}
                    </p>
                  </div>
                  <div className="p-3 bg-slate-950/60 rounded-xl border border-white/5 space-y-1">
                    <span className="text-[10px] uppercase font-bold text-slate-500">Email</span>
                    <p className="text-xs font-bold text-amber-400 truncate">
                      {selectedClientRequestModal.clientEmail ? (
                        <a href={`mailto:${selectedClientRequestModal.clientEmail}`} className="hover:underline">{selectedClientRequestModal.clientEmail}</a>
                      ) : 'Não fornecido'}
                    </p>
                  </div>
                  <div className="p-3 bg-slate-950/60 rounded-xl border border-white/5 space-y-1">
                    <span className="text-[10px] uppercase font-bold text-slate-500">Localização / Cidade</span>
                    <p className="text-xs font-bold text-white truncate">
                      {selectedClientRequestModal.city || selectedClientRequestModal.location || 'Não especificado'}
                    </p>
                  </div>
                </div>

                {/* Photos */}
                {selectedClientRequestModal.photos && selectedClientRequestModal.photos.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-[10px] font-black uppercase tracking-wider text-amber-400">
                      Fotografias Anexadas ({selectedClientRequestModal.photos.length})
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {selectedClientRequestModal.photos.map((photo, idx) => (
                        <a
                          key={idx}
                          href={photo}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="rounded-xl overflow-hidden border border-white/10 block aspect-video hover:opacity-80 transition-opacity"
                        >
                          <img
                            src={photo}
                            alt={`Foto ${idx + 1}`}
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* Status changer */}
                <div className="p-4 bg-slate-950 rounded-2xl border border-white/10 space-y-2">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                    Alterar Estado do Pedido
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {(['open', 'in_progress', 'completed', 'cancelled'] as const).map((st) => (
                      <button
                        key={st}
                        onClick={async () => {
                          const updated = { ...selectedClientRequestModal, status: st };
                          await saveClientServiceRequest(updated);
                          setClientRequestsList(prev => prev.map(r => r.id === updated.id ? updated : r));
                          setSelectedClientRequestModal(updated);
                        }}
                        className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase transition-all cursor-pointer ${
                          selectedClientRequestModal.status === st
                            ? 'bg-amber-500 text-slate-950 shadow-lg'
                            : 'bg-white/5 text-slate-400 hover:text-white'
                        }`}
                      >
                        {st === 'open' ? 'Aberto' : st === 'in_progress' ? 'Em Andamento' : st === 'completed' ? 'Concluído' : 'Cancelado'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-4 bg-slate-950 border-t border-white/10 flex justify-end">
                <button
                  onClick={() => setSelectedClientRequestModal(null)}
                  className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs uppercase tracking-wider transition-all shadow-lg cursor-pointer"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal for Master Feedback / Rejection reason */}
        {jobFeedbackModal && (
          <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-slate-950/80 p-6 backdrop-blur-sm animate-in fade-in">
            <div className="bg-slate-900 w-full max-w-lg rounded-[2.5rem] border border-white/10 shadow-2xl p-8 space-y-6">
              <div className="flex justify-between items-center border-b border-white/10 pb-4">
                <h3 className="text-xl font-black italic text-amber-400 uppercase flex items-center gap-2">
                  <AlertCircle size={22} /> {jobFeedbackModal.title}
                </h3>
                <button
                  onClick={() => { setJobFeedbackModal(null); setJobFeedbackText(''); }}
                  className="p-2 text-slate-400 hover:text-white rounded-full"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-3">
                <label className="block text-xs font-bold text-slate-300">
                  Descreva o motivo ou a informação que o utilizador precisa de ajustar:
                </label>
                <textarea
                  rows={4}
                  value={jobFeedbackText}
                  onChange={e => setJobFeedbackText(e.target.value)}
                  placeholder="Ex: Por favor indique se o alojamento está incluído e adicione um número de contacto direto..."
                  className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-xs font-medium text-white outline-none focus:border-amber-500 transition-all resize-none"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => { setJobFeedbackModal(null); setJobFeedbackText(''); }}
                  className="flex-1 py-3.5 bg-white/5 text-slate-300 rounded-xl font-black text-xs uppercase hover:bg-white/10"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleConfirmJobFeedback}
                  className="flex-1 py-3.5 bg-amber-500 text-slate-950 rounded-xl font-black text-xs uppercase hover:bg-amber-400 shadow-lg shadow-amber-500/20"
                >
                  Confirmar e Notificar Utilizador
                </button>
              </div>
            </div>
          </div>
        )}
        {/* Modal for Master Candidate Profile Preview */}
        {selectedCandidatePreview && (
          <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-slate-950/85 p-4 sm:p-6 backdrop-blur-md animate-in fade-in">
            <div className="bg-slate-900 w-full max-w-xl rounded-[2.5rem] border border-white/10 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
              {/* Header */}
              <div className="bg-gradient-to-r from-amber-500/20 via-slate-900 to-emerald-500/20 p-6 border-b border-white/10 flex items-start justify-between">
                <div className="flex items-center gap-4">
                  {selectedCandidatePreview.photo_url ? (
                    <img 
                      src={selectedCandidatePreview.photo_url} 
                      alt={selectedCandidatePreview.full_name || 'Candidato'} 
                      className="w-16 h-16 rounded-2xl object-cover border-2 border-amber-500/50 shadow-lg"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-slate-950 font-black text-2xl shadow-lg">
                      {(selectedCandidatePreview.full_name || (selectedCandidatePreview as any).name || 'C').charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <h3 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
                      {selectedCandidatePreview.full_name || (selectedCandidatePreview as any).name || 'Candidato Sem Nome'}
                    </h3>
                    <p className="text-xs text-slate-400 font-mono flex items-center gap-1.5 mt-0.5">
                      <User size={13} className="text-amber-400" /> ID: {selectedCandidatePreview.id || 'N/A'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedCandidatePreview(null)}
                  className="p-2 text-slate-400 hover:text-white rounded-full bg-white/5 hover:bg-white/10 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Body */}
              <div className="p-6 overflow-y-auto space-y-5 text-slate-200">
                {/* Contact information */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {selectedCandidatePreview.email && (
                    <a 
                      href={`mailto:${selectedCandidatePreview.email}`}
                      className="flex items-center gap-3 p-3 rounded-2xl bg-slate-950 border border-white/10 hover:border-amber-500/50 transition-all text-xs group"
                    >
                      <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center group-hover:bg-amber-500 group-hover:text-slate-950 transition-colors">
                        <Mail size={16} />
                      </div>
                      <div className="min-w-0">
                        <span className="text-[10px] text-slate-400 uppercase font-black block">Email</span>
                        <span className="font-medium text-white truncate block">{selectedCandidatePreview.email}</span>
                      </div>
                    </a>
                  )}

                  {selectedCandidatePreview.phone && (
                    <a 
                      href={`tel:${selectedCandidatePreview.phone}`}
                      className="flex items-center gap-3 p-3 rounded-2xl bg-slate-950 border border-white/10 hover:border-emerald-500/50 transition-all text-xs group"
                    >
                      <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center group-hover:bg-emerald-500 group-hover:text-slate-950 transition-colors">
                        <Phone size={16} />
                      </div>
                      <div className="min-w-0">
                        <span className="text-[10px] text-slate-400 uppercase font-black block">Telefone</span>
                        <span className="font-medium text-white truncate block">{selectedCandidatePreview.phone}</span>
                      </div>
                    </a>
                  )}
                </div>

                {/* Candidate attributes & badges */}
                <div className="space-y-2 bg-slate-950/60 p-4 rounded-2xl border border-white/10">
                  <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 block mb-2">
                    Informações e Qualificações
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {/* Residence permit */}
                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900 border border-white/5">
                      <span className="text-slate-400 text-[11px]">Permissão de Residência:</span>
                      {(selectedCandidatePreview.has_residence_permit ?? (selectedCandidatePreview as any).hasResidencePermit) ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          Sim ✓
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-800 text-slate-400">
                          Não / Não indicado
                        </span>
                      )}
                    </div>

                    {/* Driver's license */}
                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900 border border-white/5">
                      <span className="text-slate-400 text-[11px]">Carta de Condução:</span>
                      {(selectedCandidatePreview.has_drivers_license ?? (selectedCandidatePreview as any).hasDriversLicense) ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                          Sim ✓
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-800 text-slate-400">
                          Não / Não indicado
                        </span>
                      )}
                    </div>

                    {/* Construction experience */}
                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900 border border-white/5">
                      <span className="text-slate-400 text-[11px]">Exp. em Construção:</span>
                      {(selectedCandidatePreview.has_construction_experience ?? (selectedCandidatePreview as any).hasConstructionExperience) ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          Sim ✓
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-800 text-slate-400">
                          Não / Não indicado
                        </span>
                      )}
                    </div>

                    {/* Duration of experience */}
                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900 border border-white/5">
                      <span className="text-slate-400 text-[11px]">Tempo de Experiência:</span>
                      <span className="font-mono text-amber-400 font-bold">
                        {selectedCandidatePreview.experience_duration || (selectedCandidatePreview as any).experienceDuration || 'Não especificado'} {selectedCandidatePreview.experience_duration ? 'anos' : ''}
                      </span>
                    </div>

                    {/* Document Type */}
                    {(selectedCandidatePreview.document_type || (selectedCandidatePreview as any).documentType) && (
                      <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900 border border-white/5 sm:col-span-2">
                        <span className="text-slate-400 text-[11px]">Tipo de Documento:</span>
                        <span className="font-semibold text-white">
                          {selectedCandidatePreview.document_type || (selectedCandidatePreview as any).documentType}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Cover letter / notes */}
                {(selectedCandidatePreview.cover_letter || (selectedCandidatePreview as any).coverLetter || (selectedCandidatePreview as any).notes) && (
                  <div className="space-y-1.5 bg-slate-950/60 p-4 rounded-2xl border border-white/10">
                    <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                      <FileText size={13} /> Apresentação / Carta de Motivação
                    </span>
                    <p className="text-xs text-slate-300 leading-relaxed italic whitespace-pre-wrap bg-slate-900 p-3 rounded-xl border border-white/5">
                      "{selectedCandidatePreview.cover_letter || (selectedCandidatePreview as any).coverLetter || (selectedCandidatePreview as any).notes}"
                    </p>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="p-4 bg-slate-950 border-t border-white/10 flex justify-end">
                <button
                  onClick={() => setSelectedCandidatePreview(null)}
                  className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs uppercase tracking-wider transition-all shadow-lg"
                >
                  Fechar Ficha
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MasterPanel;