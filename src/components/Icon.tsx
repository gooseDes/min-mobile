import { default as FontAwesomeIcon } from "react-native-vector-icons/FontAwesome6";

interface IconProps {
    name: string;
    size?: number;
    color?: string;
}

function Icon(props: IconProps) {
    return <FontAwesomeIcon name={props.name} size={props.size} color={props.color} />;
}

export default Icon;
