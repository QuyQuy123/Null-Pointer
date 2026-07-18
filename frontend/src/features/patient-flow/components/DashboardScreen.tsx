import { useState } from "react";
import {
  ClipboardList,
  Map,
  LayoutList,
  ChevronRight,
  User,
  Stethoscope,
  Clock,
  AlertCircle,
  CheckCircle2,
  Activity,
  FileText,
  Timer,
  Loader2,
  Bell,
} from "lucide-react";
import type { ScheduleStrategy } from "../model/patient-flow.types";
import type {
  ClinicalOrderDispatch,
  ClinicalOrderItem,
} from "../../../entities/clinical-order/model/clinical-order.schemas";
import type { PatientActivity } from "../../../entities/patient/model/patient-activity.schemas";
import { ServiceCompletionDialog } from "./ServiceCompletionDialog";

interface DashboardScreenProps {
  order: ClinicalOrderDispatch;
  activities: PatientActivity[];
  isActivitiesLoading: boolean;
  hasActivitiesError: boolean;
  onRetryActivities: () => void;
  scheduleStrategy: ScheduleStrategy;
  currentStep: number;
  routeOptionId?: string;
  onRegenerateJourney: (strategy: ScheduleStrategy) => void;
  onCompleteCurrentService: () => void;
  onViewMap: () => void;
  onOpenNotifications: () => void;
}

type MenuTab = "today" | "orders" | "schedule";

const menuTabs: { id: MenuTab; label: string; icon: React.ReactNode }[] = [
  { id: "today", label: "Hôm nay", icon: <Activity size={18} /> },
  { id: "orders", label: "Chỉ định", icon: <ClipboardList size={18} /> },
  { id: "schedule", label: "Lịch trình", icon: <LayoutList size={18} /> },
];

const orderItemIcons: Record<ClinicalOrderItem["room_service_type"], string> = {
  blood_test: "🩸",
  urine_test: "🧪",
  xray: "🫁",
  ultrasound: "🔊",
  soft_tissue_ultrasound: "🔊",
  ct_scan: "◉",
  cardiac_monitoring: "♥",
  eeg: "🧠",
  endoscopy: "◌",
  sedated_endoscopy: "◌",
  echocardiography: "♥",
  vascular_doppler: "↝",
  spirometry: "🫁",
  bronchoscopy: "🫁",
  mri: "◎",
};

function getOrderItemNote(item: ClinicalOrderItem) {
  if (item.notes) return item.notes;
  if (item.fasting_policy === "required") return "Cần nhịn ăn trước khi thực hiện";
  if (item.fasting_policy === "conditional") return "Nhịn ăn tùy loại xét nghiệm";
  return "Không có điều kiện chuẩn bị đặc biệt";
}

const orderTimeFormatter = new Intl.DateTimeFormat("vi-VN", {
  hour: "2-digit",
  minute: "2-digit",
});

