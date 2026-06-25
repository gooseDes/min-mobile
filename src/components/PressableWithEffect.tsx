import { useThemeStore } from "@/style";
import { setAlphaForColor } from "@/utils";
import { vibratePreset } from "@specs/HapticsModule";
import { Pressable, PressableProps } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";
import { SpringConfig } from "react-native-reanimated/lib/typescript/animation/spring";

export interface PressableWithEffectProps extends PressableProps {
    defaultHaptic?: boolean;
    scaleWhenPressed?: number;
}

function PressableWithEffect(props: PressableWithEffectProps) {
    const { children, onPressIn, onPressOut, onPress, scaleWhenPressed = 0.8, defaultHaptic = true, ...rest } = props;
    const theme = useThemeStore(s => s.theme);

    const backgroundColor = useSharedValue(setAlphaForColor(theme.rippleColor, 0));
    const scale = useSharedValue(1);

    const animatedStyle = useAnimatedStyle(() => ({
        backgroundColor: backgroundColor.value,
        transform: [{ scale: scale.value }],
    }));

    const springConfig: SpringConfig = { velocity: 2, damping: 50 };

    return (
        <Animated.View style={[animatedStyle, { borderRadius: theme.rounding }]}>
            <Pressable
                hitSlop={8}
                onPressIn={e => {
                    backgroundColor.value = withSpring(setAlphaForColor(theme.rippleColor, 0.2));
                    scale.value = withSpring(scaleWhenPressed, springConfig);
                    onPressIn?.(e);
                }}
                onPressOut={e => {
                    backgroundColor.value = withSpring(setAlphaForColor(theme.rippleColor, 0));
                    scale.value = withSpring(1, springConfig);
                    onPressOut?.(e);
                }}
                onPress={e => {
                    if (defaultHaptic) vibratePreset("tap");
                    onPress?.(e);
                }}
                {...rest}
            >
                {children}
            </Pressable>
        </Animated.View>
    );
}

export default PressableWithEffect;
