import Select from "react-select";

interface SimpleDropdownProps {
  options: any[];
  onChange: (value: any) => void;
  value: any;
  valKey?: string;
  labelKey?: string;
}
export const SimpleDropdown = ({
  options,
  onChange,
  value,
  valKey,
  labelKey,
  ...props
}: SimpleDropdownProps) => {
  const _options = options.map((item) => ({
    label: labelKey ? item[labelKey] : item,
    value: valKey ? item[valKey] : item,
  }));
  const currentOption = value
    ? _options.find((op) => (op.value || op) === value)
    : null;

  return (
    <Select
      value={currentOption}
      onChange={(selected) => onChange(selected?.value)}
      options={_options}
      isClearable
      menuPosition="fixed"
      isSearchable={false}
      {...props}
    />
  );
};
