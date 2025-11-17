import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui";
import {
  Plus,
  Building2,
  Search,
  CheckCircle2,
  XCircle,
  Pencil,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import {
  Skeleton,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Label,
  Switch,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Input,
  Badge,
} from "@/components/ui";
import { addCase, updateCase, deleteCase } from "@/firebase/cases.ts";
import type { Case } from "../types.ts";
import { HASHALOM, MAHZOVY, ALONY, courts, caseTypes, CourtType, CaseType, AllValue } from "../common";
import { useTimelineContext } from "../context";

const DEFAULT_CASE = {
  caseNumber: "",
  description: "",
  type: CaseType.TELAHIM,
  court: HASHALOM as CourtType,
  status: "פתוח",
  openDate: new Date().toISOString().split("T")[0],
  relation: "",
};

export default function CasesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingCase, setDeletingCase] = useState<Case | null>(null);
  const queryClient = useQueryClient();
  const { cases, isCasesLoading } = useTimelineContext();

  const [newCase, setNewCase] = useState({
    caseNumber: "",
    description: "",
    type: CaseType.TELAHIM,
    court: HASHALOM as CourtType,
    status: "פתוח",
    openDate: new Date().toISOString().split("T")[0],
    relation: "",
    isMyCase: true,
    isOpen: true,
    appealAccepted: false,
  });

  const [editingCase, setEditingCase] = useState<any | null>(null);
  // Filters
  const [filterCourt, setFilterCourt] = useState<AllValue | CourtType>(AllValue.ALL);
  const [filterType, setFilterType] = useState<AllValue | CaseType>(AllValue.ALL);
  const [filterStatus, setFilterStatus] = useState<AllValue | "open" | "closed">(AllValue.ALL);
  const [filterOwner, setFilterOwner] = useState<AllValue | "mine" | "hers">(AllValue.ALL);

  const createCaseMutation = useMutation({
    mutationFn: (caseData: Omit<Case, "id">) => addCase(caseData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cases"] });
      toast.success("התיק נוצר בהצלחה!");
      setDialogOpen(false);
      setNewCase({
        caseNumber: "",
        description: "",
        type: CaseType.TELAHIM,
        court: HASHALOM as CourtType,
        status: "פתוח",
        openDate: new Date().toISOString().split("T")[0],
        relation: "",
        isMyCase: true,
        isOpen: true,
        appealAccepted: false,
      });
    },
  });

  const updateCaseMutation = useMutation({
    mutationFn: (caseData: Case) => updateCase(caseData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cases"] });
      toast.success("התיק עודכן בהצלחה!");
      setEditDialogOpen(false);
      setEditingCase(null);
    },
  });

  const deleteCaseMutation = useMutation({
    mutationFn: (caseId: string) => deleteCase(caseId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cases"] });
      toast.success("התיק נמחק בהצלחה!");
      setDeleteDialogOpen(false);
      setDeletingCase(null);
    },
    onError: () => {
      toast.error("מחיקת התיק נכשלה. נסה שוב.");
    },
  });

  const filteredCases = cases.filter((c) => {
    const matchesSearch =
      c.caseNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCourt =
      filterCourt === AllValue.ALL || c.court === filterCourt;
    const matchesType = filterType === AllValue.ALL || c.type === filterType;
    const matchesStatus =
      filterStatus === AllValue.ALL ||
      (filterStatus === "open" ? c.isOpen : !c.isOpen);
    const matchesOwner =
      filterOwner === AllValue.ALL ||
      (filterOwner === "mine" ? c.isMyCase : !c.isMyCase);
    return (
      matchesSearch && matchesCourt && matchesType && matchesStatus && matchesOwner
    );
  });

  const casesSummary = courts.map((court) => {
    const courtCases = cases.filter((c) => c.court === court);
    const herCases = courtCases.filter((p) => !p.isMyCase);
    const myCases = courtCases.filter((p) => p.isMyCase);

    const openCount = courtCases.filter((it) => it.isOpen).length;
    const closedCount = courtCases.length - openCount;

    const herAccepted = herCases.filter((it) => it.appealAccepted).length;
    const herDeclined = herCases.filter((it) => !it.appealAccepted).length;

    const mineAccepted = myCases.filter((it) => it.appealAccepted).length;
    const mineDeclined = myCases.filter((it) => !it.appealAccepted).length;

    return {
      court,
      total: courtCases.length,
      open: openCount,
      closed: closedCount,
      her: {
        total: herCases.length,
        accepted: herAccepted,
        declined: herDeclined,
      },
      mine: {
        total: myCases.length,
        accepted: mineAccepted,
        declined: mineDeclined,
      },
    };
  });
  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">
              תיקים
            </h1>
            <p className="text-slate-600">נהל את כל התיקים המשפטיים שלך</p>
          </div>
          <div className="w-full md:w-auto flex flex-col items-stretch md:items-end gap-3">
            <div className="overflow-hidden rounded-xl border bg-white">
              <table className="min-w-[340px] text-right text-sm">
                <thead className="bg-slate-50 text-slate-600">
                  <tr>
                    <th className="px-3 py-2 font-medium">בית משפט</th>
                    <th className="px-3 py-2 font-medium">סה"כ</th>
                    <th className="px-3 py-2 font-medium">פתוחים/סגורים</th>
                    <th className="px-3 py-2 font-medium">היא</th>
                    <th className="px-3 py-2 font-medium">אני</th>
                  </tr>
                </thead>
                <tbody>
                  {casesSummary.map((s) => (
                    <tr key={s.court} className="border-t">
                      <td className="px-3 py-2 text-center">{s.court}</td>
                      <td className="px-3 py-2 text-center">{s.total}</td>
                      <td className="px-3 py-2 text-center">
                        <span className="text-green-600 font-bold">{s.open}</span> / <span className="text-red-600 font-bold">{s.closed}</span>
                      </td>
                      <td className="px-3 py-2 text-center">
                        <span className="text-green-600 font-bold">{s.her.accepted}</span> / <span className="text-red-600 font-bold">{s.her.declined}</span>
                      </td>
                      <td className="px-3 py-2 text-center">
                        <span className="text-green-600 font-bold">{s.mine.accepted}</span> / <span className="text-red-600 font-bold">{s.mine.declined}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-500/25">
                  <Plus className="w-5 h-5 ml-2" />
                  תיק חדש
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>יצירת תיק חדש</DialogTitle>
                </DialogHeader>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    createCaseMutation.mutate(newCase);
                  }}
                  className="space-y-4"
                >
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>מספר תיק *</Label>
                      <Input
                        value={newCase.caseNumber}
                        onChange={(e) =>
                          setNewCase({ ...newCase, caseNumber: e.target.value })
                        }
                        required
                        placeholder="לדוגמה: 12345-06-23"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>בית משפט</Label>
                      <Select
                        value={newCase.court}
                        onValueChange={(value) =>
                          setNewCase({ ...newCase, court: value as CourtType })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {courts.map((c) => (
                            <SelectItem key={c} value={c}>
                              {c}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>תיאור</Label>
                    <Input
                      value={newCase.description}
                      onChange={(e) =>
                        setNewCase({ ...newCase, description: e.target.value })
                      }
                      placeholder="תיאור התיק"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>סוג</Label>
                      <Select
                        value={newCase.type}
                        onValueChange={(value) =>
                          setNewCase({ ...newCase, type: value as CaseType })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {caseTypes.map((t) => (
                            <SelectItem key={t} value={t}>
                              {t}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>תאריך פתיחה</Label>
                      <Input
                        type="date"
                        value={newCase.openDate}
                        onChange={(e) =>
                          setNewCase({ ...newCase, openDate: e.target.value })
                        }
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>צדדים</Label>
                    <Input
                      value={newCase.relation}
                      onChange={(e) =>
                        setNewCase({ ...newCase, relation: e.target.value })
                      }
                      placeholder="לדוגמה: פלוני נ׳ אלמוני"
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                    <Label>סטטוס התיק</Label>
                    <div className="flex items-center gap-3">
                      <span
                        className={`text-sm font-medium ${
                          newCase.status === "פתוח"
                            ? "text-green-600"
                            : "text-slate-600"
                        }`}
                      >
                        {newCase.status === "פתוח" ? "פתוח" : "סגור"}
                      </span>
                      <Switch
                        checked={newCase.status === "פתוח"}
                        onCheckedChange={(checked) => {
                          setNewCase({
                            ...newCase,
                            status: checked ? "פתוח" : "סגור",
                            isOpen: checked,
                          });
                        }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg">
                    <Switch
                      checked={newCase.isMyCase}
                      onCheckedChange={(checked) =>
                        setNewCase({ ...newCase, isMyCase: checked })
                      }
                    />
                    <Label>התיק שלי</Label>
                  </div>

                  <div className="flex justify-end gap-3 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setDialogOpen(false)}
                    >
                      ביטול
                    </Button>
                    <Button
                      type="submit"
                      disabled={createCaseMutation.isPending}
                    >
                      {createCaseMutation.isPending ? "יוצר..." : "צור תיק"}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="mb-6">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <Input
              placeholder="חיפוש תיקים..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pr-10 bg-white shadow-sm"
            />
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <Select
              value={filterCourt}
              onValueChange={(value) => setFilterCourt(value as CourtType | AllValue)}
            >
              <SelectTrigger className="w-40">
                <SelectValue placeholder="בית משפט" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={AllValue.ALL}>כל בתי המשפט</SelectItem>
                {courts.map((c) => (
                  <SelectItem key={`court-${c}`} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={filterType}
              onValueChange={(value) => setFilterType(value as CaseType | AllValue)}
            >
              <SelectTrigger className="w-40">
                <SelectValue placeholder="סוג תיק" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={AllValue.ALL}>כל הסוגים</SelectItem>
                {caseTypes.map((t) => (
                  <SelectItem key={`type-${t}`} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={filterStatus}
              onValueChange={(value) =>
                setFilterStatus(value as "open" | "closed" | AllValue)
              }
            >
              <SelectTrigger className="w-40">
                <SelectValue placeholder="סטטוס" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={AllValue.ALL}>פתוחים וסגורים</SelectItem>
                <SelectItem value="open">פתוחים</SelectItem>
                <SelectItem value="closed">סגורים</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={filterOwner}
              onValueChange={(value) =>
                setFilterOwner(value as "mine" | "hers" | AllValue)
              }
            >
              <SelectTrigger className="w-40">
                <SelectValue placeholder="בעלות" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={AllValue.ALL}>שלי ושלה</SelectItem>
                <SelectItem value="mine">שלי</SelectItem>
                <SelectItem value="hers">שלה</SelectItem>
              </SelectContent>
            </Select>
            {(filterCourt !== AllValue.ALL ||
              filterType !== AllValue.ALL ||
              filterStatus !== AllValue.ALL ||
              filterOwner !== AllValue.ALL) && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setFilterCourt(AllValue.ALL);
                  setFilterType(AllValue.ALL);
                  setFilterStatus(AllValue.ALL);
                  setFilterOwner(AllValue.ALL);
                }}
                className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
              >
                נקה פילטרים
              </Button>
            )}
          </div>
        </div>

        {isCasesLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-48 rounded-2xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredCases.map((caseItem) => (
              <Card
                key={caseItem.id}
                className={`shadow-lg hover:shadow-xl transition-shadow border-slate-200/50 ${
                  caseItem.isOpen ? "opacity-100" : "opacity-50"
                }`}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center">
                        <Building2 className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">
                          {caseItem.caseNumber}
                        </CardTitle>
                        <p className="text-sm text-slate-600 mt-1">
                          {caseItem.description}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {(caseItem.court === MAHZOVY ||
                        caseItem.court === ALONY) && (
                        <div
                          className="flex items-center gap-2"
                          title="ערעור התקבל"
                        >
                          <Switch
                            checked={!!caseItem.appealAccepted}
                            onCheckedChange={(checked) =>
                              updateCaseMutation.mutate({
                                ...(caseItem as Case),
                                appealAccepted: checked,
                              })
                            }
                          />
                        </div>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setEditingCase({
                            ...caseItem,
                            status: caseItem.isOpen ? "פתוח" : "סגור",
                          });
                          setEditDialogOpen(true);
                        }}
                        title="ערוך תיק"
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setDeletingCase(caseItem as Case);
                          setDeleteDialogOpen(true);
                        }}
                        title="מחק תיק"
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </Button>
                      {caseItem.isOpen ? (
                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                      ) : (
                        <XCircle className="w-5 h-5 text-slate-400" />
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex flex-wrap gap-2">
                      {caseItem.court && (
                        <Badge
                          variant="outline"
                          className="bg-blue-50 text-blue-700"
                        >
                          {caseItem.court}
                        </Badge>
                      )}
                      {caseItem.type && (
                        <Badge
                          variant="outline"
                          className="bg-purple-50 text-purple-700"
                        >
                          {caseItem.type}
                        </Badge>
                      )}
                      {(caseItem.court === MAHZOVY ||
                        caseItem.court === ALONY) && (
                        <Badge
                          variant="outline"
                          className={`${
                            caseItem.appealAccepted
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-rose-50 text-rose-700"
                          }`}
                        >
                          {caseItem.appealAccepted
                            ? "ערעור התקבל"
                            : "ערעור נדחה"}
                        </Badge>
                      )}
                      {caseItem.isMyCase && (
                        <Badge
                          variant="outline"
                          className="bg-emerald-50 text-emerald-700"
                        >
                          התיק שלי
                        </Badge>
                      )}
                    </div>
                    {caseItem.relation && (
                      <p className="text-sm text-slate-600">
                        <span className="font-medium">צדדים:</span>{" "}
                        {caseItem.relation}
                      </p>
                    )}
                    <p className="text-sm text-slate-600">
                      <span className="font-medium">סטטוס:</span>{" "}
                      {caseItem.isOpen ? "פתוח" : "סגור"}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {filteredCases.length === 0 && !isCasesLoading && (
          <div className="text-center py-16">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-slate-100 flex items-center justify-center">
              <Building2 className="w-10 h-10 text-slate-400" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">
              לא נמצאו תיקים
            </h3>
            <p className="text-slate-600 mb-6">התחל ביצירת התיק הראשון שלך</p>
          </div>
        )}

        {/* Edit Case Dialog */}
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>עריכת תיק</DialogTitle>
            </DialogHeader>
            {editingCase && (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  updateCaseMutation.mutate(editingCase);
                }}
                className="space-y-4"
              >
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>מספר תיק *</Label>
                    <Input
                      value={editingCase.caseNumber}
                      onChange={(e) =>
                        setEditingCase({
                          ...editingCase,
                          caseNumber: e.target.value,
                        })
                      }
                      required
                      placeholder="לדוגמה: 12345-06-23"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>בית משפט</Label>
                    <Select
                      value={editingCase.court || ""}
                      onValueChange={(value) =>
                        setEditingCase({ ...editingCase, court: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {courts.map((c) => (
                          <SelectItem key={c} value={c}>
                            {c}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>תיאור</Label>
                  <Input
                    value={editingCase.description || ""}
                    onChange={(e) =>
                      setEditingCase({
                        ...editingCase,
                        description: e.target.value,
                      })
                    }
                    placeholder="תיאור התיק"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>סוג</Label>
                    <Select
                      value={editingCase.type || ""}
                      onValueChange={(value) =>
                        setEditingCase({ ...editingCase, type: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="בית המשפט">בית המשפט</SelectItem>
                        <SelectItem value="שלי">שלי</SelectItem>
                        <SelectItem value="לא שלי">לא שלי</SelectItem>
                        <SelectItem value="חיצוני">חיצוני</SelectItem>
                        <SelectItem value="אחר">אחר</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>סטטוס</Label>
                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <span
                        className={`text-sm font-medium ${
                          editingCase.isOpen
                            ? "text-green-600"
                            : "text-slate-600"
                        }`}
                      >
                        {editingCase.isOpen ? "פתוח" : "סגור"}
                      </span>
                      <Switch
                        checked={editingCase.isOpen}
                        onCheckedChange={(checked) =>
                          setEditingCase({
                            ...editingCase,
                            isOpen: checked,
                            status: checked ? "פתוח" : "סגור",
                          })
                        }
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>צדדים</Label>
                  <Input
                    value={editingCase.relation || ""}
                    onChange={(e) =>
                      setEditingCase({
                        ...editingCase,
                        relation: e.target.value,
                      })
                    }
                    placeholder="לדוגמה: פלוני נ׳ אלמוני"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setEditDialogOpen(false);
                      setEditingCase(null);
                    }}
                  >
                    ביטול
                  </Button>
                  <Button type="submit" disabled={updateCaseMutation.isPending}>
                    {updateCaseMutation.isPending ? "שומר..." : "שמור"}
                  </Button>
                </div>
              </form>
            )}
          </DialogContent>
        </Dialog>

        {/* Delete Case Confirmation Dialog */}
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>אישור מחיקת תיק</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <p className="text-slate-700">
                האם אתה בטוח שברצונך למחוק את התיק{" "}
                <span className="font-semibold">
                  {deletingCase?.caseNumber || ""}
                </span>
                ? פעולה זו בלתי הפיכה.
              </p>
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setDeleteDialogOpen(false);
                  setDeletingCase(null);
                }}
              >
                ביטול
              </Button>
              <Button
                className="bg-red-600 hover:bg-red-700"
                onClick={() => {
                  if (deletingCase?.id) {
                    deleteCaseMutation.mutate(deletingCase.id);
                  }
                }}
                disabled={deleteCaseMutation.isPending}
              >
                {deleteCaseMutation.isPending ? "מוחק..." : "מחק"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
