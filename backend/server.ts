import { ConnectionGeneric, SSEResponse, UserSSEConnection } from "./utils";

import express, { Request, Response } from "express";

import cookieParser from "cookie-parser";
import { RouteResponse } from "./routeShapes";

const website = "http://localhost:5173";

const app = express();

app.use(express.text({ type: "*/*" }));

app.use(cookieParser());

const addCORSHeaders = (res: Response) => {
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Access-Control-Allow-Origin", `${website}`);
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

export const addRoute = <T = {}>(
    route: string,
    options: {
        method: "get" | "post";
    },
    func: (
        req: Request,
        res: Response,
        parseBody: <Y extends Zod.ZodType>(shape: Y) => Zod.infer<Y>,
        respond: (status: number, response: RouteResponse<T>) => void
    ) => void
) => {
    console.log("Adding route", route);
    app[options.method](route, (req, res: Response) => {
        console.log(`got someone on ${route}`);
        addCORSHeaders(res);
        getCookies(req);
        const ret = (status: number, val: RouteResponse<T>) => {
            res.status(status);
            res.send(JSON.stringify(val));
        };
        func(
            req,
            res,
            (shape) => {
                const safeParams = shape.safeParse(JSON.parse(req.body));
                if (!safeParams.success) {
                    ret(404, { err: safeParams.error.message });
                    throw "Arguments not valid!";
                }
                return safeParams.data;
            },
            ret
        );
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
