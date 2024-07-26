import { useState, useCallback, useMemo } from 'preact/hooks';

const highlightSearchTerm = (text, searchTerm) => {
  if (!searchTerm.trim()) return text;
  const regex = new RegExp(`(${searchTerm})`, 'gi');
  return text.split(regex).map((part, index) =>
    regex.test(part) ? <span key={index} class="bg-yellow-200">{part}</span> : part
  );
};

const isMatch = (text, searchTerm) => {
  return text.toLowerCase().includes(searchTerm.toLowerCase());
};

export const useSearch = (initialSearchResults) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState(initialSearchResults);

  const handleSearch = useCallback((e) => {
    const newSearchTerm = e.target.value;
    setSearchTerm(newSearchTerm);
  }, []);

  const filteredResults = useMemo(() => {
    if (searchTerm.trim() === '') {
      return [];
    }

    return searchResults
      .map(chapter => {
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
      })
      .filter(Boolean);
  }, [searchTerm, searchResults]);

  const SearchBar = () => (
    <div class={`relative flex-grow mr-2 mb-4 sm:mb-0`}>
      <input
        type="text"
        placeholder="Search chapters and sections..."
        value={searchTerm}
        onInput={handleSearch}
        class="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <IconSearch class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
    </div>
  );

  const SearchResults = ({ onEditChapter, onEditSection }) => {
    if (searchTerm.trim() === "") {
      return null;
    }

    if (filteredResults.length === 0) {
      return <p>No results found</p>;
    }

    return (
      <div class='mt-4'>
        <h3 class='text-lg font-semibold mb-2'>Search Results:</h3>
        {filteredResults.map((chapter) => (
          <div key={chapter.index} class='mb-4 p-4 bg-gray-100 rounded'>
            <div class='flex justify-between items-center'>
              <h4 class='font-bold'>{highlightSearchTerm(chapter.title, searchTerm)}</h4>
              <Button
                text="Edit Chapter"
                onClick={() => onEditChapter(chapter.index)}
                styles="bg-blue-500 hover:bg-blue-600 text-white rounded px-2 py-1 text-sm"
                icon={IconEdit}
              />
            </div>
            <p>{highlightSearchTerm(chapter.description, searchTerm)}</p>
            {chapter.sections.map((section, sectionIndex) => (
              <div key={sectionIndex} class={`ml-4 mt-2`}>
                <div class='flex justify-between items-center'>
                  <h5 class='font-semibold'>{highlightSearchTerm(section.title, searchTerm)}</h5>
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

  return {
    searchTerm,
    setSearchTerm,
    searchResults,
    setSearchResults,
    filteredResults,
    SearchBar,
    SearchResults
  };
};

export default useSearch;