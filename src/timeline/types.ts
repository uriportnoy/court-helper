export interface CaseFile {
  id: string;
  name: string;
  fileUrl: string;
  type?: string;
  uploadDate: string;
  size?: number;
}

export interface Case {
  id?: string;
  type: string;
  caseNumber: string;
  court: string;
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
  type?: string;
  date: string;
}
export interface TimelineData {
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
}
