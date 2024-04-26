
// Wrap session storage calls in a try-catch block
  export function safeSessionStorageGetItem(key: string) {
    try {
      return sessionStorage.getItem(key);
    } catch (e) {
      console.error(`Failed to get item from session storage: ${e}`);
      return null;
    }
  }
  
  export function safeSessionStorageSetItem(key: string, value: string) {
    try {
      sessionStorage.setItem(key, value);
    } catch (e) {
      console.error(`Failed to set item in session storage: ${e}`);
    }
  }
  
  export function safeSessionStorageRemoveItem(key: string) {
    try {
      sessionStorage.removeItem(key);
    } catch (e) {
      console.error(`Failed to remove item from session storage: ${e}`);
    }
  }
