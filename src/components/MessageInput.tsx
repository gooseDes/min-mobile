import { Colors, Constants } from "@/Style";
import { t } from "@/Translation";
import { useState } from "react";
import { StyleProp, StyleSheet, TextInput, View, ViewStyle } from "react-native";
import Animated, { ZoomIn, ZoomOut } from "react-native-reanimated";
import IconButton from "./IconButton";

const styles = StyleSheet.create({
    container: {
        width: "100%",
        height: 50,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "row",
        borderWidth: Constants.borderWidth,
        borderColor: Colors.borderColor,
        borderRadius: Constants.rounding,
        backgroundColor: Colors.backgroundPanelColor,
    },
    input: {
        flex: 1,
        width: "100%",
        height: "100%",
        paddingHorizontal: 16,
        color: Colors.primaryTextColor,
    },
    sendButton: {
        aspectRatio: 1,
        height: "100%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
    },
});

interface MessageInputProps {
    onTextChanged?: (text: string) => void;
    onSend?: (text: string) => void;
    style?: StyleProp<ViewStyle>;
}

function MessageInput(props: MessageInputProps) {
    const [value, setValue] = useState<string>("");

    function onChangeText(text: string) {
        setValue(text);
        props.onTextChanged?.(text);
    }

    function onSend() {
        props.onSend?.(value);
        setValue("");
    }

    return (
        <Animated.View
            entering={ZoomIn}
            exiting={ZoomOut}
            layout={Constants.layoutTransition}
            style={[styles.container, props.style]}
        >
            <TextInput
                style={styles.input}
                placeholder={t.your_message}
                multiline={true}
                onChangeText={onChangeText}
                value={value}
            />
            <View style={styles.sendButton}>
                <IconButton icon="paper-plane" onPress={onSend} />
            </View>
        </Animated.View>
    );
}

export default MessageInput;
