import { StyleSheet } from "react-native";
import { LinearTransition } from "react-native-reanimated";

export class Colors {
    static backgroundColor = "#131317";
    static backgroundPanelColor = "#1f1f23dd";
    static borderColor = "#2d2d32dd";
    static messageBackgroundColor = "#1f1f23c2";
    static primaryTextColor = "#ffffff";
    static secondaryTextColor = "#aaaaaa";
}

export class Constants {
    static rounding = 16;
    static borderWidth = 2;
    static layoutTransition = LinearTransition.springify(500);
}

export const Styles = StyleSheet.create({
    container: {
        backgroundColor: Colors.backgroundColor,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flex: 1,
        padding: 10,
    },
    primaryText: {
        color: Colors.primaryTextColor,
        fontFamily: "Rubik",
    },
    secondaryText: {
        color: Colors.secondaryTextColor,
        fontFamily: "Rubik",
    },
    titleText: {
        color: Colors.primaryTextColor,
        fontSize: 32,
        fontFamily: "Rubik",
        textAlign: "center",
    },
    textInput: {
        color: Colors.primaryTextColor,
        fontFamily: "Rubik",
        textAlign: "center",
        backgroundColor: Colors.backgroundPanelColor,
        borderColor: Colors.borderColor,
        borderWidth: Constants.borderWidth,
        borderRadius: Constants.rounding,
    },
});
