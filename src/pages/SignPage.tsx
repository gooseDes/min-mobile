import Auth from "@/Auth";
import { Constants, createGlobalStyles, ThemeData, useAppStyles } from "@/Style";
import { getShadow } from "@/Utils";
import Button from "@components/Button";
import Divider from "@components/Divider";
import Icon from "@components/Icon";
import InputField from "@components/InputField";
import { useTranslation } from "@contexts/TranslationContext";
import { navigate } from "@services/NavigationService";
import { showNotification } from "@services/NotifyService";
import { setOverlay } from "@services/OverlayService";
import { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Animated, { ZoomInDown, ZoomInUp, ZoomOutDown, ZoomOutUp } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

const createStyles = (theme: ThemeData) =>
    StyleSheet.create({
        signContainer: {
            backgroundColor: theme.backgroundPanelColor,
            borderColor: theme.borderColor,
            borderWidth: theme.borderWidth,
            maxHeight: "90%",
            maxWidth: "100%",
            aspectRatio: 0.75,
            display: "flex",
            borderRadius: theme.rounding,
            gap: 10,
            padding: 10,
            boxShadow: getShadow(theme),
        },
        signForm: {
            gap: 10,
            flex: 1,
        },
        buttonsContainer: {
            height: 100,
            gap: 10,
        },
        languageButtonContainer: {
            position: "absolute",
            bottom: 10,
            right: 10,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            flexDirection: "column",
        },
        languageButton: {
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            flexDirection: "column",
        },
    });

function SignPage() {
    const [emailValue, setEmailValue] = useState<string>("");
    const [loginValue, setLoginValue] = useState<string>("");
    const [passwordValue, setPasswordValue] = useState<string>("");
    const [confirmPasswordValue, setConfirmPasswordValue] = useState<string>("");
    const [state, setState] = useState<"sign_in" | "sign_up">("sign_in");
    const { t, changeLanguage } = useTranslation();
    const styles = useAppStyles(createStyles);
    const Styles = useAppStyles(createGlobalStyles);

    async function SignIn() {
        setOverlay("loading");
        const result = await Auth.login(emailValue, passwordValue);
        if (result.success) {
            navigate("Home");
        } else {
            showNotification("Failed :(", result.message);
        }
        setOverlay("none");
    }

    async function SignUp() {
        setOverlay("loading");
        if (passwordValue !== confirmPasswordValue) {
            showNotification("Failed :(", "Passwords do not match");
            return;
        }
        const result = await Auth.register(loginValue, emailValue, passwordValue);
        console.log(result);
        if (result.success) {
            navigate("Home");
        } else {
            showNotification("Failed :(", result.message);
        }
        setOverlay("none");
    }

    return (
        <SafeAreaView style={Styles.container}>
            {/* Sign In */}
            {state === "sign_in" && (
                <Animated.View
                    style={styles.signContainer}
                    entering={ZoomInDown.springify(500)}
                    exiting={ZoomOutUp.springify(500)}
                >
                    <Text style={Styles.titleText}>{t.welcome}</Text>

                    <Divider />

                    <View style={styles.signForm}>
                        <InputField
                            autoCapitalize="none"
                            onChangeText={value => setEmailValue(value)}
                            placeholder={t.email}
                            key={t.email + "1"}
                        />
                        <InputField
                            autoCapitalize="none"
                            onChangeText={value => setPasswordValue(value)}
                            placeholder={t.password}
                            secureTextEntry={true}
                            key={t.password + "1"}
                        />
                    </View>

                    <Divider />

                    <View style={styles.buttonsContainer}>
                        <Button text={t.sign_in} onPress={SignIn} style={{ flex: 1 }} />
                        <Button text={t.no_account} onPress={() => setState("sign_up")} style={{ flex: 1 }} />
                    </View>
                </Animated.View>
            )}

            {/* Sign Up */}
            {state === "sign_up" && (
                <Animated.View
                    style={styles.signContainer}
                    entering={ZoomInUp.springify(500)}
                    exiting={ZoomOutDown.springify(500)}
                >
                    <Text style={Styles.titleText}>{t.welcome}</Text>

                    <Divider />

                    <View style={styles.signForm}>
                        <InputField
                            autoCapitalize="none"
                            onChangeText={value => setLoginValue(value)}
                            placeholder={t.login}
                            key={t.login + "2"}
                        />
                        <InputField
                            autoCapitalize="none"
                            onChangeText={value => setEmailValue(value)}
                            placeholder={t.email}
                            key={t.email + "2"}
                        />
                        <InputField
                            autoCapitalize="none"
                            onChangeText={value => setPasswordValue(value)}
                            placeholder={t.password}
                            secureTextEntry={true}
                            key={t.password + "2"}
                        />
                        <InputField
                            autoCapitalize="none"
                            onChangeText={value => setConfirmPasswordValue(value)}
                            placeholder={t.confirm_password}
                            secureTextEntry={true}
                            key={t.confirm_password + "2"}
                        />
                    </View>

                    <Divider />

                    <View style={styles.buttonsContainer}>
                        <Button text={t.sign_up} onPress={SignUp} style={{ flex: 1 }} />
                        <Button text={t.have_account} onPress={() => setState("sign_in")} style={{ flex: 1 }} />
                    </View>
                </Animated.View>
            )}

            {/* Language Change Button */}
            <Animated.View style={styles.languageButtonContainer} layout={Constants.layoutTransition}>
                <TouchableOpacity
                    style={styles.languageButton}
                    onPress={() => {
                        changeLanguage();
                    }}
                >
                    <Icon name="language" size={24} color="#fff" />
                    <Text style={Styles.primaryText}>{t.language}</Text>
                </TouchableOpacity>
            </Animated.View>
        </SafeAreaView>
    );
}

export default SignPage;
