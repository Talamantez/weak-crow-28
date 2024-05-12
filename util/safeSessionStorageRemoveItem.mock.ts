export function safeSessionStorageRemoveItemMock({ key, removeItem, logError }: {
  key: string;
  removeItem?: (key: string) => void;
  logError?: (message: string) => void;
}): void {
  const storage = removeItem || sessionStorage.removeItem.bind(sessionStorage);
  const logger = logError || console.error.bind(console);

  try {
    storage(key);
  } catch (e) {
    if (e instanceof DOMException && e.name === "SecurityError") {
      logger(`Failed to access session storage due to a security error: ${e.message}`);
    } else {
      logger(`Failed to remove item from session storage: ${e}`);
    }
  }
}