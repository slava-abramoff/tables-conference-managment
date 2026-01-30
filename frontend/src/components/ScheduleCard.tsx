interface ScheduleCardProps {
  date: string;
  lecturers: string[];
  groups: string[];
  lessonsCount: number;
  onClick?: () => void;
}

export default function ScheduleCard({
  date,
  lecturers,
  groups,
  lessonsCount,
  onClick,
}: ScheduleCardProps) {
  return (
    <div
      onClick={onClick}
      className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm hover:shadow-md hover:border-slate-300 transition-all cursor-pointer"
    >
      <h3 className="text-lg font-semibold text-slate-900 mb-3">{date}</h3>
      
      <div className="space-y-2 text-sm">
        <div>
          <span className="font-medium text-slate-700">Лекторы:</span>{" "}
          <span className="text-slate-600">{lecturers.join(", ")}</span>
        </div>
        
        <div>
          <span className="font-medium text-slate-700">Группы:</span>{" "}
          <span className="text-slate-600">{groups.join(", ")}</span>
        </div>
        
        <div>
          <span className="font-medium text-slate-700">Кол-во занятий:</span>{" "}
          <span className="text-slate-600">{lessonsCount}</span>
        </div>
      </div>
    </div>
  );
}
