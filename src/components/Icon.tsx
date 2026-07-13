import { Constants } from "@/style";
import { FontAwesome6 } from "@react-native-vector-icons/fontawesome6";
import React from "react";
import { StyleProp, TextStyle } from "react-native";
import Animated, { AnimatedStyle, EntryOrExitLayoutType } from "react-native-reanimated";

export interface IconProps {
    name: string;
    size?: number;
    color?: string;
    style?: StyleProp<TextStyle>;
    iconStyle?: "regular" | "solid";
}

function Icon(props: IconProps) {
    const { name, size, color, style, iconStyle = "solid" } = props;

    return <FontAwesome6 name={name as any} iconStyle={iconStyle} size={size} color={color} style={style} />;
}

export interface AnimatedIconProps extends IconProps {
    entering?: EntryOrExitLayoutType;
    exiting?: EntryOrExitLayoutType;
    containerStyle?: AnimatedStyle | AnimatedStyle[];
    iconStyle?: "regular" | "solid";
}

export const AnimatedIcon = React.memo((props: AnimatedIconProps) => {
    const { name, size, color, style, entering, exiting, containerStyle, iconStyle = "solid" } = props;

    return (
        <Animated.View
            key={`animated_icon_${name}`}
            entering={entering}
            exiting={exiting}
            layout={Constants.layoutTransition}
            style={containerStyle}
        >
            <FontAwesome6 name={name as any} iconStyle={iconStyle} size={size} color={color} style={style} />
        </Animated.View>
    );
});

export default Icon;
