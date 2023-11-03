import Zod from "zod";
import {
    serverRoutes,
    okErrorRes,
    responseError,
    responseOK,
} from "../../shared/routeShapes";

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

    static checking = false;

    static async checkState(onServerOn: () => void) {
        this.checking = true;
        const res = await fetch(`${Server.serverPath}check`, {}).catch(
            () => null
        );
        this.checking = false;
        if (res && res.ok && res.status === 200) {
            onServerOn();
        } else {
            console.log("starting new timeout");
            setTimeout(() => {
                console.log("checking status");
                this.checkState(onServerOn);
            }, 200);
        }
    }

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

    static isDataPacket<
        X extends keyof serverRoutes,
        T extends serverRoutes[X]["parsedRes"]
    >(
        p: (okErrorRes | responseOK | responseError | string) | Zod.infer<T>,
        routeId: X
    ): p is Zod.infer<T> {
        if (typeof p === "object" && serverRoutes[routeId].req.shape) {
            return true;
        }
        return false;
    }
}
