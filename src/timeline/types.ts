export interface Case {
  type: string;
  caseNumber: string;
  court: string;
  description: string;
  appealAccepted: boolean;
  isMyCase: boolean;
  isOpen: boolean;
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
