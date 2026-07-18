import { Bell, AlertCircle, CheckCircle2, Clock, Info } from "lucide-react";

interface Notification {
  id: string;
  type: "alert" | "success" | "info" | "reminder";
  title: string;
  body: string;
  time: string;
  read: boolean;
}

const notifications: Notification[] = [
  {
    id: "1",
    type: "alert",
    title: "Máy X-quang tạm dừng",
    body: "Máy X-quang tại phòng hiện tại đang tạm dừng. Hệ thống đã giữ chỗ tại X-quang 03. Nếu chuyển, bạn hoàn tất sớm hơn 18–25 phút.",
    time: "10:18",
    read: false,
  },
  {
    id: "2",
    type: "reminder",
    title: "Gần đến lượt",
    body: "Còn khoảng 5–8 phút nữa đến lượt bạn tại X-quang 03. Vui lòng ở lại khu chờ.",
    time: "10:15",
    read: false,
  },
  {
    id: "3",
    type: "success",
    title: "Đã lấy máu thành công",
    body: "Mẫu đang được xử lý. Dự kiến kết quả sẵn sàng lúc 10:45–11:00.",
    time: "10:10",
    read: true,
  },
  {
    id: "4",
    type: "info",
    title: "Lộ trình đã được xác nhận",
    body: "Bạn đã vào hàng chờ tại 3 phòng theo lộ trình Khuyến nghị.",
    time: "10:05",
    read: true,
  },
];

const icons: Record<string, React.ReactNode> = {
  alert: <AlertCircle size={18} className="text-amber-600" />,
  success: <CheckCircle2 size={18} className="text-emerald-600" />,
  info: <Info size={18} className="text-primary" />,
  reminder: <Clock size={18} className="text-violet-600" />,
};

const bgColors: Record<string, string> = {
  alert: "bg-amber-50 border-amber-200",
  success: "bg-emerald-50 border-emerald-200",
  info: "bg-secondary border-primary/20",
  reminder: "bg-violet-50 border-violet-200",
};

export function NotificationsScreen() {
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="flex flex-col min-h-full bg-background pb-24">
      {/* Header */}
      <div className="bg-card border-b border-border px-4 pt-12 pb-4">
        <div className="flex items-center justify-between">
          <h1 style={{ fontSize: 20 }} className="text-foreground">Thông báo</h1>
          {unreadCount > 0 && (
            <span className="bg-primary text-primary-foreground px-2.5 py-0.5 rounded-full" style={{ fontSize: 13 }}>
              {unreadCount} mới
            </span>
          )}
        </div>
      </div>

      {/* List */}
      <div className="flex flex-col gap-3 px-4 mt-4">
        {notifications.map((notif) => (
          <div
            key={notif.id}
            className={`rounded-xl border p-4 ${bgColors[notif.type]} ${!notif.read ? "shadow-sm" : "opacity-80"}`}
          >
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-white/70 flex items-center justify-center flex-shrink-0 mt-0.5">
                {icons[notif.type]}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <p style={{ fontSize: 14 }} className="text-foreground">{notif.title}</p>
                  <span style={{ fontSize: 12 }} className="text-muted-foreground flex-shrink-0">{notif.time}</span>
                </div>
                <p style={{ fontSize: 13 }} className="text-foreground/80 leading-relaxed">{notif.body}</p>
              </div>
            </div>
            {!notif.read && (
              <div className="flex justify-end mt-2">
                <div className="w-2 h-2 rounded-full bg-primary" />
              </div>
            )}
          </div>
        ))}
      </div>

      {notifications.length === 0 && (
        <div className="flex flex-col items-center justify-center flex-1 gap-3 mt-16">
          <Bell size={48} className="text-muted" />
          <p style={{ fontSize: 15 }} className="text-muted-foreground">Chưa có thông báo</p>
        </div>
      )}
    </div>
  );
}
