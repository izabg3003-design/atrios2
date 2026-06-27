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
import { sendFcmNotification } from "./services/firebase-admin.js";


dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Carregar ou gerar chaves VAPID estáveis e persistentes para PWA Offline Push
const DEFAULT_VAPID = {
  publicKey: "BDbP6H-i86jr1AR9GpbUJ6oNxH69LPQE5cntwWdI7Ez01T_isAPCAIyfFirzco3MLpTr9G1EWf-4z8-qqhzvMQU",
  privateKey: "U6TDY19IqDqB8VOsu9JyQ2tzDbU_i3jwtzTD6aEQJd0"
};

let vapidKeys: { publicKey: string; privateKey: string };
const vapidFilePath = path.join(process.cwd(), "vapid_keys.json");

if (fs.existsSync(vapidFilePath)) {
  try {
    vapidKeys = JSON.parse(fs.readFileSync(vapidFilePath, "utf8"));
    console.log("[PWA Push] Loaded stable, existing VAPID keys successfully.");
  } catch (e) {
    console.error("[PWA Push] Error reading vapid_keys.json, using stable default keys...", e);
    vapidKeys = DEFAULT_VAPID;
  }
} else {
  vapidKeys = DEFAULT_VAPID;
  try {
    fs.writeFileSync(vapidFilePath, JSON.stringify(vapidKeys), "utf8");
    console.log("[PWA Push] Created stable vapid_keys.json on disk.");
  } catch (err) {
    console.warn("[PWA Push] Could not write vapid_keys.json to disk (read-only filesystem?), using stable memory keys.");
  }
}

webPush.setVapidDetails(
  "mailto:suporte@atrios.app",
  vapidKeys.publicKey,
  vapidKeys.privateKey
);

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

// Helper resiliente para salvar subscrição/token no Supabase (com detecção dinâmica de colunas)
async function saveSubscriptionToSupabase(record: {
  endpoint?: string;
  subscription?: any;
  token?: string;
  companyId: string;
  plan: string;
}) {
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.warn("[Supabase Push] Supabase URL or Key missing. Skipping DB save.");
    return;
  }

  const idValue = record.token || record.endpoint || record.subscription?.endpoint;
  if (!idValue) return;

  const payload: any = {
    id: idValue,
    subscription: record.subscription ? (typeof record.subscription === 'object' ? JSON.stringify(record.subscription) : record.subscription) : null,
    token: record.token || null,
    plan: record.plan || 'free',
    companyId: record.companyId,
    company_id: record.companyId,
    companyid: record.companyId,
    created_at: new Date().toISOString()
  };

  const tryUpsert = async (data: any): Promise<any> => {
    try {
      const { error } = await supabase.from("push_subscriptions").upsert(data);
      if (!error) {
        console.log(`[Supabase Push Sync] Salvo com sucesso para ${record.companyId}`);
        return { success: true };
      }
      
      console.warn(`[Supabase Push Sync Warn] Erro ao salvar subscrição:`, error.message);
      
      // Se a tabela não existir, podemos alertar ou falhar silenciosamente
      if (error.code === 'PGRST116' || error.message?.includes("relation") || error.message?.includes("does not exist")) {
        console.warn("[Supabase Push Sync] A tabela 'push_subscriptions' não existe no Supabase. Fallback para JSON local.");
        return { success: false, noTable: true };
      }

      // Se der coluna não encontrada (PGRST204), remove a coluna e tenta de novo recursivamente
      if (error.code === 'PGRST204' || error.message?.includes("column")) {
        const match = error.message.match(/Could not find the '(.+)' column/) || error.message.match(/column "(.+)" of relation/);
        const missingColumn = match ? match[1] : null;
        if (missingColumn && data[missingColumn] !== undefined) {
          console.log(`[Supabase Push Sync] Removendo coluna inexistente '${missingColumn}' e tentando novamente...`);
          const nextData = { ...data };
          delete nextData[missingColumn];
          return await tryUpsert(nextData);
        }
      }
      return { success: false, error };
    } catch (err: any) {
      console.error("[Supabase Push Sync Exception]", err.message || err);
      return { success: false, error: err };
    }
  };

  await tryUpsert(payload);
}

