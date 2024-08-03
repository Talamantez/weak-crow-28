import { useEffect, useState } from "preact/hooks";

const messagesByContext = {
  general: [
    "Hang tight! We're putting things together for you...",
    "Almost there! Just adding some finishing touches...",
    "Bear with us! We're crafting your experience..."
  ],
  login: [
    "Securely logging you in...",
    "Preparing your personalized dashboard...",
    "Almost there! Fetching your data..."
  ],
  upload: [
    "Uploading your files securely...",
    "Processing your documents...",
    "Almost done! Finalizing your upload..."
  ],
  analysis: [
    "Crunching the numbers for you...",
    "Analyzing your data with care...",
    "Preparing your insights..."
  ]
};

const colorsByContext = {
  general: { primary: "#262262", secondary: "#00A1DF" },
  login: { primary: "#1a5f7a", secondary: "#57c84d" },
  upload: { primary: "#6b4226", secondary: "#f39c12" },
  analysis: { primary: "#2c3e50", secondary: "#e74c3c" }
};

const ContextAwareNAMILoader = ({ context = "general" }) => {
  const [currentMessage, setCurrentMessage] = useState(messagesByContext[context][0]);
  const [progress, setProgress] = useState(0);
  const colors = colorsByContext[context] || colorsByContext.general;

  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes rotate {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
      @keyframes fadeInOut {
        0%, 100% { opacity: 0.7; }
        50% { opacity: 1; }
      }
      .ring {
        width: 100px;
        height: 100px;
        border-radius: 50%;
        border: 4px solid ${colors.primary};
        position: relative;
      }
      .shine {
        position: absolute;
        width: 100%;
        height: 100%;
        border-radius: 50%;
        border: 4px solid transparent;
        border-top: 4px solid ${colors.secondary};
        animation: rotate 1.5s linear infinite;
      }
      .shine::before {
        content: '';
        position: absolute;
        top: -4px;
        left: -4px;
        right: -4px;
        bottom: -4px;
        border-radius: 50%;
        border: 4px solid transparent;
        border-top: 4px solid ${colors.secondary};
        filter: blur(5px);
        opacity: 0.7;
      }
      .progress {
        position: absolute;
        top: -4px;
        left: -4px;
        right: -4px;
        bottom: -4px;
        border-radius: 50%;
        border: 4px solid transparent;
        border-top: 4px solid ${colors.secondary};
        transform: rotate(0deg);
        transition: transform 0.5s ease;
      }
      .fade-animation {
        animation: fadeInOut 2s ease-in-out infinite;
      }
    `;
    document.head.appendChild(style);

    const messages = messagesByContext[context] || messagesByContext.general;
    const messageInterval = setInterval(() => {
      setCurrentMessage((prevMessage) => {
        const currentIndex = messages.indexOf(prevMessage);
        const nextIndex = (currentIndex + 1) % messages.length;
        return messages[nextIndex];
      });
    }, 6000);

    const progressInterval = setInterval(() => {
      setProgress((prevProgress) => {
        if (prevProgress >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prevProgress + 5;
      });
    }, 500);

    return () => {
      document.head.removeChild(style);
      clearInterval(messageInterval);
      clearInterval(progressInterval);
    };
  }, [context]);

  return (
    <div class="flex flex-col items-center justify-center h-screen bg-white">
      <div class="ring">
        <div class="shine"></div>
        <div 
          class="progress" 
          style={`transform: rotate(${progress * 3.6}deg);`}
        ></div>
      </div>
      <p class="mt-8 text-lg font-semibold fade-animation max-w-md text-center" style={`color: ${colors.primary}`}>
        {currentMessage}
      </p>
    </div>
  );
};

export default ContextAwareNAMILoader;