import Zod from "zod";

export class Server {
    static serverPath = `http${
        import.meta.env.HTTPS === "https" ? "s" : ""
    }://${import.meta.env.SERVER_HOST}:${import.meta.env.SERVER_PORT}`;
    // static serverPath = "https://shiritori.skillgg.replit.co:9000"
    static async sendToServer<T extends Zod.ZodType>(
        path: string,
        init: RequestInit = {},
        resShape?: T
    ): Promise<Zod.infer<T> | undefined> {
        window.document.body.style.cursor = "wait";
        return await fetch(Server.serverPath + path, {
            credentials: "include",
            ...init,
        })
            .then(async (r: Response) => {
                window.document.body.style.cursor = "";
                if (!resShape) {
                    console.error("No response shape provided!");
                    return undefined;
                }
                if (r.ok) {
                    const resp = await r.json();
                    const safe = resShape.safeParse(resp);
                    if (safe.success) {
                        return safe.data;
                    } else {
                        console.error(safe.error);
                        return undefined;
                    }
                } else {
                    throw "Erroneous response! " + r.body;
                }
            })
            .catch((err) => {
                console.error(err);
            });
    }
    static async sendPOST<T extends Zod.ZodType>(
        path: string,
        body: { data: object },
        resShape?: T,
        init: RequestInit = {}
    ): Promise<Zod.infer<T> | undefined> {
        const r = await fetch(`${Server.serverPath}${path}`, {
            credentials: "include",
            method: "post",
            body: JSON.stringify(body),
            ...init,
        });
        if (!resShape) {
            console.error("No response shape provided!");
            return undefined;
        }
        if (r.ok) {
            const resp = await r.json();
            const safe = resShape.safeParse(resp);
            if (safe.success) {
                return safe.data;
            } else {
                console.error(safe.error);
                return undefined;
            }
        } else {
            throw "Erroneous response! " + r.body;
        }
    }
}
