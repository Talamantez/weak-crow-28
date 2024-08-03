import { useEffect, useState } from "preact/hooks";

const messagesByMode = {
  initial: [
    "Welcome! We're getting everything ready for you...",
    "Just a moment while we set things up...",
    "Preparing your personalized experience..."
  ],
  chapter: [
    "Generating your chapter...",
    "Crafting your story elements...",
    "Bringing your narrative to life..."
  ],
  pdf: [
    "Sprinkling in some positivity...",
    "Folding your roadmap with care...",
    "Adding a dash of hope to each page...",
    "Sealing your journey with support...",
    "Preparing your personalized guide..."
  ]
};

const colorsByMode = {
  initial: { primary: "#262262", secondary: "#00A1DF" },
  chapter: { primary: "#2c3e50", secondary: "#e74c3c" },
  pdf: { 
    primary: "#7ac6e4",    // Lighter shade of NAMI blue
    secondary: "#b3d7e8",  // Even lighter shade for contrast
    accent: "#f0f7fa"      // Very light blue for background
  }
};

const GeneralizedNAMILoader = ({ mode = "initial" }) => {
  const [currentMessage, setCurrentMessage] = useState(messagesByMode[mode][0]);
  const [progress, setProgress] = useState(0);
  const colors = colorsByMode[mode] || colorsByMode.initial;

  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes fold {
        0%, 100% { transform: skew(0deg, 0deg); }
        50% { transform: skew(-5deg, -5deg); }
      }
      @keyframes fadeInOut {
        0%, 100% { opacity: 0.7; }
        50% { opacity: 1; }
      }
      .pdf-container {
        width: 120px;
        height: 150px;
        background-color: ${colors.primary};
        position: relative;
        border-radius: 5px;
        overflow: hidden;
        animation: fold 3s ease-in-out infinite;
      }
      .pdf-corner {
        position: absolute;
        top: 0;
        right: 0;
        width: 0;
        height: 0;
        border-top: 30px solid ${colors.accent};
        border-left: 30px solid transparent;
      }
      .pdf-content {
        position: absolute;
        top: 10px;
        left: 10px;
        right: 10px;
        bottom: 10px;
        background-color: ${colors.secondary};
        border-radius: 3px;
      }
      .pdf-line {
        position: absolute;
        height: 2px;
        left: 5px;
        right: 5px;
        background-color: ${colors.accent};
      }
      .fade-animation {
        animation: fadeInOut 2s ease-in-out infinite;
      }
    `;
    document.head.appendChild(style);

    const messages = messagesByMode[mode] || messagesByMode.initial;
    const messageInterval = setInterval(() => {
      setCurrentMessage((prevMessage) => {
        const currentIndex = messages.indexOf(prevMessage);
        const nextIndex = (currentIndex + 1) % messages.length;
        return messages[nextIndex];
      });
    }, 3000); // Faster message rotation for more engagement

    const progressInterval = setInterval(() => {
      setProgress((prevProgress) => {
        if (prevProgress >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prevProgress + 2;
      });
    }, 300);

    return () => {
      document.head.removeChild(style);
      clearInterval(messageInterval);
      clearInterval(progressInterval);
    };
  }, [mode]);

  return (
    <div class="flex flex-col items-center justify-center h-screen" style={`background-color: ${colors.accent};`}>
      <div class="pdf-container">
        <div class="pdf-corner"></div>
        <div class="pdf-content">
          {[...Array(5)].map((_, index) => (
            <div class="pdf-line" style={`top: ${20 + index * 25}px;`}></div>
          ))}
        </div>
      </div>
      <p class="mt-8 text-xl font-semibold fade-animation max-w-md text-center" style={`color: ${colors.primary};`}>
        {currentMessage}
      </p>
    </div>
  );
};

export default GeneralizedNAMILoader;