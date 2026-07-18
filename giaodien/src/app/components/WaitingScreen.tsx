import React from "react";
import { Clock, MapPin, RefreshCw, ChevronRight, Info } from "lucide-react";
import { useState, useEffect } from "react";
import type { Route } from "./RouteChoiceScreen";
import type { JourneyStep } from "./TodayJourneyScreen";

interface WaitingScreenProps {
  route: Route;
  currentStep: JourneyStep;
  onNext: () => void;
}

const stepNames = ["Lấy máu", "Chụp X-quang", "Siêu âm bụng"];
const stepLocations = [
  "Lấy máu 01 — tầng 1, khu A",
  "X-quang 03 — tầng 2, khu A",
  "Siêu âm 05 — tầng 2, khu A",
];
const stepQueueSizes = [3, 7, 2];

export function WaitingScreen({ route, currentStep, onNext }: WaitingScreenProps) {
  const [elapsed, setElapsed] = useState(0);
  const [canLeave, setCanLeave] = useState(false);

  const maxWait = currentStep === 0 ? 10 : currentStep === 1 ? 20 : 25;
  const minWait = currentStep === 0 ? 5 : currentStep === 1 ? 10 : 15;

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsed((e) => {
        if (e >= minWait * 60) setCanLeave(true);
        return e + 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [minWait]);

  const elapsedMinutes = Math.floor(elapsed / 60);
  const elapsedSeconds = elapsed % 60;

  const stepName = currentStep < 3 ? stepNames[currentStep] : "Quay lại bác sĩ";
  const location = currentStep < 3 ? stepLocations[currentStep] : "Phòng khám Tim mạch 205";
  const queueAhead = Math.max(0, stepQueueSizes[currentStep] - Math.floor(elapsedMinutes / 3));

  return (
    <div className="flex flex-col min-h-full bg-background pb-20">
      {/* Header */}
      <div className="bg-primary text-primary-foreground px-4 pt-12 pb-6">
        <h1 style={{ fontSize: 20 }} className="mb-1">Đang chờ</h1>
        <p style={{ fontSize: 15, opacity: 0.85 }}>{stepName}</p>
      </div>

      {/* Main wait info */}
      <div className="mx-4 mt-4 bg-card rounded-xl border border-border p-5">
        <p style={{ fontSize: 13 }} className="text-muted-foreground mb-1">Bạn đang chờ tại</p>
        <p style={{ fontSize: 16 }} className="text-foreground mb-4">{location}</p>

        <div className="grid grid-cols-2 gap-4">
          {/* Elapsed */}
          <div className="bg-muted rounded-xl p-3 text-center">
            <p style={{ fontSize: 11, letterSpacing: "0.05em" }} className="text-muted-foreground uppercase mb-1">Đã chờ</p>
            <p style={{ fontSize: 24, fontVariantNumeric: "tabular-nums" } as React.CSSProperties} className="text-foreground">
              {String(elapsedMinutes).padStart(2, "0")}:{String(elapsedSeconds).padStart(2, "0")}
            </p>
          </div>
          {/* Queue */}
          <div className="bg-muted rounded-xl p-3 text-center">
            <p style={{ fontSize: 11, letterSpacing: "0.05em" }} className="text-muted-foreground uppercase mb-1">Còn trước bạn</p>
            <p style={{ fontSize: 24 }} className="text-foreground">{queueAhead} người</p>
          </div>
        </div>
      </div>

      {/* Estimated wait */}
      <div className="mx-4 mt-3 bg-card rounded-xl border border-border p-4">
        <div className="flex items-center gap-2 mb-3">
          <Clock size={16} className="text-primary" />
          <p style={{ fontSize: 14 }} className="text-foreground">
            Dự kiến được gọi trong{" "}
            <span className="text-primary">{minWait}–{maxWait} phút</span>
          </p>
        </div>

        <div className="flex items-center gap-2 mb-3">
          <Info size={16} className="text-muted-foreground" />
          <p style={{ fontSize: 14 }} className="text-foreground">
            Các bước dự kiến hoàn tất từ{" "}
            <span className="text-foreground">10:45 đến 11:05</span>
          </p>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-border">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <RefreshCw size={13} />
            <span style={{ fontSize: 12 }}>Cập nhật 12 giây trước</span>
          </div>
          <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full" style={{ fontSize: 12 }}>
            Đang hoạt động
          </span>
        </div>
      </div>

      {/* Can leave notification */}
      <div className={`mx-4 mt-3 rounded-xl border p-4 transition-colors ${canLeave ? "bg-emerald-50 border-emerald-200" : "bg-muted border-border"}`}>
        <p style={{ fontSize: 14 }} className={canLeave ? "text-emerald-800" : "text-muted-foreground"}>
          {canLeave
            ? "Bạn có thể rời khu chờ trong tối đa 5 phút. Quay lại trước 10:30."
            : "Vui lòng ở lại khu chờ cho đến khi được gọi."}
        </p>
      </div>

      {/* Next step preview */}
      {currentStep < 2 && (
        <div className="mx-4 mt-3 bg-card rounded-xl border border-border p-4">
          <p style={{ fontSize: 12, letterSpacing: "0.05em" }} className="text-muted-foreground uppercase mb-2">Bước tiếp theo sau khi xong</p>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-secondary border border-primary/30 flex items-center justify-center flex-shrink-0" style={{ fontSize: 13 }}>
              {currentStep + 2}
            </div>
            <div>
              <p style={{ fontSize: 14 }} className="text-foreground">
                {route.steps[currentStep + 1]?.split("—")[0]?.trim()}
              </p>
              <p style={{ fontSize: 12 }} className="text-muted-foreground">
                {route.steps[currentStep + 1]?.split("—")[1]?.trim()}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="mx-4 mt-4 flex flex-col gap-3">
        <button
          onClick={onNext}
          className="w-full py-4 rounded-xl bg-primary text-primary-foreground flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
          style={{ fontSize: 16, minHeight: 52 }}
        >
          Xem bước tiếp theo
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
}
