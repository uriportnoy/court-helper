import FileURLInput from "../createEvent/FileURLInput";
import { deleteFile } from "@/theTimeline/hooks/useFileUploader";

const FileList = ({
    fileURLInputs,
    setFileURLInputs,
  }: {
    fileURLInputs: any[];
    setFileURLInputs: (files: any[]) => void;
  }) => {
    const handleFileRemove = (index: number) => {
      deleteFile(fileURLInputs[index].url).then(() => {
        const filteredFiles = fileURLInputs.filter((_, i) => i !== index);
        setFileURLInputs(filteredFiles);
      });
    };
    const onFileChange = (index: number, field: string, value: string) => {
      const newInputs = [...fileURLInputs];
      newInputs[index][field] = value;
      setFileURLInputs(newInputs);
    };
  
    return (
      <div className="space-y-3">
        {fileURLInputs.map((file, index) => (
          <FileURLInput
            key={index + "-" + file.url}
            file={file}
            onChange={(field, value) => {
              onFileChange(index, field, value);
            }}
            onRemove={() => {
              handleFileRemove(index);
            }}
          />
        ))}
      </div>
    );
  };

export default FileList;