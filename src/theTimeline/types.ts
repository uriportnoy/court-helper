import { CaseType, CourtType, Origin } from "./common";

export interface CaseFile {
  id: string;
  name: string;
  fileUrl: string;
  type?: CaseType;
  uploadDate: string;
  size?: number;
}

export interface Case {
  id?: string;
  type: CaseType;
  caseNumber: string;
  court: CourtType;
  description: string;
  relation: string;
  appealAccepted: boolean;
  isMyCase: boolean;
  isOpen: boolean;
  files?: CaseFile[];
  createdAt?: string;
  updatedAt?: string;
}

export interface Group {
  id: string;
  name: string;
}

export interface FileURL {
  url: string;
  label?: string;
  type?: Origin;
  date: string;
}
export interface TimelineEventData {
  id: string;
  type: string;
  title: string;
  subtitle: string;
  content: string;
  date: string;
  relatedCases: string[];
  relatedEvent: string | null;
  relatedDates: string[];
  groups: Group[];
  selectedCase: Case;
  caseNumber: string;
  fileURL: FileURL[];
  important?: boolean;
}
