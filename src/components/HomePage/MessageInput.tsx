import { Colors, Constants } from "@/Style";
import { useTranslation } from "@/TranslationContext";
import Icon from "@components/Icon";
import { BlurView } from "@react-native-community/blur";
import { forwardRef, useImperativeHandle, useState } from "react";
import { StyleProp, StyleSheet, TextInput, TouchableOpacity, View, ViewStyle } from "react-native";
import Animated, { SlideInDown, SlideOutDown } from "react-native-reanimated";

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
        overflow: "hidden",
    },
    input: {
        flex: 1,
        width: "100%",
        height: "100%",
        paddingHorizontal: 16,
        color: Colors.primaryTextColor,
    },
    sendButton: {
        height: "100%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
    },
    blur: {
        display: "flex",
    },
    actualContent: {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "row",
        width: "100%",
    },
});

export interface MessageInputProps {
    onTextChanged?: (text: string) => void;
    onSend?: (text: string) => void;
    style?: StyleProp<ViewStyle>;
}

export interface MessageInputHandle {
    fixBlur: () => void;
}

const MessageInput = forwardRef<MessageInputHandle, MessageInputProps>((props, ref) => {
    const { t } = useTranslation();
    const [value, setValue] = useState<string>("");
    const [sendButtonAspectRatio, setSendButtonAspectRatio] = useState<number>(1);

    useImperativeHandle(ref, () => ({
        fixBlur: () => {
            // Rerendering the sendButton
            setSendButtonAspectRatio(0.9);
            setTimeout(() => {
                setSendButtonAspectRatio(1);
            }, 0);
        },
    }));

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
            entering={SlideInDown}
            exiting={SlideOutDown}
            layout={Constants.layoutTransition}
            style={[styles.container, props.style]}
        >
            <BlurView
                style={[StyleSheet.absoluteFill, styles.blur]}
                blurType="light"
                blurAmount={8}
                overlayColor="transparent"
                reducedTransparencyFallbackColor="black"
            >
                <View style={styles.actualContent}>
                    <TextInput
                        style={styles.input}
                        placeholder={t.your_message}
                        placeholderTextColor={Colors.secondaryTextColor}
                        multiline={true}
                        onChangeText={onChangeText}
                        value={value}
                    />
                    <View style={[styles.sendButton, { aspectRatio: sendButtonAspectRatio }]}>
                        <TouchableOpacity onPress={onSend}>
                            <Icon name="paper-plane" size={24} color={Colors.primaryTextColor} />
                        </TouchableOpacity>
                    </View>
                </View>
            </BlurView>
        </Animated.View>
    );
});

export default MessageInput;
