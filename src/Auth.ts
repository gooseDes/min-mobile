import * as Keychain from "react-native-keychain";
import { SERVER } from "@env";

export default class Auth {
    static id: number | null;
    static username: string | null;

    static init() {
        Auth.getFromStorage("username").then(username => {
            Auth.username = username;
        });
        Auth.getFromStorage("id").then(id => {
            Auth.id = parseInt(id);
        });
    }

    static async login(email: string, password: string): Promise<boolean> {
        const response = await fetch(`${SERVER}/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: email, password: password }),
        });
        const json = await response.json();
        if (response.ok) {
            console.log(json);
            await this.setInStorage("token", json.token);
            await this.setInStorage("username", json.username);
            await this.setInStorage("email", email);
            await this.setInStorage("id", json.id.toString());
        } else {
            console.error(`Faliled :( \n${response.statusText}`);
            return false;
        }
        console.log("Logined!");
        return true;
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
