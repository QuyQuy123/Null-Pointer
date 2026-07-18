import { AlertCircle, X, ChevronRight, Shield } from "lucide-react";

interface RouteChangeProposalProps {
  onAccept: () => void;
  onDecline: () => void;
  onRequestSupport: () => void;
}

export function RouteChangeProposal({ onAccept, onDecline, onRequestSupport }: RouteChangeProposalProps) {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex flex-col justify-end" style={{ maxWidth: 430, margin: "0 auto" }}>
      <div className="bg-card rounded-t-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
        {/* Alert header */}
        <div className="bg-amber-500 px-4 py-4 flex items-start gap-3">
          <AlertCircle size={22} className="text-white flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p style={{ fontSize: 16 }} className="text-white">Đề nghị đổi lộ trình</p>
            <p style={{ fontSize: 13, opacity: 0.9 }} className="text-white mt-0.5">Điều phối viên đã phê duyệt</p>
          </div>
          <button onClick={onDecline} className="p-1.5 bg-white/20 rounded-full">
            <X size={16} className="text-white" />
          </button>
        </div>

        <div className="p-5">
          {/* What happened */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4">
            <p style={{ fontSize: 14 }} className="text-amber-900">
              Máy X-quang tại X-quang 03 đang tạm dừng để bảo trì khẩn cấp. Hệ thống đã giữ chỗ tại phòng thay thế.
            </p>
          </div>

          {/* Comparison */}
          <div className="mb-4">
            <p style={{ fontSize: 12, letterSpacing: "0.05em" }} className="text-muted-foreground uppercase mb-3">So sánh thay đổi</p>

            <div className="grid grid-cols-3 gap-3 bg-muted rounded-xl p-3" style={{ fontSize: 14 }}>
              <div style={{ fontSize: 12 }} className="text-muted-foreground">Nội dung</div>
              <div style={{ fontSize: 12 }} className="text-muted-foreground text-center">Lộ trình cũ</div>
              <div style={{ fontSize: 12 }} className="text-primary text-center">Lộ trình mới</div>

              <div className="py-1.5 border-t border-border col-span-3" />

              <div>Phòng X-quang</div>
              <div className="text-center text-muted-foreground line-through">X-quang 03</div>
              <div className="text-center text-primary">X-quang 04</div>

              <div>Tầng</div>
              <div className="text-center text-muted-foreground line-through">Tầng 2, khu A</div>
              <div className="text-center text-primary">Tầng 2, khu B</div>

              <div>Hoàn tất</div>
              <div className="text-center text-muted-foreground line-through">11:05–11:20</div>
              <div className="text-center text-emerald-600">10:47–11:02</div>
            </div>
          </div>

          {/* Benefit */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 mb-4 flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
              <Shield size={15} className="text-emerald-600" />
            </div>
            <div>
              <p style={{ fontSize: 14 }} className="text-emerald-800">
                Nếu chuyển phòng, bạn dự kiến hoàn tất sớm hơn <strong>18–25 phút</strong>.
              </p>
              <p style={{ fontSize: 12 }} className="text-emerald-700 mt-1">
                Chỗ tại X-quang 03 vẫn được giữ cho đến khi bạn quyết định.
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-2">
            <button
              onClick={onAccept}
              className="w-full py-4 rounded-xl bg-primary text-primary-foreground flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
              style={{ fontSize: 16, minHeight: 52 }}
            >
              Đồng ý đổi phòng
              <ChevronRight size={18} />
            </button>
            <button
              onClick={onDecline}
              className="w-full py-3.5 rounded-xl border border-border bg-card text-foreground text-center"
              style={{ fontSize: 15, minHeight: 48 }}
            >
              Giữ lộ trình hiện tại
            </button>
            <button
              onClick={onRequestSupport}
              className="w-full py-2.5 text-muted-foreground text-center"
              style={{ fontSize: 14 }}
            >
              Nhờ hỗ trợ
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
