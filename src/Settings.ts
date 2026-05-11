import ThemeSettings from "@components/Settings/ThemeSettings";
import { checkForUpdates } from "./Utils";

export const settings: Settings = {
    sections: [
        {
            title: "general",
            icon: "gear",
            items: [
                {
                    title: "cache",
                    type: "cache",
                },
                {
                    title: "check_for_updates",
                    type: "button",
                    onPress: () => checkForUpdates(),
                },
            ],
        },
        {
            title: "language_time",
            icon: "earth-americas",
            items: [
                {
                    title: "language",
                    type: "language",
                },
                {
                    title: "24_hour_time",
                    type: "switch",
                    storageKey: "use24HourTime",
                },
            ],
        },
        {
            title: "appearance",
            icon: "paintbrush",
            items: [
                {
                    type: "custom",
                    component: ThemeSettings,
                },
            ],
        },
    ],
};

export default settings;
