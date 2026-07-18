import { ChevronRight, Check, Zap, Sliders } from "lucide-react";
import { useState } from "react";
import { AppHeader } from "./AppHeader";
import type { ScheduleStrategy } from "../model/patient-flow.types";

interface PriorityScreenProps {
  onBack: () => void;
  scheduleStrategy: ScheduleStrategy;
  onContinue: (strategy: ScheduleStrategy) => void;
}

const options: {
  id: ScheduleStrategy;
  label: string;
  description: string;
  icon: React.ReactNode;
}[] = [
  {
    id: "balanced",
    label: "Cân bằng",
    description: "Cân bằng thời gian chờ, di chuyển và thời điểm trả kết quả",
    icon: <Sliders size={22} />,
  },
  {
    id: "finish_early",
    label: "Ưu tiên thời gian vào khám",
    description: "Ưu tiên được tiếp nhận và hoàn thành các dịch vụ sớm; có thể chờ bác sĩ lâu hơn",
    icon: <Zap size={22} />,
  },
  {
    id: "leave_fast",
    label: "Ưu tiên kết quả đến tay bác sĩ",
    description: "Sắp xếp để các kết quả bắt buộc đến tay bác sĩ trong thời gian sớm nhất",
    icon: <Check size={22} />,
  },
];

export function PriorityScreen({ onBack, scheduleStrategy, onContinue }: PriorityScreenProps) {
  const [selected, setSelected] = useState<ScheduleStrategy>(scheduleStrategy);

  return (
    <div className="flex flex-col min-h-full bg-background">
      <AppHeader
        title="Chọn điều ưu tiên"
        subtitle="Bước 2/4"
        progress={{ current: 2, total: 4 }}
        onBack={onBack}
        onForward={() => onContinue(selected)}
        forwardLabel="Tạo phương án"
      />

      <div className="flex flex-col gap-3 px-4 pt-4 pb-6">
        <p style={{ fontSize: 15 }} className="text-foreground">Bạn muốn hệ thống sắp lịch trình theo cách nào?</p>

        {options.map((opt) => {
          const isSelected = selected === opt.id;
          return (
            <button
              key={opt.id}
              onClick={() => setSelected(opt.id)}
              aria-pressed={isSelected}
              className={`w-full text-left rounded-xl border-2 p-4 flex items-start gap-4 transition-all active:scale-[0.99] ${
                isSelected ? "border-primary bg-secondary" : "border-border bg-card"
              }`}
              style={{ minHeight: 72 }}
            >
              <div className={`w-11 h-11 rounded-lg flex items-center justify-center flex-shrink-0 ${
                isSelected ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
              }`}>
                {opt.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p style={{ fontSize: 16 }} className={isSelected ? "text-primary" : "text-foreground"}>
                  {opt.label}
                </p>
                <p style={{ fontSize: 13 }} className="text-muted-foreground mt-0.5 leading-snug">
                  {opt.description}
                </p>
              </div>
              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                isSelected ? "border-primary bg-primary" : "border-border"
              }`}>
                {isSelected && <Check size={14} className="text-white" strokeWidth={3} />}
              </div>
            </button>
          );
        })}

        {/* Primary action */}
        <button
          onClick={() => onContinue(selected)}
          className="w-full py-4 rounded-xl bg-primary text-primary-foreground flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
          style={{ fontSize: 17, minHeight: 56 }}
        >
          Tạo phương án
          <ChevronRight size={20} />
        </button>

      </div>
    </div>
  );
}
