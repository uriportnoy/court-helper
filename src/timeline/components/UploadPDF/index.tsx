import styled from 'styled-components';
import {Button} from 'primereact/button';
import {AnimatePresence, motion} from 'framer-motion';
import FileUploader from './FileUploader.tsx';
import {CurrentFile} from "./types.ts";

interface PDFUploaderProps {
  currentFiles: Array<CurrentFile>;
  updateUrls: (data: Array<CurrentFile>) => void;
  defaultType?: string;
  fileName?: string;
}

function PDFUploader({currentFiles = [], updateUrls, fileName, defaultType}: PDFUploaderProps) {
  return (
      <Wrapper>
        <AnimatePresence>
          {currentFiles.map((file, arrayIndex) => (
              <FileContainer
                  key={file.url || `temp-${arrayIndex}`}
                  initial={{opacity: 0, y: 20}}
                  animate={{opacity: 1, y: 0}}
                  exit={{opacity: 0, y: -20}}
                  transition={{duration: 0.3}}
              >
                <FileUploader
                    file = {{...file, type: file.type || defaultType || ''}}
                    fileName={fileName}
                    updateUrl={(data: Partial<CurrentFile>) => {
                      const updatedFiles = [...currentFiles];
                      updatedFiles[arrayIndex] = {...updatedFiles[arrayIndex], ...data};
                      updateUrls(updatedFiles);
                    }}
                    deleteFile={() => updateUrls(currentFiles.filter((f, idx) => idx !== arrayIndex))}
                />
              </FileContainer>
          ))}
        </AnimatePresence>
        <ButtonGroup>
          <ActionButton
              icon="pi pi-plus"
              onClick={() => {
                updateUrls([...currentFiles, {
                  label: 'הצג',
                  url: '',
                  type: defaultType || 'mine',
                }]);
              }}
              disabled={currentFiles.length > 0 && !currentFiles[currentFiles.length - 1].url}
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

const FileContainer = styled(motion.div)`
  background: white;
  border-radius: var(--border-radius-md);
  box-shadow: var(--shadow-sm);
  overflow: hidden;
  transition: all 0.2s ease;

  &:hover {
    box-shadow: var(--shadow-md);
    transform: translateY(-1px);
  }
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