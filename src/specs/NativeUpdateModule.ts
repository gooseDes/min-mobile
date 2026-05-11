import type { TurboModule } from "react-native";
import { TurboModuleRegistry } from "react-native";

export interface Spec extends TurboModule {
    downloadAndInstall(url: string): void;
    addListener(eventName: string): void;
    removeListeners(count: number): void;
}

export default TurboModuleRegistry.get<Spec>("UpdateModule");
