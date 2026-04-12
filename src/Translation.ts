import Storage from "./Storage";

export interface Language {
    language_name?: string;
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
    relogin?: string;
    relogin_msg?: string;
    ok?: string;
    settings?: string;
    now?: string;
    change_language?: string;
    clear_cache?: string;

    // Create Chat popup
    create_chat?: string;
    enter_username?: string;
    username_placeholder?: string;

    // Message dropdown
    cancel?: string;
    reply?: string;
    delete?: string;

    // Settings
    settings_general?: string;
    settings_language_time?: string;
    settings_cache?: string;
    settings_language?: string;
    settings_24_hour_time?: string;

    // Time
    code?: string;
    yesterday?: string;

    // Profile
    profile?: string;
    edit?: string;
    apply?: string;
}

class Translation {
    static lang: string = "en";

    static en: Language = {
        language_name: "English",
        chats: "Chats",
        log_out: "Log Out",
        language: "Language",
        sign_in: "Sign In",
        have_account: "Have Account?",
        sign_up: "Sign Up",
        no_account: "No Account?",
        welcome: "Welcome!",
        login: "Login",
        email: "Email",
        password: "Password",
        confirm_password: "Confirm Password",
        you: "You",
        your_message: "Your Message",
        private_chat: "Private Chat",
        group_chat: "Group Chat",
        relogin: "Relogin",
        relogin_msg: "Please relogin.",
        ok: "OK",
        settings: "Settings",
        now: "Now",
        change_language: "Change Language",
        clear_cache: "Clear Cache",

        // Create Chat popup
        create_chat: "Create Chat",
        enter_username: "Enter username of the person you want to chat with:",
        username_placeholder: "Username",

        // Message dropdown
        cancel: "Cancel",
        reply: "Reply",
        delete: "Delete",

        // Settings
        settings_general: "General",
        settings_language_time: "Language & Time",
        settings_cache: "Cache",
        settings_language: "Language",
        settings_24_hour_time: "Force 24-hour time",

        // Time
        code: "en",
        yesterday: "Yesterday",

        // Profile
        profile: "Profile",
        edit: "Edit",
        apply: "Apply",
    };

    static ru: Language = {
        language_name: "Русский",
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
        relogin: "Перелогинтесь",
        relogin_msg: "Пожалуйста, зайдите в свой аккаунт снова.",
        ok: "OK",
        settings: "Опции",
        now: "Сейчас",
        change_language: "Сменить язык",
        clear_cache: "Очистить кэш",

        // Create Chat popup
        create_chat: "Создать чат",
        enter_username: "Введите имя пользователя, с которым хотите начать чат:",
        username_placeholder: "Имя пользователя",

        // Message dropdown
        cancel: "Отменить",
        reply: "Ответить",
        delete: "Удалить",

        // Settings
        settings_general: "Общие",
        settings_language_time: "Язык и время",
        settings_cache: "Кэш",
        settings_language: "Язык",
        settings_24_hour_time: "Принудительный 24-часовой формат",

        // Time
        code: "ru",
        yesterday: "Вчера",

        // Profile
        profile: "Профиль",
        edit: "Изменить",
        apply: "Сохранить",
    };

    static ua: Language = {
        language_name: "Українська",
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
        relogin: "Перелогинтесь",
        relogin_msg: "Будь ласка, зайдіть в свій акаунт повторно.",
        ok: "OK",
        settings: "Опції",
        now: "Зараз",
        change_language: "Змінити мову",
        clear_cache: "Очистити кеш",

        // Create Chat popup
        create_chat: "Створити чат",
        enter_username: "Введіть ім'я користувача, з яким ви хочете почати чат:",
        username_placeholder: "Ім'я користувача",

        // Message dropdown
        cancel: "Відмінити",
        reply: "Відповісти",
        delete: "Видалити",

        // Settings
        settings_general: "Загальні",
        settings_language_time: "Мова та час",
        settings_cache: "Кеш",
        settings_language: "Мова",
        settings_24_hour_time: "Примусовий 24-годинний формат",

        // Time
        code: "uk",
        yesterday: "Вчора",

        // Profile
        profile: "Профіль",
        edit: "Змінити",
        apply: "Зберегти",
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

    static init() {
        const storedLang = Storage.getString("language");
        if (storedLang) {
            Translation.setCurrentLanguage(storedLang);
        }
    }
}

export default Translation;

export const t: Language = new Proxy(
    {},
    {
        get(_, key: string): string {
            const current = Translation.getCurrentTranslation();
            return (current as any)[key] || (Translation.en as any)[key] || key;
        },
    },
);

export function changeLanguage(lang?: string): string {
    const current = Translation.getCurrentLanguage();
    let newLang: string = "";
    if (lang) {
        newLang = lang;
    } else if (current === "en") newLang = "ru";
    else if (current === "ru") newLang = "ua";
    else if (current === "ua") newLang = "en";
    Storage.set("language", newLang);
    Translation.setCurrentLanguage(newLang);
    return newLang;
}
