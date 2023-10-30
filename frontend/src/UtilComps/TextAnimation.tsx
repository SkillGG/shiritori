import { FC, useEffect, useState } from "react";

interface TextAnimationProps {
    value: string;
    tickSpeed: number;
    tickNum: number;
    onStop(): boolean;
    tick(tick: number, full: string): string;
}

export const TextAnimation: FC<TextAnimationProps> = ({
    value,
    tickSpeed,
    tick,
    tickNum,
    onStop,
}) => {
    const [curTick, setCurTick] = useState(0);

    const [visibleText, setVisibleText] = useState(tick(0, value));

    const [running, setRunning] = useState(false);

    useEffect(() => {
        console.log("running animation", value);
        setRunning(true);
    }, [value]);

    useEffect(() => {
        if (running) {
            const timer = setInterval(() => {
                if (!running) {
                    clearInterval(timer);
                    return;
                }
                if (curTick > tickNum) {
                    if (onStop()) {
                        setRunning(false);
                    } else {
                        setVisibleText(tick(0, value));
                        setCurTick(1);
                    }
                } else {
                    const str = tick(curTick, value);
                    setVisibleText(str);
                    setCurTick((t) => t + 1);
                }
            }, tickSpeed);
            return () => {
                clearInterval(timer);
            };
        }
    }, [running, curTick, onStop, tickSpeed, tickNum, tick, value]);

    return <span>{visibleText || "\u200b"}</span>;
};
