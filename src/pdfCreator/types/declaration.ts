export interface DeclarationData {
  name: string;
  id: string;
  date: string;
  lawyer: string;
  comment: string;
  isRemote: boolean;
  withSignature?: boolean;
}

export interface AffidavitProps {
  data: DeclarationData;
  onChange: (data: DeclarationData) => void;
}

export interface AffidavitPreviewProps {
  data: DeclarationData;
}
