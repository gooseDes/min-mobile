import { Constants, createGlobalStyles, ThemeData, useAppStyles, useThemeStore } from "@/style";
import { setAlphaForColor } from "@/utils";
import { useEffect, useRef, useState } from "react";
import { StyleSheet, View } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withSpring, ZoomIn, ZoomOut } from "react-native-reanimated";
import PressableWithEffect from "./PressableWithEffect";

export interface FlatSelectorProps {
    options: (string | undefined)[];
    onSelect?: (option: string | undefined, index?: number) => void;
}

const createStyles = (theme: ThemeData) =>
    StyleSheet.create({
        container: {
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            flexDirection: "row",
            gap: 8,
            width: "auto",
            height: "auto",
            borderRadius: 999,
            padding: 8,
            alignSelf: "center",
        },
        option: {
            margin: 0,
            padding: 0,
        },
        selectIndicatorContainer: {
            position: "absolute",
            left: 0,
            top: 0,
            zIndex: 5,
        },
        selectIndicator: {
            backgroundColor: setAlphaForColor(theme.rippleColor, 0.1),
            pointerEvents: "none",
            borderRadius: 999,
        },
    });

function FlatSelector(props: FlatSelectorProps) {
    const { options, onSelect } = props;

    const theme = useThemeStore(s => s.theme);
    const styles = useAppStyles(createStyles);
    const Styles = useAppStyles(createGlobalStyles);
    const [selectedIndex, setSelectedIndex] = useState<number>(0);
    const optionRefs = useRef<(View | null)[]>([]);

    const indicatorX = useSharedValue<number>(0);
    const indicatorY = useSharedValue<number>(0);
    const indicatorWidth = useSharedValue<number>(0);
    const indicatorHeight = useSharedValue<number>(0);

    function updateIndicatorPosition() {
        optionRefs.current[selectedIndex]?.measure((x, y, width, height) => {
            indicatorX.value = withSpring(x - 6);
            indicatorY.value = withSpring(y - 6);
            indicatorWidth.value = width + 8;
            indicatorHeight.value = height + 8;
        });
    }

    useEffect(() => {
        updateIndicatorPosition();
    }, [selectedIndex]);

    function handleOptionClick(option: string | undefined, index: number) {
        setSelectedIndex(index);
        onSelect?.(option, index);
    }

    const indicatorAnimatedStyle = useAnimatedStyle(() => ({
        width: indicatorWidth.value,
        height: indicatorHeight.value,
        transform: [{ translateX: indicatorX.value }, { translateY: indicatorY.value }],
    }));

    return (
        <View style={[Styles.panel, styles.container]}>
            {options.map((option, index) => (
                <View
                    key={index}
                    ref={ref => {
                        optionRefs.current[index] = ref;
                    }}
                    onLayout={() => updateIndicatorPosition()}
                >
                    <PressableWithEffect onPress={() => handleOptionClick(option, index)}>
                        <Animated.Text
                            style={[
                                styles.option,
                                { color: index === selectedIndex ? theme.primaryTextColor : theme.secondaryTextColor },
                            ]}
                        >
                            {option}
                        </Animated.Text>
                    </PressableWithEffect>
                </View>
            ))}
            <Animated.View
                style={styles.selectIndicatorContainer}
                layout={Constants.layoutTransition}
                entering={ZoomIn}
                exiting={ZoomOut}
            >
                <Animated.View style={[styles.selectIndicator, indicatorAnimatedStyle]} />
            </Animated.View>
        </View>
    );
}

export default FlatSelector;
