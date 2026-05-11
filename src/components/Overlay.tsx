import { createGlobalStyles, ThemeData, useAppStyles } from "@/Style";
import { useTranslation } from "@/TranslationContext";
import { setAlphaForColor } from "@/Utils";
import { forwardRef, useEffect, useImperativeHandle, useState } from "react";
import { StyleSheet, Text } from "react-native";
import Animated, {
    Easing,
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withTiming,
    ZoomIn,
    ZoomOut,
} from "react-native-reanimated";
import Icon from "./Icon";
import ProgressBar from "./ProgressBar";

const createStyles = (theme: ThemeData) =>
    StyleSheet.create({
        container: {
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            width: "100%",
            height: "100%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: setAlphaForColor(theme.backgroundColor, 0.5),
        },
    });

export interface OverlayHandler {
    setOverlay: (overlay: OverlayState) => void;
    setProgress: (progress: number) => void;
}

export interface OverlayProps {}

const Overlay = forwardRef<OverlayHandler, OverlayProps>((_props, ref) => {
    const [overlayState, setOverlayState] = useState<OverlayState>("none");
    const [progress, setProgress] = useState<number>(0);
    const styles = useAppStyles(createStyles);
    const Styles = useAppStyles(createGlobalStyles);
    const { t } = useTranslation();

    const spinnerRotation = useSharedValue("0deg");
    const spinnerAnimatedStyle = useAnimatedStyle(() => ({
        transform: [{ rotate: spinnerRotation.value }],
    }));

    useEffect(() => {
        spinnerRotation.value = withRepeat(
            withTiming(`${360}deg`, { duration: 1000, easing: Easing.inOut(Easing.cubic) }),
            -1,
            false,
        );
    }, []);

    useImperativeHandle(ref, () => ({
        setOverlay: (overlay: OverlayState) => setOverlayState(overlay),
        setProgress: (newProgress: number) => setProgress(newProgress),
    }));

    return (
        <Animated.View
            style={[
                styles.container,
                {
                    pointerEvents: overlayState === "none" ? "none" : "auto",
                    opacity: overlayState === "none" ? 0 : 1,
                    transition: "opacity 0.3s ease-in-out",
                },
            ]}
        >
            {overlayState === "loading" && (
                <Animated.View style={spinnerAnimatedStyle} entering={ZoomIn} exiting={ZoomOut}>
                    <Icon name="arrows-rotate" size={48} color="white" />
                </Animated.View>
            )}
            {overlayState === "downloading" && (
                <Animated.View
                    style={{ justifyContent: "center", alignItems: "center", width: 200 }}
                    entering={ZoomIn}
                    exiting={ZoomOut}
                >
                    <Text style={[Styles.primaryCenter, { fontSize: 16 }]}>{t.downloading_started}</Text>
                    <ProgressBar progress={progress} />
                </Animated.View>
            )}
        </Animated.View>
    );
});

export default Overlay;
