import { useState, useEffect } from "react";

interface CountdownTimerProps {
    timeLimit: number;
    onFinish: () => void;
}

const CountdownTimer: React.FC<CountdownTimerProps> = ({ timeLimit, onFinish }) => {
    const [timeLeft, setTimeLeft] = useState<number>(timeLimit);

    useEffect(() => {
        if (timeLeft <= 0) {
            onFinish();
            return;
        }

        const timerId = setInterval(() => {
            setTimeLeft((prevTimeLeft) => {
                const newTimeLeft = prevTimeLeft - 1;
                return newTimeLeft;
            });
        }, 1000);

        return () => clearInterval(timerId);
    }, [timeLeft, onFinish]);

    return (
        <div className="mb-4">
            <div className="w-full bg-gray-200 rounded-full h-4 dark:bg-gray-700">
                <div
                    className="h-4 rounded-full transition-all duration-1000 ease-linear"
                    style={{
                        width: `${(timeLeft / timeLimit) * 100}%`,
                        background: `linear-gradient(to left,rgb(161, 214, 178),
                                                rgb(241, 243, 194),
                                                rgb(232, 184, 109))`,
                    }}
                ></div>
            </div>
            <p className="text-sm mt-2">
                Time Remaining: {timeLeft} seconds
            </p>
        </div>
    );
};

export default CountdownTimer;
