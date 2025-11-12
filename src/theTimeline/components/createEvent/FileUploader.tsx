import React, { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Upload, FileText, Check, Loader2, X } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { useFileUploader } from "@/theTimeline/hooks/useFileUploader";

interface FileUploaderProps {
  onFileUploaded: (file: string, label: string) => void;
  setIsUploadingFile: (isUploading: boolean) => void;
}

export default function FileUploader({
  onFileUploaded,
  setIsUploadingFile,
}: FileUploaderProps) {
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
        type="file"
        onChange={handleFileInput}
        accept=".pdf,.docx,.doc"
        className="hidden"
        id="file-upload"
        disabled={isUploading || !!pendingFile}
      />

      {!isUploading && !pendingFile ? (
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
              className="pointer-events-none"
            >
              <Upload className="w-4 h-4 ml-2" />
              בחר קובץ
            </Button>
            <p className="text-xs text-slate-500 mt-3">
              נתמך: PDF, DOCX (מקסימום 10MB)
            </p>
          </div>
        </label>
      ) : pendingFile && !isUploading ? (
        <div className="flex flex-col items-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center">
            <FileText className="w-8 h-8 text-blue-600" />
          </div>
          <div className="text-center">
            <p className="font-semibold text-slate-900 mb-1">
              {pendingFile.name}
            </p>
            <p className="text-sm text-slate-600">
              {(pendingFile.size / 1024 / 1024).toFixed(2)} MB
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
      ) : (
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
      )}
    </div>
  );
}
