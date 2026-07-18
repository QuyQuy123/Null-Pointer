/* @vitest-environment jsdom */

import '@testing-library/jest-dom/vitest'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter, Route as RouterRoute, Routes } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { ClinicalOrderDispatch } from '../../../entities/clinical-order/model/clinical-order.schemas'
import type { PatientProfile } from '../../../entities/patient/model/patient.schemas'
import { getLatestPatientOrder } from '../../../entities/clinical-order/api/clinical-order-api'
import { getPatient } from '../../../entities/patient/api/patient-api'
import { getTodayPatientActivities } from '../../../entities/patient/api/patient-activity-api'
import {
  getLatestPatientReservation,
  mapClinicalOrderRoutes,
} from '../api/patient-flow-api'
import type { Route, RouteReservation } from '../model/patient-flow.types'
import PatientFlowPage from './PatientFlowPage'

vi.mock('../../../entities/clinical-order/api/clinical-order-api', () => ({
  getLatestPatientOrder: vi.fn(),
}))

vi.mock('../../../entities/patient/api/patient-api', () => ({
  getPatient: vi.fn(),
}))

vi.mock('../../../entities/patient/api/patient-activity-api', () => ({
  getTodayPatientActivities: vi.fn(),
}))

vi.mock('../api/patient-flow-api', () => ({
  getLatestPatientReservation: vi.fn(),
  mapClinicalOrderRoutes: vi.fn(),
  updateJourneyProgress: vi.fn(),
}))

afterEach(() => {
  cleanup()
  vi.clearAllMocks()
})

const patient: PatientProfile = {
  id: 'BN-TEST',
  full_name: 'Bệnh nhân kiểm thử',
  date_of_birth: '1990-01-01',
  gender: 'female',
  phone: '0900000000',
  email: null,
  national_id: '001090000000',
  health_insurance_number: 'TEST0000001',
  address: 'Hà Nội',
  emergency_contact_name: 'Người liên hệ',
  emergency_contact_phone: '0910000000',
  blood_type: 'O+',
  allergies: [],
  chronic_conditions: [],
  mobility_support: false,
  visual_support: false,
  hearing_support: false,
  current_encounter_id: 'TM-TEST',
  attending_doctor_name: 'BS. Kiểm thử',
  doctor_room_code: 'PK-305',
  created_at: '2026-07-18T04:00:00Z',
}

const order = {
  id: 'SIM-ORDER-TEST',
  status: 'routed',
  patient_code: 'BN-TEST',
  patient_name: 'Bệnh nhân kiểm thử',
  encounter_id: 'TM-TEST',
  doctor_name: 'BS. Kiểm thử',
  doctor_room_code: 'PK-305',
  created_at: '2026-07-18T04:00:00Z',
  items: [],
  route_proposal: {
    id: 'PROPOSAL-NEW',
    encounter_id: 'TM-TEST',
    algorithm_version: 'deterministic-routing-v1',
    updated_at: '2026-07-18T04:00:00Z',
    expires_at: '2026-07-18T05:00:00Z',
    warnings: [],
    options: [],
  },
} as ClinicalOrderDispatch

const fallbackRoute: Route = {
  id: 'recommended',
  proposalId: 'PROPOSAL-NEW',
  backendOptionId: 'OPTION-NEW',
  encounterId: 'TM-TEST',
  label: 'Khuyến nghị',
  badge: 'KHUYẾN NGHỊ',
  badgeColor: 'bg-primary text-primary-foreground',
  duration: '45–60 phút',
  steps: ['Phòng lấy máu 113 — Tầng 1'],
  stepDetails: [
    {
      id: 'STEP-LAB',
      serviceCode: 'blood_test',
      serviceName: 'Xét nghiệm máu',
      roomCode: 'XN-113',
      roomName: 'Phòng lấy máu 113',
      floor: 'Tầng 1',
      waitMinutesMin: 5,
      waitMinutesMax: 10,
      serviceMinutes: 5,
      travelMinutes: 3,
      isLocked: true,
      lockReason: 'Ưu tiên lấy mẫu trước.',
    },
  ],
  distance: 80,
  floorChanges: 0,
  reason: 'Phòng đang có thời gian chờ thấp nhất.',
  updatedAt: '11:00',
  expiresAt: '2026-07-18T05:00:00Z',
  waitTimes: ['5–10 phút'],
}

