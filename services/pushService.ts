import { requestFcmToken } from './firebase';

export interface PushSubscriptionMetadata {
  companyId?: string;
  plan?: string;
  email?: string;
  role?: 'master' | 'user' | 'client' | string;
  phone?: string;
  name?: string;
  companyName?: string;
}

export function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

/**
 * Registers both Web Push (VAPID) and Firebase Cloud Messaging (FCM) tokens with the backend
 */
export async function registerPushSubscription(metadata: PushSubscriptionMetadata = {}): Promise<{
  webSuccess: boolean;
  fcmSuccess: boolean;
  subscription?: PushSubscription | null;
  fcmToken?: string | null;
}> {
  let webSuccess = false;
  let fcmSuccess = false;
  let subscription: PushSubscription | null = null;
  let fcmToken: string | null = null;

  if (typeof window === 'undefined') {
    return { webSuccess, fcmSuccess };
  }

  // 1. Web Push (VAPID) registration
  if ('serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window) {
    if (Notification.permission === 'granted') {
      try {
        await navigator.serviceWorker.register('/firebase-messaging-sw.js').catch(() => {});
        const reg = await navigator.serviceWorker.ready;
        subscription = await reg.pushManager.getSubscription();

        if (!subscription) {
          const keyRes = await fetch('/api/push/public-key');
          if (keyRes.ok) {
            const { publicKey } = await keyRes.json();
            if (publicKey) {
              const convertedKey = urlBase64ToUint8Array(publicKey);
              try {
                subscription = await reg.pushManager.subscribe({
                  userVisibleOnly: true,
                  applicationServerKey: convertedKey
                });
              } catch (subErr: any) {
                console.warn('[PushService] Web Push subscribe failed:', subErr.message || subErr);
              }
            }
          }
        }

        if (subscription) {
          const payload = {
            subscription,
            companyId: metadata.companyId || 'guest',
            plan: metadata.plan || 'free',
            email: metadata.email || '',
            role: metadata.role || (metadata.companyId === 'master' ? 'master' : 'user'),
            phone: metadata.phone || '',
            name: metadata.name || metadata.companyName || ''
          };

          const res = await fetch('/api/push/subscribe', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });

          if (res.ok) {
            webSuccess = true;
            console.log('[PushService] Web Push subscription synced with backend:', metadata.companyId);
          }
        }
      } catch (err: any) {
        console.warn('[PushService] Error registering Web Push:', err.message || err);
      }
    }
  }

  // 2. Firebase Cloud Messaging (FCM) registration
  try {
    if ('Notification' in window && Notification.permission === 'granted') {
      fcmToken = await requestFcmToken();
      if (fcmToken) {
        const payload = {
          token: fcmToken,
          companyId: metadata.companyId || 'guest',
          plan: metadata.plan || 'free',
          email: metadata.email || '',
          role: metadata.role || (metadata.companyId === 'master' ? 'master' : 'user'),
          phone: metadata.phone || '',
          name: metadata.name || metadata.companyName || ''
        };

        const res = await fetch('/api/push/fcm-subscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (res.ok) {
          fcmSuccess = true;
          console.log('[PushService] FCM token synced with backend:', metadata.companyId);
        }
      }
    }
  } catch (fcmErr: any) {
    console.warn('[PushService] FCM sync skipped:', fcmErr.message || fcmErr);
  }

  return { webSuccess, fcmSuccess, subscription, fcmToken };
}

/**
 * Requests push permission and automatically synchronizes subscriptions
 */
export async function requestPushPermissionAndRegister(metadata: PushSubscriptionMetadata = {}): Promise<NotificationPermission> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'denied';
  }

  try {
    const perm = await Notification.requestPermission();
    if (perm === 'granted') {
      await registerPushSubscription(metadata);
    }
    return perm;
  } catch (err) {
    console.error('[PushService] Permission request failed:', err);
    return 'denied';
  }
}

/**
 * Dispatches an in-app visual toast balloon notification AND a native system bar notification
 */
export function triggerInAppPush(title: string, body: string, data?: any) {
  triggerPushNotificationSubmit(title, body, data);
}

/**
 * Triggers both in-app toast AND native device notification bar push
 */
export function triggerPushNotificationSubmit(title: string, body: string, data?: any) {
  if (typeof window === 'undefined' || !title || !body) return;

  // 1. Disparar o balão informativo in-app
  try {
    window.dispatchEvent(
      new CustomEvent('in_app_push_toast', {
        detail: {
          id: String(Date.now() + Math.random()),
          title,
          body,
          data,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      })
    );
  } catch (err) {
    console.error('Erro ao disparar balão in-app:', err);
  }

  // 2. Disparar notificação nativa na barra do sistema do telemóvel/computador
  if (typeof window !== 'undefined' && 'Notification' in window) {
    const showDeviceNotification = () => {
      const notificationOptions: any = {
        body,
        icon: '/favicon.svg',
        badge: '/favicon.svg',
        vibrate: [200, 100, 200, 100, 300],
        tag: 'atrios-device-push-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
        renotify: true,
        requireInteraction: false,
        data: data || {
          dateOfArrival: Date.now(),
          url: '/'
        }
      };

      // Tentar no Service Worker primeiro (necessário no Android PWA e navegadores mobile)
      let showed = false;
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.ready
          .then((reg) => {
            if (reg && typeof reg.showNotification === 'function') {
              showed = true;
              return reg.showNotification(title, notificationOptions);
            }
          })
          .catch(() => {
            if (!showed) {
              try { new Notification(title, notificationOptions); } catch (e) {}
            }
          });
      } else {
        try {
          new Notification(title, notificationOptions);
        } catch (e) {}
      }
    };

    if (Notification.permission === 'granted') {
      showDeviceNotification();
    } else if (Notification.permission === 'default') {
      Notification.requestPermission().then(perm => {
        if (perm === 'granted') {
          showDeviceNotification();
        }
      }).catch(() => {});
    }
  }
}

