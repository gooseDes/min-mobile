import { OverlayHandler } from "@components/Overlay";
import React from "react";

export const overlayRef = React.createRef<OverlayHandler>();

export const setOverlay = (overlay: OverlayState) => {
    if (overlayRef.current) {
        overlayRef.current.setOverlay(overlay);
    }
};

export const setProgress = (progress: number) => {
    if (overlayRef.current) {
        overlayRef.current.setProgress(progress);
    }
};
