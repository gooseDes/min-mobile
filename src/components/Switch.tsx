import { Colors, Constants } from "@/Style";
import { useState } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import Animated from "react-native-reanimated";

export interface SwitchProps {
    checked?: boolean;
    onChange?: (checked: boolean) => void;
}

const styles = StyleSheet.create({
    touchable: {
        width: 100,
        height: 50,
    },
    switchBg: {
        flex: 1,
        backgroundColor: Colors.backgroundPanelColor,
        borderRadius: 25,
        borderWidth: Constants.borderWidth,
        borderColor: Colors.borderColor,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
    },
    switchThumb: {
        width: 35,
        height: 35,
        borderRadius: 17.5,
    },
});

function Switch(props: SwitchProps) {
    const { checked = false, onChange } = props;

    const [isChecked, setIsChecked] = useState<boolean>(checked);
    const [isPressing, setIsPressing] = useState<boolean>(false);

    return (
        <TouchableOpacity
            style={styles.touchable}
            activeOpacity={1}
            onPressIn={() => setIsPressing(true)}
            onPressOut={() => {
                onChange?.(!isChecked);
                setIsChecked(!isChecked);
                setIsPressing(false);
            }}
        >
            <View style={styles.switchBg}>
                <Animated.View
                    style={[
                        styles.switchThumb,
                        {
                            transition: "all 0.3s",
                            transitionTimingFunction: Constants.cubicBezier,
                            backgroundColor: isChecked ? Colors.primaryTextColor : Colors.secondaryTextColor,
                            transform: [{ translateX: isPressing ? 0 : isChecked ? 25 : -25 }],
                        },
                    ]}
                />
            </View>
        </TouchableOpacity>
    );
}

export default Switch;
