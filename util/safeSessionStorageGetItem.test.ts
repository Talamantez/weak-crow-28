// safeSessionStorageGetItem.test.ts
import { assertEquals } from "https://deno.land/std@0.224.0/assert/assert_equals.ts";
import { safeSessionStorageGetItem } from "./safeSessionStorageGetItem.ts";

import * as sinon from "https://esm.sh/sinon@17.0.0";


Deno.test("safeSessionStorageGetItem retrieves item from session storage", () => {
  // Arrange
  const key = "testKey";
  const value = "testValue";
  sessionStorage.setItem(key, value);

  // Act
  const result = safeSessionStorageGetItem({ key });

  // Assert
  assertEquals(result, value);
});

Deno.test("safeSessionStorageGetItem returns null when item doesn't exist", () => {
  // Arrange
  const key = "nonExistentKey";

  // Act
  const result = safeSessionStorageGetItem({ key });

  // Assert
  assertEquals(result, null);
});

Deno.test("safeSessionStorageGetItem retrieves item from session storage", () => {
  // Arrange
  const key = "testKey";
  const value = "testValue";
  const getItemMock = sinon.stub().returns(value);

  // Act
  const result = safeSessionStorageGetItem({ key, getItem: getItemMock } as { key: string; getItem: () => unknown });

  // Assert
  assertEquals(result, value);
  sinon.assert.calledOnceWithExactly(getItemMock, key);
});

Deno.test("safeSessionStorageGetItem returns null when item doesn't exist", () => {
  // Arrange
  const key = "nonExistentKey";
  const getItemMock = sinon.stub().returns(null);

  // Act
  const result = safeSessionStorageGetItem({ key, getItem: getItemMock } as { key: string; getItem: () => unknown });
  
  // Assert
  assertEquals(result, null);
  sinon.assert.calledOnceWithExactly(getItemMock, key);
});

Deno.test("safeSessionStorageGetItem handles session storage access error", () => {
  // Arrange
  const key = "testKey";
  const errorMessage = "Session storage access is blocked due to a security error";
  const getItemMock = sinon.stub().callsFake(() => {
    throw new DOMException(errorMessage, "SecurityError");
  });
  const logErrorMock = sinon.stub();

  // Act
  const result = safeSessionStorageGetItem({ key, getItem: getItemMock, logError: logErrorMock } as { key: string; getItem: () => unknown });

  // Assert
  assertEquals(result, null);
  sinon.assert.calledOnceWithExactly(logErrorMock, `Failed to access session storage due to a security error: ${errorMessage}`);
});