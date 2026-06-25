import { initializeApp, cert } from "firebase-admin/app";
import { getMessaging } from "firebase-admin/messaging";
import { getFirestore } from "firebase-admin/firestore";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let isFirebaseAdminInitialized = false;

function getFirebaseProjectId(): string | undefined {
  if (process.env.VITE_FIREBASE_PROJECT_ID) {
    return process.env.VITE_FIREBASE_PROJECT_ID;
  }
  const paths = [
    path.join(process.cwd(), "firebase_config.json"),
    path.join(__dirname, "firebase_config.json"),
    path.join(__dirname, "..", "firebase_config.json")
  ];
  for (const configPath of paths) {
    if (fs.existsSync(configPath)) {
      try {
        const raw = fs.readFileSync(configPath, "utf8");
        const parsed = JSON.parse(raw);
        if (parsed && parsed.projectId) {
          return parsed.projectId;
        }
      } catch (e) {
        // Ignorar erro ao ler ou parsear
      }
    }
  }
  return undefined;
}

export function getFirebaseAdmin() {
  if (isFirebaseAdminInitialized) {
    return true;
  }

  try {
    // 1. Verificar se há arquivo local de Service Account
    const saFilePath = path.join(process.cwd(), "firebase_service_account.json");
    
    if (fs.existsSync(saFilePath)) {
      const serviceAccount = JSON.parse(fs.readFileSync(saFilePath, "utf8"));
      initializeApp({
        credential: cert(serviceAccount)
      });
      isFirebaseAdminInitialized = true;
      console.log("[Firebase Admin] Inicializado com sucesso usando arquivo local firebase_service_account.json!");
      return true;
    }

    // 2. Verificar se há variável de ambiente com o JSON do Service Account
    if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
      try {
        const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
        initializeApp({
          credential: cert(serviceAccount)
        });
        isFirebaseAdminInitialized = true;
        console.log("[Firebase Admin] Inicializado com sucesso usando FIREBASE_SERVICE_ACCOUNT_JSON!");
        return true;
      } catch (jsonErr) {
        console.error("[Firebase Admin] Erro ao parsear FIREBASE_SERVICE_ACCOUNT_JSON de ambiente:", jsonErr);
      }
    }

    // 3. Tentar inicializar com credenciais padrão (Cloud Run / GCP SDK automatic detect)
    try {
      const projectId = getFirebaseProjectId();
      if (projectId) {
        // Configurar as variáveis de ambiente que o SDK do Google procura por padrão
        process.env.GOOGLE_CLOUD_PROJECT = projectId;
        process.env.GCP_PROJECT = projectId;
      }
      initializeApp({
        projectId: projectId
      });
      isFirebaseAdminInitialized = true;
      console.log(`[Firebase Admin] Inicializado com credenciais padrão da Google Cloud e Project ID: ${projectId || "não detectado"}`);
      return true;
    } catch (gcpErr: any) {
      console.warn("[Firebase Admin] Não foi possível usar as credenciais padrão da GCP:", gcpErr.message);
    }

    console.warn("[Firebase Admin] Firebase Admin não foi inicializado. Crie o arquivo firebase_service_account.json ou defina FIREBASE_SERVICE_ACCOUNT_JSON para habilitar notificações push via FCM.");
    return false;
  } catch (error) {
    console.error("[Firebase Admin] Falha crítica ao inicializar Firebase Admin:", error);
    return false;
  }
}

// Enviar notificação FCM para múltiplos tokens
export async function sendFCMBroadcast(title: string, body: string, tokens: string[], payloadData: any = {}) {
  const isInitialized = getFirebaseAdmin();
  if (!isInitialized) {
    console.warn("[Firebase Admin] Envio cancelado: Firebase Admin não está configurado.");
    return { success: false, error: "Firebase Admin not configured" };
  }

  if (!tokens || tokens.length === 0) {
    return { success: true, sentCount: 0, successCount: 0, failureCount: 0 };
  }

  console.log(`[Firebase Admin] Enviando FCM para ${tokens.length} dispositivos...`);

  const messagePayload = {
    tokens: tokens,
    notification: {
      title: title,
      body: body,
    },
    data: {
      click_action: "FLUTTER_NOTIFICATION_CLICK", // compatibilidade com mobile
      ...payloadData,
      title: title,
      body: body,
    },
    android: {
      priority: "high" as const,
      notification: {
        sound: "default",
        defaultSound: true,
        notificationPriority: "PRIORITY_MAX" as const,
        channelId: "high_importance_channel"
      }
    },
    apns: {
      headers: {
        "apns-priority": "10"
      },
      payload: {
        aps: {
          sound: "default",
          contentAvailable: true
        }
      }
    },
    webpush: {
      headers: {
        Urgency: "high"
      },
      notification: {
        title: title,
        body: body,
        icon: "/favicon.svg",
        badge: "/favicon.svg",
        tag: "atrios-global-push",
        requireInteraction: true,
        vibrate: [200, 100, 200, 100, 300]
      }
    }
  };

  try {
    const response = await getMessaging().sendEachForMulticast(messagePayload);
    console.log(`[Firebase Admin] FCM enviado. Sucessos: ${response.successCount}, Falhas: ${response.failureCount}`);
    
    const failedTokens: string[] = [];
    if (response.failureCount > 0) {
      response.responses.forEach((resp, idx) => {
        if (!resp.success) {
          console.warn(`[Firebase Admin] Falha no token ${tokens[idx]}:`, resp.error?.message);
          // 404/410 ou Token inválido
          if (
            resp.error?.code === "messaging/registration-token-not-registered" ||
            resp.error?.code === "messaging/invalid-argument"
          ) {
            failedTokens.push(tokens[idx]);
          }
        }
      });
    }

    return {
      success: true,
      sentCount: tokens.length,
      successCount: response.successCount,
      failureCount: response.failureCount,
      failedTokens // Para que o servidor possa remover os tokens mortos
    };
  } catch (err: any) {
    console.error("[Firebase Admin] Erro ao disparar sendEachForMulticast:", err);
    return { success: false, error: err.message };
  }
}

