import { FC, createContext, useState } from "react";
import { RoomList } from "./RoomList";
import { RoomData, LobbyData, RoomListData, GameProps } from "./gameTypes";

enum GameState {
    RoomList,
    Lobby,
    Game,
}

export type GameContext = {
    roomData?: RoomData;
    lobbyData?: LobbyData;
    listData?: RoomListData;
    roomConnection?: EventSource;
};

export const GameCtx = createContext<GameContext>({});

export const Game: FC<GameProps> = () => {
    const [gameState, setGameState] = useState<GameState>(GameState.RoomList);

    const [gameData, setGameData] = useState<GameContext>({});

    return (
        <GameCtx.Provider value={gameData}>
            {gameState === GameState.Game ? (
                <></>
            ) : gameState === GameState.Lobby ? (
                <></>
            ) : gameState === GameState.RoomList ? (
                <>
                    <RoomList
                        changeData={setGameData}
                        enterRoom={(roomid: number) => {
                            //
                            setGameState(GameState.Lobby);
                        }}
                    />
                </>
            ) : (
                <>Invalid game state! Refresh the page!</>
            )}
        </GameCtx.Provider>
    );
};
