import Auth from "@/Auth";
import { Colors, Constants, Styles } from "@/Style";
import { useTranslation } from "@/TranslationContext";
import { setAlphaForColor } from "@/Utils";
import Icon from "@components/Icon";
import SurelyAnimatedView from "@components/SurelyAnimatedView";
import { BlurView } from "@danielsaraldi/react-native-blur-view";
import { SERVER } from "@env";
import { forwardRef, useImperativeHandle, useState } from "react";
import { Alert, StyleProp, StyleSheet, TextInput, TouchableOpacity, View, ViewStyle } from "react-native";
import { launchImageLibrary } from "react-native-image-picker";
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
        paddingHorizontal: 4,
        ...Styles.primaryText,
    },
    button: {
        height: "100%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        overflow: "hidden",
        margin: 10,
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

export interface MessageInputHandle {
    setMessagePrefix: (messagePrefix: string) => void;
}

const MessageInput = forwardRef<MessageInputHandle, MessageInputProps>((props, ref) => {
    const { t } = useTranslation();
    const [prefix, setPrefix] = useState<string>("");
    const [value, setValue] = useState<string>("");

    useImperativeHandle(ref, () => ({
        setMessagePrefix: (messagePrefix: string) => {
            setPrefix(messagePrefix);
        },
    }));

    function onChangeText(text: string) {
        setValue(text);
        props.onTextChanged?.(text);
    }

    function send() {
        props.onSend?.(prefix + value);
        setPrefix("");
        setValue("");
    }

    async function attach() {
        const result = await launchImageLibrary({ mediaType: "photo", selectionLimit: 1 });
        if (result.didCancel) return;
        if (!result.assets) return;
        const asset = result.assets[0];
        if (asset.uri && asset.fileName && asset.type) {
            const response = await fetch(`${SERVER}/attach`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${await Auth.getFromStorage("token")}`,
                },
                body: (() => {
                    const formData = new FormData();
                    formData.append("attachments", { uri: asset.uri, name: asset.fileName, type: asset.type });
                    return formData;
                })(),
            });
            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    setValue(value + " " + data.urls.map((att: string) => `![attachment](${SERVER}${att})`).join("\n"));
                } else {
                    Alert.alert("Error", data.msg);
                }
            }
        }
    }

    return (
        <SurelyAnimatedView
            style={props.style}
            entering={SlideInDown}
            exiting={SlideOutDown}
            layout={Constants.layoutTransition}
        >
            <Animated.View style={styles.container}>
                <BlurView
                    style={StyleSheet.absoluteFill}
                    targetId="chat-blur-target"
                    type="dark"
                    overlayColor={setAlphaForColor(Colors.backgroundPanelColor, 0.6)}
                >
                    <View style={[StyleSheet.absoluteFill, styles.actualContent]}>
                        <View style={styles.button}>
                            <TouchableOpacity onPress={attach}>
                                <Icon name="paperclip" size={24} color={Colors.secondaryTextColor} />
                            </TouchableOpacity>
                        </View>
                        <TextInput
                            style={styles.input}
                            placeholder={t.your_message}
                            placeholderTextColor={Colors.secondaryTextColor}
                            multiline={true}
                            onChangeText={onChangeText}
                            value={value}
                        />
                        <View style={styles.button}>
                            <TouchableOpacity onPress={send}>
                                <Icon name="paper-plane" size={24} color={Colors.secondaryTextColor} />
                            </TouchableOpacity>
                        </View>
                    </View>
                </BlurView>
            </Animated.View>
        </SurelyAnimatedView>
    );
});

export default MessageInput;
