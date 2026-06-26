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
                        "@app": "./src/app",
                        "@components": "./src/components",
                        "@types": "./src/types",
                        "@services": "./src/services",
                        "@db": "./src/db",
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
