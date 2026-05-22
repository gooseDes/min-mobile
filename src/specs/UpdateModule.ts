import { t } from "@/Translation";
import { NativeEventEmitter, NativeModules } from "react-native";
import NativeUpdateModule from "./NativeUpdateModule";

export type DownloadStatus = "started" | "downloading" | "completed" | "installing" | "error";

export interface DownloadProgressEvent {
    progress: number;
    status: DownloadStatus;
}

type ModuleEvents = {
    onDownloadProgress: (event: DownloadProgressEvent) => void;
};

class UpdateModuleEmitter extends NativeEventEmitter {
    addListener<K extends keyof ModuleEvents>(eventType: K, listener: ModuleEvents[K]) {
        return super.addListener(eventType as string, listener);
    }
}

const emitter = new UpdateModuleEmitter(NativeModules.UpdateModule);

export const UpdateModule = {
    downloadAndInstall: (url: string) => {
        NativeUpdateModule?.downloadAndInstall(url, t.download_completed, t.tap_to_install);
    },
    addListener: <K extends keyof ModuleEvents>(event: K, listener: ModuleEvents[K]) => {
        return emitter.addListener(event, listener);
    },
};
