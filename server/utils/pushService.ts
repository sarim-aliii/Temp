import webpush from 'web-push';
import Logger from './logger';

// Initialize Web Push with VAPID keys
if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT || 'mailto:support@blurchat.com',
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );
} else {
  Logger.warn("⚠️ VAPID Keys missing. Push notifications will not work.");
}

export const sendNotification = async (subscription: any, payload: any) => {
  if (!subscription || !subscription.endpoint) return;

  try {
    await webpush.sendNotification(subscription, JSON.stringify(payload));
  } catch (error) {
    Logger.error("Error sending push notification:", error);
  }
};