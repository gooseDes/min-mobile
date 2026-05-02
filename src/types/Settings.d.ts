interface SettingsItem {
    title?: string;
    type: "language" | "cache" | "switch" | "custom";
    storageKey?: string;
    component?: React.ComponentType<any>;
}

interface SettingsSection {
    title: string;
    icon?: string;
    items: SettingsItem[];
}

interface Settings {
    sections: SettingsSection[];
}
