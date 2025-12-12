import { Colors, Styles } from "@/Style";
import { TextInput, TextInputProps } from "react-native";

function InputField(props: TextInputProps) {
    return (
        <TextInput
            placeholderTextColor={Colors.secondaryTextColor}
            cursorColor={Colors.primaryTextColor}
            style={Styles.textInput}
            {...props}
        >
            {props.children}
        </TextInput>
    );
}

export default InputField;
