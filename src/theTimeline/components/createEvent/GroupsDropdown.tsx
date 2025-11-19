import React, { useEffect, useMemo, useState } from "react";
import MultipleSelect from "@/components/MultipleSelect.jsx";
import { getAll, add } from "@/firebase/crud";
import type { Group } from "@/theTimeline/types";

type GroupOption = { label: string; value: string };

interface GroupsDropdownProps {
  selected: GroupOption[];
  onChange: (groups: GroupOption[]) => void;
  placeholder?: string;
  isCreatable?: boolean;
}

export default function GroupsDropdown({
  selected,
  onChange,
  placeholder = "בחר קבוצות...",
  isCreatable = false,
}: GroupsDropdownProps) {
  const [groups, setGroups] = useState<Group[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    setIsLoading(true);
    getAll<{id: string; name: string}>("groups")
      .then((res: {id: string; name: string}[]) => {
        console.log("res", res);
        if (mounted && Array.isArray(res)) {
          setGroups(res.map((r) => ({ label: r.name, value: r.id })));
        }
      })
      .finally(() => setIsLoading(false));
    return () => {
      mounted = false;
    };
  }, []);

  const options = useMemo(() => groups, [groups]);

  const handleChange = async (_values: any[], optionObjects: any[]) => {
    // Detect newly created options (Creatable)
    const newOnes = optionObjects.filter((opt) => opt.__isNew__ && opt.label);
    let created: GroupOption[] = [];
    for (const n of newOnes) {
      try {
        const newId = await add("groups", { name: n.label });
        if (newId) {
          const newGroup = { value: newId as string, label: n.label } as Group;
          setGroups((prev) => [...prev, newGroup]);
          created.push({ label: n.label, value: newId as string });
        }
      } catch {
        // Ignore single failure; UX handled upstream if needed
      }
    }
    // Map existing selections (skip the __isNew__ because we already created)
    const existing = optionObjects
      .filter((opt) => !opt.__isNew__)
      .map((opt) => ({ label: opt.label, value: String(opt.value) }));

    onChange([...existing, ...created]);
  };

  return (
    <MultipleSelect
      options={options}
      selectedOptions={selected}
      onChange={handleChange}
      valKey="value"
      labelKey="label"
      isCreatable={isCreatable}
      isDisabled={isLoading}
      placeholder={placeholder}
      menuPosition="absolute"
      menuPlacement="top"
    />
  );
}
