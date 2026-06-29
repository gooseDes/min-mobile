import { ThemeData, useAppStyles } from "@/style";
import { StyleProp, StyleSheet, View, ViewStyle } from "react-native";

const createStyles = (theme: ThemeData) =>
    StyleSheet.create({
        divider: {
            backgroundColor: theme.dividerColor,
            borderColor: theme.dividerColor,
            borderWidth: theme.borderWidth / 2,
            borderRadius: 999,
            width: "100%",
        },
    });

interface DividerProps {
    style?: StyleProp<ViewStyle>;
}

function Divider(props: DividerProps) {
    const styles = useAppStyles(createStyles);

    return <View style={[styles.divider, props.style]} />;
}

export default Divider;
