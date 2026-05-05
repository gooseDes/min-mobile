import Auth from "@/Auth";
import { createGlobalStyles, ThemeData, useAppStyles, useThemeStore } from "@/Style";
import { midnightTheme, OneishDarkTheme, OneishLightTheme } from "@/Themes";
import { useTranslation } from "@/TranslationContext";
import Button from "@components/Button";
import MessagesContainer, { MessagesContainerHandle } from "@components/HomePage/MessagesContainer";
import { openDropdown } from "@services/DropdownService";
import { useEffect, useRef } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

const styles = StyleSheet.create({
    previewContainer: {
        width: "100%",
        height: "60%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        overflow: "visible",
    },
    themeSelectionContainer: {
        width: "100%",
        height: "40%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        gap: 8,
    },
});

function ThemeSettings() {
    const setTheme = useThemeStore(s => s.setTheme);
    const resetTheme = useThemeStore(s => s.resetTheme);
    const Styles = useAppStyles(createGlobalStyles);
    const { t } = useTranslation();

    const messagesRef = useRef<MessagesContainerHandle>(null);

    function applyTheme(theme: ThemeData) {
        Object.entries(theme).forEach(([key, value]) => {
            setTheme(key as keyof ThemeData, value);
        });
    }

    useEffect(() => {
        messagesRef.current?.setMessages([
            {
                id: 1,
                text: "Test Message",
                sender: { id: -1, username: "Test User" },
                chatId: 1,
                sentAt: new Date(Date.now() - 100000000),
            },
            {
                id: 2,
                text: "Another Test Message",
                sender: { id: -1, username: "Test User" },
                chatId: 1,
                sentAt: new Date(Date.now() - 90000000),
            },
            {
                id: 3,
                text: "Yet Another Test Message",
                sender: { id: Auth.id ?? -1, username: Auth.username ?? "Test User" },
                chatId: 1,
                sentAt: new Date(),
            },
        ]);
        messagesRef.current?.show();
    }, []);

    return (
        <View>
            {/* Preview */}
            <View style={styles.previewContainer}>
                <Text style={[{ fontSize: 24 }, Styles.primaryBoldText]}>{t.settings_preview}</Text>
                <View
                    style={{
                        height: 64,
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                    }}
                >
                    <Button
                        text="Test Button"
                        onPress={e =>
                            openDropdown(e.nativeEvent.pageX, e.nativeEvent.pageY, [
                                { icon: "arrow-right-to-city", text: "Test 1" },
                                { icon: "bag-shopping", text: "Test 2" },
                            ])
                        }
                    />
                </View>
                <MessagesContainer bottomGap={8} disabled={true} ref={messagesRef} />
            </View>

            {/* Theme selection */}
            <View style={styles.themeSelectionContainer}>
                <Pressable
                    onPress={e =>
                        openDropdown(e.nativeEvent.pageX, e.nativeEvent.pageY, [
                            {
                                text: "Midnight",
                                onPress: () => applyTheme(midnightTheme),
                            },
                            {
                                text: "Oneish Dark",
                                onPress: () => applyTheme(OneishDarkTheme),
                            },
                            {
                                text: "Oneish Light",
                                onPress: () => applyTheme(OneishLightTheme),
                            },
                        ])
                    }
                >
                    <Text style={[{ fontSize: 16 }, Styles.primaryText]}>{t.settings_change_theme}</Text>
                </Pressable>
                <Pressable onPress={resetTheme}>
                    <Text style={[{ fontSize: 16 }, Styles.primaryText]}>{t.settings_reset_theme}</Text>
                </Pressable>
            </View>
        </View>
    );
}

export default ThemeSettings;
