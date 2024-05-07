// Wrap session storage calls in a try-catch block
export function safeSessionStorageGetItem(key: string) {
  try {
    return sessionStorage.getItem(key);
  } catch (e) {
    console.error(`Failed to get item from session storage: ${e}`);
    return null;
  }
}
