import { ConnectionGeneric, SSEResponse, UserSSEConnection } from "./utils";

import express, { Request, Response } from "express";

const app = express();

const addCORSHeaders = (res: Response) => {
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Access-Control-Allow-Origin", "*");
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

export const addRoute = (
    route: string,
    options: {
        method: "get" | "post";
    },
    func: (req: Request, res: Response) => void
) => {
    console.log("Adding route", route);
    app[options.method](route, (req, res: Response) => {
        addCORSHeaders(res);
        func(req, res);
    });
};

export const startServer = (port: number, then?: () => void) => {
    app.listen(
        port,
        then ||
            (() => {
                console.log("listening on http://localhost:8080");
            })
    );
};
