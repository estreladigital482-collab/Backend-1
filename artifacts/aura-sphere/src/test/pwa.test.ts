import { describe, it, expect, vi } from 'vitest';
import { registerServiceWorker } from '@/lib/pwa';

describe('PWA service worker', () => {
  it('registers the service worker when supported', async () => {
    const registerMock = vi.fn().mockResolvedValue({ scope: '/' });
    Object.defineProperty(window.navigator, 'serviceWorker', {
      value: { register: registerMock },
      configurable: true,
    });

    await registerServiceWorker();

    expect(registerMock).toHaveBeenCalledWith('/sw.js');
  });
});
