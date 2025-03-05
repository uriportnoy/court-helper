import { useState } from "react";
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
  const onTextChange = useDebounce(() => onChange(text), 300);

  return (
    <InputText
      type="text"
      value={text}
      onChange={(e) => {
        setText(e.target.value);
        onTextChange(e.target.value);
      }}
      onBlur={(e) => onTextChange(e.target.value)}
      placeholder={placeholder}
      className={className}
    />
  );
}

export default TextFilter;
