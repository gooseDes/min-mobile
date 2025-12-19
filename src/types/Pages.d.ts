interface CommandData {
    action: "go" | "changeLanguage";
    to?: "home" | "sign";
}

interface PageProps {
    handler: (command: CommandData) => void;
}
