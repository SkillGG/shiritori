import { useState } from "react";
import "./App.css";
import { GameNav } from "./GameNav";
import { Dictionaries } from "./strings";

function App() {
    const [userName, setUserName] = useState<string | null>(
        localStorage.getItem("login") || null
    );

    const [langCode, setLangCode] = useState<keyof typeof Dictionaries>("EN");

    return (
        <>
            <GameNav
                username={userName}
                login={(as: string) => {
                    setUserName(as);
                    localStorage.setItem("login", as);
                }}
                logout={() => {
                    setUserName(null);
                    localStorage.removeItem("login");
                }}
                lang={Dictionaries[langCode]}
                changeLangCode={(c: keyof typeof Dictionaries) => {
                    setLangCode(() => c);
                }}
                toggleLang={() => {
                    let newLangCode: keyof typeof Dictionaries = langCode;
                    const codes: (keyof typeof Dictionaries)[] = Object.values(
                        Dictionaries
                    ).map((d) => d.langCode as keyof typeof Dictionaries);
                    const indx = codes.indexOf(langCode);
                    if (indx > -1) {
                        if (indx === codes.length - 1) newLangCode = codes[0];
                        else newLangCode = codes[indx + 1];
                    }
                    setLangCode(() => newLangCode);
                }}
            />
        </>
    );
}

export default App;
