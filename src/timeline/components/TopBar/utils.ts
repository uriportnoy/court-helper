import CasesDropdown from "../CasesDropdown.tsx";
import { origins } from "timeline/common";

export const filterConfig = [
  {
    type: "case",
    label: "תיק",
    field: "caseNumber",
    component: CasesDropdown,
  },
  {
    type: "dropdown",
    label: "ערכאה",
    field: "selectedCase.court",
    options: ["שלום", "מחוזי", "העליון"],
  },
  {
    type: "multiSelect",
    label: "קבוצות",
    field: "groups",
    optionsKey: "groups",
    valueField: "id",
    labelField: "name",
  },
  {
    type: "dropdown",
    label: "גורם",
    field: "type",
    options: origins,
  },
  {
    type: "text",
    label: "חיפוש",
    field: "text",
    searchFields: ["title", "content", "caseNumber", "subtitle"],
  },
];