const reservationWithOutdatedOption: RouteReservation = {
  id: 'RES-TEST',
  encounterId: 'TM-TEST',
  routeProposalId: 'PROPOSAL-OLD',
  routeOptionId: 'OPTION-OLD-NOT-FOUND',
  status: 'confirmed',
  expiresAt: '2026-07-18T05:00:00Z',
  journeyId: 'JOURNEY-TEST',
  extensionCount: 0,
  patientCode: 'BN-TEST',
  clinicalOrderId: 'SIM-ORDER-TEST',
  currentStep: 0,
  journeyStatus: 'active',
}

describe('PatientFlowPage', () => {
  it('không để trống nội dung khi mã phương án đã lưu không còn trong đề xuất mới', async () => {
    vi.mocked(getPatient).mockResolvedValue(patient)
    vi.mocked(getLatestPatientOrder).mockResolvedValue(order)
    vi.mocked(getTodayPatientActivities).mockResolvedValue([])
    vi.mocked(getLatestPatientReservation).mockResolvedValue(
      reservationWithOutdatedOption,
    )
    vi.mocked(mapClinicalOrderRoutes).mockReturnValue([fallbackRoute])

    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    })

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/demo/patient/BN-TEST']}>
          <Routes>
            <RouterRoute
              path="/demo/patient/:patientCode"
              element={<PatientFlowPage />}
            />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>,
    )

    expect(
      await screen.findByRole('heading', { name: 'Hành trình hôm nay' }),
    ).toBeInTheDocument()
    expect(screen.getByText('Đi tới Phòng lấy máu 113')).toBeInTheDocument()
    expect(screen.queryByRole('navigation')).not.toBeInTheDocument()
  })

  it('hiện trạng thái khôi phục thay vì thanh điều hướng đứng một mình khi chưa có lộ trình', async () => {
    vi.mocked(getPatient).mockResolvedValue(patient)
    vi.mocked(getLatestPatientOrder).mockResolvedValue(order)
    vi.mocked(getTodayPatientActivities).mockResolvedValue([])
    vi.mocked(getLatestPatientReservation).mockResolvedValue(
      reservationWithOutdatedOption,
    )
    vi.mocked(mapClinicalOrderRoutes).mockReturnValue([])

    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    })

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/demo/patient/BN-TEST']}>
          <Routes>
            <RouterRoute
              path="/demo/patient/:patientCode"
              element={<PatientFlowPage />}
            />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>,
    )

    expect(
      await screen.findByRole('heading', { name: 'Chưa tải được hành trình' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Tải lại dữ liệu' }),
    ).toBeInTheDocument()
    expect(screen.queryByRole('navigation')).not.toBeInTheDocument()
  })

  it('mở thông báo từ biểu tượng chuông trên màn hình chính và quay lại được', async () => {
    vi.mocked(getPatient).mockResolvedValue(patient)
    vi.mocked(getLatestPatientOrder).mockResolvedValue(order)
    vi.mocked(getTodayPatientActivities).mockResolvedValue([])
    vi.mocked(getLatestPatientReservation).mockResolvedValue({
      ...reservationWithOutdatedOption,
      status: 'held',
    })
    vi.mocked(mapClinicalOrderRoutes).mockReturnValue([fallbackRoute])

    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    })

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/demo/patient/BN-TEST']}>
          <Routes>
            <RouterRoute
              path="/demo/patient/:patientCode"
              element={<PatientFlowPage />}
            />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>,
    )

    expect(
      await screen.findByRole('heading', { name: 'Chỉ định mới' }),
    ).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Quay lại' }))
    fireEvent.click(
      screen.getByRole('button', { name: 'Thông báo và hoạt động' }),
    )

    expect(
      screen.getByRole('heading', { name: 'Thông báo và hoạt động' }),
    ).toBeInTheDocument()
    expect(screen.queryByRole('navigation')).not.toBeInTheDocument()

    fireEvent.click(
      screen.getByRole('button', { name: 'Quay lại màn hình chính' }),
    )
    expect(
      screen.getByRole('button', { name: 'Thông báo và hoạt động' }),
    ).toBeInTheDocument()
  })
})
