import { useState, useEffect } from "preact/hooks";

const messagesByContext = {
    general: [
        "Hang tight! We're putting things together for you...",
        "Almost there! Just adding some finishing touches...",
        "Bear with us! We're crafting your experience..."
    ],
    login: [
        "Gently unlocking your personal sanctuary...",
        "Aligning energies for your unique dashboard...",
        "Mindfully retrieving your essence...",
    ],
    upload: [
        "Gracefully elevating your files to the cloud...",
        "Nurturing your documents with care...",
        "Perfecting the flow of your data...",
    ],
    analysis: [
        "Meditating on your numbers...",
        "Seeking wisdom within your data...",
        "Distilling insights with patience...",
    ],
};

const colorsByContext = {
    general: { primary: "#4a6670", secondary: "#8e9e9d" },
    login: { primary: "#7a936e", secondary: "#c9d5b5" },
    upload: { primary: "#8e7e6b", secondary: "#d3c4a8" },
    analysis: { primary: "#6b7a8e", secondary: "#a8b5c9" },
};

const ContextAwareZenLoader = ({ context = "general" }) => {
    const [currentMessage, setCurrentMessage] = useState(
        messagesByContext[context][0],
    );
    const [progress, setProgress] = useState(0);
    const colors = colorsByContext[context] || colorsByContext.general;

    useEffect(() => {
        const messages = messagesByContext[context] ||
            messagesByContext.general;
        let messageIndex = 0;

        const messageInterval = setInterval(() => {
            messageIndex = (messageIndex + 1) % messages.length;
            setCurrentMessage(messages[messageIndex]);
        }, 6000);

        const progressInterval = setInterval(() => {
            setProgress((prevProgress) => {
                if (prevProgress >= 100) {
                    clearInterval(progressInterval);
                    return 100;
                }
                return prevProgress + 0.5;
            });
        }, 50);

        return () => {
            clearInterval(messageInterval);
            clearInterval(progressInterval);
        };
    }, [context]);

    return (
        <div className="flex flex-col items-center justify-center h-screen bg-gray-50">
            <div className="relative w-48 h-48">
                <svg className="w-full h-full" viewBox="0 0 100 100">
                    <circle
                        className="text-gray-200"
                        strokeWidth="4"
                        stroke="currentColor"
                        fill="none"
                        r="42"
                        cx="50"
                        cy="50"
                    />
                    <circle
                        className="text-primary transition-all duration-300 ease-in-out"
                        strokeWidth="4"
                        strokeLinecap="round"
                        stroke={colors.secondary}
                        fill="none"
                        r="42"
                        cx="50"
                        cy="50"
                        style={{
                            strokeDasharray: 264,
                            strokeDashoffset: 264 - (progress / 100) * 264,
                        }}
                    />
                </svg>
                <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center">
                    <div className="text-2xl font-semibold text-primary">
                        {Math.round(progress)}%
                    </div>
                </div>
            </div>
            <p
                className="mt-8 text-lg font-medium text-center max-w-md transition-opacity duration-1000 ease-in-out"
                style={{ color: colors.primary }}
            >
                {currentMessage}
            </p>
        </div>
    );
};

export default ContextAwareZenLoader;
