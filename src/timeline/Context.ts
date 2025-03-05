import { Context, createContext, useContext } from "react";
import { Case, Group, TimelineData } from "./types.ts";

interface AppContextType {
  loadEvents: () => void;
  allEvents: any;
  cases: Array<Case>;
  groups: Array<Group>;
  loadCases: () => Promise<Array<Case>>;
  timelineData: Array<TimelineData>;
}
const AppContext: Context<AppContextType> = createContext({
  loadEvents: () => {},
  allEvents: {},
  cases: [],
  groups: [],
  loadCases: () => Promise.resolve([]),
  timelineData: [],
});

export const Provider = AppContext.Provider;
export const useAppContext = () => useContext(AppContext);
