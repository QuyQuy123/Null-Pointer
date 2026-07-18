import { useMemo, useState, type FormEvent } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  ArrowLeft,
  Database,
  FileInput,
  Pencil,
  Power,
  RefreshCw,
  Save,
  ServerCog,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import {
  createClinicalService,
  deactivateClinicalService,
  getClinicalServices,
  updateClinicalService,
} from '../api/clinical-service-api'
import type {
  ClinicalService,
  ClinicalServiceGroup,
  ClinicalServicePayload,
  FastingPolicy,
  RoomServiceType,
  SchedulingPriority,
} from '../model/clinical-service.schemas'
import './clinical-service-catalog.css'

const catalogQueryKey = ['simulation-clinical-service-catalog'] as const

interface FormValues {
  code: string
  name: string
  serviceGroup: ClinicalServiceGroup
  roomServiceType: RoomServiceType
  description: string
  executionMinutesMin: string
  executionMinutesMax: string
  turnaroundMinutesMin: string
  turnaroundMinutesMax: string
  fastingPolicy: FastingPolicy
  fastingHoursMin: string
  fastingHoursMax: string
  schedulingPriority: SchedulingPriority
  notes: string
  roomLocations: string
  active: boolean
}

const emptyForm: FormValues = {
  code: '',
  name: '',
  serviceGroup: 'laboratory',
  roomServiceType: 'blood_test',
  description: '',
  executionMinutesMin: '3',
  executionMinutesMax: '5',
  turnaroundMinutesMin: '30',
  turnaroundMinutesMax: '45',
  fastingPolicy: 'not_required',
  fastingHoursMin: '',
  fastingHoursMax: '',
  schedulingPriority: 'flexible',
  notes: '',
  roomLocations: '',
  active: true,
}

const groupLabels: Record<ClinicalServiceGroup, string> = {
  laboratory: 'Xét nghiệm',
  imaging: 'Chẩn đoán hình ảnh',
  functional_diagnostics: 'Thăm dò chức năng',
  other: 'Dịch vụ khác',
}

const priorityLabels: Record<SchedulingPriority, string> = {
  flow_start: 'Đưa lên đầu luồng',
  morning: 'Ưu tiên buổi sáng',
  long_turnaround: 'Ưu tiên vì TAT dài',
  flexible: 'Có thể lồng ghép',
}

const roomServiceTypeLabels: Record<RoomServiceType, string> = {
  blood_test: 'Phòng lấy máu',
  urine_test: 'Phòng nhận mẫu nước tiểu',
  xray: 'Phòng X-quang',
  ultrasound: 'Phòng siêu âm',
  ct_scan: 'Phòng CT',
}

function toFormValues(service: ClinicalService): FormValues {
  return {
    code: service.code,
    name: service.name,
    serviceGroup: service.service_group,
    roomServiceType: service.room_service_type,
    description: service.description ?? '',
    executionMinutesMin: String(service.execution_minutes_min),
    executionMinutesMax: String(service.execution_minutes_max),
    turnaroundMinutesMin: String(service.turnaround_minutes_min),
    turnaroundMinutesMax: String(service.turnaround_minutes_max),
    fastingPolicy: service.fasting_policy,
    fastingHoursMin: service.fasting_hours_min?.toString() ?? '',
    fastingHoursMax: service.fasting_hours_max?.toString() ?? '',
    schedulingPriority: service.scheduling_priority,
    notes: service.notes ?? '',
    roomLocations: service.room_locations.join('\n'),
    active: service.active,
  }
}

function numberOrNull(value: string): number | null {
  return value.trim() === '' ? null : Number(value)
}

function buildPayload(values: FormValues): ClinicalServicePayload {
  const fastingRequired = values.fastingPolicy !== 'not_required'
  return {
    name: values.name.trim(),
    service_group: values.serviceGroup,
    room_service_type: values.roomServiceType,
    description: values.description.trim() || null,
    execution_minutes_min: Number(values.executionMinutesMin),
    execution_minutes_max: Number(values.executionMinutesMax),
    turnaround_minutes_min: Number(values.turnaroundMinutesMin),
    turnaround_minutes_max: Number(values.turnaroundMinutesMax),
    fasting_policy: values.fastingPolicy,
    fasting_hours_min: fastingRequired ? numberOrNull(values.fastingHoursMin) : null,
    fasting_hours_max: fastingRequired ? numberOrNull(values.fastingHoursMax) : null,
    scheduling_priority: values.schedulingPriority,
    notes: values.notes.trim() || null,
    room_locations: values.roomLocations
      .split(/[\n,;]+/)
      .map((room) => room.trim().toUpperCase())
      .filter(Boolean),
    active: values.active,
  }
}

