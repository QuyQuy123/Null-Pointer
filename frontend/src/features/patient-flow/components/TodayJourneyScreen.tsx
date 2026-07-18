import { Navigation, CheckCircle2, Loader2, Circle, RefreshCw } from "lucide-react";
import { AppHeader } from "./AppHeader";
import type { Route } from "../model/patient-flow.types";

export type JourneyStep = 0 | 1 | 2 | 3;

interface TodayJourneyScreenProps {
  route: Route;
  currentStep: JourneyStep;
  onShowDirections: () => void;
  onNeedSupport: () => void;
  onStepDone: () => void;
}

export function TodayJourneyScreen({
  route,
  currentStep,
  onShowDirections,
  onNeedSupport,
  onStepDone,
}: TodayJourneyScreenProps) {
  const totalSteps = route.stepDetails.length;
  const currentStepData = route.stepDetails[currentStep] ?? route.stepDetails.at(-1);
  const isDoctorReturn = currentStepData?.serviceCode === "doctor_return";
  const roomName = currentStepData?.roomName ?? "Phòng đang được cập nhật";
  const floorInfo = currentStepData?.floor;
  const completedSteps = currentStep;

  return (
    <div className="flex flex-col min-h-full bg-background pb-24">
      <AppHeader
        variant="primary"
        title="Hành trình hôm nay"
        subtitle={`${completedSteps}/${totalSteps} hoàn tất · Cập nhật 8 giây trước`}
        progress={{ current: completedSteps, total: totalSteps }}
      />

      <div className="flex flex-col gap-3 px-4 pt-4">
        {/* Current action card */}
        {!isDoctorReturn && (
          <div className="bg-primary/10 border-2 border-primary rounded-xl p-4">
            <p style={{ fontSize: 11, letterSpacing: "0.08em" }} className="text-primary uppercase mb-1">
              Việc cần làm ngay
            </p>
            <p style={{ fontSize: 18 }} className="text-foreground mb-0.5">Đi tới {roomName}</p>
            {floorInfo && (
              <p style={{ fontSize: 14 }} className="text-muted-foreground mb-3">{floorInfo}</p>
            )}
            <div className="flex items-center justify-between">
              <p style={{ fontSize: 13 }} className="text-muted-foreground">Di chuyển khoảng {currentStepData?.travelMinutes ?? 0} phút</p>
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
        {isDoctorReturn && (
          <div className="bg-emerald-50 border-2 border-emerald-500 rounded-xl p-4">
            <p style={{ fontSize: 11, letterSpacing: "0.08em" }} className="text-emerald-700 uppercase mb-1">
              Các kết quả đã sẵn sàng
            </p>
            <p style={{ fontSize: 17 }} className="text-foreground mb-3">
              Vui lòng quay lại {roomName}
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
            {route.stepDetails.map((step, stepIdx) => {
              const isDone = stepIdx < currentStep;
              const isCurrent = stepIdx === currentStep;
              const isTodo = stepIdx > currentStep;
              const name = step.serviceName;

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
                      {isDone
                        ? "Đã hoàn tất"
                        : isCurrent
                          ? `Chờ dự kiến ${step.waitMinutesMin}–${step.waitMinutesMax} phút`
                          : step.lockReason ?? `Tiếp theo tại ${step.roomName}`}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Demo advance */}
        <button
          onClick={onStepDone}
          className="w-full py-2.5 rounded-xl border border-dashed border-muted-foreground/40 text-muted-foreground text-center"
          style={{ fontSize: 13 }}
        >
          Mô phỏng: Hoàn tất {isDoctorReturn ? "hành trình" : `bước ${currentStep + 1}`} →
        </button>

        {/* Support */}
        <button
          onClick={onNeedSupport}
          className="w-full py-3.5 rounded-xl border border-border bg-card text-foreground flex items-center justify-center gap-2"
          style={{ fontSize: 15, minHeight: 52 }}
        >
          Tôi cần hỗ trợ
        </button>
      </div>
    </div>
  );
}
