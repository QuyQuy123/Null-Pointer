import { Info, RefreshCw, Lock, ChevronRight, X, AlertCircle } from "lucide-react";
import { useState } from "react";
import { AppHeader } from "./AppHeader";
import type { Route } from "../model/patient-flow.types";

interface Step {
  name: string;
  room: string;
  floor: string;
  waitTime: string;
  duration: string;
  resultTime: string;
  distance: string;
  note?: string;
  locked?: boolean;
  lockReason?: string;
  canChange: boolean;
  alternativeRooms?: { name: string; wait: string; elevator: boolean }[];
}

const buildSteps = (route: Route): Step[] => route.stepDetails.map((step) => ({
  name: step.serviceName,
  room: step.roomName,
  floor: step.floor,
  waitTime: `${step.waitMinutesMin}–${step.waitMinutesMax} phút`,
  duration: `${step.serviceMinutes} phút`,
  resultTime: step.serviceCode === "doctor_return"
    ? "Khi đủ kết quả bắt buộc"
    : "Sau khi phòng hoàn tất xử lý",
  distance: step.travelMinutes === 0
    ? "Đang ở đúng khu vực"
    : `Di chuyển khoảng ${step.travelMinutes} phút`,
  locked: step.isLocked,
  lockReason: step.lockReason,
  canChange: false,
}));

interface RouteDetailScreenProps {
  route: Route;
  onBack: () => void;
  onConfirm: (route: Route) => void;
}

