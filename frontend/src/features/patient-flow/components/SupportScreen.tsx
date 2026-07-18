import { Phone, MapPin, Accessibility, MessageSquare, ChevronRight, HeadphonesIcon } from "lucide-react";
import { useState } from "react";
import {
  createSupportRequest,
  type SupportType,
} from "../api/patient-flow-api";

interface SupportScreenProps {
  onCallStaff: () => void;
}

const supportPoints = [
  { name: "Quầy thông tin chính", location: "Tầng 1, sảnh chính", distance: "180 m", open: true },
  { name: "Điểm hỗ trợ tầng 2", location: "Tầng 2, gần thang máy", distance: "45 m", open: true },
  { name: "Quầy tiếp nhận Tim mạch", location: "Tầng 2, khu A", distance: "90 m", open: true },
];

export function SupportScreen({ onCallStaff }: SupportScreenProps) {
  const [isRequesting, setIsRequesting] = useState(false);
  const [requestMessage, setRequestMessage] = useState<string | null>(null);

  async function handleSupportRequest(type: SupportType) {
    setIsRequesting(true);
    setRequestMessage(null);
    try {
      const response = await createSupportRequest(type);
      setRequestMessage(
        `Đã tạo yêu cầu ${response.id.slice(0, 8)}. Nhân viên dự kiến phản hồi trong ${response.estimated_response_minutes_min}–${response.estimated_response_minutes_max} phút.`,
      );
      if (type === "staff") onCallStaff();
    } catch {
      setRequestMessage("Không thể gửi yêu cầu. Hãy gọi 1900 1234 để được hỗ trợ ngay.");
    } finally {
      setIsRequesting(false);
    }
  }

  return (
    <div className="flex flex-col min-h-full bg-background pb-24">
      {/* Header */}
      <div className="bg-card border-b border-border px-4 pt-12 pb-4">
        <h1 style={{ fontSize: 20 }} className="text-foreground mb-1">Hỗ trợ</h1>
        <p style={{ fontSize: 14 }} className="text-muted-foreground">Luôn có người sẵn sàng giúp bạn</p>
      </div>

      {/* Emergency support */}
      <div className="mx-4 mt-4 bg-primary rounded-xl p-5">
        <p style={{ fontSize: 13 }} className="text-primary-foreground/80 mb-2">Cần giúp đỡ ngay?</p>
        <button
          onClick={() => handleSupportRequest("staff")}
          disabled={isRequesting}
          className="w-full py-4 rounded-xl bg-white text-primary flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
          style={{ fontSize: 17, minHeight: 56 }}
        >
          <HeadphonesIcon size={20} />
          {isRequesting ? "Đang gửi yêu cầu..." : "Gọi nhân viên hỗ trợ"}
        </button>
        <p style={{ fontSize: 12 }} className="text-primary-foreground/70 text-center mt-2">
          Nhân viên sẽ đến gặp bạn trong vòng 3–5 phút
        </p>
        {requestMessage && (
          <p style={{ fontSize: 12 }} className="text-primary-foreground bg-white/10 rounded-lg p-2 mt-3">
            {requestMessage}
          </p>
        )}
      </div>

      {/* Accessibility */}
      <div className="mx-4 mt-4 bg-card rounded-xl border border-border overflow-hidden">
        <div className="px-4 py-3 border-b border-border flex items-center gap-2">
          <Accessibility size={16} className="text-primary" />
          <p style={{ fontSize: 14 }} className="text-foreground">Nhu cầu hỗ trợ di chuyển</p>
        </div>
        <div className="p-4 flex flex-col gap-3">
          {[
            { label: "Hỗ trợ xe lăn", desc: "Nhân viên sẽ đưa xe lăn và đi cùng bạn", type: "wheelchair" as const },
            { label: "Lối đi có thang máy", desc: "Mọi tuyến đường trong hành trình đều qua thang máy", type: "directions" as const },
            { label: "Hỗ trợ thị giác", desc: "Hướng dẫn bằng âm thanh và bản in chữ lớn", type: "visual_assistance" as const },
          ].map((item, idx) => (
            <button
              key={idx}
              onClick={() => handleSupportRequest(item.type)}
              disabled={isRequesting}
              className="flex items-center gap-3 py-2 text-left w-full"
              style={{ minHeight: 48 }}
            >
              <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                <Accessibility size={15} className="text-primary" />
              </div>
              <div className="flex-1">
                <p style={{ fontSize: 14 }} className="text-foreground">{item.label}</p>
                <p style={{ fontSize: 12 }} className="text-muted-foreground">{item.desc}</p>
              </div>
              <ChevronRight size={16} className="text-muted-foreground" />
            </button>
          ))}
        </div>
      </div>

      {/* Support points */}
      <div className="mx-4 mt-4 bg-card rounded-xl border border-border overflow-hidden">
        <div className="px-4 py-3 border-b border-border flex items-center gap-2">
          <MapPin size={16} className="text-primary" />
          <p style={{ fontSize: 14 }} className="text-foreground">Điểm hỗ trợ gần nhất</p>
        </div>
        <div className="flex flex-col divide-y divide-border">
          {supportPoints.map((pt, idx) => (
            <div key={idx} className="px-4 py-3 flex items-center gap-3">
              <div className="flex-1">
                <p style={{ fontSize: 14 }} className="text-foreground">{pt.name}</p>
                <p style={{ fontSize: 12 }} className="text-muted-foreground">{pt.location}</p>
              </div>
              <div className="text-right">
                <p style={{ fontSize: 13 }} className="text-primary">{pt.distance}</p>
                {pt.open && (
                  <p style={{ fontSize: 11 }} className="text-emerald-600">Đang mở</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Other channels */}
      <div className="mx-4 mt-4 bg-card rounded-xl border border-border overflow-hidden">
        <div className="px-4 py-3 border-b border-border">
          <p style={{ fontSize: 14 }} className="text-foreground">Kênh hỗ trợ khác</p>
        </div>
        <div className="flex flex-col divide-y divide-border">
          {[
            { icon: <Phone size={16} />, label: "Gọi điện", desc: "1900 1234 — Miễn phí" },
            { icon: <MessageSquare size={16} />, label: "Nhắn tin SMS", desc: "Gửi mã lượt khám đến 8088" },
          ].map((item, idx) => (
            <button
              key={idx}
              onClick={() => {
                window.location.href = idx === 0 ? "tel:19001234" : "sms:8088?body=TM-2026-00847";
              }}
              className="px-4 py-3 flex items-center gap-3 text-left w-full active:bg-muted transition-colors"
              style={{ minHeight: 56 }}
            >
              <div className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0 text-primary">
                {item.icon}
              </div>
              <div className="flex-1">
                <p style={{ fontSize: 14 }} className="text-foreground">{item.label}</p>
                <p style={{ fontSize: 12 }} className="text-muted-foreground">{item.desc}</p>
              </div>
              <ChevronRight size={16} className="text-muted-foreground" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
