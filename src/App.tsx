import { StatusBar } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { JSX, useEffect, useState } from "react";
import SignPage from "./pages/SignPage";
import Auth from "./Auth";
import HomePage from "./pages/HomePage";
import Animated, { Easing, ZoomInDown, ZoomOutUp } from "react-native-reanimated";
import { Colors } from "./Style";

function PageWrapper({ children }: { children: JSX.Element }) {
    return (
        <Animated.View
            style={{ flex: 1 }}
            entering={ZoomInDown.duration(600).easing(Easing.out(Easing.cubic))}
            exiting={ZoomOutUp.duration(600).easing(Easing.out(Easing.cubic))}
        >
            {children}
        </Animated.View>
    );
}

function App() {
    const [currentPage, setCurrentPage] = useState<string>("none");
    const [, forceUpdate] = useState<number>(0);

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
            case "changeLanguage":
                forceUpdate(Date.now());
                break;
        }
    }

    return (
        <SafeAreaProvider key={forceUpdate.toString()} style={{ backgroundColor: Colors.backgroundColor }}>
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
