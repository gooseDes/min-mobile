import Auth from "@/Auth";
import { chatBlurTargetRef } from "@/GlobalRefs";
import { Constants, createGlobalStyles, ThemeData, useAppStyles, useThemeStore } from "@/Style";
import { useTranslation } from "@/TranslationContext";
import { getShadow, setAlphaForColor } from "@/Utils";
import Icon from "@components/Icon";
import SurelyAnimatedView from "@components/SurelyAnimatedView";
import { BlurView } from "@danielsaraldi/react-native-blur-view";
import { SERVER } from "@env";
import { forwardRef, useEffect, useImperativeHandle, useState } from "react";
import { Alert, Pressable, StyleProp, StyleSheet, Text, TextInput, TouchableOpacity, View, ViewStyle } from "react-native";
import { launchImageLibrary } from "react-native-image-picker";
import Animated, { SlideInDown, SlideOutDown, ZoomIn, ZoomOut } from "react-native-reanimated";

const createStyles = (theme: ThemeData) =>
    StyleSheet.create({
        container: {
            width: "100%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            borderWidth: theme.borderWidth,
            borderColor: theme.borderColor,
            borderRadius: theme.rounding,
            backgroundColor: theme.backgroundPanelColor,
            overflow: "hidden",
            boxShadow: getShadow(theme),
        },
        input: {
            flex: 1,
            width: "100%",
            height: "100%",
            paddingHorizontal: 4,
        },
        button: {
            height: "100%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            overflow: "hidden",
            margin: 10,
        },
        horizontalRow: {
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            flexDirection: "row",
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
    const theme = useThemeStore(s => s.theme);
    const styles = createStyles(theme);
    const Styles = useAppStyles(createGlobalStyles);

    const hasPrefix = prefix.startsWith("/reply");

    useImperativeHandle(ref, () => ({
        setMessagePrefix: (messagePrefix: string) => {
            setPrefix(messagePrefix);
        },
    }));

    useEffect(() => {
        props.onTextChanged?.(prefix + value);
    }, [prefix, value]);

    function onChangeText(text: string) {
        setValue(text);
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
                    setValue(
                        value + value ? " " : "" + data.urls.map((att: string) => `![attachment](${SERVER}${att})`).join("\n"),
                    );
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
            <Animated.View style={[styles.container, { height: hasPrefix ? 70 : 50, transition: "height 0.3s ease-in-out" }]}>
                <BlurView
                    style={StyleSheet.absoluteFill}
                    blurTarget={chatBlurTargetRef}
                    androidColor={setAlphaForColor(theme.messageBackgroundColor, 0.5)}
                >
                    <View style={StyleSheet.absoluteFill}>
                        {hasPrefix && (
                            <Animated.View
                                entering={ZoomIn}
                                exiting={ZoomOut}
                                style={[styles.horizontalRow, { height: 20, gap: 4, paddingHorizontal: 12 }]}
                            >
                                <Icon name="reply" size={12} color={theme.secondaryTextColor} />
                                <Text style={[Styles.secondaryText, { fontSize: 14 }]}>{t.replying_to}</Text>
                                <Pressable
                                    style={{ flex: 1, justifyContent: "center", alignItems: "flex-end" }}
                                    android_ripple={{ color: theme.rippleColor }}
                                    onPress={() => {
                                        setPrefix("");
                                    }}
                                >
                                    <Icon name="x" size={12} color={theme.secondaryTextColor} />
                                </Pressable>
                            </Animated.View>
                        )}
                        <View style={[styles.horizontalRow, { flex: 1 }]}>
                            <View style={styles.button}>
                                <TouchableOpacity onPress={attach}>
                                    <Icon name="paperclip" size={24} color={theme.secondaryTextColor} />
                                </TouchableOpacity>
                            </View>
                            <TextInput
                                style={[styles.input, Styles.primaryText]}
                                placeholder={t.your_message}
                                placeholderTextColor={theme.secondaryTextColor}
                                multiline={true}
                                onChangeText={onChangeText}
                                value={value}
                            />
                            <View style={styles.button}>
                                <TouchableOpacity onPress={send}>
                                    <Icon name="paper-plane" size={24} color={theme.secondaryTextColor} />
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </BlurView>
            </Animated.View>
        </SurelyAnimatedView>
    );
});

export default MessageInput;
