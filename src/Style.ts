import { PressableAndroidRippleConfig, StyleSheet } from "react-native";
import { cubicBezier, LinearTransition } from "react-native-reanimated";

export class Colors {
    static backgroundColor = "#131317";
    static backgroundPanelColor = "#1f1f23dd";
    static backgroundPanelColorOpaque = "#1e1e20";
    static borderColor = "#2d2d32dd";
    static messageBackgroundColor = "#1f1f23c2";
    static primaryTextColor = "#ffffff";
    static secondaryTextColor = "#aaaaaa";
    static rippleColor = "#ffffffaa";
}

export class Constants {
    static rounding = 16;
    static borderWidth = 2;
    static fontFamily = "Rubik";
    static layoutTransition = LinearTransition.springify(500);
    static cubicBezier = cubicBezier(0.4, 0, 0.2, 1);
    static rippleConfig: PressableAndroidRippleConfig = { color: Colors.rippleColor, foreground: true };
    static shadow = "0px 4px 4px rgba(0, 0, 0, 0.5)";
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
    textInput: {
        color: Colors.primaryTextColor,
        fontFamily: "Rubik",
        textAlign: "center",
        backgroundColor: Colors.backgroundPanelColor,
        borderColor: Colors.borderColor,
        borderWidth: Constants.borderWidth,
        borderRadius: Constants.rounding,
    },
    bgAndBorder: {
        backgroundColor: Colors.backgroundPanelColor,
        borderColor: Colors.borderColor,
        borderWidth: Constants.borderWidth,
        borderRadius: Constants.rounding,
        padding: 8,
    },
    header: {
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        height: 50,
        marginBottom: 5,
    },
    title: {
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        flex: 1,
        gap: 10,
    },
    titleText: {
        color: Colors.primaryTextColor,
        fontSize: 26,
        fontFamily: "Rubik-Medium",
        textAlign: "center",
        fontWeight: "normal",
    },
    backButton: {
        aspectRatio: 1,
        height: "100%",
    },
    content: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        flex: 1,
    },
});
