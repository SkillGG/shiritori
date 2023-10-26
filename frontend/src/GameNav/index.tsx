import { FC, useContext, useRef } from "react";
import { Dictionaries, Dictionary } from "../strings";
import { Theme } from "../themes/theme";
import { ThemeContext } from "../themes/themeContext";
import { darkTheme } from "../themes/darkTheme";
import { lightTheme } from "../themes/lightTheme";

interface GameNavProps {
    lang: Dictionary;
    changeLangCode(c: keyof typeof Dictionaries): void;
    toggleLang(): void;
    setTheme(th: Theme): void;
    username: string | null;
    login(as: string): void;
    logout(): void;
}

import "./index.css";

export const GameNav: FC<GameNavProps> = ({
    username,
    login,
    logout,
    lang,
    changeLangCode,
    toggleLang,
    setTheme,
}) => {
    const usernameRef = useRef<HTMLInputElement>(null);

    const theme = useContext(ThemeContext);

    const navSettingButtonStyle: React.CSSProperties = {
        color: theme.textColor,
        backgroundColor: theme.backgroundColor,
        border: `2px solid ${theme.textColorSecondary}`,
        margin: "1px",
        padding: "5px",
    };

    return (
        <>
            <nav>
                <div className="navOptions">
                    <button
                        style={{
                            ...navSettingButtonStyle,
                        }}
                        className="navSettingButton"
                        onClick={() => {
                            toggleLang();
                        }}
                    >
                        {lang.langCode}
                    </button>
                    <button
                        style={{
                            ...navSettingButtonStyle,
                        }}
                        className="navSettingButton"
                        onClick={() => {
                            setTheme(theme.id === 0 ? darkTheme : lightTheme);
                        }}
                    >
                        {theme.id === 0 ? "D" : "W"}
                    </button>
                </div>
                <div className={`loginForm ${username ? "loggedin" : ""}`}>
                    {username ? (
                        <>
                            {lang.nav.welcomeText(username)}
                            <button onClick={() => logout()}>
                                {lang.nav.logoutButton}
                            </button>
                        </>
                    ) : (
                        <>
                            <input
                                type="text"
                                ref={usernameRef}
                                placeholder={`${lang.nav.loginPlaceholder}`}
                                style={{
                                    backgroundColor:
                                        theme.backgroundColorSecondary,
                                    color: theme.textColor,
                                    border: "none",
                                }}
                            />
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
