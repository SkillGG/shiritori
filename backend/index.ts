import { addRoute, addSSERoute, startServer } from "./server";
import { GameRoom, UserConnection as RoomConnection } from "./GameRoom";
import { SSEResponse } from "./utils";
import { Request } from "express";
import { connectionShape, playerIDShape } from "../shared/events";
import { GameHub } from "./Hub";
import { loginShape } from "./routeShapes";

const gameHub = new GameHub();

const getRoom = (roomid: string): GameRoom => {
    const gameRoom = gameHub.getRoom(roomid);
    if (!gameRoom) throw "Game Room not found";
    return gameRoom;
};

addSSERoute(
    "/room/:roomid/:playerid/connect",
    {
        connBuilder: (req) => {
            const connection = new RoomConnection(`${++RoomConnection.id}`);
            connection.prefix = req.params.playerid || `${RoomConnection.id}`;
            return connection;
        },
        method: "get",
    },
    (req: Request, res: SSEResponse<RoomConnection>, conn: RoomConnection) => {
        // res is hermes => client messenger ("hermes")
        // conn is hermes <=> room

        const safeParams = connectionShape.safeParse(req.params);
        if (!safeParams.success) {
            res.raw.status(404).send("Room link is not valid!");
            return;
        }
        const { playerid, roomid } = safeParams.data;

        const gameRoom = getRoom(roomid);

        if (gameRoom.openedPlayers.has(playerid)) {
            res.raw.status(400).send("Player already exists!");
            return;
        }
        res.sseevent("roomData", gameRoom.getRoomLobbyData());
        conn.once("close", () => {
            // close connection
            conn.close();
            // send to everyone that player is leaving
            gameRoom.leave(playerid);
        });

        conn.on("join", (data) => {
            // send join event to client
            res.sseevent("join", data);
        });
        conn.on("leave", (data) => {
            // send leave event to client
            res.sseevent("leave", data);
        });
        conn.on("ready", (data) => {
            // send ready event to client
            res.sseevent("ready", data);
        });
        conn.on("unready", (data) => {
            // send ready event to client
            res.sseevent("unready", data);
        });
        conn.on("initCountdown", (data) => {
            res.sseevent("initCountdown", data);
        });
        conn.on("countdown", (data) => {
            res.sseevent("countdown", data);
        });
        conn.on("endCountdown", (data) => res.sseevent("endCountdown", data));
        conn.on("terminateCountdown", (data) =>
            res.sseevent("terminateCountdown", data)
        );
        // send to everyone that player is joining
        gameRoom.join(playerid, conn);
    }
);

addRoute(
    "/room/:roomid/:playerid/ready",
    { method: "get" },
    (_req, _res, bP, ret) => {
        const { playerid, roomid } = bP(connectionShape);

        const gameRoom = getRoom(roomid);

        gameRoom.markReady(playerid);

        ret(200, { msg: "OK" });
    }
);

addRoute(
    "/room/:roomid/:playerid/unready",
    { method: "get" },
    (_req, _res, bP, ret) => {
        const { playerid, roomid } = bP(connectionShape);

        const gameRoom = getRoom(roomid);

        gameRoom.markUnready(playerid);

        ret(200, { msg: "OK" });
    }
);

addRoute("/room/list", { method: "get" }, (_req, _res, _bP, ret) => {
    ret(200, { data: gameHub.getRoomList() });
});

addRoute("/user/login", { method: "post" }, (req, res, bodyParse, ret) => {
    if (!req.body) {
        ret(404, { err: "No username provided!" });
        return;
    }

    const {
        data: { playerid },
    } = bodyParse(loginShape);

    console.log("logging in as ", playerid);

    res.cookie("userlogon", playerid, {
        expires: new Date(Date.now() + 1000 * 60 * 60),
        secure: true,
        sameSite: "none",
    });
    ret(200, { msg: "OK" });
});

addRoute("/user/logout", { method: "post" }, (_req, res, _bP, ret) => {
    res.cookie("userlogon", "", {
        expires: new Date(Date.now() - 10),
        secure: true,
        sameSite: "none",
    });
    ret(200, { msg: "OK" });
});

startServer(8080);
