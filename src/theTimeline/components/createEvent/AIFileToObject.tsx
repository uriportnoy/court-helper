import { Loader2, Rocket } from "lucide-react";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import FileUploader from "./FileUploader";
import { readPDFObject } from "@/timeline/firebase/functions";
import { Button } from "@/components/ui/button";

interface AIFileToObjectProps {
  onObjectGenerated: (
    object: any,
    file: { fileUrl: string; label: string }
  ) => void;
  setIsUploadingFile?: (isUploading: boolean) => void;
}

export default function AIFileToObject({
  onObjectGenerated,
  setIsUploadingFile,
}: AIFileToObjectProps) {
  const [isGeneratingObject, setIsGeneratingObject] = useState(false);

  const onFileUploadedCallback = useCallback(
    async (fileUrl: string, label: string) => {
      try {
        console.log("fileUrl", fileUrl, label);
        toast.success("קובץ עלה בהצלחה");
        setIsGeneratingObject(true);
        // generate object from file
        const object = await readPDFObject(fileUrl);
        onObjectGenerated(object, {
          fileUrl,
          label,
        });
        toast.success("מידע נוצר בהצלחה");
      } catch (e: any) {
        onObjectGenerated(
          {},
          {
            fileUrl,
            label,
          }
        );
        toast.error(`שגיאה ביצירת מידע מהקובץ: ${e?.message || e}`);
      } finally {
        setIsGeneratingObject(false);
      }
    },
    [onObjectGenerated]
  );

  if (isGeneratingObject) {
    return (
      <Button type="button" variant="outline" className="cursor-pointer" disabled>
        <Loader2 className="w-5 h-5 ml-2 animate-spin text-blue-600" />
        מעבד קובץ...
      </Button>
    );
  }

  return (
    <FileUploader
      buttonViewProps={{
        buttonText: "הוסף מקובץ (PDF)",
        buttonIcon: <Rocket className="w-5 h-5 ml-2 text-blue-600" />,
      }}
      onFileUploaded={onFileUploadedCallback}
      setIsUploadingFile={setIsUploadingFile ?? (() => {})}
    />
  );
}
