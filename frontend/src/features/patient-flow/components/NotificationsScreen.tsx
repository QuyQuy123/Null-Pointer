import {
  Bell,
  CheckCircle2,
  ClipboardList,
  Loader2,
  RefreshCw,
  Route,
  ArrowLeft,
} from "lucide-react";
import type { PatientActivity } from "../../../entities/patient/model/patient-activity.schemas";

interface NotificationsScreenProps {
  activities: PatientActivity[];
  isLoading: boolean;
  hasError: boolean;
  onRetry: () => void;
  onBack: () => void;
}

const timeFormatter = new Intl.DateTimeFormat("vi-VN", {
  hour: "2-digit",
  minute: "2-digit",
});

function ActivityIcon({ type }: { type: PatientActivity["activity_type"] }) {
  if (type === "clinical_order_dispatched") {
    return <ClipboardList size={18} className="text-amber-600" />;
  }
  if (type === "route_confirmed") {
    return <Route size={18} className="text-primary" />;
  }
  return <CheckCircle2 size={18} className="text-emerald-600" />;
}

export function NotificationsScreen({
  activities,
  isLoading,
  hasError,
  onRetry,
  onBack,
}: NotificationsScreenProps) {
  const newestFirst = activities.toReversed();

  return (
    <div className="flex flex-col min-h-full bg-background pb-8">
      <div className="bg-card border-b border-border px-4 pt-12 pb-4">
        <div className="flex items-start gap-3">
          <button
            type="button"
            onClick={onBack}
            className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl border border-border bg-card"
            aria-label="Quay lại màn hình chính"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 style={{ fontSize: 20 }} className="text-foreground">Thông báo và hoạt động</h1>
            <p style={{ fontSize: 13 }} className="text-muted-foreground mt-1">
              Dữ liệu được đọc từ nhật ký máy chủ của bệnh nhân.
            </p>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center gap-2 p-8 text-muted-foreground">
          <Loader2 size={20} className="animate-spin" />
          <span>Đang tải dữ liệu…</span>
        </div>
      ) : null}

      {hasError && !isLoading ? (
        <div className="mx-4 mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-center">
          <p className="text-red-700">Không tải được thông báo từ máy chủ.</p>
          <button type="button" onClick={onRetry} className="mt-3 inline-flex items-center gap-2 text-red-700 underline">
            <RefreshCw size={15} /> Thử lại
          </button>
        </div>
      ) : null}

      {!isLoading && !hasError ? (
        <div className="flex flex-col gap-3 px-4 mt-4">
          {newestFirst.map((activity) => (
            <article key={activity.id} className="rounded-xl border border-border bg-card p-4">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                  <ActivityIcon type={activity.activity_type} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <p style={{ fontSize: 14 }} className="text-foreground">{activity.title}</p>
                    <time style={{ fontSize: 12 }} className="text-muted-foreground" dateTime={activity.occurred_at}>
                      {timeFormatter.format(new Date(activity.occurred_at))}
                    </time>
                  </div>
                  <p style={{ fontSize: 13 }} className="text-foreground/80 leading-relaxed">{activity.description}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : null}

      {!isLoading && !hasError && activities.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 mt-16 px-6 text-center">
          <Bell size={48} className="text-muted-foreground" />
          <p style={{ fontSize: 15 }} className="text-muted-foreground">Chưa có hoạt động nào được ghi nhận hôm nay.</p>
        </div>
      ) : null}
    </div>
  );
}
