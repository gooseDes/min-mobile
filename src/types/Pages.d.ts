interface PageHandler {
    (command: CommandData): void;
}

interface PageProps {
    handler: PageHandler;
}

interface CommandData {
    action: "go" | "back" | "notify";
    to?: "Home" | "Sign" | "Settings";
    title?: string;
    text?: string;
    image?: string | null;
}
