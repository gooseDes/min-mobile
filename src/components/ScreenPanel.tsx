import { createGlobalStyles, ThemeData, useAppStyles } from "@/style";
import React, { ComponentProps, useEffect, useState } from "react";
import { StyleProp, StyleSheet, useWindowDimensions, View, ViewStyle } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export interface ScreenPanelProps extends ComponentProps<typeof View> {
    panelStyle?: StyleProp<ViewStyle>;
    setSize?: React.Dispatch<React.SetStateAction<Size>>;
    insidePanel?: boolean;
}

const createStyles = (_theme: ThemeData) =>
    StyleSheet.create({
        container: {
            flex: 1,
        },
        sizedContainer: {
            position: "absolute",
        },
    });

function ScreenPanel(props: ScreenPanelProps) {
    const { style, onLayout, children, panelStyle, setSize, insidePanel = true, ...rest } = props;

    const { width: screenWidth, height: screenHeight } = useWindowDimensions();
    const [containerSize, setContainerSize] = useState<Size>({ width: screenWidth, height: screenHeight });
    const [insideContainerSize, setInsideContainerSize] = useState<Size>({ width: screenWidth, height: screenHeight });

    const Styles = useAppStyles(createGlobalStyles);
    const styles = useAppStyles(createStyles);
    const insets = useSafeAreaInsets();

    useEffect(() => {
        const width = containerSize.width - Styles.container.paddingHorizontal * 2 - insets.left - insets.right;
        const height = containerSize.height - Styles.container.paddingVertical * 2 - insets.top - insets.bottom;
        setInsideContainerSize({ width, height });
        setSize?.({ width, height });
    }, [containerSize, insets]);

    return (
        <View
            style={[styles.container, style]}
            onLayout={e => {
                onLayout?.(e);
                setContainerSize({ width: e.nativeEvent.layout.width, height: e.nativeEvent.layout.height });
                setInsideContainerSize({
                    width: e.nativeEvent.layout.width - Styles.container.paddingHorizontal * 2,
                    height: e.nativeEvent.layout.height - Styles.container.paddingVertical * 2,
                });
            }}
            {...rest}
        >
            {insidePanel && (
                <View
                    style={[
                        Styles.bgPanel,
                        styles.sizedContainer,
                        panelStyle,
                        {
                            left: insets.left + Styles.container.paddingHorizontal,
                            top: insets.top + Styles.container.paddingVertical,
                            ...insideContainerSize,
                        },
                    ]}
                >
                    {children}
                </View>
            )}
            {!insidePanel && children}
        </View>
    );
}

export default ScreenPanel;
