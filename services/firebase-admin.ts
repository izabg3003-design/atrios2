import { initializeApp, cert, App } from 'firebase-admin/app';
import { getMessaging } from 'firebase-admin/messaging';

// Obter as chaves do Firebase Service Account a partir do ambiente ou fallback fornecido pelo utilizador
const privateKey = process.env.FIREBASE_PRIVATE_KEY || `-----BEGIN PRIVATE KEY-----
MIIEuwIBADANBgkqhkiG9w0BAQEFAASCBKUwggShAgEAAoIBAQDTwh7BxhfZM4ow
crSOQEnG7MU1Cp0TfmTGL3UWTW9jbs4S4j/eKxUB1bfHSnZeM3Qa9TNIFSEURM2K
A+ftD0Uoq/rE+JzYnwfOF0I5d132CSF6PD+cDpL61A3ZXWGZHMSORUfqqtBRbvHl
lToCVnKErIg+ZCfRt+H/ormSuc9Y2MfbbCMRQPNG2pNcEoc19yB8VvxFDg5PlnE1
cvEVdvmvzGdNdv3HMZ6IMpvwznlE5MYTjZXUppOBJUyFlv8wLn3dlEUBcaAZ8wYa
Zm4WmuAjeQYyheHyIlBc+oFM/gdK+YtMad1AEej3mR8T9KPuikgwUDhwWMdxyfNH
n6B9pErPAgMBAAECgf8H/ot9o/0BUgzyZsSmblbXgLafaTVqQYH9U4y1vLD2dJDH
AawMEAf4J01dqOhJrDyMslrx9mTsQJkDZc4JLCR67yOk5WWqqoIilss8CRGav71/
O4jr/ory7YEOOCSoV4uBYcdTMV2Ek/MWpHsVCMoMa4OHl2RvsCqHd0D/S7Ifi4AQ
zlgYUy9EArVHn/ZOeP/FnPbw2w3iqDhLCUIdBOONc18G7Mx9hO36jjL4zgQD2TLK
5biRf7TqSEJOKpdMw7iL4fzDA/YP98St0T+QQc7AuxptrYxSZAYwoQCOnApQVzAZ
9VKZSPAn9XiRlblpjzYJoeyIDgYA2YsnBxlBS+UCgYEA7tzPniKsRp3wyQ208ESB
s0OZ6vHQC8A4CsyazVrI4lasg8/KFLUDrreqFilbyMRJAjP2sLb0dx3tcWBaa91J
hVJ1hYt3q117BBOP6verkgkO8wpeMJ47WJ535mKOea3ShvMLPVGy8rCwtx93DLR4
pCizJ2dTKgBBGhVr9rAXHnsCgYEA4vN8L06H9TgGVfqWLHC1+sRk2u7hu55ngb4q
8zcSRiL5ccqh1xUXNKgmJEyee0cJw6AZPb1fwFlorZsje+HkLWtNvGgyxQBaoUzF
7bQYDfknBGQIdXSwGdLy3J1zUQ27uh+aRruup7Nfy8D9vofyAOTp48++oBSCq6aX
ietDPr0CgYEAzGx940CZX/Zb1DW+3MJEnj8Ew2YgP25KiDODaKyBr/OtwUFcGUyx
0h2tmznaK4CRWylNvv9VSXx7ccScniPMgCWKHri1uhtO5LY5PUapt1m5SZdd9Q32
jGlTBADlHo381zG6NMhu9fTxyEdNg7oQZa3PZbGwIwoErWYX+A/MOXECgYBb1Xi/
z8A2Gvh9XAveabFJiqTg7l7LQ5rQpjnM9tDfLpHPWNZKKQ+d0Bi3AYXzjlhGH4d3
MyUGuWchMLCYFVz2gAARp/w7ORxzPpSszf4Z0WLXZP8DQDduC60YVmHuP2diNh2A
V7uhwnSWBz7mFS547Cg0dcDGF+aUPLH/LgKk5QKBgHsxo/vi86D6hliZmI57PBl9
Fva73x7HpXajVJTqNwcpkA64Iqv+M/G/yX6//cqnUDpAPbUIQUFrS5zh0CAtaggC
0e/ZP7ImFtQvxJv9Es1aKBIZkqymKS2w/mm9SuALmPn1gg3uP4l+U4n6uZwQEUvL
R81JujGkXvm1XKacVi2I
-----END PRIVATE KEY-----`;

const projectId = process.env.FIREBASE_PROJECT_ID || "pushbuild-164d9";
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL || "firebase-adminsdk-m9s8h@pushbuild-164d9.iam.gserviceaccount.com";

let adminApp: App | null = null;

try {
  adminApp = initializeApp({
    credential: cert({
      projectId,
      clientEmail,
      privateKey: privateKey.replace(/\\n/g, '\n'),
    }),
  });
  console.log('[Firebase Admin] Inicializado com sucesso para o projeto:', projectId);
} catch (err: any) {
  console.error('[Firebase Admin Error] Erro ao inicializar Firebase Admin SDK:', err.message);
}

export { adminApp };

interface SendFcmResult {
  successCount: number;
  failureCount: number;
  tokensToRemove: string[];
}

/**
 * Envia uma mensagem FCM para uma lista de tokens de dispositivos
 */
export const sendFcmNotification = async (
  tokens: string[],
  title: string,
  body: string,
  data?: Record<string, string>
): Promise<SendFcmResult> => {
  if (!adminApp) {
    console.warn('[FCM Admin] SDK não está inicializado. Ignorando envio.');
    return { successCount: 0, failureCount: tokens.length, tokensToRemove: [] };
  }

  if (tokens.length === 0) {
    return { successCount: 0, failureCount: 0, tokensToRemove: [] };
  }

  console.log(`[FCM Admin] A enviar notificação push a ${tokens.length} dispositivos: "${title}"`);

  let successCount = 0;
  let failureCount = 0;
  const tokensToRemove: string[] = [];

  try {
    const messagingInstance = getMessaging(adminApp);
    const response = await messagingInstance.sendEachForMulticast({
      tokens,
      notification: {
        title,
        body,
      },
      data: {
        ...data,
        click_action: '/',
      },
      webpush: {
        notification: {
          title,
          body,
          icon: '/favicon.svg',
          badge: '/favicon.svg',
          tag: 'atrios-firebase-push',
          vibrate: [200, 100, 200, 100, 300],
        }
      }
    });

    successCount = response.successCount;
    failureCount = response.failureCount;

    console.log(`[FCM Admin] Resultados de Envio: ${successCount} sucessos, ${failureCount} falhas.`);

    response.responses.forEach((resp, idx) => {
      if (!resp.success) {
        const error = resp.error;
        if (error && (
          error.code === 'messaging/invalid-registration-token' ||
          error.code === 'messaging/registration-token-not-registered'
        )) {
          tokensToRemove.push(tokens[idx]);
        }
      }
    });

    return { successCount, failureCount, tokensToRemove };
  } catch (error) {
    console.error('[FCM Admin] Erro catastrófico ao enviar multicast:', error);
    return { successCount: 0, failureCount: tokens.length, tokensToRemove: [] };
  }
};
