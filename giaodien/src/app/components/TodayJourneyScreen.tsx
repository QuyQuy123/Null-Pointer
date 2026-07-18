import { Navigation, CheckCircle2, Loader2, Circle, AlertCircle, ChevronRight, RefreshCw } from "lucide-react";
import { AppHeader } from "./AppHeader";
import type { Route } from "./RouteChoiceScreen";

export type JourneyStep = 0 | 1 | 2 | 3;

interface TodayJourneyScreenProps {
  route: Route;
  currentStep: JourneyStep;
  onShowDirections: () => void;
  onStepDone: () => void;
  onShowRouteChange: () => void;
}

const sideNotes = [
  "Mẫu đang được xử lý",
  "Chờ kết quả X-quang — dự kiến 11:00–11:15",
  "Tiếp tục nhịn ăn",
  "Khi đủ 3 kết quả",
];

export function TodayJourneyScreen({
  route,
  currentStep,
  onShowDirections,
  onStepDone,
  onShowRouteChange,
}: TodayJourneyScreenProps) {
  const isLastStep = currentStep === 3;
  const currentStepData = route.steps[currentStep] ?? "Phòng khám Tim mạch 205";
  const locationParts = currentStepData.split("—");
  const roomName = locationParts[0]?.trim();
  const floorInfo = locationParts[1]?.trim();
  const completedSteps = currentStep;

  return (
    <div className="flex flex-col min-h-full bg-background pb-8">
      <AppHeader
        variant="primary"
        title="Hành trình hôm nay"
        subtitle={`${completedSteps}/4 hoàn tất · Cập nhật 8 giây trước`}
        progress={{ current: completedSteps, total: 4 }}
      />

      <div className="flex flex-col gap-3 px-4 pt-4">
        {/* Current action card */}
        {!isLastStep && (
          <div className="bg-primary/10 border-2 border-primary rounded-xl p-4">
            <p style={{ fontSize: 11, letterSpacing: "0.08em" }} className="text-primary uppercase mb-1">
              Việc cần làm ngay
            </p>
            <p style={{ fontSize: 18 }} className="text-foreground mb-0.5">Đi tới {roomName}</p>
            {floorInfo && (
              <p style={{ fontSize: 14 }} className="text-muted-foreground mb-3">{floorInfo}</p>
            )}
            <div className="flex items-center justify-between">
              <p style={{ fontSize: 13 }} className="text-muted-foreground">Nên có mặt trước 10:20</p>
              <button
                onClick={onShowDirections}
                className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2.5 rounded-xl active:scale-95 transition-all"
                style={{ fontSize: 14, minHeight: 44 }}
              >
                <Navigation size={15} />
                Xem chỉ đường
              </button>
            </div>
          </div>
        )}

        {/* Return to doctor */}
        {isLastStep && (
          <div className="bg-emerald-50 border-2 border-emerald-500 rounded-xl p-4">
            <p style={{ fontSize: 11, letterSpacing: "0.08em" }} className="text-emerald-700 uppercase mb-1">
              Các kết quả đã sẵn sàng
            </p>
            <p style={{ fontSize: 17 }} className="text-foreground mb-3">
              Vui lòng quay lại Phòng khám Tim mạch 205
            </p>
            <button
              onClick={onShowDirections}
              className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-3 rounded-xl active:scale-95 transition-all"
              style={{ fontSize: 15, minHeight: 48 }}
            >
              <Navigation size={16} />
              Chỉ đường quay lại phòng khám
            </button>
          </div>
        )}

        {/* Journey timeline */}
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="px-4 py-3 border-b border-border flex items-center justify-between">
            <p style={{ fontSize: 13 }} className="text-muted-foreground">Toàn bộ hành trình</p>
            <div className="flex items-center gap-1.5">
              <RefreshCw size={12} className="text-muted-foreground" />
              <span style={{ fontSize: 11 }} className="text-muted-foreground">8 giây trước</span>
            </div>
          </div>
          <div className="relative px-4 py-3">
            <div className="absolute left-[32px] top-6 bottom-6 w-0.5 bg-border" />
            {[0, 1, 2, 3].map((stepIdx) => {
              const isDone = stepIdx < currentStep;
              const isCurrent = stepIdx === currentStep;
              const isTodo = stepIdx > currentStep;
              const name = stepIdx < 3
                ? (route.steps[stepIdx]?.split("—")[0]?.trim() ?? "")
                : "Quay lại bác sĩ";

              return (
                <div key={stepIdx} className="flex gap-4 mb-4 relative z-10">
                  <div className="w-9 h-9 flex-shrink-0 flex items-center justify-center">
                    {isDone && <CheckCircle2 size={28} className="text-emerald-500" fill="#ecfdf5" />}
                    {isCurrent && (
                      <div className="w-8 h-8 rounded-full border-2 border-primary bg-primary/10 flex items-center justify-center">
                        <Loader2 size={16} className="text-primary animate-spin" />
                      </div>
                    )}
                    {isTodo && <Circle size={28} className="text-border" />}
                  </div>
                  <div className="flex-1 py-1">
                    <div className="flex items-center gap-2">
                      <p style={{ fontSize: 14 }} className={isDone ? "text-muted-foreground line-through" : isCurrent ? "text-foreground" : "text-muted-foreground"}>
                        {name}
                      </p>
                      {isCurrent && (
                        <span className="bg-primary text-primary-foreground px-2 py-0.5 rounded-full" style={{ fontSize: 11 }}>
                          Hiện tại
                        </span>
                      )}
                    </div>
                    <p style={{ fontSize: 12 }} className={`mt-0.5 ${isCurrent ? "text-primary" : "text-muted-foreground"}`}>
                      {isDone ? sideNotes[stepIdx] : isCurrent ? `Chờ dự kiến ${route.waitTimes[stepIdx]}` : sideNotes[stepIdx]}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Route change alert */}
        <button
          onClick={onShowRouteChange}
          className="w-full flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl p-3 active:scale-[0.99] transition-all"
        >
          <AlertCircle size={18} className="text-amber-600 flex-shrink-0" />
          <span style={{ fontSize: 13 }} className="text-amber-800 text-left flex-1">
            Máy X-quang tại phòng hiện tại đang tạm dừng. Xem đề xuất thay đổi.
          </span>
          <ChevronRight size={16} className="text-amber-600 flex-shrink-0" />
        </button>

        {/* Demo advance */}
        {!isLastStep && (
          <button
            onClick={onStepDone}
            className="w-full py-2.5 rounded-xl border border-dashed border-muted-foreground/40 text-muted-foreground text-center"
            style={{ fontSize: 13 }}
          >
            Mô phỏng: Hoàn tất bước {currentStep + 1} →
          </button>
        )}

        {/* Support */}
      </div>
    </div>
  );
}
