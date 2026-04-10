import { StyleSheet } from "react-native";
import { cubicBezier, LinearTransition } from "react-native-reanimated";

export class Colors {
    static backgroundColor = "#131317";
    static backgroundPanelColor = "#1f1f23dd";
    static backgroundPanelColorOpaque = "#1e1e20";
    static borderColor = "#2d2d32dd";
    static messageBackgroundColor = "#1f1f23c2";
    static primaryTextColor = "#ffffff";
    static secondaryTextColor = "#aaaaaa";
}

export class Constants {
    static rounding = 16;
    static borderWidth = 2;
    static fontFamily = "Rubik";
    static layoutTransition = LinearTransition.springify(500);
    static cubicBezier = cubicBezier(0.4, 0, 0.2, 1);
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
        fontWeight: "normal",
    },
    primaryBoldText: {
        color: Colors.primaryTextColor,
        fontFamily: "Rubik-Medium",
        fontWeight: "normal",
    },
    primaryCenter: {
        color: Colors.primaryTextColor,
        fontFamily: "Rubik",
        textAlign: "center",
        fontWeight: "normal",
    },
    secondaryText: {
        color: Colors.secondaryTextColor,
        fontFamily: "Rubik",
        fontWeight: "normal",
    },
    secondaryCenter: {
        color: Colors.secondaryTextColor,
        fontFamily: "Rubik",
        textAlign: "center",
        fontWeight: "normal",
    },
    titleText: {
        color: Colors.primaryTextColor,
        fontSize: 26,
        fontFamily: "Rubik-Medium",
        textAlign: "center",
        fontWeight: "normal",
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
    header: {
        color: Colors.primaryTextColor,
        fontSize: 24,
        fontFamily: "Rubik",
        textAlign: "center",
    },
    bgAndBorder: {
        backgroundColor: Colors.backgroundPanelColor,
        borderColor: Colors.borderColor,
        borderWidth: Constants.borderWidth,
        borderRadius: Constants.rounding,
        padding: 8,
    },
});
