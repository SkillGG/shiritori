import { useEffect, useState } from "react";
import "./App.css";
import { GameNav } from "./GameNav";
import { Dictionaries, Language } from "./strings";
import { Server } from "./server";

import Cookies from "js-cookie";
import { ThemeContext } from "./themes/themeContext";
import { darkTheme } from "./themes/darkTheme";
import { Theme } from "./themes/theme";
import { Game } from "./Game";
import {
    TypingTextAnimation,
    TypingTextAnimationType,
} from "./UtilComps/TypingTextAnimation";

function App() {
    const [userName, setUserName] = useState<string | null>(
        Cookies.get("userlogon") || null
    );

    const [theme, setTheme] = useState<Theme>(darkTheme);

    const [langCode, setLangCode] = useState<keyof typeof Dictionaries>("EN");

    const [serverOffline, setServerOffline] = useState(true);

    window.onload = () => {
        // check if server in online!
        Server.checkState(() => setServerOffline(false));
    };

    const lang = Dictionaries[langCode];

    useEffect(() => {
        document.body.style.backgroundColor = theme.backgroundColor;
        document.body.style.color = theme.textColor;
    }, [theme]);

    return (
        <ThemeContext.Provider value={theme}>
            <Language.Provider value={lang}>
                <GameNav
                    onlyOptions={serverOffline}
                    setTheme={(th) => setTheme(() => th)}
                    username={userName}
                    login={(as: string) => {
                        Server.sendPOST("user/login", "user/login", {
                            playerid: as,
                        }).then(() => {
                            setUserName(as);
                        });
                    }}
                    logout={() => {
                        Server.sendPOST("user/logout", "user/logout", {}).then(
                            () => {
                                setUserName(null);
                            }
                        );
                    }}
                    changeLangCode={(c: keyof typeof Dictionaries) => {
                        setLangCode(() => c);
                    }}
                    toggleLang={() => {
                        let newLangCode: keyof typeof Dictionaries = langCode;
                        const codes: (keyof typeof Dictionaries)[] =
                            Object.values(Dictionaries).map(
                                (d) => d.langCode as keyof typeof Dictionaries
                            );
                        const indx = codes.indexOf(langCode);
                        if (indx > -1) {
                            if (indx === codes.length - 1)
                                newLangCode = codes[0];
                            else newLangCode = codes[indx + 1];
                        }
                        setLangCode(() => newLangCode);
                    }}
                />
                {serverOffline ? (
                    <>
                        <p
                            style={{
                                margin: "0 auto",
                                width: "fit-content",
                                fontSize: "3em",
                            }}
                        >
                            {Dictionaries[langCode].waitingForServer}
                        </p>
                        <svg
                            id="waitingforserver"
                            viewBox="0 0 50 50"
                            width={100}
                            height={100}
                        >
                            <circle
                                cx={25}
                                cy={25}
                                r={14}
                            />
                        </svg>
                    </>
                ) : (
                    userName && <Game _={null} />
                )}
            </Language.Provider>
        </ThemeContext.Provider>
    );
}

export default App;
