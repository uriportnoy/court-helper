import { useCallback, useState } from "react";
import { getFileNameAndExtension } from "./utils.ts";
import {
  deleteObject,
  getDownloadURL,
  getStorage,
  ref,
  uploadBytesResumable,
} from "firebase/storage";
import { FileUploaderProps } from "./types.ts";
import { useImmer } from "use-immer";

export function useFileUploader({
  file,
  onFileDelete,
  updateFileList,
  fileName,
}: FileUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [currentFile, setCurrentFile] = useImmer(file);
  const [error, setError] = useState<string | null>(null);

  const { label } = currentFile;
  const handleUpload = useCallback(
    async (event: HTMLInputElement) => {
      setIsUploading(true);
      setError(null);
      const files = event.files;
      if (!files || files.length === 0) {
        return;
      }
      try {
        const { name, ext } = getFileNameAndExtension(files[0].name) || {};
        const storage = getStorage();
        const finalFileName = fileName
          ? `${fileName}_${label || "untitled"}_${Date.now()}` // Add timestamp for uniqueness
          : `${name || "name"}_${label || "untitled"}_${Date.now()}`;
        
        // Determine folder structure based on fileName prefix for cases
        let folderPath: string;
        if (fileName && fileName.startsWith("case_")) {
          // Case-specific file: important/[caseNumber]/
          const caseNumber = fileName.replace("case_", "").split("_")[0];
          folderPath = `important/${caseNumber}`;
        } else {
          // General file: pdfs/ or other extension folder
          folderPath = ext === "pdf" ? "pdfs" : ext;
        }
        
        const storageRef = ref(storage, `${folderPath}/${finalFileName}`);
        const uploadTask = uploadBytesResumable(storageRef, files[0]);

        uploadTask.on(
          "state_changed",
          (snapshot) => {
            const progress = Math.round(
              (snapshot.bytesTransferred / snapshot.totalBytes) * 100,
            );
            setUploadProgress(progress);
          },
          (error) => {
            console.error("Upload error:", error);
            setError("Failed to upload file. Please try again.");
            setIsUploading(false);
          },
          async () => {
            const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
            console.log("File available at", downloadUrl);
            setCurrentFile((draft) => {
              draft.url = downloadUrl;
              updateFileList({ ...draft });
            });
            setIsUploading(false);
          },
        );
      } catch (error) {
        console.error("Error during upload:", error);
        setError("An unexpected error occurred. Please try again.");
        setIsUploading(false);
      }
    },
    [label],
  );

  const handleDelete = useCallback(async () => {
    try {
      setIsUploading(true);
      if (currentFile.url) {
        const storage = getStorage();
        const fileRef = ref(storage, currentFile.url);
        await deleteObject(fileRef);
      }
    } catch (error) {
      console.error("Delete error:", error);
      setError("Failed to delete file. Please try again.");
    } finally {
      setIsUploading(false);
      onFileDelete();
    }
  }, []);

  return {
    isUploading,
    uploadProgress,
    label,
    error,
    handleUpload,
    handleDelete,
    handleLabelChange: (e: React.ChangeEvent<HTMLInputElement>) => {
      setCurrentFile((draft) => {
        draft.label = e.target.value;
      });
    },
    handleTypeChange: (newType: string) => {
      setCurrentFile((draft) => {
        draft.type = newType;
        updateFileList({ ...draft });
      });
    },
    saveFile: () => {
      updateFileList(currentFile);
    },
    currentFile,
  };
}
