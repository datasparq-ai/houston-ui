
import { useState } from "react";

export function useLocalStorageKeys(demo) {
  // State to store our value
  // Pass initial state function to useState so logic is only executed once
  const [storedValue, setStoredValue] = useState(() => {

    try {
      // Get from local storage by key
      const item = window.localStorage.getItem("keys");
      // Parse stored json or if none return initialValue
      let data;
      if (item) {
        data = JSON.parse(item)
      } else {
        data = {active: {}, list: {}}
      }
      if (demo) {
        data.active.id = "demo"
        data.active.name = "Houston Demo"
        data.list["Houston Demo"] = "demo"
        data.list["New Key"] = "foobar"
      }
      return data
    } catch (error) {
      // If error also return initialValue
      console.log(error);
      return {list: {}};
    }
  });
  // Return a wrapped version of useState's setter function that
  // persists the new value to localStorage.
  const setValue = (value) => {
    try {
      // Allow value to be a function so we have same API as useState
      const valueToStore =
        value instanceof Function ? value(storedValue) : value;
      // Save state
      setStoredValue(value);
      // Save to local storage
      if (typeof window !== "undefined") {
        window.localStorage.setItem("keys", JSON.stringify(valueToStore));
      }
    } catch (error) {
      // A more advanced implementation would handle the error case
      console.log(error);
    }
  };
  return [storedValue, setValue];
}
