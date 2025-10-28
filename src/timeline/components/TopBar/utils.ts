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
    type: "multiSelect",
    label: "גורם",
    field: "type",
    options: origins.map((o) => ({ label: o, value: o })),
  },
  {
    type: "text",
    label: "חיפוש",
    field: "text",
    searchFields: [
      "title", 
      "content", 
      "caseNumber", 
      "subtitle", 
      "date",
      "selectedCase.description",
      "selectedCase.relation", 
      "selectedCase.type",
      "selectedCase.id",
      "groups[].label"
    ],
  },
];
