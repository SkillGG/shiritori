import { FC, createContext, useContext, useState } from "react";
import { RoomList } from "./RoomList";

interface GameProps {
    _: null;
}

enum GameState {
    RoomList,
    Lobby,
    Game,
}

type RoomData = {
    maxplayers: number;
    players: [];
    roomid: number;
    words: [];
};

type RoomListData = {
    rooms: RoomData[];
};

type LobbyData = {
    players: [];
};

export type GameData = {
    roomData?: RoomData;
    lobbyData?: LobbyData;
    listData?: RoomListData;
};

export const GameContext = createContext<GameData>({});

export const Game: FC<GameProps> = () => {
    const [gameState, setGameState] = useState<GameState>(GameState.RoomList);

    const [gameData, setGameData] = useState<GameData>({});

    return (
        <GameContext.Provider value={gameData}>
            {gameState === GameState.Game ? (
                <></>
            ) : gameState === GameState.Lobby ? (
                <></>
            ) : gameState === GameState.RoomList ? (
                <>
                    <RoomList changeData={setGameData} />
                </>
            ) : (
                <>Invalid game state! Refresh the page!</>
            )}
        </GameContext.Provider>
    );
};
