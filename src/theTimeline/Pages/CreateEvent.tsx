import { useState } from "react";
import "../../timeline/firebase";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "../utils";
import {
  Button,
  Input,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Label,
  Switch,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui";
import { ArrowRight, Save, Plus, X } from "lucide-react";
import { toast } from "sonner";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import FileUploader from "../components/createEvent/FileUploader";
import { addEvent } from "../../timeline/firebase/events.ts";
import { Case } from "@/timeline/types.ts";
import CasesDropdown from "../components/createEvent/CasesDropdown.tsx";
import FileList from "../components/common/FileList.tsx";
import { useTimelineContext } from "@/theTimeline/context";
import { Origin } from "@/timeline/common";
import AIFileToObject from "../components/createEvent/AIFileToObject.tsx";

export default function CreateEventPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isUploadingFile, setIsUploadingFile] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    subtitle: "",
    content: "",
    date: new Date().toISOString().split("T")[0],
    important: false,
    type: Origin.MINE,
    caseNumber: "",
    fileURLs: [],
    groups: [],
  });

  const [fileURLInputs, setFileURLInputs] = useState([]);
  const [groupInputs, setGroupInputs] = useState([{ label: "", value: "" }]);

  const { cases } = useTimelineContext();
  const createEventMutation = useMutation({
    mutationFn: async (eventData) => {
      // Persist both fileURLs and fileURL for compatibility with older views
      const payload = {
        ...eventData,
        fileURL: eventData.fileURLs,
      };
      await addEvent(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      toast.success("האירוע נוצר בהצלחה!");
      navigate(createPageUrl("Timeline"));
    },
    onError: (error) => {
      toast.error("שגיאה ביצירת האירוע");
      console.error(error);
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    const fileURLs = fileURLInputs
      .filter((f) => f.url && f.label)
      .map(({ label, url, type }) => ({ label, url, type }));

    const groups = groupInputs
      .filter((g) => g.label)
      .map(({ label, value }) => ({ label, value: value || label }));

    createEventMutation.mutate({
      ...formData,
      fileURLs,
      groups,
    });
  };

  const handleFileUploaded = (fileUrl: string, label: string) => {
    setFileURLInputs((prev) => [
      ...prev,
      { label, url: fileUrl, type: Origin.MINE },
    ]);
  };

  const handleObjectGenerated = (
    object: any,
    file: { fileUrl: string; label: string }
  ) => {
    const receivedData = {
      ...object,
      caseNumber: object.caseNumber?.match(/\d{5}-\d{2}-\d{2}/)?.[0] || null,
    };
    handleFileUploaded(file.fileUrl, file.label);
    console.log("AI PDF Object received", receivedData);
    setFormData(receivedData);
  };
  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate(createPageUrl("Timeline"))}
            className="rounded-full"
          >
            <ArrowRight className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              יצירת אירוע חדש
            </h1>
            <p className="text-slate-600">
              הוסף אירוע חדש לציר הזמן המשפטי שלך
            </p>
          </div>
          <AIFileToObject onObjectGenerated={handleObjectGenerated} />
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <Card className="shadow-lg border-slate-200/50">
            <CardHeader>
              <CardTitle>מידע בסיסי</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">כותרת *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    required
                    placeholder="כותרת האירוע"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date">תאריך *</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) =>
                      setFormData({ ...formData, date: e.target.value })
                    }
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="subtitle">כותרת משנה</Label>
                <Input
                  id="subtitle"
                  value={formData.subtitle}
                  onChange={(e) =>
                    setFormData({ ...formData, subtitle: e.target.value })
                  }
                  placeholder="תיאור קצר"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="case">תיק קשור</Label>
                  <CasesDropdown
                    cases={cases}
                    selectedCase={
                      cases.find(
                        (c: Case) => c.caseNumber === formData.caseNumber
                      ) || null
                    }
                    setSelectedCase={(_case: Case) =>
                      setFormData({ ...formData, caseNumber: _case.caseNumber })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="type">סוג מסמך</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) =>
                      setFormData({ ...formData, type: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={Origin.MINE}>המסמך שלי</SelectItem>
                      <SelectItem value={Origin.NOT_MINE}>צד שני</SelectItem>
                      <SelectItem value={Origin.COURT}>בית משפט</SelectItem>
                      <SelectItem value={Origin.TRD_PARTY}>צד שלישי</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Switch
                  id="important"
                  checked={formData.important}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, important: checked })
                  }
                />
                <Label htmlFor="important" className="cursor-pointer">
                  סמן כחשוב
                </Label>
              </div>
            </CardContent>
          </Card>

          {/* Content */}
          <Card className="shadow-lg border-slate-200/50">
            <CardHeader>
              <CardTitle>פרטי האירוע</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label>תוכן</Label>
                <ReactQuill
                  theme="snow"
                  value={formData.content}
                  onChange={(value) =>
                    setFormData({ ...formData, content: value })
                  }
                  className="bg-white rounded-lg"
                  modules={{
                    toolbar: [
                      ["bold", "italic", "underline", "strike"],
                      [{ list: "ordered" }, { list: "bullet" }],
                      [{ color: [] }, { background: [] }],
                      ["clean"],
                    ],
                  }}
                />
              </div>
            </CardContent>
          </Card>

          {/* Files */}
          <Card className="shadow-lg border-slate-200/50">
            <CardHeader>
              <CardTitle>מסמכים וקבצים</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FileUploader
                onFileUploaded={handleFileUploaded}
                setIsUploadingFile={setIsUploadingFile}
              />
              <FileList
                fileURLInputs={fileURLInputs}
                setFileURLInputs={setFileURLInputs}
              />
            </CardContent>
          </Card>

          {/* Groups/Tags */}
          <Card className="shadow-lg border-slate-200/50">
            <CardHeader>
              <CardTitle>קטגוריות ותגיות</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {groupInputs.map((group, index) => (
                <div key={index} className="flex gap-3">
                  <Input
                    placeholder="שם קטגוריה"
                    value={group.label}
                    onChange={(e) => {
                      const newInputs = [...groupInputs];
                      newInputs[index].label = e.target.value;
                      setGroupInputs(newInputs);
                    }}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() =>
                      setGroupInputs(groupInputs.filter((_, i) => i !== index))
                    }
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  setGroupInputs([...groupInputs, { label: "", value: "" }])
                }
                className="w-full"
              >
                <Plus className="w-4 h-4 ml-2" />
                הוסף קטגוריה
              </Button>
            </CardContent>
          </Card>

          {/* Submit */}
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(createPageUrl("Timeline"))}
            >
              ביטול
            </Button>
            <Button
              type="submit"
              disabled={createEventMutation.isPending}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
            >
              <Save className="w-5 h-5 ml-2" />
              {createEventMutation.isPending ? "יוצר..." : "צור אירוע"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
