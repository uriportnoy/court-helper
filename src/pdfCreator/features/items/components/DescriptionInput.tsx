import React from 'react';

interface DescriptionInputProps {
  value: string;
  onChange: (value: string) => void;
}

export const DescriptionInput: React.FC<DescriptionInputProps> = ({ value, onChange }) => {
  const [description,setDescription] = React.useState(value);

  return (
    <div onClick={(e) => e.stopPropagation()}>
      <label className="block text-sm font-medium text-gray-700 mb-1">תיאור</label>
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="form-textarea block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 text-sm"
        rows={2}
        onBlur={(e) => onChange(e.target.value)}
      />
    </div>
  );
};