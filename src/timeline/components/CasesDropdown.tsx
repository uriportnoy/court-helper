import { useAppContext } from "../Context";
import { addCase } from "../firebase/cases.ts";
import { useMemo, useState } from "react";
import Select from "react-select";
import CreatableSelect from "react-select/creatable";

const colourStyles = {
  option: (styles, { data }) => {
    const { isMyCase, isOpen } = data?.value || {};
    return {
      ...styles,
      color: isOpen ? "#333" : "#0000005e",
      background: isMyCase
        ? "#62ea005c"
        : "repeating-linear-gradient(90deg, #ff1f1f26, transparent 10px, transparent 10px, #ff1f1f26 20px ), linear-gradient( to bottom, transparent, transparent )",
    };
  },
};

export default function CasesDropdown({
  onChange,
  selectedCaseNumber,
  isCreatable,
  ...props
}) {
  const [isLoading, setIsLoading] = useState(false);
  const Component = isCreatable ? CreatableSelect : Select;
  const { cases: casesOptions, loadCases } = useAppContext();
  const dropdownOptions = useMemo(
    () =>
      casesOptions.map((item) => ({
        label: `(${item.court}) ${item.caseNumber}`,
        value: item,
      })),
    [casesOptions],
  );

  const currentOption = dropdownOptions
    ? dropdownOptions.find((op) => op.value.caseNumber === selectedCaseNumber)
    : null;

  const handleCreate = (inputValue) => {
    if (!inputValue || casesOptions.find((item) => item.id === inputValue)) {
      return;
    }
    setIsLoading(true);
    addCase({
      caseNumber: inputValue,
      type: "",
      court: "",
      description: "",
      appealAccepted: false,
      isMyCase: false,
      isOpen: true,
    }).then((id) => {
      loadCases().then((_cases) => {
        const curr = _cases.find((item) => item.id === id);
        console.log(curr);
        curr && onChange(curr);
        setIsLoading(false);
      });
    });
  };
  return (
    <>
      <Component
        value={currentOption}
        onChange={(e) => {
          onChange(e?.value || null);
        }}
        isLoading={isLoading}
        options={dropdownOptions}
        placeholder={"בחר תיק"}
        menuPlacement="auto"
        isRtl={true}
        onCreateOption={isCreatable ? handleCreate : () => null}
        isClearable
        styles={colourStyles}
        {...props}
      />
    </>
  );
}
