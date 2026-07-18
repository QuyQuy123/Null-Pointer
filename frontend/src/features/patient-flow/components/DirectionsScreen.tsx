import { Navigation, QrCode, MapPin, Accessibility, HeadphonesIcon } from "lucide-react";
import { AppHeader } from "./AppHeader";

interface DirectionsScreenProps {
  destination: string;
  floor: string;
  distance: string;
  onArrived: () => void;
  onNotFound: () => void;
  onBack: () => void;
}

const directionSteps = [
  "Từ vị trí hiện tại, đi thẳng theo hành lang chính về phía cầu thang.",
  "Lên cầu thang hoặc thang máy đến tầng 2 (thang máy ở cuối hành lang bên phải).",
  "Ra khỏi thang máy, rẽ trái và đi theo biển chỉ dẫn \"Khu X-quang\".",
  "Phòng X-quang 03 ở bên tay phải, cách thang máy khoảng 60 mét.",
];

export function DirectionsScreen({ destination, floor, distance, onArrived, onNotFound, onBack }: DirectionsScreenProps) {
  return (
    <div className="flex flex-col min-h-full bg-background pb-6">
      <AppHeader
        title={`Đến ${destination}`}
        subtitle={`${floor} · ${distance}`}
        onBack={onBack}
        onForward={onArrived}
        forwardLabel="Đã đến"
      />

      <div className="flex flex-col gap-3 px-4 pt-4">
        {/* Map */}
        <div className="bg-card rounded-xl border border-border overflow-hidden" style={{ height: 200 }}>
          <svg width="100%" height="100%">
            <rect width="100%" height="100%" fill="#F0F5F8" />
            <defs>
              <pattern id="grid2" width="30" height="30" patternUnits="userSpaceOnUse">
                <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#0B6E6E" strokeWidth="0.4" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid2)" />
            {/* Corridors */}
            <rect x="0" y="130" width="200" height="40" fill="#E0EEF0" stroke="#CCE8E8" />
            <rect x="100" y="30" width="40" height="140" fill="#E0EEF0" stroke="#CCE8E8" />
            <rect x="200" y="70" width="200" height="40" fill="#E0EEF0" stroke="#CCE8E8" />
            {/* Path */}
            <path d="M 40 155 L 120 155 L 120 90 L 300 90" stroke="#0B6E6E" strokeWidth="3" fill="none" strokeDasharray="8,4" strokeLinecap="round" />
            {/* Start */}
            <circle cx="40" cy="155" r="10" fill="#0B6E6E" />
            <text x="55" y="148" fill="#0B6E6E" fontSize="11" fontWeight="600">Bạn đang ở đây</text>
            {/* Destination */}
            <circle cx="300" cy="90" r="10" fill="#DC2626" />
            <text x="255" y="78" fill="#DC2626" fontSize="11" fontWeight="600">{destination}</text>
          </svg>
        </div>

        {/* Location card */}
        <div className="bg-card rounded-xl border border-border p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <MapPin size={18} className="text-primary" />
            </div>
            <div>
              <p style={{ fontSize: 16 }} className="text-foreground">{destination}</p>
              <p style={{ fontSize: 13 }} className="text-muted-foreground">{floor} · {distance}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 px-3 py-2 bg-secondary rounded-lg">
            <Accessibility size={15} className="text-primary" />
            <p style={{ fontSize: 13 }} className="text-primary">Có thang máy và lối đi cho xe lăn</p>
          </div>
        </div>

        {/* Step-by-step */}
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="px-4 py-3 border-b border-border flex items-center gap-2">
            <Navigation size={15} className="text-primary" />
            <p style={{ fontSize: 14 }} className="text-foreground">Hướng dẫn từng bước</p>
          </div>
          <div className="p-4 flex flex-col gap-3">
            {directionSteps.map((step, idx) => (
              <div key={idx} className="flex gap-3">
                <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white" style={{ fontSize: 13 }}>{idx + 1}</span>
                </div>
                <p style={{ fontSize: 14 }} className="text-foreground leading-relaxed flex-1">{step}</p>
              </div>
            ))}
          </div>
        </div>

        {/* QR */}
        <div className="bg-card rounded-xl border border-border p-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
            <QrCode size={20} className="text-muted-foreground" />
          </div>
          <p style={{ fontSize: 14 }} className="text-foreground">Quét mã QR tại phòng để xác nhận đã đến đúng nơi</p>
        </div>

        {/* Support */}
        <div className="bg-card rounded-xl border border-border p-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
            <HeadphonesIcon size={18} className="text-muted-foreground" />
          </div>
          <div>
            <p style={{ fontSize: 14 }} className="text-foreground">Điểm hỗ trợ gần nhất</p>
            <p style={{ fontSize: 13 }} className="text-muted-foreground">Quầy thông tin — tầng 2, gần thang máy</p>
          </div>
        </div>

        {/* Actions */}
        <button
          onClick={onArrived}
          className="w-full py-4 rounded-xl bg-primary text-primary-foreground flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
          style={{ fontSize: 17, minHeight: 56 }}
        >
          Tôi đã đến
        </button>
        <button
          onClick={onNotFound}
          className="w-full py-3 rounded-xl border border-border bg-card text-foreground text-center"
          style={{ fontSize: 15, minHeight: 48 }}
        >
          Không tìm thấy phòng
        </button>
      </div>
    </div>
  );
}