const orderDateFormatter = new Intl.DateTimeFormat("vi-VN", {
  weekday: "long",
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

function formatOrderMinute(isoDate: string, offsetMinutes: number) {
  return orderTimeFormatter.format(new Date(new Date(isoDate).getTime() + offsetMinutes * 60_000));
}

export function DashboardScreen({
  order,
  activities,
  isActivitiesLoading,
  hasActivitiesError,
  onRetryActivities,
  scheduleStrategy,
  currentStep,
  routeOptionId,
  onRegenerateJourney,
  onCompleteCurrentService,
  onViewMap,
  onOpenNotifications,
}: DashboardScreenProps) {
  const [activeTab, setActiveTab] = useState<MenuTab>("today");
  const patientName = order.patient_name;
  const patientCode = order.patient_code;
  const encounterId = order.encounter_id;
  const doctorName = order.doctor_name;

  return (
    <div className="flex flex-col min-h-full bg-background">
      {/* ── Top header ── */}
      <div className="bg-primary text-primary-foreground pt-10 pb-0">
        {/* Hospital bar */}
        <div className="flex items-center justify-between px-4 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
              <Activity size={18} className="text-white" />
            </div>
            <span style={{ fontSize: 15 }} className="text-white">Bệnh viện Đa khoa TW</span>
          </div>
          <button
            type="button"
            onClick={onOpenNotifications}
            className="relative flex h-10 w-10 items-center justify-center rounded-full bg-white/15 transition-colors active:bg-white/25"
            aria-label="Thông báo và hoạt động"
          >
            <Bell size={20} className="text-white" />
          </button>
        </div>

        {/* Patient info card */}
        <div className="mx-4 mb-4 bg-white/10 backdrop-blur rounded-2xl border border-white/20 p-4">
          <div className="flex items-start gap-3">
            {/* Avatar */}
            <div className="w-14 h-14 rounded-full bg-white/20 border-2 border-white/30 flex items-center justify-center flex-shrink-0">
              <User size={28} className="text-white" />
            </div>
            {/* Info */}
            <div className="flex-1 min-w-0">
              <p style={{ fontSize: 19 }} className="text-white">{patientName}</p>
              <p style={{ fontSize: 13, opacity: 0.8 }} className="text-white">Dữ liệu lượt khám đã đồng bộ từ máy chủ điều phối</p>
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <span className="bg-white/20 text-white px-2.5 py-1 rounded-full" style={{ fontSize: 12 }}>
                  Mã BN: {patientCode}
                </span>
                <span className="bg-emerald-400/30 text-emerald-100 px-2.5 py-1 rounded-full" style={{ fontSize: 12 }}>
                  ● Đang khám
                </span>
              </div>
            </div>
          </div>

          {/* Visit info row */}
          <div className="mt-3 pt-3 border-t border-white/15 grid grid-cols-2 gap-2">
            <div>
              <p style={{ fontSize: 11, opacity: 0.7, letterSpacing: "0.05em" }} className="text-white uppercase">Lượt khám</p>
              <p style={{ fontSize: 13 }} className="text-white mt-0.5">{encounterId}</p>
            </div>
            <div>
              <p style={{ fontSize: 11, opacity: 0.7, letterSpacing: "0.05em" }} className="text-white uppercase">Bác sĩ phụ trách</p>
              <p style={{ fontSize: 13 }} className="text-white mt-0.5">{doctorName}</p>
            </div>
          </div>
        </div>

        {/* ── Tab menu ── */}
        <div className="flex overflow-x-auto px-4 gap-1 pb-0" style={{ scrollbarWidth: "none" }}>
          {menuTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-4 py-2.5 rounded-t-xl whitespace-nowrap flex-shrink-0 transition-colors ${
                activeTab === tab.id
                  ? "bg-background text-primary"
                  : "text-white/70 hover:text-white hover:bg-white/10"
              }`}
              style={{ fontSize: 14, minHeight: 44 }}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Tab content ── */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === "today" && (
          <TodayTab
            order={order}
            activities={activities}
            isLoading={isActivitiesLoading}
            hasError={hasActivitiesError}
            onRetry={onRetryActivities}
            onViewOrders={() => setActiveTab("orders")}
          />
        )}
        {activeTab === "orders" && <OrdersTab order={order} onViewSchedule={() => setActiveTab("schedule")} />}
        {activeTab === "schedule" && (
          <ScheduleTab
            order={order}
            scheduleStrategy={scheduleStrategy}
            currentStep={currentStep}
            routeOptionId={routeOptionId}
            onRegenerateJourney={onRegenerateJourney}
            onCompleteCurrentService={onCompleteCurrentService}
            onViewMap={onViewMap}
          />
        )}
      </div>
    </div>
  );
}

/* ── Today tab ── */
interface TodayTabProps {
  order: ClinicalOrderDispatch;
  activities: PatientActivity[];
  isLoading: boolean;
  hasError: boolean;
  onRetry: () => void;
  onViewOrders: () => void;
}

const activityTimeFormatter = new Intl.DateTimeFormat("vi-VN", {
  hour: "2-digit",
  minute: "2-digit",
});

function ActivityStatusIcon({ type }: { type: PatientActivity["activity_type"] }) {
  if (type === "clinical_order_dispatched") {
    return <ClipboardList size={16} className="text-amber-500" />;
  }
  return <CheckCircle2 size={16} className="text-emerald-500" />;
}

function TodayTab({
  order,
  activities,
  isLoading,
  hasError,
  onRetry,
  onViewOrders,
}: TodayTabProps) {
  const itemCount = order.items.length;
  const itemNames = order.items.map((item) => item.service_name).join(" · ");
  const doctorName = order.doctor_name;
  const doctorRoom = order.doctor_room_code;
  return (
    <div className="flex flex-col gap-3 px-4 pt-4 pb-8">
      {/* Active task banner */}
      <div className="bg-amber-50 border-2 border-amber-400 rounded-2xl p-4">
        <div className="flex items-start gap-3 mb-3">
          <div className="w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
            <AlertCircle size={20} className="text-amber-600" />
          </div>
          <div>
            <p style={{ fontSize: 15 }} className="text-amber-900">Bác sĩ vừa gửi {itemCount} chỉ định mới</p>
            <p style={{ fontSize: 13 }} className="text-amber-700 mt-0.5">
              {itemNames}
            </p>
          </div>
        </div>
        <button
          onClick={onViewOrders}
          className="w-full py-3 bg-amber-500 text-white rounded-xl flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
          style={{ fontSize: 16, minHeight: 50 }}
        >
          <ClipboardList size={18} />
          Xem chỉ định
          <ChevronRight size={18} />
        </button>
      </div>

      {/* Today's timeline */}
      <div>
        <p style={{ fontSize: 12, letterSpacing: "0.06em" }} className="text-muted-foreground uppercase pl-1 mb-2">
          Hoạt động hôm nay
        </p>
        <div className="flex flex-col gap-2" aria-live="polite">
          {isLoading && (
            <div className="bg-card rounded-xl border border-border p-4 flex items-center justify-center gap-2 text-muted-foreground">
              <Loader2 size={17} className="animate-spin" />
              <span style={{ fontSize: 13 }}>Đang tải nhật ký từ máy chủ…</span>
            </div>
          )}
          {hasError && !isLoading && (
            <div className="bg-red-50 rounded-xl border border-red-200 p-4 text-center">
              <p style={{ fontSize: 13 }} className="text-red-700">Không tải được nhật ký hoạt động.</p>
              <button type="button" onClick={onRetry} className="mt-2 text-red-700 underline" style={{ fontSize: 13 }}>
                Thử lại
              </button>
            </div>
          )}
          {!isLoading && !hasError && activities.length === 0 && (
            <div className="bg-card rounded-xl border border-border p-5 text-center">
              <FileText size={22} className="text-muted-foreground mx-auto mb-2" />
              <p style={{ fontSize: 14 }} className="text-foreground">Chưa có hoạt động nào được ghi nhận hôm nay</p>
              <p style={{ fontSize: 12 }} className="text-muted-foreground mt-1">Các thao tác thật sẽ xuất hiện tại đây theo thời gian thực.</p>
            </div>
          )}
          {!isLoading && !hasError && activities.map((item) => (
            <div
              key={item.id}
              className="bg-card rounded-xl border border-border p-3 flex items-center gap-3"
            >
              <div className="text-center w-10 flex-shrink-0">
                <p style={{ fontSize: 12 }} className="text-muted-foreground">
                  {activityTimeFormatter.format(new Date(item.occurred_at))}
                </p>
              </div>
              <div className="flex-1 min-w-0">
                <p style={{ fontSize: 14 }} className="text-foreground">{item.title}</p>
                <p style={{ fontSize: 12 }} className="text-muted-foreground truncate">{item.description}</p>
              </div>
              <ActivityStatusIcon type={item.activity_type} />
            </div>
          ))}
        </div>
      </div>

      {/* Doctor info */}
      <div className="bg-card rounded-xl border border-border p-4 flex items-center gap-3">
        <div className="w-11 h-11 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
          <Stethoscope size={20} className="text-primary" />
        </div>
        <div className="flex-1">
          <p style={{ fontSize: 13 }} className="text-muted-foreground">Bác sĩ phụ trách</p>
          <p style={{ fontSize: 15 }} className="text-foreground">{doctorName}</p>
          <p style={{ fontSize: 13 }} className="text-muted-foreground">Phòng khám · {doctorRoom}</p>
        </div>
        <ChevronRight size={16} className="text-muted-foreground" />
      </div>
    </div>
  );
}

/* ── Orders tab ── */
function OrdersTab({ order, onViewSchedule }: { order: ClinicalOrderDispatch; onViewSchedule: () => void }) {
  const firstServiceCode = order.route_proposal.options[0]?.steps.find(
    (step) => step.service_code !== "doctor_return",
  )?.service_code;
  const services = order.items.map((item, index) => ({
        icon: orderItemIcons[item.room_service_type],
        name: item.service_name,
        code: item.service_code,
        note: getOrderItemNote(item),
        order: index + 1,
        locked: item.service_code === firstServiceCode,
      }));
  return (
    <div className="flex flex-col gap-3 px-4 pt-4 pb-8">
      <div className="flex items-center justify-between">
        <p style={{ fontSize: 12, letterSpacing: "0.06em" }} className="text-muted-foreground uppercase">{services.length} chỉ định mới</p>
        <span className="bg-amber-100 text-amber-700 px-2.5 py-0.5 rounded-full" style={{ fontSize: 12 }}>Cần thực hiện</span>
      </div>

      {services.map((svc, idx) => (
        <div key={idx} className="bg-card rounded-xl border border-border p-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center flex-shrink-0 text-xl">
              {svc.icon}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap mb-0.5">
                <p style={{ fontSize: 15 }} className="text-foreground">{svc.name}</p>
                {svc.locked && (
                  <span className="bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full" style={{ fontSize: 11 }}>Làm trước</span>
                )}
              </div>
              <p style={{ fontSize: 12 }} className="text-muted-foreground">{svc.code}</p>
              <p style={{ fontSize: 13 }} className="text-muted-foreground mt-1">{svc.note}</p>
            </div>
            <div className="w-7 h-7 rounded-full bg-secondary border border-border flex items-center justify-center flex-shrink-0" style={{ fontSize: 13 }}>
              {svc.order}
            </div>
          </div>
        </div>
      ))}

      {/* Nút xem lịch trình */}
      <button
        onClick={onViewSchedule}
        className="w-full py-4 rounded-xl border-2 border-primary text-primary flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
        style={{ fontSize: 16, minHeight: 52 }}
      >
        <LayoutList size={18} />
        Xem lịch trình
        <ChevronRight size={18} />
      </button>
    </div>
  );
}

/* ── Schedule tab ── */
function ScheduleTab({
  order,
  scheduleStrategy,
  currentStep,
  routeOptionId,
  onRegenerateJourney,
  onCompleteCurrentService,
  onViewMap,
}: {
  order: ClinicalOrderDispatch;
  scheduleStrategy: ScheduleStrategy;
  currentStep: number;
  routeOptionId?: string;
  onRegenerateJourney: (strategy: ScheduleStrategy) => void;
  onCompleteCurrentService: () => void;
  onViewMap: () => void;
}) {
  const [priorityOpen, setPriorityOpen] = useState(false);
  const [showCompletionConfirmation, setShowCompletionConfirmation] = useState(false);

  const recommendedOption = order.route_proposal.options.find(
    (option) => option.id === routeOptionId,
  ) ?? order.route_proposal.options[0];
  const estimatedDuration = recommendedOption
    ? `${recommendedOption.duration_minutes_min}–${recommendedOption.duration_minutes_max} phút`
    : undefined;
  const priorityOptions: { id: ScheduleStrategy; label: string; desc: string; icon: React.ReactNode; time: string }[] = [
    {
      id: "balanced",
      label: "Cân bằng",
      desc: "Tối ưu thời gian, quãng đường và sự ổn định",
      icon: <Activity size={18} />,
      time: estimatedDuration ?? "Đang tính",
    },
    {
      id: "finish_early",
      label: "Ưu tiên thời gian vào khám",
      desc: "Ưu tiên được tiếp nhận và hoàn thành các dịch vụ sớm; có thể chờ bác sĩ lâu hơn",
      icon: <Timer size={18} />,
      time: estimatedDuration ?? "Đang tính",
    },
    {
      id: "leave_fast",
      label: "Ưu tiên kết quả đến tay bác sĩ",
      desc: "Sắp xếp để các kết quả bắt buộc đến tay bác sĩ trong thời gian sớm nhất",
      icon: <ChevronRight size={18} />,
      time: estimatedDuration ?? "Đang tính",
    },
  ];

  type SlotStatus = "done" | "active" | "pending" | "upcoming";

  const slots = recommendedOption
    ? [
        {
          time: formatOrderMinute(order.created_at, -15),
          endTime: formatOrderMinute(order.created_at, 0),
          title: `Khám với ${order.doctor_name}`,
          location: `Phòng ${order.doctor_room_code}`,
          status: "done" as const,
          duration: "15 phút",
          note: `Bác sĩ đã ký ${order.items.length} chỉ định`,
        },
        ...recommendedOption.steps.map((step, index) => ({
          time: formatOrderMinute(order.created_at, step.arrival_minutes),
          endTime: formatOrderMinute(order.created_at, step.complete_minutes),
          title: step.service_name,
          location: `${step.room_name} — ${step.floor}`,
          status: index < currentStep
            ? "done" as const
            : index === currentStep
              ? "active" as const
              : step.service_code === "doctor_return"
                ? "upcoming" as const
                : "pending" as const,
          duration: `Chờ ${step.wait_minutes_min}–${step.wait_minutes_max} phút · thực hiện ${step.service_minutes} phút`,
          note: step.lock_reason ?? undefined,
        })),
      ]
    : [];

  const statusConfig: Record<SlotStatus, { dot: string; label: string; labelColor: string; cardBorder: string; timeBg: string }> = {
    done:     { dot: "bg-emerald-500",  label: "Hoàn tất",    labelColor: "text-emerald-700 bg-emerald-50",  cardBorder: "border-border opacity-60",      timeBg: "bg-muted" },
    active:   { dot: "bg-primary animate-pulse", label: "Đang thực hiện", labelColor: "text-primary bg-secondary", cardBorder: "border-primary shadow-sm",      timeBg: "bg-primary text-white" },
    pending:  { dot: "bg-amber-400",    label: "Sắp đến",     labelColor: "text-amber-700 bg-amber-50",      cardBorder: "border-amber-200",               timeBg: "bg-amber-50" },
    upcoming: { dot: "bg-muted-foreground", label: "Chờ xác nhận", labelColor: "text-muted-foreground bg-muted", cardBorder: "border-border",               timeBg: "bg-muted" },
  };

  const selectedPriority = priorityOptions.find((p) => p.id === scheduleStrategy)!;
  const nextStep = recommendedOption?.steps[currentStep];
  const displayDate = orderDateFormatter.format(new Date(order.created_at));
  const encounterId = order.encounter_id;
  const completedSlotCount = slots.filter((slot) => slot.status === "done").length;
  const progressPercent = Math.round((completedSlotCount / Math.max(slots.length, 1)) * 100);

  return (
    <div className="flex flex-col pb-8">
      {/* Date header */}
      <div className="px-4 pt-4 pb-3 flex items-center justify-between">
        <div>
          <p style={{ fontSize: 16 }} className="text-foreground">{displayDate}</p>
          <p style={{ fontSize: 13 }} className="text-muted-foreground">Lượt khám {encounterId}</p>
        </div>
        <div className="flex items-center gap-1.5 bg-secondary px-3 py-1.5 rounded-full">
          <Timer size={13} className="text-primary" />
          <span style={{ fontSize: 13 }} className="text-primary">{selectedPriority.time}</span>
        </div>
      </div>

      {/* ── Thẻ ưu tiên lịch trình ── */}
      <div className="px-4 mb-4">
        <div className="bg-card rounded-2xl border border-border overflow-hidden">
          {/* Header — luôn hiển thị, bấm để mở/đóng */}
          <button
            onClick={() => setPriorityOpen((o) => !o)}
            className="w-full flex items-center gap-3 px-4 py-3.5 text-left"
            style={{ minHeight: 56 }}
          >
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 text-primary">
              {selectedPriority.icon}
            </div>
            <div className="flex-1 min-w-0">
              <p style={{ fontSize: 12 }} className="text-muted-foreground">Đang ưu tiên</p>
              <p style={{ fontSize: 15 }} className="text-primary">{selectedPriority.label}</p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <span style={{ fontSize: 13 }} className="text-muted-foreground">{selectedPriority.time}</span>
              <ChevronRight
                size={18}
                className={`text-muted-foreground transition-transform duration-200 ${priorityOpen ? "rotate-90" : ""}`}
              />
            </div>
          </button>

          {/* Chi tiết — chỉ hiện khi mở */}
          {priorityOpen && (
            <div className="border-t border-border">
              {priorityOptions.map((opt, idx) => {
                const isSelected = scheduleStrategy === opt.id;
                return (
                  <button
                    key={opt.id}
                    onClick={() => {
                      setPriorityOpen(false);
                      if (!isSelected) onRegenerateJourney(opt.id);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3.5 text-left transition-colors ${
                      isSelected ? "bg-secondary" : "bg-card active:bg-muted"
                    } ${idx < priorityOptions.length - 1 ? "border-b border-border" : ""}`}
                    style={{ minHeight: 56 }}
                  >
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${isSelected ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                      {opt.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p style={{ fontSize: 14 }} className={isSelected ? "text-primary" : "text-foreground"}>
                        {opt.label}
                      </p>
                      <p style={{ fontSize: 12 }} className="text-muted-foreground leading-snug">{opt.desc}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1 flex-shrink-0">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${isSelected ? "border-primary bg-primary" : "border-border"}`}>
                        {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                      </div>
                      <span style={{ fontSize: 11 }} className="text-muted-foreground">{opt.time}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Progress bar tổng */}
      <div className="px-4 mb-4">
        <div className="flex items-center justify-between mb-1">
          <span style={{ fontSize: 12 }} className="text-muted-foreground">Tiến độ hôm nay</span>
          <span style={{ fontSize: 12 }} className="text-primary">{completedSlotCount}/{slots.length} bước</span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div className="h-2 bg-primary rounded-full transition-all" style={{ width: `${progressPercent}%` }} />
        </div>
      </div>

      {/* Timeline */}
      <div className="px-4 relative">
        {/* Trục dọc */}
        <div className="absolute left-[52px] top-3 bottom-3 w-0.5 bg-border" />

        {slots.map((slot, idx) => {
          const cfg = statusConfig[slot.status];
          const isActive = slot.status === "active";
          const isDone = slot.status === "done";

          return (
            <div key={idx} className="flex gap-3 mb-3 relative z-10">
              {/* Cột giờ */}
              <div className="w-16 flex-shrink-0 flex flex-col items-end pt-3">
                <div className={`px-1.5 py-0.5 rounded-lg ${isActive ? "bg-primary" : "bg-muted"}`}>
                  <p style={{ fontSize: 12, fontVariantNumeric: "tabular-nums" } as React.CSSProperties}
                    className={isActive ? "text-white" : "text-muted-foreground"}>
                    {slot.time}
                  </p>
                </div>
                {slot.endTime && (
                  <p style={{ fontSize: 11 }} className="text-muted-foreground mt-0.5 pr-1">
                    {slot.endTime}
                  </p>
                )}
              </div>

              {/* Dot trên trục */}
              <div className="flex flex-col items-center pt-3.5 flex-shrink-0 relative z-10" style={{ width: 16 }}>
                <div className={`w-3.5 h-3.5 rounded-full border-2 border-background ${cfg.dot}`} />
              </div>

              {/* Card */}
              <div className={`flex-1 bg-card rounded-xl border p-3 mb-0 ${cfg.cardBorder}`}>
                <div className="flex items-start justify-between gap-2 mb-1">
                  <p style={{ fontSize: 14 }} className={`${isDone ? "text-muted-foreground" : "text-foreground"} leading-snug`}>
                    {slot.title}
                  </p>
                  <span className={`px-2 py-0.5 rounded-full flex-shrink-0 ${cfg.labelColor}`} style={{ fontSize: 11 }}>
                    {cfg.label}
                  </span>
                </div>

                <p style={{ fontSize: 12 }} className="text-muted-foreground mb-1">{slot.location}</p>

                {slot.duration && (
                  <div className="flex items-center gap-1 mb-1">
                    <Clock size={11} className="text-muted-foreground" />
                    <span style={{ fontSize: 12 }} className="text-muted-foreground">{slot.duration}</span>
                  </div>
                )}

                {slot.note && (
                  <p style={{ fontSize: 12 }} className={`mt-1 ${isActive ? "text-primary" : "text-muted-foreground"}`}>
                    {slot.note}
                  </p>
                )}

                {isActive && (
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <button
                      onClick={onViewMap}
                      className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-primary bg-card px-2 py-2 text-primary active:scale-[0.98] transition-all"
                      style={{ fontSize: 13, minHeight: 52 }}
                    >
                      <Map size={14} />
                      Xem đường đi
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowCompletionConfirmation(true)}
                      className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-primary px-2 py-2 text-primary-foreground active:scale-[0.98] transition-all"
                      style={{ fontSize: 12, minHeight: 52 }}
                    >
                      <CheckCircle2 size={15} className="flex-shrink-0" />
                      Tôi đã hoàn thành dịch vụ này
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Thẻ chỉ đường ── */}
      <div className="px-4 mt-2">
        <p style={{ fontSize: 12, letterSpacing: "0.06em" }} className="text-muted-foreground uppercase mb-2">
          Chỉ đường bước tiếp theo
        </p>
        <div className="bg-card rounded-2xl border border-primary/30 overflow-hidden">
          {/* Điểm đến */}
          <div className="px-4 pt-4 pb-3 border-b border-border">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Map size={18} className="text-primary" />
              </div>
              <div className="flex-1">
                <p style={{ fontSize: 13 }} className="text-muted-foreground">Đến tiếp theo</p>
                <p style={{ fontSize: 16 }} className="text-foreground">{nextStep?.room_name ?? "Đã hoàn tất lộ trình"}</p>
                <p style={{ fontSize: 13 }} className="text-muted-foreground">{nextStep ? `${nextStep.floor} · Di chuyển ${nextStep.travel_minutes} phút` : "Không còn phòng dịch vụ tiếp theo"}</p>
              </div>
              <div className="bg-secondary text-primary px-2.5 py-1 rounded-full flex-shrink-0" style={{ fontSize: 12 }}>
                {nextStep ? `Dự kiến ${formatOrderMinute(order.created_at, nextStep.arrival_minutes)}` : "Hoàn tất"}
              </div>
            </div>
          </div>

          {/* Các bước đi */}
          <div className="px-4 py-3 flex flex-col gap-2.5">
            {[
              `Di chuyển đến ${nextStep?.floor ?? "tầng được hướng dẫn"}.`,
              `Đi theo biển chỉ dẫn đến ${nextStep?.room_name ?? "phòng thực hiện dịch vụ"}.`,
              `Xác nhận mã phòng ${nextStep?.room_code ?? "trên phiếu chỉ định"} tại quầy tiếp nhận.`,
            ].map((step, i) => (
              <div key={i} className="flex gap-2.5 items-start">
                <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white" style={{ fontSize: 11 }}>{i + 1}</span>
                </div>
                <p style={{ fontSize: 13 }} className="text-foreground leading-snug">{step}</p>
              </div>
            ))}
          </div>

          {/* Nút hành động */}
          <div className="px-4 pb-4">
            <button
              onClick={onViewMap}
              className="w-full py-3 bg-primary text-primary-foreground rounded-xl flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
              style={{ fontSize: 14, minHeight: 48 }}
            >
              <Map size={16} />
              Xem bản đồ đầy đủ
            </button>
          </div>
        </div>
      </div>

      {showCompletionConfirmation && (
        <ServiceCompletionDialog
          destination={nextStep?.room_name ?? "dịch vụ hiện tại"}
          onCancel={() => setShowCompletionConfirmation(false)}
          onConfirm={() => {
            setShowCompletionConfirmation(false);
            onCompleteCurrentService();
          }}
        />
      )}
    </div>
  );
}
