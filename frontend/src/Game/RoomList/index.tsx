import { FC, useContext, useEffect } from "react";
import { GameCtx, GameContext } from "..";
import { Server } from "../../server";
import { Language } from "../../strings";

import "./index.css";

interface RoomListProps {
    changeData: React.Dispatch<React.SetStateAction<GameContext>>;
    enterRoom(roomid: number): void;
}

export const RoomList: FC<RoomListProps> = ({ changeData }) => {
    const lang = useContext(Language);

    const gameData = useContext(GameCtx);

    const getRooms = async () => {
        const res = await Server.sendToServer("room/list", "room/list");

        if (res) {
            if (Server.isDataPacket(res, "room/list")) {
                changeData((data) => {
                    return {
                        ...data,
                        listData: {
                            rooms: res.map((r) => {
                                return {
                                    maxplayers: r.maxplayers,
                                    roomid: r.roomid,
                                    roomname: r.roomname,
                                    playerNum: r.playersIn,
                                };
                            }),
                        },
                    };
                });
            } else {
                if ("error" in res) {
                    console.error("Error while getting room list!", res.error);
                }
            }
        }
    };

    useEffect(() => {
        if (!gameData.listData) {
            getRooms();
        }
    }, [gameData.listData]);

    return gameData.listData ? (
        <>
            <div className="roomlist">
                {gameData.listData.rooms.map((room) => (
                    <div className="room">{room.roomname}</div>
                )) || <></>}
                <div className="addRoom">{lang.roomlist.addRoom}</div>
            </div>
        </>
    ) : (
        <>{lang.roomlist.loading()}</>
    );
};
