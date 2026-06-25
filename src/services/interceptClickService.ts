import { PressableOverlayHandler } from "@components/PressableOverlay";
import React from "react";

export const pressableOverlayRef = React.createRef<PressableOverlayHandler>();

export function interceptNextClick(callback: () => void) {
    if (pressableOverlayRef.current) {
        pressableOverlayRef.current.interceptNextClick(callback);
    }
}

export function cancelClickInterception() {
    if (pressableOverlayRef.current) {
        pressableOverlayRef.current.cancelClickInterception();
    }
}
