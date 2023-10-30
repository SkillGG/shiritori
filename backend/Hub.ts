import { UserSSEEvents } from "../shared/events";
import { GameRoom, NewRoomData } from "./GameRoom";

export class GameHub {
    private rooms: GameRoom[] = [];

    constructor() {}

    getNextEmptyRoomID() {
        return (
            this.rooms.reduce<number>(
                (p, n) => (p > n.roomid ? p : n.roomid),
                0
            ) + 1
        );
    }

    getRoomList(): UserSSEEvents["roomData"][0][] {
        return this.rooms.map((room) => room.getRoomLobbyData());
    }

    createNewGameRoom(data: NewRoomData) {
        this.rooms.push(new GameRoom(this.getNextEmptyRoomID(), data));
    }

    getRoomByID(id: number): GameRoom | null {
        return this.rooms.find((r) => r.roomid === id) || null;
    }
}
