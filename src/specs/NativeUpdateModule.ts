import type { TurboModule } from "react-native";
import { TurboModuleRegistry } from "react-native";

export interface Spec extends TurboModule {
    downloadAndInstall(url: string): void;
}

export default TurboModuleRegistry.get<Spec>("UpdateModule");
