import React from 'react';
import { render, act, cleanup } from '@testing-library/react';
import { useOfflineChat } from '@/hooks/useOfflineChat';

function TestComponent({ callback }: { callback: (hook: ReturnType<typeof useOfflineChat>) => void }) {
  const hook = useOfflineChat();
  callback(hook);
  return null;
}

describe('useOfflineChat', () => {
  beforeEach(() => {
    localStorage.clear();
    Object.defineProperty(navigator, 'onLine', { value: true, configurable: true });
  });

  afterEach(() => {
    cleanup();
  });

  it('stores pending messages with role and timestamp when offline', () => {
    Object.defineProperty(navigator, 'onLine', { value: false, configurable: true });

    let hook: ReturnType<typeof useOfflineChat> | null = null;
    render(<TestComponent callback={(value) => { hook = value; }} />);

    act(() => {
      hook?.addMessage({ role: 'user', content: 'Olá mundo' });
    });

    expect(hook).not.toBeNull();
    expect(hook?.messages.length).toBe(1);
    expect(hook?.messages[0]).toMatchObject({
      role: 'user',
      content: 'Olá mundo',
      status: 'pending',
    });
    expect(typeof hook?.messages[0].timestamp).toBe('string');
    expect(hook?.pendingCount).toBe(1);
  });

  it('marks failed messages as pending again when retry is called online', () => {
    let hook: ReturnType<typeof useOfflineChat> | null = null;
    render(<TestComponent callback={(value) => { hook = value; }} />);

    act(() => {
      hook?.addMessage({ role: 'user', content: 'Fallback' });
    });

    act(() => {
      if (hook?.messages[0]) hook.markAsFailed(hook.messages[0].id);
    });

    expect(hook?.messages[0].status).toBe('failed');

    act(() => {
      Object.defineProperty(navigator, 'onLine', { value: true, configurable: true });
      hook?.retryFailedMessages();
    });

    expect(hook?.messages[0].status).toBe('pending');
  });
});
