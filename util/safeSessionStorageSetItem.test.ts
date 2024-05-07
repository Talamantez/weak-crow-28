import { assertEquals } from "https://deno.land/std@0.224.0/assert/mod.ts";
import { safeSessionStorageSetItem } from "./safeSessionStorageSetItem.ts";

Deno.test("safeSessionStorageSetItem sets item in session storage", () => {
  const key = "testKey";
  const value = "testValue";

  safeSessionStorageSetItem(key, value);

  const storedValue = globalThis.sessionStorage.getItem(key);
  assertEquals(storedValue, value);
});