// Save FCM Token in Firestore
export async function saveFCMTokenToFirestore(token: string, companyId: string, plan: string) {
  const isInitialized = getFirebaseAdmin();
  if (!isInitialized) return false;

  try {
    const db = getFirestore();
    const docRef = db.collection("fcm_tokens").doc(token);
    await docRef.set({
      token,
      companyId: companyId || "guest",
      plan: plan || "free",
      updatedAt: new Date().toISOString()
    }, { merge: true });
    console.log(`[Firebase Admin Firestore] Token FCM guardado com sucesso para ${companyId}`);
    return true;
  } catch (err: any) {
    console.error("[Firebase Admin Firestore] Erro ao guardar token no Firestore:", err.message);
    return false;
  }
}

// Save WebPush Subscription in Firestore
export async function saveSubscriptionToFirestore(subscription: any, companyId: string, plan: string) {
  const isInitialized = getFirebaseAdmin();
  if (!isInitialized) return false;

  try {
    const db = getFirestore();
    // Usar base64url do endpoint como ID do documento para evitar caracteres inválidos no Firestore doc ID
    const endpointHash = Buffer.from(subscription.endpoint).toString("base64url");
    const docRef = db.collection("push_subscriptions").doc(endpointHash);
    await docRef.set({
      subscription,
      companyId: companyId || "guest",
      plan: plan || "free",
      createdAt: new Date().toISOString()
    }, { merge: true });
    console.log(`[Firebase Admin Firestore] Subscrição WebPush guardada com sucesso para ${companyId}`);
    return true;
  } catch (err: any) {
    console.error("[Firebase Admin Firestore] Erro ao guardar subscrição no Firestore:", err.message);
    return false;
  }
}

// Get FCM Tokens from Firestore
export async function getFCMTokensFromFirestore() {
  const isInitialized = getFirebaseAdmin();
  if (!isInitialized) return [];

  try {
    const db = getFirestore();
    const snapshot = await db.collection("fcm_tokens").get();
    const tokens: any[] = [];
    snapshot.forEach(doc => {
      tokens.push(doc.data());
    });
    return tokens;
  } catch (err: any) {
    console.error("[Firebase Admin Firestore] Erro ao obter tokens do Firestore:", err.message);
    return [];
  }
}

// Get WebPush Subscriptions from Firestore
export async function getSubscriptionsFromFirestore() {
  const isInitialized = getFirebaseAdmin();
  if (!isInitialized) return [];

  try {
    const db = getFirestore();
    const snapshot = await db.collection("push_subscriptions").get();
    const subscriptions: any[] = [];
    snapshot.forEach(doc => {
      subscriptions.push(doc.data());
    });
    return subscriptions;
  } catch (err: any) {
    console.error("[Firebase Admin Firestore] Erro ao obter subscrições do Firestore:", err.message);
    return [];
  }
}

// Remove FCM Token from Firestore
export async function removeFCMTokenFromFirestore(token: string) {
  const isInitialized = getFirebaseAdmin();
  if (!isInitialized) return;

  try {
    const db = getFirestore();
    await db.collection("fcm_tokens").doc(token).delete();
    console.log(`[Firebase Admin Firestore] Token FCM removido por estar inativo: ${token}`);
  } catch (err: any) {
    console.error("[Firebase Admin Firestore] Erro ao remover token do Firestore:", err.message);
  }
}

// Remove WebPush Subscription from Firestore
export async function removeSubscriptionFromFirestore(endpoint: string) {
  const isInitialized = getFirebaseAdmin();
  if (!isInitialized) return;

  try {
    const db = getFirestore();
    const endpointHash = Buffer.from(endpoint).toString("base64url");
    await db.collection("push_subscriptions").doc(endpointHash).delete();
    console.log(`[Firebase Admin Firestore] Subscrição WebPush removida por estar inativa: ${endpoint}`);
  } catch (err: any) {
    console.error("[Firebase Admin Firestore] Erro ao remover subscrição do Firestore:", err.message);
  }
}
