import React from 'react';
import { Minus, Plus } from 'lucide-react';

interface PageNumberControlProps {
  value: number;
  onChange: (value: number) => void;
}

export const PageNumberControl: React.FC<PageNumberControlProps> = ({ value, onChange }) => {
  const handleDecrement = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (value > 1) {
      onChange(value - 1);
    }
  };

  const handleIncrement = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(value + 1);
  };

  return (
    <div className="flex items-center gap-1">
      <button
        onClick={handleDecrement}
        disabled={value <= 1}
        className="p-1 rounded hover:bg-gray-100 disabled:opacity-50 disabled:hover:bg-transparent transition-colors"
      >
        <Minus size={16} className="text-gray-500" />
      </button>
      
      <span className="w-8 text-center text-sm font-medium">{value}</span>
      
      <button
        onClick={handleIncrement}
        className="p-1 rounded hover:bg-gray-100 transition-colors"
      >
        <Plus size={16} className="text-gray-500" />
      </button>
    </div>
  );
};