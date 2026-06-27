import settings from "@/settings";
import { createGlobalStyles, ThemeData, useAppStyles, useThemeStore } from "@/style";
import Divider from "@components/Divider";
import Icon from "@components/Icon";
import IconButton from "@components/IconButton";
import ScreenPanel from "@components/ScreenPanel";
import SettingsSection from "@components/Settings/SettingsSection";
import { useTranslation } from "@contexts/TranslationContext";
import { useRouter } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

const createStyles = (_theme: ThemeData) => StyleSheet.create({});

function SettingsPage() {
    const router = useRouter();
    const { t } = useTranslation();
    const theme = useThemeStore(s => s.theme);
    const _styles = createStyles(theme);
    const Styles = useAppStyles(createGlobalStyles);

    return (
        <ScreenPanel>
            {/* Header */}
            <View style={Styles.header}>
                {/* Back Button */}
                <IconButton icon="list-ul" style={Styles.backButton} onPress={() => router.back()} />

                {/* Title */}
                <View style={Styles.title}>
                    <Icon name="gear" size={24} color={theme.primaryTextColor} />
                    <Text style={[Styles.primaryBoldText, Styles.titleText]}>{t.settings}</Text>
                </View>

                {/* Spacer */}
                <View style={Styles.backButton} />
            </View>

            <Divider />

            {/* Content */}
            <View style={Styles.content}>
                {/* Sections */}
                {settings.sections.map((section, index) => (
                    <SettingsSection key={index} section={section} />
                ))}
            </View>
        </ScreenPanel>
    );
}

export default SettingsPage;
