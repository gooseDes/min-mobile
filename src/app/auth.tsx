import Auth from "@/auth";
import { Constants, createGlobalStyles, ThemeData, useAppStyles } from "@/style";
import { getShadow } from "@/utils";
import Button from "@components/Button";
import Divider from "@components/Divider";
import FlatSelector from "@components/FlatSelector";
import Icon from "@components/Icon";
import InputField from "@components/InputField";
import { useTranslation } from "@contexts/TranslationContext";
import { showNotification } from "@services/notifyService";
import { setOverlay } from "@services/overlayService";
import { useRouter } from "expo-router";
import { useState } from "react";
import { StyleSheet, Text, TextInputProps, TouchableOpacity, View } from "react-native";
import Animated, { EntryAnimationsValues, LayoutAnimation, withSpring } from "react-native-reanimated";
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
            height: 50,
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

const animatedInputEntering = (_values: EntryAnimationsValues): LayoutAnimation => {
    "worklet";
    return {
        initialValues: {
            opacity: 0,
            transform: [{ translateX: -100 }],
        },
        animations: {
            opacity: withSpring(1),
            transform: [{ translateX: withSpring(0) }],
        },
    };
};

const animatedInputExiting = (_values: EntryAnimationsValues): LayoutAnimation => {
    "worklet";
    return {
        initialValues: {
            opacity: 1,
            transform: [{ translateX: 0 }],
        },
        animations: {
            opacity: withSpring(0),
            transform: [{ translateX: withSpring(100) }],
        },
    };
};

function AnimatedInputField(props: TextInputProps) {
    const { style, children, ...rest } = props;

    return (
        <Animated.View entering={animatedInputEntering} exiting={animatedInputExiting} layout={Constants.layoutTransition}>
            <InputField style={style} {...rest}>
                {children}
            </InputField>
        </Animated.View>
    );
}

function SignPage() {
    const router = useRouter();
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
            router.replace("/");
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
        if (result.success) {
            router.replace("/");
        } else {
            showNotification("Failed :(", result.message);
        }
        setOverlay("none");
    }

    return (
        <SafeAreaView style={Styles.container}>
            <View style={styles.signContainer}>
                <Text style={Styles.titleText}>{t.welcome}</Text>

                <Divider />

                <FlatSelector
                    options={[t.sign_in, t.sign_up]}
                    onSelect={option => setState(option === t.sign_in ? "sign_in" : "sign_up")}
                />

                <View style={styles.signForm}>
                    <AnimatedInputField
                        autoCapitalize="none"
                        onChangeText={value => setEmailValue(value)}
                        placeholder={t.email}
                        key={t.email}
                    />
                    {state === "sign_up" && (
                        <AnimatedInputField
                            autoCapitalize="none"
                            onChangeText={value => setLoginValue(value)}
                            placeholder={t.login}
                            key={t.login}
                        />
                    )}
                    <AnimatedInputField
                        autoCapitalize="none"
                        onChangeText={value => setPasswordValue(value)}
                        placeholder={t.password}
                        secureTextEntry={true}
                        key={t.password}
                    />
                    {state === "sign_up" && (
                        <AnimatedInputField
                            autoCapitalize="none"
                            onChangeText={value => setConfirmPasswordValue(value)}
                            placeholder={t.confirm_password}
                            secureTextEntry={true}
                            key={t.confirm_password}
                        />
                    )}
                </View>

                <Divider />

                <View style={styles.buttonsContainer}>
                    <Button
                        text={state === "sign_in" ? t.sign_in : t.sign_up}
                        onPress={state === "sign_in" ? SignIn : SignUp}
                        style={{ flex: 1 }}
                    />
                </View>
            </View>

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
