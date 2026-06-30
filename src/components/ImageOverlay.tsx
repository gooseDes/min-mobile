import { createGlobalStyles, ThemeData, useAppStyles, useThemeStore } from "@/style";
import { saveImageToGallery } from "@/utils";
import { vibrateEffect } from "@specs/HapticsModule";
import { Image } from "expo-image";
import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import { StyleSheet, useWindowDimensions } from "react-native";
import { GestureDetector, usePanGesture, usePinchGesture, useSimultaneousGestures } from "react-native-gesture-handler";
import Animated, {
    clamp,
    Easing,
    FadeIn,
    FadeOut,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { runOnJS } from "react-native-worklets";
import Icon from "./Icon";
import IconButton from "./IconButton";

export interface ImageOverlayHandler {
    setImage: (uri: string) => void;
    setAnimateFrom: (rect?: Rect) => void;
    setOnShow: (onShow?: (isShown: boolean) => void) => void;
    close: () => void;
}

export interface ImageOverlayProps {}

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
        },
        imageContainer: {
            position: "absolute",
            borderRadius: 8,
            overflow: "hidden",
        },
        panel: {
            height: 60,
            overflow: "hidden",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
        },
        saveIcon: {
            position: "absolute",
            pointerEvents: "none",
            backgroundColor: theme.backgroundColor,
            aspectRatio: 1,
            padding: 16,
            borderRadius: theme.rounding,
        },
    });

