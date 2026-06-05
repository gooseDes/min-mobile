import Auth from "@/Auth";
import { apiClient } from "@/Socket";
import Storage from "@/Storage";
import { Constants, createGlobalStyles, ThemeData, useAppStyles, useThemeStore } from "@/Style";
import { getShadow } from "@/Utils";
import Divider from "@components/Divider";
import HapticPressable from "@components/HapticPressable";
import Icon, { AnimatedIcon } from "@components/Icon";
import IconButton from "@components/IconButton";
import { useTranslation } from "@contexts/TranslationContext";
import { SERVER } from "@env";
import { goBack, navigate } from "@services/NavigationService";
import { setOverlay } from "@services/OverlayService";
import { showPopup } from "@services/PopupService";
import { useEffect, useState } from "react";
import { BackHandler, StyleSheet, Text, View } from "react-native";
import { Asset, launchImageLibrary } from "react-native-image-picker";
import Animated, { ZoomInEasyDown, ZoomInEasyUp, ZoomOutEasyDown, ZoomOutEasyUp } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

const createStyles = (theme: ThemeData) =>
    StyleSheet.create({
        panel: {
            backgroundColor: theme.backgroundPanelColor,
            borderColor: theme.borderColor,
            borderWidth: theme.borderWidth,
            borderRadius: theme.rounding,
            boxShadow: getShadow(theme),
            padding: 10,
            margin: 10,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            width: "100%",
            flex: 1,
        },
        avatarContainerContainer: {
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
        },
        avatarContainer: {
            justifyContent: "center",
            alignItems: "center",
            padding: 8,
            borderRadius: 999,
            overflow: "hidden",
        },
        avatar: {
            width: 200,
            height: 200,
            borderRadius: 100,
            boxShadow: getShadow(theme),
        },
        username: {
            fontSize: 24,
            textAlign: "center",
        },
        actionButtonContainer: {
            position: "absolute",
            right: 0,
            bottom: 0,
            gap: 8,
        },
        actionButton: {
            backgroundColor: theme.backgroundColor,
            borderColor: theme.borderColor,
            borderWidth: theme.borderWidth,
            borderRadius: 25,
            width: "auto",
            overflow: "hidden",
            boxShadow: getShadow(theme),
        },
        actionButtonPressable: {
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            flexDirection: "row",
            paddingHorizontal: 16,
            width: "auto",
            height: 50,
            gap: 8,
        },
    });

interface ActionButtonProps {
    text?: string;
    icon?: string;
    onPress?: () => void;
}

function ActionButton(props: ActionButtonProps) {
    const { text, icon, onPress } = props;
    const theme = useThemeStore(s => s.theme);
    const styles = useAppStyles(createStyles);
    const Styles = useAppStyles(createGlobalStyles);

    return (
        <Animated.View style={styles.actionButton} layout={Constants.layoutTransition}>
            <HapticPressable
                android_ripple={{ color: theme.rippleColor, foreground: true, borderless: true }}
                style={styles.actionButtonPressable}
                onPress={onPress}
            >
                <Animated.Text
                    key={`action_button_${text}`}
                    style={[Styles.primaryCenter, { fontSize: 24 }]}
                    entering={ZoomInEasyDown}
                    exiting={ZoomOutEasyUp}
                >
                    {text}
                </Animated.Text>
                <AnimatedIcon
                    name={icon || "x"}
                    color={theme.primaryTextColor}
                    size={24}
                    entering={ZoomInEasyUp}
                    exiting={ZoomOutEasyDown}
                />
            </HapticPressable>
        </Animated.View>
    );
}

