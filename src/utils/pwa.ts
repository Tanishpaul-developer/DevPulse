import { useEffect, useState, useCallback } from 'react';

export interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

let globalDeferredPrompt: BeforeInstallPromptEvent | null = null;
const listeners = new Set<() => void>();

function notifyListeners() {
  listeners.forEach((fn) => fn());
}

if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e: Event) => {
    e.preventDefault();
    globalDeferredPrompt = e as BeforeInstallPromptEvent;
    notifyListeners();
  });

  window.addEventListener('appinstalled', () => {
    globalDeferredPrompt = null;
    notifyListeners();
  });
}

/**
 * Registers the client-side Service Worker (`/sw.js`) for offline caching of the app shell
 * and client-side developer utilities (JSON Formatter, JWT Decoder, Regex Tester, Cron Builder).
 */
export function registerDevPulseServiceWorker(): void {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return;
  }

  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js', { scope: '/' })
      .catch(() => {
        // Ignore service worker registration errors in restricted iframe sandboxes
      });
  });
}

export function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(
    globalDeferredPrompt
  );
  const [isInstalled, setIsInstalled] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return (
      window.matchMedia?.('(display-mode: standalone)')?.matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true
    );
  });
  const [isIOS, setIsIOS] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return /iphone|ipad|ipod/i.test(window.navigator.userAgent);
  });
  const [installBannerMessage, setInstallBannerMessage] = useState<string | null>(null);

  useEffect(() => {
    const sync = () => {
      setDeferredPrompt(globalDeferredPrompt);
      const standalone =
        window.matchMedia?.('(display-mode: standalone)')?.matches ||
        (window.navigator as unknown as { standalone?: boolean }).standalone === true;
      setIsInstalled(standalone);
      setIsIOS(/iphone|ipad|ipod/i.test(window.navigator.userAgent));
    };

    listeners.add(sync);
    sync();

    return () => {
      listeners.delete(sync);
    };
  }, []);

  const triggerInstallPrompt = useCallback(async (): Promise<boolean> => {
    if (globalDeferredPrompt) {
      await globalDeferredPrompt.prompt();
      const { outcome } = await globalDeferredPrompt.userChoice;
      if (outcome === 'accepted') {
        globalDeferredPrompt = null;
        setDeferredPrompt(null);
        setIsInstalled(true);
        setInstallBannerMessage('DevPulse AI installed for offline desktop & mobile access!');
        setTimeout(() => setInstallBannerMessage(null), 5000);
        return true;
      }
      return false;
    }

    // Fallback guidance when browser has not yet fired beforeinstallprompt (e.g. iOS Safari or preview iframe)
    const msg = isIOS
      ? 'To install on iOS: Tap Share in Safari and select "Add to Home Screen".'
      : 'Offline Service Worker active! Click the install icon in your browser address bar (or menu → "Install DevPulse AI") to pin as a standalone app.';
    setInstallBannerMessage(msg);
    setTimeout(() => setInstallBannerMessage(null), 6000);
    return false;
  }, [isIOS]);

  return {
    isInstallable: Boolean(deferredPrompt),
    isInstalled,
    isIOS,
    installBannerMessage,
    dismissInstallBanner: () => setInstallBannerMessage(null),
    triggerInstallPrompt,
  };
}
