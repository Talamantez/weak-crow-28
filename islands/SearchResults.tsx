import Expandable from "../components/ExpandableComponent.tsx";
import { highlightSearchTerm } from "../components/highlightSearchTerm.tsx";

const isMatch = (text, searchTerm) => {
  return text.toLowerCase().includes(searchTerm.toLowerCase());
};

export const SearchResults = (
  { searchTerm, searchResults, onEditChapter, onEditSection },
) => {
  if (searchTerm.trim() === "") {
    return null;
  }

  const filteredResults = searchResults.map((chapter) => {
    const matchingChapter = isMatch(chapter.title, searchTerm) ||
      isMatch(chapter.description, searchTerm);
    const matchingSections = chapter.sections.filter((section) =>
      isMatch(section.title, searchTerm) ||
      section.description?.blocks.some((block) =>
        isMatch(block.text, searchTerm)
      )
    );
    if (matchingChapter || matchingSections.length > 0) {
      return {
        ...chapter,
        sections: matchingSections,
      };
    }
    return null;
  }).filter(Boolean);

  if (filteredResults.length === 0) {
    return <p>No results found</p>;
  }

  return (
    <div className="mt-4">
      <h3 className="text-lg font-semibold mb-2">Search Results:</h3>
      {filteredResults.map((chapter) => (
        <Expandable
          key={chapter.index}
          title={chapter.title}
          description={chapter.description}
          searchTerm={searchTerm}
          onEdit={() => onEditChapter(chapter)}
          defaultExpanded={true}
        >
          {chapter.sections.map((section, sectionIndex) => (
            <Expandable
              key={sectionIndex}
              title={section.title}
              description={section.description?.blocks}
              searchTerm={searchTerm}
              onEdit={() => onEditSection(chapter, section)}
              defaultExpanded={true}
            >
              {section.description?.blocks.map((block, blockIndex) => (
                <p key={blockIndex}>
                  {highlightSearchTerm(block.text, searchTerm)}
                </p>
              ))}
            </Expandable>
          ))}
        </Expandable>
      ))}
    </div>
  );
};

export default SearchResults;
