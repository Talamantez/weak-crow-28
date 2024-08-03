import { useEffect, useState } from "preact/hooks";

const messagesByContext = {
  general: [
    "",
  ],
  // ... (other contexts remain the same)
};

const colorsByContext = {
  general: {
    primary: "#00A1DF",
    secondary: "#262262",
    complementary: "#DF5600",
    accent: "#32CD32",
  },
  // ... (other color schemes remain the same)
};

const icons = [
  {
    svg: (color, opacity) => (
      <svg
        width="28"
        height="28"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        opacity={opacity}
      >
        <path
          d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
          fill={color}
        />
      </svg>
    ),
    label: "Health",
  },
  {
    svg: (color, opacity) => (
      <svg
        width="28"
        height="28"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        opacity={opacity}
      >
        <path
          d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"
          fill={color}
        />
      </svg>
    ),
    label: "Family",
  },
  {
    svg: (color, opacity) => (
      <svg
        width="28"
        height="28"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        opacity={opacity}
      >
        <path
          d="M18 9V7h-2V5c0-1.1-.9-2-2-2h-4c-1.1 0-2 .9-2 2v2H6v2H4v11c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V9h-2zm-6 6h-2v-2h2v2zm0-4h-2V9h2v2zm0-4h-2V5h2v2z"
          fill={color}
        />
      </svg>
    ),
    label: "Nutrition",
  },
  {
    svg: (color, opacity) => (
      <svg
        width="28"
        height="28"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        opacity={opacity}
      >
        <path
          d="M18 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 4h5v8l-2.5-1.5L6 12V4z"
          fill={color}
        />
      </svg>
    ),
    label: "Resources",
  },
];

const ContextAwareNAMILoader = ({ context = "general" }) => {
  const [currentMessage, setCurrentMessage] = useState(
    messagesByContext[context][0],
  );
  const [progress, setProgress] = useState(0);
  const [randomIcons, setRandomIcons] = useState([]);
  const colors = colorsByContext[context] || colorsByContext.general;

  useEffect(() => {
    setRandomIcons(icons.sort(() => Math.random() - 0.5));

    const messages = messagesByContext[context] || messagesByContext.general;
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

  const getIconOpacity = (index) => progress >= (index + 1) * 25 ? 1 : 0.3;

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-50">
      <div className="relative w-64 h-64">
        <svg className="w-full h-full" viewBox="0 0 100 100">
          {/* Background circle */}
          <circle
            className="text-gray-200"
            strokeWidth="4"
            stroke="currentColor"
            fill="none"
            r="46"
            cx="50"
            cy="50"
          />
          {/* Progress circle */}
          <circle
            className="transition-all duration-300 ease-in-out"
            strokeWidth="4"
            strokeLinecap="round"
            stroke={colors.primary}
            fill="none"
            r="46"
            cx="50"
            cy="50"
            style={{
              strokeDasharray: 289,
              strokeDashoffset: 289 - (progress / 100) * 289,
              transform: "rotate(-90deg)",
              transformOrigin: "center",
            }}
          />
        </svg>
        <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center">
          <div className="flex flex-col items-center">
            {randomIcons.map(({ svg, label }, index) => (
              <div key={label} className="mb-2 transition-opacity duration-300">
                {svg(Object.values(colors)[index], getIconOpacity(index))}
              </div>
            ))}
          </div>
        </div>
      </div>
      <p
        className="mt-8 text-lg font-medium text-center max-w-md transition-opacity duration-1000 ease-in-out"
        style={{ color: colors.secondary }}
      >
        {currentMessage}
      </p>
    </div>
  );
};

export default ContextAwareNAMILoader;