function validateForm(values: FormValues, payload: ClinicalServicePayload): string | null {
  if (!/^[A-Z0-9][A-Z0-9_-]{2,39}$/.test(values.code.trim().toUpperCase())) {
    return 'Mã dịch vụ cần từ 3 đến 40 ký tự, chỉ gồm chữ in hoa, số, dấu gạch ngang hoặc gạch dưới.'
  }
  if (!payload.name) return 'Hãy nhập tên cận lâm sàng.'
  if (payload.room_locations.length === 0) return 'Hãy nhập ít nhất một phòng hoặc tòa.'
  if (payload.execution_minutes_max < payload.execution_minutes_min) {
    return 'Thời gian thực hiện tối đa không được nhỏ hơn thời gian tối thiểu.'
  }
  if (payload.turnaround_minutes_max < payload.turnaround_minutes_min) {
    return 'TAT tối đa không được nhỏ hơn TAT tối thiểu.'
  }
  if (
    payload.fasting_policy === 'required' &&
    (payload.fasting_hours_min === null || payload.fasting_hours_max === null)
  ) {
    return 'Dịch vụ bắt buộc nhịn ăn cần có số giờ tối thiểu và tối đa.'
  }
  return null
}

function fastingLabel(service: ClinicalService): string {
  if (service.fasting_policy === 'not_required') return 'Không'
  if (service.fasting_policy === 'conditional') return 'Tùy loại'
  return `Có (${service.fasting_hours_min}–${service.fasting_hours_max} giờ)`
}

function formatRange(minimum: number, maximum: number): string {
  return minimum === maximum ? `${minimum} phút` : `${minimum}–${maximum} phút`
}

type SaveCommand =
  | { mode: 'create'; code: string; payload: ClinicalServicePayload }
  | {
      mode: 'update'
      code: string
      version: number
      payload: ClinicalServicePayload
    }

