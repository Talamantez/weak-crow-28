export const highlightSearchTerm = (textInput, searchTerm) => {
  console.log('Input:', textInput);
  console.log('Search term:', searchTerm);

  // Helper function to highlight a single string
  const highlightString = (text) => {
    if (typeof text !== 'string') {
      console.error('Error: text item is not a string', text);
      return text;
    }

    if (!searchTerm || typeof searchTerm !== 'string' || !searchTerm.trim()) {
      console.log('Search term is empty or invalid');
      return text;
    }

    try {
      const regex = new RegExp(`(${searchTerm})`, "gi");
      return text.split(regex).map((part, index) => 
        regex.test(part)
          ? <span key={index} className="bg-yellow-200">{part}</span>
          : part
      );
    } catch (error) {
      console.error('Error in highlighting text:', error);
      return text;
    }
  };

  // Helper function to process a single item (string or object)
  const processItem = (item) => {
    if (typeof item === 'string') {
      return highlightString(item);
    } else {
      return <div>{highlightString(item.text)}</div>;
    }
    
    // else if (item && typeof item === 'object' && 'text' in item) {
    //   return {
    //     ...item,
    //     text: highlightString(item.text)
    //   };
    // } else {
    //   console.error('Invalid item type', item);
    //   return item;
    // }
  };

  // Check if input is an array
  if (Array.isArray(textInput)) {
    return textInput.map((item, index) => (
      <span key={index}>
        {processItem(item)}
        {index < textInput.length - 1 && <br />} {/* Add line break between array items */}
      </span>
    ));
  } else {
    // If it's not an array, process it as a single item
    return processItem(textInput);
  }
};