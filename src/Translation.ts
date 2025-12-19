export interface Language {
    chats?: string;
    log_out?: string;
    language?: string;
}

class Translation {
    static lang: string = "en";

    static en: Language = {
        chats: "Chats",
        log_out: "Log Out",
        language: "Language",
    };

    static ru: Language = {
        chats: "Чаты",
        log_out: "Выйти",
        language: "Язык",
    };

    static ua: Language = {
        chats: "Чати",
        log_out: "Вийти",
        language: "Мова",
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
