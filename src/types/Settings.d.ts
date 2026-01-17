interface SettingsItem {
    title: string;
    type: "language" | "cache";
}

interface SettingsSection {
    title: string;
    icon?: string;
    items: SettingsItem[];
}

interface Settings {
    sections: SettingsSection[];
}
