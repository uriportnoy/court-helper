import React from 'react';
import { Minus, Plus } from 'lucide-react';

interface PageNumberControlProps {
  value: number;
  onChange: (value: number) => void;
}

export const PageNumberControl: React.FC<PageNumberControlProps> = ({ value, onChange }) => {
  return (
    <div className="flex items-center gap-1">
      <button
        onClick={() => value > 1 && onChange(value - 1)}
        disabled={value <= 1}
        className="p-2 rounded hover:bg-gray-100 disabled:opacity-50 disabled:hover:bg-transparent transition-colors"
        aria-label="Decrease page number"
      >
        <Minus className="w-4 h-4 text-gray-500" />
      </button>
      
      <span className="w-8 text-center text-sm font-medium">{value}</span>
      
      <button
        onClick={() => onChange(value + 1)}
        className="p-2 rounded hover:bg-gray-100 transition-colors"
        aria-label="Increase page number"
      >
        <Plus className="w-4 h-4 text-gray-500" />
      </button>
    </div>
  );
};