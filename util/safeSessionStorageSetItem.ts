
export function safeSessionStorageSetItem({ key, value, setItem, logError }: {
  key: string;
  value: string;
  setItem?: (key: string, value: string) => void;
  logError?: (message: string) => void;
}): void {
  const storage = setItem || sessionStorage.setItem.bind(sessionStorage);
  const logger = logError || console.error.bind(console);

  try {
    storage(key, value);
  } catch (e) {
    if (e instanceof DOMException && e.name === "SecurityError") {
      logger(`Failed to access session storage due to a security error: ${e.message}`);
    } else {
      logger(`Failed to set item in session storage: ${e}`);
    }
  }
}