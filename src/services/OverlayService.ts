import { AppHandler } from "@/App";
import { OverlayHandler } from "@components/Overlay";
import React from "react";

export const overlayRef = React.createRef<OverlayHandler>();
export const appRef = React.createRef<AppHandler>();

export const setOverlay = (overlay: OverlayState) => {
    if (overlayRef.current) {
        if (appRef.current) {
            if (overlay === "none") {
                appRef.current.setBlurEnabled(false);
            } else {
                appRef.current.setBlurEnabled(true);
            }
        }
        overlayRef.current.setOverlay(overlay);
    }
};

export const setProgress = (progress: number) => {
    if (overlayRef.current) {
        overlayRef.current.setProgress(progress);
    }
};
