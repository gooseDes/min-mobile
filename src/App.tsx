/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import { StatusBar, StyleSheet, Text, View } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import Colors from "./Style";
import MessagesContainer from "@components/MessagesContainer";
import { useEffect, useState } from "react";
import { MessageData } from "./Types";

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.backgroundColor,
    },
    panel: {
        backgroundColor: Colors.backgroundPanelColor,
        borderColor: Colors.borderColor,
        borderWidth: 2,
        borderRadius: 15,
        padding: 10,
        margin: 10,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
    },
    topPanel: {
        height: 60,
        gap: 20,
        flexDirection: "row",
    },
    contentPanel: {
        flex: 1,
    },
});

function App() {
    return (
        <SafeAreaProvider>
            <StatusBar barStyle={"light-content"} />
            <AppContent />
        </SafeAreaProvider>
    );
}

function CreateMessage(obj: any): MessageData {
    return {
        id: obj.id || -1,
        text: obj.text || "",
        author: obj.author || -1,
        authorName: obj.authorName || "",
    };
}

function AppContent() {
    const [messages, setMessages] = useState<MessageData[]>([]);

    useEffect(() => {
        setMessages([
            CreateMessage({ text: "Hello, world!" }),
            CreateMessage({ text: "This is a message." }),
            CreateMessage({ text: "Another message." }),
        ]);
    }, []);

    return (
        <SafeAreaView style={styles.container}>
            <View style={[styles.panel, styles.topPanel]}>
                <Text style={{ color: "white" }}>Top Panel</Text>
            </View>
            <View style={[styles.panel, styles.contentPanel]}>
                <MessagesContainer messages={messages} />
            </View>
        </SafeAreaView>
    );
}

export default App;
