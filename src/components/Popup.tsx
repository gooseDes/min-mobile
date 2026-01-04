import { forwardRef, useImperativeHandle, useState } from "react";
import { Text, View, ViewProps } from "react-native";
import Animated from "react-native-reanimated";

export interface PopupHandle {
    show: () => void;
    hide: () => void;
}

export interface PopupProps extends ViewProps {
    title?: string;
}

const Popup = forwardRef<PopupHandle, PopupProps>((props, ref) => {
    const { title = "Popup", children, ...rest } = props;

    const [visible, setVisible] = useState<boolean>(false);

    useImperativeHandle(ref, () => ({
        show: () => setVisible(true),
        hide: () => setVisible(false),
    }));

    return (
        <Animated.View>
            {visible && (
                <View {...rest}>
                    <Text>{title}</Text>
                    <View>{children}</View>
                </View>
            )}
        </Animated.View>
    );
});

export default Popup;