export function ClinicalServiceCatalogPage() {
  const queryClient = useQueryClient()
  const [form, setForm] = useState<FormValues>(emptyForm)
  const [editingService, setEditingService] = useState<ClinicalService | null>(null)
  const [formError, setFormError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)

  const catalogQuery = useQuery({
    queryKey: catalogQueryKey,
    queryFn: getClinicalServices,
  })

  const saveMutation = useMutation({
    mutationFn: (command: SaveCommand) =>
      command.mode === 'create'
        ? createClinicalService({
            code: command.code,
            ...command.payload,
          })
        : updateClinicalService(command.code, {
            ...command.payload,
            expected_version: command.version,
          }),
    onSuccess: (saved) => {
      queryClient.invalidateQueries({ queryKey: catalogQueryKey })
      setEditingService(null)
      setForm(emptyForm)
      setFormError(null)
      setNotice(`Đã lưu ${saved.code} · phiên bản ${saved.version}.`)
    },
    onError: () => {
      setFormError('Không lưu được dữ liệu. Hãy tải lại danh mục và kiểm tra các trường đã nhập.')
    },
  })

  const deactivateMutation = useMutation({
    mutationFn: (service: ClinicalService) =>
      deactivateClinicalService(service.code, service.version),
    onSuccess: (saved) => {
      queryClient.invalidateQueries({ queryKey: catalogQueryKey })
      setNotice(`Đã ngừng sử dụng ${saved.code}; dữ liệu cũ vẫn được giữ lại.`)
    },
  })

  const services = useMemo(
    () => catalogQuery.data?.services ?? [],
    [catalogQuery.data],
  )
  const activeServices = useMemo(
    () => services.filter((service) => service.active),
    [services],
  )

  function updateField<Key extends keyof FormValues>(key: Key, value: FormValues[Key]) {
    setForm((current) => ({ ...current, [key]: value }))
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const payload = buildPayload(form)
    const validationError = validateForm(form, payload)
    if (validationError) {
      setFormError(validationError)
      return
    }

    setFormError(null)
    setNotice(null)
    saveMutation.mutate(
      editingService
        ? {
            mode: 'update',
            code: editingService.code,
            version: editingService.version,
            payload,
          }
        : {
            mode: 'create',
            code: form.code.trim().toUpperCase(),
            payload,
          },
    )
  }

  function startEditing(service: ClinicalService) {
    setEditingService(service)
    setForm(toFormValues(service))
    setFormError(null)
    setNotice(null)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function cancelEditing() {
    setEditingService(null)
    setForm(emptyForm)
    setFormError(null)
  }

  return (
    <main className="catalog-admin">
      <header className="catalog-admin__hero">
        <div className="catalog-admin__hero-topline">
          <Link to="/demo/simulation" className="catalog-admin__back-link">
            <ArrowLeft size={17} aria-hidden="true" />
            Quay lại vận hành mô phỏng
          </Link>
          <span>Dữ liệu giả · không dùng hồ sơ thật</span>
        </div>
        <div className="catalog-admin__hero-copy">
          <p>NHỊP VIỆN · BỘ NẠP DỮ LIỆU</p>
          <h1>Danh mục cận lâm sàng giả lập</h1>
          <span>
            Nhập đúng dữ liệu bệnh viện sẽ gửi để kiểm tra toàn bộ luồng trước khi kết nối thật.
          </span>
        </div>
        <ol className="catalog-pipeline" aria-label="Luồng dữ liệu giả lập">
          <li>
            <FileInput aria-hidden="true" />
            <div><strong>01 · Nhập</strong><span>Biểu mẫu vận hành</span></div>
          </li>
          <li>
            <Database aria-hidden="true" />
            <div><strong>02 · Lưu</strong><span>SQLite cục bộ</span></div>
          </li>
          <li>
            <ServerCog aria-hidden="true" />
            <div><strong>03 · Cấp</strong><span>Hợp đồng API v1</span></div>
          </li>
        </ol>
      </header>

      <div className="catalog-admin__content">
        <section className="catalog-stats" aria-label="Tổng quan danh mục">
          <article><span>Đang hoạt động</span><strong>{activeServices.length}</strong></article>
          <article><span>Tổng bản ghi</span><strong>{services.length}</strong></article>
          <article className="catalog-stats__contract">
            <span>Hợp đồng dữ liệu</span>
            <strong>{catalogQuery.data?.contract_version ?? 'clinical-service-feed.v1'}</strong>
          </article>
        </section>

        <div className="catalog-workspace">
          <section className="catalog-form-card" aria-labelledby="catalog-form-heading">
            <div className="catalog-section-heading">
              <div>
                <span>{editingService ? `Đang sửa ${editingService.code}` : 'Bản ghi mới'}</span>
                <h2 id="catalog-form-heading">
                  {editingService ? 'Cập nhật dịch vụ' : 'Nhập thông tin dịch vụ'}
                </h2>
              </div>
              {editingService && <span className="catalog-version">v{editingService.version}</span>}
            </div>

            <form className="catalog-form" onSubmit={handleSubmit}>
              <div className="catalog-form__grid">
                <label>
                  <span>Mã dịch vụ *</span>
                  <input
                    value={form.code}
                    disabled={editingService !== null}
                    placeholder="Ví dụ: LAB-HEMA"
                    onChange={(event) => updateField('code', event.target.value.toUpperCase())}
                    required
                  />
                  <small>Không đổi mã sau khi đã lưu.</small>
                </label>
                <label>
                  <span>Nhóm dịch vụ *</span>
                  <select
                    value={form.serviceGroup}
                    onChange={(event) =>
                      updateField('serviceGroup', event.target.value as ClinicalServiceGroup)
                    }
                  >
                    {Object.entries(groupLabels).map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </label>
                <label>
                  <span>Loại phòng phục vụ *</span>
                  <select
                    value={form.roomServiceType}
                    onChange={(event) =>
                      updateField('roomServiceType', event.target.value as RoomServiceType)
                    }
                  >
                    {Object.entries(roomServiceTypeLabels).map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                  <small>Hệ thống dùng trường này để tìm đúng loại phòng.</small>
                </label>
                <label className="catalog-form__wide">
                  <span>Tên cận lâm sàng *</span>
                  <input
                    value={form.name}
                    placeholder="Ví dụ: Sinh hóa máu cơ bản"
                    onChange={(event) => updateField('name', event.target.value)}
                    required
                  />
                </label>
                <label className="catalog-form__wide">
                  <span>Mô tả xét nghiệm hoặc dịch vụ</span>
                  <input
                    value={form.description}
                    placeholder="Ví dụ: Glucose, ure, creatinine, men gan"
                    onChange={(event) => updateField('description', event.target.value)}
                  />
                </label>
              </div>

              <fieldset>
                <legend>Thời gian xử lý</legend>
                <div className="catalog-form__grid catalog-form__grid--four">
                  <label><span>Thực hiện từ *</span><input type="number" min="1" value={form.executionMinutesMin} onChange={(event) => updateField('executionMinutesMin', event.target.value)} required /><small>phút</small></label>
                  <label><span>Thực hiện đến *</span><input type="number" min="1" value={form.executionMinutesMax} onChange={(event) => updateField('executionMinutesMax', event.target.value)} required /><small>phút</small></label>
                  <label><span>TAT từ *</span><input type="number" min="0" value={form.turnaroundMinutesMin} onChange={(event) => updateField('turnaroundMinutesMin', event.target.value)} required /><small>phút</small></label>
                  <label><span>TAT đến *</span><input type="number" min="0" value={form.turnaroundMinutesMax} onChange={(event) => updateField('turnaroundMinutesMax', event.target.value)} required /><small>phút</small></label>
                </div>
              </fieldset>

              <fieldset>
                <legend>Điều kiện và cách xếp luồng</legend>
                <div className="catalog-form__grid">
                  <label>
                    <span>Yêu cầu nhịn ăn *</span>
                    <select value={form.fastingPolicy} onChange={(event) => updateField('fastingPolicy', event.target.value as FastingPolicy)}>
                      <option value="not_required">Không</option>
                      <option value="required">Có, bắt buộc</option>
                      <option value="conditional">Tùy loại xét nghiệm</option>
                    </select>
                  </label>
                  <label>
                    <span>Quy tắc ưu tiên *</span>
                    <select value={form.schedulingPriority} onChange={(event) => updateField('schedulingPriority', event.target.value as SchedulingPriority)}>
                      {Object.entries(priorityLabels).map(([value, label]) => (
                        <option key={value} value={value}>{label}</option>
                      ))}
                    </select>
                  </label>
                  {form.fastingPolicy !== 'not_required' && (
                    <>
                      <label><span>Nhịn tối thiểu</span><input type="number" min="0" max="24" value={form.fastingHoursMin} onChange={(event) => updateField('fastingHoursMin', event.target.value)} /><small>giờ</small></label>
                      <label><span>Nhịn tối đa</span><input type="number" min="0" max="24" value={form.fastingHoursMax} onChange={(event) => updateField('fastingHoursMax', event.target.value)} /><small>giờ</small></label>
                    </>
                  )}
                  <label className="catalog-form__wide">
                    <span>Phòng / tòa *</span>
                    <textarea value={form.roomLocations} placeholder={'101 K1\n102 K1\n103 K1'} onChange={(event) => updateField('roomLocations', event.target.value)} rows={3} required />
                    <small>Mỗi dòng một phòng; cũng có thể phân cách bằng dấu phẩy.</small>
                  </label>
                  <label className="catalog-form__wide">
                    <span>Lưu ý cho bộ điều phối</span>
                    <textarea value={form.notes} placeholder="Ví dụ: Làm buổi sáng sớm, chỉ được ăn sau khi lấy mẫu." onChange={(event) => updateField('notes', event.target.value)} rows={3} />
                  </label>
                  {editingService && (
                    <label className="catalog-active-toggle">
                      <input type="checkbox" checked={form.active} onChange={(event) => updateField('active', event.target.checked)} />
                      <span>Cho phép hệ thống sử dụng dịch vụ này</span>
                    </label>
                  )}
                </div>
              </fieldset>

              {formError && <p className="catalog-message catalog-message--error" role="alert">{formError}</p>}
              {notice && <p className="catalog-message catalog-message--success" role="status">{notice}</p>}

              <div className="catalog-form__actions">
                <button className="catalog-button catalog-button--primary" type="submit" disabled={saveMutation.isPending}>
                  <Save size={17} aria-hidden="true" />
                  {saveMutation.isPending ? 'Đang lưu…' : editingService ? 'Lưu thay đổi' : 'Lưu dịch vụ'}
                </button>
                {editingService && <button className="catalog-button catalog-button--quiet" type="button" onClick={cancelEditing}>Hủy sửa</button>}
              </div>
            </form>
          </section>

          <aside className="catalog-feed-card" aria-labelledby="feed-heading">
            <div className="catalog-feed-card__indicator"><span /> Nguồn đang dùng: giả lập</div>
            <h2 id="feed-heading">Dữ liệu dự án sẽ nhận</h2>
            <p>Backend đọc qua cùng một hợp đồng dữ liệu. Khi triển khai thật, chỉ thay bộ cấp nguồn bằng HIS, LIS hoặc RIS/PACS.</p>
            <dl>
              <div><dt>Nguồn</dt><dd>{catalogQuery.data?.source_system ?? 'hospital-simulator'}</dd></div>
              <div><dt>Phiên bản</dt><dd>{catalogQuery.data?.contract_version ?? 'clinical-service-feed.v1'}</dd></div>
              <div><dt>Bản ghi hợp lệ</dt><dd>{activeServices.length}</dd></div>
            </dl>
            <code>GET /api/v1/simulation/clinical-services/hospital-feed</code>
            <Link className="catalog-button catalog-button--primary" to="/demo/order-dispatch">
              Mở trình gửi chỉ định
            </Link>
            <p className="catalog-feed-card__note">HIS là hệ thống thông tin bệnh viện; LIS quản lý xét nghiệm; RIS/PACS quản lý chẩn đoán hình ảnh và ảnh y khoa.</p>
          </aside>
        </div>

        <section className="catalog-table-card" aria-labelledby="catalog-list-heading">
          <div className="catalog-table-card__heading">
            <div><span>Dữ liệu đã lưu</span><h2 id="catalog-list-heading">Danh mục đang mô phỏng</h2></div>
            <button className="catalog-button catalog-button--quiet" type="button" onClick={() => catalogQuery.refetch()} disabled={catalogQuery.isFetching}>
              <RefreshCw size={16} aria-hidden="true" /> Tải lại
            </button>
          </div>

          {catalogQuery.isPending && <p className="catalog-table-state">Đang đọc dữ liệu đã lưu…</p>}
          {catalogQuery.isError && <p className="catalog-table-state catalog-message--error" role="alert">Không tải được danh mục. Hãy kiểm tra backend tại cổng 8000.</p>}
          {catalogQuery.data && (
            <div className="catalog-table-wrap">
              <table>
                <thead><tr><th>Tên cận lâm sàng</th><th>Thực hiện</th><th>TAT</th><th>Nhịn ăn</th><th>Lưu ý</th><th>Phòng / tòa</th><th>Trạng thái</th><th>Thao tác</th></tr></thead>
                <tbody>
                  {services.map((service) => (
                    <tr key={service.code} className={service.active ? undefined : 'is-inactive'}>
                      <td><strong>{service.name}</strong><span>{service.code} · {groupLabels[service.service_group]}</span><small>{roomServiceTypeLabels[service.room_service_type]}</small>{service.description && <small>{service.description}</small>}</td>
                      <td>{formatRange(service.execution_minutes_min, service.execution_minutes_max)}</td>
                      <td><strong>{formatRange(service.turnaround_minutes_min, service.turnaround_minutes_max)}</strong></td>
                      <td>{fastingLabel(service)}</td>
                      <td><span>{priorityLabels[service.scheduling_priority]}</span><small>{service.notes ?? 'Không có lưu ý'}</small></td>
                      <td>{service.room_locations.map((room) => <code key={room}>{room}</code>)}</td>
                      <td><span className={`catalog-status ${service.active ? 'is-active' : 'is-stopped'}`}>{service.active ? 'Đang dùng' : 'Đã dừng'}</span><small>Phiên bản {service.version}</small></td>
                      <td>
                        <div className="catalog-row-actions">
                          <button type="button" title={`Sửa ${service.code}`} onClick={() => startEditing(service)}><Pencil size={16} aria-hidden="true" /><span>Sửa</span></button>
                          {service.active && <button type="button" title={`Ngừng sử dụng ${service.code}`} disabled={deactivateMutation.isPending} onClick={() => deactivateMutation.mutate(service)}><Power size={16} aria-hidden="true" /><span>Ngừng</span></button>}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </main>
  )
}
