import { Appearance } from "react-native";
import MaterialYou from "react-native-material-you-colors";
import { ThemeData } from "./style";
import { setAlphaForColor } from "./utils";

export const midnightTheme: ThemeData = {
    name: "midnight",
    isDark: true,
    backgroundColor: "#131317",
    backgroundPanelColor: "#1f1f23",
    panelColor: "#242428",
    borderColor: "#2d2d32dd",
    dividerColor: "#2d2d32dd",
    accentColor: "#f5f4f9",
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
    panelColor: "#f2f1f7",
    borderColor: "#f2f1f7",
    dividerColor: "#d9d9db",
    accentColor: "#030303",
    primaryTextColor: "#030303",
    secondaryTextColor: "#88878c",
    rippleColor: "#999999aa",
    rounding: 16,
    borderWidth: 2,
    fontFamily: "Rubik",
    shadowColor: "rgba(0, 0, 0, 0.1)",
    shadowOffsetX: 0,
    shadowOffsetY: 0,
    shadowBlur: 4,
    shadowSpread: 1,
    shadowInset: false,
};

export const OneishDarkTheme: ThemeData = {
    name: "oneish-dark",
    isDark: true,
    backgroundColor: "#010101",
    backgroundPanelColor: "#010101",
    panelColor: "#16151a",
    borderColor: "transparent",
    dividerColor: "#3a393e",
    accentColor: "#f5f4f9",
    primaryTextColor: "#f5f4f9",
    secondaryTextColor: "#939297",
    rippleColor: "#ffffffaa",
    rounding: 16,
    borderWidth: 2,
    fontFamily: "Rubik",
    shadowColor: "rgba(0, 0, 0, 0.5)",
    shadowOffsetX: 0,
    shadowOffsetY: 0,
    shadowBlur: 4,
    shadowSpread: 0,
    shadowInset: false,
};

export function generateAdaptiveTheme(): ThemeData {
    const palette = MaterialYou.getMaterialYouPalette();
    const systemTheme = Appearance.getColorScheme();
    const isDark = systemTheme !== "light";

    /* eslint-disable @typescript-eslint/no-unused-vars */
    const getNeutral1Shade = (darkShade: number, lightShade?: number) =>
        palette.system_neutral1[isDark ? darkShade : lightShade ?? 12 - darkShade];
    const getNeutral2Shade = (darkShade: number, lightShade?: number) =>
        palette.system_neutral2[isDark ? darkShade : lightShade ?? 12 - darkShade];
    const getAccent1Shade = (darkShade: number, lightShade?: number) =>
        palette.system_accent1[isDark ? darkShade : lightShade ?? 12 - darkShade];
    const getAccent2Shade = (darkShade: number, lightShade?: number) =>
        palette.system_accent2[isDark ? darkShade : lightShade ?? 12 - darkShade];
    const getAccent3Shade = (darkShade: number, lightShade?: number) =>
        palette.system_accent3[isDark ? darkShade : lightShade ?? 12 - darkShade];
    /* eslint-enable @typescript-eslint/no-unused-vars */

    return {
        name: "adaptive",
        isDark: isDark,
        backgroundColor: getAccent1Shade(11, 5),
        backgroundPanelColor: getAccent2Shade(11),
        panelColor: getAccent2Shade(10),
        borderColor: "transparent",
        dividerColor: getAccent1Shade(6),
        accentColor: getAccent1Shade(6),
        primaryTextColor: getNeutral1Shade(1, 9),
        secondaryTextColor: getAccent2Shade(5),
        rippleColor: getAccent1Shade(5),
        rounding: 16,
        borderWidth: 2,
        fontFamily: "Rubik",
        shadowColor: setAlphaForColor(getNeutral1Shade(12, 8), 0.5),
        shadowOffsetX: 0,
        shadowOffsetY: 0,
        shadowBlur: 4,
        shadowSpread: 0,
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
