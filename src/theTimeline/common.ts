import {SortDirection } from "@/theTimeline/types";
export const HASHALOM = "שלום";
export const MAHZOVY = "מחוזי";
export const ALONY = "עליון";
export const OTHER = "אחר";
export enum CourtType {
  HASHALOM = "שלום",
  MAHZOVY = "מחוזי",
  ALONY = "עליון",
  OTHER = "אחר",
} 
export enum CaseType {
  TELAHIM = "תלה״מ",
  EAMSH = "עמ״ש",
  SHISH = "ש״ש",
  RAMSH = "רמ״ש",
  YIZSH = "י״ס",
  OAL = "ע״ל",
  TAMSH = "תמ״ש",
  BEAM = "בע״מ",
  OTHER = "אחר",
}
export enum Origin {
  COURT = "court",
  MINE = "mine",
  NOT_MINE = "notMine",
  TRD_PARTY = "trd-party",
}
export const origins = [
  Origin.COURT,
  Origin.MINE,
  Origin.NOT_MINE,
  Origin.TRD_PARTY,
];

export enum AllValue {
  ALL = "all",
}
export const courts = Object.values(CourtType);
export const caseTypes = Object.values(CaseType);

const typeColors = {
    mine: "bg-blue-100 text-blue-700 border-blue-200",
    notMine: "bg-red-100 text-red-700 border-red-200",
    court: "bg-yellow-100 text-yellow-700 border-yellow-200",
    "trd-party": "bg-purple-100 text-purple-700 border-purple-200",
  };
  
  const typeLabels = {
    mine: "המסמך שלי",
    notMine: "צד שני",
    court: "בית משפט",
    "trd-party": "צד שלישי",
    undefined: "לא מוגדר",
  };
  
  const courtColors = {
    [HASHALOM]: "bg-green-500",
    [MAHZOVY]: "bg-blue-500",
    [ALONY]: "bg-purple-500",
    [OTHER]: "bg-red-500",
  };

  const monthNames = [
    "ינואר",
    "פברואר",
    "מרץ",
    "אפריל",
    "מאי",
    "יוני",
    "יולי",
    "אוגוסט",
    "ספטמבר",
    "אוקטובר",
    "נובמבר",
    "דצמבר",
  ];

export { typeColors, typeLabels, courtColors, monthNames, SortDirection };