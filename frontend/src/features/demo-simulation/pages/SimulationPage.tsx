import { useMemo, useState, type FormEvent } from 'react'
import {
  useMutation,
  useQuery,
  useQueryClient,
  type QueryClient,
} from '@tanstack/react-query'
import {
  Activity,
  Building2,
  CheckCircle2,
  CirclePlus,
  ClipboardList,
  ExternalLink,
  LayoutDashboard,
  Minus,
  Plus,
  Radio,
  RefreshCw,
  Send,
  Settings2,
  Stethoscope,
  UsersRound,
  X,
} from 'lucide-react'
import { Link, useSearchParams } from 'react-router-dom'
import { dispatchClinicalOrder } from '../api/clinical-order-api'
import { getClinicalServices } from '../api/clinical-service-api'
import {
  adjustRoomQueue,
  advanceSimulation,
  createSimulationRoom,
  getSimulationSnapshot,
  updateRoomOperation,
} from '../api/simulation-api'
import type { DispatchClinicalOrderPayload } from '../model/clinical-order.schemas'
import type { ClinicalService } from '../model/clinical-service.schemas'
import type {
  CreateSimulationRoomPayload,
  RoomSnapshot,
  RoomStatus,
  SimulationSnapshot,
} from '../model/simulation.schemas'
import './hospital-simulator.css'

const simulationQueryKey = ['demo-simulation'] as const
const catalogQueryKey = ['simulation-clinical-service-catalog'] as const
type SimulatorTab = 'overview' | 'rooms' | 'orders'

const roomStatusContent: Record<RoomStatus, { label: string; tone: string }> = {
  available: { label: 'Sẵn sàng', tone: 'ready' },
  serving: { label: 'Đang phục vụ', tone: 'serving' },
  overloaded: { label: 'Quá tải', tone: 'overloaded' },
  paused: { label: 'Tạm dừng', tone: 'paused' },
}

const roomTypeLabels: Record<string, string> = {
  blood_test: 'Lấy máu / xét nghiệm máu',
  urine_test: 'Nhận mẫu nước tiểu',
  xray: 'X-quang',
  ultrasound: 'Siêu âm',
  ct_scan: 'Chụp CT',
  consultation: 'Phòng khám',
}

const fastingPolicyLabels: Record<ClinicalService['fasting_policy'], string> = {
  not_required: 'Không cần nhịn ăn',
  required: 'Bắt buộc nhịn ăn',
  conditional: 'Tùy loại xét nghiệm và hướng dẫn của bác sĩ',
}

const schedulingPriorityLabels: Record<
  ClinicalService['scheduling_priority'],
  string
> = {
  flow_start: 'Xếp ở đầu hành trình',
  morning: 'Ưu tiên buổi sáng',
  long_turnaround: 'Ưu tiên làm sớm vì chờ kết quả lâu',
  flexible: 'Có thể xếp linh hoạt giữa các dịch vụ khác',
}

const initialRoom: CreateSimulationRoomPayload = {
  code: '',
  location_code: '',
  name: '',
  department: 'Chẩn đoán hình ảnh',
  floor: 'Tầng 1',
  service_type: 'ultrasound',
  average_service_minutes: 15,
  initial_waiting_patients: 0,
  operational: true,
}

const initialOrder: DispatchClinicalOrderPayload = {
  patient_code: 'BN-00847',
  patient_name: 'Nguyễn Thị Mai',
  encounter_id: 'TM-2026-00847',
  doctor_name: 'BS. Trần Văn Hùng',
  doctor_room_code: 'PK-305',
  clinical_service_codes: [],
  priority: 'fastest',
  schedule_strategy: 'balanced',
}

function updateCachedSnapshot(
  queryClient: QueryClient,
  snapshot: SimulationSnapshot,
) {
  queryClient.setQueryData(simulationQueryKey, snapshot)
}

