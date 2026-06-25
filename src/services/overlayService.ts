import { blurApp } from "@/utils";
import { ImageOverlayHandler } from "@components/ImageOverlay";
import { OverlayHandler } from "@components/Overlay";
import React from "react";
import { BackHandler } from "react-native";

export const overlayRef = React.createRef<OverlayHandler>();
export const imageOverlayRef = React.createRef<ImageOverlayHandler>();

export function setOverlay(overlay: OverlayState) {
    if (overlayRef.current) {
        blurApp(overlay !== "none" && overlay !== "downloading");
        overlayRef.current.setOverlay(overlay);
    }
}

export function setOverlayProgress(progress: number) {
    if (overlayRef.current) {
        overlayRef.current.setProgress(progress);
    }
}

export function setOverlayImage(image: string, animateFrom?: Rect, onShow?: (isShown: boolean) => void) {
    if (imageOverlayRef.current) {
        imageOverlayRef.current.setAnimateFrom(animateFrom);
        imageOverlayRef.current.setOnShow(onShow);
        imageOverlayRef.current.setImage(image);
        setTimeout(() => blurApp(image !== ""), 100);
        if (image) {
            const sub = BackHandler.addEventListener("hardwareBackPress", () => {
                imageOverlayRef.current?.close();
                blurApp(false);
                sub.remove();
                return true;
            });
        }
    }
}
