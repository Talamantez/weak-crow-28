// AddSection.test.tsx

import { beforeEach, describe, it } from "https://deno.land/std@0.224.0/testing/bdd.ts";
import { assertEquals } from "https://deno.land/std@0.224.0/assert/assert_equals.ts";
import { AddSection, AddSectionProps } from "./AddSection.tsx";
import { render } from "https://esm.sh/preact-render-to-string";
import { DOMParser } from "https://deno.land/x/deno_dom@v0.1.45/deno-dom-wasm.ts";
import { stub } from "https://deno.land/std@0.224.0/testing/mock.ts";

// Create a mock object for hooks
const hooksMock = {
    useEffect: () => {},
    useState: () => [null, () => {}],
  };
  
  // Replace the actual useEffect and useState with the stubs
  stub(hooksMock, "useEffect");
  stub(hooksMock, "useState");

describe("AddSection component", () => {
    const defaultProps: AddSectionProps = {
      projectTitle: "Test Project",
      description: "Test Description",
      sections: [],
      isAddingSection: true,
      setIsAddingSection: () => {},
    };

    // Add reset method to the stubbed functions   
    beforeEach(() => {
        localStorage.clear();
    });
  
    it("renders input fields and buttons when isAddingSection is true", () => {
      const parser = new DOMParser();
      const html =  render(<AddSection {...defaultProps} />, { hooks: hooksMock });
      const doc = parser.parseFromString(
        html,
        "text/html"
      );
  
      if (doc) {
        assertEquals(doc.querySelector('input[placeholder="Section Title"]') instanceof HTMLInputElement, true);
        assertEquals(doc.querySelector('textarea[placeholder="Section Description"]') instanceof HTMLTextAreaElement, true);
        assertEquals(doc.querySelector('button:contains("Cancel")') instanceof HTMLButtonElement, true);
        assertEquals(doc.querySelector('button:contains("Add")') instanceof HTMLButtonElement, true);
      } else {
        throw new Error("Failed to parse the rendered HTML");
      }

    });

//   it("updates section title and description when input fields change", () => {
//     const { getByPlaceholderText } = render(<AddSection {...defaultProps} />);

//     const titleInput = getByPlaceholderText("Section Title") as HTMLInputElement;
//     const descriptionInput = getByPlaceholderText("Section Description") as HTMLTextAreaElement;

//     fireEvent.input(titleInput, { target: { value: "New Section" } });
//     fireEvent.input(descriptionInput, { target: { value: "New Description" } });

//     assertEquals(titleInput.value, "New Section");
//     assertEquals(descriptionInput.value, "New Description");
//   });

//   it("adds section to session storage and reloads page when Add button is clicked", () => {
//     const reloadMock = () => {};
//     const setIsAddingSectionMock = () => {};

//     const { getByPlaceholderText, getByText } = render(
//       <AddSection
//         {...defaultProps}
//         setIsAddingSection={setIsAddingSectionMock}
//       />
//     );

//     const titleInput = getByPlaceholderText("Section Title") as HTMLInputElement;
//     const descriptionInput = getByPlaceholderText("Section Description") as HTMLTextAreaElement;
//     const addButton = getByText("Add") as HTMLButtonElement;

//     fireEvent.input(titleInput, { target: { value: "New Section" } });
//     fireEvent.input(descriptionInput, { target: { value: "New Description" } });
//     fireEvent.click(addButton);

//     const storedData = JSON.parse(localStorage.getItem("Chapter Manager: Test Project") as string);
//     assertEquals(storedData.sections.length, 1);
//     assertEquals(storedData.sections[0].title, "New Section");
//     assertEquals(storedData.sections[0].description, "New Description");
//   });

//   it("calls setIsAddingSection with false when Cancel button is clicked", () => {
//     const setIsAddingSectionMock = () => {};

//     const { getByText } = render(
//       <AddSection
//         {...defaultProps}
//         setIsAddingSection={setIsAddingSectionMock}
//       />
//     );

//     const cancelButton = getByText("Cancel") as HTMLButtonElement;
//     fireEvent.click(cancelButton);

//     // You can add an assertion here to check if setIsAddingSection is called with false
//     // However, since it's a mock function, you would need to use a mocking library or a spy
//     // to verify the function call and its arguments.
//   });
});