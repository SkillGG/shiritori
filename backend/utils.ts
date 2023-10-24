import { Response } from "express";

type Listener<T extends any[]> = (...args: T) => void;

export class EventEmitter<EventMap extends Record<string, any[]>> {
    private listeners: { [K in keyof EventMap]?: Set<Listener<EventMap[K]>> } =
        {};
    prefix: string | null = null;
    on<T extends keyof EventMap & string>(
        id: T,
        listener: (...data: EventMap[T]) => void
    ) {
        const listeners = this.listeners[id] ?? new Set();
        listeners.add(listener);
        this.listeners[id] = listeners;
        if (this.prefix) console.log(`adding on ${id} to ${this.prefix}`);
    }
    once<T extends keyof EventMap & string>(
        id: T,
        listener: (...data: EventMap[T]) => void
    ) {
        const listeners = this.listeners[id] ?? new Set();
        const wrapper = (...data: EventMap[T]) => {
            listeners.delete(wrapper);
            listener(...data);
        };
        listeners.add(wrapper);
        this.listeners[id] = listeners;
        if (this.prefix) console.log(`adding once ${id} in ${this.prefix}`);
    }
    emit<T extends keyof EventMap & string>(id: T, ...data: EventMap[T]) {
        const listeners = this.listeners[id] ?? new Set();
        for (const list of listeners) {
            list(...data);
        }
        if (this.prefix)
            console.log(`emitted ${id}(`, data, `) to ${this.prefix}`);
    }
    removeAllEventListeners() {
        this.listeners = {};
    }
    static emitToAll<T extends Record<string, any[]>>(
        arr: EventEmitter<T>[],
        except: (ev: EventEmitter<T>) => boolean = () => true
    ) {
        return <K extends keyof T & string>(id: K, ...data: T[K]) => {
            arr.filter((e) => except(e)).forEach((em) => {
                em.emit(id, ...data);
            });
        };
    }
}

export class UserSSEConnection<
    T extends Record<string, any[]>
> extends EventEmitter<T> {
    userid: string;
    private closed = false;
    constructor(id: string) {
        super();
        this.userid = id;
        // this.prefix = id;
    }
    get isClosed() {
        return this.closed;
    }
    close() {
        this.closed = true;
    }
    static emitToAll<T extends Record<string, any[]>>(
        arr: UserSSEConnection<T>[],
        except: (ev: UserSSEConnection<T>) => boolean = () => true
    ) {
        return <K extends keyof T & string>(id: K, ...data: T[K]) => {
            arr.filter((e) => except(e)).forEach((em) => {
                em.emit(id, ...data);
            });
        };
    }
}

export type ConnectionGeneric<C extends UserSSEConnection<any>> =
    C extends UserSSEConnection<infer T> ? T : unknown;

export class SSEResponse<T extends UserSSEConnection<Record<string, any[]>>> {
    private res: Response;
    get raw() {
        return this.res;
    }
    constructor(r: Response) {
        this.res = r;
    }

    sseevent<K extends keyof ConnectionGeneric<T> & string>(
        id: K,
        ...data: ConnectionGeneric<T>[K]
    ) {
        this.res.write(`event: ${id}\n`);
        if (data.length > 0) this.ssedata(...data);
        else this.ssedata("");
        return this;
    }

    ssedata<K extends keyof ConnectionGeneric<T>>(
        ...data: string[] | ConnectionGeneric<T>[K]
    ) {
        for (const d of data) {
            const dt = JSON.stringify(d);
            this.res.write(`data: ${dt}\n`);
        }
        this.res.write(`\n`);
        return this;
    }
}
