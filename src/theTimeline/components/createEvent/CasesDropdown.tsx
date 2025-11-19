import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui";
import { useTimelineContext } from "@/theTimeline/context";
import { Case } from "@/theTimeline/types";

interface CasesDropdownProps {
  selectedCase: string | Case | null;
  setSelectedCase: (_case: Case) => void;
  placeholder?: string;
}

export default function CasesDropdown({
  selectedCase,
  setSelectedCase,
  placeholder = "בחר תיק",
}: CasesDropdownProps) {
  const { cases } = useTimelineContext();
  const selectedCaseNumber =
    typeof selectedCase === "string" ? selectedCase : selectedCase?.caseNumber;

  const onChange = (caseNumber: string) => {
    const _case = cases.find((c: any) => c.caseNumber === caseNumber) as Case;
    if (_case) {
      setSelectedCase(_case);
    }
  };
  console.log(cases);
  return (
    <Select value={selectedCaseNumber} onValueChange={onChange}>
      <SelectTrigger className="h-11 border-slate-300">
        <SelectValue placeholder={placeholder || "בחר תיק"} />
      </SelectTrigger>
      <SelectContent>
        {cases.map((c: any, idx: number) => (
          <SelectItem
            key={`${c.id ?? c.caseNumber}-${idx}`}
            value={c.caseNumber}
          >
            {`${c.caseNumber}${c.description ? ` - ${c.description}` : ""}`}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
