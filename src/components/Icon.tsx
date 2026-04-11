import { Constants } from "@/Style";
import { StyleProp, TextStyle } from "react-native";
import Animated, { AnimatedStyle, EntryOrExitLayoutType } from "react-native-reanimated";
import { default as FontAwesomeIcon } from "react-native-vector-icons/FontAwesome6";

export interface IconProps {
    name: string;
    size?: number;
    color?: string;
    style?: StyleProp<TextStyle>;
}

function Icon(props: IconProps) {
    return <FontAwesomeIcon name={props.name} size={props.size} color={props.color} style={props.style} />;
}

export interface AnimatedIconProps extends IconProps {
    entering?: EntryOrExitLayoutType;
    exiting?: EntryOrExitLayoutType;
    containerStyle?: AnimatedStyle;
}

export function AnimatedIcon(props: AnimatedIconProps) {
    const { name, size, color, style, entering, exiting, containerStyle } = props;

    return (
        <Animated.View
            key={`animated_icon_${name}`}
            entering={entering}
            exiting={exiting}
            layout={Constants.layoutTransition}
            style={containerStyle}
        >
            <FontAwesomeIcon name={name} size={size} color={color} style={style} />
        </Animated.View>
    );
}

export default Icon;
