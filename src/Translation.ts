import AsyncStorage from "@react-native-async-storage/async-storage";

export interface Language {
    chats?: string;
    log_out?: string;
    language?: string;
    sign_in?: string;
    have_account?: string;
    sign_up?: string;
    no_account?: string;
    welcome?: string;
    login?: string;
    email?: string;
    password?: string;
    confirm_password?: string;
    you?: string;
    your_message?: string;
    private_chat?: string;
    group_chat?: string;
}

class Translation {
    static lang: string = "en";

    static en: Language = {
        chats: "Chats",
        log_out: "Log Out",
        language: "Language",
        sign_in: "Sign In",
        have_account: "Have Account?",
        sign_up: "Sign Up",
        no_account: "No Account?",
        welcome: "Welcome, Master!",
        login: "Login",
        email: "Email",
        password: "Password",
        confirm_password: "Confirm Password",
        you: "You",
        your_message: "Your Message",
        private_chat: "Private Chat",
        group_chat: "Group Chat",
    };

    static ru: Language = {
        chats: "Чаты",
        log_out: "Выйти",
        language: "Язык",
        sign_in: "Войти",
        have_account: "Уже есть аккаунт?",
        sign_up: "Зарегистрироваться",
        no_account: "Нет аккаунта?",
        welcome: "Здарова!",
        login: "Логин",
        email: "Почта",
        password: "Пароль",
        confirm_password: "Подтвердите пароль",
        you: "Вы",
        your_message: "Ваше сообщение",
        private_chat: "Личный чат",
        group_chat: "Групповой чат",
    };

    static ua: Language = {
        chats: "Чати",
        log_out: "Вийти",
        language: "Мова",
        sign_in: "Увійти",
        have_account: "Вже є акаунт?",
        sign_up: "Зареєструватися",
        no_account: "Немає акаунту?",
        welcome: "Здоровенькі були!",
        login: "Логін",
        email: "Пошта",
        password: "Пароль",
        confirm_password: "Підтвердіть пароль",
        you: "Ви",
        your_message: "Ваше повідомлення",
        private_chat: "Особистий чат",
        group_chat: "Груповий чат",
    };

    static getCurrentTranslation(): Language {
        return (Translation as any)[Translation.lang] || Translation.en;
    }

    static getCurrentLanguage(): string {
        return Translation.lang;
    }

    static setCurrentLanguage(lang: string): void {
        Translation.lang = lang;
    }

    static async init() {
        const storedLang = await AsyncStorage.getItem("language");
        if (storedLang) {
            Translation.setCurrentLanguage(storedLang);
        }
    }
}

export default Translation;

export const t: Language = new Proxy(
    {},
    {
        get(_, key: string) {
            const current = Translation.getCurrentTranslation();
            return (current as any)[key] || (Translation.en as any)[key] || key;
        },
    },
);

export function changeLanguage(handler: PageProps["handler"] | null = null) {
    const current = Translation.getCurrentLanguage();
    let newLang: string = "";
    if (current === "en") newLang = "ru";
    if (current === "ru") newLang = "ua";
    if (current === "ua") newLang = "en";
    AsyncStorage.setItem("language", newLang);
    Translation.setCurrentLanguage(newLang);
    if (handler) handler({ action: "changeLanguage" });
}
