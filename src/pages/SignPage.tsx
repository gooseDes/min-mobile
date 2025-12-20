import Auth from "@/Auth";
import { Colors, Constants, Styles } from "@/Style";
import { changeLanguage, t } from "@/Translation";
import Button from "@components/Button";
import Divider from "@components/Divider";
import Icon from "@components/Icon";
import InputField from "@components/InputField";
import { useState } from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Animated, { ZoomInDown, ZoomInUp, ZoomOutDown, ZoomOutUp } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

const styles = StyleSheet.create({
    signContainer: {
        backgroundColor: Colors.backgroundPanelColor,
        borderColor: Colors.borderColor,
        borderWidth: Constants.borderWidth,
        maxHeight: "90%",
        maxWidth: "100%",
        aspectRatio: 0.75,
        display: "flex",
        borderRadius: Constants.rounding,
        gap: 10,
        padding: 10,
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

function SignPage(props: PageProps) {
    const [emailValue, setEmailValue] = useState<string>("");
    const [loginValue, setLoginValue] = useState<string>("");
    const [passwordValue, setPasswordValue] = useState<string>("");
    const [confirmPasswordValue, setConfirmPasswordValue] = useState<string>("");
    const [state, setState] = useState<"sign_in" | "sign_up">("sign_in");

    async function SignIn() {
        if (await Auth.login(emailValue, passwordValue)) {
            props.handler({ action: "go", to: "home" });
        }
    }

    async function SignUp() {
        if (passwordValue !== confirmPasswordValue) {
            Alert.alert("Passwords do not match");
            return;
        }
        if (await Auth.register(loginValue, emailValue, passwordValue)) {
            props.handler({ action: "go", to: "home" });
        }
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
                        <InputField onChangeText={value => setEmailValue(value)} placeholder={t.email} key={t.email + "1"} />
                        <InputField
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
                        <InputField onChangeText={value => setLoginValue(value)} placeholder={t.login} key={t.login + "2"} />
                        <InputField onChangeText={value => setEmailValue(value)} placeholder={t.email} key={t.email + "2"} />
                        <InputField
                            onChangeText={value => setPasswordValue(value)}
                            placeholder={t.password}
                            secureTextEntry={true}
                            key={t.password + "2"}
                        />
                        <InputField
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
                <TouchableOpacity style={styles.languageButton} onPress={() => changeLanguage(props.handler)}>
                    <Icon name="language" size={24} color="#fff" />
                    <Text style={Styles.primaryText}>{t.language}</Text>
                </TouchableOpacity>
            </Animated.View>
        </SafeAreaView>
    );
}

export default SignPage;