export function RouteDetailScreen({ route, onBack, onConfirm }: RouteDetailScreenProps) {
  const [steps] = useState<Step[]>(() => buildSteps(route));
  const [openReasonFor, setOpenReasonFor] = useState<number | null>(null);
  const [changingStep, setChangingStep] = useState<number | null>(null);
  const [selectedAlternative, setSelectedAlternative] = useState<{ stepIdx: number; roomIdx: number } | null>(null);
  const [showComparison, setShowComparison] = useState(false);
  const [appliedChanges, setAppliedChanges] = useState<Record<number, number>>({});

  const reasons = route.stepDetails.map(
    (step) => step.lockReason ?? route.reason,
  );

  function handleApplyChange() {
    if (selectedAlternative) {
      setAppliedChanges((prev) => ({ ...prev, [selectedAlternative.stepIdx]: selectedAlternative.roomIdx }));
    }
    setShowComparison(false);
    setChangingStep(null);
    setSelectedAlternative(null);
  }

  return (
    <div className="flex flex-col min-h-full bg-background">
      <AppHeader
        title="Chi tiết lộ trình"
        subtitle={`Hoàn tất dự kiến ${route.duration}`}
        progress={{ current: 4, total: 4 }}
        onBack={onBack}
        onForward={() => onConfirm(route)}
        forwardLabel="Xác nhận"
      />

      {/* Journey timeline */}
      <div className="px-4 pt-4 pb-32 relative">
        <div className="absolute left-[35px] top-8 bottom-8 w-0.5 bg-border" />

        {steps.map((step, idx) => {
          const isLast = idx === steps.length - 1;
          const applied = appliedChanges[idx];
          const displayRoom = applied !== undefined && step.alternativeRooms
            ? step.alternativeRooms[applied].name
            : `${step.room} — ${step.floor}`;

          return (
            <div key={idx} className="relative flex gap-4 mb-4">
              {/* Dot */}
              <div className="flex-shrink-0 z-10">
                {isLast ? (
                  <div className="w-9 h-9 rounded-full border-2 border-primary bg-card flex items-center justify-center">
                    <div className="w-3 h-3 rounded-full bg-primary" />
                  </div>
                ) : (
                  <div className="w-9 h-9 rounded-full bg-secondary border-2 border-primary/30 flex items-center justify-center">
                    <span style={{ fontSize: 14 }} className="text-primary">{idx + 1}</span>
                  </div>
                )}
              </div>

              {/* Card */}
              <div className="flex-1 bg-card rounded-xl border border-border p-4">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <p style={{ fontSize: 16 }} className="text-foreground">{step.name}</p>
                  {step.locked && (
                    <div className="flex items-center gap-1 bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full flex-shrink-0">
                      <Lock size={11} />
                      <span style={{ fontSize: 11 }}>Khóa</span>
                    </div>
                  )}
                </div>

                <p style={{ fontSize: 13 }} className="text-primary mb-2">{displayRoom}</p>

                {!isLast && (
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 mb-3">
                    {step.waitTime && (
                      <>
                        <span style={{ fontSize: 12 }} className="text-muted-foreground">Chờ dự kiến</span>
                        <span style={{ fontSize: 12 }} className="text-foreground">{step.waitTime}</span>
                      </>
                    )}
                    {step.duration && (
                      <>
                        <span style={{ fontSize: 12 }} className="text-muted-foreground">Thực hiện</span>
                        <span style={{ fontSize: 12 }} className="text-foreground">{step.duration}</span>
                      </>
                    )}
                    {step.resultTime && (
                      <>
                        <span style={{ fontSize: 12 }} className="text-muted-foreground">Kết quả dự kiến</span>
                        <span style={{ fontSize: 12 }} className="text-foreground">{step.resultTime}</span>
                      </>
                    )}
                    {step.distance && (
                      <>
                        <span style={{ fontSize: 12 }} className="text-muted-foreground">Di chuyển</span>
                        <span style={{ fontSize: 12 }} className="text-foreground">{step.distance}</span>
                      </>
                    )}
                  </div>
                )}

                {step.note && (
                  <div className="flex items-center gap-2 bg-amber-50 rounded-lg px-3 py-2 mb-3">
                    <AlertCircle size={13} className="text-amber-600 flex-shrink-0" />
                    <p style={{ fontSize: 12 }} className="text-amber-800">{step.note}</p>
                  </div>
                )}

                {step.lockReason && openReasonFor === idx && (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-3">
                    <p style={{ fontSize: 13 }} className="text-amber-800">{step.lockReason}</p>
                  </div>
                )}

                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setOpenReasonFor(openReasonFor === idx ? null : idx)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-secondary text-primary"
                    style={{ fontSize: 13, minHeight: 40 }}
                  >
                    <Info size={13} />
                    Vì sao bước này?
                  </button>

                  {step.canChange && !step.locked && (
                    <button
                      onClick={() => {
                        setChangingStep(idx);
                        setSelectedAlternative(null);
                        setShowComparison(false);
                      }}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border bg-card text-foreground"
                      style={{ fontSize: 13, minHeight: 40 }}
                    >
                      <RefreshCw size={13} />
                      Đổi phòng này
                    </button>
                  )}
                </div>

                {openReasonFor === idx && (
                  <div className="mt-3 bg-secondary rounded-lg p-3">
                    <p style={{ fontSize: 13 }} className="text-foreground leading-relaxed">{reasons[idx]}</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Change room bottom sheet */}
      {changingStep !== null && (
        <div className="fixed inset-0 bg-black/40 z-50 flex flex-col justify-end" style={{ maxWidth: 430, margin: "0 auto" }}>
          <div className="bg-card rounded-t-2xl p-5 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 style={{ fontSize: 18 }} className="text-foreground">Đổi phòng — {steps[changingStep].name}</h2>
              <button onClick={() => setChangingStep(null)} className="w-9 h-9 flex items-center justify-center rounded-full bg-muted">
                <X size={18} className="text-foreground" />
              </button>
            </div>

            <p style={{ fontSize: 13 }} className="text-muted-foreground mb-4">
              Chọn phòng tương đương để xem tác động trước khi xác nhận
            </p>

            {steps[changingStep].alternativeRooms?.map((room, roomIdx) => (
              <button
                key={roomIdx}
                onClick={() => {
                  setSelectedAlternative({ stepIdx: changingStep, roomIdx });
                  setShowComparison(true);
                }}
                className={`w-full text-left rounded-xl border-2 p-4 mb-3 transition-all ${
                  selectedAlternative?.stepIdx === changingStep && selectedAlternative?.roomIdx === roomIdx
                    ? "border-primary bg-secondary"
                    : "border-border bg-card"
                }`}
                style={{ minHeight: 60 }}
              >
                <p style={{ fontSize: 15 }} className="text-foreground mb-1">{room.name}</p>
                <div className="flex items-center gap-3">
                  <span style={{ fontSize: 13 }} className="text-muted-foreground">Chờ {room.wait}</span>
                  {room.elevator && (
                    <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full" style={{ fontSize: 11 }}>
                      Có thang máy
                    </span>
                  )}
                </div>
              </button>
            ))}

            {showComparison && selectedAlternative && (
              <div className="bg-secondary rounded-xl p-4 mb-4">
                <p style={{ fontSize: 11, letterSpacing: "0.05em" }} className="text-muted-foreground uppercase mb-3">
                  So sánh thay đổi
                </p>
                <div className="grid grid-cols-3 gap-2" style={{ fontSize: 13 }}>
                  <div className="text-muted-foreground">Nội dung</div>
                  <div className="text-muted-foreground text-center">Hiện tại</div>
                  <div className="text-primary text-center">Sau khi đổi</div>
                  <div className="py-1">Hoàn tất</div>
                  <div className="py-1 text-center">11:05–11:20</div>
                  <div className="py-1 text-center text-primary">11:15–11:35</div>
                  <div className="py-1">Quãng đường</div>
                  <div className="py-1 text-center">{route.distance} m</div>
                  <div className="py-1 text-center text-primary">140 m</div>
                  <div className="py-1">Đổi tầng</div>
                  <div className="py-1 text-center">{route.floorChanges} lần</div>
                  <div className="py-1 text-center text-primary">0 lần</div>
                </div>
                <div className="mt-3 flex items-start gap-2">
                  <AlertCircle size={13} className="text-muted-foreground flex-shrink-0 mt-0.5" />
                  <p style={{ fontSize: 12 }} className="text-muted-foreground">
                    X-quang và siêu âm sẽ được tính lại khi bạn áp dụng thay đổi này
                  </p>
                </div>
              </div>
            )}

            <div className="flex flex-col gap-2">
              <button
                onClick={handleApplyChange}
                disabled={!selectedAlternative}
                className={`w-full py-4 rounded-xl flex items-center justify-center gap-2 transition-all ${
                  selectedAlternative ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                }`}
                style={{ fontSize: 16, minHeight: 52 }}
              >
                Dùng thay đổi này
              </button>
              <button
                onClick={() => setChangingStep(null)}
                className="w-full py-3 rounded-xl border border-border text-foreground text-center"
                style={{ fontSize: 15, minHeight: 48 }}
              >
                Giữ nguyên lộ trình
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Fixed confirm bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border px-4 py-4 z-30" style={{ maxWidth: 430, margin: "0 auto" }}>
        <button
          onClick={() => onConfirm(route)}
          className="w-full py-4 rounded-xl bg-primary text-primary-foreground flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
          style={{ fontSize: 17, minHeight: 56 }}
        >
          Xác nhận lộ trình
          <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );
}
