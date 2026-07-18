import { useState } from "react";
import {
  ClipboardList,
  Map,
  FlaskConical,
  LayoutList,
  HeadphonesIcon,
  ChevronRight,
  Bell,
  User,
  Stethoscope,
  Clock,
  AlertCircle,
  CheckCircle2,
  Activity,
  FileText,
  Phone,
  Timer,
  Loader2,
} from "lucide-react";
import type { ScheduleStrategy } from "../model/patient-flow.types";

interface DashboardScreenProps {
  onStartJourney: (strategy?: ScheduleStrategy) => void;
  onViewMap: () => void;
}

type MenuTab = "today" | "orders" | "results" | "schedule" | "support";

const menuTabs: { id: MenuTab; label: string; icon: React.ReactNode }[] = [
  { id: "today", label: "Hôm nay", icon: <Activity size={18} /> },
  { id: "orders", label: "Chỉ định", icon: <ClipboardList size={18} /> },
  { id: "results", label: "Kết quả", icon: <FlaskConical size={18} /> },
  { id: "schedule", label: "Lịch trình", icon: <LayoutList size={18} /> },
  { id: "support", label: "Hỗ trợ", icon: <HeadphonesIcon size={18} /> },
];

export function DashboardScreen({ onStartJourney, onViewMap }: DashboardScreenProps) {
  const [activeTab, setActiveTab] = useState<MenuTab>("today");

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
          <div className="flex items-center gap-2">
            <button className="relative w-10 h-10 flex items-center justify-center rounded-full bg-white/15 active:bg-white/25 transition-colors" aria-label="Thông báo">
              <Bell size={18} className="text-white" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-400" />
            </button>
            <button className="w-10 h-10 flex items-center justify-center rounded-full bg-white/15 active:bg-white/25 transition-colors" aria-label="Hồ sơ">
              <User size={18} className="text-white" />
            </button>
          </div>
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
              <p style={{ fontSize: 19 }} className="text-white">Nguyễn Thị Mai</p>
              <p style={{ fontSize: 13, opacity: 0.8 }} className="text-white">Sinh ngày 12/03/1968 · Nữ · 58 tuổi</p>
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <span className="bg-white/20 text-white px-2.5 py-1 rounded-full" style={{ fontSize: 12 }}>
                  Mã BN: BN-00847
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
              <p style={{ fontSize: 13 }} className="text-white mt-0.5">TM-2026-00847</p>
            </div>
            <div>
              <p style={{ fontSize: 11, opacity: 0.7, letterSpacing: "0.05em" }} className="text-white uppercase">Bác sĩ phụ trách</p>
              <p style={{ fontSize: 13 }} className="text-white mt-0.5">BS. Trần Văn Hùng</p>
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
        {activeTab === "today" && <TodayTab onViewOrders={() => setActiveTab("orders")} />}
        {activeTab === "orders" && <OrdersTab onViewSchedule={() => setActiveTab("schedule")} />}
        {activeTab === "results" && <ResultsTab />}
        {activeTab === "schedule" && <ScheduleTab onStartJourney={onStartJourney} onViewMap={onViewMap} />}
        {activeTab === "support" && <SupportTab />}
      </div>
    </div>
  );
}

