import { SERVER } from "@env";
import { ApiClient } from "@min/api-client";
import Auth from "./Auth";

export const apiClient = new ApiClient({ url: SERVER });

export async function initSocket() {
    apiClient.socket.reset();
    apiClient.initSocket(await Auth.getFromStorage("token"));
}
