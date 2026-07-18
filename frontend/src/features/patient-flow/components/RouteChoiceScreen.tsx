import { ChevronRight, Clock, MapPin, Layers, RefreshCw, Info } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { AppHeader } from "./AppHeader";
import { mapClinicalOrderRoutes } from "../api/patient-flow-api";
import { recalculateLatestPatientRoute } from "../../../entities/clinical-order/api/clinical-order-api";
import type { Priority, Route, RouteId, ScheduleStrategy } from "../model/patient-flow.types";

export type { Route } from "../model/patient-flow.types";

const scheduleStrategyLabels: Record<ScheduleStrategy, string> = {
  balanced: "Cân bằng",
  finish_early: "Ưu tiên thời gian vào khám",
  leave_fast: "Ưu tiên kết quả đến tay bác sĩ",
};

interface RouteChoiceScreenProps {
  priority: Priority;
  scheduleStrategy: ScheduleStrategy;
  dispatchedRoutes: Route[];
  recalculation?: {
    patientCode: string;
    completedServiceCodes: string[];
    startRoomCode?: string;
  };
  doctorName: string;
  onBack: () => void;
  onSelect: (route: Route) => void;
  onViewDetail: (route: Route) => void;
}

export function RouteChoiceScreen({
  priority,
  scheduleStrategy,
  dispatchedRoutes,
  recalculation,
  doctorName,
  onBack,
  onSelect,
  onViewDetail,
}: RouteChoiceScreenProps) {
  const [showReasonFor, setShowReasonFor] = useState<RouteId | null>(null);
  const shouldRecalculate = recalculation !== undefined;
  const {
    data: calculatedRoutes = [],
    isPending,
    isError,
    refetch,
  } = useQuery({
    queryKey: [
      "route-proposal",
      priority,
      scheduleStrategy,
      recalculation?.patientCode,
      recalculation?.completedServiceCodes,
      recalculation?.startRoomCode,
    ],
    queryFn: async () => {
      if (!recalculation) {
        return [];
      }
      const updatedOrder = await recalculateLatestPatientRoute(
        recalculation.patientCode,
        {
          priority: priority === "lessWalk"
            ? "less_walk"
            : priority === "lessCrowd"
              ? "less_crowd"
              : priority,
          schedule_strategy: scheduleStrategy,
          completed_route_service_codes: recalculation.completedServiceCodes,
          start_room_code: recalculation.startRoomCode,
        },
      );
      return mapClinicalOrderRoutes(updatedOrder);
    },
    enabled: shouldRecalculate,
    staleTime: 0,
  });
  const routes = shouldRecalculate
    ? calculatedRoutes
    : dispatchedRoutes;
  const isRouteLoading = shouldRecalculate && isPending;
  const hasRouteError = shouldRecalculate && isError;

  return (
    <div className="flex flex-col min-h-full bg-background">
      <AppHeader
        title="Chọn lộ trình"
        subtitle={`Chế độ: ${scheduleStrategyLabels[scheduleStrategy]}`}
        progress={{ current: 3, total: 4 }}
        onBack={onBack}
      />

      <div className="flex flex-col gap-4 px-4 pt-4 pb-8">
        {/* Safety notice */}
        <div className="bg-secondary rounded-xl border border-primary/20 p-3">
          <p style={{ fontSize: 13 }} className="text-primary leading-relaxed">
            Các phương án dưới đây đều đã được bệnh viện xác nhận phù hợp với chỉ định của bạn. Lựa chọn của bạn không làm thay đổi chỉ định của bác sĩ.
          </p>
        </div>

        {isRouteLoading && (
          <div className="bg-card rounded-xl border border-border p-6 text-center">
            <RefreshCw size={24} className="animate-spin text-primary mx-auto mb-3" />
            <p style={{ fontSize: 15 }} className="text-foreground">Đang tính các phương án từ trạng thái phòng hiện tại...</p>
          </div>
        )}

        {hasRouteError && (
          <div className="bg-red-50 rounded-xl border border-red-200 p-4">
            <p style={{ fontSize: 14 }} className="text-red-700 mb-3">Không thể tạo lộ trình an toàn. Vui lòng kiểm tra backend hoặc thử lại.</p>
            <button
              onClick={() => refetch()}
              className="w-full py-3 rounded-xl bg-primary text-primary-foreground"
              style={{ minHeight: 48 }}
            >
              Thử tạo lại phương án
            </button>
          </div>
        )}

        {/* Route cards */}
        {routes.map((route) => (
          <div key={route.id} className="bg-card rounded-xl border border-border overflow-hidden">
            {/* Badge row */}
            <div className={`px-4 py-2.5 flex items-center justify-between ${route.badgeColor}`}>
              <span style={{ fontSize: 12, letterSpacing: "0.08em" }}>{route.badge}</span>
              <div className="flex items-center gap-1 opacity-80">
                <RefreshCw size={11} />
                <span style={{ fontSize: 11 }}>Cập nhật {route.updatedAt}</span>
              </div>
            </div>

            <div className="p-4">
              {/* Duration */}
              <div className="flex items-center gap-2 mb-3">
                <Clock size={16} className="text-primary" />
                <span style={{ fontSize: 17 }} className="text-foreground">Hoàn tất dự kiến {route.duration}</span>
              </div>

              {/* Steps */}
              <div className="flex flex-col gap-1.5 mb-3">
                {route.steps.map((step, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <div className="w-5 h-5 rounded-full bg-muted flex items-center justify-center flex-shrink-0 mt-0.5" style={{ fontSize: 11 }}>
                      {idx + 1}
                    </div>
                    <p style={{ fontSize: 14 }} className="text-foreground">
                      {step}
                      <span className="text-muted-foreground ml-1" style={{ fontSize: 12 }}>
                        (chờ {route.waitTimes[idx]})
                      </span>
                    </p>
                  </div>
                ))}
                <div className="flex items-start gap-2">
                  <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <div className="w-2 h-2 rounded-full bg-primary" />
                  </div>
                  <p style={{ fontSize: 14 }} className="text-muted-foreground">Quay lại {doctorName}</p>
                </div>
              </div>

              {/* Stats */}
              <div className="flex gap-4 py-3 border-t border-b border-border mb-3">
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <MapPin size={14} />
                  <span style={{ fontSize: 13 }}>{route.distance} m</span>
                </div>
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Layers size={14} />
                  <span style={{ fontSize: 13 }}>
                    {route.floorChanges === 0 ? "Không đổi tầng" : `Đổi tầng ${route.floorChanges} lần`}
                  </span>
                </div>
              </div>

              {/* Reason */}
              <button
                onClick={() => setShowReasonFor(showReasonFor === route.id ? null : route.id)}
                className="flex items-center gap-1.5 text-primary mb-3"
                style={{ fontSize: 13 }}
              >
                <Info size={14} />
                Vì sao thứ tự này?
              </button>
              {showReasonFor === route.id && (
                <div className="bg-secondary rounded-lg p-3 mb-3">
                  <p style={{ fontSize: 13 }} className="text-foreground leading-relaxed">{route.reason}</p>
                </div>
              )}

              {/* Action buttons */}
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => onSelect(route)}
                  className="w-full py-3.5 rounded-xl bg-primary text-primary-foreground flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
                  style={{ fontSize: 16, minHeight: 52 }}
                >
                  Chọn lộ trình này
                  <ChevronRight size={18} />
                </button>
                <button
                  onClick={() => onViewDetail(route)}
                  className="w-full py-2.5 text-primary text-center rounded-xl border border-border"
                  style={{ fontSize: 14, minHeight: 44 }}
                >
                  Xem chi tiết lộ trình
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
