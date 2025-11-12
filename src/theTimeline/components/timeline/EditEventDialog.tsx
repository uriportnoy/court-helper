import React, { useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Save,
  Plus,
  X,
  FileText,
  Calendar as CalendarIcon,
  Star,
  Building2,
  Tag,
} from "lucide-react";
import { toast } from "sonner";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import FileUploader from "../createEvent/FileUploader";
import FileURLInput from "../createEvent/FileURLInput";
import { updateEvent } from "@/timeline/firebase/events";
import CasesDropdown from "../createEvent/CasesDropdown";
import { Case } from "@/timeline/types";
import HtmlBox from "./HtmlBox";

interface EditEventDialogProps {
  event: any;
  cases: any[];
  open: boolean;
  onClose: () => void;
}

export default function EditEventDialog({
  event,
  cases,
  open,
  onClose,
}: EditEventDialogProps) {
  const queryClient = useQueryClient();
  console.log(event);
  const [formData, setFormData] = useState({
    title: event.title || "",
    subtitle: event.subtitle || "",
    content: event.content || "",
    date: event.date || new Date().toISOString().split("T")[0],
    important: event.important || false,
    type: event.type || "mine",
    caseNumber: event.caseNumber || "",
  });

  const [fileURLInputs, setFileURLInputs] = useState(
    event.fileURLs?.length > 0 ? event.fileURLs : []
  );

  const [groupInputs, setGroupInputs] = useState(
    event.groups?.length > 0 ? event.groups : [{ label: "", value: "" }]
  );

  const updateEventMutation = useMutation({
    mutationFn: updateEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      toast.success("האירוע עודכן בהצלחה!");
      onClose();
    },
    onError: (error) => {
      toast.error("שגיאה בעדכון האירוע");
      console.error(error);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const fileURLs = fileURLInputs
      .filter((f) => f.url && f.label)
      .map(({ label, url, type }) => ({ label, url, type }));

    const groups = groupInputs
      .filter((g) => g.label)
      .map(({ label, value }) => ({ label, value: value || label }));

    updateEventMutation.mutate({
      id: event.id,
      ...formData,
      fileURLs,
      groups,
    });
  };

  const handleFileUploaded = (fileUrl: string, label: string) => {
    setFileURLInputs((prev) => [
      ...prev,
      { label: label || "", url: fileUrl, type: "mine" },
    ]);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        className="max-w-5xl max-h-[95vh] overflow-hidden flex flex-col p-0"
        dir="rtl"
      >
        <DialogHeader className="px-8 pt-8 pb-4 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
          <DialogTitle className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg">
              <FileText className="w-6 h-6 text-white" />
            </div>
            עריכת אירוע
          </DialogTitle>
          <p className="text-slate-600 mt-2">ערוך את פרטי האירוע המשפטי</p>
        </DialogHeader>

        <form
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto px-8 py-6 space-y-6"
        >
          {/* Basic Information Section */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-slate-50 to-slate-100 px-6 py-4 border-b border-slate-200">
              <h3 className="font-semibold text-lg text-slate-900 flex items-center gap-2">
                <CalendarIcon className="w-5 h-5 text-slate-600" />
                מידע בסיסי
              </h3>
            </div>
            <div className="p-6 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Label
                    htmlFor="title"
                    className="text-sm font-semibold text-slate-700"
                  >
                    כותרת *
                  </Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    required
                    placeholder="כותרת האירוע"
                    className="h-11 border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="date"
                    className="text-sm font-semibold text-slate-700"
                  >
                    תאריך *
                  </Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) =>
                      setFormData({ ...formData, date: e.target.value })
                    }
                    required
                    className="h-11 border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="subtitle"
                  className="text-sm font-semibold text-slate-700"
                >
                  כותרת משנה
                </Label>
                <Input
                  id="subtitle"
                  value={formData.subtitle}
                  onChange={(e) =>
                    setFormData({ ...formData, subtitle: e.target.value })
                  }
                  placeholder="תיאור קצר"
                  className="h-11 border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Label
                    htmlFor="case"
                    className="text-sm font-semibold text-slate-700 flex items-center gap-2"
                  >
                    <Building2 className="w-4 h-4" />
                    תיק קשור
                  </Label>
                  <CasesDropdown
                    cases={cases}
                    selectedCase={formData.caseNumber}
                    setSelectedCase={(_case: Case) =>
                      setFormData({ ...formData, caseNumber: _case.caseNumber })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="type"
                    className="text-sm font-semibold text-slate-700"
                  >
                    סוג מסמך
                  </Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) =>
                      setFormData({ ...formData, type: value })
                    }
                  >
                    <SelectTrigger className="h-11 border-slate-300">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mine">המסמך שלי</SelectItem>
                      <SelectItem value="notMine">צד שני</SelectItem>
                      <SelectItem value="court">בית משפט</SelectItem>
                      <SelectItem value="thirdParty">צד שלישי</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                <Switch
                  id="important"
                  checked={formData.important}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, important: checked })
                  }
                />
                <Label
                  htmlFor="important"
                  className="cursor-pointer flex items-center gap-2 font-medium text-amber-900"
                >
                  <Star className="w-4 h-4" />
                  סמן כאירוע חשוב
                </Label>
              </div>
            </div>
          </div>

          {/* Content Section */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-slate-50 to-slate-100 px-6 py-4 border-b border-slate-200">
              <h3 className="font-semibold text-lg text-slate-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-slate-600" />
                תוכן האירוע
              </h3>
            </div>
            <HtmlBox
              html={formData.content}
              onChange={(html) => setFormData({ ...formData, content: html })}
            />
          </div>

          {/* Files Section */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-slate-50 to-slate-100 px-6 py-4 border-b border-slate-200">
              <h3 className="font-semibold text-lg text-slate-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-slate-600" />
                מסמכים וקבצים
              </h3>
            </div>
            <div className="p-6 space-y-4">
              <FileUploader onFileUploaded={handleFileUploaded} />

              <div className="space-y-3">
                {fileURLInputs.map((file, index) => (
                  <FileURLInput
                    key={index + "-" + file.url}
                    file={file}
                    index={index}
                    onChange={(field, value) => {
                      const newInputs = [...fileURLInputs];
                      newInputs[index][field] = value;
                      setFileURLInputs(newInputs);
                    }}
                    onRemove={() =>
                      setFileURLInputs(
                        fileURLInputs.filter((_, i) => i !== index)
                      )
                    }
                  />
                ))}
              </div>
              {/* <PDFUploader
          currentFiles={state?.fileURL}
          fileName={state.title.replace(" ", "_") + "_" + state.date}
          updateFiles={(updatedFiles) => {
            setState((draft) => {
              draft.fileURL = updatedFiles;
            });
          }}
          defaultType={state.type}
        /> */}
            </div>
          </div>

          {/* Groups/Tags Section */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-slate-50 to-slate-100 px-6 py-4 border-b border-slate-200">
              <h3 className="font-semibold text-lg text-slate-900 flex items-center gap-2">
                <Tag className="w-5 h-5 text-slate-600" />
                קטגוריות ותגיות
              </h3>
            </div>
            <div className="p-6 space-y-4">
              {groupInputs.map((group, index) => (
                <div key={index + "-" + group.label} className="flex gap-3">
                  <Input
                    placeholder="שם קטגוריה"
                    value={group.label}
                    onChange={(e) => {
                      const newInputs = [...groupInputs];
                      newInputs[index].label = e.target.value;
                      setGroupInputs(newInputs);
                    }}
                    className="h-11 border-slate-300"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() =>
                      setGroupInputs(groupInputs.filter((_, i) => i !== index))
                    }
                    className="h-11 w-11 hover:bg-red-50 hover:text-red-600"
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
                className="w-full h-11 border-dashed border-2 hover:bg-blue-50 hover:border-blue-300"
              >
                <Plus className="w-4 h-4 ml-2" />
                הוסף קטגוריה
              </Button>
            </div>
          </div>
        </form>

        {/* Footer Actions */}
        <div className="px-8 py-5 border-t bg-slate-50 flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="h-11 px-6"
          >
            ביטול
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={updateEventMutation.isPending}
            className="h-11 px-8 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg"
          >
            <Save className="w-5 h-5 ml-2" />
            {updateEventMutation.isPending ? "שומר..." : "שמור שינויים"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
