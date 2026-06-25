console.log(">>> SERVER INITIALIZING...");

process.on("uncaughtException", (err) => {
  console.error("UNCAUGHT EXCEPTION:", err);
  process.exit(1);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("UNHANDLED REJECTION at:", promise, "reason:", reason);
  process.exit(1);
});

import express from "express";
import { createServer as createViteServer } from "vite";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import webPush from "web-push";
import fs from "fs";
import { sendFCMBroadcast, getFirebaseAdmin, saveFCMTokenToFirestore, saveSubscriptionToFirestore, getFCMTokensFromFirestore, getSubscriptionsFromFirestore, removeFCMTokenFromFirestore, removeSubscriptionFromFirestore } from "./services/firebase-admin-server";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Carregar ou gerar chaves VAPID estáveis e persistentes para PWA Offline Push
let vapidKeys: { publicKey: string; privateKey: string };
const vapidFilePath = path.join(__dirname, "vapid_keys.json");

if (fs.existsSync(vapidFilePath)) {
  try {
    vapidKeys = JSON.parse(fs.readFileSync(vapidFilePath, "utf8"));
    console.log("[PWA Push] Loaded stable, existing VAPID keys successfully.");
  } catch (e) {
    console.error("[PWA Push] Error reading vapid_keys.json, generating new keys...", e);
    vapidKeys = webPush.generateVAPIDKeys();
    fs.writeFileSync(vapidFilePath, JSON.stringify(vapidKeys), "utf8");
  }
} else {
  vapidKeys = webPush.generateVAPIDKeys();
  fs.writeFileSync(vapidFilePath, JSON.stringify(vapidKeys), "utf8");
  console.log("[PWA Push] Created a fresh sets of VAPID keys and persisted to disk.");
}

webPush.setVapidDetails(
  "mailto:suporte@atrios.app",
  vapidKeys.publicKey,
  vapidKeys.privateKey
);

function getStoredFirebaseConfig() {
  const paths = [
    path.join(process.cwd(), "firebase_config.json"),
    path.join(__dirname, "firebase_config.json"),
    path.join(__dirname, "..", "firebase_config.json")
  ];

  let config: any = {};

  console.log("[PWA FCM] Carregando configuração do Firebase...");
  console.log("[PWA FCM] VITE_FIREBASE_API_KEY de ambiente:", process.env.VITE_FIREBASE_API_KEY ? "Definido" : "Não definido");

  if (process.env.VITE_FIREBASE_API_KEY && process.env.VITE_FIREBASE_API_KEY !== "undefined" && process.env.VITE_FIREBASE_API_KEY.trim() !== "") {
    config = {
      apiKey: process.env.VITE_FIREBASE_API_KEY,
      authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
      projectId: process.env.VITE_FIREBASE_PROJECT_ID,
      storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.VITE_FIREBASE_APP_ID,
      measurementId: process.env.VITE_FIREBASE_MEASUREMENT_ID,
      vapidKey: process.env.VITE_FIREBASE_FCM_VAPID_KEY
    };
    console.log("[PWA FCM] Usando variáveis de ambiente para configuração do Firebase.");
  } else {
    for (const configPath of paths) {
      console.log(`[PWA FCM] Testando caminho: ${configPath} (Existe: ${fs.existsSync(configPath)})`);
      if (fs.existsSync(configPath)) {
        try {
          const raw = fs.readFileSync(configPath, "utf8");
          console.log(`[PWA FCM] Conteúdo bruto lido de ${configPath}:`, raw);
          const parsed = JSON.parse(raw);
          if (parsed && parsed.apiKey) {
            config = parsed;
            console.log(`[PWA FCM] Carregado firebase_config.json com sucesso a partir de: ${configPath}`);
            break;
          }
        } catch (e) {
          console.error(`Erro ao ler firebase_config.json de ${configPath}:`, e);
        }
      }
    }
  }
  console.log("[PWA FCM] Configuração final resolvida:", JSON.stringify(config, null, 2));
  return config;
}

