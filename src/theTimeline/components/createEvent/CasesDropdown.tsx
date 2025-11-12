import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui";
import { Case } from "@/timeline/types";

interface CasesDropdownProps {
  cases: Case[];
  selectedCase: string | null;
  setSelectedCase: (_case: Case) => void;
}

export default function CasesDropdown({
  cases,
  selectedCase,
  setSelectedCase,
}: CasesDropdownProps) {
  const onChange = (caseNumber: string) => {
    const _case = cases.find((c: any) => c.caseNumber === caseNumber) as Case;
    if (_case) {
      setSelectedCase(_case);
    }
  };

  return (
    <Select value={selectedCase} onValueChange={onChange}>
      <SelectTrigger className="h-11 border-slate-300">
        <SelectValue placeholder="בחר תיק" />
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
