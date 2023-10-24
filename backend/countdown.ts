import { terminationReason, timerData, timerType } from "../shared/events";
import { UserConnection } from "./GameRoom";

export class Countdown {
    type: timerType;

    timer?: NodeJS.Timer;

    conns: UserConnection[];

    interval: number = 1000;

    countdown: number;

    afterFinish: () => void;
    beforeFinish: () => void;
    getData: () => timerData;
    onAbort: (reason?: terminationReason) => void;
    cleanup: (reason?: terminationReason) => void;

    finished = true;

    constructor(
        data: timerType,
        conns: UserConnection[],
        time: number,
        finishes: {
            afterFinish?: () => void;
            beforeFinish?: () => void;
            onAbort?: () => void;
            cleanup?: () => void;
        },
        getData: () => timerData
    ) {
        this.type = data;
        this.conns = conns;
        this.countdown = time;
        this.afterFinish = finishes.afterFinish || (() => {});
        this.beforeFinish = finishes.beforeFinish || (() => {});
        this.onAbort = finishes.onAbort || (() => {});
        this.getData = getData;
        this.cleanup = finishes.cleanup || (() => {});
    }

    start() {
        this.finished = false;
        UserConnection.emitToAll(this.conns)("initCountdown", {
            type: this.type,
            time: this.countdown,
            ms: this.interval,
        });
        this.timer = setInterval(() => {
            UserConnection.emitToAll(this.conns)("countdown", {
                type: this.type,
                ms: this.interval,
                time: --this.countdown,
            });

            if (this.countdown <= 0) {
                this.end(true);
            }
        }, this.interval);
    }

    private end(success: boolean) {
        console.log("ending interval", this.interval);
        this.finished = true;
        clearInterval(this.timer);
        this.timer = undefined;
        if (success) {
            this.beforeFinish();
            UserConnection.emitToAll(this.conns)("endCountdown", {
                data: this.getData(),
                type: this.type,
            });
            this.afterFinish();
        }
        this.cleanup();
    }

    abort(reason?: terminationReason) {
        if (this.finished) return;
        console.log("aborting countdown", this.type);
        this.end(false);
        this.onAbort(reason);
        UserConnection.emitToAll(this.conns)("terminateCountdown", {
            type: this.type,
            reason: reason ? reason : undefined,
        });
    }
}
