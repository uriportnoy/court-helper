import { createContext, useContext } from "react";

const AppContext = createContext({});

export const Provider = AppContext.Provider;
export const useAppContext = () => useContext(AppContext);
