import { safeSessionStorageSetItem } from "./safeSessionStorageSetItem.ts";

import * as sinon from "https://esm.sh/sinon@17.0.0";

Deno.test("safeSessionStorageSetItem sets item in session storage", () => {
  // Arrange
  const key = "testKey";
  const value = "testValue";
  const setItemMock = sinon.stub();

  // Act
  safeSessionStorageSetItem({ key, value, setItem: setItemMock });

  // Assert
  sinon.assert.calledOnceWithExactly(setItemMock, key, value);
});

Deno.test("safeSessionStorageSetItem handles session storage access error", () => {
  // Arrange
  const key = "testKey";
  const value = "testValue";
  const errorMessage = "Session storage access is blocked due to a security error";
  const setItemMock = sinon.stub().callsFake(() => {
    throw new DOMException(errorMessage, "SecurityError");
  });
  const logErrorMock = sinon.stub();

  // Act
  safeSessionStorageSetItem({ key, value, setItem: setItemMock, logError: logErrorMock });

  // Assert
  sinon.assert.calledOnceWithExactly(logErrorMock, `Failed to access session storage due to a security error: ${errorMessage}`);
});

Deno.test("safeSessionStorageSetItem handles general error", () => {
  // Arrange
  const key = "testKey";
  const value = "testValue";
  const errorMessage = "An error occurred while setting the item";
  const setItemMock = sinon.stub().callsFake(() => {
    throw new Error(errorMessage);
  });
  const logErrorMock = sinon.stub();

  // Act
  safeSessionStorageSetItem({ key, value, setItem: setItemMock, logError: logErrorMock });

  // Assert
  sinon.assert.calledOnceWithExactly(logErrorMock, `Failed to set item in session storage: Error: ${errorMessage}`);
});