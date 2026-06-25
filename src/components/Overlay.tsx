import { Constants, createGlobalStyles, ThemeData, useAppStyles, useThemeStore } from "@/style";
import { setAlphaForColor } from "@/utils";
import { useTranslation } from "@contexts/TranslationContext";
import { forwardRef, useEffect, useImperativeHandle, useState } from "react";
import { StyleSheet } from "react-native";
import Animated, {
    Easing,
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withTiming,
    ZoomIn,
    ZoomOut,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Icon from "./Icon";
import ProgressBar from "./ProgressBar";

const createStyles = (_theme: ThemeData) =>
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
    const [downloadTextEnabled, setDownloadTextEnabled] = useState<boolean>(true);
    const insets = useSafeAreaInsets();
    const theme = useThemeStore(s => s.theme);
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

    useEffect(() => {
        if (overlayState === "downloading") {
            setDownloadTextEnabled(true);
            setTimeout(() => setDownloadTextEnabled(false), 5000);
        }
    }, [overlayState]);

    useImperativeHandle(ref, () => ({
        setOverlay: (overlay: OverlayState) => setOverlayState(overlay),
        setProgress: (newProgress: number) => setProgress(newProgress),
    }));

    return (
        <Animated.View
            style={[
                styles.container,
                {
                    pointerEvents: overlayState === "none" || overlayState === "downloading" ? "none" : "auto",
                    opacity: overlayState === "none" ? 0 : 1,
                    backgroundColor:
                        overlayState === "downloading"
                            ? setAlphaForColor(theme.backgroundColor, 0)
                            : setAlphaForColor(theme.backgroundColor, 0.5),
                    transition: "opacity 0.3s ease-in-out, backgroundColor 0.3s ease-in-out",
                    paddingHorizontal: Styles.container.paddingHorizontal + 10 + insets.left + insets.right,
                    paddingVertical: Styles.container.paddingVertical + 10 + insets.top + insets.bottom,
                },
            ]}
        >
            {overlayState === "loading" && (
                <Animated.View entering={ZoomIn} exiting={ZoomOut}>
                    <Animated.View style={spinnerAnimatedStyle}>
                        <Icon name="arrows-rotate" size={48} color={theme.primaryTextColor} />
                    </Animated.View>
                </Animated.View>
            )}
            {overlayState === "downloading" && (
                <Animated.View
                    style={{
                        ...Styles.bgAndBorder,
                        justifyContent: "center",
                        alignItems: "center",
                        width: "100%",
                        position: "absolute",
                        top: downloadTextEnabled ? undefined : insets.top - 20,
                    }}
                    entering={ZoomIn}
                    exiting={ZoomOut}
                    layout={Constants.layoutTransition}
                >
                    {downloadTextEnabled && (
                        <Animated.Text
                            layout={Constants.layoutTransition}
                            entering={ZoomIn}
                            exiting={ZoomOut}
                            style={[Styles.primaryCenter, { fontSize: 16 }]}
                        >
                            {t.downloading_started}
                        </Animated.Text>
                    )}
                    <Animated.View style={{ width: "100%" }} layout={Constants.layoutTransition}>
                        <ProgressBar progress={progress} />
                    </Animated.View>
                </Animated.View>
            )}
        </Animated.View>
    );
});

export default Overlay;
