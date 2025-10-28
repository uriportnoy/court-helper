import { useState, useEffect } from "react";
import useDebounce from "../../../common/useDebounce";
import { InputText } from "primereact/inputtext";

interface TextFilterProps {
  value?: string;
  onChange: (value: string) => void;
  placeholder: string;
  className?: string;
}
function TextFilter({
  value,
  onChange,
  placeholder,
  className,
}: TextFilterProps) {
  const [text, setText] = useState(value || "");
  const onTextChange = useDebounce((newText: string) => onChange(newText), 300);

  // Sync internal state with external value prop (for when filters are cleared)
  useEffect(() => {
    setText(value || "");
  }, [value]);

  return (
    <InputText
      type="text"
      value={text}
      onChange={(e) => {
        const newValue = e.target.value;
        setText(newValue);
        onTextChange(newValue);
      }}
      onBlur={(e) => onTextChange(e.target.value)}
      placeholder={placeholder}
      className={className}
    />
  );
}

export default TextFilter;
