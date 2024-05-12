export function safeSessionStorageGetItem({ key, getItem, logError }: {
  key: string;
  getItem?: (key: string) => unknown;
  logError?: (message: string) => void;
}) {
  const storage = getItem || sessionStorage.getItem.bind(sessionStorage);
  const logger = logError || console.error.bind(console);

  try {
    return storage(key);
  } catch (e) {
    if (e instanceof DOMException && e.name === "SecurityError") {
      logger(`Failed to access session storage due to a security error: ${e.message}`);
    } else {
      logger(`Failed to get item from session storage: ${e}`);
    }
    return null;
  }
}