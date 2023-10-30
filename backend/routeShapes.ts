import z, { object, literal, string, array } from "zod";
import { roomDataShape } from "../shared/events";

export const responseOK = object({ msg: literal("OK") });

export const responseError = object({ error: string() });

export const loginShape = object({ playerid: string() });

export const logoutShape = object({});

export const roomListShape = array(roomDataShape);

const okErrorRes = responseOK.or(responseError);

export const serverRoutes = {
    "user/login": { vars: object({}), req: loginShape, res: okErrorRes },
    "user/logout": { vars: object({}), req: logoutShape, res: okErrorRes },
    "room/list": {
        vars: object({}),
        req: object({}),
        res: okErrorRes.or(roomListShape),
    },
    "room/:roomid/:playerid/unready": {
        vars: object({ roomid: string(), playerid: string() }),
        req: object({}),
        res: okErrorRes,
    },
    "room/:roomid/:playerid/ready": {
        vars: object({ roomid: string(), playerid: string() }),
        req: object({}),
        res: okErrorRes,
    },
} as const;

export type serverRoutes = typeof serverRoutes;

export type RouteRequest<T = {}> = {
    data: T;
};

export type UserLoginRequest = z.infer<typeof loginShape>;
export type UserLogoutRequest = z.infer<typeof logoutShape>;
