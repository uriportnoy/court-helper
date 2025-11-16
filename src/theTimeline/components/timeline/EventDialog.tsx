import React, { useState, useEffect } from "react";
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
  FileText,
  Calendar as CalendarIcon,
  Star,
  Building2,
  Tag,
  Sparkles,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import "react-quill/dist/quill.snow.css";

import FileUploader from "../createEvent/FileUploader";
import FileList from "../common/FileList";
import CasesDropdown from "../createEvent/CasesDropdown";
import GroupsDropdown from "../createEvent/GroupsDropdown";

import { Case } from "@/timeline/types";
import { addEvent, updateEvent } from "@/timeline/firebase/events";
import { cleanHtmlContent } from "@/timeline/firebase/functions";
import HtmlBox from "./HtmlBox";
import { useTimelineContext } from "@/theTimeline/context";
import { Origin } from "@/timeline/common";

interface EventDialogProps {
  event?: any | null;
  open: boolean;
  onClose: () => void;
}

export default function EventDialog({
  event,
  open,
  onClose,
}: EventDialogProps) {
  const queryClient = useQueryClient();
  const { cases } = useTimelineContext();
  const isEditMode = !!event?.id;
  const [isUploadingFile, setIsUploadingFile] = useState(false);
  const [isCleaningContent, setIsCleaningContent] = useState(false);

  // Form state – initialize from event if edit mode, otherwise defaults
  const [formData, setFormData] = useState(() => ({
    title: event?.title || "",
    subtitle: event?.subtitle || "",
    content: event?.content || "",
    date: event?.date || new Date().toISOString().split("T")[0],
    important: event?.important || false,
    type: event?.type || Origin.MINE,
    caseNumber: event?.caseNumber || "",
  }));

  const [fileURLInputs, setFileURLInputs] = useState(
    event?.fileURL?.length > 0 ? event.fileURL : []
  );

  const [groupInputs, setGroupInputs] = useState(
    event?.groups?.length > 0 ? event.groups : []
  );

  // When event changes (e.g., you open dialog for another event), sync state
  useEffect(() => {
    if (!open) return; // only sync when dialog opens

    setFormData({
      title: event?.title || "",
      subtitle: event?.subtitle || "",
      content: event?.content || "",
      date: event?.date || new Date().toISOString().split("T")[0],
      important: event?.important || false,
      type: event?.type || Origin.MINE,
      caseNumber: event?.caseNumber || "",
    });

    setFileURLInputs(event?.fileURL?.length > 0 ? event.fileURL : []);
    setGroupInputs(event?.groups?.length > 0 ? event.groups : []);
  }, [event, open]);

  const eventMutation = useMutation({
    mutationFn: async (payload: any) => {
      if (isEditMode) {
        // update existing event
        return updateEvent(payload);
      } else {
        return addEvent(createPayload);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      toast.success(
        isEditMode ? "האירוע עודכן בהצלחה!" : "האירוע נוצר בהצלחה!"
      );
      onClose();
    },
    onError: (error) => {
      toast.error(
        isEditMode ? "שגיאה בעדכון האירוע" : "שגיאה ביצירת האירוע"
      );
      console.error(error);
    },
  });

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    const fileURL = fileURLInputs
      .filter((f: any) => f.url && f.label)
      .map(({ label, url, type }: any) => ({ label, url, type }));

    const groups = groupInputs
      .filter((g: any) => g.label)
      .map(({ label, value }: any) => ({ label, value: value || label }));

    const payload: any = {
      ...formData,
      fileURL,
      groups,
    };

    if (isEditMode) {
      payload.id = event.id;
    }

    eventMutation.mutate(payload);
  };

  const handleFileUploaded = (fileUrl: string, label: string) => {
    setFileURLInputs((prev: any) => [
      ...prev,
      { label: label || "", url: fileUrl, type: "mine" },
    ]);
  };

  const handleCleanContent = async () => {
    if (!formData.content || formData.content.trim() === "") {
      toast.error("אין תוכן לניקוי");
      return;
    }

    setIsCleaningContent(true);
    try {
      const cleanedContent = await cleanHtmlContent(formData.content);
      setFormData((prev) => ({ ...prev, content: cleanedContent }));
      toast.success("התוכן נוקה בהצלחה!");
    } catch (error) {
      console.error("Error cleaning content:", error);
      toast.error("שגיאה בניקוי התוכן");
    } finally {
      setIsCleaningContent(false);
    }
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
            {isEditMode ? "עריכת אירוע" : "אירוע חדש"}
          </DialogTitle>
          <p className="text-slate-600 mt-2">
            {isEditMode
              ? "ערוך את פרטי האירוע המשפטי"
              : "צור אירוע חדש בציר הזמן המשפטי שלך"}
          </p>
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
                    selectedCase={
                      cases.find(
                        (c: Case) => c.caseNumber === formData.caseNumber
                      ) || null
                    }
                    setSelectedCase={(_case: Case) =>
                      setFormData({
                        ...formData,
                        caseNumber: _case.caseNumber,
                      })
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
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-lg text-slate-900 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-slate-600" />
                  תוכן האירוע
                </h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleCleanContent}
                  disabled={isCleaningContent || !formData.content}
                  className="flex items-center gap-2 hover:bg-blue-50 hover:border-blue-300"
                >
                  {isCleaningContent ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Sparkles className="w-4 h-4" />
                  )}
                  {isCleaningContent ? "מנקה..." : "נקה תוכן"}
                </Button>
              </div>
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
              <FileUploader
                onFileUploaded={handleFileUploaded}
                setIsUploadingFile={setIsUploadingFile}
              />
              <FileList
                fileURLInputs={fileURLInputs}
                setFileURLInputs={setFileURLInputs}
              />
            </div>
          </div>

          {/* Groups/Tags Section */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
            <div className="bg-gradient-to-r from-slate-50 to-slate-100 px-6 py-4 border-b border-slate-200">
              <h3 className="font-semibold text-lg text-slate-900 flex items-center gap-2">
                <Tag className="w-5 h-5 text-slate-600" />
                קטגוריות ותגיות
              </h3>
            </div>
            <div className="p-6 space-y-4">
              <GroupsDropdown
                selected={groupInputs}
                onChange={(groups) => setGroupInputs(groups)}
                placeholder="בחר או צור קבוצות..."
              />
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
            type="submit"
            onClick={() => handleSubmit()}
            disabled={
              eventMutation.isPending || isUploadingFile || isCleaningContent
            }
            className="h-11 px-8 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg"
          >
            <Save className="w-5 h-5 ml-2" />
            {eventMutation.isPending
              ? isEditMode
                ? "שומר..."
                : "יוצר..."
              : isEditMode
              ? "שמור שינויים"
              : "צור אירוע"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
