import {useCallback, useState} from "react";
import {getFileNameAndExtension} from "./utils.ts";
import {
  deleteObject,
  getDownloadURL,
  getStorage,
  ref,
  uploadBytesResumable
} from "firebase/storage";
import {FileUploaderProps} from "./types.ts";


export function useFileUploader({
                                  file,
                                  updateUrl,
                                  deleteFile,
                                  fileName
                                }: FileUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [label, setLabel] = useState<string>(file.label || '');
  const [error, setError] = useState<string | null>(null);

  const handleUpload = useCallback(
      async (event) => {
        setIsUploading(true);
        setError(null);
        const files = event.files;

        try {
          const {name, ext} = getFileNameAndExtension(files[0].name);
          const storage = getStorage();
          const finalFileName = fileName || `${name}_${label || 'untitled'}`;
          const folderName = ext === 'pdf' ? 'pdfs' : ext;
          const storageRef = ref(storage, `${folderName}/${finalFileName}`);
          const uploadTask = uploadBytesResumable(storageRef, files[0]);

          uploadTask.on(
              'state_changed',
              (snapshot) => {
                const progress = Math.round(
                    (snapshot.bytesTransferred / snapshot.totalBytes) * 100
                );
                setUploadProgress(progress);
              },
              (error) => {
                console.error('Upload error:', error);
                setError('Failed to upload file. Please try again.');
                setIsUploading(false);
              },
              async () => {
                const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
                console.log('File available at', downloadUrl);
                updateUrl(
                    {
                      url: downloadUrl,
                    }
                );
                setIsUploading(false);
              }
          );
        } catch (error) {
          console.error('Error during upload:', error);
          setError('An unexpected error occurred. Please try again.');
          setIsUploading(false);
        }
      },
      [label]
  );

  const handleDelete = useCallback(async () => {
    if (!file.url) return;
    try {
      setIsUploading(true);
      const storage = getStorage();
      const fileRef = ref(storage, file.url);
      await deleteObject(fileRef);
      deleteFile();
    } catch (error) {
      console.error('Delete error:', error);
      setError('Failed to delete file. Please try again.');
    } finally {
      setIsUploading(false);
    }
  }, []);

  return {
    isUploading,
    uploadProgress,
    label,
    error,
    handleUpload,
    handleDelete,
    handleLabelChange: setLabel,
  };

}