const ChapterSection = ({ section, depth = 1 }) => {
    const renderHeading = () => {
      switch (depth) {
        case 1:
          return <h3 class="font-bold mt-2">{section.title}</h3>;
        case 2:
          return <h4 class="font-bold mt-2">{section.title}</h4>;
        case 3:
          return <h5 class="font-bold mt-2">{section.title}</h5>;
        default:
          return <h6 class="font-bold mt-2">{section.title}</h6>;
      }
    };
  
    return (
      <div class={`ml-${depth * 4}`}>
        {renderHeading()}
        <p>{section.description?.blocks[0]?.text || ''}</p>
        {section.sections?.map((subSection, index) => (
          <ChapterSection key={index} section={subSection} depth={depth + 1} />
        ))}
      </div>
    );
  };
  
  const Chapter = ({ chapter }) => (
    <div className="mb-8">
      <h2 className="text-2xl font-bold">{chapter.title}</h2>
      <p>{chapter.description.blocks[0].text}</p>
      {chapter.imageUrl && (
        <img src={chapter.imageUrl} alt={chapter.title} className="my-4 max-w-full h-auto" />
      )}
      {chapter.sections.map((section, index) => (
        <ChapterSection key={index} section={section} />
      ))}
    </div>
  );
  
  const ChapterRenderer = ({ chapters }) => (
    <div className="p-4">
      {chapters.map((chapter, index) => (
        <Chapter key={index} chapter={chapter} />
      ))}
    </div>
  );
  
  export default ChapterRenderer;