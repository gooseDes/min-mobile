import { getSocket } from "@/Socket";
import { Colors, Styles } from "@/Style";
import { t } from "@/Translation";
import Divider from "@components/Divider";
import Icon from "@components/Icon";
import IconButton from "@components/IconButton";
import InputField from "@components/InputField";
import PopupButton, { PopupButtonHandler } from "@components/PopupButton";
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
    handler: PageHandler;
}

function AddChatButton({ handler }: AddChatButtonProps) {
    const [username, setUsername] = useState<string>("");
    const popupRef = useRef<PopupButtonHandler>(null);

    async function createChat() {
        Keyboard.dismiss();
        const socket = await getSocket();
        socket.on("createChatResult", data => {
            if (data.success) {
                setUsername("");
                popupRef.current?.close();
                socket.emit("getChats", {});
            } else {
                handler({ action: "notify", title: "Failed to create chat", text: data.msg, image: null });
            }
            socket.off("createChatResult");
        });
        socket.emit("createChat", { nickname: username.trim().replace("@", "") });
    }

    return (
        <PopupButton right={10} bottom={80} icon="plus" iconSize={24} ref={popupRef}>
            <View style={styles.container}>
                <View style={{ flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 10 }}>
                    <Icon name="plus" size={24} color={Colors.primaryTextColor} />
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
                        <IconButton
                            layoutTransition={false}
                            icon="check"
                            style={[Styles.bgAndBorder, { aspectRatio: 1, width: 50 }]}
                            onPress={createChat}
                        />
                    </View>
                </View>
            </View>
        </PopupButton>
    );
}

export default AddChatButton;
