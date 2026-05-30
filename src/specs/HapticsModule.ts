import NativeHapticsModule from "./NativeHapticsModule";

export type HapticEffectType = "slow_rise" | "quick_rise" | "quick_fall" | "spin" | "thud";
export type PredefinedVibrateType = "tap";

export function vibrate(duration: number, scale: number): void {
    NativeHapticsModule?.vibrate(duration, scale);
}

export function vibrateEffect(type: HapticEffectType, scale?: number): void {
    NativeHapticsModule?.vibrateEffect(type, scale ?? 1);
}

export function vibratePreset(type: PredefinedVibrateType, duration?: number) {
    if (type === "tap") {
        vibrate(duration ?? 10, 0.25);
    }
}

export function vibrateEffectPreset(type: HapticEffectType) {
    vibrateEffect(type, 0.25);
}
