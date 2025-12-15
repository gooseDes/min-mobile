import { StatusBar } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { JSX, useEffect, useState } from "react";
import SignPage from "./pages/SignPage";
import Auth from "./Auth";
import HomePage from "./pages/HomePage";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";

function PageWrapper({ children }: { children: JSX.Element }) {
    return (
        <Animated.View style={{ flex: 1 }} entering={FadeIn} exiting={FadeOut}>
            {children}
        </Animated.View>
    );
}

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
        <SafeAreaProvider style={{ backgroundColor: "#000" }}>
            <StatusBar barStyle={"light-content"} />
            {currentPage === "home" && (
                <PageWrapper>
                    <HomePage handler={commandHandler} />
                </PageWrapper>
            )}
            {currentPage === "sign" && (
                <PageWrapper>
                    <SignPage handler={commandHandler} />
                </PageWrapper>
            )}
        </SafeAreaProvider>
    );
}

export default App;
