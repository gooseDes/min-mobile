module.exports = function (api) {
    api.cache(true);
    return {
        presets: ["babel-preset-expo"],
        plugins: [
            [
                "module-resolver",
                {
                    root: ["./src"],
                    alias: {
                        "@components": "./src/components",
                        "@pages": "./src/pages",
                        "@types": "./src/types",
                        "@services": "./src/services",
                        "@drizzle": "./drizzle",
                        "@specs": "./src/specs",
                        "@contexts": "./src/contexts",
                        "@": "./src",
                        "@index": "./index.js",
                    },
                },
            ],
            ["inline-import", { extensions: [".sql"] }],
        ],
    };
};
