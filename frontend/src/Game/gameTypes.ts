export interface GameProps {
    _: null;
}

export type PlayerReadiness = Record<string, { ready: boolean }>;

export type RoomData = {
    maxplayers: number;
    players: [];
    roomid: number;
    words: [];
};

export type RoomListData = {
    rooms: {
        maxplayers: number;
        roomid: number;
        roomname: string;
        playerNum: number;
    }[];
};

export type LobbyData = {
    players: PlayerReadiness[];
};
