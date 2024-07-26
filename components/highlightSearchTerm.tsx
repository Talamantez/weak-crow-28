export const highlightSearchTerm = (text, searchTerm) => {
  try {
    if (!searchTerm?.trim()) return text;
    const regex = new RegExp(`(${searchTerm})`, "gi");
    return text.split(regex).map((part, index) => regex.test(part)
      ? <span key={index} className="bg-yellow-200">{part}</span>
      : part
    );
    
  } catch (error) {
    
  }

};
