export function safeSessionStorageSetItem(key: string, value: string) {
  try {
    sessionStorage.setItem(key, value);
  } catch (e) {
    console.error(`Failed to set item in session storage: ${e}`);
  }
}

