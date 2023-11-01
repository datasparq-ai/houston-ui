
import { useState } from "react";
import requests from "./requests";

/**
 *
 * @param demo   bool:   Demo mode flag. If running in demo mode, create a key called 'demo'.
 * @param urlKey string: Key provided in the URL as a query parameter. If provided this key will be selected.
 *                       If it doesn't exist in local storage it will be created. If the key doesn't exist in the server
 *                       an error message will be displayed.
 * @returns {unknown[]}
 */
export function useLocalStorageKeys(demo, urlKey) {
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
      } else if (urlKey !== null && urlKey !== "") {
        // assume key exists. If it doesn't, the KeySelect component will
        // create an alert and remove it from localStorage.
        console.log("Using key from URL")
        data.active.id = urlKey
        data.active.name = "Unnamed"
        data.list["Unnamed"] = urlKey
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
