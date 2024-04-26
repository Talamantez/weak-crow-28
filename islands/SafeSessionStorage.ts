
// Wrap localStorage calls in a try-catch block
  export function safeSessionStorageGetItem(key: string) {
    try {
      return sessionStorage.getItem(key);
    } catch (e) {
      console.error(`Failed to get item from localStorage: ${e}`);
      return null;
    }
  }
  
  export function safeSessionStorageSetItem(key: string, value: string) {
    try {
      sessionStorage.setItem(key, value);
    } catch (e) {
      console.error(`Failed to set item in localStorage: ${e}`);
    }
  }
  
  export function safeSessionStorageRemoveItem(key: string) {
    try {
      sessionStorage.removeItem(key);
    } catch (e) {
      console.error(`Failed to remove item from localStorage: ${e}`);
    }
  }
