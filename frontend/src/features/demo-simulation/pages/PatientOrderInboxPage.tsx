import { useQuery } from '@tanstack/react-query'
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Clock3,
  MapPin,
  Radio,
  Stethoscope,
} from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { getLatestPatientOrder } from '../api/clinical-order-api'
import './clinical-order-dispatch.css'

function formatReceivedTime(value: string): string {
  return new Intl.DateTimeFormat('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).format(new Date(value))
}

export function PatientOrderInboxPage() {
  const { patientCode = 'BN-00847' } = useParams()
  const orderQuery = useQuery({
    queryKey: ['patient-latest-clinical-order', patientCode],
    queryFn: () => getLatestPatientOrder(patientCode),
    retry: false,
    refetchInterval: 3_000,
  })

  const order = orderQuery.data
  const route = order?.route_proposal.options[0]
  const firstStep = route?.steps[0]

  return (
    <main className="patient-inbox-shell">
      <header className="patient-inbox-header">
        <Link to="/demo/order-dispatch"><ArrowLeft size={18} /> Trình gửi chỉ định</Link>
        <div className="patient-inbox-header__live"><Radio size={13} /> Tự kiểm tra chỉ định mới mỗi 3 giây</div>
        <p>Bệnh viện Đa khoa TW</p>
        <h1>Chỉ định của tôi</h1>
        <span>Mã bệnh nhân: {patientCode}</span>
      </header>

      <div className="patient-inbox-content">
        {orderQuery.isPending && (
          <section className="patient-inbox-state" aria-busy="true">
            <Clock3 size={30} />
            <h2>Đang kiểm tra chỉ định mới…</h2>
          </section>
        )}

        {orderQuery.isError && (
          <section className="patient-inbox-state">
            <AlertCircle size={30} />
            <h2>Chưa có chỉ định được gửi</h2>
            <p>Giữ màn hình này mở. Khi nhân viên gửi chỉ định, hệ thống sẽ tự hiển thị lộ trình.</p>
            <Link to="/demo/order-dispatch">Sang màn hình nhân viên để gửi thử</Link>
          </section>
        )}

        {order && route && (
          <>
            <section className="patient-order-arrived">
              <div><CheckCircle2 size={22} /><span>Đã nhận lúc {formatReceivedTime(order.created_at)}</span></div>
              <h2>Bác sĩ vừa gửi {order.items.length} chỉ định</h2>
              <p>{order.doctor_name} · Lượt khám {order.encounter_id}</p>
            </section>

            {firstStep && (
              <section className="patient-next-room">
                <span>ĐIỂM ĐẾN ĐẦU TIÊN</span>
                <h2>{firstStep.room_name}</h2>
                <p><MapPin size={16} /> {firstStep.floor} · Mã phòng {firstStep.room_code}</p>
                <div><strong>Chờ dự kiến {firstStep.wait_minutes_min}–{firstStep.wait_minutes_max} phút</strong><small>Di chuyển khoảng {firstStep.travel_minutes} phút</small></div>
              </section>
            )}

            <section className="patient-order-card">
              <div className="patient-order-card__heading"><Stethoscope size={18} /><div><span>Chỉ định đã ký</span><h2>Dịch vụ cần thực hiện</h2></div></div>
              <div className="patient-order-items">
                {order.items.map((item) => (
                  <article key={item.service_code}>
                    <CheckCircle2 size={18} />
                    <div><strong>{item.service_name}</strong><span>{item.service_code}</span>{item.notes && <p>{item.notes}</p>}</div>
                  </article>
                ))}
              </div>
            </section>

            <section className="patient-order-card">
              <div className="patient-order-card__heading"><MapPin size={18} /><div><span>Hệ thống điều phối</span><h2>Thứ tự phòng cần đến</h2></div></div>
              <ol className="patient-route-list">
                {route.steps.map((step, index) => (
                  <li key={step.id} className={index === 0 ? 'is-current' : ''}>
                    <span>{step.order}</span>
                    <div><strong>{step.service_name}</strong><p>{step.room_name} · {step.floor}</p><small>{step.is_locked ? step.lock_reason : `Chờ ${step.wait_minutes_min}–${step.wait_minutes_max} phút`}</small></div>
                  </li>
                ))}
              </ol>
              <div className="patient-route-summary">
                <div><span>Hoàn tất dự kiến</span><strong>{route.duration_minutes_min}–{route.duration_minutes_max} phút</strong></div>
                <div><span>Quãng đường</span><strong>{route.distance_meters} m</strong></div>
              </div>
            </section>

            <p className="patient-safety-note">Lộ trình chỉ sắp xếp thứ tự và phòng phù hợp; không thay đổi chỉ định hoặc mức ưu tiên của bác sĩ.</p>
          </>
        )}
      </div>
    </main>
  )
}
