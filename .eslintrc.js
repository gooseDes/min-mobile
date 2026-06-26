module.exports = {
    extends: "@react-native",
    rules: {
        "react-native/no-inline-styles": "off",
        "react-hooks/exhaustive-deps": "off",
        "@typescript-eslint/no-unused-vars": [
            "error",
            {
                varsIgnorePattern: "^_",
                argsIgnorePattern: "^_",
                caughtErrorsIgnorePattern: "^_",
                destructuredArrayIgnorePattern: "^_",
            },
        ],
    },
};
