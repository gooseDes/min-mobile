import Auth from "@/Auth";
import { Colors, Constants, Styles } from "@/Style";
import { t } from "@/Translation";
import Divider from "@components/Divider";
import Icon, { AnimatedIcon } from "@components/Icon";
import IconButton from "@components/IconButton";
import { SERVER } from "@env";
import { goBack } from "@services/NavigationService";
import { useEffect, useState } from "react";
import { BackHandler, Pressable, StyleSheet, Text, View } from "react-native";
import { Asset, launchImageLibrary } from "react-native-image-picker";
import Animated, { ZoomInEasyDown, ZoomInEasyUp, ZoomOutEasyDown, ZoomOutEasyUp } from "react-native-reanimated";
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
    },
    username: {
        fontSize: 24,
        textAlign: "center",
    },
    actionButton: {
        backgroundColor: Colors.backgroundColor,
        borderColor: Colors.borderColor,
        borderWidth: Constants.borderWidth,
        borderRadius: 25,
        overflow: "hidden",
        position: "absolute",
        right: 8,
        bottom: 8,
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

    return (
        <Animated.View style={styles.actionButton} layout={Constants.layoutTransition}>
            <Pressable
                android_ripple={{ ...Constants.rippleConfig, borderless: true }}
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
                    color={Colors.primaryTextColor}
                    size={24}
                    entering={ZoomInEasyUp}
                    exiting={ZoomOutEasyDown}
                />
            </Pressable>
        </Animated.View>
    );
}

function ProfilePage() {
    const [isEditMode, setIsEditMode] = useState<boolean>(false);
    const [avatarPreview, setAvatarPreview] = useState<Asset | undefined>(undefined);
    const [avatar, setAvatar] = useState<string>(`${SERVER}/avatars/${Auth.id}.webp`);

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
                fetch(`${SERVER}/upload-avatar`, {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${await Auth.getFromStorage("token")}`,
                    },
                    body: (() => {
                        const formData = new FormData();
                        formData.append("avatar", {
                            uri: avatarPreview.uri,
                            name: avatarPreview.fileName,
                            type: avatarPreview.type,
                        });
                        return formData;
                    })(),
                }).then(_res => {
                    console.log(_res);
                    setAvatarPreview(undefined);
                    setAvatar(`${SERVER}/avatars/${Auth.id}.webp?t=${new Date().getTime()}`);
                });
            }
        })();
    }, [isEditMode]);

    return (
        <SafeAreaView style={Styles.container}>
            <View style={styles.panel}>
                {/* Header */}
                <View style={Styles.header}>
                    {/* Back Button */}
                    <IconButton icon="list-ul" style={Styles.backButton} onPress={() => goBack()} />

                    {/* Title */}
                    <View style={Styles.title}>
                        <Icon name="user-circle" size={24} color={Colors.primaryTextColor} />
                        <Text style={Styles.titleText}>{t.settings}</Text>
                    </View>

                    {/* Spacer */}
                    <View style={Styles.backButton} />
                </View>

                <Divider />

                {/* Content */}
                <View style={[Styles.content, { justifyContent: "flex-start", paddingVertical: 32 }]}>
                    {/* Profile */}
                    <View style={styles.avatarContainerContainer}>
                        <Pressable
                            android_ripple={{ ...Constants.rippleConfig, borderless: true }}
                            style={styles.avatarContainer}
                            onPress={() => uploadAvatar()}
                        >
                            <Animated.Image
                                src={avatarPreview ? avatarPreview.uri : avatar}
                                style={[
                                    styles.avatar,
                                    /* @ts-ignore */
                                    {
                                        filter: `blur(${isEditMode && !avatarPreview ? 5 : 0})`,
                                        transition: "filter 0.25s ease",
                                    },
                                ]}
                            />
                        </Pressable>
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
                    <ActionButton
                        text={isEditMode ? "Apply" : "Edit"}
                        icon={isEditMode ? "check" : "pencil"}
                        onPress={() => setIsEditMode(!isEditMode)}
                    />
                </View>
            </View>
        </SafeAreaView>
    );
}

export default ProfilePage;
