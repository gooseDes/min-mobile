import { PressableOverlayHandler } from "@components/PressableOverlay";
import React from "react";

export const PressableOverlayRef = React.createRef<PressableOverlayHandler>();

export function interceptNextClick(callback: () => void) {
    if (PressableOverlayRef.current) {
        PressableOverlayRef.current.interceptNextClick(callback);
    }
}

export function cancelClickInterception() {
    if (PressableOverlayRef.current) {
        PressableOverlayRef.current.cancelClickInterception();
    }
}
