import * as Keychain from "react-native-keychain";
import { apiClient, resetSocket } from "./Socket";
import Storage from "./Storage";

export type AuthResult =
    | {
          success: true;
      }
    | {
          success: false;
          message: string;
      };

export default class Auth {
    static id: number | null;
    static username: string | null;

    static init() {
        Auth.getFromStorage("username").then(username => {
            Auth.username = username;
            if (username) Storage.set("user.username", username);
        });
        Auth.getFromStorage("id").then(id => {
            const idNum = parseInt(id, 10);
            Auth.id = idNum;
            if (idNum) Storage.set("user.id", idNum);
        });
    }

    static async login(email: string, password: string): Promise<AuthResult> {
        const result = await apiClient.login(email, password);
        if (result.success) {
            await this.setInStorage("id", result.user.id.toString());
            await this.setInStorage("email", result.user.email);
            await this.setInStorage("username", result.user.username);
            await this.setInStorage("token", result.token);
            Storage.set("user.id", result.user.id);
            Storage.set("user.username", result.user.username);
            Auth.id = result.user.id;
            Auth.username = result.user.username;
            resetSocket();
            return { success: true };
        } else {
            return { success: false, message: result.message };
        }
    }

    static async register(login: string, email: string, password: string): Promise<AuthResult> {
        const result = await apiClient.register(login, email, password);
        if (result.success) {
            await this.setInStorage("id", result.user.id.toString());
            await this.setInStorage("email", result.user.email);
            await this.setInStorage("username", result.user.username);
            await this.setInStorage("token", result.token);
            Storage.set("user.id", result.user.id);
            Storage.set("user.username", login);
            Auth.id = result.user.id;
            Auth.username = login;
            resetSocket();
            return { success: true };
        } else {
            return { success: false, message: result.message };
        }
    }

    static async getAllFromStorage(): Promise<any> {
        const data: any = await Keychain.getGenericPassword();
        let json = null;
        try {
            json = JSON.parse(data.password);
        } catch {
            json = {};
        }
        return json;
    }

    static async getFromStorage(key: string): Promise<string> {
        return (await this.getAllFromStorage())[key];
    }

    static async setInStorage(key: string, value: string) {
        const json = await this.getAllFromStorage();
        json[key] = value;
        await Keychain.setGenericPassword("data", JSON.stringify(json));
    }

    static async clearStorage() {
        await Keychain.resetGenericPassword();
    }
}
