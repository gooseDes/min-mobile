import { forwardRef, useImperativeHandle, useState } from "react";
import { Pressable, StyleSheet } from "react-native";
import { GestureDetector, usePanGesture, useSimultaneousGestures, useTapGesture } from "react-native-gesture-handler";
import { useSharedValue } from "react-native-reanimated";

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
    const isClickIntercepted = useSharedValue<boolean>(true);

    useImperativeHandle(ref, () => ({
        interceptNextClick: (callback: () => void) => {
            setInterceptNextClick(true);
            setOnPress(callback);
            isClickIntercepted.value = false;
        },
        cancelClickInterception: () => {
            setInterceptNextClick(false);
            setOnPress(null);
        },
    }));

    function handleClick() {
        if (interceptNextClick && onPress && !isClickIntercepted.value) {
            isClickIntercepted.value = true;
            setInterceptNextClick(false);
            onPress();
            setOnPress(null);
        }
    }

    const gesture = usePanGesture({ runOnJS: true, onBegin: handleClick, enabled: interceptNextClick });
    const gesture2 = useTapGesture({ runOnJS: true, onBegin: handleClick, enabled: interceptNextClick });

    const finalGesture = useSimultaneousGestures(gesture, gesture2);

    return (
        <GestureDetector gesture={finalGesture}>
            <Pressable
                style={[styles.pressableOverlay, { pointerEvents: interceptNextClick ? "auto" : "none" }]}
                onPress={handleClick}
            />
        </GestureDetector>
    );
});

export default PressableOverlay;
