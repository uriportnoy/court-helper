import { useState } from "react";
import { useCallback } from "react";
import { toast } from "sonner";
import {
  deleteObject,
  getDownloadURL,
  getStorage,
  ref,
  uploadBytesResumable,
} from "firebase/storage";
import { getFileNameAndExtension } from "@/timeline/components/UploadPDF/utils";

interface FileUploaderProps {
  onFileUploaded: (file: string, label: string) => void;
  fileName?: string;
  setIsUploadingFile?: (isUploading: boolean) => void;
}

export function useFileUploader({
  onFileUploaded,
  fileName,
  setIsUploadingFile,
}: FileUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const [dragActive, setDragActive] = useState(false);
  const [fileLabel, setFileLabel] = useState("");
  const [pendingFile, setPendingFile] = useState<File | null>(null);

  const handleUpload = useCallback(
    async (pendingFile: File, fileLabel: string) => {
      setIsUploading(true);
      setError(null);
      setIsUploadingFile?.(true);
      try {
        const { name, ext } = getFileNameAndExtension(pendingFile.name) || {};
        const storage = getStorage();
        // Determine folder structure based on fileName prefix for cases
        let folderPath: string;
        if (fileName && fileName.startsWith("case_")) {
          // Case-specific file: important/[caseNumber]/
          const caseNumber = fileName.replace("case_", "").split("_")[0];
          folderPath = `important/${caseNumber}`;
        } else {
          // General file: pdfs/ or other extension folder
          folderPath = ext === "pdf" ? "pdfs" : ext || "other";
        }

        const storageRef = ref(storage, `${folderPath}/${fileLabel || name}`);
        const uploadTask = uploadBytesResumable(storageRef, pendingFile);

        uploadTask.on(
          "state_changed",
          (snapshot) => {
            const progress = Math.round(
              (snapshot.bytesTransferred / snapshot.totalBytes) * 100
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
            onFileUploaded(downloadUrl, fileLabel);
            setIsUploadingFile?.(false);
            setPendingFile(null);
            setIsUploading(false);
          }
        );
      } catch (error) {
        console.error("Error during upload:", error);
        setError("An unexpected error occurred. Please try again.");
        setIsUploading(false);
      }
    },
    []
  );

  const handleDrag = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setPendingFile(e.dataTransfer.files[0]);
    }
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setPendingFile(e.target.files[0]);
    }
  };

  const handleUploadClick = useCallback(() => {
    if (pendingFile) {
      handleUpload(
        pendingFile,
        fileLabel || pendingFile.name.split(".")[0] || "קובץ"
      );
    }
  }, [pendingFile]);

  const handleCancel = useCallback(() => {
    setPendingFile(null);
    setFileLabel("");
  }, []);

  return {
    isUploading,
    uploadProgress,
    error,
    handleDrag,
    handleDrop,
    handleFileInput,
    handleUploadClick,
    handleCancel,
    dragActive,
    pendingFile,
    fileLabel,
    setFileLabel,
  };
}

export const deleteFile = async (fileUrl: string) => {
  try {
    const storage = getStorage();
    const fileRef = ref(storage, fileUrl);
    await deleteObject(fileRef);
    toast.success("קובץ נמחק בהצלחה");
  } catch (error) {
    console.error("Error deleting file:", error);
    toast.error("קרה שגיאה בזמן מחיקת הקובץ");
  }
};
