import { ThemeData } from "./Style";

export const midnightTheme: ThemeData = {
    isDark: true,
    backgroundColor: "#131317",
    backgroundPanelColor: "#1f1f23dd",
    backgroundPanelColorOpaque: "#1e1e20",
    borderColor: "#2d2d32dd",
    dividerColor: "#2d2d32dd",
    messageBackgroundColor: "#1f1f23c2",
    primaryTextColor: "#ffffff",
    secondaryTextColor: "#aaaaaa",
    rippleColor: "#ffffffaa",
};

export const OneishLightTheme: ThemeData = {
    isDark: false,
    backgroundColor: "#f2f1f7",
    backgroundPanelColor: "#fcfbffdd",
    backgroundPanelColorOpaque: "#fcfbff",
    borderColor: "#f2f1f7",
    dividerColor: "#d9d9db",
    messageBackgroundColor: "#f2f1f7",
    primaryTextColor: "#030303",
    secondaryTextColor: "#88878c",
    rippleColor: "#000000aa",
};

export const OneishDarkTheme: ThemeData = {
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
};

export const themes: ThemeData[] = [midnightTheme, OneishLightTheme, OneishDarkTheme];
