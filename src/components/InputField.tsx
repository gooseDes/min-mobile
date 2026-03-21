import { Colors, Styles } from "@/Style";
import { TextInput, TextInputProps } from "react-native";

function InputField(props: TextInputProps) {
    const { style, children, ...rest } = props;

    return (
        <TextInput
            placeholderTextColor={Colors.secondaryTextColor}
            cursorColor={Colors.primaryTextColor}
            style={[Styles.textInput, style]}
            {...rest}
        >
            {children}
        </TextInput>
    );
}

export default InputField;
