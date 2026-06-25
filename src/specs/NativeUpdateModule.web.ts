import type { Spec } from "./NativeUpdateModule";

const webStub: Spec = {
    downloadAndInstall: () => console.warn("Ignoring update"),
    addListener: () => {},
    removeListeners: () => {},
};

export default webStub;
