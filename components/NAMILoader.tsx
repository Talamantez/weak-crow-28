import { useEffect } from 'preact/hooks';
import { apply, tw } from 'twind';

// Define the keyframe animations
const spin = apply`animate-[spin_4s_linear_infinite]`;
const spinReverse = apply`animate-[spin_3s_linear_infinite_reverse]`;
const spin2 = apply`animate-[spin_2s_linear_infinite]`;
const breathe = apply`animate-[breathe_4s_ease-in-out_infinite]`;

// Define the styles
const loaderContainer = apply`flex flex-col items-center justify-center h-screen bg-white`;
const loader = apply`relative w-28 h-28`;
const circle = apply`absolute rounded-full border-4 border-transparent`;
const circle1 = apply`inset-0 border-t-[#00A1DF] ${spin}`;
const circle2 = apply`top-3 left-3 right-3 bottom-3 border-t-[#262262] ${spinReverse}`;
const circle3 = apply`top-6 left-6 right-6 bottom-6 border-t-[#00A1DF] ${spin2}`;
const message = apply`mt-4 text-lg font-semibold text-[#262262] ${breathe}`;

// Define the keyframes
const keyframes = `
  @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
  @keyframes breathe { 0%, 100% { opacity: 0.7; transform: scale(1); } 50% { opacity: 1; transform: scale(1.05); } }
`;

const NAMILoader = ({ message = "Creating a space of support and understanding..." }) => {
  useEffect(() => {
    // Inject the keyframes into the document
    const style = document.createElement('style');
    style.textContent = keyframes;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  return (
    <div className={tw(loaderContainer)}>
      <div className={tw(loader)}>
        <div className={tw(circle, circle1)}></div>
        <div className={tw(circle, circle2)}></div>
        <div className={tw(circle, circle3)}></div>
      </div>
      <p className={tw(message)}>{message}</p>
    </div>
  );
};

export default NAMILoader;