import { SERVER } from "@env";
import * as Keychain from "react-native-keychain";

export default class Auth {
    static id: number | null;
    static username: string | null;

    static init() {
        Auth.getFromStorage("username").then(username => {
            Auth.username = username;
        });
        Auth.getFromStorage("id").then(id => {
            Auth.id = parseInt(id, 10);
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
            await this.setInStorage("token", json.token);
            await this.setInStorage("username", json.username);
            await this.setInStorage("email", email);
            await this.setInStorage("id", json.id.toString());
            Auth.username = json.username;
            Auth.id = json.id;
        } else {
            console.error(`Faliled :( ${json.msg || ""}`);
            return false;
        }
        console.log("Logined!");
        return true;
    }

    static async register(login: string, email: string, password: string) {
        const response = await fetch(`${SERVER}/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username: login, email: email, password: password }),
        });
        const json = await response.json();
        if (response.ok) {
            console.log(json);
            await this.setInStorage("token", json.token);
            await this.setInStorage("username", json.username);
            await this.setInStorage("email", email);
            await this.setInStorage("id", json.id.toString());
            Auth.username = json.username;
            Auth.id = json.id;
        } else {
            console.error(`Faliled :( ${json.msg || ""}`);
            return false;
        }
        console.log("Registered!");
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
