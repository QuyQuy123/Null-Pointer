import { CheckCircle2, FileText, House, Stethoscope } from "lucide-react";
import type { Route } from "../model/patient-flow.types";

interface CompletionScreenProps {
  route: Route;
  doctorName: string;
  onBackToDashboard: () => void;
}

export function CompletionScreen({
  route,
  doctorName,
  onBackToDashboard,
}: CompletionScreenProps) {
  const services = route.stepDetails.filter(
    (step) => step.serviceCode !== "doctor_return",
  );
  const doctorStep = route.stepDetails.find(
    (step) => step.serviceCode === "doctor_return",
  );
  return (
    <div className="flex flex-col min-h-full bg-background pb-8">
      {/* Header */}
      <div className="bg-emerald-600 text-white px-4 pt-12 pb-8 flex flex-col items-center">
        <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mb-3">
          <CheckCircle2 size={36} className="text-white" />
        </div>
        <h1 style={{ fontSize: 22 }} className="text-center mb-1">Đã hoàn tất hành trình hôm nay</h1>
        <p style={{ fontSize: 15, opacity: 0.9 }} className="text-center">
          Tiến độ đã được lưu trên máy chủ điều phối
        </p>
      </div>

      {/* Completed services */}
      <div className="mx-4 mt-4">
        <p style={{ fontSize: 13, letterSpacing: "0.05em" }} className="text-muted-foreground uppercase mb-2 pl-1">
          Dịch vụ đã hoàn tất
        </p>
        <div className="flex flex-col gap-2">
          {services.map((service) => (
            <div key={service.id} className="bg-card rounded-xl border border-border p-4 flex items-center gap-3">
              <CheckCircle2 size={22} className="text-emerald-500 flex-shrink-0" fill="#ecfdf5" />
              <div className="flex-1">
                <p style={{ fontSize: 15 }} className="text-foreground">{service.serviceName}</p>
                <p style={{ fontSize: 13 }} className="text-muted-foreground">Đã ghi nhận hoàn thành tại {service.roomName}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Kết thúc lượt khám */}
      <div className="mx-4 mt-4 bg-primary/10 border border-primary/30 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <Stethoscope size={20} className="text-primary flex-shrink-0 mt-0.5" />
          <div>
            <p style={{ fontSize: 15 }} className="text-foreground mb-1">
              Đã hoàn tất bước quay lại bác sĩ
            </p>
            <p style={{ fontSize: 13 }} className="text-muted-foreground mb-1">
              {doctorName}{doctorStep ? ` · ${doctorStep.roomName} · ${doctorStep.floor}` : ""}
            </p>
          </div>
        </div>
      </div>

      {/* Result note */}
      <div className="mx-4 mt-3 bg-card rounded-xl border border-border p-4 flex items-start gap-3">
        <FileText size={18} className="text-muted-foreground flex-shrink-0 mt-0.5" />
        <p style={{ fontSize: 13 }} className="text-muted-foreground">
          Trạng thái này phản ánh tiến độ hành trình do người dùng xác nhận. Hệ thống chưa nhận nội dung kết quả chuyên môn từ LIS/RIS/PACS.
        </p>
      </div>

      {/* Action */}
      <div className="px-4 mt-4 flex flex-col gap-3">
        <button
          type="button"
          onClick={onBackToDashboard}
          className="w-full py-4 rounded-xl border border-border bg-card text-foreground flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
          style={{ fontSize: 17, minHeight: 56 }}
        >
          <House size={20} />
          Quay lại màn hình chính
        </button>
      </div>
    </div>
  );
}
