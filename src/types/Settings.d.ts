interface SettingsItem {
    title?: string;
    type: "language" | "cache" | "switch" | "custom" | "button";
    storageKey?: string;
    component?: React.ComponentType<any>;
    onPress?: () => void;
}

interface SettingsSection {
    title: string;
    icon?: string;
    items: SettingsItem[];
}

interface Settings {
    sections: SettingsSection[];
}
