import Auth from "@/Auth";
import { SERVER } from "@env";
import { forwardRef, useImperativeHandle, useRef, useState } from "react";
import { Alert, FlatList, StyleSheet, View } from "react-native";
import Animated, { FadeOut } from "react-native-reanimated";
import ClickableProfile from "./ClickableProfile";

const styles = StyleSheet.create({
    chatsContainer: {
        flex: 1,
        width: "100%",
        display: "flex",
        padding: 10,
    },
});

export interface ChatsContainerHandle {
    setChats: (chats: ChatData[]) => void;
    show: () => void;
}

export interface ChatsContainerProps {
    handler?: (chat: ChatData) => void;
    bottomGap?: number;
}

const ChatsContainer = forwardRef<ChatsContainerHandle, ChatsContainerProps>((props, ref) => {
    const { handler, bottomGap } = props;
    const chatsRef = useRef<ChatData[]>([]);
    const [animProgress, setAnimProgress] = useState<number>(0);

    useImperativeHandle(ref, () => ({
        setChats: (newChats: ChatData[]) => {
            chatsRef.current = newChats;
        },
        show: () => {
            for (let i = 0; i < Math.min(chatsRef.current.length + 1, 15); i++) {
                setTimeout(() => {
                    setAnimProgress(i - 1);
                }, i * 50);
            }
            setTimeout(() => {
                setAnimProgress(chatsRef.current.length);
            }, 16 * 50);
        },
    }));

    const renderChat = ({ item: chat, index }: { item: ChatData; index: number }) => (
        <ClickableProfile
            text={chat.title}
            image={`${SERVER}/avatars/${
                chat.participants.find(participant => participant.id !== Auth.id)?.id || "default"
            }.webp`}
            anim={index % 2 === 0 ? "left" : "right"}
            shown={animProgress >= index}
            onPress={() => {
                if (handler) {
                    handler(chat);
                } else {
                    Alert.alert(index.toString());
                }
            }}
        />
    );

    const splitter = () => <View style={{ height: 20 }} />;

    return (
        <Animated.View exiting={FadeOut} style={styles.chatsContainer}>
            <FlatList
                style={styles.chatsContainer}
                contentContainerStyle={{ paddingBottom: bottomGap }}
                data={chatsRef.current}
                renderItem={renderChat}
                keyExtractor={(_, index) => index.toString()}
                ItemSeparatorComponent={splitter}
                initialNumToRender={15}
            />
        </Animated.View>
    );
});

export default ChatsContainer;
