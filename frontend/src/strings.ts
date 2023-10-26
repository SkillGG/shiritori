type DeepPartial<T> = T extends object
    ? {
          [P in keyof T]?: DeepPartial<T[P]>;
      }
    : T;

export interface Dictionary {
    nav: {
        loginButton: string;
        logoutButton: string;
        loginPlaceholder: string;
        welcomeText(username: string): string;
    };
    langCode: string;
}

export const EnglishLanguage: Dictionary = {
    nav: {
        welcomeText: (name: string) => `Welcome ${name}!`,
        loginButton: "Login",
        logoutButton: "Logout",
        loginPlaceholder: "Login"
    },
    langCode: "EN",
};

export const PolishLanguage: Dictionary = {
    ...EnglishLanguage,
    nav: {
        ...EnglishLanguage.nav,
        loginButton: "Zaloguj",
        welcomeText(username: string) {
            return `Witaj ${username}`;
        },
    },
    langCode: "PL",
};

export const Dictionaries: Record<string, Dictionary> = {
    PL: PolishLanguage,
    EN: EnglishLanguage,
} as const;
