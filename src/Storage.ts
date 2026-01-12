import { createMMKV } from "react-native-mmkv";

export const Storage = createMMKV({
    id: "min-mobile-storage",
    readOnly: false,
});

export const Keys = {
    language: "language",
    channelId: "channelId",
};

export default Storage;
