import Button from "../components/Button.tsx";
import IconEdit from "https://deno.land/x/tabler_icons_tsx@0.0.5/tsx/edit.tsx";

const highlightSearchTerm = (text, searchTerm) => {
  if (!searchTerm.trim()) return text;
  const regex = new RegExp(`(${searchTerm})`, 'gi');
  return text.split(regex).map((part, index) => 
    regex.test(part) ? <span key={index} className="bg-yellow-200">{part}</span> : part
  );
};

const isMatch = (text, searchTerm) => {
  return text.toLowerCase().includes(searchTerm.toLowerCase());
};

export const SearchResults = ({ searchTerm, searchResults, onEditChapter, onEditSection }) => {
  if (searchTerm.trim() === "") {
    return null;
  }

  const filteredResults = searchResults.map(chapter => {
    const matchingChapter = isMatch(chapter.title, searchTerm) || isMatch(chapter.description, searchTerm);
    const matchingSections = chapter.sections.filter(section => 
      isMatch(section.title, searchTerm) || 
      section.description?.blocks.some(block => isMatch(block.text, searchTerm))
    );

    if (matchingChapter || matchingSections.length > 0) {
      return {
        ...chapter,
        sections: matchingSections
      };
    }
    return null;
  }).filter(Boolean);

  if (filteredResults.length === 0) {
    return <p>No results found</p>;
  }

  return (
    <div className='mt-4'>
      <h3 className='text-lg font-semibold mb-2'>Search Results:</h3>
      {filteredResults.map((chapter) => (
        <div key={chapter.index} className='mb-4 p-4 bg-gray-100 rounded'>
          <div className='flex justify-between items-center'>
            <h4 className='font-bold'>{highlightSearchTerm(chapter.title, searchTerm)}</h4>
            <Button
              text="Edit Chapter"
              onClick={() => onEditChapter(chapter.index)}
              styles="bg-blue-500 hover:bg-blue-600 text-white rounded px-2 py-1 text-sm"
              icon={IconEdit}
            />
          </div>
          <p>{highlightSearchTerm(chapter.description, searchTerm)}</p>
          {chapter.sections.map((section, sectionIndex) => (
            <div key={sectionIndex} className={`ml-4 mt-2`}>
              <div className='flex justify-between items-center'>
                <h5 className='font-semibold'>{highlightSearchTerm(section.title, searchTerm)}</h5>
                <Button
                  text="Edit Section"
                  onClick={() => onEditSection(chapter.index, sectionIndex)}
                  styles="bg-green-500 hover:bg-green-600 text-white rounded px-2 py-1 text-sm"
                  icon={IconEdit}
                />
              </div>
              {section.description?.blocks.map((block, blockIndex) => (
                <p key={blockIndex}>{highlightSearchTerm(block.text, searchTerm)}</p>
              ))}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default SearchResults;