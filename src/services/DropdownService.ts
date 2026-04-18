import { DropdownHandler } from "@components/Dropdown";
import React from "react";
import { BackHandler } from "react-native";

export const dropdownRef = React.createRef<DropdownHandler>();

export function openDropdown(x: number, y: number, items: DropdownItemData[]) {
    if (dropdownRef.current?.getIsOpen()) return;

    dropdownRef.current?.setItems(items);
    requestAnimationFrame(() => {
        dropdownRef.current?.open({ x, y });
        const listener = BackHandler.addEventListener("hardwareBackPress", () => {
            dropdownRef.current?.close();
            listener.remove();
            return true;
        });
    });
}
