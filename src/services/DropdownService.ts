import { DropdownHandler } from "@components/Dropdown";
import React from "react";

export const dropdownRef = React.createRef<DropdownHandler>();

export function openDropdown(x: number, y: number, items: DropdownItemData[]) {
    if (dropdownRef.current?.getIsOpen()) return;

    dropdownRef.current?.setItems(items);
    requestAnimationFrame(() => {
        dropdownRef.current?.open({ x, y });
    });
}
