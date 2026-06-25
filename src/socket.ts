import { ApiClient } from "@min/api-client";
import Auth from "./auth";
import { API_URL } from "./env";

export const apiClient = new ApiClient({ url: API_URL });

export async function initSocket() {
    apiClient.socket.reset();
    apiClient.initSocket(await Auth.getFromStorage("token"));
}
