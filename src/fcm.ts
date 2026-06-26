import {
    getMessaging as getFirebaseMessaging,
    Messaging,
    onMessage as onFirebaseMessage,
    RemoteMessage,
    requestPermission as requestFirebasePermission,
    setBackgroundMessageHandler as setFirebaseBackgroundMessageHandler,
} from "@react-native-firebase/messaging";

export function getMessaging() {
    console.log("[FCM] getMessaging() called");
    try {
        const messaging = getFirebaseMessaging();
        console.log("[FCM] Firebase Messaging instance obtained successfully");
        return messaging;
    } catch (error) {
        console.error("[FCM] Error getting Firebase Messaging instance:", error);
        throw error;
    }
}

export function setBackgroundMessageHandler(messaging: Messaging, handler: () => Promise<void>) {
    console.log("[FCM] setBackgroundMessageHandler() setting up handler in Firebase");
    try {
        setFirebaseBackgroundMessageHandler(messaging, handler);
        console.log("[FCM] Background message handler registered with Firebase");
    } catch (error) {
        console.error("[FCM] Error setting background message handler:", error);
        throw error;
    }
}

export function onMessage(messaging: Messaging, handler: (message: RemoteMessage) => void): () => void {
    console.log("[FCM] onMessage() setting up foreground handler");
    try {
        const unsubscribe = onFirebaseMessage(messaging, handler);
        console.log("[FCM] Foreground message handler registered");
        return unsubscribe;
    } catch (error) {
        console.error("[FCM] Error setting foreground message handler:", error);
        throw error;
    }
}

export function requestPermission(messaging: Messaging) {
    console.log("[FCM] requestPermission() requesting Firebase notification permissions");
    try {
        const permissionPromise = requestFirebasePermission(messaging);
        console.log("[FCM] Permission request sent");
        return permissionPromise;
    } catch (error) {
        console.error("[FCM] Error requesting permission:", error);
        throw error;
    }
}
