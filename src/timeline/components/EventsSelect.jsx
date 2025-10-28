import { useAppContext } from "timeline/Context";
import Select from "react-select";

export default function EventsSelect({ onChange, value, itemData, ...props }) {
  console.log(itemData);
  const { allEvents } = useAppContext();
  const dropdownOptions = allEvents
    .filter((item) => item.date <= itemData.date && item.id !== itemData.id)
    .map((item) => ({
      label: `${item.title} (${item.date})`,
      value: item,
    }))
    .reverse();

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