function generateFirebaseSW(config: any) {
  const swContent = `// Service Worker para Átrios - Suporte a PWA, WebPush PWA e Firebase FCM (Unificado)
importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging-compat.js');

const CACHE_NAME = 'atrios-cache-v1';

// 1. Inicialização Dinâmica do Firebase FCM
const firebaseConfig = {
  apiKey: ${JSON.stringify(config.apiKey || "")},
  authDomain: ${JSON.stringify(config.authDomain || "")},
  projectId: ${JSON.stringify(config.projectId || "")},
  storageBucket: ${JSON.stringify(config.storageBucket || "")},
  messagingSenderId: ${JSON.stringify(config.messagingSenderId || "")},
  appId: ${JSON.stringify(config.appId || "")}
};

if (firebaseConfig.apiKey) {
  try {
    firebase.initializeApp(firebaseConfig);
    const messaging = firebase.messaging();
    
    messaging.onBackgroundMessage((payload) => {
      console.log('[FCM SW] Mensagem recebida em segundo plano:', payload);
      
      const notificationTitle = payload.notification?.title || payload.data?.title || 'Átrios';
      const notificationOptions = {
        body: payload.notification?.body || payload.data?.body || '',
        icon: payload.notification?.icon || payload.data?.icon || '/favicon.svg',
        badge: '/favicon.svg',
        data: payload.data,
        tag: 'atrios-global-push',
        renotify: true,
        sound: 'default',
        vibrate: [200, 100, 200, 100, 300],
        requireInteraction: true
      };

      self.registration.showNotification(notificationTitle, notificationOptions);
    });
    console.log('[FCM SW] Firebase inicializado com sucesso no Service Worker!');
  } catch (err) {
    console.error('[FCM SW] Erro ao inicializar Firebase no SW:', err);
  }
} else {
  console.warn('[FCM SW] Service worker ativo mas sem credenciais Firebase configuradas.');
}

// 2. Eventos PWA e Caching Standard
self.addEventListener('install', (event) => {
  console.log('SW: Instalado');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('SW: Ativado');
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  event.respondWith(fetch(event.request));
});

// 3. Manipulador de clique na notificação (Comum para FCM e WebPush)
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url && 'focus' in client) {
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow('/');
      }
    })
  );
});

// 4. Receção de Push Standard (WebPush PWA - VAPID direto)
// Filtrar para ignorar se for uma mensagem FCM (o FCM SDK trata as mensagens dele de forma autónoma)
self.addEventListener('push', (event) => {
  console.log('SW: Evento Push recebido em segundo plano!');
  
  let isFcmMessage = false;
  let data = {
    title: 'Átrios Software',
    body: 'Tem uma nova atualização em segundo plano.',
    icon: '/favicon.svg',
    badge: '/favicon.svg'
  };

  if (event.data) {
    try {
      const parsed = event.data.json();
      
      // Detetar se é uma mensagem do FCM para evitar notificações duplicadas ou conflito
      if (parsed && (parsed.from || parsed.collapse_key || parsed.notification || parsed.data?.['gcm.message_id'] || parsed['gcm.message_id'] || parsed.googleId || parsed['google.c.sender.id'])) {
        isFcmMessage = true;
      }

      data = {
        title: parsed.title || data.title,
        body: parsed.body || data.body,
        icon: parsed.icon || data.icon || '/favicon.svg',
        badge: parsed.badge || data.badge || '/favicon.svg',
        vibrate: parsed.vibrate || [200, 100, 200, 100, 300],
        tag: parsed.tag || 'atrios-bg-push'
      };
    } catch (e) {
      // Se for formato de texto plano
      data.body = event.data.text();
    }
  }

  if (isFcmMessage) {
    console.log('SW: Mensagem FCM detetada no evento push, delegando ao SDK do Firebase.');
    return;
  }

  const options = {
    body: data.body,
    icon: data.icon,
    badge: data.badge,
    vibrate: data.vibrate || [200, 100, 200, 100, 300],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    tag: data.tag || 'atrios-bg-push',
    renotify: true,
    sound: 'default',
    requireInteraction: true
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});
`;

  const fileNames = ["firebase-messaging-sw.js", "sw.js"];
  const baseDirs = [
    path.join(process.cwd(), "public"),
    path.join(process.cwd(), "dist"),
    __dirname,
    path.join(__dirname, "..", "public"),
    path.join(__dirname, "public")
  ];

  for (const dir of baseDirs) {
    for (const name of fileNames) {
      const swPath = path.join(dir, name);
      try {
        const swDir = path.dirname(swPath);
        if (!fs.existsSync(swDir)) {
          fs.mkdirSync(swDir, { recursive: true });
        }
        fs.writeFileSync(swPath, swContent, "utf8");
        console.log(`[PWA FCM] Ficheiro Service Worker gravado com sucesso em: ${swPath}`);
      } catch (err) {
        // Ignorar silenciosamente caminhos inexistentes/inválidos para evitar crash
      }
    }
  }
}

console.log("Starting server with environment check:");
console.log("- STRIPE_SECRET_KEY:", process.env.STRIPE_SECRET_KEY ? "Present" : "Missing");
console.log("- STRIPE_MONTHLY_PRICE_ID:", process.env.STRIPE_MONTHLY_PRICE_ID ? "Present" : "Missing");
console.log("- STRIPE_ANNUAL_PRICE_ID:", process.env.STRIPE_ANNUAL_PRICE_ID ? "Present" : "Missing");
console.log("- SUPABASE_URL:", process.env.SUPABASE_URL ? "Present" : "Missing");

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "");

const supabase = createClient(
  process.env.SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || ""
);

