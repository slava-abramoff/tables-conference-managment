import { useState, type ChangeEvent, type FC, type ReactNode } from "react";

type CellType =
  | "text"
  | "editableText"
  | "datetime"
  | "date"
  | "time"
  | "select"
  | "button"
  | "longText";

interface TableCellProps {
  type: CellType;
  value: string | number | Date;
  options?: string[]; // для select
  onChange?: (value: string | Date) => void; // для редактируемых ячеек
  children?: ReactNode; // для кнопок или кастомного рендера
  className?: string;
}

export const TableCell: FC<TableCellProps> = ({
  type,
  value,
  options = [],
  onChange,
  children,
  className,
}) => {
  const [editing, setEditing] = useState(false);
  const [inputValue, setInputValue] = useState<string>(() =>
    value instanceof Date ? formatDisplayDate(value, type) : String(value),
  );

  const displayValue =
    value instanceof Date ? formatDisplayDate(value, type) : String(value);

  const handleBlur = () => {
    setEditing(false);
    if (onChange) {
      if (type === "datetime" || type === "date" || type === "time") {
        onChange(parseInputDate(inputValue, type));
      } else {
        onChange(inputValue);
      }
    }
  };

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    setInputValue(e.target.value);
  };

  // Формат отображения для разных типов
  function formatDisplayDate(date: Date, type: CellType) {
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");

    switch (type) {
      case "datetime":
        return `${day}.${month}.${year} ${hours}:${minutes}`;
      case "date":
        return `${day}.${month}.${year}`;
      case "time":
        return `${hours}:${minutes}`;
      default:
        return date.toString();
    }
  }

  // Парсим обратно из строки в Date
  function parseInputDate(value: string, type: CellType) {
    if (type === "time") {
      const [hours, minutes] = value.split(":").map(Number);
      const d = new Date();
      d.setHours(hours, minutes, 0, 0);
      return d;
    } else {
      const [day, month, yearAndTime] = value.split(".");
      if (type === "date") {
        return new Date(Number(yearAndTime), Number(month) - 1, Number(day));
      } else if (type === "datetime") {
        const [year, time] = yearAndTime.split(" ");
        const [hours, minutes] = time.split(":").map(Number);
        return new Date(
          Number(year),
          Number(month) - 1,
          Number(day),
          hours,
          minutes,
        );
      }
    }
    return new Date();
  }

  // Рендер
  switch (type) {
    case "text":
    case "longText":
      return <td className={className}>{displayValue}</td>;

    case "editableText":
      return (
        <td className={className} onClick={() => setEditing(true)}>
          {editing ? (
            <input
              type="text"
              value={inputValue}
              onChange={handleChange}
              onBlur={handleBlur}
              autoFocus
            />
          ) : (
            displayValue
          )}
        </td>
      );

    case "datetime":
    case "date":
    case "time":
      return (
        <td className={className} onClick={() => setEditing(true)}>
          {editing ? (
            <input
              type={type === "time" ? "time" : "text"}
              value={inputValue}
              onChange={handleChange}
              onBlur={handleBlur}
              autoFocus
              placeholder={
                type === "datetime"
                  ? "дд.мм.гггг чч:мм"
                  : type === "date"
                    ? "дд.мм.гггг"
                    : "чч:мм"
              }
            />
          ) : (
            displayValue
          )}
        </td>
      );

    case "select":
      return (
        <td className={className}>
          <select
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value);
              onChange && onChange(e.target.value);
            }}
          >
            {options.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </td>
      );

    case "button":
      return <td className={className}>{children}</td>;

    default:
      return <td className={className}>{value}</td>;
  }
};
