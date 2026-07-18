import { Stethoscope, Clock, AlertCircle, ChevronRight, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { AppHeader } from "./AppHeader";

interface NewPrescriptionScreenProps {
  onBack?: () => void;
  onContinue: () => void;
}

const services = [
  {
    id: 1,
    name: "Xét nghiệm máu",
    icon: "🩸",
    note: "Cần nhịn ăn ít nhất 4 giờ trước",
    mustDoFirst: true,
  },
  {
    id: 2,
    name: "Chụp X-quang ngực",
    icon: "🫁",
    note: "Không có điều kiện đặc biệt",
    mustDoFirst: false,
  },
  {
    id: 3,
    name: "Siêu âm bụng",
    icon: "🔊",
    note: "Tiếp tục nhịn ăn trong suốt hành trình",
    mustDoFirst: false,
  },
];

export function NewPrescriptionScreen({ onBack, onContinue }: NewPrescriptionScreenProps) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setIsLoading(false), 2000);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="flex flex-col min-h-full bg-background">
      <AppHeader
        title="Chỉ định mới"
        subtitle="Bước 1/4"
        progress={{ current: 1, total: 4 }}
        onBack={onBack}
        onForward={isLoading ? undefined : onContinue}
        forwardLabel="Tiếp tục"
      />

      <div className="flex flex-col gap-3 px-4 pt-4 pb-6">
        {/* Doctor info */}
        <div className="bg-card rounded-xl border border-border p-4 flex items-center gap-3">
          <div className="w-11 h-11 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
            <Stethoscope size={20} className="text-primary" />
          </div>
          <div>
            <p style={{ fontSize: 13 }} className="text-muted-foreground">Bác sĩ chỉ định</p>
            <p style={{ fontSize: 15 }} className="text-foreground">BS. Trần Văn Hùng</p>
            <p style={{ fontSize: 13 }} className="text-muted-foreground">Khoa Tim mạch — Phòng 205</p>
          </div>
        </div>

        {/* Patient info */}
        <div className="bg-card rounded-xl border border-border px-4 py-3 flex justify-between items-center">
          <div>
            <p style={{ fontSize: 13 }} className="text-muted-foreground">Bệnh nhân</p>
            <p style={{ fontSize: 15 }} className="text-foreground">Nguyễn Thị Mai</p>
            <p style={{ fontSize: 13 }} className="text-muted-foreground">Mã lượt khám: TM-2026-00847</p>
          </div>
          <div className="text-right">
            <p style={{ fontSize: 13 }} className="text-muted-foreground">Ký lúc</p>
            <p style={{ fontSize: 15 }} className="text-foreground">10:00</p>
          </div>
        </div>

        {/* Services */}
        <div>
          <p style={{ fontSize: 12, letterSpacing: "0.06em" }} className="text-muted-foreground uppercase mb-2 pl-1">
            3 dịch vụ cần thực hiện
          </p>
          <div className="flex flex-col gap-2">
            {services.map((svc, idx) => (
              <div key={svc.id} className="bg-card rounded-xl border border-border p-4">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0 text-lg">
                    {svc.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p style={{ fontSize: 15 }} className="text-foreground">{svc.name}</p>
                      {svc.mustDoFirst && (
                        <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full" style={{ fontSize: 11 }}>
                          Làm trước
                        </span>
                      )}
                    </div>
                    <p style={{ fontSize: 13 }} className="text-muted-foreground mt-0.5">{svc.note}</p>
                  </div>
                  <span className="w-6 h-6 rounded-full border-2 border-border flex items-center justify-center flex-shrink-0" style={{ fontSize: 12, color: "#9CA3AF" }}>
                    {idx + 1}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Preparation note */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3">
          <AlertCircle size={18} className="text-amber-600 flex-shrink-0 mt-0.5" />
          <p style={{ fontSize: 14 }} className="text-amber-900">
            Bạn cần nhịn ăn ít nhất 4 giờ trước khi lấy máu và trong suốt hành trình siêu âm.
          </p>
        </div>

        {/* System status */}
        <div className="bg-card rounded-xl border border-border p-4">
          <div className="flex items-center gap-2">
            {isLoading ? (
              <Loader2 size={16} className="text-primary animate-spin" />
            ) : (
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
            )}
            <p style={{ fontSize: 13 }} className="text-foreground">
              {isLoading
                ? "Hệ thống đang kiểm tra điều kiện và tìm lộ trình phù hợp..."
                : "Đã tìm thấy 3 phương án phù hợp với chỉ định của bạn"}
            </p>
          </div>
        </div>

        {/* Actions */}
        <button
          onClick={onContinue}
          disabled={isLoading}
          className={`w-full py-4 rounded-xl flex items-center justify-center gap-2 transition-all ${
            isLoading
              ? "bg-muted text-muted-foreground cursor-not-allowed"
              : "bg-primary text-primary-foreground active:scale-[0.98]"
          }`}
          style={{ fontSize: 17, minHeight: 56 }}
        >
          {isLoading ? "Đang chuẩn bị..." : "Chọn điều tôi ưu tiên"}
          {!isLoading && <ChevronRight size={20} />}
        </button>

      </div>
    </div>
  );
}
