/**
 * Serviço de Atualização Remota Automática (OTA - Over The Air)
 * Permite que o Master force a atualização de todos os clientes sem que precisem desinstalar o app.
 */

export interface AppVersionInfo {
  version: string;
  versionCode: number;
  updatedAt: string;
  forceUpdate?: boolean;
  message?: string;
  triggeredBy?: string;
}

export const STORAGE_KEY_APPLIED_VERSION = 'atrios_applied_version_time';

export function getLocalAppliedVersion(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(STORAGE_KEY_APPLIED_VERSION);
}

/**
 * Consulta a versão atual no servidor com bypass total de cache
 */
export async function fetchServerAppVersion(): Promise<AppVersionInfo | null> {
  try {
    const res = await fetch(`/api/app-version?_nocache=${Date.now()}`, {
      cache: 'no-store',
      headers: {
        'Pragma': 'no-cache',
        'Cache-Control': 'no-cache'
      }
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data;
  } catch (e) {
    console.warn('[AppUpdateService] Erro ao consultar versão do servidor:', e);
    return null;
  }
}

/**
 * Limpa todos os caches locais do navegador (CacheStorage) e força o Service Worker a atualizar
 */
export async function purgeAllCachesAndRefreshServiceWorker(): Promise<void> {
  if (typeof window === 'undefined') return;

  console.log('[AppUpdateService] Purgando caches locais e atualizando Service Worker...');

  // 1. Limpar todas as instâncias de CacheStorage do navegador
  if ('caches' in window) {
    try {
      const cacheKeys = await caches.keys();
      await Promise.all(cacheKeys.map(k => caches.delete(k)));
      console.log(`[AppUpdateService] ${cacheKeys.length} caches eliminados com sucesso.`);
    } catch (cacheErr) {
      console.warn('[AppUpdateService] Aviso ao limpar CacheStorage:', cacheErr);
    }
  }

  // 2. Atualizar e ordenar o Service Worker para assumir controle imediatamente (skipWaiting)
  if ('serviceWorker' in navigator) {
    try {
      const registrations = await navigator.serviceWorker.getRegistrations();
      for (const reg of registrations) {
        await reg.update().catch(() => {});
        if (reg.waiting) {
          reg.waiting.postMessage({ type: 'SKIP_WAITING' });
        }
        if (reg.active) {
          reg.active.postMessage({ type: 'CLEAR_CACHES' });
        }
      }
    } catch (swErr) {
      console.warn('[AppUpdateService] Aviso ao atualizar registros do Service Worker:', swErr);
    }
  }
}

/**
 * Verifica se há uma atualização forçada pendente e a aplica imediatamente
 */
export async function checkAndApplyAppUpdate(forceImmediateReload = false): Promise<boolean> {
  if (typeof window === 'undefined') return false;

  try {
    const serverInfo = await fetchServerAppVersion();
    if (!serverInfo || !serverInfo.updatedAt) return false;

    const lastApplied = localStorage.getItem(STORAGE_KEY_APPLIED_VERSION);

    // Se nunca foi marcado e não é reload forçado, grava a atual para não reiniciar na primeira carga
    if (!lastApplied && !forceImmediateReload) {
      localStorage.setItem(STORAGE_KEY_APPLIED_VERSION, serverInfo.updatedAt);
      return false;
    }

    const serverTime = new Date(serverInfo.updatedAt).getTime();
    const clientTime = new Date(lastApplied).getTime();

    // Se o servidor tiver uma versão mais recente do que a aplicada localmente ou se forceImmediateReload for true
    if (serverTime > clientTime || forceImmediateReload) {
      console.log(`[AppUpdateService] Nova versão remota detectada: ${serverInfo.version} (${serverInfo.updatedAt}). Aplicando atualização...`);
      
      localStorage.setItem(STORAGE_KEY_APPLIED_VERSION, serverInfo.updatedAt);
      await purgeAllCachesAndRefreshServiceWorker();

      // Recarregar a página para carregar o bundle mais novo
      const delay = forceImmediateReload ? 200 : 800;
      setTimeout(() => {
        window.location.reload();
      }, delay);

      return true;
    }

    return false;
  } catch (err) {
    console.warn('[AppUpdateService] Exceção ao checar atualização:', err);
    return false;
  }
}

/**
 * Disparado a partir do Painel Master para forçar a atualização remota em todos os dispositivos
 */
export async function triggerMasterForceUpdate(customMessage?: string): Promise<{ success: boolean; version?: string; error?: string }> {
  try {
    const res = await fetch('/api/admin/force-update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ customMessage })
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Falha ao disparar atualização remota.');
    }

    // Também atualiza o próprio dispositivo do Master
    if (data.updatedAt) {
      localStorage.setItem(STORAGE_KEY_APPLIED_VERSION, data.updatedAt);
    }

    return { success: true, version: data.version };
  } catch (e: any) {
    console.error('[AppUpdateService] Erro ao disparar force-update:', e);
    return { success: false, error: e.message || 'Erro inesperado' };
  }
}

/**
 * Inicializa os ouvintes de eventos para auto-recuperação e atualização contínua
 */
export function initAppUpdateListeners(onUpdatePrompt?: (version: string) => void) {
  if (typeof window === 'undefined') return;

  // 1. Ouvir mensagens do Service Worker
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.addEventListener('message', (event) => {
      if (event.data && (event.data.type === 'FORCE_UPDATE' || event.data.type === 'NEW_VERSION_AVAILABLE')) {
        console.log('[AppUpdateService] Mensagem FORCE_UPDATE recebida do Service Worker:', event.data);
        if (onUpdatePrompt) {
          onUpdatePrompt(event.data.version || 'mais recente');
        } else {
          checkAndApplyAppUpdate(true);
        }
      }
    });
  }

  // 2. Verificar atualização quando o utilizador volta à aplicação (aba ganha foco ou reabre app)
  window.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      checkAndApplyAppUpdate(false);
    }
  });

  window.addEventListener('focus', () => {
    checkAndApplyAppUpdate(false);
  });

  // 3. Verificação inicial 2 segundos após a carga
  setTimeout(() => {
    checkAndApplyAppUpdate(false);
  }, 2500);
}
