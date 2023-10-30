import { createContext } from "react";
import {
    TypingTextAnimation,
    TypingTextAnimationType,
} from "./UtilComps/TypingTextAnimation";
import { TextAnimation } from "./UtilComps/TextAnimation";
// type DeepPartial<T> = T extends object
//     ? {
//           [P in keyof T]?: DeepPartial<T[P]>;
//       }
//     : T;

export interface Dictionary {
    nav: {
        loginButton: string;
        logoutButton: string;
        loginPlaceholder: string;
        welcomeText(username: string): string;
    };
    roomlist: {
        loading(): JSX.Element;
    };
    waitingForServer: string;
    langCode: string;
}

export const EnglishLanguage: Dictionary = {
    nav: {
        welcomeText: (name: string) => `Welcome ${name}!`,
        loginButton: "Login",
        logoutButton: "Logout",
        loginPlaceholder: "Login",
    },
    roomlist: {
        loading() {
            return (
                <>
                    Loading room list.
                    <br />
                    Please wait
                    <TypingTextAnimation
                        value="..."
                        delay={125}
                        type={TypingTextAnimationType.Infinite}
                    />
                </>
            );
        },
    },
    waitingForServer: "Waiting for server to start!",
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
    roomlist: {
        loading() {
            return (
                <>
                    Ładowanie listy pokoi
                    <br />
                    Proszę czekać
                    <TypingTextAnimation
                        delay={125}
                        value="..."
                        type={TypingTextAnimationType.Infinite}
                    />
                </>
            );
        },
    },
    waitingForServer: "Czekanie na ukończenie włączania serwera!",
    langCode: "PL",
};

export const Dictionaries: Record<string, Dictionary> = {
    PL: PolishLanguage,
    EN: EnglishLanguage,
} as const;

export const Language = createContext<Dictionary>(EnglishLanguage);
