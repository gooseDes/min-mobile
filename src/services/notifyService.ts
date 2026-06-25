import { NotificationHandle } from "@components/Notification";
import React from "react";

export const notificationRef = React.createRef<NotificationHandle>();

export function showNotification(title?: string, text?: string, image?: string) {
    if (notificationRef.current) {
        notificationRef.current.setText(text ?? "");
        notificationRef.current.setTitle(title ?? "");
        notificationRef.current.setImage(image ?? null);
        notificationRef.current.show();
    }
}
