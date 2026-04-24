import { forwardRef, useImperativeHandle, useState } from "react";
import { Pressable, StyleSheet } from "react-native";

const styles = StyleSheet.create({
    pressableOverlay: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: "100%",
        height: "100%",
    },
});

export interface PressableOverlayProps {}

export interface PressableOverlayHandler {
    interceptNextClick: (callback: () => void) => void;
    cancelClickInterception: () => void;
}

const PressableOverlay = forwardRef<PressableOverlayHandler, PressableOverlayProps>((_props, ref) => {
    const [interceptNextClick, setInterceptNextClick] = useState<boolean>(false);
    const [onPress, setOnPress] = useState<(() => void) | null>(null);

    useImperativeHandle(ref, () => ({
        interceptNextClick: (callback: () => void) => {
            setInterceptNextClick(true);
            setOnPress(callback);
        },
        cancelClickInterception: () => {
            setInterceptNextClick(false);
            setOnPress(null);
        },
    }));

    function handleClick() {
        if (interceptNextClick && onPress) {
            setInterceptNextClick(false);
            onPress();
            setOnPress(null);
        }
    }

    return (
        <Pressable
            style={[styles.pressableOverlay, { pointerEvents: interceptNextClick ? "auto" : "none" }]}
            onPress={handleClick}
        />
    );
});

export default PressableOverlay;
