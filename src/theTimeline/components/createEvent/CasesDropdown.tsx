import Select from "react-select";
import { useTimelineContext } from "@/theTimeline/context";
import { Case } from "@/theTimeline/types";
import { colourStyles } from "@/components/MultipleSelect.jsx";

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

  const options = cases.map((c: any, idx: number) => ({
    value: c.caseNumber,
    label: `${c.caseNumber}${c.description ? ` - ${c.description}` : ""}`,
  }));

  const onChange = (caseNumber: string) => {
    const _case = cases.find((c: any) => c.caseNumber === caseNumber) as Case;
    if (_case) {
      setSelectedCase(_case);
    }
  };

  const selectedOption =
    options.find((opt) => opt.value === selectedCaseNumber) || null;

  return (
    <Select
      value={selectedOption}
      onChange={(opt: any) => {
        if (opt?.value) {
          onChange(opt.value as string);
        }
      }}
      options={options}
      isClearable={false}
      isSearchable
      styles={colourStyles}
      placeholder={placeholder || "בחר תיק"}
      menuPosition="fixed"
    />
  );
}
