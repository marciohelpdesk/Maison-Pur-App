/**
 * App recovery utilities.
 *
 * Fixes the recurring "Importing a module script failed" / white screen that
 * happens when a browser (or an installed PWA) keeps an old index-*.js in
 * cache after a new deploy.
 */

const RELOAD_FLAG = '__mp_chunk_reloaded';

const isChunkError = (message: string) =>
  /Importing a module script failed/i.test(message) ||
  /Failed to fetch dynamically imported module/i.test(message) ||
  /error loading dynamically imported module/i.test(message) ||
  /Unable to preload CSS/i.test(message);

const forceReload = () => {
  if (sessionStorage.getItem(RELOAD_FLAG)) return; // avoid reload loops
  sessionStorage.setItem(RELOAD_FLAG, '1');
  const url = new URL(window.location.href);
  url.searchParams.set('_r', Date.now().toString());
  window.location.replace(url.toString());
};

export function installChunkErrorRecovery() {
  // Vite's own preload failure event
  window.addEventListener('vite:preloadError', (event) => {
    event.preventDefault();
    forceReload();
  });

  window.addEventListener('error', (event) => {
    const msg = event.message || '';
    if (isChunkError(msg)) forceReload();
  });

  window.addEventListener('unhandledrejection', (event) => {
    const reason: unknown = event.reason;
    const msg =
      typeof reason === 'string' ? reason : (reason as Error)?.message || '';
    if (isChunkError(msg)) forceReload();
  });

  // App booted fine — clear the guard so a future stale deploy can recover too.
  window.setTimeout(() => sessionStorage.removeItem(RELOAD_FLAG), 5000);
}

/**
 * Removes legacy app-shell service workers and their caches.
 * The push notification worker (/push-sw.js) is intentionally preserved.
 */
export async function cleanupStaleServiceWorkers() {
  if (!('serviceWorker' in navigator)) return;

  try {
    const registrations = await navigator.serviceWorker.getRegistrations();
    for (const registration of registrations) {
      const scriptUrl =
        registration.active?.scriptURL ||
        registration.waiting?.scriptURL ||
        registration.installing?.scriptURL ||
        '';
      if (scriptUrl.includes('push-sw.js')) continue; // keep push worker
      await registration.unregister();
    }
  } catch {
    // ignore — cleanup is best-effort
  }

  try {
    if (!('caches' in window)) return;
    const names = await caches.keys();
    await Promise.allSettled(
      names
        .filter((n) => /precache|runtime|workbox|assets|app-shell/i.test(n))
        .map((n) => caches.delete(n)),
    );
  } catch {
    // ignore
  }
}
