import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface PushNotificationState {
  isSupported: boolean;
  permission: NotificationPermission | 'default';
  isSubscribed: boolean;
  isLoading: boolean;
}

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function usePushNotifications() {
  const [state, setState] = useState<PushNotificationState>({
    isSupported: false,
    permission: 'default',
    isSubscribed: false,
    isLoading: true,
  });

  const isSupported = 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;

  useEffect(() => {
    if (!isSupported) {
      setState(s => ({ ...s, isSupported: false, isLoading: false }));
      return;
    }

    const checkSubscription = async () => {
      try {
        const registration = await navigator.serviceWorker.getRegistration('/push-sw.js');
        const subscription = registration ? await registration.pushManager.getSubscription() : null;
        setState({
          isSupported: true,
          permission: Notification.permission,
          isSubscribed: !!subscription,
          isLoading: false,
        });
      } catch {
        setState(s => ({ ...s, isSupported: true, isLoading: false }));
      }
    };

    checkSubscription();
  }, [isSupported]);

  const subscribe = useCallback(async (): Promise<boolean> => {
    if (!isSupported) return false;
    setState(s => ({ ...s, isLoading: true }));

    try {
      // Request notification permission
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        setState(s => ({ ...s, permission, isLoading: false }));
        return false;
      }

      // Register service worker
      const registration = await navigator.serviceWorker.register('/push-sw.js');
      await navigator.serviceWorker.ready;

      // Get VAPID public key from edge function
      const { data: vapidData, error: vapidError } = await supabase.functions.invoke('push-notifications', {
        body: { action: 'get-vapid-key' },
      });

      if (vapidError || !vapidData?.publicKey) {
        throw new Error('Failed to get VAPID key');
      }

      const applicationServerKey = urlBase64ToUint8Array(vapidData.publicKey);
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: applicationServerKey.buffer as ArrayBuffer,
      });

      // Send subscription to backend
      const { error: subError } = await supabase.functions.invoke('push-notifications', {
        body: {
          action: 'subscribe',
          subscription: subscription.toJSON(),
        },
      });

      if (subError) throw subError;

      setState({
        isSupported: true,
        permission: 'granted',
        isSubscribed: true,
        isLoading: false,
      });
      return true;
    } catch (err) {
      console.error('Push subscription failed:', err);
      setState(s => ({ ...s, isLoading: false }));
      return false;
    }
  }, [isSupported]);

  const unsubscribe = useCallback(async (): Promise<boolean> => {
    try {
      setState(s => ({ ...s, isLoading: true }));
      const registration = await navigator.serviceWorker.getRegistration('/push-sw.js');
      const subscription = registration ? await registration.pushManager.getSubscription() : null;

      if (subscription) {
        await supabase.functions.invoke('push-notifications', {
          body: { action: 'unsubscribe', endpoint: subscription.endpoint },
        });
        await subscription.unsubscribe();
      }

      setState(s => ({ ...s, isSubscribed: false, isLoading: false }));
      return true;
    } catch (err) {
      console.error('Push unsubscribe failed:', err);
      setState(s => ({ ...s, isLoading: false }));
      return false;
    }
  }, []);

  const sendTestNotification = useCallback(async () => {
    await supabase.functions.invoke('push-notifications', {
      body: {
        action: 'send',
        title: '🧹 Test Notification',
        message: 'Push notifications are working!',
        url: '/settings',
      },
    });
  }, []);

  return {
    ...state,
    subscribe,
    unsubscribe,
    sendTestNotification,
  };
}
