import type { DaySchedule } from "../types/response/schedule";
import { uniqueStrings } from "../utils/arrayUtils";
import { formatDateRuLong } from "../utils/dateUtils";

interface ScheduleCardProps {
  data: DaySchedule;
  onClick?: () => void;
}

export default function ScheduleCard({
  data,
  onClick,
}: ScheduleCardProps) {
  const uniqueLectors = uniqueStrings(data.lectors)
  const uniqueGroups = uniqueStrings(data.groups)
  const ruDate = formatDateRuLong(data.date)


  return (
    <div
      onClick={onClick}
      className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm hover:shadow-md hover:border-slate-300 transition-all cursor-pointer"
    >
      <h3 className="text-lg font-semibold text-slate-900 mb-3">{ruDate}</h3>
      
      <div className="space-y-2 text-sm">
        <div>
          <span className="font-medium text-slate-700">Лекторы:</span>{" "}
          <span className="text-slate-600">{uniqueLectors.join(", ")}</span>
        </div>
        
        <div>
          <span className="font-medium text-slate-700">Группы:</span>{" "}
          <span className="text-slate-600">{uniqueGroups.join(", ")}</span>
        </div>
        
        <div>
          <span className="font-medium text-slate-700">Кол-во занятий:</span>{" "}
          <span className="text-slate-600">{data.lectureCount}</span>
        </div>
      </div>
    </div>
  );
}
