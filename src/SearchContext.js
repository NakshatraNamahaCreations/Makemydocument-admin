import React, { createContext, useState } from "react";

export const SearchContext = createContext();

export function SearchProvider({ children }) {
  const [globalQuery, setGlobalQuery] = useState("");

  return (
    <SearchContext.Provider value={{ globalQuery, setGlobalQuery }}>
      {children}
    </SearchContext.Provider>
  );
}
