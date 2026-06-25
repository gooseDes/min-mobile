import { useEffect, useState } from "react";
import { createMMKV } from "react-native-mmkv";

export const Storage = createMMKV({
    id: "min-mobile-storage",
    readOnly: false,
});

export function useStorage<T>(key: string, defaultValue: T) {
    let now = defaultValue;
    if (typeof defaultValue === "string") {
        now = (Storage.getString(key) || defaultValue) as T;
    } else if (typeof defaultValue === "number") {
        now = (Storage.getNumber(key) || defaultValue) as T;
    } else if (typeof defaultValue === "boolean") {
        now = (Storage.getBoolean(key) || defaultValue) as T;
    } else {
        now = (Storage.getString(key) || defaultValue) as T;
    }
    const [value, setValue] = useState<T>(now);

    useEffect(() => {
        const handleValueChange = (changed_key: string) => {
            if (key === changed_key) {
                if (typeof defaultValue === "string") {
                    setValue((Storage.getString(key) || defaultValue) as T);
                } else if (typeof defaultValue === "number") {
                    setValue((Storage.getNumber(key) || defaultValue) as T);
                } else if (typeof defaultValue === "boolean") {
                    setValue((Storage.getBoolean(key) || defaultValue) as T);
                } else {
                    setValue((Storage.getString(key) || defaultValue) as T);
                }
            }
        };

        const listener = Storage.addOnValueChangedListener(handleValueChange);

        return () => {
            try {
                listener.remove();
            } catch {}
        };
    }, []);

    return [value, setValue] as const;
}

export default Storage;
