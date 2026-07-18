import { useEffect, useState } from 'react'
import {
  useMutation,
  useQuery,
  useQueryClient,
  type QueryClient,
} from '@tanstack/react-query'
import {
  advanceSimulation,
  getSimulationSnapshot,
  resetSimulation,
  updateRoomOperation,
} from '../api/simulation-api'
import type {
  RoomStatus,
  SimulationSnapshot,
} from '../model/simulation.schemas'

const simulationQueryKey = ['demo-simulation'] as const

const roomStatusContent: Record<
  RoomStatus,
  { label: string; description: string }
> = {
  available: {
    label: 'Sẵn sàng',
    description: 'Phòng đang hoạt động và chưa có bệnh nhân bên trong.',
  },
  serving: {
    label: 'Đang phục vụ',
    description: 'Phòng đang thực hiện dịch vụ cho một bệnh nhân.',
  },
  overloaded: {
    label: 'Quá tải',
    description: 'Có từ năm bệnh nhân trở lên đang chờ.',
  },
  paused: {
    label: 'Tạm dừng',
    description: 'Phòng hoặc thiết bị đang không nhận bệnh nhân.',
  },
}

function formatTime(value: string) {
  return new Intl.DateTimeFormat('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value))
}

function updateCachedSnapshot(
  queryClient: QueryClient,
  snapshot: SimulationSnapshot,
) {
  queryClient.setQueryData(simulationQueryKey, snapshot)
}

export function SimulationPage() {
  const queryClient = useQueryClient()
  const [autoRun, setAutoRun] = useState(false)
  const snapshotQuery = useQuery({
    queryKey: simulationQueryKey,
    queryFn: getSimulationSnapshot,
    refetchInterval: 10_000,
  })

  const advanceMutation = useMutation({
    mutationFn: () => advanceSimulation(5),
    onSuccess: (snapshot) => updateCachedSnapshot(queryClient, snapshot),
  })
  const resetMutation = useMutation({
    mutationFn: resetSimulation,
    onSuccess: (snapshot) => updateCachedSnapshot(queryClient, snapshot),
  })
  const roomMutation = useMutation({
    mutationFn: ({ roomCode, operational }: { roomCode: string; operational: boolean }) =>
      updateRoomOperation(roomCode, operational),
    onSuccess: (snapshot) => updateCachedSnapshot(queryClient, snapshot),
  })

  const advance = advanceMutation.mutate
  const isAdvancing = advanceMutation.isPending

  useEffect(() => {
    if (!autoRun) {
      return undefined
    }

    const timerId = window.setInterval(() => {
      if (!isAdvancing) {
        advance()
      }
    }, 3_000)

    return () => window.clearInterval(timerId)
  }, [advance, autoRun, isAdvancing])

  if (snapshotQuery.isPending) {
    return (
      <section className="simulation-panel" aria-busy="true">
        <p>Đang tải dữ liệu mô phỏng...</p>
      </section>
    )
  }

  if (snapshotQuery.isError || !snapshotQuery.data) {
    return (
      <section className="simulation-panel" role="alert">
        <h2>Không tải được dữ liệu mô phỏng</h2>
        <p>Hãy kiểm tra backend đang chạy tại cổng 8000 rồi thử lại.</p>
        <button
          className="button button--primary"
          onClick={() => snapshotQuery.refetch()}
        >
          Thử lại
        </button>
      </section>
    )
  }

  const snapshot = snapshotQuery.data
  const isMutating =
    advanceMutation.isPending || resetMutation.isPending || roomMutation.isPending

  return (
    <div className="simulation-page">
      <header className="simulation-page__header">
        <div>
          <p className="feature-card__eyebrow">Môi trường trình diễn</p>
          <h2>Mô phỏng vận hành bệnh viện</h2>
        </div>
        <span className="status-badge status-badge--planned">Dữ liệu giả</span>
      </header>

      <p className="simulation-notice">{snapshot.data_notice}</p>

      <section className="simulation-clock" aria-label="Đồng hồ mô phỏng">
        <div>
          <span>Thời gian mô phỏng</span>
          <strong>{formatTime(snapshot.simulation_time)}</strong>
        </div>
        <div>
          <span>Chu kỳ đã chạy</span>
          <strong>{snapshot.tick}</strong>
        </div>
      </section>

      <section className="simulation-controls" aria-label="Điều khiển mô phỏng">
        <button
          className="button button--primary"
          disabled={isMutating}
          onClick={() => advanceMutation.mutate()}
        >
          Tiến 5 phút
        </button>
        <button
          className="button button--secondary"
          aria-pressed={autoRun}
          disabled={resetMutation.isPending}
          onClick={() => setAutoRun((current) => !current)}
        >
          {autoRun ? 'Dừng tự động' : 'Chạy tự động'}
        </button>
        <button
          className="button button--secondary"
          disabled={isMutating}
          onClick={() => {
            setAutoRun(false)
            resetMutation.mutate()
          }}
        >
          Đặt lại
        </button>
      </section>

      <section aria-labelledby="simulation-summary-heading">
        <h3 id="simulation-summary-heading">Tổng quan</h3>
        <div className="simulation-summary-grid">
          <article>
            <span>Phòng hoạt động</span>
            <strong>
              {snapshot.summary.total_rooms - snapshot.summary.paused_rooms}/
              {snapshot.summary.total_rooms}
            </strong>
          </article>
          <article>
            <span>Bệnh nhân đang chờ</span>
            <strong>{snapshot.summary.waiting_patients}</strong>
          </article>
          <article>
            <span>Chờ trung bình</span>
            <strong>{snapshot.summary.average_wait_minutes} phút</strong>
          </article>
          <article>
            <span>Phòng quá tải</span>
            <strong>{snapshot.summary.overloaded_rooms}</strong>
          </article>
        </div>
      </section>

      <section aria-labelledby="room-status-heading">
        <div className="simulation-section-heading">
          <div>
            <h3 id="room-status-heading">Trạng thái từng phòng</h3>
            <p>Bấm tạm dừng để giả lập thiết bị gặp sự cố.</p>
          </div>
        </div>

        <div className="simulation-room-list">
          {snapshot.rooms.map((room) => {
            const statusContent = roomStatusContent[room.status]
            const isPaused = room.status === 'paused'
            return (
              <article className="simulation-room-card" key={room.code}>
                <div className="simulation-room-card__heading">
                  <div>
                    <span>
                      {room.code} · {room.floor}
                    </span>
                    <h4>{room.name}</h4>
                    <p>{room.department}</p>
                  </div>
                  <span
                    className={`simulation-status simulation-status--${room.status}`}
                  >
                    {statusContent.label}
                  </span>
                </div>

                <p className="simulation-status-description">
                  {statusContent.description}
                </p>
                {room.status_reason && (
                  <p className="simulation-room-card__reason">{room.status_reason}</p>
                )}

                <dl className="simulation-room-metrics">
                  <div>
                    <dt>Đang chờ</dt>
                    <dd>{room.waiting_patients} người</dd>
                  </div>
                  <div>
                    <dt>Đang phục vụ</dt>
                    <dd>{room.current_patient_code ?? 'Chưa có'}</dd>
                  </div>
                  <div>
                    <dt>Chờ ước tính</dt>
                    <dd>{room.estimated_wait_minutes} phút</dd>
                  </div>
                  <div>
                    <dt>Trung bình/dịch vụ</dt>
                    <dd>{room.average_service_minutes} phút</dd>
                  </div>
                </dl>

                <p className="simulation-queue-codes">
                  <strong>Hàng chờ:</strong>{' '}
                  {room.waiting_patient_codes.length > 0
                    ? room.waiting_patient_codes.join(', ')
                    : 'Không có bệnh nhân'}
                </p>

                <button
                  className="button button--secondary simulation-room-card__action"
                  disabled={roomMutation.isPending}
                  onClick={() =>
                    roomMutation.mutate({
                      roomCode: room.code,
                      operational: isPaused,
                    })
                  }
                >
                  {isPaused ? 'Mở lại phòng' : 'Giả lập tạm dừng'}
                </button>
              </article>
            )
          })}
        </div>
      </section>

      <section aria-labelledby="patient-flow-heading">
        <h3 id="patient-flow-heading">Luồng bệnh nhân gần nhất</h3>
        <div className="simulation-patient-list">
          {snapshot.patients.slice(0, 10).map((patient) => (
            <article key={patient.code}>
              <div>
                <strong>{patient.code}</strong>
                <span>
                  Bước {patient.current_step}/{patient.total_steps}
                </span>
              </div>
              <p>{patient.route_room_codes.join(' → ')}</p>
              <small>
                {patient.status === 'waiting' &&
                  `Đang chờ tại ${patient.current_room_code}`}
                {patient.status === 'in_service' &&
                  `Đang phục vụ tại ${patient.current_room_code}`}
                {patient.status === 'completed' && 'Đã hoàn tất hành trình'}
              </small>
            </article>
          ))}
        </div>
      </section>

      <section aria-labelledby="simulation-events-heading">
        <h3 id="simulation-events-heading">Sự kiện gần nhất</h3>
        <ol className="simulation-event-list">
          {snapshot.recent_events.map((event) => (
            <li key={event.id}>
              <time>{formatTime(event.occurred_at)}</time>
              <span>{event.message}</span>
            </li>
          ))}
        </ol>
      </section>
    </div>
  )
}
