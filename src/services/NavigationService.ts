import { createNavigationContainerRef } from "@react-navigation/native";

type RootStackParamList = {
    Home: undefined;
    Sign: undefined;
    Settings: undefined;
    Profile: undefined;
};

export const navigationRef = createNavigationContainerRef<RootStackParamList>();

export let initialRouteName: keyof RootStackParamList = "Home";

export function navigate(name: keyof RootStackParamList, mode: "reset" | "push" = "reset") {
    if (navigationRef.isReady()) {
        if (mode === "push") {
            navigationRef.navigate(name);
        } else {
            navigationRef.reset({ index: 0, routes: [{ name }] });
        }
    } else {
        initialRouteName = name;
    }
}

export function goBack() {
    if (navigationRef.isReady()) {
        navigationRef.goBack();
    }
}
