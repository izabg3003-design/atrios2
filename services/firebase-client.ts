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
  if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
    console.warn("[FCM Client] Notificações push não suportadas neste browser.");
    return null;
  }

  const config = await getFirebaseConfig();
  const messaging = await getFirebaseMessaging();

  if (!config || !messaging) {
    console.log("[FCM Client] Ignorando registo FCM: Firebase não configurado.");
    return null;
  }

  try {
    // 1. Pedir permissão
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      console.warn("[FCM Client] Permissão de notificação negada pelo utilizador.");
      return null;
    }

    // 2. Registrar/Obter Service Worker do Firebase
    // Registamos um sw específico para isolar, ou podemos usar o /sw.js se configurado
    const reg = await navigator.serviceWorker.register("/firebase-messaging-sw.js", {
      scope: "/firebase-cloud-messaging-push-scope"
    });
    
    console.log("[FCM Client] Service worker de FCM registado com sucesso no scope:", reg.scope);

    // Esperar que o SW esteja pronto
    await navigator.serviceWorker.ready;

    // 3. Obter token do FCM
    const token = await getToken(messaging, {
      serviceWorkerRegistration: reg,
      vapidKey: config.vapidKey || undefined
    });

    if (token) {
      console.log("[FCM Client] Token FCM obtido com sucesso:", token);

      // 4. Enviar para o nosso Express Server para sincronização
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

      if (saveRes.ok) {
        console.log("[FCM Client] Token sincronizado com o servidor com sucesso!");
        
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
        console.error("[FCM Client] Falha ao sincronizar token com servidor:", saveRes.statusText);
      }
    } else {
      console.warn("[FCM Client] Nenhum token retornado pelo Firebase.");
    }
  } catch (err) {
    console.error("[FCM Client] Erro ao registrar FCM:", err);
  }

  return null;
}
