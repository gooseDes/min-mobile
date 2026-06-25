import { ThemeData, useAppStyles } from "@/style";
import { useEffect, useState } from "react";
import { StyleSheet, View, ViewProps } from "react-native";
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";

const createStyles = (theme: ThemeData) =>
    StyleSheet.create({
        container: {
            width: "100%",
            height: 16,
            padding: 2,
            backgroundColor: theme.backgroundColor,
            borderWidth: theme.borderWidth,
            borderColor: theme.borderColor,
            borderRadius: 999,
        },
        progress: {
            height: "100%",
            backgroundColor: theme.primaryTextColor,
            borderRadius: 999,
        },
    });

export interface ProgressBarProps extends ViewProps {
    progress: number;
}

function ProgressBar(props: ProgressBarProps) {
    const { progress, style } = props;
    const styles = useAppStyles(createStyles);

    const [componentSize, setComponentSize] = useState<Size>({ width: 0, height: 0 });

    const progressWidth = useSharedValue(0);

    const progressAnimatedStyle = useAnimatedStyle(() => ({
        width: progressWidth.value,
    }));

    useEffect(() => {
        progressWidth.value = withTiming(
            progress * (componentSize.width - (styles.container.padding + styles.container.borderWidth) * 2),
            {
                easing: Easing.inOut(Easing.cubic),
                duration: 300,
            },
        );
    }, [progress, componentSize]);

    return (
        <View
            style={[styles.container, style]}
            onLayout={event =>
                setComponentSize({ width: event.nativeEvent.layout.width, height: event.nativeEvent.layout.height })
            }
        >
            <Animated.View style={[styles.progress, progressAnimatedStyle]} />
        </View>
    );
}

export default ProgressBar;