function ProfilePage() {
    const [isEditMode, setIsEditMode] = useState<boolean>(false);
    const [avatarPreview, setAvatarPreview] = useState<Asset | undefined>(undefined);
    const [avatar, setAvatar] = useState<string>(`${SERVER}/avatars/${Storage.getString("avatar")}.webp`);
    const { t } = useTranslation();
    const theme = useThemeStore(s => s.theme);
    const styles = useAppStyles(createStyles);
    const Styles = useAppStyles(createGlobalStyles);

    useEffect(() => {
        const listener = BackHandler.addEventListener("hardwareBackPress", () => {
            goBack();
            return true;
        });

        return () => listener.remove();
    }, []);

    async function uploadAvatar() {
        if (!isEditMode) return;
        const result = await launchImageLibrary({ mediaType: "photo", selectionLimit: 1 });
        if (result.didCancel) return;
        if (!result.assets) return;

        setAvatarPreview(result.assets[0]);
    }

    useEffect(() => {
        (async () => {
            if (!isEditMode && avatarPreview) {
                setOverlay("loading");
                if (!avatarPreview.uri || !avatarPreview.fileName || !avatarPreview.type) return;
                const response = await apiClient.uploadAvatar(await Auth.getFromStorage("token"), {
                    uri: avatarPreview.uri,
                    name: avatarPreview.fileName,
                    type: avatarPreview.type,
                });
                if (response.success) {
                    setAvatar(`${SERVER}${response.url}`);
                    Storage.set("avatar", response.avatar);
                } else {
                    showPopup("Error", response.message);
                }
                setOverlay("none");
            }
        })();
    }, [isEditMode, avatarPreview]);

    async function logOut() {
        await Auth.clearStorage();
        navigate("Sign");
    }

    return (
        <SafeAreaView style={Styles.container}>
            <View style={styles.panel}>
                {/* Header */}
                <View style={Styles.header}>
                    {/* Back Button */}
                    <IconButton icon="list-ul" style={Styles.backButton} onPress={() => goBack()} />

                    {/* Title */}
                    <View style={Styles.title}>
                        <Icon name="user-circle" size={24} color={theme.primaryTextColor} />
                        <Text style={Styles.titleText}>{t.profile}</Text>
                    </View>

                    {/* Spacer */}
                    <View style={Styles.backButton} />
                </View>

                <Divider />

                {/* Content */}
                <View style={[Styles.content, { justifyContent: "flex-start", paddingVertical: 32 }]}>
                    {/* Profile */}
                    <View style={styles.avatarContainerContainer}>
                        <HapticPressable
                            android_ripple={{ color: theme.rippleColor, foreground: true, borderless: true }}
                            style={styles.avatarContainer}
                            onPress={() => uploadAvatar()}
                        >
                            <Animated.Image
                                src={avatarPreview ? avatarPreview.uri : avatar}
                                style={[
                                    styles.avatar,
                                    {
                                        filter: `blur(${isEditMode && !avatarPreview ? 5 : 0})`,
                                        transition: "filter 0.25s ease",
                                    } as any,
                                ]}
                            />
                        </HapticPressable>
                        <AnimatedIcon
                            name="upload"
                            color={"#fff"}
                            size={64}
                            containerStyle={{
                                position: "absolute",
                                mixBlendMode: "difference",
                                opacity: isEditMode ? 1 : 0,
                                right: avatarPreview ? -8 : undefined,
                                bottom: avatarPreview ? -8 : undefined,
                                transform: [{ scale: avatarPreview ? 0.5 : 1 }],
                                transition: "opacity 0.25s ease, transform 0.25s ease",
                                pointerEvents: "none",
                                zIndex: 1,
                            }}
                        />
                    </View>
                    <Text style={[Styles.primaryBoldText, styles.username]}>{Auth.username}</Text>

                    {/* Actions */}
                    <View style={styles.actionButtonContainer}>
                        <ActionButton
                            text={isEditMode ? t.apply : t.edit}
                            icon={isEditMode ? "check" : "pencil"}
                            onPress={() => setIsEditMode(!isEditMode)}
                        />
                        <ActionButton text={t.log_out} icon="right-from-bracket" onPress={logOut} />
                    </View>
                </View>
            </View>
        </SafeAreaView>
    );
}

export default ProfilePage;