// Helper para limpar automaticamente subscrições antigas (com mais de 7 dias) do Supabase
async function pruneOldSubscriptionsFromSupabase() {
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) return;
  try {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const { error } = await supabase
      .from("push_subscriptions")
      .delete()
      .lt("created_at", sevenDaysAgo);
      
    if (error) {
      console.warn("[Supabase Prune] Erro ao limpar subscrições antigas:", error.message);
    } else {
      console.log("[Supabase Prune] Subscrições antigas (mais de 7 dias) limpas com sucesso.");
    }
  } catch (err: any) {
    console.error("[Supabase Prune Exception]", err.message || err);
  }
}

// Helper resiliente para buscar subscrições persistidas no Supabase
async function fetchSubscriptionsFromSupabase(): Promise<{ web: any[], fcm: any[] }> {
  const web: any[] = [];
  const fcm: any[] = [];

  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return { web, fcm };
  }

  // Executar limpeza automática de tokens com mais de 7 dias antes de retornar as subscrições
  await pruneOldSubscriptionsFromSupabase().catch(() => {});

  try {
    const { data, error } = await supabase.from("push_subscriptions").select("*");
    if (error) {
      console.warn("[Supabase Fetch Subs Warn] Falha ao obter dados (tabela pode não existir):", error.message);
      return { web, fcm };
    }

    if (data && Array.isArray(data)) {
      data.forEach((row: any) => {
        const companyId = row.company_id || row.companyId || row.companyid || "guest";
        const plan = row.plan || "free";
        const createdAt = row.created_at || new Date().toISOString();

        if (row.token) {
          fcm.push({
            token: row.token,
            companyId,
            plan,
            createdAt
          });
        }

        if (row.subscription) {
          let subscription = row.subscription;
          if (typeof subscription === 'string') {
            try {
              subscription = JSON.parse(subscription);
            } catch (e) {
              // não é JSON válido
            }
          }
          if (subscription && subscription.endpoint) {
            web.push({
              subscription,
              companyId,
              plan,
              createdAt
            });
          }
        }
      });
      console.log(`[Supabase Fetch Subs] Obtidas ${web.length} subscrições Web e ${fcm.length} tokens FCM.`);
    }
  } catch (err: any) {
    console.error("[Supabase Fetch Subs Exception]", err.message || err);
  }

  return { web, fcm };
}

