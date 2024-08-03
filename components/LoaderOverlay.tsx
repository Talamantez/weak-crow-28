import GeneralizedNAMILoader from "./GeneralizedNAMILoader.tsx";


export const LoaderOverlay = ({ isVisible }) => {
    if (!isVisible) return null;
  
    return (
      <div class="fixed inset-0 bg-white bg-opacity-90 flex items-center justify-center z-50">
        <GeneralizedNAMILoader mode="pdf" />
      </div>
    );
  };
  
//   // In your main component:
//   return (
//     <div>
//       {/* Your existing JSX */}
//       <button onClick={handlePrint}>Generate PDF</button>
//       <LoaderOverlay isVisible={isGeneratingPDF} />
//       {/* Rest of your component */}
//     </div>
//   );
  