/* ── Today tab ── */
function TodayTab({ onViewOrders }: { onViewOrders: () => void }) {
  return (
    <div className="flex flex-col gap-3 px-4 pt-4 pb-8">
      {/* Active task banner */}
      <div className="bg-amber-50 border-2 border-amber-400 rounded-2xl p-4">
        <div className="flex items-start gap-3 mb-3">
          <div className="w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
            <AlertCircle size={20} className="text-amber-600" />
          </div>
          <div>
            <p style={{ fontSize: 15 }} className="text-amber-900">Bác sĩ vừa gửi 3 chỉ định mới</p>
            <p style={{ fontSize: 13 }} className="text-amber-700 mt-0.5">
              Xét nghiệm máu · X-quang · Siêu âm bụng
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
        <div className="flex flex-col gap-2">
          {[
            {
              time: "08:30",
              title: "Đăng ký khám",
              sub: "Khoa Tim mạch — đã hoàn tất",
              done: true,
              icon: <CheckCircle2 size={16} className="text-emerald-500" />,
            },
            {
              time: "09:45",
              title: "Đo huyết áp & sinh hiệu",
              sub: "Phòng đo lường — đã hoàn tất",
              done: true,
              icon: <CheckCircle2 size={16} className="text-emerald-500" />,
            },
            {
              time: "10:00",
              title: "Khám với BS. Trần Văn Hùng",
              sub: "Phòng 205 — đã hoàn tất · Ký 3 chỉ định",
              done: true,
              icon: <CheckCircle2 size={16} className="text-emerald-500" />,
            },
            {
              time: "10:05",
              title: "Hành trình xét nghiệm",
              sub: "Cần bắt đầu ngay",
              done: false,
              icon: <AlertCircle size={16} className="text-amber-500" />,
              active: true,
            },
          ].map((item, idx) => (
            <div
              key={idx}
              className={`bg-card rounded-xl border p-3 flex items-center gap-3 ${item.active ? "border-amber-300" : "border-border"} ${item.done ? "opacity-70" : ""}`}
            >
              <div className="text-center w-10 flex-shrink-0">
                <p style={{ fontSize: 12 }} className="text-muted-foreground">{item.time}</p>
              </div>
              <div className="flex-1 min-w-0">
                <p style={{ fontSize: 14 }} className={`${item.active ? "text-amber-700" : "text-foreground"}`}>{item.title}</p>
                <p style={{ fontSize: 12 }} className="text-muted-foreground truncate">{item.sub}</p>
              </div>
              {item.icon}
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
          <p style={{ fontSize: 15 }} className="text-foreground">BS. Trần Văn Hùng</p>
          <p style={{ fontSize: 13 }} className="text-muted-foreground">Khoa Tim mạch · Phòng 205</p>
        </div>
        <ChevronRight size={16} className="text-muted-foreground" />
      </div>
    </div>
  );
}

/* ── Orders tab ── */
function OrdersTab({ onViewSchedule }: { onViewSchedule: () => void }) {
  return (
    <div className="flex flex-col gap-3 px-4 pt-4 pb-8">
      <div className="flex items-center justify-between">
        <p style={{ fontSize: 12, letterSpacing: "0.06em" }} className="text-muted-foreground uppercase">3 chỉ định mới</p>
        <span className="bg-amber-100 text-amber-700 px-2.5 py-0.5 rounded-full" style={{ fontSize: 12 }}>Cần thực hiện</span>
      </div>

      {[
        { icon: "🩸", name: "Xét nghiệm máu", code: "XN-MAU-001", note: "Nhịn ăn ≥ 4 giờ", order: 1, locked: true },
        { icon: "🫁", name: "Chụp X-quang ngực", code: "XQ-NGUC-002", note: "Không có điều kiện đặc biệt", order: 2, locked: false },
        { icon: "🔊", name: "Siêu âm bụng", code: "SA-BUNG-003", note: "Tiếp tục nhịn ăn", order: 3, locked: false },
      ].map((svc, idx) => (
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

/* ── Results tab ── */
function ResultsTab() {
  const results = [
    { icon: "🩸", name: "Xét nghiệm máu", code: "XN-MAU-001", hasResult: false, readyAt: null },
    { icon: "🫁", name: "Chụp X-quang ngực", code: "XQ-NGUC-002", hasResult: true, readyAt: "11:08" },
    { icon: "🔊", name: "Siêu âm bụng", code: "SA-BUNG-003", hasResult: false, readyAt: null },
  ];

  const readyCount = results.filter((r) => r.hasResult).length;

  return (
    <div className="flex flex-col gap-3 px-4 pt-4 pb-8">
      {/* Tổng trạng thái */}
      <div className={`rounded-xl border p-3 flex items-center gap-3 ${readyCount === results.length ? "bg-emerald-50 border-emerald-200" : "bg-amber-50 border-amber-200"}`}>
        <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${readyCount === results.length ? "bg-emerald-100" : "bg-amber-100"}`}>
          <FlaskConical size={18} className={readyCount === results.length ? "text-emerald-600" : "text-amber-600"} />
        </div>
        <div className="flex-1">
          <p style={{ fontSize: 14 }} className={readyCount === results.length ? "text-emerald-800" : "text-amber-800"}>
            {readyCount === results.length
              ? "Tất cả kết quả đã sẵn sàng"
              : `${readyCount}/${results.length} kết quả đã sẵn sàng`}
          </p>
          <p style={{ fontSize: 12 }} className="text-muted-foreground mt-0.5">
            {readyCount < results.length ? "Các kết quả còn lại đang được xử lý" : "Bác sĩ có thể xem toàn bộ kết quả"}
          </p>
        </div>
      </div>

      {/* Danh sách kết quả */}
      <p style={{ fontSize: 12, letterSpacing: "0.06em" }} className="text-muted-foreground uppercase pl-1">
        Kết quả xét nghiệm hôm nay
      </p>

      {results.map((r, idx) => (
        <div key={idx} className={`bg-card rounded-xl border p-4 ${r.hasResult ? "border-emerald-200" : "border-border"}`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center flex-shrink-0 text-xl">
              {r.icon}
            </div>
            <div className="flex-1 min-w-0">
              <p style={{ fontSize: 15 }} className="text-foreground">{r.name}</p>
              <p style={{ fontSize: 12 }} className="text-muted-foreground">{r.code}</p>
            </div>
            {r.hasResult ? (
              <div className="flex items-center gap-1.5 bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-full flex-shrink-0">
                <CheckCircle2 size={13} />
                <span style={{ fontSize: 12 }}>Đã có</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 bg-muted text-muted-foreground px-2.5 py-1 rounded-full flex-shrink-0">
                <Loader2 size={13} className="animate-spin" />
                <span style={{ fontSize: 12 }}>Chưa có</span>
              </div>
            )}
          </div>

          {r.hasResult && r.readyAt && (
            <div className="mt-3 pt-3 border-t border-border flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Clock size={12} className="text-muted-foreground" />
                <span style={{ fontSize: 12 }} className="text-muted-foreground">Sẵn sàng lúc {r.readyAt}</span>
              </div>
              <button
                className="flex items-center gap-1.5 text-primary"
                style={{ fontSize: 13 }}
              >
                <FileText size={13} />
                Xem kết quả chi tiết
                <ChevronRight size={13} />
              </button>
            </div>
          )}

          {!r.hasResult && (
            <div className="mt-2">
              <p style={{ fontSize: 12 }} className="text-muted-foreground">
                Kết quả sẽ hiển thị tại đây sau khi phòng xét nghiệm hoàn tất
              </p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

/* ── Schedule tab ── */
function ScheduleTab({ onStartJourney, onViewMap }: { onStartJourney: (strategy?: ScheduleStrategy) => void; onViewMap: () => void }) {
  const [priority, setPriority] = useState<ScheduleStrategy>("balanced");
  const [priorityOpen, setPriorityOpen] = useState(false);

  const priorityOptions: { id: ScheduleStrategy; label: string; desc: string; icon: React.ReactNode; time: string }[] = [
    {
      id: "balanced",
      label: "Cân bằng",
      desc: "Tối ưu thời gian, quãng đường và sự ổn định",
      icon: <Activity size={18} />,
      time: "~3.5 giờ",
    },
    {
      id: "finish_early",
      label: "Ưu tiên hoàn tất sớm",
      desc: "Sắp xếp để lấy đủ kết quả và quay lại bác sĩ nhanh nhất",
      icon: <Timer size={18} />,
      time: "~2.8 giờ",
    },
    {
      id: "leave_fast",
      label: "Ra khỏi viện nhanh nhất",
      desc: "Rút ngắn tổng thời gian từ lúc bắt đầu đến khi ra về",
      icon: <ChevronRight size={18} />,
      time: "~2.2 giờ",
    },
  ];

  type SlotStatus = "done" | "active" | "pending" | "upcoming";

  const slots: {
    time: string;
    endTime?: string;
    title: string;
    location: string;
    status: SlotStatus;
    note?: string;
    duration?: string;
  }[] = [
    {
      time: "08:30",
      endTime: "08:50",
      title: "Đăng ký khám & đo sinh hiệu",
      location: "Quầy tiếp nhận — tầng 1",
      status: "done",
      duration: "20 phút",
    },
    {
      time: "09:45",
      endTime: "10:00",
      title: "Khám với BS. Trần Văn Hùng",
      location: "Phòng 205 — tầng 2, khu A",
      status: "done",
      duration: "15 phút",
      note: "Bác sĩ đã ký 3 chỉ định",
    },
    {
      time: "10:05",
      endTime: "10:15",
      title: "Xét nghiệm máu",
      location: "Lấy máu 01 — tầng 1, khu A",
      status: "active",
      duration: "5–10 phút",
      note: "Cần nhịn ăn — đã đáp ứng",
    },
    {
      time: "10:20",
      endTime: "10:45",
      title: "Chụp X-quang ngực",
      location: "X-quang 03 — tầng 2, khu A",
      status: "pending",
      duration: "10–20 phút chờ + 10 phút chụp",
    },
    {
      time: "10:50",
      endTime: "11:20",
      title: "Siêu âm bụng",
      location: "Siêu âm 05 — tầng 2, khu A",
      status: "pending",
      duration: "15–25 phút chờ + 20 phút",
      note: "Tiếp tục nhịn ăn",
    },
    {
      time: "11:30",
      endTime: "12:00",
      title: "Tái khám — nhận kết quả",
      location: "Phòng 205 — tầng 2, khu A",
      status: "upcoming",
      duration: "Khi đủ 3 kết quả",
      note: "BS. Trần Văn Hùng",
    },
  ];

  const statusConfig: Record<SlotStatus, { dot: string; label: string; labelColor: string; cardBorder: string; timeBg: string }> = {
    done:     { dot: "bg-emerald-500",  label: "Hoàn tất",    labelColor: "text-emerald-700 bg-emerald-50",  cardBorder: "border-border opacity-60",      timeBg: "bg-muted" },
    active:   { dot: "bg-primary animate-pulse", label: "Đang thực hiện", labelColor: "text-primary bg-secondary", cardBorder: "border-primary shadow-sm",      timeBg: "bg-primary text-white" },
    pending:  { dot: "bg-amber-400",    label: "Sắp đến",     labelColor: "text-amber-700 bg-amber-50",      cardBorder: "border-amber-200",               timeBg: "bg-amber-50" },
    upcoming: { dot: "bg-muted-foreground", label: "Chờ xác nhận", labelColor: "text-muted-foreground bg-muted", cardBorder: "border-border",               timeBg: "bg-muted" },
  };

  const selectedPriority = priorityOptions.find((p) => p.id === priority)!;

  return (
    <div className="flex flex-col pb-8">
      {/* Date header */}
      <div className="px-4 pt-4 pb-3 flex items-center justify-between">
        <div>
          <p style={{ fontSize: 16 }} className="text-foreground">Thứ Sáu, 17/07/2026</p>
          <p style={{ fontSize: 13 }} className="text-muted-foreground">Lượt khám TM-2026-00847</p>
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
                const isSelected = priority === opt.id;
                return (
                  <button
                    key={opt.id}
                    onClick={() => { setPriority(opt.id); setPriorityOpen(false); }}
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
          <span style={{ fontSize: 12 }} className="text-primary">2/6 bước</span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div className="h-2 bg-primary rounded-full transition-all" style={{ width: "33%" }} />
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
                  <div className="mt-2 flex flex-col gap-2">
                    <button
                      onClick={() => onStartJourney(priority)}
                      className="flex items-center gap-1.5 text-primary"
                      style={{ fontSize: 13 }}
                    >
                      <Loader2 size={13} className="animate-spin" />
                      Xem hành trình xét nghiệm
                      <ChevronRight size={13} />
                    </button>
                    <button
                      onClick={onViewMap}
                      className="flex items-center justify-center gap-1.5 w-full py-2 bg-primary text-primary-foreground rounded-lg active:scale-[0.98] transition-all"
                      style={{ fontSize: 13, minHeight: 38 }}
                    >
                      <Map size={14} />
                      Xem đường đi
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
                <p style={{ fontSize: 16 }} className="text-foreground">Lấy máu 01</p>
                <p style={{ fontSize: 13 }} className="text-muted-foreground">Tầng 1, khu A · Cách ~60 m</p>
              </div>
              <div className="bg-secondary text-primary px-2.5 py-1 rounded-full flex-shrink-0" style={{ fontSize: 12 }}>
                Nên đến trước 10:20
              </div>
            </div>
          </div>

          {/* Các bước đi */}
          <div className="px-4 py-3 flex flex-col gap-2.5">
            {[
              "Từ vị trí hiện tại, đi thẳng đến cuối hành lang chính.",
              "Rẽ phải tại biển \"Khu Xét nghiệm\", đi thêm khoảng 30 m.",
              "Lấy máu 01 ở bên trái, nhận số thứ tự tại quầy.",
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
          <div className="px-4 pb-4 flex gap-2">
            <button
              onClick={onViewMap}
              className="flex-1 py-3 bg-primary text-primary-foreground rounded-xl flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
              style={{ fontSize: 14, minHeight: 48 }}
            >
              <Map size={16} />
              Xem bản đồ đầy đủ
            </button>
            <button
              className="px-4 py-3 border border-border bg-card text-foreground rounded-xl"
              style={{ fontSize: 14, minHeight: 48 }}
            >
              Hỗ trợ xe lăn
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Support tab ── */
function SupportTab() {
  return (
    <div className="flex flex-col gap-3 px-4 pt-4 pb-8">
      <div className="bg-primary rounded-2xl p-5 text-center">
        <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-3">
          <HeadphonesIcon size={28} className="text-white" />
        </div>
        <p style={{ fontSize: 18 }} className="text-white mb-1">Cần hỗ trợ?</p>
        <p style={{ fontSize: 13, opacity: 0.85 }} className="text-white mb-4">Nhân viên luôn sẵn sàng giúp bạn</p>
        <button
          className="w-full py-3.5 bg-white text-primary rounded-xl flex items-center justify-center gap-2"
          style={{ fontSize: 16, minHeight: 50 }}
        >
          <Phone size={18} />
          Gọi nhân viên hỗ trợ
        </button>
      </div>

      {[
        { icon: <Map size={20} className="text-primary" />, title: "Sơ đồ bệnh viện", sub: "Tìm đường đến các khoa, phòng" },
        { icon: <FileText size={20} className="text-primary" />, title: "Hướng dẫn quy trình", sub: "Các bước khám từ đầu đến cuối" },
        { icon: <Phone size={20} className="text-primary" />, title: "Đường dây hỗ trợ", sub: "1900 1234 — Miễn phí, 24/7" },
        { icon: <HeadphonesIcon size={20} className="text-primary" />, title: "Hỗ trợ người thân thao tác thay", sub: "Cấp quyền cho người thân hỗ trợ" },
      ].map((item, idx) => (
        <button
          key={idx}
          className="bg-card rounded-xl border border-border p-4 flex items-center gap-3 text-left active:bg-muted transition-colors w-full"
          style={{ minHeight: 64 }}
        >
          <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center flex-shrink-0">
            {item.icon}
          </div>
          <div className="flex-1">
            <p style={{ fontSize: 15 }} className="text-foreground">{item.title}</p>
            <p style={{ fontSize: 13 }} className="text-muted-foreground">{item.sub}</p>
          </div>
          <ChevronRight size={16} className="text-muted-foreground" />
        </button>
      ))}
    </div>
  );
}
