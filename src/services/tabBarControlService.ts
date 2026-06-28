import { TabBarHandle } from "@app/(tabs)/_layout";
import React from "react";

export const tabBarRef = React.createRef<TabBarHandle>();

export function setTabBarVisibility(visible: boolean) {
    if (tabBarRef.current) {
        tabBarRef.current.setVisibility(visible);
    }
}
