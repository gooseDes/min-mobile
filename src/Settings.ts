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
    ],
};

export default settings;
