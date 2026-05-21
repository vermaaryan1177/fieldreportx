const path = require("path");
const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

// @mediapipe/pose is required by the BlazePose detector inside
// @tensorflow-models/pose-detection but is web-only. Shim it out so Metro
// doesn't crash when bundling — we only use MoveNet which has no such dep.
const _resolveRequest = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
    const WEB_ONLY_MODULES = [
        "@mediapipe/pose",
        "@tensorflow/tfjs-backend-webgpu",
        "react-native-fs",
    ];
    if (WEB_ONLY_MODULES.includes(moduleName)) {
        return {
            filePath: path.resolve(__dirname, "lib/emptyModule.js"),
            type: "sourceFile",
        };
    }
    return _resolveRequest
        ? _resolveRequest(context, moduleName, platform)
        : context.resolveRequest(context, moduleName, platform);
};

module.exports = withNativeWind(config, { input: "./app/global.css" });
