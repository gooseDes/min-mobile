import Auth from "@/Auth";
import { apiClient } from "@/Socket";
import { Constants, createGlobalStyles, ThemeData, useAppStyles, useThemeStore } from "@/Style";
import { getShadow } from "@/Utils";
import HapticPressable from "@components/HapticPressable";
import Icon from "@components/Icon";
import PressableWithEffect from "@components/PressableWithEffect";
import SurelyAnimatedView from "@components/SurelyAnimatedView";
import { useTranslation } from "@contexts/TranslationContext";
import { showPopup } from "@services/PopupService";
import { forwardRef, useEffect, useImperativeHandle, useState } from "react";
import { StyleProp, StyleSheet, Text, TextInput, View, ViewStyle } from "react-native";
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
            backgroundColor: theme.messageBackgroundColor,
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
            const response = await apiClient.attachImage(await Auth.getFromStorage("token"), {
                uri: asset.uri,
                name: asset.fileName,
                type: asset.type,
            });
            if (response.success) {
                setValue(
                    value + value
                        ? " "
                        : "" +
                              response.urls
                                  .map((att: string) => `![attachment](${process.env.EXPO_PUBLIC_SERVER}${att})`)
                                  .join("\n"),
                );
            } else {
                showPopup("Error", response.message);
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
                <View style={StyleSheet.absoluteFill}>
                    {hasPrefix && (
                        <Animated.View
                            entering={ZoomIn}
                            exiting={ZoomOut}
                            style={[styles.horizontalRow, { height: 20, gap: 4, paddingHorizontal: 16 }]}
                        >
                            <Icon name="reply" size={12} color={theme.secondaryTextColor} />
                            <Text style={[Styles.secondaryText, { fontSize: 14 }]}>{t.replying_to}</Text>
                            <HapticPressable
                                hitSlop={16}
                                style={{ flex: 1, justifyContent: "center", alignItems: "flex-end" }}
                                android_ripple={{ color: theme.rippleColor }}
                                onPress={() => {
                                    setPrefix("");
                                }}
                            >
                                <Icon name="x" size={12} color={theme.secondaryTextColor} />
                            </HapticPressable>
                        </Animated.View>
                    )}
                    <View style={[styles.horizontalRow, { flex: 1 }]}>
                        <PressableWithEffect style={styles.button} onPress={attach}>
                            <Icon name="paperclip" size={24} color={theme.secondaryTextColor} />
                        </PressableWithEffect>
                        <TextInput
                            style={[styles.input, Styles.primaryText]}
                            placeholder={t.your_message}
                            placeholderTextColor={theme.secondaryTextColor}
                            multiline={true}
                            onChangeText={onChangeText}
                            value={value}
                        />
                        <PressableWithEffect defaultHaptic={false} style={styles.button} onPress={send}>
                            <Icon name="paper-plane" size={24} color={theme.secondaryTextColor} />
                        </PressableWithEffect>
                    </View>
                </View>
            </Animated.View>
        </SurelyAnimatedView>
    );
});

export default MessageInput;