async function startServer() {
  try {
    // Gerar o Service Worker do Firebase FCM de forma síncrona no arranque do servidor se já houver credenciais
    generateFirebaseSW(getStoredFirebaseConfig());

    const app = express();
    const PORT = process.env.PORT || 3000;

  // Request logging
  app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
  });

  // Webhook needs raw body - MUST be before express.json()
  app.post(
    "/api/webhook",
    express.raw({ type: "application/json" }),
    async (req, res) => {
      const sig = req.headers["stripe-signature"] as string;
      let event;

      try {
        event = stripe.webhooks.constructEvent(
          req.body,
          sig,
          process.env.STRIPE_WEBHOOK_SECRET || ""
        );
      } catch (err: any) {
        console.error(`Webhook Error: ${err.message}`);
        return res.status(400).send(`Webhook Error: ${err.message}`);
      }

      // Handle the event
      switch (event.type) {
        case "checkout.session.completed": {
          const session = event.data.object as Stripe.Checkout.Session;
          const companyId = session.client_reference_id;
          const planType = session.metadata?.planType;

          if (companyId && planType) {
            const { error } = await supabase
              .from("companies")
              .update({ 
                plan: planType,
                stripe_customer_id: session.customer as string,
                stripe_subscription_id: session.subscription as string
              })
              .eq("id", companyId);
            
            if (error) console.error("Error updating company plan:", error);
          }
          break;
        }
        case "invoice.paid": {
          const invoice = event.data.object as any;
          const subscriptionId = invoice.subscription as string;
          
          if (subscriptionId) {
            const subscription = await stripe.subscriptions.retrieve(subscriptionId);
            const companyId = subscription.metadata.companyId;
            const planType = subscription.metadata.planType;

            if (companyId && planType) {
              const { error } = await supabase
                .from("companies")
                .update({ 
                  plan: planType,
                  stripe_customer_id: invoice.customer as string,
                  stripe_subscription_id: subscriptionId
                })
                .eq("id", companyId);
              
              if (error) console.error("Error updating company plan (invoice.paid):", error);
            }
          }
          break;
        }
        case "customer.subscription.deleted": {
          const subscription = event.data.object as Stripe.Subscription;
          const { error } = await supabase
            .from("companies")
            .update({ plan: "FREE", stripe_subscription_id: null })
            .eq("stripe_subscription_id", subscription.id);
          
          if (error) console.error("Error reverting company to free plan:", error);
          break;
        }
      }

      res.json({ received: true });
    }
  );

  // Parse JSON bodies for other routes
  app.use(express.json());

  // Error handler for malformed JSON
  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (err instanceof SyntaxError && 'body' in err) {
      console.error("Malformed JSON:", err.message);
      return res.status(400).json({ error: "Malformed JSON body" });
    }
    next();
  });

  // API routes
  app.get("/api/health", (req, res) => {
    res.json({ 
      status: "ok", 
      env: {
        hasStripeKey: !!process.env.STRIPE_SECRET_KEY,
        hasMonthlyPrice: !!process.env.STRIPE_MONTHLY_PRICE_ID,
        hasAnnualPrice: !!process.env.STRIPE_ANNUAL_PRICE_ID,
        hasSupabaseUrl: !!process.env.SUPABASE_URL,
        hasSupabaseKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
        appUrl: process.env.APP_URL,
        nodeEnv: process.env.NODE_ENV
      }
    });
  });

  // 1. Obter chave pública VAPID do Átrios para subscrever no browser (Web-Push standard)
  app.get("/api/push/public-key", (req, res) => {
    res.json({ publicKey: vapidKeys.publicKey });
  });

  // 1.1 Obter configuração do Firebase para o Cliente (FCM)
  app.get("/api/push/firebase-config", (req, res) => {
    const config = getStoredFirebaseConfig();
    res.json(config);
  });

  // 1.2 Salvar configuração do Firebase Cliente (Admin Panel)
  app.post("/api/push/save-firebase-config", (req, res) => {
    const { config } = req.body;
    if (!config || !config.apiKey) {
      return res.status(400).json({ error: "Configuração do Firebase inválida" });
    }

    try {
      const pathsToSave = [
        path.join(process.cwd(), "firebase_config.json"),
        path.join(__dirname, "firebase_config.json"),
        path.join(__dirname, "..", "firebase_config.json")
      ];

      for (const configPath of pathsToSave) {
        try {
          const configDir = path.dirname(configPath);
          if (!fs.existsSync(configDir)) {
            fs.mkdirSync(configDir, { recursive: true });
          }
          fs.writeFileSync(configPath, JSON.stringify(config, null, 2), "utf8");
          console.log(`[PWA FCM] Cliente Firebase Config gravada em: ${configPath}`);
        } catch (writeErr) {
          // Ignorar se algum caminho for inválido
        }
      }
      
      // Gerar automaticamente o Service Worker síncrono para FCM
      generateFirebaseSW(config);
      
      res.json({ success: true });
    } catch (e: any) {
      console.error("Falha ao guardar firebase_config.json:", e);
      res.status(500).json({ error: e.message });
    }
  });

  // 1.3 Salvar Service Account do Firebase Admin (Admin Panel)
  app.post("/api/push/save-firebase-service-account", (req, res) => {
    const { serviceAccountJson } = req.body;
    if (!serviceAccountJson) {
      return res.status(400).json({ error: "JSON do Service Account vazio" });
    }

    try {
      const parsed = typeof serviceAccountJson === 'string' ? JSON.parse(serviceAccountJson) : serviceAccountJson;
      const saPath = path.join(process.cwd(), "firebase_service_account.json");
      fs.writeFileSync(saPath, JSON.stringify(parsed, null, 2), "utf8");
      console.log("[PWA FCM] Firebase Service Account atualizado com sucesso!");
      res.json({ success: true, msg: "Ficheiro firebase_service_account.json gravado. Recarregando SDK..." });
    } catch (e: any) {
      console.error("Falha ao salvar firebase_service_account.json:", e);
      res.status(500).json({ error: "JSON inválido ou falha de escrita: " + e.message });
    }
  });

  // 2. Subscrever um dispositivo de utilizador no browser (Web-Push standard)
  app.post("/api/push/subscribe", async (req, res) => {
    const { subscription, companyId, plan } = req.body;
    if (!subscription || !subscription.endpoint) {
      return res.status(400).json({ error: "Missing subscription object or endpoint URL" });
    }

    // A. Guardar no Supabase se configurado
    let savedToSupabase = false;
    try {
      if (process.env.SUPABASE_URL) {
        const { error } = await supabase
          .from("push_subscriptions")
          .upsert({
            endpoint: subscription.endpoint,
            subscription: subscription,
            company_id: companyId || "guest",
            plan: plan || "free",
            created_at: new Date().toISOString()
          });
        if (!error) {
          console.log(`[PWA Push] Sincronizado com sucesso no Supabase para User: ${companyId}`);
          savedToSupabase = true;
        } else {
          console.warn("[PWA Push] Falha ao guardar no Supabase (Mesa pode não existir), usando fallback local/Firestore:", error.message);
        }
      }
    } catch (e: any) {
      console.error("[PWA Push] Erro na ligação ao Supabase, usando fallback local/Firestore:", e.message);
    }

    // A2. Guardar no Firestore
    let savedToFirestore = false;
    try {
      savedToFirestore = await saveSubscriptionToFirestore(subscription, companyId, plan);
    } catch (e: any) {
      console.error("[PWA Push] Erro ao guardar no Firestore:", e.message);
    }

    // B. Guardar localmente como Backup/Fallback
    const subFile = path.join(__dirname, "push_subscriptions.json");
    let subscriptions: any[] = [];
    if (fs.existsSync(subFile)) {
      try {
        subscriptions = JSON.parse(fs.readFileSync(subFile, "utf8"));
      } catch (e) {
        console.error("Error reading subscriptions file", e);
      }
    }

    const existingIndex = subscriptions.findIndex(sub => sub.subscription.endpoint === subscription.endpoint);
    
    const newRecord = {
      subscription,
      companyId: companyId || "guest",
      plan: plan || "free",
      createdAt: new Date().toISOString()
    };

    if (existingIndex > -1) {
      subscriptions[existingIndex] = newRecord;
    } else {
      subscriptions.push(newRecord);
    }

    try {
      fs.writeFileSync(subFile, JSON.stringify(subscriptions, null, 2), "utf8");
      console.log(`[PWA Push] Registered subscription local backup for User: ${companyId}, Plan: ${plan}`);
      res.json({ success: true, savedToSupabase, savedToFirestore });
    } catch (dbErr: any) {
      console.error("Failed to write subscriptions to disk", dbErr);
      res.status(500).json({ error: "Failed to persist subscription" });
    }
  });

  // 2.1 Subscrever Token FCM (Firebase Cloud Messaging)
  app.post("/api/push/subscribe-fcm", async (req, res) => {
    const { token, companyId, plan } = req.body;
    if (!token) {
      return res.status(400).json({ error: "Token do FCM ausente" });
    }

    // A. Guardar no Supabase se configurado
    let savedToSupabase = false;
    try {
      if (process.env.SUPABASE_URL) {
        const { error } = await supabase
          .from("fcm_tokens")
          .upsert({
            token: token,
            company_id: companyId || "guest",
            plan: plan || "free",
            updated_at: new Date().toISOString()
          });
        if (!error) {
          console.log(`[PWA FCM] Sincronizado com sucesso no Supabase para User: ${companyId}`);
          savedToSupabase = true;
        } else {
          console.warn("[PWA FCM] Falha ao guardar no Supabase (Mesa pode não existir), usando fallback local/Firestore:", error.message);
        }
      }
    } catch (e: any) {
      console.error("[PWA FCM] Erro na ligação ao Supabase, usando fallback local/Firestore:", e.message);
    }

    // A2. Guardar no Firestore
    let savedToFirestore = false;
    try {
      savedToFirestore = await saveFCMTokenToFirestore(token, companyId, plan);
    } catch (e: any) {
      console.error("[PWA FCM] Erro ao guardar token no Firestore:", e.message);
    }

    // B. Guardar localmente como Backup/Fallback
    const tokenFile = path.join(__dirname, "fcm_tokens.json");
    let tokensList: any[] = [];
    if (fs.existsSync(tokenFile)) {
      try {
        tokensList = JSON.parse(fs.readFileSync(tokenFile, "utf8"));
      } catch (e) {
        console.error("Erro ao ler fcm_tokens.json:", e);
      }
    }

    const existingIndex = tokensList.findIndex(t => t.token === token);
    const newRecord = {
      token,
      companyId: companyId || "guest",
      plan: plan || "free",
      updatedAt: new Date().toISOString()
    };

    if (existingIndex > -1) {
      tokensList[existingIndex] = newRecord;
    } else {
      tokensList.push(newRecord);
    }

    try {
      fs.writeFileSync(tokenFile, JSON.stringify(tokensList, null, 2), "utf8");
      console.log(`[PWA FCM] Registado Token local backup para User: ${companyId}, Plano: ${plan}`);
      res.json({ success: true, savedToSupabase, savedToFirestore });
    } catch (e: any) {
      console.error("Falha ao salvar token FCM local:", e);
      res.status(500).json({ error: e.message });
    }
  });

  // 2.2 Endpoint para registar erros do cliente (Diagnóstico)
  app.post("/api/push/log-client-error", express.json(), (req, res) => {
    const { message, error } = req.body;
    console.error("\n========================================");
    console.error(`[CLIENT PUSH ERROR] ${message}`);
    console.error(`Detalhes:`, error);
    console.error("========================================\n");
    res.json({ received: true });
  });

  // 3. Enviar notificação push em segundo plano offline híbrido (Web-Push + FCM)
  app.post("/api/push/send-broadcast", async (req, res) => {
    const { title, body, targetAudience } = req.body;
    if (!title || !body) {
      return res.status(400).json({ error: "Missing required fields: title and body" });
    }

    console.log(`[Push Broadcast] Disparando: "${title}" | Alvo: ${targetAudience}`);

    // --- PARTE A: WEB-PUSH STANDARD ---
    let subscriptions: any[] = [];
    
    // Tentar carregar do Supabase primeiro
    try {
      if (process.env.SUPABASE_URL) {
        const { data, error } = await supabase
          .from("push_subscriptions")
          .select("*");
        if (!error && data) {
          subscriptions = data.map((row: any) => ({
            subscription: typeof row.subscription === 'string' ? JSON.parse(row.subscription) : row.subscription,
            companyId: row.company_id || "guest",
            plan: row.plan || "free",
            createdAt: row.created_at
          }));
          console.log(`[Push Broadcast] Carregadas ${subscriptions.length} subscrições Web-Push do Supabase.`);
        } else {
          console.warn("[Push Broadcast] Falha ao carregar subscrições do Supabase, usando locais:", error?.message);
        }
      }
    } catch (e: any) {
      console.error("[Push Broadcast] Erro ao carregar subscrições do Supabase:", e.message);
    }

    // Tentar carregar do Firestore
    try {
      const firestoreSubs = await getSubscriptionsFromFirestore();
      firestoreSubs.forEach(fsSub => {
        if (!subscriptions.some(s => s.subscription?.endpoint === fsSub.subscription?.endpoint)) {
          subscriptions.push({
            subscription: fsSub.subscription,
            companyId: fsSub.companyId || "guest",
            plan: fsSub.plan || "free",
            createdAt: fsSub.createdAt
          });
        }
      });
      console.log(`[Push Broadcast] Carregadas subscrições Web-Push do Firestore. Total atual: ${subscriptions.length}`);
    } catch (e: any) {
      console.error("[Push Broadcast] Erro ao carregar subscrições do Firestore:", e.message);
    }

    // Unir com locais (evitar duplicados por endpoint)
    const subFile = path.join(__dirname, "push_subscriptions.json");
    let localSubscriptions: any[] = [];
    if (fs.existsSync(subFile)) {
      try {
        localSubscriptions = JSON.parse(fs.readFileSync(subFile, "utf8"));
        localSubscriptions.forEach(localSub => {
          if (!subscriptions.some(s => s.subscription?.endpoint === localSub.subscription?.endpoint)) {
            subscriptions.push(localSub);
          }
        });
      } catch (e) {
        console.error("Error reading local subscriptions", e);
      }
    }

    const filteredSubs = subscriptions.filter(sub => {
      if (!targetAudience || targetAudience === 'all') return true;
      if (targetAudience === 'free' && sub.plan === 'free') return true;
      if (targetAudience === 'all_premium' && sub.plan !== 'free') return true;
      if (targetAudience === 'premium_monthly' && sub.plan === 'premium_monthly') return true;
      if (targetAudience === 'premium_annual' && sub.plan === 'premium_annual') return true;
      return false;
    });

    let webPushSuccess = 0;
    let webPushFailure = 0;
    const deadWebPushEndpoints: string[] = [];

    if (filteredSubs.length > 0) {
      const payload = JSON.stringify({
        title,
        body,
        icon: '/favicon.svg',
        badge: '/favicon.svg',
        tag: 'atrios-global-push',
        vibrate: [200, 100, 200, 100, 300]
      });

      const sendPromises = filteredSubs.map(async (sub) => {
        try {
          if (sub.subscription && sub.subscription.endpoint) {
            await webPush.sendNotification(sub.subscription, payload);
            webPushSuccess++;
          }
        } catch (err: any) {
          console.error(`[WebPush Send Error] ${sub.subscription?.endpoint}:`, err.message);
          webPushFailure++;
          if (sub.subscription?.endpoint && (err.statusCode === 410 || err.statusCode === 404)) {
            deadWebPushEndpoints.push(sub.subscription.endpoint);
          }
        }
      });

      await Promise.all(sendPromises);

      // Limpar endpoints mortos localmente
      if (deadWebPushEndpoints.length > 0) {
        const activeSubs = localSubscriptions.filter(sub => !deadWebPushEndpoints.includes(sub.subscription?.endpoint));
        try {
          fs.writeFileSync(subFile, JSON.stringify(activeSubs, null, 2), "utf8");
        } catch (e) {
          console.error("Erro ao limpar subscrições web-push locais mortas", e);
        }

        // Limpar também no Firestore
        for (const endpoint of deadWebPushEndpoints) {
          try {
            await removeSubscriptionFromFirestore(endpoint);
          } catch (e: any) {
            console.error("Erro ao remover subscrição morta do Firestore:", e.message);
          }
        }

        // Limpar também no Supabase
        try {
          if (process.env.SUPABASE_URL) {
            await supabase
              .from("push_subscriptions")
              .delete()
              .in("endpoint", deadWebPushEndpoints);
            console.log(`[Push Broadcast] Removidos ${deadWebPushEndpoints.length} endpoints mortos do Supabase.`);
          }
        } catch (e: any) {
          console.error("Erro ao remover endpoints mortos do Supabase:", e.message);
        }
      }
    }

    // --- PARTE B: FIREBASE CLOUD MESSAGING (FCM) ---
    let fcmTokensList: any[] = [];

    // Tentar carregar do Supabase primeiro
    try {
      if (process.env.SUPABASE_URL) {
        const { data, error } = await supabase
          .from("fcm_tokens")
          .select("*");
        if (!error && data) {
          fcmTokensList = data.map((row: any) => ({
            token: row.token,
            companyId: row.company_id || "guest",
            plan: row.plan || "free",
            updatedAt: row.updated_at
          }));
          console.log(`[Push Broadcast] Carregados ${fcmTokensList.length} tokens FCM do Supabase.`);
        } else {
          console.warn("[Push Broadcast] Falha ao carregar tokens FCM do Supabase, usando locais:", error?.message);
        }
      }
    } catch (e: any) {
      console.error("[Push Broadcast] Erro ao carregar tokens FCM do Supabase:", e.message);
    }

    // Tentar carregar do Firestore
    try {
      const firestoreTokens = await getFCMTokensFromFirestore();
      firestoreTokens.forEach(fsTok => {
        if (!fcmTokensList.some(t => t.token === fsTok.token)) {
          fcmTokensList.push({
            token: fsTok.token,
            companyId: fsTok.companyId || "guest",
            plan: fsTok.plan || "free",
            updatedAt: fsTok.updatedAt
          });
        }
      });
      console.log(`[Push Broadcast] Carregados tokens FCM do Firestore. Total atual: ${fcmTokensList.length}`);
    } catch (e: any) {
      console.error("[Push Broadcast] Erro ao carregar tokens FCM do Firestore:", e.message);
    }

    // Unir com locais (evitar duplicados por token)
    const tokenFile = path.join(__dirname, "fcm_tokens.json");
    let localTokens: any[] = [];
    if (fs.existsSync(tokenFile)) {
      try {
        localTokens = JSON.parse(fs.readFileSync(tokenFile, "utf8"));
        localTokens.forEach(localTok => {
          if (!fcmTokensList.some(t => t.token === localTok.token)) {
            fcmTokensList.push(localTok);
          }
        });
      } catch (e) {
        console.error("Erro ao ler fcm_tokens.json local:", e);
      }
    }

    const filteredFCM = fcmTokensList.filter(tokenRecord => {
      if (!targetAudience || targetAudience === 'all') return true;
      if (targetAudience === 'free' && tokenRecord.plan === 'free') return true;
      if (targetAudience === 'all_premium' && tokenRecord.plan !== 'free') return true;
      if (targetAudience === 'premium_monthly' && tokenRecord.plan === 'premium_monthly') return true;
      if (targetAudience === 'premium_annual' && tokenRecord.plan === 'premium_annual') return true;
      return false;
    });

    let fcmSuccess = 0;
    let fcmFailure = 0;
    let fcmIsActive = false;
    let fcmResult: any = null;

    if (filteredFCM.length > 0) {
      const adminSDK = getFirebaseAdmin();
      if (adminSDK) {
        fcmIsActive = true;
        const tokensToNotify = filteredFCM.map(r => r.token);
        
        fcmResult = await sendFCMBroadcast(title, body, tokensToNotify, {
          targetAudience
        });

        if (fcmResult && fcmResult.success) {
          fcmSuccess = fcmResult.successCount || 0;
          fcmFailure = fcmResult.failureCount || 0;

          // Limpar tokens do FCM que falharam (estão inativos/rejeitados)
          if (fcmResult.failedTokens && fcmResult.failedTokens.length > 0) {
            const deadTokens: string[] = fcmResult.failedTokens;
            console.log(`[FCM] Limpando ${deadTokens.length} tokens inválidos/mortos do Firebase.`);
            const activeFCM = fcmTokensList.filter(t => !deadTokens.includes(t.token));
            try {
              fs.writeFileSync(tokenFile, JSON.stringify(activeFCM, null, 2), "utf8");
            } catch (e) {
              console.error("Erro ao limpar tokens FCM mortos", e);
            }

            // Limpar também do Firestore
            for (const tok of deadTokens) {
              try {
                await removeFCMTokenFromFirestore(tok);
              } catch (e: any) {
                console.error("Erro ao remover token morto do Firestore:", e.message);
              }
            }

            // Limpar também no Supabase
            try {
              if (process.env.SUPABASE_URL) {
                await supabase
                  .from("fcm_tokens")
                  .delete()
                  .in("token", deadTokens);
                console.log(`[FCM Broadcast] Removidos ${deadTokens.length} tokens mortos do Supabase.`);
              }
            } catch (e: any) {
              console.error("Erro ao remover tokens mortos do Supabase:", e.message);
            }
          }
        }
      } else {
        console.log("[FCM] Firebase Admin não inicializado ou sem credenciais. Ignorando envio via FCM.");
      }
    }

    res.json({
      success: true,
      webPush: {
        totalTarget: filteredSubs.length,
        successCount: webPushSuccess,
        failureCount: webPushFailure,
        prunedCount: deadWebPushEndpoints.length
      },
      fcm: {
        active: fcmIsActive,
        totalTarget: filteredFCM.length,
        successCount: fcmSuccess,
        failureCount: fcmFailure,
        prunedCount: (fcmResult && fcmResult.failedTokens) ? fcmResult.failedTokens.length : 0
      },
      msg: `Broadcast enviado com sucesso. WebPush: ${webPushSuccess} | FCM: ${fcmSuccess}`
    });
  });

  // Keep-alive function to prevent Render from sleeping
  const startKeepAlive = () => {
    const appUrl = process.env.APP_URL;
    if (!appUrl) {
      console.warn("[Keep-Alive] APP_URL not set. Skipping keep-alive.");
      return;
    }

    console.log(`[Keep-Alive] Starting keep-alive for ${appUrl} every 5 minutes`);
    
    setInterval(async () => {
      try {
        const response = await fetch(`${appUrl}/api/health`);
        console.log(`[Keep-Alive] Pinged ${appUrl}/api/health: ${response.status} ${response.statusText}`);
      } catch (error: any) {
        console.error(`[Keep-Alive] Error pinging ${appUrl}:`, error.message);
      }
    }, 5 * 60 * 1000); // 5 minutes
  };

  // Start keep-alive if in production
  if (process.env.NODE_ENV === "production") {
    startKeepAlive();
  }

  app.post(["/api/create-checkout-session", "/api/create-checkout-session/"], async (req, res) => {
    const { companyId, planType, couponCode } = req.body;

    console.log(`Creating checkout session for ${companyId}, plan: ${planType}`);

    let priceId = "";
    let mode: Stripe.Checkout.Session.Mode = "subscription";

    let monthlyId = (process.env.STRIPE_MONTHLY_PRICE_ID || "price_1T3e4x1kTCJBb2eQJBnM0adW").trim();
    let annualId = (process.env.STRIPE_ANNUAL_PRICE_ID || "price_1T3e8d1kTCJBb2eQgqKiRoN1").trim();
    
    // Hotfix: If the environment still has the old incorrect IDs, override them
    const invalidIds = [
      "price_1T3YhcP8uJW17aRIpkBFJHvu",
      "price_1T3YmmP8uJW17aRIQhPP5gmK"
    ];

    if (invalidIds.includes(monthlyId)) {
      console.log("Hotfix: Overriding old monthly price ID");
      monthlyId = "price_1T3e4x1kTCJBb2eQJBnM0adW";
    }
    if (invalidIds.includes(annualId)) {
      console.log("Hotfix: Overriding old annual price ID");
      annualId = "price_1T3e8d1kTCJBb2eQgqKiRoN1";
    }

    const secretKey = (process.env.STRIPE_SECRET_KEY || "").trim();

    console.log("--- STRIPE ENVIRONMENT CHECK ---");
    console.log(`Final Monthly Price ID: "${monthlyId}"`);
    console.log(`Final Annual Price ID: "${annualId}"`);
    console.log(`STRIPE_SECRET_KEY starts with: ${secretKey.substring(0, 8)}...`);
    console.log("--------------------------------");

    if (planType === "premium_monthly") {
      priceId = monthlyId;
      mode = "subscription";
    } else if (planType === "premium_annual") {
      priceId = annualId;
      mode = "subscription"; 
    }

    if (!priceId) {
      console.error(`ERROR: Price ID missing for plan ${planType}. Check your environment variables.`);
      return res.status(400).json({ error: `Invalid plan type or missing Price ID for: ${planType}` });
    }

    console.log(`Using Price ID: ${priceId.substring(0, 8)}... for plan: ${planType}`);

    if (!process.env.STRIPE_SECRET_KEY) {
      return res.status(500).json({ error: "Stripe Secret Key is not configured on the server." });
    }

    try {
      console.log("Request body:", JSON.stringify(req.body));
      const { origin } = req.body;
      const appUrl = origin || process.env.APP_URL || `${req.protocol}://${req.get('host')}`;
      console.log("Using App URL:", appUrl);

      const sessionParams: Stripe.Checkout.SessionCreateParams = {
        payment_method_types: ["card"],
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        mode: mode,
        success_url: `${appUrl}/?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${appUrl}/`,
        client_reference_id: companyId,
        metadata: {
          planType: planType,
        },
        allow_promotion_codes: true,
      };

      if (couponCode) {
        try {
          const promoCodes = await stripe.promotionCodes.list({
            code: couponCode,
            active: true,
            limit: 1,
          });
          if (promoCodes.data.length > 0) {
            sessionParams.discounts = [{ promotion_code: promoCodes.data[0].id }];
          }
        } catch (promoError) {
          console.warn("Could not find matching Stripe promotion code:", promoError);
        }
      }

      const session = await stripe.checkout.sessions.create(sessionParams);
      res.setHeader('Content-Type', 'application/json');
      res.json({ id: session.id, url: session.url });
    } catch (error: any) {
      console.error("Stripe Session Error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/create-subscription", async (req, res) => {
    const { companyId, planType, email } = req.body;

    let priceId = "";
    let monthlyId = (process.env.STRIPE_MONTHLY_PRICE_ID || "price_1T3e4x1kTCJBb2eQJBnM0adW").trim();
    let annualId = (process.env.STRIPE_ANNUAL_PRICE_ID || "price_1T3e8d1kTCJBb2eQgqKiRoN1").trim();

    // Hotfix: If the environment still has the old incorrect IDs, override them
    const invalidIds = [
      "price_1T3YhcP8uJW17aRIpkBFJHvu",
      "price_1T3YmmP8uJW17aRIQhPP5gmK"
    ];

    if (invalidIds.includes(monthlyId)) {
      monthlyId = "price_1T3e4x1kTCJBb2eQJBnM0adW";
    }
    if (invalidIds.includes(annualId)) {
      annualId = "price_1T3e8d1kTCJBb2eQgqKiRoN1";
    }

    if (planType === "premium_monthly") {
      priceId = monthlyId;
    } else if (planType === "premium_annual") {
      priceId = annualId;
    }

    if (!priceId) {
      return res.status(400).json({ error: "Invalid plan type" });
    }

    try {
      // Create or get customer
      let customer;
      const { data: company } = await supabase
        .from("companies")
        .select("stripe_customer_id, email")
        .eq("id", companyId)
        .single();

      if (company?.stripe_customer_id) {
        customer = await stripe.customers.retrieve(company.stripe_customer_id);
      } else {
        customer = await stripe.customers.create({
          email: email || company?.email,
          metadata: { companyId },
        });
        await supabase
          .from("companies")
          .update({ stripe_customer_id: customer.id })
          .eq("id", companyId);
      }

      // Create subscription
      const subscription = await stripe.subscriptions.create({
        customer: (customer as Stripe.Customer).id,
        items: [{ price: priceId }],
        payment_behavior: "default_incomplete",
        payment_settings: { save_default_payment_method: "on_subscription" },
        expand: ["latest_invoice.payment_intent", "pending_setup_intent"],
        metadata: { companyId, planType },
      });

      // Improved retrieval logic with retries to handle eventual consistency
      let currentSubscription = subscription;
      let attempts = 0;
      const maxAttempts = 7; // Increased attempts further
      let paymentIntent: any = null;
      let setupIntent: any = null;
      
      while (attempts < maxAttempts) {
        console.log(`[Stripe] Attempt ${attempts + 1} for sub ${currentSubscription.id}. Status: ${currentSubscription.status}`);
        
        // 1. Try to get invoice from subscription
        let invoice = currentSubscription.latest_invoice as any;
        
        // 2. If invoice is null, try to list invoices
        if (!invoice) {
          console.log(`[Stripe] latest_invoice is null, fetching invoices list...`);
          const invoices = await stripe.invoices.list({
            subscription: currentSubscription.id,
            limit: 1,
            expand: ['data.payment_intent']
          });
          if (invoices.data.length > 0) {
            invoice = invoices.data[0];
            console.log(`[Stripe] Found invoice via list: ${invoice.id}`);
          }
        }
        
        // 3. Resolve invoice if it's a string
        if (typeof invoice === 'string') {
          invoice = await stripe.invoices.retrieve(invoice, {
            expand: ['payment_intent']
          });
        }

        // 3.5 If invoice is still in draft, finalize it to generate a payment intent
        if (invoice && invoice.status === 'draft') {
          console.log(`[Stripe] Invoice ${invoice.id} is in draft status, finalizing...`);
          try {
            invoice = await stripe.invoices.finalizeInvoice(invoice.id, {
              expand: ['payment_intent']
            });
            console.log(`[Stripe] Invoice ${invoice.id} finalized.`);
          } catch (finalError) {
            console.error(`[Stripe] Error finalizing invoice:`, finalError);
          }
        }

        // 4. Extract intents
        paymentIntent = invoice?.payment_intent as any;
        setupIntent = currentSubscription.pending_setup_intent as any;

        // 5. If intents are still strings, retrieve them
        if (typeof paymentIntent === 'string') {
          paymentIntent = await stripe.paymentIntents.retrieve(paymentIntent);
        }
        if (typeof setupIntent === 'string') {
          setupIntent = await stripe.setupIntents.retrieve(setupIntent);
        }

        // 6. If we still don't have a payment intent, check if the invoice has one we missed
        if (invoice && !paymentIntent && invoice.payment_intent) {
           const piId = typeof invoice.payment_intent === 'string' ? invoice.payment_intent : invoice.payment_intent.id;
           if (piId) {
             paymentIntent = await stripe.paymentIntents.retrieve(piId);
           }
        }

        console.log(`[Stripe] Intent status - PaymentIntent: ${paymentIntent?.id || 'Missing'}, SetupIntent: ${setupIntent?.id || 'Missing'}`);

        // 7. Check if we have a client secret or if the subscription is already active
        if (paymentIntent?.client_secret || setupIntent?.client_secret || ['active', 'trialing'].includes(currentSubscription.status)) {
          console.log(`[Stripe] Success! Status: ${currentSubscription.status}, ClientSecret: ${!!(paymentIntent?.client_secret || setupIntent?.client_secret)}`);
          return res.json({
            subscriptionId: currentSubscription.id,
            clientSecret: paymentIntent?.client_secret || setupIntent?.client_secret || null,
            status: currentSubscription.status
          });
        }

        // 8. If we don't have an intent yet, wait and retry
        attempts++;
        if (attempts < maxAttempts) {
          const delay = 2500; // Increased delay to 2.5s
          console.log(`[Stripe] Attempt ${attempts} failed to find intent. Retrying in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
          currentSubscription = await stripe.subscriptions.retrieve(currentSubscription.id, {
            expand: ['latest_invoice.payment_intent', 'pending_setup_intent']
          });
        }
      }

      // If we reach here, we've exhausted retries and still have no intent
      console.error("CRITICAL: Exhausted retries. Missing payment/setup intent for subscription:", currentSubscription.id, "Status:", currentSubscription.status);
      
      // One last check: if status is incomplete but we have an invoice, maybe we can return the invoice URL?
      // But for the embedded flow we need the client secret.
      
      throw new Error(`Não foi possível gerar o formulário de pagamento após ${maxAttempts} tentativas. Status: ${currentSubscription.status}. Por favor, verifique se o seu método de pagamento é válido ou tente novamente mais tarde.`);
    } catch (error: any) {
      console.error("Subscription Creation Error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Catch-all for API routes that don't exist
  app.all("/api/*any", (req, res) => {
    res.status(404).json({ error: `API route ${req.method} ${req.url} not found` });
  });

  // Vite middleware for development
  const isProduction = process.env.NODE_ENV === "production";
  
  if (!isProduction) {
    console.log("Starting in DEVELOPMENT mode with Vite middleware");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Starting in PRODUCTION mode serving static files");
    const distPath = path.join(__dirname, "dist");
    app.use(express.static(distPath));
    app.get("*any", (req, res) => {
      // Don't serve index.html for missing API routes
      if (req.path.startsWith('/api/')) {
        return res.status(404).json({ error: "API endpoint not found" });
      }
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

    app.listen(Number(PORT), "0.0.0.0", () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("FATAL ERROR DURING SERVER STARTUP:", error);
    process.exit(1);
  }
}

startServer();
