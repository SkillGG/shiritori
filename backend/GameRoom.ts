import { UserSSEConnection } from "./utils";

import {
    UserSSEEvents,
    terminationReason,
    roomDataShape,
    roomInfoShape,
} from "./../shared/events";
import { Countdown } from "./countdown";

export class UserConnection extends UserSSEConnection<UserSSEEvents> {
    constructor(id: string) {
        super(id);
    }
    static id: number = 0;
}

export enum GameRoomState {
    STANDBY,
    LOBBY,
    GAME,
}

interface Gamemode {
    name: string;
}

export interface NewRoomData {
    gamemode: Gamemode;
    name: string;
    maxplayers?: number;
}

export class GameRoom {
    roomid: number;
    roomname: string;
    maxplayers: number = 4;

    gamemode: Gamemode;

    players: Map<string, UserConnection> = new Map();
    readyPlayers: Set<string> = new Set();

    get openedPlayers() {
        return new Set(
            [...this.players].filter((c) => !c[1].isClosed).map((q) => q[0])
        );
    }

    get openConnections() {
        return [...this.players].map((q) => q[1]).filter((c) => !c.isClosed);
    }

    gameState: GameRoomState = GameRoomState.STANDBY;

    countdown?: Countdown;

    constructor(roomid: number, { gamemode, name, maxplayers }: NewRoomData) {
        this.roomid = roomid;
        this.gamemode = gamemode;
        this.roomname = name;
        this.maxplayers = maxplayers ?? this.maxplayers;
    }

    startGame() {
        this.countdown = new Countdown(
            "gameLaunch",
            this.openConnections,
            2,
            {
                afterFinish: () => {
                    this.countdown = undefined;
                },
            },
            () => {
                return { type: "gameLaunch" };
            }
        );
        this.countdown.start();
    }

    join(playerid: string, c: UserConnection) {
        this.players.set(playerid, c);
        UserConnection.emitToAll(this.openConnections)("join", {
            playerid,
        });
    }

    leave(playerid: string) {
        this.players.delete(playerid);
        this.readyPlayers.delete(playerid);
        UserConnection.emitToAll(this.openConnections)("leave", {
            playerid,
        });
        const termReason: terminationReason = {
            type: "disconnect",
            playerid,
        };
        if (this.countdown) {
            this.countdown.abort(termReason);
        }
    }

    get allPlayersReady() {
        return [...this.openedPlayers].reduce(
            (p, n) => (!p ? p : this.readyPlayers.has(n)),
            true
        );
    }

    markReady(playerid: string) {
        this.readyPlayers.add(playerid);
        UserConnection.emitToAll(this.openConnections)("ready", { playerid });
        console.log(this.openedPlayers.size, this.allPlayersReady);
        if (this.openedPlayers.size === 2 && this.allPlayersReady) {
            this.startGame();
        }
    }

    markUnready(playerid: string) {
        this.readyPlayers.delete(playerid);
        UserConnection.emitToAll(this.openConnections)("unready", { playerid });
        if (this.countdown) {
            this.countdown.abort();
            this.countdown = undefined;
        }
    }

    getRoomInfo(): roomInfoShape {
        return {
            playersIn: [...this.players.keys()].length,
            maxplayers: this.maxplayers,
            roomid: this.roomid,
            roomname: this.roomname,
        };
    }

    getRoomLobbyData(): roomDataShape {
        const ret: roomDataShape = {
            playersIn: {},
            maxplayers: this.maxplayers,
            roomid: this.roomid,
            roomname: this.roomname,
        };
        for (const [pl] of this.players) {
            ret.playersIn[pl] = { ready: this.readyPlayers.has(pl) };
        }
        return ret;
    }
}
