// Import the necessary dependencies and components
import { render, fireEvent, cleanup } from 'https://deno.land/x/fresh_testing_library@0.1.0/mod.ts';
import { beforeEach, describe, it } from 'https://deno.land/std@0.177.0/testing/bdd.ts';
import { expect } from 'https://deno.land/x/expect@v0.2.10/mod.ts';
import ProjectData from './ProjectData.tsx';

// Mock the localStorage methods
const localStorageMock = {
  getItem: () => {},
  setItem: () => {},
  removeItem: () => {},
};
globalThis.localStorage = localStorageMock as unknown as Storage;

describe('ProjectData component', () => {
  beforeEach(() => {
    localStorageMock.getItem = () => {};
    localStorageMock.setItem = () => {};
    localStorageMock.removeItem = () => {};
    cleanup();
  });

  it('renders the component correctly', () => {
    const { getByText } = render(<ProjectData title="Test Project" />);
    expect(getByText('Test Project')).toBeInTheDocument();
  });

  it('loads data from localStorage on mount', () => {
    const storedData = {
      description: 'Test description',
      sections: [{ title: 'Section 1', description: 'Section 1 description', subSections: [] }],
    };
    localStorageMock.getItem = () => JSON.stringify(storedData);
    render(<ProjectData title="Test Project" />);
    expect(localStorageMock.getItem).toHaveBeenCalledWith('Chapter Manager: Test Project');
  });

  it('updates the chapter description', () => {
    const { getByPlaceholderText } = render(<ProjectData title="Test Project" />);
    const descriptionInput = getByPlaceholderText('Click to edit description');
    fireEvent.change(descriptionInput, { target: { value: 'Updated description' } });
    fireEvent.blur(descriptionInput);
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'Chapter Manager: Test Project',
      JSON.stringify(expect.objectContaining({ description: 'Updated description' })),
    );
  });

  it('adds a new section', () => {
    const { getByText, getByPlaceholderText } = render(<ProjectData title="Test Project" />);
    fireEvent.click(getByText('+ Add Section'));
    const titleInput = getByPlaceholderText('Section Title');
    const descriptionInput = getByPlaceholderText('Section Description');
    fireEvent.change(titleInput, { target: { value: 'New Section' } });
    fireEvent.change(descriptionInput, { target: { value: 'New Section Description' } });
    fireEvent.click(getByText('Add'));
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'Chapter Manager: Test Project',
      JSON.stringify(expect.objectContaining({
        sections: expect.arrayContaining([
          expect.objectContaining({
            title: 'New Section',
            description: 'New Section Description',
          }),
        ]),
      })),
    );
  });

  // Add more test cases for other functionality like deleting sections, updating section titles, etc.
});