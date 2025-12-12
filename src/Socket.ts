import { io, Socket } from "socket.io-client";
import { SERVER } from "@env";
import Auth from "./Auth";

var socket: Socket | null = null;

export async function getSocket(): Promise<Socket> {
    if (!socket) {
        console.log(`Connecting to ${SERVER}`);
        socket = io(SERVER, {
            auth: {
                token: await Auth.getFromStorage("token"),
            },
        });
    }
    return socket;
}
