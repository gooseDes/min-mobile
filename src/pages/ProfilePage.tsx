import { Styles } from "@/Style";
import { SERVER } from "@env";
import { forwardRef, useImperativeHandle, useState } from "react";
import { Text, View } from "react-native";
import Animated from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

export interface ProfilePageHandler {
    setUser: (newUser: UserData) => void;
}

const ProfilePage = forwardRef<ProfilePageHandler, PageProps>((props, ref) => {
    const [user, setUser] = useState<UserData | null>({ id: 6, name: "Miha" });

    useImperativeHandle(ref, () => ({
        setUser: (newUser: UserData) => {
            setUser(newUser);
        },
    }));

    return (
        <SafeAreaView style={Styles.container}>
            {user && (
                <View>
                    <Animated.Image
                        source={{ uri: `${SERVER}/avatars/${user.id}.webp` }}
                        style={{ width: 300, height: 300 }}
                        sharedTransitionTag="avatarShared"
                    />
                    <Text style={Styles.primaryText}>{user.name}</Text>
                </View>
            )}
        </SafeAreaView>
    );
});

export default ProfilePage;
