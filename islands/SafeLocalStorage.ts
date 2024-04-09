
// Wrap localStorage calls in a try-catch block
  export function safeLocalStorageGetItem(key: string) {
    try {
      return localStorage.getItem(key);
    } catch (e) {
      console.error(`Failed to get item from localStorage: ${e}`);
      return null;
    }
  }
  
  export function safeLocalStorageSetItem(key: string, value: string) {
    try {
      localStorage.setItem(key, value);
    } catch (e) {
      console.error(`Failed to set item in localStorage: ${e}`);
    }
  }
  
  export function safeLocalStorageRemoveItem(key: string) {
    try {
      localStorage.removeItem(key);
    } catch (e) {
      console.error(`Failed to remove item from localStorage: ${e}`);
    }
  }
