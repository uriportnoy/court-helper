import { useTimelineContext } from "@/theTimeline/context";
import { Calendar, Star, Building2, FileText } from "lucide-react";


export default function Stats() {
  const { events, cases } = useTimelineContext();
  return (
    <div className="hidden md:grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
            <Calendar className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <p className="text-sm text-slate-600">סה״כ אירועים</p>
            <p className="text-2xl font-bold text-slate-900">{events.length}</p>
          </div>
        </div>
      </div>
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
            <Star className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <p className="text-sm text-slate-600">חשובים</p>
            <p className="text-2xl font-bold text-slate-900">
              {events.filter((e) => e.important).length}
            </p>
          </div>
        </div>
      </div>
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
            <Building2 className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <p className="text-sm text-slate-600">תיקים פעילים</p>
            <p className="text-2xl font-bold text-slate-900">
              {cases.filter((c) => c.isOpen).length}
            </p>
          </div>
        </div>
      </div>
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
            <FileText className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <p className="text-sm text-slate-600">מסמכים</p>
            <p className="text-2xl font-bold text-slate-900">
              {events.reduce((sum, e) => sum + (e.fileURL?.length || 0), 0)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
