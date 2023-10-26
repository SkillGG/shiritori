import { createContext } from "react";
import { darkTheme } from "./darkTheme";
import { Theme } from "./theme";

export const ThemeContext = createContext<Theme>(darkTheme);