async function startServer() {
  try {
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

  // 1. Obter chave pública VAPID do Átrios para subscrever no browser
  app.get("/api/push/public-key", (req, res) => {
    res.json({ publicKey: vapidKeys.publicKey });
  });

  // 2. Subscrever um dispositivo de utilizador no browser
  app.post("/api/push/subscribe", (req, res) => {
    const { subscription, companyId, plan } = req.body;
    if (!subscription || !subscription.endpoint) {
      return res.status(400).json({ error: "Missing subscription object or endpoint URL" });
    }

    const subFile = path.join(process.cwd(), "push_subscriptions.json");
    let subscriptions: any[] = [];
    if (fs.existsSync(subFile)) {
      try {
        subscriptions = JSON.parse(fs.readFileSync(subFile, "utf8"));
      } catch (e) {
        console.error("Error reading subscriptions file", e);
      }
    }

    // Evitar duplicados pelo endpoint da subscrição
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

    // Sincronizar em segundo plano com o Supabase
    saveSubscriptionToSupabase({
      subscription,
      companyId: companyId || "guest",
      plan: plan || "free"
    }).catch(err => console.error("[Supabase Push Sync Error] Web push sync:", err));

    try {
      fs.writeFileSync(subFile, JSON.stringify(subscriptions, null, 2), "utf8");
      console.log(`[PWA Push] Registered subscription for User: ${companyId}, Plan: ${plan}`);
      res.json({ success: true });
    } catch (dbErr: any) {
      console.error("Failed to write subscriptions to disk", dbErr);
      res.status(500).json({ error: "Failed to persist subscription" });
    }
  });

  // 2.1 Subscrever um dispositivo utilizando Firebase Cloud Messaging (FCM)
  app.post("/api/push/fcm-subscribe", (req, res) => {
    const { token, companyId, plan } = req.body;
    if (!token) {
      return res.status(400).json({ error: "Missing FCM token" });
    }

    const fcmSubFile = path.join(process.cwd(), "fcm_subscriptions.json");
    let subscriptions: any[] = [];
    if (fs.existsSync(fcmSubFile)) {
      try {
        subscriptions = JSON.parse(fs.readFileSync(fcmSubFile, "utf8"));
      } catch (e) {
        console.error("Error reading FCM subscriptions file", e);
      }
    }

    // Evitar duplicados pelo token
    const existingIndex = subscriptions.findIndex(sub => sub.token === token);
    
    const newRecord = {
      token,
      companyId: companyId || "guest",
      plan: plan || "free",
      createdAt: new Date().toISOString()
    };

    if (existingIndex > -1) {
      subscriptions[existingIndex] = newRecord;
    } else {
      subscriptions.push(newRecord);
    }

    // Sincronizar em segundo plano com o Supabase
    saveSubscriptionToSupabase({
      token,
      companyId: companyId || "guest",
      plan: plan || "free"
    }).catch(err => console.error("[Supabase Push Sync Error] FCM sync:", err));

    try {
      fs.writeFileSync(fcmSubFile, JSON.stringify(subscriptions, null, 2), "utf8");
      console.log(`[FCM Push] Registered/Updated token for User: ${companyId}, Plan: ${plan}`);
      res.json({ success: true });
    } catch (dbErr: any) {
      console.error("Failed to write FCM subscriptions to disk", dbErr);
      res.status(500).json({ error: "Failed to persist FCM subscription" });
    }
  });

  // Helper to trigger push broadcast (Web Push + FCM)
  const sendPushBroadcast = async (title: string, body: string, targetAudience: string) => {
    let successCount = 0;
    let failureCount = 0;

    // Buscar subscrições do Supabase
    const dbSubs = await fetchSubscriptionsFromSupabase();

    // --- PARTE A: Web Push padrão (VAPID) ---
    const subFile = path.join(process.cwd(), "push_subscriptions.json");
    let webSubscriptions: any[] = [];
    if (fs.existsSync(subFile)) {
      try {
        webSubscriptions = JSON.parse(fs.readFileSync(subFile, "utf8"));
      } catch (e) {
        console.error("Error reading web subscriptions", e);
      }
    }

    // Unificar e remover duplicados do Web Push (usando o endpoint como chave única)
    const allWebSubs = [...webSubscriptions, ...dbSubs.web];
    const uniqueWebSubs: any[] = [];
    const seenEndpoints = new Set<string>();

    allWebSubs.forEach(sub => {
      if (sub && sub.subscription && sub.subscription.endpoint) {
        if (!seenEndpoints.has(sub.subscription.endpoint)) {
          seenEndpoints.add(sub.subscription.endpoint);
          uniqueWebSubs.push(sub);
        }
      }
    });

    const filteredWeb = uniqueWebSubs.filter(sub => {
      if (targetAudience === 'master') {
        return sub.companyId === 'master' || sub.plan === 'master';
      }
      if (!targetAudience || targetAudience === 'all') return true;
      if (targetAudience === 'free' && sub.plan === 'free') return true;
      if (targetAudience === 'all_premium' && sub.plan !== 'free') return true;
      if (targetAudience === 'premium_monthly' && sub.plan === 'premium_monthly') return true;
      if (targetAudience === 'premium_annual' && sub.plan === 'premium_annual') return true;
      return false;
    });

    const deadWebEndpoints: string[] = [];
    const webPayload = JSON.stringify({
      title,
      body,
      icon: '/favicon.svg',
      badge: '/favicon.svg',
      tag: 'atrios-global-push',
      vibrate: [200, 100, 200, 100, 300]
    });

    const webPromises = filteredWeb.map(async (sub) => {
      try {
        await webPush.sendNotification(sub.subscription, webPayload);
        successCount++;
      } catch (err: any) {
        console.error(`[PWA Push Send Error] ${sub.subscription.endpoint}:`, err.message);
        failureCount++;
        if (err.statusCode === 410 || err.statusCode === 404) {
          deadWebEndpoints.push(sub.subscription.endpoint);
        }
      }
    });

    // --- PARTE B: Firebase Cloud Messaging (FCM) ---
    const fcmSubFile = path.join(process.cwd(), "fcm_subscriptions.json");
    let fcmSubscriptions: any[] = [];
    if (fs.existsSync(fcmSubFile)) {
      try {
        fcmSubscriptions = JSON.parse(fs.readFileSync(fcmSubFile, "utf8"));
      } catch (e) {
        console.error("Error reading FCM subscriptions", e);
      }
    }

    // Unificar e remover duplicados do FCM (usando o token como chave única)
    const allFcmSubs = [...fcmSubscriptions, ...dbSubs.fcm];
    const uniqueFcmSubs: any[] = [];
    const seenTokens = new Set<string>();

    allFcmSubs.forEach(sub => {
      if (sub && sub.token) {
        if (!seenTokens.has(sub.token)) {
          seenTokens.add(sub.token);
          uniqueFcmSubs.push(sub);
        }
      }
    });

    const filteredFcm = uniqueFcmSubs.filter(sub => {
      if (targetAudience === 'master') {
        return sub.companyId === 'master' || sub.plan === 'master';
      }
      if (!targetAudience || targetAudience === 'all') return true;
      if (targetAudience === 'free' && sub.plan === 'free') return true;
      if (targetAudience === 'all_premium' && sub.plan !== 'free') return true;
      if (targetAudience === 'premium_monthly' && sub.plan === 'premium_monthly') return true;
      if (targetAudience === 'premium_annual' && sub.plan === 'premium_annual') return true;
      return false;
    });

    const fcmTokens = filteredFcm.map(sub => sub.token);
    let fcmSuccess = 0;
    let fcmFailure = 0;
    let fcmTokensToRemove: string[] = [];

    if (fcmTokens.length > 0) {
      try {
        const fcmResult = await sendFcmNotification(fcmTokens, title, body);
        fcmSuccess = fcmResult.successCount;
        fcmFailure = fcmResult.failureCount;
        fcmTokensToRemove = fcmResult.tokensToRemove || [];
        
        successCount += fcmSuccess;
        failureCount += fcmFailure;
      } catch (fcmErr) {
        console.error('[PWA FCM Send Error]', fcmErr);
        fcmFailure = fcmTokens.length;
        failureCount += fcmFailure;
      }
    }

    // Aguardar o término dos envios Web Push
    await Promise.all(webPromises);

    // Pruning de Web Push inativos
    if (deadWebEndpoints.length > 0) {
      console.log(`[PWA Push] Pruning ${deadWebEndpoints.length} dead Web endpoints.`);
      const activeWeb = webSubscriptions.filter(sub => !deadWebEndpoints.includes(sub.subscription.endpoint));
      try {
        fs.writeFileSync(subFile, JSON.stringify(activeWeb, null, 2), "utf8");
      } catch (dbErr) {
        console.error("Failed to prune dead Web subscriptions", dbErr);
      }

      // Remover do Supabase se estiver configurado
      if (process.env.SUPABASE_URL) {
        try {
          for (const endpoint of deadWebEndpoints) {
            await supabase.from("push_subscriptions").delete().eq("id", endpoint);
          }
        } catch (dbDelErr) {
          console.error("Failed to prune dead Web subscriptions in Supabase:", dbDelErr);
        }
      }
    }

    // Pruning de FCM Tokens inativos
    if (fcmTokensToRemove.length > 0) {
      console.log(`[FCM Push] Pruning ${fcmTokensToRemove.length} inactive FCM tokens.`);
      const activeFcm = fcmSubscriptions.filter(sub => !fcmTokensToRemove.includes(sub.token));
      try {
        fs.writeFileSync(fcmSubFile, JSON.stringify(activeFcm, null, 2), "utf8");
      } catch (dbErr) {
        console.error("Failed to prune inactive FCM tokens", dbErr);
      }

      // Remover os tokens inativos do Supabase também
      if (process.env.SUPABASE_URL) {
        try {
          for (const token of fcmTokensToRemove) {
            await supabase.from("push_subscriptions").delete().eq("id", token);
          }
          console.log(`[FCM Push] Inactive FCM tokens pruned from Supabase database successfully.`);
        } catch (dbDelErr) {
          console.error("Failed to prune inactive FCM tokens in Supabase:", dbDelErr);
        }
      }
    }

    return { 
      successCount, 
      failureCount, 
      totalCount: filteredWeb.length + filteredFcm.length,
      webCount: filteredWeb.length,
      fcmCount: filteredFcm.length
    };
  };

  // 3. Enviar notificação push em segundo plano offline (mesmo fechado)
  app.post("/api/push/send-broadcast", async (req, res) => {
    const { title, body, targetAudience } = req.body;
    if (!title || !body) {
      return res.status(400).json({ error: "Missing required fields: title and body" });
    }

    console.log(`[PWA Push Broadcast] Sending: "${title}" | Audience: ${targetAudience}`);
    
    try {
      const result = await sendPushBroadcast(title, body, targetAudience || 'all');
      res.json({
        success: true,
        sentCount: result.totalCount,
        successCount: result.successCount,
        failureCount: result.failureCount
      });
    } catch (err: any) {
      console.error("[PWA Broadcast Error]", err);
      res.status(500).json({ error: "Internal broadcast error", details: err.message });
    }
  });

  // 3.1 Enviar notificação push específica para o Master (cadastro, mensagem, venda)
  app.post("/api/push/notify-master", async (req, res) => {
    const { type, details } = req.body;
    if (!type || !details) {
      return res.status(400).json({ error: "Missing required fields: type and details" });
    }

    let title = "";
    let body = "";

    if (type === "signup") {
      title = "Novo Usuário Cadastrado! 🚀";
      body = `O usuário "${details.name}" (${details.email}) acabou de se cadastrar no aplicativo.`;
    } else if (type === "message") {
      title = "Nova Mensagem de Suporte! 💬";
      body = `"${details.companyName}" enviou uma nova mensagem: "${details.content}"`;
    } else if (type === "sale") {
      const formattedTotal = details.total ? `€${Number(details.total).toFixed(2)}` : "€0.00";
      title = "Novo Orçamento Recebido! 🛍️";
      body = `Foi vendido ${details.quantity || 1}x "${details.productName || 'Produto'}" no valor de ${formattedTotal}!`;
    } else {
      title = "Notificação do Sistema 🔔";
      body = JSON.stringify(details);
    }

    console.log(`[PWA Master Notify] Event: ${type} | Sending: "${title}"`);

    try {
      const result = await sendPushBroadcast(title, body, 'master');
      res.json({
        success: true,
        sentCount: result.totalCount,
        successCount: result.successCount,
        failureCount: result.failureCount
      });
    } catch (err: any) {
      console.error("[PWA Master Notify Error]", err);
      res.status(500).json({ error: "Internal notification error", details: err.message });
    }
  });

  // 3.5. Limpar tokens antigos ou reiniciar tabela push_subscriptions
  app.post("/api/push/cleanup", async (req, res) => {
    const { all } = req.body;
    try {
      if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
        return res.status(400).json({ error: "Supabase integration not configured." });
      }

      if (all === true) {
        // Limpar tudo
        const { error } = await supabase.from("push_subscriptions").delete().neq("id", "placeholder_impossible_id");
        if (error) throw error;
        
        // Também limpar arquivos locais
        try {
          fs.writeFileSync(path.join(process.cwd(), "push_subscriptions.json"), "[]", "utf8");
          fs.writeFileSync(path.join(process.cwd(), "fcm_subscriptions.json"), "[]", "utf8");
        } catch (fErr) {
          console.warn("Failed to reset local push files during total cleanup:", fErr);
        }

        console.log("[Push Cleanup] Deletadas TODAS as subscrições com sucesso.");
        return res.json({ success: true, message: "Todas as subscrições foram reiniciadas com sucesso no Supabase e no servidor local." });
      } else {
        // Limpar apenas mais antigas de 7 dias
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
        const { error } = await supabase
          .from("push_subscriptions")
          .delete()
          .lt("created_at", sevenDaysAgo);

        if (error) throw error;
        console.log("[Push Cleanup] Subscrições mais antigas de 7 dias foram limpas.");
        return res.json({ success: true, message: "Subscrições inativas ou antigas (mais de 7 dias) foram limpas com sucesso do Supabase." });
      }
    } catch (err: any) {
      console.error("[Push Cleanup Error]", err);
      res.status(500).json({ error: "Failed to run cleanup", details: err.message });
    }
  });

  // 4. Obter lista de agendamentos
  app.get("/api/push/scheduled", (req, res) => {
    const schedFile = path.join(process.cwd(), "scheduled_push.json");
    let scheduledList: any[] = [];
    if (fs.existsSync(schedFile)) {
      try {
        scheduledList = JSON.parse(fs.readFileSync(schedFile, "utf8"));
      } catch (e) {
        console.error("Failed to parse scheduled push list", e);
      }
    }
    res.json({ success: true, scheduled: scheduledList });
  });

  // 5. Agendar uma nova notificação push
  app.post("/api/push/schedule", (req, res) => {
    const { title, body, targetAudience, scheduledTime } = req.body;
    if (!title || !body || !scheduledTime) {
      return res.status(400).json({ error: "Missing required fields: title, body, or scheduledTime" });
    }

    const schedFile = path.join(process.cwd(), "scheduled_push.json");
    let scheduledList: any[] = [];
    if (fs.existsSync(schedFile)) {
      try {
        scheduledList = JSON.parse(fs.readFileSync(schedFile, "utf8"));
      } catch (e) {
        console.error("Failed to parse scheduled push list", e);
      }
    }

    const newSchedule = {
      id: "SCHED_" + Math.random().toString(36).substr(2, 9).toUpperCase(),
      title,
      body,
      targetAudience: targetAudience || 'all',
      scheduledTime, // Formato string ISO ou YYYY-MM-DDTHH:mm
      createdAt: new Date().toISOString()
    };

    scheduledList.push(newSchedule);

    try {
      fs.writeFileSync(schedFile, JSON.stringify(scheduledList, null, 2), "utf8");
      console.log(`[PWA Push Scheduler] Push scheduled at ${scheduledTime}: "${title}"`);
      res.json({ success: true, scheduled: newSchedule });
    } catch (err: any) {
      console.error("Failed to persist scheduled push", err);
      res.status(500).json({ error: "Failed to save scheduled push" });
    }
  });

  // 6. Cancelar/Eliminar um agendamento
  app.delete("/api/push/scheduled/:id", (req, res) => {
    const { id } = req.params;
    const schedFile = path.join(process.cwd(), "scheduled_push.json");
    let scheduledList: any[] = [];
    if (fs.existsSync(schedFile)) {
      try {
        scheduledList = JSON.parse(fs.readFileSync(schedFile, "utf8"));
      } catch (e) {
        console.error("Failed to parse scheduled push list", e);
      }
    }

    const filtered = scheduledList.filter(item => item.id !== id);

    try {
      fs.writeFileSync(schedFile, JSON.stringify(filtered, null, 2), "utf8");
      console.log(`[PWA Push Scheduler] Cancelled scheduled push with ID: ${id}`);
      res.json({ success: true });
    } catch (err: any) {
      console.error("Failed to update scheduled list after delete", err);
      res.status(500).json({ error: "Failed to delete scheduled push" });
    }
  });

  // Background scheduler interval (executa a cada 30 segundos)
  setInterval(async () => {
    const schedFile = path.join(process.cwd(), "scheduled_push.json");
    if (!fs.existsSync(schedFile)) return;

    let scheduledList: any[] = [];
    try {
      scheduledList = JSON.parse(fs.readFileSync(schedFile, "utf8"));
    } catch (e) {
      return;
    }

    if (scheduledList.length === 0) return;

    const now = new Date();
    const readyToPublish = scheduledList.filter(item => new Date(item.scheduledTime) <= now);
    const remaining = scheduledList.filter(item => new Date(item.scheduledTime) > now);

    if (readyToPublish.length > 0) {
      console.log(`[PWA Scheduler Background Worker] Delivering ${readyToPublish.length} due scheduled pushes...`);
      for (const item of readyToPublish) {
        try {
          console.log(`[PWA Scheduler] Delivering ID: ${item.id} - Title: "${item.title}"`);
          const result = await sendPushBroadcast(item.title, item.body, item.targetAudience);
          console.log(`[PWA Scheduler] Delivered with results: success ${result.successCount}, failure ${result.failureCount}`);
        } catch (err) {
          console.error(`[PWA Scheduler Error] Failed for scheduled push ${item.id}:`, err);
        }
      }

      try {
        fs.writeFileSync(schedFile, JSON.stringify(remaining, null, 2), "utf8");
      } catch (e) {
        console.error("Failed to write updated scheduled file", e);
      }
    }
  }, 30000);

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
    const distPath = path.join(process.cwd(), "dist");
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
