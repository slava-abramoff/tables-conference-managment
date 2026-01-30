import { useState, useEffect, useRef } from "react";

interface EditableCellProps {
  value: string;
  onSave: (value: string) => void;
  maxLength?: number;
  type?: "text" | "time" | "date" | "datetime-local" | "password";
  disabled?: boolean;
  /** Человеко-понятное отображение (например, для даты/времени). Для password вне редактирования показывается маска. */
  displayValue?: string;
}

export default function EditableCell({
  value,
  onSave,
  maxLength,
  type = "text",
  disabled = false,
  displayValue,
}: EditableCellProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setEditValue(value);
  }, [value]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
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

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      if (editValue !== value) {
        onSave(editValue);
      }
      setIsEditing(false);
    } else if (e.key === "Escape") {
      setEditValue(value);
      setIsEditing(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    if (!maxLength || newValue.length <= maxLength) {
      setEditValue(newValue);
    }
  };

  const textToShow =
    displayValue !== undefined
      ? displayValue
      : type === "password" && value
      ? "••••••••"
      : value;

  if (disabled) {
    return (
      <td className="px-4 py-3 text-sm text-slate-600 bg-slate-50">
        {textToShow || "-"}
      </td>
    );
  }

  if (isEditing) {
    return (
      <td className="px-4 py-3">
        <input
          ref={inputRef}
          type={type}
          value={editValue}
          onChange={handleChange}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          maxLength={maxLength}
          className="w-full px-2 py-1 border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-slate-500 text-slate-900"
        />
      </td>
    );
  }

  return (
    <td
      onClick={handleClick}
      className="px-4 py-3 text-sm text-slate-900 cursor-pointer hover:bg-slate-50 transition-colors"
    >
      {textToShow || "-"}
    </td>
  );
}
