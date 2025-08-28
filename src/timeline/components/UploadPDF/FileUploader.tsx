import styled from "styled-components";
import { FileUpload } from "primereact/fileupload";
import { InputText } from "primereact/inputtext";
import { ProgressBar } from "primereact/progressbar";
import { Button } from "primereact/button";
import { motion, AnimatePresence } from "framer-motion";
import { SimpleDropdown } from "common/SimpleDropdown";
import { origins } from "timeline/common";
import { useFileUploader } from "./useFileUploader.tsx";
import { FileUploaderProps } from "./types.ts";
import { memo } from "react";

const FileUploader = (props: FileUploaderProps) => {
  const {
    isUploading,
    uploadProgress,
    currentFile,
    error,
    handleUpload,
    handleDelete,
    handleTypeChange,
    handleLabelChange,
    saveFile,
  } = useFileUploader(props);

  const { url, type } = currentFile;
  return (
    <FileContainer
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <InputGroup>
        <StyledInput
          value={currentFile.label}
          onChange={handleLabelChange}
          placeholder="שם"
          onBlur={saveFile}
        />
        <TypeDropdown
          options={origins}
          value={type}
          onChange={handleTypeChange}
          placeholder="Source"
          isClearable={false}
        />
        {url?.length && (
         <> <DeleteButton
            icon="pi pi-trash"
            severity="danger"
            onClick={handleDelete}
            disabled={isUploading}
          />
          {/* <Button
            icon="pi pi-copy"
            severity="secondary"
            onClick={() => {
              navigator.clipboard.writeText(url);
            }}
          /> */}
          </>
        )}
      </InputGroup>
      {!url?.length && (
        <UploadSection>
          <StyledFileUpload
            mode="basic"
            name="file"
            accept=".pdf,.docx"
            maxFileSize={35000000}
            customUpload
            uploadHandler={handleUpload}
            auto
            chooseLabel={"Choose File"}
            disabled={isUploading}
          />
          <AnimatePresence>
            {isUploading && (
              <ProgressOverlay
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <ProgressContent>
                  <StyledProgressBar value={uploadProgress} />
                  <ProgressText>{uploadProgress}%</ProgressText>
                </ProgressContent>
              </ProgressOverlay>
            )}
          </AnimatePresence>
        </UploadSection>
      )}
      <AnimatePresence>
        {error && (
          <ErrorMessage
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            {error}
          </ErrorMessage>
        )}
      </AnimatePresence>
    </FileContainer>
  );
};

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

const InputGroup = styled.div`
  display: flex;
  gap: 1rem;
`;

const StyledInput = styled(InputText)`
  flex: 2;
`;

const TypeDropdown = styled(SimpleDropdown)`
  flex: 1;
  min-width: 120px;
`;

const UploadSection = styled.div`
  position: relative;
`;

const ViewSection = styled.div`
  display: flex;
  gap: 1rem;
  align-items: center;
`;

const FileUrl = styled.div`
  flex: 1;
  padding: 0.5rem;
  background: var(--surface-50);
  border-radius: var(--border-radius-sm);
  font-family: monospace;
  font-size: 0.875rem;
  color: var(--surface-700);
  overflow: hidden;
  text-overflow: ellipsis;
  width: 100px;
`;

const StyledFileUpload = styled(FileUpload)`
  .p-button {
    width: 100%;
  }
`;

const ProgressOverlay = styled(motion.div)`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(2px);
`;

const ProgressContent = styled.div`
  width: 80%;
  text-align: center;
`;

const StyledProgressBar = styled(ProgressBar)`
  margin-bottom: 0.5rem;
  height: 0.5rem !important;
`;

const ProgressText = styled.div`
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--primary-700);
`;

const DeleteButton = styled(Button)`
  flex-shrink: 0;
`;

const ErrorMessage = styled(motion.div)`
  margin-top: 0.5rem;
  padding: 0.5rem;
  background: var(--red-50);
  color: var(--red-700);
  border-radius: var(--border-radius-sm);
  font-size: 0.875rem;
  text-align: center;
`;

export default memo(FileUploader);
