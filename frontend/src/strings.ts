export interface Dictionary {
    nav: {
        loginButton: string;
        welcomeText(username: string): string;
    };
    langCode: string;
}

export const EnglishLanguage: Dictionary = {
    nav: {
        welcomeText: (name: string) => `Welcome ${name}!`,
        loginButton: "Login",
    },
    langCode: "EN",
};

export const PolishLanguage: Dictionary = {
    nav: {
        loginButton: "Zaloguj",
        welcomeText(username) {
            return `Witaj ${username}`;
        },
    },
    langCode: "PL",
};

export const Dictionaries: Record<string, Dictionary> = {
    PL: PolishLanguage,
    EN: EnglishLanguage,
} as const;
