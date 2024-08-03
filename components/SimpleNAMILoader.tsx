import { useEffect, useState } from "preact/hooks";

const messages = [
  "Hang tight! We're putting things together for you...",
  "Almost there! Just adding some finishing touches...",
  "Bear with us! We're crafting your experience..."
];

const SimpleNAMILoader = () => {
  const [currentMessage, setCurrentMessage] = useState(messages[0]);
  const [progress, setProgress] = useState(0);

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
        border: 4px solid #262262;
        position: relative;
      }
      .shine {
        position: absolute;
        width: 100%;
        height: 100%;
        border-radius: 50%;
        border: 4px solid transparent;
        border-top: 4px solid #00A1DF;
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
        border-top: 4px solid #00A1DF;
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
        border-top: 4px solid #00A1DF;
        transform: rotate(0deg);
        transition: transform 0.5s ease;
      }
      .fade-animation {
        animation: fadeInOut 2s ease-in-out infinite;
      }
    `;
    document.head.appendChild(style);

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
  }, []);

  return (
    <div class="flex flex-col items-center justify-center h-screen bg-white">
      <div class="ring">
        <div class="shine"></div>
        <div 
          class="progress" 
          style={`transform: rotate(${progress * 3.6}deg);`}
        ></div>
      </div>
      <p class="mt-8 text-lg font-semibold text-[#262262] fade-animation max-w-md text-center">
        {currentMessage}
      </p>
    </div>
  );
};

export default SimpleNAMILoader;