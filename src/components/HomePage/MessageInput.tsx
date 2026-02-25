import { Colors, Constants } from "@/Style";
import { useTranslation } from "@/TranslationContext";
import Icon from "@components/Icon";
import SurelyAnimatedView from "@components/SurelyAnimatedView";
import { BlurView } from "@danielsaraldi/react-native-blur-view";
import { forwardRef, useState } from "react";
import { StyleProp, StyleSheet, TextInput, TouchableOpacity, View, ViewStyle } from "react-native";
import Animated, { SlideInDown, SlideOutDown } from "react-native-reanimated";

const styles = StyleSheet.create({
    container: {
        width: "100%",
        height: 50,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
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
        overflow: "hidden",
        marginRight: 10,
    },
    actualContent: {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "row",
        flex: 1,
    },
});

export interface MessageInputProps {
    onTextChanged?: (text: string) => void;
    onSend?: (text: string) => void;
    style?: StyleProp<ViewStyle>;
}

export interface MessageInputHandle {}

const MessageInput = forwardRef<MessageInputHandle, MessageInputProps>((props, _ref) => {
    const { t } = useTranslation();
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
        <SurelyAnimatedView
            style={props.style}
            entering={SlideInDown}
            exiting={SlideOutDown}
            layout={Constants.layoutTransition}
        >
            <Animated.View style={styles.container}>
                <BlurView style={StyleSheet.absoluteFill} targetId="chat-blur-target" type="dark" />
                <View style={[StyleSheet.absoluteFill, styles.actualContent]}>
                    <TextInput
                        style={styles.input}
                        placeholder={t.your_message}
                        placeholderTextColor={Colors.secondaryTextColor}
                        multiline={true}
                        onChangeText={onChangeText}
                        value={value}
                    />
                    <View style={styles.sendButton}>
                        <TouchableOpacity onPress={onSend}>
                            <Icon name="paper-plane" size={24} color={Colors.primaryTextColor} />
                        </TouchableOpacity>
                    </View>
                </View>
            </Animated.View>
        </SurelyAnimatedView>
    );
});

export default MessageInput;
