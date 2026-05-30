import { vibratePreset } from "@specs/HapticsModule";
import { Pressable, PressableProps } from "react-native";

function HapticPressable(props: PressableProps) {
    const { onPress, children, ...rest } = props;
    return (
        <Pressable
            hitSlop={8}
            onPress={e => {
                vibratePreset("tap");
                onPress?.(e);
            }}
            {...rest}
        >
            {children}
        </Pressable>
    );
}

export default HapticPressable;
