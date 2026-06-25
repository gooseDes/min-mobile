import type { Spec } from "./NativeHapticsModule";

const webStub: Spec = {
    vibrate: () => console.warn("Ignoring vibration"),
    vibrateEffect: () => console.warn("Ignoring vibration"),
};

export default webStub;
