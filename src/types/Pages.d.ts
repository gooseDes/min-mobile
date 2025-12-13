interface CommandData {
    action: "go";
    to?: "home" | "sign";
}

interface PageProps {
    handler: (command: CommandData) => void;
}
