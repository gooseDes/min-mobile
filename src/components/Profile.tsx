import { getSocket } from "@/Socket";
import { Constants, Styles } from "@/Style";
import { CreateUserData } from "@/Utils";
import { SERVER } from "@env";
import { useEffect, useState } from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import Animated, { ZoomIn, ZoomOut } from "react-native-reanimated";

const styles = StyleSheet.create({
    container: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        aspectRatio: 0.5,
        flex: 1,
    },
    avatar: {
        aspectRatio: 1,
        width: 200,
        borderRadius: 999,
    },
    name: {
        fontSize: 32,
        fontWeight: "bold",
        marginTop: 10,
        textAlign: "center",
    },
});

export interface ProfileProps {
    id: number;
}

function Profile(props: ProfileProps) {
    const [user, setUser] = useState<UserData>(CreateUserData({ id: props.id }));

    useEffect(() => {
        async function fetchUser() {
            const socket = await getSocket();
            socket.on("userInfo", data => {
                setUser(CreateUserData(data.user));
                socket.off("userInfo");
            });
            socket.emit("getUserInfo", { id: props.id });
        }
        fetchUser();
    }, [props.id]);

    return (
        <Animated.View layout={Constants.layoutTransition} entering={ZoomIn} exiting={ZoomOut} style={styles.container}>
            {user && (
                <View>
                    <Image source={{ uri: `${SERVER}/avatars/${user.id}.webp` }} style={styles.avatar} />
                    <Text style={[Styles.primaryText, styles.name]} selectable={true}>
                        {user.name}
                    </Text>
                </View>
            )}
            <View style={{ flex: 1 }} />
        </Animated.View>
    );
}

export default Profile;
