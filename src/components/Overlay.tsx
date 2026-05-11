import { createGlobalStyles, ThemeData, useAppStyles } from "@/Style";
import { useTranslation } from "@/TranslationContext";
import { setAlphaForColor } from "@/Utils";
import { forwardRef, useImperativeHandle, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated from "react-native-reanimated";
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
            {overlayState === "loading" && <Text style={[Styles.primaryBoldText, { textAlign: "center" }]}>Loading...</Text>}
            {overlayState === "downloading" && (
                <View style={{ justifyContent: "center", alignItems: "center", width: 200 }}>
                    <Text style={[Styles.primaryCenter, { fontSize: 16 }]}>{t.downloading_started}</Text>
                    <ProgressBar progress={progress} />
                </View>
            )}
        </Animated.View>
    );
});

export default Overlay;
