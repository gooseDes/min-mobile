import { DropdownHandler } from "@components/Dropdown";
import React from "react";
import { BackHandler } from "react-native";
import { cancelClickInterception, interceptNextClick } from "./InterceptClickService";

export const dropdownRef = React.createRef<DropdownHandler>();

export function openDropdown(x: number, y: number, items: DropdownItemData[]) {
    if (dropdownRef.current?.getIsOpen()) return;

    dropdownRef.current?.setItems(items);
    requestAnimationFrame(() => {
        dropdownRef.current?.open({ x, y });
        const close = () => {
            dropdownRef.current?.close();
            listener.remove();
            cancelClickInterception();
        };
        const listener = BackHandler.addEventListener("hardwareBackPress", () => {
            close();
            return true;
        });
        dropdownRef.current?.bindSelection(_item => close());
        interceptNextClick(() => close);
    });
}
