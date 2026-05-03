import { ThemeData, useAppStyles } from "@/Style";
import { StyleSheet, View } from "react-native";

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
    style?: any;
}

function Divider(props: DividerProps) {
    const styles = useAppStyles(createStyles);

    return <View style={[styles.divider, props.style]} />;
}

export default Divider;
