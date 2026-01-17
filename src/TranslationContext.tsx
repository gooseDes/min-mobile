import React, { createContext, useCallback, useContext, useMemo, useState } from "react";
import Translation, { Language } from "./Translation";

interface TranslationContextProps {
    lang: string;
    t: Language;
    changeLanguage: () => void;
}

const TranslationContext = createContext<TranslationContextProps | undefined>(undefined);

export const TranslationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [lang, setLang] = useState(Translation.getCurrentLanguage());

    const changeLanguage = useCallback(() => {
        let newLang = "en";
        if (lang === "en") newLang = "ru";
        if (lang === "ru") newLang = "ua";
        if (lang === "ua") newLang = "en";
        Translation.setCurrentLanguage(newLang);
        setLang(newLang);
    }, [lang]);

    const t = useMemo(
        () =>
            new Proxy(
                {},
                {
                    get(_, key: string) {
                        const current = (Translation as any)[lang] || Translation.en;
                        return (current as any)[key] || (Translation.en as any)[key] || key;
                    },
                },
            ) as Language,
        [lang],
    );

    return <TranslationContext.Provider value={{ lang, t, changeLanguage }}>{children}</TranslationContext.Provider>;
};

export const useTranslation = () => {
    const context = useContext(TranslationContext);
    if (!context) throw new Error("useTranslation must be used within a TranslationProvider");
    return context;
};
