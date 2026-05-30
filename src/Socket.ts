import { SERVER } from "@env";
import { ApiClient } from "@min/api-client";
import { io, Socket } from "socket.io-client";
import Auth from "./Auth";

let socketPromise: Promise<Socket> | null = null;

export const apiClient = new ApiClient({ url: SERVER });

export async function getSocket(): Promise<Socket> {
    if (socketPromise) {
        return socketPromise;
    }

    socketPromise = (async () => {
        try {
            console.log("Fetching token from storage");
            const token = await Auth.getFromStorage("token");

            console.log(`Connecting to ${SERVER}`);
            const socket = io(SERVER, {
                auth: { token },
            });

            return socket;
        } catch (error) {
            socketPromise = null;
            throw error;
        }
    })();

    return socketPromise;
}

export async function resetSocket() {
    socketPromise = null;
}
