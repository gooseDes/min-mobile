import { blurApp } from "@/utils";
import { PopupHandler } from "@components/Popup";
import React from "react";
import { BackHandler } from "react-native";

export const popupRef = React.createRef<PopupHandler>();

export function showPopup(title?: string, content?: string, buttons?: PopupButton[]) {
    const tryShow = () => {
        if (!popupRef.current) {
            setTimeout(tryShow, 50);
            return;
        }

        const onClose = () => {
            blurApp(false);
            subscription.remove();
        };

        popupRef.current.setTitle(title ?? "");
        popupRef.current.setContent(content ?? "");
        popupRef.current.setButtons(buttons ?? [{ text: "OK" }]);
        popupRef.current.setOnClose(onClose);
        blurApp(true);
        const subscription = BackHandler.addEventListener("hardwareBackPress", () => {
            if (popupRef.current) popupRef.current.hide();
            onClose();
            return true;
        });
        popupRef.current.show();
    };

    tryShow();
}
