import Zod from "zod";
import { playerIDShape } from "../../shared/events";
import {
    loginShape,
    logoutShape,
    serverRoutes,
} from "../../backend/routeShapes";

const {
    HOST: serverHost,
    PORT: serverPort,
    HTTPS: serverHttps,
    EXTHOST: extHost,
} = _SERVER_INFO;

export class Server {
    static serverPath = `http${serverHttps === "https" ? "s" : ""}://${
        extHost ? extHost : serverHost
    }:${serverPort}/`;
    static async sendToServer<
        X extends keyof typeof serverRoutes,
        Rs extends serverRoutes[X]["res"]
    >(
        path: string,
        pathID: keyof serverRoutes,
        init: RequestInit = {}
    ): Promise<Zod.infer<Rs> | undefined> {
        const r = await fetch(`${Server.serverPath}${path}`, {
            credentials: "include",
            ...init,
        });
        if (r.ok) {
            const resp = await r.json();
            const safe = serverRoutes[pathID]["res"].safeParse(resp);
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

    static async sendPOST<
        X extends keyof typeof serverRoutes,
        Rq extends serverRoutes[X]["req"],
        Rs extends serverRoutes[X]["res"]
    >(
        path: string,
        pathID: keyof serverRoutes,
        body: Zod.infer<Rq>,
        init: RequestInit = {}
    ): Promise<Zod.infer<Rs> | undefined> {
        const reqParse = serverRoutes[pathID]["req"].safeParse(body);
        if (!reqParse.success) {
            console.warn("Invalid request data for path!", path);
            return;
        }
        const r = await fetch(`${Server.serverPath}${path}`, {
            credentials: "include",
            method: "post",
            body: JSON.stringify(body),
            ...init,
        });
        if (r.ok) {
            const resp = await r.json();
            const safe = serverRoutes[pathID]["res"].safeParse(resp);
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