const ImageOverlay = forwardRef<ImageOverlayHandler, ImageOverlayProps>((_props, ref) => {
    const [isShown, setIsShown] = useState<boolean>(false);
    const [isBlockingInput, setIsBlockingInput] = useState<boolean>(false);
    const [image, setImage] = useState<string>("");
    const [animateFrom, setAnimateFrom] = useState<Rect | undefined>(undefined);
    const doOnShow = useRef<((isShown: boolean) => void) | undefined>(undefined);
    const animateOnLoad = useRef<boolean>(false);
    const { width: screenWidth, height: screenHeight } = useWindowDimensions();
    const insets = useSafeAreaInsets();
    const theme = useThemeStore(s => s.theme);
    const styles = useAppStyles(createStyles);
    const Styles = useAppStyles(createGlobalStyles);

    useImperativeHandle(ref, () => ({
        setImage: (uri: string) => {
            setImage(uri);
            setIsShown(!!uri);
        },
        setAnimateFrom: (rect?: Rect) => setAnimateFrom(rect),
        setOnShow: (onShow?: (isShown: boolean) => void) => {
            doOnShow.current = onShow;
        },
        close: () => {
            setIsBlockingInput(false);
            const onAnimationEnd = () => {
                if (doOnShow.current) doOnShow.current(false);
                setIsShown(false);
                setTimeout(() => setImage(""), 100);
            };
            left.value = withTiming(animateFrom?.x ?? 0, timingConfig);
            top.value = withTiming(animateFrom?.y ?? 0, timingConfig);
            width.value = withTiming(animateFrom?.width ?? 0, timingConfig);
            height.value = withTiming(animateFrom?.height ?? 0, timingConfig, () => runOnJS(onAnimationEnd)());
            scale.value = withTiming(1, timingConfig);
            translateX.value = withTiming(0, timingConfig);
            translateY.value = withTiming(0, timingConfig);
            savedScale.value = 1;
            savedTranslateX.value = 0;
            savedTranslateY.value = 0;
        },
    }));

    useEffect(() => {
        if (image) {
            left.value = animateFrom?.x ?? 0;
            top.value = animateFrom?.y ?? 0;
            width.value = animateFrom?.width ?? 0;
            height.value = animateFrom?.height ?? 0;
            animateOnLoad.current = true;
            setTimeout(() => setIsShown(true), 0);
            setIsBlockingInput(true);
        } else {
            setIsShown(false);
            setIsBlockingInput(false);
        }
    }, [image]);

    const left = useSharedValue<number>(animateFrom?.x ?? 0);
    const top = useSharedValue<number>(animateFrom?.y ?? 0);
    const width = useSharedValue<number>(animateFrom?.width ?? 0);
    const height = useSharedValue<number>(animateFrom?.height ?? 0);
    const scale = useSharedValue<number>(1);
    const savedScale = useSharedValue<number>(1);
    const translateX = useSharedValue<number>(0);
    const savedTranslateX = useSharedValue<number>(0);
    const translateY = useSharedValue<number>(0);
    const savedTranslateY = useSharedValue<number>(0);

    const animatedStyle = useAnimatedStyle(() => ({
        left: left.value,
        top: top.value,
        width: width.value,
        height: height.value,
        transform: [{ scale: scale.value }, { translateX: translateX.value }, { translateY: translateY.value }],
    }));

    const timingConfig = {
        duration: 200,
        easing: Easing.inOut(Easing.ease),
    };

    const zoomGesture = usePinchGesture({
        onUpdate: e => {
            scale.value = clamp(savedScale.value * e.scale, 0.5, 25);
        },
        onFinalize: () => {
            savedScale.value = scale.value;
        },
    });

    const moveGesture = usePanGesture({
        maxPointers: 1,
        onUpdate: e => {
            translateX.value = Math.min(savedTranslateX.value + e.translationX / scale.value, screenWidth);
            translateY.value = Math.min(savedTranslateY.value + e.translationY / scale.value, screenHeight);
        },
        onFinalize: () => {
            savedTranslateX.value = translateX.value;
            savedTranslateY.value = translateY.value;
        },
    });

    const gesture = useSimultaneousGestures(zoomGesture, moveGesture);

    const playSaveAnimation = () => {
        saveAnimOpacity.value = 0;
        saveAnimBlur.value = 8;
        saveAnimScale.value = 3;
        saveAnimTranslateX.value = 0;
        saveAnimTranslateY.value = 0;

        vibrateEffect("slow_rise");
        saveAnimOpacity.value = withSpring(1);
        saveAnimBlur.value = withSpring(0);
        saveAnimScale.value = withSpring(1);
        saveAnimTranslateX.value = withSpring(0);
        saveAnimTranslateY.value = withSpring(0);

        setTimeout(() => {
            vibrateEffect("quick_fall");
            saveAnimOpacity.value = withTiming(0, { duration: 300, easing: Easing.cubic });
            saveAnimBlur.value = withSpring(0);
            saveAnimScale.value = withSpring(1);
            saveAnimTranslateX.value = withSpring(0);
            saveAnimTranslateY.value = withTiming(screenHeight / 2, { duration: 300, easing: Easing.in(Easing.cubic) });
        }, 1000);
    };

    const saveAnimOpacity = useSharedValue<number>(0);
    const saveAnimBlur = useSharedValue<number>(8);
    const saveAnimScale = useSharedValue<number>(3);
    const saveAnimTranslateX = useSharedValue<number>(0);
    const saveAnimTranslateY = useSharedValue<number>(0);

    const saveAnimatedStyle = useAnimatedStyle(() => ({
        opacity: saveAnimOpacity.value,
        filter: `blur(${saveAnimBlur.value}px)`,
        transform: [
            { scale: saveAnimScale.value },
            { translateX: saveAnimTranslateX.value },
            { translateY: saveAnimTranslateY.value },
        ],
    }));

    return (
        <Animated.View style={[styles.container, { pointerEvents: isBlockingInput ? "auto" : "none" }]}>
            <GestureDetector gesture={gesture}>
                <Animated.View
                    style={[styles.imageContainer, animatedStyle, { opacity: isShown ? 1 : 0, transition: "opacity 0.1s" }]}
                >
                    <Image
                        source={{ uri: image }}
                        style={{ width: "100%", height: "100%" }}
                        onLoad={e => {
                            if (animateOnLoad.current) {
                                const src = e.source;
                                setTimeout(() => {
                                    const ratio = src.width / src.height;
                                    const imageWidth = screenWidth - Styles.container.paddingHorizontal;
                                    const imageHeight = screenWidth / ratio - Styles.container.paddingVertical;
                                    if (screenWidth > screenHeight) {
                                        height.value = withTiming(imageHeight, timingConfig);
                                        width.value = withTiming(imageWidth, timingConfig);
                                    } else {
                                        height.value = withTiming(imageHeight, timingConfig);
                                        width.value = withTiming(imageWidth, timingConfig);
                                    }
                                    left.value = withTiming(screenWidth / 2 - imageWidth / 2, timingConfig);
                                    top.value = withTiming(screenHeight / 2 - imageHeight / 2, timingConfig);
                                    animateOnLoad.current = false;
                                    if (doOnShow.current) doOnShow.current(true);
                                }, 100);
                            }
                        }}
                        contentFit="contain"
                    />
                </Animated.View>
            </GestureDetector>

            {isShown && (
                <Animated.View
                    entering={FadeIn}
                    exiting={FadeOut}
                    style={[
                        Styles.panel,
                        styles.panel,
                        { bottom: -screenHeight / 2 + styles.panel.height / 2 + 8 + insets.bottom, width: screenWidth - 16 },
                    ]}
                >
                    <IconButton
                        icon="download"
                        style={{ flex: 1, aspectRatio: 1 }}
                        onPress={() => {
                            saveImageToGallery(image);
                            playSaveAnimation();
                        }}
                    />
                </Animated.View>
            )}

            <Animated.View style={[styles.saveIcon, saveAnimatedStyle]}>
                <Icon name="download" size={48} color={theme.accentColor} />
            </Animated.View>
        </Animated.View>
    );
});

export default ImageOverlay;
