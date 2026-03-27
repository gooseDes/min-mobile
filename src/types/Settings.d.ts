interface SettingsItem {
    title: string;
    type: "language" | "cache" | "switch";
    storageKey?: string;
}

interface SettingsSection {
    title: string;
    icon?: string;
    items: SettingsItem[];
}

interface Settings {
    sections: SettingsSection[];
}
