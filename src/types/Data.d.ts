interface MessageData {
    id: number;
    text: string;
    sender: UserData;
    chatId: number;
}

interface ChatData {
    id: number;
    title: string;
    participants: any[];
}

interface UserData {
    id: number;
    username: string;
}
