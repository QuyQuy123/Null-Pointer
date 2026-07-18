import { useState } from "react";
import { ArrowLeft, Navigation, Accessibility, MapPin, ChevronRight, Layers, CheckCircle2 } from "lucide-react";
import { ServiceCompletionDialog } from "./ServiceCompletionDialog";

interface MapScreenProps {
  destination: string;
  floor: string;
  travelMinutes: number;
  onServiceCompleted: () => void;
  onBack: () => void;
}

type Floor = 1 | 2 | 3 | 4 | 5;

const floors: { id: Floor; label: string }[] = [
  { id: 1, label: "Tầng 1" },
  { id: 2, label: "Tầng 2" },
  { id: 3, label: "Tầng 3" },
  { id: 4, label: "Tầng 4" },
  { id: 5, label: "Tầng 5" },
];

function parseFloor(value: string): Floor {
  const parsed = Number(value.match(/\d+/)?.[0]);
  if (parsed >= 1 && parsed <= 5) return parsed as Floor;
  return 1;
}

/* ── SVG floor maps ── */
function FloorMap({ floor, showRoute, destination }: { floor: Floor; showRoute: boolean; destination: string }) {
  if (floor === 1) return (
    <svg width="100%" height="100%" viewBox="0 0 360 260" preserveAspectRatio="xMidYMid meet">
      {/* Background */}
      <rect width="360" height="260" fill="#F0F5F8" />

      {/* Outer walls */}
      <rect x="10" y="10" width="340" height="240" rx="6" fill="#E8EEF2" stroke="#C5D0D8" strokeWidth="2" />

      {/* Corridors */}
      <rect x="10" y="110" width="340" height="40" fill="#ffffff" opacity="0.7" />
      <rect x="160" y="10" width="40" height="240" fill="#ffffff" opacity="0.7" />

      {/* Rooms — left wing */}
      <rect x="20" y="20" width="130" height="80" rx="4" fill="#E0EEF0" stroke="#B0C8CC" strokeWidth="1" />
      <text x="85" y="55" textAnchor="middle" fill="#4B6B6E" fontSize="10" fontWeight="500">{destination}</text>
      <text x="85" y="70" textAnchor="middle" fill="#4B6B6E" fontSize="10">Tầng 1, khu A</text>

      <rect x="20" y="160" width="130" height="80" rx="4" fill="#EEF2F8" stroke="#C0C8D8" strokeWidth="1" />
      <text x="85" y="205" textAnchor="middle" fill="#6B7280" fontSize="11">Quầy tiếp nhận</text>

      {/* Rooms — right wing */}
      <rect x="210" y="20" width="130" height="80" rx="4" fill="#EEF2F8" stroke="#C0C8D8" strokeWidth="1" />
      <text x="275" y="55" textAnchor="middle" fill="#6B7280" fontSize="11">Xét nghiệm</text>
      <text x="275" y="70" textAnchor="middle" fill="#6B7280" fontSize="10">Khu B</text>

      <rect x="210" y="160" width="130" height="80" rx="4" fill="#EEF2F8" stroke="#C0C8D8" strokeWidth="1" />
      <text x="275" y="205" textAnchor="middle" fill="#6B7280" fontSize="11">Dược</text>

      {/* Elevator */}
      <rect x="148" y="18" width="24" height="24" rx="3" fill="#CCE8E8" stroke="#0B6E6E" strokeWidth="1.5" />
      <text x="160" y="34" textAnchor="middle" fill="#0B6E6E" fontSize="10" fontWeight="600">TM</text>

      {/* Route path */}
      {showRoute && (
        <>
          <circle cx="275" cy="200" r="9" fill="#6B7280" opacity="0.4" />
          <text x="275" y="224" textAnchor="middle" fill="#6B7280" fontSize="9">Bạn ở đây</text>

          <path
            d="M275 195 L275 130 L200 130 L200 115 L85 115 L85 100"
            stroke="#0B6E6E" strokeWidth="3" fill="none"
            strokeDasharray="7,4" strokeLinecap="round" strokeLinejoin="round"
          />

          {/* Destination pulse */}
          <circle cx="85" cy="60" r="14" fill="#0B6E6E" opacity="0.15" />
          <circle cx="85" cy="60" r="9" fill="#0B6E6E" />
          <text x="85" y="64" textAnchor="middle" fill="white" fontSize="10" fontWeight="700">●</text>
        </>
      )}

      {/* Start marker */}
      {showRoute && (
        <circle cx="275" cy="200" r="7" fill="#0B6E6E" opacity="0.5" />
      )}
    </svg>
  );

  if (floor === 2) return (
    <svg width="100%" height="100%" viewBox="0 0 360 260" preserveAspectRatio="xMidYMid meet">
      <rect width="360" height="260" fill="#F0F5F8" />
      <rect x="10" y="10" width="340" height="240" rx="6" fill="#E8EEF2" stroke="#C5D0D8" strokeWidth="2" />
      <rect x="10" y="110" width="340" height="40" fill="#ffffff" opacity="0.7" />
      <rect x="160" y="10" width="40" height="240" fill="#ffffff" opacity="0.7" />

      <rect x="20" y="20" width="130" height="80" rx="4" fill="#EEF2F8" stroke="#C0C8D8" strokeWidth="1" />
      <text x="85" y="60" textAnchor="middle" fill="#6B7280" fontSize="10">{destination}</text>
      <text x="85" y="74" textAnchor="middle" fill="#6B7280" fontSize="10">Khu A</text>

      <rect x="20" y="160" width="130" height="80" rx="4" fill="#EEF2F8" stroke="#C0C8D8" strokeWidth="1" />
      <text x="85" y="200" textAnchor="middle" fill="#6B7280" fontSize="11">Siêu âm 05</text>
      <text x="85" y="214" textAnchor="middle" fill="#6B7280" fontSize="10">Khu A</text>

      <rect x="210" y="20" width="130" height="80" rx="4" fill="#EEF2F8" stroke="#C0C8D8" strokeWidth="1" />
      <text x="275" y="60" textAnchor="middle" fill="#6B7280" fontSize="11">Phòng khám</text>
      <text x="275" y="74" textAnchor="middle" fill="#6B7280" fontSize="10">Tim mạch 205</text>

      <rect x="210" y="160" width="130" height="80" rx="4" fill="#EEF2F8" stroke="#C0C8D8" strokeWidth="1" />
      <text x="275" y="205" textAnchor="middle" fill="#6B7280" fontSize="11">X-quang khu B</text>

      <rect x="148" y="18" width="24" height="24" rx="3" fill="#CCE8E8" stroke="#0B6E6E" strokeWidth="1.5" />
      <text x="160" y="34" textAnchor="middle" fill="#0B6E6E" fontSize="10" fontWeight="600">TM</text>
    </svg>
  );

  return (
    <svg width="100%" height="100%" viewBox="0 0 360 260" preserveAspectRatio="xMidYMid meet">
      <rect width="360" height="260" fill="#F0F5F8" />
      <rect x="10" y="10" width="340" height="240" rx="6" fill="#E8EEF2" stroke="#C5D0D8" strokeWidth="2" />
      <text x="180" y="135" textAnchor="middle" fill="#4B6B6E" fontSize="12">{destination}</text>
    </svg>
  );
}
export function MapScreen({
  destination,
  floor,
  travelMinutes,
  onServiceCompleted,
  onBack,
}: MapScreenProps) {
  const destinationFloor = parseFloor(floor);
  const [activeFloor, setActiveFloor] = useState<Floor>(destinationFloor);
  const [showRoute, setShowRoute] = useState(true);
  const [directionsOpen, setDirectionsOpen] = useState(true);
  const [showCompletionConfirmation, setShowCompletionConfirmation] = useState(false);
  const directionSteps = [
    { step: 1, text: "Đi theo hành lang chính đến khu thang máy hoặc cầu thang gần nhất." },
    { step: 2, text: `Di chuyển đến ${floor} và đi theo biển chỉ dẫn của khoa.` },
    { step: 3, text: `Đến ${destination} và đối chiếu mã phòng trước khi nhận số thứ tự.` },
  ];

  return (
    <div className="flex flex-col min-h-full bg-background">
      {/* Header */}
      <div className="bg-primary text-primary-foreground pt-10 pb-0">
        <div className="flex items-center gap-2 px-3 pb-3">
          <button
            onClick={onBack}
            className="w-11 h-11 flex items-center justify-center rounded-xl bg-white/15 active:bg-white/25 transition-colors flex-shrink-0"
            aria-label="Quay lại"
          >
            <ArrowLeft size={22} strokeWidth={2.5} className="text-white" />
          </button>
          <div className="flex-1 min-w-0 pl-1">
            <p style={{ fontSize: 17 }} className="text-white">Bản đồ bệnh viện</p>
            <p style={{ fontSize: 13, opacity: 0.8 }} className="text-white">Đến: {destination} — {floor}</p>
          </div>
          <button
            onClick={() => setShowRoute((v) => !v)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-white transition-colors ${showRoute ? "bg-white/25" : "bg-white/10"}`}
            style={{ fontSize: 13 }}
          >
            <Navigation size={14} />
            Tuyến đi
          </button>
        </div>

        {/* Floor tabs */}
        <div className="flex px-4 gap-1">
          {floors.map((f) => (
            <button
              key={f.id}
              onClick={() => setActiveFloor(f.id)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-t-xl transition-colors flex-shrink-0`}
              style={{
                fontSize: 14,
                background: activeFloor === f.id ? "var(--background)" : "transparent",
                color: activeFloor === f.id ? "var(--primary)" : "rgba(255,255,255,0.65)",
              }}
            >
              <Layers size={14} />
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Map */}
      <div className="relative bg-slate-100" style={{ height: 280 }}>
        <FloorMap floor={activeFloor} showRoute={showRoute && activeFloor === destinationFloor} destination={destination} />

        {/* Legend */}
        <div className="absolute bottom-3 right-3 bg-white/90 backdrop-blur rounded-xl border border-border px-3 py-2 flex flex-col gap-1.5">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-primary" />
            <span style={{ fontSize: 11 }} className="text-foreground">Điểm đến</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-0.5 bg-primary" style={{ backgroundImage: "repeating-linear-gradient(90deg,#0B6E6E 0,#0B6E6E 7px,transparent 7px,transparent 11px)" }} />
            <span style={{ fontSize: 11 }} className="text-foreground">Tuyến đi</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded flex items-center justify-center bg-secondary border border-primary/30" style={{ fontSize: 9 }}>TM</div>
            <span style={{ fontSize: 11 }} className="text-foreground">Thang máy</span>
          </div>
        </div>
      </div>
      <p style={{ fontSize: 12 }} className="px-4 pt-2 text-center text-muted-foreground">
        Sơ đồ minh họa, chưa có định vị trong nhà theo thời gian thực.
      </p>

      {/* Destination info */}
      <div className="mx-4 mt-4 bg-card rounded-xl border border-border p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
            <MapPin size={18} className="text-primary" />
          </div>
          <div className="flex-1">
            <p style={{ fontSize: 16 }} className="text-foreground">{destination}</p>
            <p style={{ fontSize: 13 }} className="text-muted-foreground">{floor} · Di chuyển khoảng {travelMinutes} phút</p>
          </div>
          <div className="bg-secondary text-primary px-2.5 py-1 rounded-full flex-shrink-0">
            <span style={{ fontSize: 12 }}>Theo lộ trình đã chọn</span>
          </div>
        </div>
        <div className="flex items-center gap-2 mt-3 px-3 py-2 bg-secondary rounded-lg">
          <Accessibility size={14} className="text-primary flex-shrink-0" />
          <p style={{ fontSize: 13 }} className="text-primary">Cần lối tiếp cận hoặc xe lăn? Chọn “Không tìm thấy phòng” để gửi yêu cầu hỗ trợ.</p>
        </div>
      </div>

      {/* Directions accordion */}
      <div className="mx-4 mt-3 bg-card rounded-xl border border-border overflow-hidden">
        <button
          onClick={() => setDirectionsOpen((o) => !o)}
          className="w-full flex items-center gap-3 px-4 py-3.5 text-left"
          style={{ minHeight: 52 }}
        >
          <Navigation size={17} className="text-primary flex-shrink-0" />
          <p style={{ fontSize: 15 }} className="text-foreground flex-1">Hướng dẫn từng bước</p>
          <ChevronRight
            size={18}
            className={`text-muted-foreground transition-transform duration-200 ${directionsOpen ? "rotate-90" : ""}`}
          />
        </button>

        {directionsOpen && (
          <div className="border-t border-border px-4 py-3 flex flex-col gap-3">
            {directionSteps.map((d) => (
              <div key={d.step} className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white" style={{ fontSize: 12 }}>{d.step}</span>
                </div>
                <p style={{ fontSize: 14 }} className="text-foreground leading-relaxed">{d.text}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="px-4 mt-4 pb-8 flex flex-col gap-3">
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
