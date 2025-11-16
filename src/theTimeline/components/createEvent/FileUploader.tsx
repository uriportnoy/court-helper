import React, { useState, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Upload, FileText, Check, Loader2, X } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { useFileUploader } from "@/theTimeline/hooks/useFileUploader";

interface ButtonViewProps {
  buttonText: string;
  buttonIcon: React.ReactNode;
}
interface FileUploaderProps {
  onFileUploaded: (file: string, label: string) => void;
  setIsUploadingFile: (isUploading: boolean) => void;
  buttonViewProps?: ButtonViewProps;
}

export default function FileUploader({
  onFileUploaded,
  setIsUploadingFile,
  buttonViewProps,
}: FileUploaderProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const onFileUploadedCallback = useCallback(
    (file: string, label: string) => {
      onFileUploaded(file, label);
      setIsUploadingFile(false);
      toast.success("קובץ עלה בהצלחה");
    },
    [onFileUploaded]
  );

  const {
    handleDrag,
    handleDrop,
    handleFileInput,
    handleUploadClick,
    handleCancel,
    dragActive,
    pendingFile,
    fileLabel,
    setFileLabel,
    uploadProgress,
    isUploading,
  } = useFileUploader({
    onFileUploaded: onFileUploadedCallback,
    setIsUploadingFile,
  });

  const openPicker = useCallback(() => {
    if (inputRef.current && !isUploading) {
      inputRef.current.click();
    }
  }, [isUploading]);

  return (
    <div
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
      className={`relative border-2 border-dashed rounded-xl p-8 transition-all duration-200 ${
        dragActive
          ? "border-blue-400 bg-blue-50"
          : "border-slate-300 bg-slate-50/50 hover:border-slate-400"
      }`}
    >
      <input
        ref={inputRef}
        type="file"
        onChange={handleFileInput}
        accept=".pdf,.docx,.doc"
        className="hidden"
        id="file-upload"
        disabled={isUploading || !!pendingFile}
      />
      {!isUploading && !pendingFile && (
        <UploadView buttonViewProps={buttonViewProps} openPicker={openPicker} />
      )}
      {!isUploading && pendingFile && (
        <UploadFormView
          pendingFile={pendingFile}
          fileLabel={fileLabel}
          setFileLabel={setFileLabel}
          handleCancel={handleCancel}
          handleUploadClick={handleUploadClick}
          buttonViewProps={buttonViewProps}
        />
      )}
      {isUploading && (
        <UploadingProgressView
          uploadProgress={uploadProgress}
          buttonViewProps={buttonViewProps}
        />
      )}
    </div>
  );
}

const UploadView = ({
  buttonViewProps,
  openPicker,
}: {
  buttonViewProps: ButtonViewProps | undefined;
  openPicker: () => void;
}) => {
  if (buttonViewProps) {
    return (
      <Button
        type="button"
        variant="outline"
        className="cursor-pointer"
        onClick={openPicker}
      >
        {buttonViewProps.buttonIcon}
        {buttonViewProps.buttonText}
      </Button>
    );
  }
  return (
    <label htmlFor="file-upload" className="cursor-pointer">
      <div className="flex flex-col items-center text-center">
        <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mb-4">
          <Upload className="w-8 h-8 text-blue-600" />
        </div>
        <h3 className="text-lg font-semibold text-slate-900 mb-2">
          העלאת מסמך
        </h3>
        <p className="text-sm text-slate-600 mb-4">
          גרור ושחרר את הקובץ כאן, או לחץ לבחירה
        </p>
        <Button
          type="button"
          variant="outline"
          // className="pointer-events-none"
          onClick={openPicker}
        >
          <Upload className="w-4 h-4 ml-2" />
          בחר קובץ
        </Button>
        <p className="text-xs text-slate-500 mt-3">
          נתמך: PDF, DOCX (מקסימום 10MB)
        </p>
      </div>
    </label>
  );
};

interface UploadFormViewProps {
  pendingFile: File;
  fileLabel: string;
  setFileLabel: (label: string) => void;
  handleCancel: () => void;
  handleUploadClick: () => void;
  buttonViewProps: ButtonViewProps | undefined;
}

const UploadFormView = ({
  buttonViewProps,
  pendingFile,
  fileLabel,
  setFileLabel,
  handleCancel,
  handleUploadClick,
}: UploadFormViewProps) => {
  const sizeInMB = (pendingFile.size / 1024 / 1024).toFixed(2);
  if(buttonViewProps){
    return (
      <Button
        type="button"
        variant="outline"
        className="cursor-pointer"
        onClick={handleUploadClick}
      >
        {buttonViewProps.buttonIcon}
        {sizeInMB} MB | {pendingFile.name}
      </Button>
    );
  }
  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center">
        <FileText className="w-8 h-8 text-blue-600" />
      </div>
      <div className="text-center">
        <p className="font-semibold text-slate-900 mb-1">{pendingFile.name}</p>
        <p className="text-sm text-slate-600">
          {sizeInMB} MB
        </p>
      </div>
      <div className="w-full max-w-md space-y-3">
        <Input
          placeholder="תווית לקובץ (לדוגמה: 'החלטת בית משפט')"
          value={fileLabel}
          onChange={(e) => setFileLabel(e.target.value)}
          className="text-center"
        />
        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            className="flex-1"
          >
            <X className="w-4 h-4 ml-2" />
            ביטול
          </Button>
          <Button
            type="button"
            onClick={handleUploadClick}
            disabled={!fileLabel}
            className="flex-1 bg-blue-600 hover:bg-blue-700"
          >
            <Upload className="w-4 h-4 ml-2" />
            העלה
          </Button>
        </div>
      </div>
    </div>
  );
};

const UploadingProgressView = ({
  uploadProgress,
  buttonViewProps,
}: {
  uploadProgress: number;
  buttonViewProps: ButtonViewProps | undefined;
}) => {
  if (buttonViewProps) {
    return (
      <Button
        type="button"
        variant="outline"
        className="cursor-pointer"
        disabled
      >
        <Loader2 className="w-5 h-5 ml-2 animate-spin text-blue-600" />
        מעלה... {uploadProgress}%
      </Button>
    );
  }
  return (
    <div className="flex flex-col items-center">
      <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mb-4">
        {uploadProgress === 100 ? (
          <Check className="w-8 h-8 text-green-600" />
        ) : (
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        )}
      </div>
      <p className="text-sm font-medium text-slate-900 mb-3">
        {uploadProgress === 100 ? "ההעלאה הושלמה!" : "מעלה..."}
      </p>
      <Progress value={uploadProgress} className="w-full max-w-xs" />
      <p className="text-sm text-slate-600 mt-2">{uploadProgress}%</p>
    </div>
  );
};
