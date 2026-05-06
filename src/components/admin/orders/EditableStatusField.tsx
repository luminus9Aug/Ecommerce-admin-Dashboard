import React, { useState } from 'react';
import { Check, Edit2, X } from 'lucide-react';

interface EditableStatusFieldProps {
  label: string;
  value: string;
  options: { label: string; value: string }[];
  onSave: (newValue: string) => Promise<void>;
  isLoading?: boolean;
}

export function EditableStatusField({ label, value, options, onSave, isLoading }: EditableStatusFieldProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [tempValue, setTempValue] = useState(value);

  const handleSave = async () => {
    try {
      await onSave(tempValue);
      setIsEditing(false);
    } catch (error) {
      // Error handled by parent/toast
    }
  };

  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">{label}</span>
      <div className="flex items-center gap-2">
        {isEditing ? (
          <>
            <select
              value={tempValue}
              onChange={(e) => setTempValue(e.target.value)}
              className="text-sm border border-gray-200 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-black"
              disabled={isLoading}
            >
              {options.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <button
              onClick={handleSave}
              disabled={isLoading}
              className="p-1 hover:bg-green-50 text-green-600 rounded transition-colors"
            >
              <Check className="w-4 h-4" />
            </button>
            <button
              onClick={() => { setIsEditing(false); setTempValue(value); }}
              disabled={isLoading}
              className="p-1 hover:bg-red-50 text-red-600 rounded transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </>
        ) : (
          <>
            <span className="text-sm font-semibold capitalize">{(value || '').replace('_', ' ')}</span>
            <button
              onClick={() => setIsEditing(true)}
              className="p-1 hover:bg-gray-100 text-gray-400 hover:text-gray-600 rounded transition-colors"
            >
              <Edit2 className="w-3 h-3" />
            </button>
          </>
        )}
      </div>
    </div>
  );
}
