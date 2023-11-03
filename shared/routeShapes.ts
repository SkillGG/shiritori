import z, { object, literal, string, array } from "zod";
import { roomInfoShape } from "./events";

export const responseOK = object({ msg: literal("OK") });

export const responseError = object({ error: string() });

export type responseOK = z.infer<typeof responseOK>;

export type responseError = z.infer<typeof responseError>;

export const loginShape = object({ playerid: string() });

export const logoutShape = object({});

export const roomListShape = array(roomInfoShape);

export const okErrorRes = responseOK.or(responseError);
export type okErrorRes = z.infer<typeof okErrorRes>;

const emptyRoute = {
    params: object({}),
    req: object({}),
    res: okErrorRes,
    parsedRes: z.null(),
};

export const serverRoutes = {
    "user/login": {
        ...emptyRoute,
        req: loginShape,
    },
    log: {
        ...emptyRoute,
        res: string(),
    },
    "logs/:file": {
        ...emptyRoute,
        res: string(),
        params: object({ file: string() }),
    },
    "user/logout": {
        ...emptyRoute,
        req: logoutShape,
    },
    "room/list": {
        ...emptyRoute,
        res: responseError.or(roomListShape),
        parsedRes: roomListShape,
    },
    "room/:roomid/:playerid/unready": {
        ...emptyRoute,
        params: object({ roomid: string(), playerid: string() }),
    },
    "room/:roomid/:playerid/ready": {
        ...emptyRoute,
        params: object({ roomid: string(), playerid: string() }),
    },
    check: {
        ...emptyRoute,
    },
} as const;

export type serverRoutes = typeof serverRoutes;

export type ServerRoute<
    T extends keyof serverRoutes,
    Z extends "res" | "req" | "params" | "parsedRes"
> = z.infer<serverRoutes[T][Z]>;

export type UserLoginRequest = z.infer<typeof loginShape>;
export type UserLogoutRequest = z.infer<typeof logoutShape>;
