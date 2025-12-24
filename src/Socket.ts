import { io, Socket } from "socket.io-client";
import { SERVER } from "@env";
import Auth from "./Auth";

var socket: Socket | null = null;
var promise: Promise<string>;

export async function getSocket(): Promise<Socket> {
    if (!socket) {
        if (!promise) {
            console.log("Fetching token from storage");
            console.log(`Connecting to ${SERVER}`);
            promise = Auth.getFromStorage("token");
        }
        socket = io(SERVER, {
            auth: {
                token: await promise,
            },
        });
    }
    return socket;
}
