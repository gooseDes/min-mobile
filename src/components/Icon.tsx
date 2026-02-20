import { StyleProp, TextStyle } from "react-native";
import { default as FontAwesomeIcon } from "react-native-vector-icons/FontAwesome6";

interface IconProps {
    name: string;
    size?: number;
    color?: string;
    style?: StyleProp<TextStyle>;
}

function Icon(props: IconProps) {
    return <FontAwesomeIcon name={props.name} size={props.size} color={props.color} style={props.style} />;
}

export default Icon;
