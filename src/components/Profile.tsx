import db from "@/db/client";
import { usersTable } from "@/db/schema";
import { apiClient } from "@/socket";
import { Constants, createGlobalStyles, useAppStyles } from "@/style";
import { CreateUserData } from "@/utils";
import { eq } from "drizzle-orm";
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
    const Styles = useAppStyles(createGlobalStyles);

    useEffect(() => {
        async function fetchUser() {
            // Get user info from db
            const userData = await db.select().from(usersTable).where(eq(usersTable.id, props.id)).limit(1);
            setUser(CreateUserData(userData[0]));

            // Get user info from socket
            const userInfo = await apiClient.fetchUser({ userId: props.id });
            if (userInfo.success)
                setUser(
                    CreateUserData({ id: userInfo.user.id, username: userInfo.user.username, avatar: userInfo.user.avatar }),
                );
        }
        fetchUser();
    }, [props.id]);

    return (
        <Animated.View layout={Constants.layoutTransition} entering={ZoomIn} exiting={ZoomOut} style={styles.container}>
            {user && (
                <View style={{ alignItems: "center", justifyContent: "center" }}>
                    <Image
                        source={{ uri: `${process.env.EXPO_PUBLIC_SERVER}/avatars/${user.avatar}.webp` }}
                        style={styles.avatar}
                    />
                    <Text style={[Styles.primaryText, styles.name]} selectable={true}>
                        {user.username}
                    </Text>
                </View>
            )}
            <View style={{ flex: 1 }} />
        </Animated.View>
    );
}

export default Profile;
