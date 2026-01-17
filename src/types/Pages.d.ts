interface PageHandler {
    (command: CommandData): void;
}

interface PageProps {
    handler: PageHandler;
}

interface CommandData {
    action: "go" | "back";
    to?: "Home" | "Sign" | "Settings";
}
