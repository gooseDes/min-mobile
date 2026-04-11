import settings from "@/Settings";
import { Colors, Constants, Styles } from "@/Style";
import { useTranslation } from "@/TranslationContext";
import Divider from "@components/Divider";
import Icon from "@components/Icon";
import IconButton from "@components/IconButton";
import SettingsSection from "@components/Settings/SettingsSection";
import { goBack } from "@services/NavigationService";
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const styles = StyleSheet.create({
    panel: {
        backgroundColor: Colors.backgroundPanelColor,
        borderColor: Colors.borderColor,
        borderWidth: Constants.borderWidth,
        borderRadius: Constants.rounding,
        padding: 10,
        margin: 10,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        width: "100%",
        flex: 1,
    },
});

function SettingsPage() {
    const { t } = useTranslation();

    return (
        <SafeAreaView style={Styles.container}>
            <View style={styles.panel}>
                {/* Header */}
                <View style={Styles.header}>
                    {/* Back Button */}
                    <IconButton icon="list-ul" style={Styles.backButton} onPress={() => goBack()} />

                    {/* Title */}
                    <View style={Styles.title}>
                        <Icon name="gear" size={24} color={Colors.primaryTextColor} />
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
