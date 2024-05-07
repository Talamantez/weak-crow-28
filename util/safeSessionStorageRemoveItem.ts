
export function safeSessionStorageRemoveItem(key: string) {
  try {
    sessionStorage.removeItem(key);
  } catch (e) {
    console.error(`Failed to remove item from session storage: ${e}`);
  }
}
