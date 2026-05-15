import { useThemeStore } from "@/Style";
import { setAlphaForColor } from "@/Utils";
import { Pressable, PressableProps } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";
import { SpringConfig } from "react-native-reanimated/lib/typescript/animation/spring";

export interface PressableWithEffectProps extends PressableProps {
    scaleWhenPressed?: number;
}

function PressableWithEffect(props: PressableWithEffectProps) {
    const { children, onPressIn, onPressOut, scaleWhenPressed = 0.8, ...rest } = props;
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
                {...rest}
            >
                {children}
            </Pressable>
        </Animated.View>
    );
}

export default PressableWithEffect;
