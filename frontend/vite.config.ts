import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import { configDotenv } from "dotenv";

// https://vitejs.dev/config/
export default defineConfig(() => {
    configDotenv({ path: "./../.env" });

    return {
        plugins: [react()],
        define: {
            _SERVER_INFO: {
                HOST: process.env.SERVER_HOST,
                PORT: process.env.SERVER_PORT,
                HTTPS: process.env.HTTPS,
                EXTHOST: process.env.EXTERNAL_HOST
            },
        },
    };
});
