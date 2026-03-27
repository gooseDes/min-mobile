import { SERVER } from "@env";
import * as Keychain from "react-native-keychain";
import Storage from "./Storage";

export class AuthResult {
    constructor(public success: boolean, public message: string = "") {}
}

export default class Auth {
    static id: number | null;
    static username: string | null;

    static init() {
        Auth.getFromStorage("username").then(username => {
            Auth.username = username;
            Storage.set("user.username", username);
        });
        Auth.getFromStorage("id").then(id => {
            const idNum = parseInt(id, 10);
            Auth.id = idNum;
            Storage.set("user.id", idNum);
        });
    }

    static async login(email: string, password: string): Promise<AuthResult> {
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
            const error = new AuthResult(false, json.msg || "");
            console.error(`Faliled :( ${error.message}`);
            return error;
        }
        console.log("Logined!");
        return new AuthResult(true);
    }

    static async register(login: string, email: string, password: string): Promise<AuthResult> {
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
            const error = new AuthResult(false, json.msg || "");
            console.error(`Faliled :( ${error.message}`);
            return error;
        }
        console.log("Registered!");
        return new AuthResult(true);
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
