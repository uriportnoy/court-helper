export interface CurrentFile {
  label: string;
  url: string;
  type: string;
}
export interface FileUploaderProps {
  file: CurrentFile;
  onFileDelete: () => void;
  fileName?: string;
  updateFileList: (file: CurrentFile) => void;
}
