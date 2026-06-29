import { ExpoRoot } from "expo-router";
import { AppRegistry } from "react-native";
import { name as appName } from "./app.json";

export function App() {
    const ctx = require.context("./src/app");
    return <ExpoRoot context={ctx} />;
}

AppRegistry.registerComponent(appName, () => App);

AppRegistry.runApplication(appName, {
    initialProps: {},
    rootTag: document.getElementById("root"),
});
