import { useState } from "react";
import { Navigation, MapPin, Accessibility, CheckCircle2 } from "lucide-react";
import { AppHeader } from "./AppHeader";
import { ServiceCompletionDialog } from "./ServiceCompletionDialog";

interface DirectionsScreenProps {
  origin: string;
  destination: string;
  roomCode?: string;
  floor: string;
  distance: string;
  onServiceCompleted: () => void;
  onBack: () => void;
}

export function DirectionsScreen({ origin, destination, roomCode, floor, distance, onServiceCompleted, onBack }: DirectionsScreenProps) {
  const [showCompletionConfirmation, setShowCompletionConfirmation] = useState(false);
  const directionSteps = [
    `Rời ${origin} và đi theo hành lang chính đến khu thang máy hoặc cầu thang gần nhất.`,
    `Di chuyển đến ${floor} và kiểm tra biển chỉ dẫn của khoa.`,
    `Đi theo biển hướng dẫn đến ${destination}.`,
    `Đối chiếu mã phòng ${roomCode ?? destination} trước khi thực hiện dịch vụ.`,
  ];
  return (
    <div className="flex flex-col min-h-full bg-background pb-6">
      <AppHeader
        title={`Đến ${destination}`}
        subtitle={`Từ ${origin} · ${floor} · ${distance}`}
        onBack={onBack}
        onForward={() => setShowCompletionConfirmation(true)}
        forwardLabel="Tôi đã khám xong"
      />

      <div className="flex flex-col gap-3 px-4 pt-4">
        {/* Sơ đồ minh họa */}
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
            <text x="55" y="148" fill="#0B6E6E" fontSize="11" fontWeight="600">{origin}</text>
            {/* Destination */}
            <circle cx="300" cy="90" r="10" fill="#DC2626" />
            <text x="255" y="78" fill="#DC2626" fontSize="11" fontWeight="600">{destination}</text>
          </svg>
        </div>
        <p style={{ fontSize: 12 }} className="text-muted-foreground text-center">
          Sơ đồ minh họa, chưa phải bản đồ định vị trong nhà theo thời gian thực.
        </p>

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
            <p style={{ fontSize: 13 }} className="text-primary">Kiểm tra biển chỉ dẫn thang máy; gửi yêu cầu hỗ trợ nếu cần xe lăn</p>
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

        {/* Actions */}
        <button
          type="button"
          onClick={() => setShowCompletionConfirmation(true)}
          className="w-full py-4 rounded-xl bg-primary text-primary-foreground flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
          style={{ fontSize: 17, minHeight: 56 }}
        >
          <CheckCircle2 size={20} />
          Tôi đã khám xong
        </button>
      </div>

      {showCompletionConfirmation && (
        <ServiceCompletionDialog
          destination={destination}
          onCancel={() => setShowCompletionConfirmation(false)}
          onConfirm={() => {
            setShowCompletionConfirmation(false);
            onServiceCompleted();
          }}
        />
      )}
    </div>
  );
}
