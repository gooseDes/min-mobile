import { ThemeData, useAppStyles } from "@/Style";
import FastImage from "@d11/react-native-fast-image";
import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import { StyleSheet, useWindowDimensions } from "react-native";
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import { runOnJS } from "react-native-worklets";

export interface ImageOverlayHandler {
    setImage: (uri: string) => void;
    setAnimateFrom: (rect?: Rect) => void;
    setOnShow: (onShow?: (isShown: boolean) => void) => void;
    close: () => void;
}

export interface ImageOverlayProps {}

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
        imageContainer: {
            position: "absolute",
            borderRadius: 8,
            overflow: "hidden",
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
    const styles = useAppStyles(createStyles);

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
        },
    }));

    const left = useSharedValue<number>(animateFrom?.x ?? 0);
    const top = useSharedValue<number>(animateFrom?.y ?? 0);
    const width = useSharedValue<number>(animateFrom?.width ?? 0);
    const height = useSharedValue<number>(animateFrom?.height ?? 0);

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

    const animatedStyle = useAnimatedStyle(() => ({
        left: left.value,
        top: top.value,
        width: width.value,
        height: height.value,
    }));

    const timingConfig = {
        duration: 200,
        easing: Easing.inOut(Easing.ease),
    };

    return (
        <Animated.View style={[styles.container, { pointerEvents: isBlockingInput ? "auto" : "none" }]}>
            <Animated.View
                style={[styles.imageContainer, animatedStyle, { opacity: isShown ? 1 : 0, transition: "opacity 0.1s" }]}
            >
                <FastImage
                    source={{ uri: image }}
                    style={{ width: "100%", height: "100%" }}
                    onLoad={e => {
                        if (animateOnLoad.current) {
                            const event = e.nativeEvent;
                            setTimeout(() => {
                                const ratio = event.width / event.height;
                                const imageWidth = screenWidth;
                                const imageHeight = screenWidth / ratio;
                                if (screenWidth > screenHeight) {
                                    height.value = withTiming(imageHeight, timingConfig);
                                    width.value = withTiming(imageWidth, timingConfig);
                                } else {
                                    height.value = withTiming(imageHeight, timingConfig);
                                    width.value = withTiming(imageWidth, timingConfig);
                                }
                                left.value = withTiming(0, timingConfig);
                                top.value = withTiming(screenHeight / 2 - imageHeight / 2, timingConfig);
                                animateOnLoad.current = false;
                                if (doOnShow.current) doOnShow.current(true);
                            }, 100);
                        }
                    }}
                    resizeMode="stretch"
                />
            </Animated.View>
        </Animated.View>
    );
});

export default ImageOverlay;
