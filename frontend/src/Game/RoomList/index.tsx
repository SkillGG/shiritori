import { FC, useContext, useEffect } from "react";
import { GameContext, GameData } from "..";
import { Server } from "../../server";

interface RoomListProps {
    changeData: React.Dispatch<React.SetStateAction<GameData>>;
}

export const RoomList: FC<RoomListProps> = () => {
    const gameData = useContext(GameContext);

    const getRooms = async () => {
        const res = await Server.sendToServer("room/list", "room/list");

        console.log(res);
    };

    useEffect(() => {
        if (!gameData.listData) {
            getRooms();
        }
    }, [gameData.listData]);

    return (
        <>
            <table></table>
        </>
    );
};
