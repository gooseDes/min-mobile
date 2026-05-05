module.exports = {
    presets: ["module:@react-native/babel-preset"],
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
                    "@": "./src",
                },
            },
        ],
        [
            "module:react-native-dotenv",
            {
                moduleName: "@env",
                path: ".env",
                safe: false,
                allowUndefined: true,
            },
        ],
        "react-native-worklets/plugin",
        ["inline-import", { extensions: [".sql"] }],
    ],
};
