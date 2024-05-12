// safeSessionStorageRemoveItem.test.ts
import * as sinon from "https://esm.sh/sinon@17.0.0";

import { safeSessionStorageRemoveItem } from "./safeSessionStorageRemoveItem.ts";

Deno.test("safeSessionStorageRemoveItem removes item from session storage", () => {
  // Arrange
  const key = "testKey";
  const removeItemMock = sinon.stub();

  // Act
  safeSessionStorageRemoveItem({ key, removeItem: removeItemMock });

  // Assert
  sinon.assert.calledOnceWithExactly(removeItemMock, key);
});

Deno.test("safeSessionStorageRemoveItem handles session storage access error", () => {
  // Arrange
  const key = "testKey";
  const errorMessage = "Session storage access is blocked due to a security error";
  const removeItemMock = sinon.stub().callsFake(() => {
    throw new DOMException(errorMessage, "SecurityError");
  });
  const logErrorMock = sinon.stub();

  // Act
  safeSessionStorageRemoveItem({ key, removeItem: removeItemMock, logError: logErrorMock });

  // Assert
  sinon.assert.calledOnceWithExactly(logErrorMock, `Failed to access session storage due to a security error: ${errorMessage}`);
});

Deno.test("safeSessionStorageRemoveItem handles general error", () => {
  // Arrange
  const key = "testKey";
  const errorMessage = "An error occurred while removing the item";
  const removeItemMock = sinon.stub().callsFake(() => {
    throw new Error(errorMessage);
  });
  const logErrorMock = sinon.stub();

  // Act
  safeSessionStorageRemoveItem({ key, removeItem: removeItemMock, logError: logErrorMock });

  // Assert
  sinon.assert.calledOnceWithExactly(logErrorMock, `Failed to remove item from session storage: Error: ${errorMessage}`);
});