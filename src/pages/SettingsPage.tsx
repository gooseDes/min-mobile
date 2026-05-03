import settings from "@/Settings";
import { createGlobalStyles, ThemeData, useAppStyles, useThemeStore } from "@/Style";
import { useTranslation } from "@/TranslationContext";
import { getShadow } from "@/Utils";
import Divider from "@components/Divider";
import Icon from "@components/Icon";
import IconButton from "@components/IconButton";
import SettingsSection from "@components/Settings/SettingsSection";
import { goBack } from "@services/NavigationService";
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const createStyles = (theme: ThemeData) =>
    StyleSheet.create({
        panel: {
            backgroundColor: theme.backgroundPanelColor,
            borderColor: theme.borderColor,
            borderWidth: theme.borderWidth,
            borderRadius: theme.rounding,
            padding: 10,
            margin: 10,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            width: "100%",
            flex: 1,
            boxShadow: getShadow(theme),
        },
    });

function SettingsPage() {
    const { t } = useTranslation();
    const theme = useThemeStore(s => s.theme);
    const styles = createStyles(theme);
    const Styles = useAppStyles(createGlobalStyles);

    return (
        <SafeAreaView style={Styles.container}>
            <View style={styles.panel}>
                {/* Header */}
                <View style={Styles.header}>
                    {/* Back Button */}
                    <IconButton icon="list-ul" style={Styles.backButton} onPress={() => goBack()} />

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
            </View>
        </SafeAreaView>
    );
}

export default SettingsPage;
