import { TurboModule, TurboModuleRegistry } from "react-native";

export interface Spec extends TurboModule {
    vibrate(duration: number, scale: number): void;
    vibrateEffect(type: string, scale: number): void;
}

export default TurboModuleRegistry.get<Spec>("HapticsModule");
