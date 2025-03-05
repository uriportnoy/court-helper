import styled from "styled-components";
import { Button } from "primereact/button";
import { AnimatePresence, motion } from "framer-motion";
import FileUploader from "./FileUploader.tsx";
import { CurrentFile } from "./types.ts";

interface PDFUploaderProps {
  currentFiles: Array<CurrentFile>;
  updateFiles: (data: Array<CurrentFile>) => void;
  defaultType?: string;
  fileName?: string;
}

function PDFUploader({
  currentFiles = [],
  updateFiles,
  fileName,
  defaultType,
}: PDFUploaderProps) {
  return (
    <Wrapper>
      <AnimatePresence>
        {currentFiles.map((file, arrayIndex) => (
          <FileUploader
            key={file.url || `file_${arrayIndex}`}
            file={{ ...file, type: file.type || defaultType || "" }}
            fileName={fileName}
            onFileDelete={() => {
              updateFiles(currentFiles.filter((f, idx) => idx !== arrayIndex));
            }}
            updateFileList={(newFile) => {
              const newFiles = [...currentFiles];
              newFiles[arrayIndex] = newFile;
              updateFiles(newFiles);
            }}
          />
        ))}
      </AnimatePresence>
      <ButtonGroup>
        <ActionButton
          icon="pi pi-plus"
          onClick={() => {
            updateFiles([
              ...currentFiles,
              {
                label: "הצג",
                url: "",
                type: defaultType || "mine",
              },
            ]);
          }}
          disabled={
            currentFiles.length > 0 &&
            !currentFiles[currentFiles.length - 1].url
          }
          tooltip="Add new file"
          severity="secondary"
        />
      </ButtonGroup>
    </Wrapper>
  );
}

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1rem;
  background: var(--surface-50);
  border-radius: var(--border-radius-lg);
  border: 1px solid var(--surface-200);
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 0.5rem;
  justify-content: center;
  margin-top: 0.5rem;
`;

const ActionButton = styled(Button)`
  width: 2.5rem;
  height: 2.5rem;
  padding: 0;

  &:hover:not(:disabled) {
    transform: translateY(-1px);
  }

  &:active:not(:disabled) {
    transform: translateY(1px);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

export default PDFUploader;
