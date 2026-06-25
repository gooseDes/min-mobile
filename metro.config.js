const { getDefaultConfig } = require("expo/metro-config");

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

config.resolver.sourceExts.push("sql");
config.resolver.sourceExts.push("wasm");
config.transformer.assetPlugins = ["expo-asset/tools/hashAssetFiles"];

config.server = {
    ...config.server,
    enhanceMiddleware: middleware => {
        return (req, res, next) => {
            res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
            res.setHeader("Cross-Origin-Embedder-Policy", "require-corp");
            return middleware(req, res, next);
        };
    },
};

module.exports = config;
