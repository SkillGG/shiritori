import z, {
    object,
    literal,
    record,
    number,
    string,
    discriminatedUnion,
    tuple,
    boolean,
    union,
    optional,
} from "zod";
import { playerIDShape } from "../shared/events";

export const loginShape = object({ data: playerIDShape });

export const logoutShape = object({ data: object({}) });

export type RouteResponse<T = {}> =
    | { err: string }
    | { msg: string }
    | { data: T };

export type UserLoginRequest = z.infer<typeof loginShape>;
export type UserLogoutRequest = z.infer<typeof logoutShape>;

export type UserLoginResponse = RouteResponse;
export type UserLogoutResponse = RouteResponse;
