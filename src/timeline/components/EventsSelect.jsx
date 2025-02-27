import { useAppContext } from "../Context";
import Select from "react-select";

export default function EventsSelect({ onChange, value, ...props }) {
  const { allEvents } = useAppContext();
  const dropdownOptions = allEvents.map((item) => ({
    label: `${item.title} (${item.date})`,
    value: item,
  }));
  const currentOption = dropdownOptions
    ? dropdownOptions.find((op) => op.value.id === value)
    : null;
  return (
    <Select
      value={currentOption}
      onChange={(e) => {
        onChange(e?.value || null);
      }}
      options={dropdownOptions}
      placeholder={"אירוע קודם"}
      {...props}
    />
  );
}
