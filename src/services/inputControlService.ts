import { MessageInputHandle } from "@components/HomePage/MessageInput";
import React from "react";

export const messageInputRef = React.createRef<MessageInputHandle>();

export function setMessagePrefix(prefix: string) {
    messageInputRef.current?.setMessagePrefix(prefix);
}
