import { ConnectionGeneric, SSEResponse, UserSSEConnection } from "./utils";

import express, { Request, Response } from "express";

import cookieParser from "cookie-parser";
import { ServerRoute, serverRoutes } from "../shared/routeShapes";
import { configDotenv } from "dotenv";

const app = express();

app.use(express.text({ type: "*/*" }));

app.use(cookieParser());

const addCORSHeaders = (res: Response) => {
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader(
        "Access-Control-Allow-Origin",
        `http${process.env.HTTPS ? "s" : ""}://${
            process.env.EXTERNAL_HOST || process.env.SERVER_HOST
        }${process.env.WEB_PORT?`:${process.env.WEB_PORT}`:""}`
    );
    res.setHeader("Access-Control-Allow-Credentials", "true");
};

const getCookies = (req: Request) => {
    console.log("kuki", req.cookies);
};

export const addSSERoute = <Connection extends UserSSEConnection<any>>(
    route: string,
    options: {
        connBuilder: (req: Request) => Connection;
        method: "get" | "post";
    },
    sseFunction: (
        req: Request,
        res: SSEResponse<ConnectionGeneric<Connection>>,
        conn: Connection
    ) => void
) => {
    console.log("Adding SSE Route", route);
    app[options.method](route, (req, res) => {
        const conn = options.connBuilder(req);
        req.socket.setTimeout(0);
        req.socket.setNoDelay(true);
        req.socket.setKeepAlive(true);
        res.statusCode = 200;
        res.setHeader("Content-Type", "text/event-stream");
        res.setHeader("X-Accel-Buffering", "no");
        addCORSHeaders(res);
        if (req.httpVersion !== "2.0") {
            res.setHeader("Connection", "keep-alive");
        }
        res.on("close", () => {
            conn.emit("close");
        });

        const sseRes = new SSEResponse(res);

        sseFunction(req, sseRes, conn);
    });
};

export const addRoute = <RouteID extends keyof serverRoutes>(
    route: RouteID,
    options: {
        method: "get" | "post";
    },
    func: (o: {
        req: Request;
        res: Response;
        respond: (
            status: number,
            response: ServerRoute<RouteID, "res">
        ) => void;
        params: ServerRoute<RouteID, "vars">;
        body: ServerRoute<RouteID, "req">;
    }) => void
) => {
    console.log("Adding route", route);
    app[options.method]("/" + route, (req, res: Response) => {
        console.log(`${options.method} @ ${route}`);
        addCORSHeaders(res);
        getCookies(req);
        const ret = (status: number, val: ServerRoute<RouteID, "res">) => {
            res.status(status);
            res.send(JSON.stringify(val));
        };
        try {
            const bodyRaw =
                typeof req.body === "string" ? JSON.parse(req.body) : req.body;
            const safeBody = serverRoutes[route].req.safeParse(bodyRaw);
            const safeParams = serverRoutes[route].vars.safeParse(req.params);
            if (safeBody.success && safeParams.success) {
                func({
                    req,
                    res,
                    respond: ret,
                    params: safeParams.data,
                    body: safeBody.data,
                });
            } else {
                console.warn(
                    "Could not process the request due to wrong request body or wrong params!"
                );
                console.log(
                    safeParams.success
                        ? safeBody.success
                            ? "Nothing went wrong!"
                            : safeBody.error
                        : safeParams.error
                );
            }
        } catch (e) {
            console.error("Could not parse body as a JSON!", req.body, e);
        }
    });
};

export const startServer = (
    port: number,
    host: string = "localhost",
    then?: () => void
) => {
    app.listen(
        port,
        host,
        then ||
            (() => {
                console.log(`Listening on http://${host}:${port}`);
            })
    );
};
