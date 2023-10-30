import { FC } from "react";
import { TextAnimation } from "./TextAnimation";

export enum TypingTextAnimationType {
    Infinite,
    Once,
}

interface TypingTextAnimationProps {
    value: string;
    delay: number;
    start?: number;
    type: TypingTextAnimationType;
}

export const TypingTextAnimation: FC<TypingTextAnimationProps> = ({
    delay,
    type,
    value,
    start,
}) => {
    const onStop = () => {
        return type === TypingTextAnimationType.Infinite ? false : true;
    };

    const tick = (t: number, v: string) => {
        return v.substring(start || 0, t);
    };

    return (
        <TextAnimation
            value={value}
            onStop={onStop}
            tickNum={value.length}
            tickSpeed={delay}
            tick={tick}
        />
    );
};
