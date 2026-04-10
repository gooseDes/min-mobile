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
    header: {
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        height: 50,
    },
    backButton: {
        aspectRatio: 1,
        height: "100%",
    },
    title: {
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        flex: 1,
    },
    titleText: {
        fontSize: 24,
        marginLeft: 10,
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

function SettingsPage() {
    const { t } = useTranslation();

    return (
        <SafeAreaView style={Styles.container}>
            <View style={styles.panel}>
                {/* Header */}
                <View style={styles.header}>
                    {/* Back Button */}
                    <IconButton icon="list-ul" style={styles.backButton} onPress={() => goBack()} />

                    {/* Title */}
                    <View style={styles.title}>
                        <Icon name="gear" size={24} color={Colors.primaryTextColor} />
                        <Text style={[Styles.primaryBoldText, styles.titleText]}>{t.settings}</Text>
                    </View>

                    {/* Spacer */}
                    <View style={styles.backButton} />
                </View>

                <Divider />

                {/* Content */}
                <View style={styles.content}>
                    {/* Settings Content */}
                    {settings.sections.map((section, index) => (
                        <SettingsSection key={index} section={section} />
                    ))}
                </View>
            </View>
        </SafeAreaView>
    );
}

export default SettingsPage;
