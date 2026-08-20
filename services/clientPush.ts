function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export const registerClientWebPush = async (clientPhoneOrEmail: string, clientRequestId?: string) => {
  if (typeof window === 'undefined' || !clientPhoneOrEmail) return;
  if (!('serviceWorker' in navigator) || !('PushManager' in window) || !('Notification' in window)) {
    return;
  }

  if (typeof Notification.requestPermission !== 'function') {
    return;
  }

  try {
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') return;

    const reg = await navigator.serviceWorker.ready;
    let subscription = await reg.pushManager.getSubscription();

    if (!subscription) {
      const keyRes = await fetch('/api/push/public-key');
      if (keyRes.ok) {
        const { publicKey } = await keyRes.json();
        if (publicKey) {
          const convertedKey = urlBase64ToUint8Array(publicKey);
          subscription = await reg.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: convertedKey
          }).catch(() => null);
        }
      }
    }

    if (subscription) {
      const cleanPhone = clientPhoneOrEmail.replace(/\D/g, '');
      const isEmail = clientPhoneOrEmail.includes('@');
      
      await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subscription,
          companyId: cleanPhone || clientPhoneOrEmail,
          email: isEmail ? clientPhoneOrEmail : undefined,
          phone: cleanPhone || undefined,
          plan: 'client',
          requestId: clientRequestId
        })
      }).catch(err => console.warn('[ClientPush] Server sync failed:', err));
    }
  } catch (err) {
    console.warn('[ClientPush] Error subscribing client to push:', err);
  }
};
