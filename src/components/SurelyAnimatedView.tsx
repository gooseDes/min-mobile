import { JSX, useEffect, useState } from "react";
import { StyleProp, StyleSheet, ViewStyle } from "react-native";
import Animated, {
    AnimatedStyle,
    BaseAnimationBuilder,
    EntryOrExitLayoutType,
    LayoutAnimationFunction,
} from "react-native-reanimated";

export interface SurelyAnimatedViewProps {
    entering?: EntryOrExitLayoutType;
    exiting?: EntryOrExitLayoutType;
    layout?: BaseAnimationBuilder | typeof BaseAnimationBuilder | LayoutAnimationFunction;
    style?: StyleProp<AnimatedStyle<StyleProp<ViewStyle>>>;
    children?: JSX.Element[] | JSX.Element;
}

const styles = StyleSheet.create({
    container: {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
    },
});

function SurelyAnimatedView(props: SurelyAnimatedViewProps) {
    const [forcedShow, setForcedShow] = useState<boolean>(false);
    const { style, children, entering, exiting, ...rest } = props;

    useEffect(() => {
        if (props.entering) {
            const timer = setTimeout(() => {
                setForcedShow(true);
            }, 550);
            return () => clearTimeout(timer);
        }
    }, []);

    return (
        <>
            {forcedShow && (
                <Animated.View exiting={exiting} style={[styles.container, style]} {...rest}>
                    {children}
                </Animated.View>
            )}
            {!forcedShow && (
                <Animated.View entering={entering} style={[styles.container, style]} {...rest}>
                    {children}
                </Animated.View>
            )}
        </>
    );
}

export default SurelyAnimatedView;
