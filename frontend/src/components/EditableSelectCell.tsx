import { useState, useEffect, useRef } from "react";

interface EditableSelectCellProps {
  value: string;
  onSave: (value: string) => void;
  options: { value: string; label: string }[];
  disabled?: boolean;
}

export default function EditableSelectCell({
  value,
  onSave,
  options,
  disabled = false,
}: EditableSelectCellProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const selectRef = useRef<HTMLSelectElement>(null);

  useEffect(() => {
    setEditValue(value);
  }, [value]);

  useEffect(() => {
    if (isEditing && selectRef.current) {
      selectRef.current.focus();
    }
  }, [isEditing]);

  const handleClick = () => {
    if (!disabled) {
      setIsEditing(true);
    }
  };

  const handleBlur = () => {
    if (editValue !== value) {
      onSave(editValue);
    }
    setIsEditing(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setEditValue(e.target.value);
    onSave(e.target.value);
    setIsEditing(false);
  };

  if (disabled) {
    return (
      <td className="px-4 py-3 text-sm text-slate-600 bg-slate-50">
        {options.find((o) => o.value === value)?.label ?? value ?? "-"}
      </td>
    );
  }

  if (isEditing) {
    return (
      <td className="px-4 py-3">
        <select
          ref={selectRef}
          value={editValue}
          onChange={handleChange}
          onBlur={handleBlur}
          className="w-full px-2 py-1 border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-slate-500 text-slate-900"
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </td>
    );
  }

  return (
    <td
      onClick={handleClick}
      className="px-4 py-3 text-sm text-slate-900 cursor-pointer hover:bg-slate-50 transition-colors"
    >
      {options.find((o) => o.value === value)?.label ?? value ?? "-"}
    </td>
  );
}
