import { useMemo } from "react";
import { StyleSheet } from "react-native";
import { cubicBezier, LinearTransition } from "react-native-reanimated";
import { create } from "zustand";
import { createJSONStorage, persist, StateStorage } from "zustand/middleware";
import Storage from "./Storage";
import { midnightTheme, themes } from "./Themes";
import { getShadow } from "./Utils";

export interface ThemeData {
    name: string;
    isDark: boolean;
    backgroundColor: string;
    backgroundPanelColor: string;
    backgroundPanelColorOpaque: string;
    borderColor: string;
    dividerColor: string;
    messageBackgroundColor: string;
    primaryTextColor: string;
    secondaryTextColor: string;
    rippleColor: string;
    rounding: number;
    borderWidth: number;
    fontFamily: string;
    shadowOffsetX: number;
    shadowOffsetY: number;
    shadowBlur: number;
    shadowSpread: number;
    shadowColor: string;
    shadowInset: boolean;
}

const initialState = midnightTheme;

interface ThemeState {
    theme: ThemeData;
    setTheme: (key: keyof ThemeData, value: any) => void;
    resetTheme: () => void;
}

const mmkvWrapper: StateStorage<ThemeState | unknown> = {
    getItem: async name => {
        return Storage.getString(name) || null;
    },
    setItem: async (name, value) => {
        return Storage.set(name, value);
    },
    removeItem: async name => {
        return Storage.remove(name);
    },
};

export const useThemeStore = create<ThemeState>()(
    persist(
        set => ({
            theme: initialState,

            setTheme: (key, value) =>
                set(state => ({
                    theme: { ...state.theme, [key]: value },
                })),

            resetTheme: () => set({ theme: initialState }),
        }),
        {
            name: "theme-storage",
            storage: createJSONStorage(() => mmkvWrapper),
            merge: (persistedState, currentState) => {
                function mergeTheme(persistedTheme: ThemeData): ThemeData {
                    // Saved theme merged with defaults
                    const withDefaults = { ...initialState, ...persistedTheme };

                    // If saved theme has a name
                    if (persistedTheme.name) {
                        // Try to find the theme by name
                        try {
                            // If found, return merged with saved theme
                            const theme = themes[persistedTheme.name];
                            if (theme) {
                                return { ...theme, ...persistedTheme };
                            }
                        } catch {
                            // If not found, return merged with defaults
                            return withDefaults;
                        }
                    }

                    return withDefaults;
                }

                return {
                    ...currentState,
                    ...(persistedState as ThemeState),
                    theme: mergeTheme((persistedState as ThemeState)?.theme),
                };
            },
        },
    ),
);
type StyleFactory<T> = (colors: ThemeData) => T;

export function useAppStyles<T>(factory: StyleFactory<T>): T {
    const theme = useThemeStore(s => s.theme);
    return useMemo(() => factory(theme), [theme]);
}

export class Constants {
    static layoutTransition = LinearTransition.springify(500);
    static cubicBezier = cubicBezier(0.4, 0, 0.2, 1);
}

export const createGlobalStyles = (theme: ThemeData) =>
    StyleSheet.create({
        container: {
            backgroundColor: theme.backgroundColor,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            flex: 1,
            padding: 10,
        },
        primaryText: {
            color: theme.primaryTextColor,
            fontFamily: "Rubik",
            fontWeight: "normal",
        },
        primaryBoldText: {
            color: theme.primaryTextColor,
            fontFamily: "Rubik-Medium",
            fontWeight: "normal",
        },
        primaryCenter: {
            color: theme.primaryTextColor,
            fontFamily: "Rubik",
            textAlign: "center",
            fontWeight: "normal",
        },
        secondaryText: {
            color: theme.secondaryTextColor,
            fontFamily: "Rubik",
            fontWeight: "normal",
        },
        secondaryCenter: {
            color: theme.secondaryTextColor,
            fontFamily: "Rubik",
            textAlign: "center",
            fontWeight: "normal",
        },
        textInput: {
            color: theme.primaryTextColor,
            fontFamily: "Rubik",
            textAlign: "center",
            backgroundColor: theme.backgroundPanelColor,
            borderColor: theme.borderColor,
            borderWidth: theme.borderWidth,
            borderRadius: theme.rounding,
            boxShadow: getShadow(theme),
        },
        bgAndBorder: {
            backgroundColor: theme.backgroundPanelColor,
            borderColor: theme.borderColor,
            borderWidth: theme.borderWidth,
            borderRadius: theme.rounding,
            padding: 8,
            boxShadow: getShadow(theme),
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
            color: theme.primaryTextColor,
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