function formatClock(value: string) {
  return new Intl.DateTimeFormat('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).format(new Date(value))
}

function RoomStatusBadge({ room }: { room: RoomSnapshot }) {
  const content = roomStatusContent[room.status]
  return (
    <span className={`sim-status sim-status--${content.tone}`}>
      <i /> {content.label}
    </span>
  )
}

export function SimulationPage() {
  const queryClient = useQueryClient()
  const [searchParams, setSearchParams] = useSearchParams()
  const requestedTab = searchParams.get('tab')
  const activeTab: SimulatorTab =
    requestedTab === 'rooms' || requestedTab === 'orders'
      ? requestedTab
      : 'overview'
  const [showRoomForm, setShowRoomForm] = useState(false)
  const [roomForm, setRoomForm] = useState(initialRoom)
  const [roomMessage, setRoomMessage] = useState<string | null>(null)

  const snapshotQuery = useQuery({
    queryKey: simulationQueryKey,
    queryFn: getSimulationSnapshot,
    refetchInterval: 5_000,
  })
  const catalogQuery = useQuery({
    queryKey: catalogQueryKey,
    queryFn: getClinicalServices,
  })

  const advanceMutation = useMutation({
    mutationFn: () => advanceSimulation(5),
    onSuccess: (snapshot) => updateCachedSnapshot(queryClient, snapshot),
  })
  const roomOperationMutation = useMutation({
    mutationFn: ({ roomCode, operational }: { roomCode: string; operational: boolean }) =>
      updateRoomOperation(roomCode, operational),
    onSuccess: (snapshot) => updateCachedSnapshot(queryClient, snapshot),
  })
  const queueMutation = useMutation({
    mutationFn: ({ roomCode, delta }: { roomCode: string; delta: number }) =>
      adjustRoomQueue(roomCode, delta),
    onSuccess: (snapshot) => updateCachedSnapshot(queryClient, snapshot),
  })
  const createRoomMutation = useMutation({
    mutationFn: createSimulationRoom,
    onSuccess: (snapshot, createdRoom) => {
      updateCachedSnapshot(queryClient, snapshot)
      setRoomForm(initialRoom)
      setShowRoomForm(false)
      setRoomMessage(
        `Đã lưu phòng mới. Để phòng ${createdRoom.location_code} nhận một chỉ định cụ thể, hãy thêm vị trí này vào Danh mục chỉ định tương ứng.`,
      )
    },
    onError: () => setRoomMessage('Không thể thêm phòng. Hãy kiểm tra mã và vị trí có bị trùng.'),
  })

  function switchTab(tab: SimulatorTab) {
    setSearchParams(tab === 'overview' ? {} : { tab })
  }

  function updateRoomField<Key extends keyof CreateSimulationRoomPayload>(
    key: Key,
    value: CreateSimulationRoomPayload[Key],
  ) {
    setRoomForm((current) => ({ ...current, [key]: value }))
  }

  function submitRoom(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setRoomMessage(null)
    createRoomMutation.mutate(roomForm)
  }

  const snapshot = snapshotQuery.data

  return (
    <main className="hospital-simulator">
      <aside className="sim-sidebar">
        <div className="sim-brand">
          <span><Activity size={22} /></span>
          <div><strong>NHỊP VIỆN</strong><small>Hệ thống giả lập</small></div>
        </div>
        <nav aria-label="Điều hướng hệ thống giả lập">
          <button className={activeTab === 'overview' ? 'is-active' : ''} onClick={() => switchTab('overview')}>
            <LayoutDashboard size={19} /> Tổng quan
          </button>
          <button className={activeTab === 'rooms' ? 'is-active' : ''} onClick={() => switchTab('rooms')}>
            <Building2 size={19} /> Phòng & hàng chờ
          </button>
          <button className={activeTab === 'orders' ? 'is-active' : ''} onClick={() => switchTab('orders')}>
            <ClipboardList size={19} /> Bắn chỉ định
          </button>
          <Link to="/demo/hospital-data"><Settings2 size={19} /> Danh mục chỉ định</Link>
        </nav>
        <div className="sim-sidebar__note">
          <Radio size={16} />
          <div><strong>API giả lập đang dùng</strong><span>Dữ liệu tách biệt với ứng dụng bệnh nhân</span></div>
        </div>
      </aside>

      <section className="sim-main">
        <header className="sim-topbar">
          <div>
            <p>TRUNG TÂM ĐIỀU HÀNH GIẢ LẬP</p>
            <h1>
              {activeTab === 'overview' && 'Tổng quan vận hành'}
              {activeTab === 'rooms' && 'Quản lý phòng và hàng chờ'}
              {activeTab === 'orders' && 'Tạo và bắn chỉ định'}
            </h1>
          </div>
          <div className="sim-topbar__actions">
            <span className="sim-live"><i /> Đang kết nối</span>
            <span className="sim-clock">{snapshot ? formatClock(snapshot.updated_at) : '--:--:--'}</span>
            <button title="Tải lại dữ liệu" onClick={() => snapshotQuery.refetch()} disabled={snapshotQuery.isFetching}>
              <RefreshCw size={18} />
            </button>
          </div>
        </header>

        {snapshotQuery.isPending && <div className="sim-page-state">Đang đọc dữ liệu bệnh viện giả lập…</div>}
        {snapshotQuery.isError && (
          <div className="sim-page-state is-error" role="alert">
            Không kết nối được backend tại cổng 8000. Hãy khởi động backend rồi thử lại.
          </div>
        )}

        {snapshot && activeTab === 'overview' && (
          <OverviewPanel
            snapshot={snapshot}
            onOpenRooms={() => switchTab('rooms')}
            onOpenOrders={() => switchTab('orders')}
            onAdvance={() => advanceMutation.mutate()}
            isAdvancing={advanceMutation.isPending}
          />
        )}

        {snapshot && activeTab === 'rooms' && (
          <RoomsPanel
            snapshot={snapshot}
            showForm={showRoomForm}
            roomForm={roomForm}
            roomMessage={roomMessage}
            isCreating={createRoomMutation.isPending}
            isUpdating={roomOperationMutation.isPending || queueMutation.isPending}
            onShowForm={() => { setRoomMessage(null); setShowRoomForm(true) }}
            onHideForm={() => setShowRoomForm(false)}
            onUpdateField={updateRoomField}
            onSubmit={submitRoom}
            onAdjustQueue={(roomCode, delta) => queueMutation.mutate({ roomCode, delta })}
            onToggleRoom={(roomCode, operational) => roomOperationMutation.mutate({ roomCode, operational })}
          />
        )}

        {snapshot && activeTab === 'orders' && (
          <OrderPanel services={catalogQuery.data?.services ?? []} isLoading={catalogQuery.isPending} />
        )}
      </section>
    </main>
  )
}

function OverviewPanel({
  snapshot,
  onOpenRooms,
  onOpenOrders,
  onAdvance,
  isAdvancing,
}: {
  snapshot: SimulationSnapshot
  onOpenRooms: () => void
  onOpenOrders: () => void
  onAdvance: () => void
  isAdvancing: boolean
}) {
  const busiestRooms = [...snapshot.rooms]
    .sort((left, right) => right.waiting_patients - left.waiting_patients)
    .slice(0, 5)
  return (
    <div className="sim-content">
      <section className="sim-hero-strip">
        <div><span><Radio size={15} /> KỊCH BẢN ĐANG CHẠY</span><h2>Một ngày khám ngoại trú</h2><p>{snapshot.data_notice}</p></div>
        <button onClick={onAdvance} disabled={isAdvancing}>{isAdvancing ? 'Đang xử lý…' : 'Tiến mô phỏng 5 phút'}</button>
      </section>
      <section className="sim-metrics" aria-label="Chỉ số vận hành">
        <article><span className="is-green"><Building2 size={20} /></span><div><small>TỔNG SỐ PHÒNG</small><strong>{snapshot.summary.total_rooms}</strong><p>{snapshot.summary.paused_rooms} phòng tạm dừng</p></div></article>
        <article><span className="is-blue"><UsersRound size={20} /></span><div><small>ĐANG CHỜ</small><strong>{snapshot.summary.waiting_patients}</strong><p>Trên toàn bệnh viện</p></div></article>
        <article><span className="is-amber"><Activity size={20} /></span><div><small>CHỜ TRUNG BÌNH</small><strong>{snapshot.summary.average_wait_minutes}<em>phút</em></strong><p>Cao nhất {snapshot.summary.longest_wait_minutes} phút</p></div></article>
        <article><span className="is-red"><Stethoscope size={20} /></span><div><small>PHÒNG QUÁ TẢI</small><strong>{snapshot.summary.overloaded_rooms}</strong><p>Cần theo dõi điều phối</p></div></article>
      </section>
      <section className="sim-grid-overview">
        <article className="sim-card">
          <div className="sim-card__heading"><div><small>THEO DÕI TRỰC TIẾP</small><h2>Các phòng đông nhất</h2></div><button onClick={onOpenRooms}>Quản lý tất cả</button></div>
          <div className="sim-room-compact">
            {busiestRooms.map((room) => (
              <div key={room.code}>
                <div><strong>{room.name}</strong><span>{room.location_code} · {room.floor}</span></div>
                <RoomStatusBadge room={room} />
                <div className="sim-room-compact__wait"><strong>{room.waiting_patients}</strong><span>người chờ</span></div>
                <div className="sim-room-compact__eta"><strong>{room.estimated_wait_minutes} phút</strong><span>ước tính</span></div>
              </div>
            ))}
          </div>
        </article>
        <aside className="sim-card sim-quick-actions">
          <div className="sim-card__heading"><div><small>THAO TÁC NHANH</small><h2>Điều khiển giả lập</h2></div></div>
          <button onClick={onOpenOrders}><span><Send size={19} /></span><div><strong>Bắn chỉ định mới</strong><small>Tạo lộ trình cho bệnh nhân</small></div></button>
          <button onClick={onOpenRooms}><span><CirclePlus size={19} /></span><div><strong>Thêm phòng chức năng</strong><small>Cấu hình phòng và hàng chờ</small></div></button>
          <Link to="/demo/hospital-data"><span><Settings2 size={19} /></span><div><strong>Danh mục chỉ định</strong><small>Thêm loại xét nghiệm, chẩn đoán</small></div></Link>
        </aside>
      </section>
    </div>
  )
}

interface RoomsPanelProps {
  snapshot: SimulationSnapshot
  showForm: boolean
  roomForm: CreateSimulationRoomPayload
  roomMessage: string | null
  isCreating: boolean
  isUpdating: boolean
  onShowForm: () => void
  onHideForm: () => void
  onUpdateField: <Key extends keyof CreateSimulationRoomPayload>(key: Key, value: CreateSimulationRoomPayload[Key]) => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
  onAdjustQueue: (roomCode: string, delta: number) => void
  onToggleRoom: (roomCode: string, operational: boolean) => void
}

function RoomsPanel(props: RoomsPanelProps) {
  return (
    <div className="sim-content">
      <section className="sim-section-intro">
        <div><span>NGUỒN DỮ LIỆU PHÒNG</span><h2>Trạng thái được dùng trực tiếp khi điều phối</h2><p>Mọi thay đổi số người chờ hoặc trạng thái phòng sẽ ảnh hưởng đến lộ trình được đề xuất khi bắn chỉ định.</p></div>
        <button onClick={props.onShowForm}><Plus size={18} /> Thêm phòng mới</button>
      </section>

      {props.roomMessage && <p className="sim-message" role="status">{props.roomMessage}</p>}
      {props.showForm && (
        <form className="sim-room-form" onSubmit={props.onSubmit}>
          <div className="sim-room-form__heading"><div><small>CẤU HÌNH NGUỒN GIẢ LẬP</small><h2>Thêm phòng bệnh hoặc phòng chức năng</h2></div><button type="button" onClick={props.onHideForm} title="Đóng"><X size={19} /></button></div>
          <div className="sim-form-grid">
            <label><span>Mã phòng *</span><input value={props.roomForm.code} onChange={(event) => props.onUpdateField('code', event.target.value.toUpperCase())} placeholder="VD: SA-205" required /></label>
            <label><span>Phòng / tòa *</span><input value={props.roomForm.location_code} onChange={(event) => props.onUpdateField('location_code', event.target.value.toUpperCase())} placeholder="VD: 205 K2" required /></label>
            <label className="is-wide"><span>Tên phòng *</span><input value={props.roomForm.name} onChange={(event) => props.onUpdateField('name', event.target.value)} placeholder="VD: Phòng siêu âm 05" required /></label>
            <label><span>Khoa phụ trách *</span><input value={props.roomForm.department} onChange={(event) => props.onUpdateField('department', event.target.value)} required /></label>
            <label><span>Tầng *</span><input value={props.roomForm.floor} onChange={(event) => props.onUpdateField('floor', event.target.value)} required /></label>
            <label><span>Loại phòng *</span><select value={props.roomForm.service_type} onChange={(event) => props.onUpdateField('service_type', event.target.value as CreateSimulationRoomPayload['service_type'])}>{Object.entries(roomTypeLabels).map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select></label>
            <label><span>Phút / lượt *</span><input type="number" min="1" max="180" value={props.roomForm.average_service_minutes} onChange={(event) => props.onUpdateField('average_service_minutes', Number(event.target.value))} required /></label>
            <label><span>Số người chờ ban đầu</span><input type="number" min="0" max="200" value={props.roomForm.initial_waiting_patients} onChange={(event) => props.onUpdateField('initial_waiting_patients', Number(event.target.value))} /></label>
            <label className="sim-check"><input type="checkbox" checked={props.roomForm.operational} onChange={(event) => props.onUpdateField('operational', event.target.checked)} /><span>Cho phép phòng nhận bệnh nhân ngay</span></label>
          </div>
          <div className="sim-form-actions"><button type="button" onClick={props.onHideForm}>Hủy</button><button type="submit" disabled={props.isCreating}>{props.isCreating ? 'Đang lưu…' : 'Lưu và đưa vào giả lập'}</button></div>
        </form>
      )}

      <section className="sim-card sim-room-table-card">
        <div className="sim-card__heading"><div><small>{props.snapshot.rooms.length} PHÒNG ĐÃ CẤU HÌNH</small><h2>Danh sách phòng đang mô phỏng</h2></div><span>Cập nhật tự động mỗi 5 giây</span></div>
        <div className="sim-table-wrap">
          <table>
            <thead><tr><th>Phòng</th><th>Loại dịch vụ</th><th>Trạng thái</th><th>Hàng chờ</th><th>Chờ ước tính</th><th>Điều khiển</th></tr></thead>
            <tbody>
              {props.snapshot.rooms.map((room) => (
                <tr key={room.code}>
                  <td><strong>{room.name}</strong><span>{room.code} · {room.location_code} · {room.floor}</span></td>
                  <td><strong>{roomTypeLabels[room.service_type] ?? room.service_type}</strong><span>{room.department}</span></td>
                  <td><RoomStatusBadge room={room} />{room.status_reason && <small>{room.status_reason}</small>}</td>
                  <td><div className="sim-queue-control"><button disabled={props.isUpdating || room.waiting_patients === 0} onClick={() => props.onAdjustQueue(room.code, -1)} title="Giảm một người"><Minus size={16} /></button><strong>{room.waiting_patients}</strong><button disabled={props.isUpdating} onClick={() => props.onAdjustQueue(room.code, 1)} title="Thêm một người"><Plus size={16} /></button></div></td>
                  <td><strong>{room.estimated_wait_minutes} phút</strong><span>{room.average_service_minutes} phút / lượt</span></td>
                  <td><button className="sim-room-toggle" disabled={props.isUpdating} onClick={() => props.onToggleRoom(room.code, room.status === 'paused')}>{room.status === 'paused' ? 'Mở lại phòng' : 'Tạm dừng'}</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}

function OrderPanel({ services, isLoading }: { services: ClinicalService[]; isLoading: boolean }) {
  const [payload, setPayload] = useState(initialOrder)
  const [formError, setFormError] = useState<string | null>(null)
  const [serviceType, setServiceType] = useState<
    ClinicalService['room_service_type']
  >('blood_test')
  const [viewedServiceCode, setViewedServiceCode] = useState<string | null>(null)
  const dispatchMutation = useMutation({
    mutationFn: dispatchClinicalOrder,
    onSuccess: () => setFormError(null),
    onError: () => setFormError('Không thể tạo lộ trình. Hãy kiểm tra phòng phù hợp đang hoạt động và vị trí đã cấu hình.'),
  })
  const activeServices = useMemo(() => services.filter((service) => service.active), [services])
  const availableServiceTypes = useMemo(
    () => [...new Set(activeServices.map((service) => service.room_service_type))],
    [activeServices],
  )
  const effectiveServiceType = availableServiceTypes.includes(serviceType)
    ? serviceType
    : (availableServiceTypes[0] ?? serviceType)
  const servicesByType = useMemo(
    () =>
      activeServices.filter(
        (service) => service.room_service_type === effectiveServiceType,
      ),
    [activeServices, effectiveServiceType],
  )
  const viewedService =
    servicesByType.find((service) => service.code === viewedServiceCode) ??
    servicesByType[0] ??
    null
  const selectedServices = activeServices.filter((service) =>
    payload.clinical_service_codes.includes(service.code),
  )

  function updateField<Key extends keyof DispatchClinicalOrderPayload>(key: Key, value: DispatchClinicalOrderPayload[Key]) {
    setPayload((current) => ({ ...current, [key]: value }))
  }
  function toggleService(code: string) {
    updateField('clinical_service_codes', payload.clinical_service_codes.includes(code) ? payload.clinical_service_codes.filter((item) => item !== code) : [...payload.clinical_service_codes, code])
  }
  function changeServiceType(value: ClinicalService['room_service_type']) {
    setServiceType(value)
    setViewedServiceCode(null)
  }
  function submitOrder(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (payload.clinical_service_codes.length === 0) {
      setFormError('Hãy chọn ít nhất một chỉ định của bác sĩ.')
      return
    }
    dispatchMutation.mutate(payload)
  }

  const result = dispatchMutation.data
  const route = result?.route_proposal.options[0]
  return (
    <div className="sim-content">
      <section className="sim-section-intro">
        <div><span>KÊNH GỬI CHỈ ĐỊNH GIẢ LẬP</span><h2>Nhập chỉ định như dữ liệu từ hệ thống bệnh viện</h2><p>Sau khi gửi, backend đối chiếu loại phòng, trạng thái và hàng chờ rồi tạo lộ trình để ứng dụng bệnh nhân tải qua API.</p></div>
        <Link to="/demo/hospital-data"><Settings2 size={18} /> Sửa danh mục chỉ định</Link>
      </section>
      <div className="sim-order-workspace">
        <form className="sim-order-form" onSubmit={submitOrder}>
          <section className="sim-card">
            <div className="sim-card__heading"><div><small>BƯỚC 1</small><h2>Bệnh nhân và lượt khám</h2></div><UsersRound size={22} /></div>
            <div className="sim-form-grid">
              <label><span>Mã bệnh nhân *</span><input value={payload.patient_code} onChange={(event) => updateField('patient_code', event.target.value.toUpperCase())} required /></label>
              <label><span>Họ tên *</span><input value={payload.patient_name} onChange={(event) => updateField('patient_name', event.target.value)} required /></label>
              <label><span>Mã lượt khám *</span><input value={payload.encounter_id} onChange={(event) => updateField('encounter_id', event.target.value.toUpperCase())} required /></label>
              <label><span>Bác sĩ chỉ định *</span><input value={payload.doctor_name} onChange={(event) => updateField('doctor_name', event.target.value)} required /></label>
            </div>
          </section>
          <section className="sim-card">
            <div className="sim-card__heading"><div><small>BƯỚC 2</small><h2>Chọn chỉ định đã ký</h2></div><ClipboardList size={22} /></div>
            {isLoading && <p className="sim-inline-state">Đang tải danh mục…</p>}
            {!isLoading && activeServices.length === 0 && (
              <p className="sim-inline-state">Chưa có mã dịch vụ đang hoạt động.</p>
            )}
            {viewedService && (
              <div className="sim-service-picker">
                <div className="sim-service-selector">
                  <label>
                    <span>Loại chỉ định / loại phòng</span>
                    <select
                      value={effectiveServiceType}
                      onChange={(event) =>
                        changeServiceType(
                          event.target.value as ClinicalService['room_service_type'],
                        )
                      }
                    >
                      {availableServiceTypes.map((type) => (
                        <option value={type} key={type}>
                          {roomTypeLabels[type] ?? type}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    <span>Mã dịch vụ cận lâm sàng</span>
                    <select
                      value={viewedService.code}
                      onChange={(event) => setViewedServiceCode(event.target.value)}
                    >
                      {servicesByType.map((service) => (
                        <option value={service.code} key={service.code}>
                          {service.code} — {service.name}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                <article className="sim-service-detail" aria-live="polite">
                  <header>
                    <div>
                      <span>{viewedService.code}</span>
                      <h3>{viewedService.name}</h3>
                      <p>{viewedService.description ?? 'Chưa có mô tả cho dịch vụ này.'}</p>
                    </div>
                    <strong>{roomTypeLabels[viewedService.room_service_type]}</strong>
                  </header>
                  <dl>
                    <div>
                      <dt>Thời gian thực hiện</dt>
                      <dd>{viewedService.execution_minutes_min}–{viewedService.execution_minutes_max} phút</dd>
                    </div>
                    <div>
                      <dt>Thời gian trả kết quả (TAT)</dt>
                      <dd>{viewedService.turnaround_minutes_min}–{viewedService.turnaround_minutes_max} phút</dd>
                    </div>
                    <div>
                      <dt>Điều kiện thực hiện</dt>
                      <dd>
                        {fastingPolicyLabels[viewedService.fasting_policy]}
                        {viewedService.fasting_policy === 'required' &&
                          ` ${viewedService.fasting_hours_min ?? ''}–${viewedService.fasting_hours_max ?? ''} giờ`}
                      </dd>
                    </div>
                    <div>
                      <dt>Cách xếp buồng/phòng</dt>
                      <dd>{schedulingPriorityLabels[viewedService.scheduling_priority]}</dd>
                    </div>
                  </dl>
                  <div className="sim-service-detail__rooms">
                    <span>Phòng được phép thực hiện</span>
                    <div>
                      {viewedService.room_locations.map((location) => (
                        <strong key={location}>{location}</strong>
                      ))}
                    </div>
                  </div>
                  {viewedService.notes && (
                    <p className="sim-service-detail__note">
                      <strong>Lưu ý:</strong> {viewedService.notes}
                    </p>
                  )}
                  <button
                    type="button"
                    className={
                      payload.clinical_service_codes.includes(viewedService.code)
                        ? 'is-selected'
                        : ''
                    }
                    onClick={() => toggleService(viewedService.code)}
                  >
                    <CheckCircle2 size={17} />
                    {payload.clinical_service_codes.includes(viewedService.code)
                      ? 'Bỏ mã khỏi phiếu chỉ định'
                      : 'Thêm mã vào phiếu chỉ định'}
                  </button>
                </article>

                <div className="sim-selected-services">
                  <span>Đã chọn {selectedServices.length} mã dịch vụ</span>
                  {selectedServices.length === 0 ? (
                    <p>Chưa có mã nào trong phiếu chỉ định.</p>
                  ) : (
                    <div>
                      {selectedServices.map((service) => (
                        <button
                          type="button"
                          key={service.code}
                          onClick={() => toggleService(service.code)}
                          title={`Bỏ ${service.code}`}
                        >
                          {service.code} · {service.name} <X size={14} />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </section>
          <section className="sim-card">
            <div className="sim-card__heading"><div><small>BƯỚC 3</small><h2>Cách hệ thống xếp lộ trình</h2></div><Activity size={22} /></div>
            <div className="sim-form-grid">
              <label><span>Kiểu xếp lịch trình</span><select value={payload.schedule_strategy} onChange={(event) => updateField('schedule_strategy', event.target.value as DispatchClinicalOrderPayload['schedule_strategy'])}><option value="balanced">Cân bằng</option><option value="finish_early">Hoàn thành xét nghiệm sớm</option><option value="leave_fast">Ưu tiên ra viện sớm</option></select></label>
              <label><span>Tiêu chí chọn phòng</span><select value={payload.priority} onChange={(event) => updateField('priority', event.target.value as DispatchClinicalOrderPayload['priority'])}><option value="fastest">Nhanh nhất</option><option value="less_walk">Ít đi bộ</option><option value="less_crowd">Ít đông</option><option value="accessible">Hỗ trợ di chuyển</option></select></label>
            </div>
          </section>
          {formError && <p className="sim-message is-error" role="alert">{formError}</p>}
          <button className="sim-send-order" type="submit" disabled={dispatchMutation.isPending || isLoading}><Send size={18} />{dispatchMutation.isPending ? 'Đang ghép phòng và tạo lộ trình…' : `Bắn ${payload.clinical_service_codes.length || ''} chỉ định sang ứng dụng bệnh nhân`}</button>
        </form>
        <aside className="sim-order-result">
          {!result || !route ? (
            <div className="sim-result-empty"><span><Send size={28} /></span><h2>Chưa bắn chỉ định</h2><p>Lộ trình và các phòng được chọn sẽ xuất hiện ở đây sau khi hệ thống xử lý.</p><ol><li><i>1</i>Đối chiếu chỉ định và loại phòng</li><li><i>2</i>Đọc hàng chờ theo thời gian thực</li><li><i>3</i>Tạo thứ tự di chuyển tối ưu</li><li><i>4</i>Ứng dụng bệnh nhân nhận dữ liệu</li></ol></div>
          ) : (
            <div className="sim-result-success">
              <span><CheckCircle2 size={18} /> Đã gửi thành công</span><h2>Lộ trình của {result.patient_name}</h2><p>{result.id} · dự kiến {route.duration_minutes_min}–{route.duration_minutes_max} phút</p>
              <ol>{route.steps.map((step) => <li key={step.id}><i>{step.order}</i><div><strong>{step.service_name}</strong><span>{step.room_name} · {step.floor}</span><small>Chờ {step.wait_minutes_min}–{step.wait_minutes_max} phút</small></div></li>)}</ol>
              <Link to={`/demo/patient/${encodeURIComponent(result.patient_code)}`}>Mở ứng dụng bệnh nhân <ExternalLink size={16} /></Link>
            </div>
          )}
        </aside>
      </div>
    </div>
  )
}
