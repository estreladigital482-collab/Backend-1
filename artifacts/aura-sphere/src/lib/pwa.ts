export const SERVICE_WORKER_PATH = '/sw.js';

export function isServiceWorkerSupported() {
  return typeof navigator !== 'undefined' && 'serviceWorker' in navigator;
}

export async function registerServiceWorker() {
  if (!isServiceWorkerSupported()) {
    return;
  }

  try {
    const registration = await navigator.serviceWorker.register(SERVICE_WORKER_PATH);
    console.log('[PWA] Service worker registered:', registration.scope);
  } catch (error) {
    console.warn('[PWA] Service worker registration failed:', error);
  }
}
