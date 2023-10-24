import { FC, useRef } from "react";
import { Dictionaries, Dictionary } from "../strings";

interface GameNavProps {
    lang: Dictionary;
    changeLangCode(c: keyof typeof Dictionaries): void;
    toggleLang(): void;
    username: string | null;
    login(as: string): void;
    logout(): void;
}

export const GameNav: FC<GameNavProps> = ({
    username,
    login,
    logout,
    lang,
    changeLangCode,
    toggleLang,
}) => {
    const usernameRef = useRef<HTMLInputElement>(null);

    return (
        <>
            <nav>
                <div className="navOptions">
                    <button
                        className=""
                        onClick={() => {
                            toggleLang();
                        }}
                    >
                        {lang.langCode}
                    </button>
                </div>
                <div className={`loginForm ${username ? "loggedin" : ""}`}>
                    {username ? (
                        `${lang.nav.welcomeText(username)}`
                    ) : (
                        <>
                            <input type="text" ref={usernameRef} />
                            <button
                                onClick={() => {
                                    if (!usernameRef.current) return;
                                    login(usernameRef.current.value);
                                }}
                            >
                                {lang.nav.loginButton}
                            </button>
                        </>
                    )}
                </div>
            </nav>
        </>
    );
};
