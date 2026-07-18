import { CheckCircle2, Navigation, FileText, Clock } from "lucide-react";
import type { Route } from "../model/patient-flow.types";

interface CompletionScreenProps {
  route?: Route;
  doctorName?: string;
  doctorRoomCode?: string;
  onShowDirections: () => void;
}

const completedServices = [
  { name: "Xét nghiệm máu", readyAt: "10:52", status: "Sẵn sàng cho bác sĩ" },
  { name: "Chụp X-quang ngực", readyAt: "11:08", status: "Sẵn sàng cho bác sĩ" },
  { name: "Siêu âm bụng", readyAt: "11:22", status: "Sẵn sàng cho bác sĩ" },
];

export function CompletionScreen({
  route,
  doctorName = "BS. Trần Văn Hùng",
  doctorRoomCode = "205",
  onShowDirections,
}: CompletionScreenProps) {
  const services = route
    ? route.stepDetails
        .filter((step) => step.serviceCode !== "doctor_return")
        .map((step) => ({
          name: step.serviceName,
          readyAt: "Vừa xong",
          status: "Sẵn sàng cho bác sĩ",
        }))
    : completedServices;
  const doctorStep = route?.stepDetails.find(
    (step) => step.serviceCode === "doctor_return",
  );
  const returnRoom = doctorStep?.roomName ?? `Phòng khám ${doctorRoomCode}`;
  const returnFloor = doctorStep?.floor ?? "Tầng đang khám";
  return (
    <div className="flex flex-col min-h-full bg-background pb-24">
      {/* Header */}
      <div className="bg-emerald-600 text-white px-4 pt-12 pb-8 flex flex-col items-center">
        <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mb-3">
          <CheckCircle2 size={36} className="text-white" />
        </div>
        <h1 style={{ fontSize: 22 }} className="text-center mb-1">Đã hoàn tất xét nghiệm</h1>
        <p style={{ fontSize: 15, opacity: 0.9 }} className="text-center">
          Tất cả kết quả đã sẵn sàng cho bác sĩ
        </p>
      </div>

      {/* Completed services */}
      <div className="mx-4 mt-4">
        <p style={{ fontSize: 13, letterSpacing: "0.05em" }} className="text-muted-foreground uppercase mb-2 pl-1">
          Dịch vụ đã hoàn tất
        </p>
        <div className="flex flex-col gap-2">
          {services.map((svc, idx) => (
            <div key={idx} className="bg-card rounded-xl border border-border p-4 flex items-center gap-3">
              <CheckCircle2 size={22} className="text-emerald-500 flex-shrink-0" fill="#ecfdf5" />
              <div className="flex-1">
                <p style={{ fontSize: 15 }} className="text-foreground">{svc.name}</p>
                <p style={{ fontSize: 13 }} className="text-muted-foreground">{svc.status}</p>
              </div>
              <div className="text-right">
                <p style={{ fontSize: 12 }} className="text-muted-foreground">Sẵn sàng lúc</p>
                <p style={{ fontSize: 14 }} className="text-foreground">{svc.readyAt}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Return instruction */}
      <div className="mx-4 mt-4 bg-primary/10 border border-primary/30 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <Navigation size={20} className="text-primary flex-shrink-0 mt-0.5" />
          <div>
            <p style={{ fontSize: 15 }} className="text-foreground mb-1">
              Quay lại {returnRoom}
            </p>
            <p style={{ fontSize: 13 }} className="text-muted-foreground mb-1">{returnFloor} — {doctorName}</p>
            <div className="flex items-center gap-1.5 mt-2">
              <Clock size={13} className="text-muted-foreground" />
              <p style={{ fontSize: 13 }} className="text-muted-foreground">
                Hệ thống sẽ cập nhật thời điểm bác sĩ có thể tiếp nhận
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Result note */}
      <div className="mx-4 mt-3 bg-card rounded-xl border border-border p-4 flex items-start gap-3">
        <FileText size={18} className="text-muted-foreground flex-shrink-0 mt-0.5" />
        <p style={{ fontSize: 13 }} className="text-muted-foreground">
          Bác sĩ đã nhận được toàn bộ kết quả cần thiết. Bạn không cần mang theo giấy tờ — hệ thống đã gửi trực tiếp.
        </p>
      </div>

      {/* Action */}
      <div className="px-4 mt-4">
        <button
          onClick={onShowDirections}
          className="w-full py-4 rounded-xl bg-primary text-primary-foreground flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
          style={{ fontSize: 17, minHeight: 56 }}
        >
          <Navigation size={20} />
          Chỉ đường quay lại phòng khám
        </button>
      </div>
    </div>
  );
}
