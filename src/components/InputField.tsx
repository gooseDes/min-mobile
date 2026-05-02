import { createGlobalStyles, useAppStyles, useThemeStore } from "@/Style";
import { TextInput, TextInputProps } from "react-native";

function InputField(props: TextInputProps) {
    const { style, children, ...rest } = props;
    const theme = useThemeStore(s => s.theme);
    const Styles = useAppStyles(createGlobalStyles);

    return (
        <TextInput
            placeholderTextColor={theme.secondaryTextColor}
            cursorColor={theme.primaryTextColor}
            style={[Styles.textInput, style]}
            {...rest}
        >
            {children}
        </TextInput>
    );
}

export default InputField;
