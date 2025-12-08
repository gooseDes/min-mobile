import { StyleSheet } from "react-native";

class Colors {
    static backgroundColor = "#131317";
    static backgroundPanelColor = "#1f1f23dd";
    static borderColor = "#2d2d32dd";
    static messageBackgroundColor = "#1f1f23c2";
    static primaryTextColor = "#ffffff";
    static secondaryTextColor = "#aaaaaa";
}

export const Styles = StyleSheet.create({
    primaryText: {
        color: Colors.primaryTextColor,
    },
    secondaryText: {
        color: Colors.secondaryTextColor,
    },
});

export default Colors;
