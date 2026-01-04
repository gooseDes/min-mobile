interface MessageData {
    id: number;
    text: string;
    authorId: number;
    authorName: string;
    chatId: number;
}

interface ChatData {
    id: number;
    title: string;
    participants: any[];
}

interface UserData {
    id: number;
    name: string;
}

interface CommandData {
    action: "go" | "changeLanguage" | "openPopup";
    to?: "Home" | "Sign" | "Profile";
}
