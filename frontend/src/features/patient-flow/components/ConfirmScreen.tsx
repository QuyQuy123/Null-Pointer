import { useEffect, useState } from "react";
import { CheckCircle2, ChevronRight, Clock, Loader2, MapPin, Layers } from "lucide-react";
import { AppHeader } from "./AppHeader";
import {
  confirmRouteReservation,
  createRouteReservation,
  extendRouteReservation,
} from "../api/patient-flow-api";
import type { Route, RouteReservation } from "../model/patient-flow.types";

interface ConfirmScreenProps {
  route: Route;
  patientCode: string;
  clinicalOrderId: string;
  doctorName?: string;
  doctorRoomCode?: string;
  onBack: () => void;
  onConfirmed: (reservation: RouteReservation) => void;
  onChooseAnother: () => void;
}

export function ConfirmScreen({
  route,
  patientCode,
  clinicalOrderId,
  doctorName = "BS. Trần Văn Hùng",
  doctorRoomCode = "205",
  onBack,
  onConfirmed,
  onChooseAnother,
}: ConfirmScreenProps) {
  const [reservationSeconds, setReservationSeconds] = useState(0);
  const [reservation, setReservation] = useState<RouteReservation | null>(null);
  const [reservationError, setReservationError] = useState<string | null>(null);
  const [isExtending, setIsExtending] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  useEffect(() => {
    let active = true;
    createRouteReservation(route, patientCode, clinicalOrderId)
      .then((value) => {
        if (active) setReservation(value);
      })
      .catch(() => {
        if (active) setReservationError("Không thể giữ chỗ cho phương án này. Vui lòng chọn lại lộ trình.");
      });
    return () => { active = false; };
  }, [clinicalOrderId, patientCode, route]);

  useEffect(() => {
    if (!reservation || confirmed) return;
    const syncRemainingTime = () => {
      const remaining = Math.max(
        0,
        Math.ceil((Date.parse(reservation.expiresAt) - Date.now()) / 1000),
      );
      setReservationSeconds(remaining);
    };
    syncRemainingTime();
    const interval = setInterval(syncRemainingTime, 1000);
    return () => clearInterval(interval);
  }, [confirmed, reservation]);

  const minutes = Math.floor(reservationSeconds / 60);
  const seconds = reservationSeconds % 60;

  async function handleConfirm() {
    if (!reservation) return;
    setIsConfirming(true);
    setReservationError(null);
    try {
      const result = await confirmRouteReservation(reservation.id);
      setReservation(result);
      setConfirmed(true);
      await new Promise((resolve) => setTimeout(resolve, 800));
      onConfirmed(result);
    } catch {
      setReservationError("Không thể xác nhận chỗ. Chỗ có thể đã hết hạn hoặc trạng thái phòng đã thay đổi.");
    } finally {
      setIsConfirming(false);
    }
  }

  async function handleExtend() {
    if (!reservation) return;
    setIsExtending(true);
    setReservationError(null);
    try {
      setReservation(await extendRouteReservation(reservation.id));
    } catch {
      setReservationError("Không thể gia hạn thêm lượt giữ chỗ này.");
    } finally {
      setIsExtending(false);
    }
  }

  return (
    <div className="flex flex-col min-h-full bg-background">
      <AppHeader
        title="Xác nhận và giữ chỗ"
        subtitle="Bước 4/4"
        progress={{ current: 4, total: 4 }}
        onBack={isConfirming ? undefined : onBack}
      />

      {/* Confirmed overlay */}
      {confirmed && (
        <div className="fixed inset-0 bg-white z-50 flex flex-col items-center justify-center gap-4" style={{ maxWidth: 430, margin: "0 auto" }}>
          <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center">
            <CheckCircle2 size={44} className="text-emerald-600" />
          </div>
          <h2 style={{ fontSize: 24 }} className="text-foreground">Đã xác nhận lộ trình</h2>
          <p style={{ fontSize: 15 }} className="text-muted-foreground text-center px-8">
            Bạn đã được vào hàng chờ. Đang chuyển đến màn hình hành trình...
          </p>
        </div>
      )}

      <div className="flex flex-col gap-3 px-4 pt-4 pb-8">
        {/* Reservation timer */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p style={{ fontSize: 13 }} className="text-amber-700">Chỗ đang được giữ tạm thời</p>
              <p style={{ fontSize: 32, fontVariantNumeric: "tabular-nums" } as React.CSSProperties} className="text-amber-900 mt-1">
                {minutes}:{String(seconds).padStart(2, "0")}
              </p>
            </div>
            <div className="w-14 h-14 rounded-full border-4 border-amber-300 flex items-center justify-center">
              <Clock size={24} className="text-amber-600" />
            </div>
          </div>
          {reservationSeconds <= 30 && (
            <div className="mt-2 pt-2 border-t border-amber-200">
              <button
                onClick={handleExtend}
                disabled={isExtending}
                className="text-amber-700 underline disabled:opacity-50"
                style={{ fontSize: 13 }}
              >
                {isExtending ? "Đang xin gia hạn..." : "Tôi cần thêm thời gian"}
              </button>
            </div>
          )}
        </div>

        {/* Route summary */}
        <div className="bg-card rounded-xl border border-border p-4">
          <div className="flex items-center justify-between mb-3">
            <p style={{ fontSize: 13, letterSpacing: "0.05em" }} className="text-muted-foreground uppercase">Lộ trình đã chọn</p>
            <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-full" style={{ fontSize: 12 }}>
              {route.badge}
            </span>
          </div>
          <div className="flex items-center gap-2 mb-3">
            <Clock size={15} className="text-primary" />
            <span style={{ fontSize: 15 }} className="text-foreground">Hoàn tất dự kiến {route.duration}</span>
          </div>
          <div className="flex gap-4 mb-4">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <MapPin size={14} />
              <span style={{ fontSize: 13 }}>{route.distance} m</span>
            </div>
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Layers size={14} />
              <span style={{ fontSize: 13 }}>
                {route.floorChanges === 0 ? "Không đổi tầng" : `Đổi ${route.floorChanges} lần`}
              </span>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            {route.steps.map((step, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-secondary border border-primary/30 flex items-center justify-center flex-shrink-0" style={{ fontSize: 12 }}>
                  {idx + 1}
                </div>
                <p style={{ fontSize: 14 }} className="text-foreground">{step}</p>
              </div>
            ))}
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                <div className="w-2 h-2 rounded-full bg-white" />
              </div>
              <p style={{ fontSize: 14 }} className="text-foreground">Quay lại {doctorName} — Phòng {doctorRoomCode}</p>
            </div>
          </div>
        </div>

        {/* Note */}
        <div className="bg-secondary rounded-xl border border-primary/20 p-3">
          <p style={{ fontSize: 13 }} className="text-primary">
            Lịch chờ cũ chưa bị giải phóng. Chỗ mới chỉ được xác nhận sau khi bạn bấm nút bên dưới.
          </p>
        </div>

        {reservationError && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-3">
            <p style={{ fontSize: 13 }} className="text-red-700">{reservationError}</p>
          </div>
        )}

        {/* Primary action */}
        <button
          onClick={handleConfirm}
          disabled={isConfirming || !reservation || reservationSeconds === 0}
          className={`w-full py-4 rounded-xl flex items-center justify-center gap-2 transition-all ${
            isConfirming || !reservation || reservationSeconds === 0
              ? "bg-muted text-muted-foreground cursor-not-allowed"
              : "bg-primary text-primary-foreground active:scale-[0.98]"
          }`}
          style={{ fontSize: 17, minHeight: 56 }}
        >
          {isConfirming ? (
            <><Loader2 size={20} className="animate-spin" />Đang xác nhận...</>
          ) : !reservation && !reservationError ? (
            <><Loader2 size={20} className="animate-spin" />Đang giữ chỗ...</>
          ) : reservationSeconds === 0 ? (
            "Chỗ đã hết hạn — vui lòng chọn lại"
          ) : (
            <>Xác nhận lộ trình<ChevronRight size={20} /></>
          )}
        </button>

        <button
          onClick={onChooseAnother}
          disabled={isConfirming}
          className="w-full py-3 rounded-xl border border-border bg-card text-foreground text-center"
          style={{ fontSize: 15, minHeight: 48 }}
        >
          Chọn phương án khác
        </button>
      </div>
    </div>
  );
}
