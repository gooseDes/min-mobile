import { Constants, ThemeData, useAppStyles, useThemeStore } from "@/Style";
import { useState } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import Animated from "react-native-reanimated";

export interface SwitchProps {
    checked?: boolean;
    onChange?: (checked: boolean) => void;
}

const createStyles = (theme: ThemeData) =>
    StyleSheet.create({
        touchable: {
            width: 80,
            height: 40,
        },
        switchBg: {
            flex: 1,
            backgroundColor: theme.backgroundPanelColor,
            borderRadius: 25,
            borderWidth: Constants.borderWidth,
            borderColor: theme.borderColor,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
        },
        switchThumb: {
            width: 30,
            height: 30,
            borderRadius: 15,
        },
    });

function Switch(props: SwitchProps) {
    const { checked = false, onChange } = props;

    const [isChecked, setIsChecked] = useState<boolean>(checked);
    const [isPressing, setIsPressing] = useState<boolean>(false);
    const theme = useThemeStore(s => s.theme);
    const styles = useAppStyles(createStyles);

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
                            backgroundColor: isChecked ? theme.primaryTextColor : theme.secondaryTextColor,
                            transform: [{ translateX: isPressing ? 0 : isChecked ? 19 : -19 }],
                        },
                    ]}
                />
            </View>
        </TouchableOpacity>
    );
}

export default Switch;
