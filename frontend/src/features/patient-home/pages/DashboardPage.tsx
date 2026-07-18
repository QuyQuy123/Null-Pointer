import { FeaturePlaceholder } from '../../../shared/ui/FeaturePlaceholder'

export function DashboardPage() {
  return (
    <FeaturePlaceholder
      eyebrow="Trang chủ bệnh nhân"
      title="Hành trình hôm nay"
      description="Khung dự án đã sẵn sàng nhận dữ liệu từ backend. Có thể mở hệ thống mô phỏng để xem trạng thái phòng, hàng chờ và luồng bệnh nhân thay đổi theo thời gian."
      status="ready"
      actions={[
        { label: 'Mở hệ thống mô phỏng', to: '/demo/simulation' },
        { label: 'Xem chỉ định mới', to: '/routing/prescription' },
        { label: 'Mở bản đồ', to: '/map' },
      ]}
    />
  )
}
