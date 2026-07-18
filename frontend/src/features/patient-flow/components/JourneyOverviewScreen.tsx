import { CheckCircle2, Loader2, Circle, Clock, MapPin } from "lucide-react";
import type { Route } from "../model/patient-flow.types";
import type { JourneyStep } from "./TodayJourneyScreen";

interface JourneyOverviewScreenProps {
  route: Route;
  currentStep: JourneyStep;
}

export function JourneyOverviewScreen({ route, currentStep }: JourneyOverviewScreenProps) {
  const allSteps = route.stepDetails.map((step) => ({
    name: step.serviceName,
    location: `${step.roomName} — ${step.floor}`,
    wait: `${step.waitMinutesMin}–${step.waitMinutesMax} phút`,
    result: step.serviceCode === "doctor_return"
      ? step.lockReason ?? "Khi đủ kết quả bắt buộc"
      : "Sau khi phòng hoàn tất xử lý",
  }));

  const completedCount = currentStep;
  const totalSteps = allSteps.length;

  return (
    <div className="flex flex-col min-h-full bg-background pb-24">
      {/* Header */}
      <div className="bg-card border-b border-border px-4 pt-12 pb-4">
        <h1 style={{ fontSize: 20 }} className="text-foreground mb-1">Toàn bộ hành trình</h1>
        <div className="flex items-center gap-3">
          <div className="flex-1 bg-muted rounded-full h-2">
            <div
              className="bg-primary rounded-full h-2 transition-all"
              style={{ width: `${(completedCount / Math.max(totalSteps, 1)) * 100}%` }}
            />
          </div>
          <span style={{ fontSize: 13 }} className="text-muted-foreground">{completedCount}/{totalSteps}</span>
        </div>
      </div>

      {/* Summary */}
      <div className="mx-4 mt-4 bg-card rounded-xl border border-border p-4">
        <div className="flex gap-4">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Clock size={14} />
            <span style={{ fontSize: 13 }}>{route.duration}</span>
          </div>
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <MapPin size={14} />
            <span style={{ fontSize: 13 }}>{route.distance} m</span>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="px-4 mt-4 relative">
        <div className="absolute left-[35px] top-0 bottom-0 w-0.5 bg-border" style={{ top: 20 }} />

        {allSteps.map((step, idx) => {
          const isDone = idx < currentStep;
          const isCurrent = idx === currentStep;
          const isTodo = idx > currentStep;

          return (
            <div key={idx} className="flex gap-4 mb-4 relative z-10">
              {/* Icon */}
              <div className="w-9 h-9 flex-shrink-0 flex items-center justify-center">
                {isDone && <CheckCircle2 size={30} className="text-emerald-500" fill="#ecfdf5" />}
                {isCurrent && (
                  <div className="w-8 h-8 rounded-full border-2 border-primary bg-secondary flex items-center justify-center">
                    <Loader2 size={15} className="text-primary animate-spin" />
                  </div>
                )}
                {isTodo && <Circle size={30} className="text-border" />}
              </div>

              {/* Card */}
              <div className={`flex-1 rounded-xl border p-4 mb-1 ${isDone ? "bg-muted border-border opacity-70" : isCurrent ? "bg-card border-primary shadow-sm" : "bg-card border-border"}`}>
                <div className="flex items-center gap-2 mb-1">
                  <p style={{ fontSize: 15 }} className={`${isTodo ? "text-muted-foreground" : "text-foreground"}`}>
                    {step.name}
                  </p>
                  {isCurrent && (
                    <span className="bg-primary text-primary-foreground px-2 py-0.5 rounded-full" style={{ fontSize: 11 }}>
                      Hiện tại
                    </span>
                  )}
                  {isDone && (
                    <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full" style={{ fontSize: 11 }}>
                      Hoàn tất
                    </span>
                  )}
                </div>
                {step.location && (
                  <p style={{ fontSize: 13 }} className="text-muted-foreground mb-2">{step.location}</p>
                )}
                {step.wait && (
                  <div className="flex gap-4">
                    <div>
                      <p style={{ fontSize: 11 }} className="text-muted-foreground">Chờ dự kiến</p>
                      <p style={{ fontSize: 13 }} className="text-foreground">{step.wait}</p>
                    </div>
                    <div>
                      <p style={{ fontSize: 11 }} className="text-muted-foreground">Kết quả</p>
                      <p style={{ fontSize: 13 }} className="text-foreground">{step.result}</p>
                    </div>
                  </div>
                )}
                {!step.wait && step.result && (
                  <p style={{ fontSize: 13 }} className="text-muted-foreground">{step.result}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
