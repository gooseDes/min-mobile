/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import { StatusBar, StyleSheet, Text, View } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

function App() {
    return (
        <SafeAreaProvider>
            <StatusBar barStyle={"light-content"} />
            <AppContent />
        </SafeAreaProvider>
    );
}

function AppContent() {
    return (
        <SafeAreaView style={styles.container}>
            <View style={[styles.panel, styles.topPanel]}>
                <Text style={{ color: "white" }}>Top Panel</Text>
            </View>
            <View style={[styles.panel, styles.contentPanel]}>
                <Text style={{ color: "white" }}>Content Panel</Text>
            </View>
        </SafeAreaView>
    );
}

const backgroundColor = "#131317";
const backgroundPanelColor = "#1f1f23dd";
const borderColor = "#2d2d32dd";

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: backgroundColor,
    },
    panel: {
        backgroundColor: backgroundPanelColor,
        borderColor: borderColor,
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

export default App;
