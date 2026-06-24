import { initializeApp, cert } from "firebase-admin/app";
import { getMessaging } from "firebase-admin/messaging";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let isFirebaseAdminInitialized = false;

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
      initializeApp();
      isFirebaseAdminInitialized = true;
      console.log("[Firebase Admin] Inicializado com credenciais padrão da Google Cloud.");
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
        requireInteraction: true
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
