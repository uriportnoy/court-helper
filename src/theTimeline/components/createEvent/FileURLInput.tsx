import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, FileText, Link as LinkIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function FileURLInput({ file, index, onChange, onRemove }) {
  return (
    <div className="border border-slate-200 rounded-xl p-4 bg-white space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
            <FileText className="w-5 h-5 text-blue-600" />
          </div>
          <div className="flex-1 space-y-2">
            <Input
              placeholder="תווית מסמך (לדוגמה, 'החלטת בית משפט')"
              value={file.label}
              onChange={(e) => onChange('label', e.target.value)}
              className="font-medium"
            />
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <LinkIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="כתובת URL של הקובץ"
                  value={file.url}
                  onChange={(e) => onChange('url', e.target.value)}
                  className="pr-10"
                />
              </div>
              <Select
                value={file.type}
                onValueChange={(value) => onChange('type', value)}
              >
                <SelectTrigger className="w-36">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mine">שלי</SelectItem>
                  <SelectItem value="notMine">צד שני</SelectItem>
                  <SelectItem value="court">בית משפט</SelectItem>
                  <SelectItem value="thirdParty">צד ג׳</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onRemove}
          className="text-slate-400 hover:text-red-600"
        >
          <X className="w-5 h-5" />
        </Button>
      </div>
      
      {file.url && (
        <div className="flex items-center gap-2 text-xs text-slate-600 bg-slate-50 p-2 rounded-lg">
          <Badge variant="secondary" className="bg-green-100 text-green-700">
            <FileText className="w-3 h-3 ml-1" />
            קובץ נוסף
          </Badge>
          <span className="truncate">{file.url}</span>
        </div>
      )}
    </div>
  );
}