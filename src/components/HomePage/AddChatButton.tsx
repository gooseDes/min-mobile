import { apiClient } from "@/socket";
import { createGlobalStyles, useAppStyles, useThemeStore } from "@/style";
import Divider from "@components/Divider";
import HapticPressable from "@components/HapticPressable";
import Icon from "@components/Icon";
import InputField from "@components/InputField";
import PopupButton, { PopupButtonHandler } from "@components/PopupButton";
import { useTranslation } from "@contexts/TranslationContext";
import { ChatData } from "@min/api-client";
import { showNotification } from "@services/notifyService";
import { useRef, useState } from "react";
import { Keyboard, StyleSheet, Text, View } from "react-native";

const styles = StyleSheet.create({
    container: {
        height: "100%",
        width: "100%",
        flex: 1,
        gap: 8,
    },
    content: {
        flex: 1,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        gap: 8,
    },
});

export interface AddChatButtonProps {
    onChatCreated?: (chat: ChatData) => void;
}

function AddChatButton(props: AddChatButtonProps) {
    const [username, setUsername] = useState<string>("");
    const popupRef = useRef<PopupButtonHandler>(null);
    const theme = useThemeStore(s => s.theme);
    const Styles = useAppStyles(createGlobalStyles);
    const { t } = useTranslation();

    async function createChat() {
        Keyboard.dismiss();
        const newChatInfo = await apiClient.createChat({ targetUsername: username.trim().replace("@", "") });
        if (newChatInfo.success) {
            setUsername("");
            popupRef.current?.close();
            props.onChatCreated?.(newChatInfo.chat);
        } else {
            showNotification("Failed to create chat", newChatInfo.message);
        }
    }

    return (
        <PopupButton right={10} bottom={70} icon="plus" iconSize={24} ref={popupRef}>
            <View style={styles.container}>
                <View style={{ flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 10 }}>
                    <Icon name="plus" size={24} color={theme.primaryTextColor} />
                    <Text style={Styles.titleText}>{t.create_chat}</Text>
                </View>
                <Divider />
                <View style={styles.content}>
                    <Text style={[Styles.primaryText, { fontSize: 16 }]}>{t.enter_username}</Text>
                    <InputField
                        placeholder={t.username_placeholder}
                        style={{ width: "100%" }}
                        onChangeText={value => setUsername(value)}
                        value={username}
                    />
                    <View style={{ width: "100%", height: 50, justifyContent: "center", alignItems: "flex-end" }}>
                        <HapticPressable
                            style={[
                                Styles.bgAndBorder,
                                {
                                    aspectRatio: 1,
                                    width: 50,
                                    display: "flex",
                                    justifyContent: "center",
                                    alignItems: "center",
                                    padding: 0,
                                    overflow: "hidden",
                                },
                            ]}
                            android_ripple={{ color: theme.rippleColor, foreground: true }}
                            onPress={createChat}
                        >
                            <Icon name="check" size={20} color={theme.primaryTextColor} />
                        </HapticPressable>
                    </View>
                </View>
            </View>
        </PopupButton>
    );
}

export default AddChatButton;
