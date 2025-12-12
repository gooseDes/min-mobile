import Auth from "@/Auth";
import { Colors, Constants, Styles } from "@/Style";
import Button from "@components/Button";
import Divider from "@components/Divider";
import InputField from "@components/InputField";
import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const styles = StyleSheet.create({
    signContainer: {
        backgroundColor: Colors.backgroundPanelColor,
        borderColor: Colors.borderColor,
        borderWidth: Constants.borderWidth,
        width: "100%",
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
        height: 40,
    },
});

interface SignPageProps {
    handler: (command: any) => void;
}

function SignPage(props: SignPageProps) {
    const [emailValue, setEmailValue] = useState<string>("");
    const [passwordValue, setPasswordValue] = useState<string>("");

    async function SignIn() {
        if (await Auth.login(emailValue, passwordValue)) {
            props.handler({ action: "go", to: "home" });
        }
    }

    return (
        <SafeAreaView style={Styles.container}>
            <View style={styles.signContainer}>
                <Text style={Styles.titleText}>Login to Account</Text>
                <Divider />
                <View style={styles.signForm}>
                    <InputField onChangeText={value => setEmailValue(value)} placeholder="Email" />
                    <InputField onChangeText={value => setPasswordValue(value)} placeholder="Password" secureTextEntry={true} />
                </View>
                <Divider />
                <View style={styles.buttonsContainer}>
                    <Button text="Sign In" onPress={SignIn} />
                </View>
            </View>
        </SafeAreaView>
    );
}

export default SignPage;
