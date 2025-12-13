import { StatusBar, StyleSheet, View } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { Colors, Constants, Styles } from "./Style";
import MessagesContainer from "@components/MessagesContainer";
import { useEffect, useState } from "react";
import { getSocket } from "./Socket";
import SignPage from "./pages/SignPage";
import Auth from "./Auth";
import Button from "@components/Button";

const styles = StyleSheet.create({
    panel: {
        backgroundColor: Colors.backgroundPanelColor,
        borderColor: Colors.borderColor,
        borderWidth: Constants.borderWidth,
        borderRadius: Constants.rounding,
        padding: 10,
        margin: 10,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        width: "100%",
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
    const [currentPage, setCurrentPage] = useState<string>("sign");
    useEffect(() => {
        async function loadDefaultPage() {
            if (await Auth.getFromStorage("token")) {
                setCurrentPage("home");
            } else {
                setCurrentPage("sign");
            }
        }

        loadDefaultPage();
        Auth.init();
    }, []);

    function commandHandler(command: CommandData) {
        switch (command.action) {
            case "go":
                setCurrentPage(command.to || "home");
                break;
        }
    }

    return (
        <SafeAreaProvider>
            <StatusBar barStyle={"light-content"} />
            {currentPage === "home" && <HomePage handler={commandHandler} />}
            {currentPage === "sign" && <SignPage handler={commandHandler} />}
        </SafeAreaProvider>
    );
}

function CreateMessage(obj: any): MessageData {
    return {
        id: obj.id || -1,
        text: obj.text || "",
        authorId: obj.author || -1,
        authorName: obj.authorName || "",
    };
}

function HomePage(props: PageProps) {
    const [messages, setMessages] = useState<MessageData[]>([]);

    async function SignOut() {
        await Auth.clearStorage();
        props.handler({ action: "go", to: "sign" });
    }

    useEffect(() => {
        async function initSocket() {
            const socket = await getSocket();
            socket.on("connect", () => {
                console.log("Connected to server");
            });
            socket.on("history", async data => {
                setMessages(
                    data.messages.slice().map((msg: any) =>
                        CreateMessage({
                            id: msg.id,
                            text: msg.text,
                            author: msg.author_id,
                            authorName: msg.author,
                        }),
                    ),
                );
            });
            socket.on("error", data => {
                console.error(data);
            });
            socket.emit("getChatHistory", { chat: 1 });

            socket.on("connect_error", err => {
                console.log("Connection Error:", err);
            });
        }
        initSocket();
    }, []);

    return (
        <SafeAreaView style={Styles.container}>
            <View style={[styles.panel, styles.topPanel]}>
                <Button text="Sign Out" onPress={SignOut} />
            </View>
            <View style={[styles.panel, styles.contentPanel]}>
                <MessagesContainer messages={messages} />
            </View>
        </SafeAreaView>
    );
}

export default App;
