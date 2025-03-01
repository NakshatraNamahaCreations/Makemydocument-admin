import { createContext, useState } from "react";

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [headerText, setHeaderText] = useState("Default Header");

  return (
    <AppContext.Provider value={{ headerText, setHeaderText }}>
      {children}
    </AppContext.Provider>
  );
};
