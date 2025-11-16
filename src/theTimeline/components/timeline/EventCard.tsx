import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Star,
  FileText,
  ChevronDown,
  ChevronUp,
  Building2,
  Tag,
  Edit,
  Scale,
} from "lucide-react";
import { format } from "date-fns";
import { he } from "date-fns/locale";
import { motion, AnimatePresence } from "framer-motion";
import FileViewer from "./pdf/FileViewer";
import {
  FileURL,
  OTHER,
  courtColors,
  typeColors,
  typeLabels,
} from "../../common";
import PDFButton from "./PDFButton";

interface EventCardProps {
  event: any;
  cases: any[];
  onEdit: () => void;
}

export default function EventCard({ event, cases, onEdit }: EventCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [viewingFile, setViewingFile] = useState(null);
  const relatedCase = cases?.find(
    (c: any) => c.caseNumber === event.caseNumber
  );

  return (
    <>
      <Card className="overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border-slate-200/50 bg-white/95 backdrop-blur-sm relative">
        {/* Court Badge - Top Left Corner */}
        {relatedCase?.court && (
          <div
            className={`absolute bottom-0 left-0 ${
              (courtColors as any)[relatedCase.court] || courtColors[OTHER]
            } text-white w-10 h-10 flex items-center justify-center rounded-bl-2xl rounded-tr-xl font-bold text-sm shadow-lg`}
          >
            <Scale className="w-4 h-4" />
          </div>
        )}

        <CardContent className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-xl font-bold text-slate-900">
                  {event.title}
                </h3>
                {event.important && (
                  <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                )}
                <span className="text-sm text-slate-500 font-medium">
                  {format(new Date(event.date), "d בMMMM yyyy", { locale: he })}
                </span>
              </div>
              {event.subtitle && (
                <p className="text-slate-600 mb-3">{event.subtitle}</p>
              )}
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline" className="bg-slate-50">
                  {format(new Date(event.date), "d MMMM yyyy", { locale: he })}
                </Badge>
                {event.type && (
                  <Badge
                    variant="outline"
                    className={(typeColors as any)[event.type]}
                  >
                    {(typeLabels as any)[event.type]}
                  </Badge>
                )}
                {relatedCase && (
                  <Badge
                    variant="outline"
                    className="bg-indigo-50 text-indigo-700 border-indigo-200"
                  >
                    <Building2 className="w-3 h-3 ml-1" />
                    {relatedCase.caseNumber}
                  </Badge>
                )}
                {relatedCase?.court && (
                  <Badge
                    variant="outline"
                    className={`text-white ${(courtColors as any)[relatedCase.court] || (courtColors as any)[OTHER]}`}
                  >
                    <Scale className="w-3 h-3 ml-1" />
                    {relatedCase.court}
                  </Badge>
                )}
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onEdit}
              className="text-slate-400 hover:text-blue-600"
            >
              <Edit className="w-5 h-5" />
            </Button>
          </div>

          {/* Case Details */}
          {relatedCase && (
            <div className="bg-slate-50 rounded-xl p-4 mb-4">
              <div className="flex items-start gap-3">
                <Building2 className="w-5 h-5 text-slate-600 mt-0.5" />
                <div className="flex-1">
                  <p className="font-semibold text-slate-900 mb-1">
                    {relatedCase.description}
                  </p>
                  <div className="flex flex-wrap gap-2 text-sm text-slate-600">
                    <span>
                      {relatedCase.court} • {relatedCase.type}
                    </span>
                    {relatedCase.relation && (
                      <span>• {relatedCase.relation}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Groups/Tags */}
          {event.groups && event.groups.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {event.groups.map((group: any, idx: number) => (
                <Badge
                  key={idx}
                  variant="secondary"
                  className="bg-blue-50 text-blue-700"
                >
                  <Tag className="w-3 h-3 ml-1" />
                  {group.label}
                </Badge>
              ))}
            </div>
          )}

          {/* Content (Expandable) */}
          {event.content && (
            <div className="mb-4">
              <AnimatePresence>
                {expanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div
                      className="prose prose-sm max-w-none text-slate-700 mb-3 p-4 bg-slate-50 rounded-xl"
                      dangerouslySetInnerHTML={{ __html: event.content }}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setExpanded(!expanded)}
                className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
              >
                {expanded ? (
                  <>
                    <ChevronUp className="w-4 h-4 ml-1" />
                    הצג פחות
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-4 h-4 ml-1" />
                    הצג פרטים
                  </>
                )}
              </Button>
            </div>
          )}

          {/* Files - Show as clickable buttons */}
          {event.fileURL && event.fileURL.length > 0 && (
            <div className="space-y-3">
              <p className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <FileText className="w-4 h-4" />
                מסמכים ({event.fileURL.length})
              </p>
              <div className="flex flex-wrap gap-2">
                {event.fileURL.map((file: FileURL) => (
                  <PDFButton
                    key={file.url}
                    setViewingFile={setViewingFile}
                    file={file}
                  />
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* File Viewer Dialog */}
      {viewingFile && (
        <FileViewer
          file={viewingFile}
          open={!!viewingFile}
          onClose={() => setViewingFile(null)}
        />
      )}
    </>
  );
}
