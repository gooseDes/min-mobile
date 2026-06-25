import { ApiClient } from "@min/api-client";
import Auth from "./auth";

export const apiClient = new ApiClient({ url: process.env.EXPO_PUBLIC_SERVER ?? "" });

export async function initSocket() {
    apiClient.socket.reset();
    apiClient.initSocket(await Auth.getFromStorage("token"));
}
