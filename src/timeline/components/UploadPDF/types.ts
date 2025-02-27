export interface CurrentFile {
  label: string;
  url: string;
  type: string;
}
export interface FileUploaderProps {
  file: CurrentFile;
  updateUrl: ( file: Partial<CurrentFile> ) => void;
  deleteFile: () => void;
  fileName?: string;
}