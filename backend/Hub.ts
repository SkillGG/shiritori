import { UserSSEEvents } from "../shared/events";
import { GameRoom } from "./GameRoom";

export class GameHub {
    private rooms: GameRoom[] = [];

    constructor() {}

    getRoomList(): UserSSEEvents["roomData"][0][] {
        return this.rooms.map((room) => room.getRoomLobbyData());
    }

    createNewGameRoom(id: string, data: any) {
        this.rooms.push(new GameRoom(id));
    }

    getRoom(id: string): GameRoom | null {
        return this.rooms.find((r) => r.roomid === id) || null;
    }
}
