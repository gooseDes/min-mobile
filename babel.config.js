module.exports = {
    presets: ["module:@react-native/babel-preset"],
    plugins: [
        [
            "module-resolver",
            {
                root: ["./src"],
                alias: {
                    "@components": "./src/components",
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
    ],
};
