import { Appearance } from "react-native";
import MaterialYou from "react-native-material-you-colors";
import { ThemeData } from "./style";

export const midnightTheme: ThemeData = {
    name: "midnight",
    isDark: true,
    backgroundColor: "#131317",
    backgroundPanelColor: "#1f1f23",
    backgroundPanelColorOpaque: "#1e1e20",
    borderColor: "#2d2d32dd",
    dividerColor: "#2d2d32dd",
    messageBackgroundColor: "#1f1e23",
    primaryTextColor: "#ffffff",
    secondaryTextColor: "#aaaaaa",
    rippleColor: "#ffffffaa",
    rounding: 16,
    borderWidth: 2,
    fontFamily: "Rubik",
    shadowColor: "rgba(0, 0, 0, 0.5)",
    shadowOffsetX: 0,
    shadowOffsetY: 4,
    shadowBlur: 4,
    shadowSpread: 0,
    shadowInset: false,
};

export const OneishLightTheme: ThemeData = {
    name: "oneish-light",
    isDark: false,
    backgroundColor: "#f2f1f7",
    backgroundPanelColor: "#fcfbff",
    backgroundPanelColorOpaque: "#fcfbff",
    borderColor: "#f2f1f7",
    dividerColor: "#d9d9db",
    messageBackgroundColor: "#f2f1f7",
    primaryTextColor: "#030303",
    secondaryTextColor: "#88878c",
    rippleColor: "#999999aa",
    rounding: 16,
    borderWidth: 2,
    fontFamily: "Rubik",
    shadowColor: "rgba(0, 0, 0, 0.1)",
    shadowOffsetX: 0,
    shadowOffsetY: 4,
    shadowBlur: 4,
    shadowSpread: 0,
    shadowInset: false,
};

export const OneishDarkTheme: ThemeData = {
    name: "oneish-dark",
    isDark: true,
    backgroundColor: "#010101",
    backgroundPanelColor: "#16151add",
    backgroundPanelColorOpaque: "#16151a",
    borderColor: "#3a393e",
    dividerColor: "#3a393e",
    messageBackgroundColor: "#3a393e",
    primaryTextColor: "#f5f4f9",
    secondaryTextColor: "#939297",
    rippleColor: "#ffffffaa",
    rounding: 16,
    borderWidth: 2,
    fontFamily: "Rubik",
    shadowColor: "rgba(255, 255, 255, 0.1)",
    shadowOffsetX: 0,
    shadowOffsetY: 4,
    shadowBlur: 4,
    shadowSpread: 0,
    shadowInset: false,
};

export function generateAdaptiveTheme(): ThemeData {
    const palette = MaterialYou.getMaterialYouPalette();
    const systemTheme = Appearance.getColorScheme();
    const isDark = systemTheme !== "light";

    return {
        name: "adaptive",
        isDark: isDark,
        backgroundColor: palette.system_neutral1[isDark ? 11 : 1],
        backgroundPanelColor: palette.system_neutral1[isDark ? 10 : 2],
        backgroundPanelColorOpaque: palette.system_neutral1[isDark ? 10 : 2],
        borderColor: "transparent",
        dividerColor: palette.system_accent1[isDark ? 9 : 3],
        messageBackgroundColor: palette.system_neutral1[isDark ? 9 : 2],
        primaryTextColor: palette.system_accent1[isDark ? 6 : 6],
        secondaryTextColor: palette.system_accent2[isDark ? 5 : 5],
        rippleColor: palette.system_neutral1[isDark ? 5 : 5],
        rounding: 16,
        borderWidth: 2,
        fontFamily: "Rubik",
        shadowColor: palette.system_accent1[isDark ? 9 : 3],
        shadowOffsetX: 0,
        shadowOffsetY: 0,
        shadowBlur: 4,
        shadowSpread: 1,
        shadowInset: false,
    };
}

export const AdaptiveTheme: ThemeData = generateAdaptiveTheme();

export interface ThemesType {
    [key: string]: ThemeData;
}
export const themes: ThemesType = {
    midnight: midnightTheme,
    "oneish-light": OneishLightTheme,
    "oneish-dark": OneishDarkTheme,
    adaptive: AdaptiveTheme,
};
