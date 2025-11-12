import React, { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Upload, FileText, Check, Loader2, X } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";

export default function FileUploader({ onFileUploaded }) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const [fileLabel, setFileLabel] = useState("");
  const [pendingFile, setPendingFile] = useState(null);

  const uploadFile = async (file, label) => {
    if (!label) {
      toast.error("נא להזין תווית לקובץ");
      return;
    }

    setUploading(true);
    setProgress(0);

    const progressInterval = setInterval(() => {
      setProgress(prev => Math.min(prev + 10, 90));
    }, 200);

    try {
      const file_url = await uploadFile(file, label);
      clearInterval(progressInterval);
      setProgress(100);
      
      setTimeout(() => {
        onFileUploaded(file_url, label);
        setUploading(false);
        setProgress(0);
        setFileLabel("");
        setPendingFile(null);
        toast.success("הקובץ הועלה בהצלחה!");
      }, 500);
    } catch (error) {
      clearInterval(progressInterval);
      setUploading(false);
      setProgress(0);
      setPendingFile(null);
      toast.error("שגיאה בהעלאת הקובץ");
      console.error(error);
    }
  };

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setPendingFile(e.dataTransfer.files[0]);
    }
  }, []);

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      setPendingFile(e.target.files[0]);
    }
  };

  const handleUploadClick = () => {
    if (pendingFile) {
      uploadFile(pendingFile, fileLabel);
    }
  };

  const handleCancel = () => {
    setPendingFile(null);
    setFileLabel("");
  };

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
        disabled={uploading || pendingFile}
      />
      
      {!uploading && !pendingFile ? (
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
            <Button type="button" variant="outline" className="pointer-events-none">
              <Upload className="w-4 h-4 ml-2" />
              בחר קובץ
            </Button>
            <p className="text-xs text-slate-500 mt-3">
              נתמך: PDF, DOCX (מקסימום 10MB)
            </p>
          </div>
        </label>
      ) : pendingFile && !uploading ? (
        <div className="flex flex-col items-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center">
            <FileText className="w-8 h-8 text-blue-600" />
          </div>
          <div className="text-center">
            <p className="font-semibold text-slate-900 mb-1">{pendingFile.name}</p>
            <p className="text-sm text-slate-600">{(pendingFile.size / 1024 / 1024).toFixed(2)} MB</p>
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
            {progress === 100 ? (
              <Check className="w-8 h-8 text-green-600" />
            ) : (
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            )}
          </div>
          <p className="text-sm font-medium text-slate-900 mb-3">
            {progress === 100 ? "ההעלאה הושלמה!" : "מעלה..."}
          </p>
          <Progress value={progress} className="w-full max-w-xs" />
          <p className="text-sm text-slate-600 mt-2">{progress}%</p>
        </div>
      )}
    </div>
  );
}