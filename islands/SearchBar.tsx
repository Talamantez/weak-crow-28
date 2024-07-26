import IconSearch from "https://deno.land/x/tabler_icons_tsx@0.0.5/tsx/search.tsx";

export const SearchBar = ({ searchTerm, onSearch }) => (
  <div class='relative flex-grow mr-2 mb-4 sm:mb-0'>
    <input
      type="text"
      placeholder="Search chapters and sections..."
      value={searchTerm}
      onInput={onSearch}
      class={'w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'}
    />
    <IconSearch class={'absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400'} />
  </div>
);