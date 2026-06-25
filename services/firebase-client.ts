import { initializeApp, getApps, getApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

let isConfigLoaded = false;
let firebaseConfig: any = null;
let messagingInstance: any = null;

// Carregar configuração dinamicamente do servidor
export async function getFirebaseConfig() {
  if (isConfigLoaded) return firebaseConfig;
  try {
    const res = await fetch("/api/push/firebase-config");
    if (res.ok) {
      const data = await res.json();
      if (data && data.apiKey) {
        firebaseConfig = data;
      }
    }
  } catch (err) {
    console.error("[FCM Client] Erro ao carregar config do Firebase:", err);
  }
  isConfigLoaded = true;
  return firebaseConfig;
}

// Inicializar app do Firebase lazily
export async function getFirebaseMessaging() {
  if (messagingInstance) return messagingInstance;

  const config = await getFirebaseConfig();
  if (!config) {
    console.warn("[FCM Client] Firebase não está configurado no servidor.");
    return null;
  }

  try {
    // Evitar reinicializar se já existir
    const app = getApps().length === 0 ? initializeApp(config) : getApp();
    messagingInstance = getMessaging(app);
    return messagingInstance;
  } catch (err) {
    console.error("[FCM Client] Falha ao inicializar Firebase Messaging:", err);
    return null;
  }
}

// Requisitar permissão e obter Token do FCM para o browser atual
export async function registerFirebaseFCM(companyId: string, plan: string) {
  const logDiag = (msg: string) => {
    if (typeof window !== "undefined" && (window as any).addPushDiagnostic) {
      (window as any).addPushDiagnostic(msg);
    } else {
      console.log(msg);
    }
  };

  const logErr = (msg: string, err: any) => {
    if (typeof window !== "undefined" && (window as any).addPushError) {
      (window as any).addPushError(msg, err);
    } else {
      console.error(msg, err);
    }
  };

  logDiag(`[FCM Client] Iniciar registo FCM para: ${companyId} (Plano: ${plan})`);
  if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
    logErr("Notificações push não suportadas neste browser.", new Error("SW/PushManager ausente"));
    return null;
  }

  const config = await getFirebaseConfig();
  const messaging = await getFirebaseMessaging();

  if (!config || !messaging) {
    logDiag("[FCM Client] Ignorando registo FCM: Firebase não configurado no cliente.");
    return null;
  }

  try {
    // 1. Pedir permissão
    const permission = await Notification.requestPermission();
    logDiag(`[FCM Client] Permissão de notificação atual: ${permission}`);
    if (permission !== "granted") {
      logErr("Permissão de notificação negada pelo utilizador para FCM.", new Error("permission !== granted"));
      return null;
    }

    // 2. Registrar/Obter Service Worker do Firebase
    logDiag("[FCM Client] Obtendo Service Worker registado...");
    let reg = await navigator.serviceWorker.getRegistration();
    if (!reg) {
      logDiag("[FCM Client] Nenhum SW registado, registando /sw.js...");
      reg = await navigator.serviceWorker.register("/sw.js");
    }
    
    logDiag("[FCM Client] A aguardar que o Service Worker fique pronto...");
    reg = await navigator.serviceWorker.ready;
    logDiag(`[FCM Client] Service worker pronto no escopo: ${reg.scope}`);

    // 3. Obter token do FCM
    logDiag(`[FCM Client] Solicitando token ao servidor do Firebase (Vapid Key: ${config.vapidKey ? "Configurada" : "Ausente"})...`);
    const token = await getToken(messaging, {
      serviceWorkerRegistration: reg,
      vapidKey: config.vapidKey || undefined
    });

    if (token) {
      logDiag(`[FCM Client] Token FCM obtido do Firebase com sucesso! Token: ${token.substring(0, 15)}...`);

      // 4. Enviar para o nosso Express Server para sincronização
      logDiag("[FCM Client] Enviando token de FCM para o nosso servidor...");
      const saveRes = await fetch("/api/push/subscribe-fcm", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          token,
          companyId,
          plan
        })
      });

      const resData = await saveRes.json();
      if (saveRes.ok) {
        logDiag(`[FCM Client] Token FCM sincronizado com o servidor com sucesso! Supabase: ${resData.savedToSupabase}`);
        
        // Registrar listener de mensagens em primeiro plano (quando o app estiver aberto)
        onMessage(messaging, (payload) => {
          console.log("[FCM Client] Mensagem recebida em primeiro plano:", payload);
          // Mostrar notificação manual se o app estiver focado
          if (payload.notification) {
            const { title, body } = payload.notification;
            new Notification(title || "Átrios", {
              body,
              icon: "/favicon.svg",
              badge: "/favicon.svg"
            });
          }
        });
        
        return token;
      } else {
        throw new Error(`Servidor rejeitou token FCM com status ${saveRes.status}`);
      }
    } else {
      throw new Error("Nenhum token foi retornado pelo Firebase");
    }
  } catch (err) {
    logErr("Falha geral no processo de Firebase FCM", err);
  }

  return null;
}
