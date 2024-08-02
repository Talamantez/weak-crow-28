const TextInputComponent = ({ title, handleTitleChange }) => {
    return (
      <textarea
        value={title}
        onChange={handleTitleChange}
        className="w-full p-2 border-2 border-blue-500 rounded mb-2 focus:(outline-none ring-4 ring-yellow-400)"
        rows={4} // You can adjust this number to set the initial number of visible text lines
      />
    );
  };
  
  export default TextInputComponent;