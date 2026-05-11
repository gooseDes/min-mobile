interface DropdownItemData {
    text?: string;
    icon?: string;
    onPress?: () => void;
}

type OverlayState = "none" | "downloading" | "loading";
