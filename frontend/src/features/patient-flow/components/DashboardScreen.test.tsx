/* @vitest-environment jsdom */

import '@testing-library/jest-dom/vitest'
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { ClinicalOrderDispatch } from '../../../entities/clinical-order/model/clinical-order.schemas'
import { DashboardScreen } from './DashboardScreen'

afterEach(cleanup)

const order: ClinicalOrderDispatch = {
  id: 'SIM-ORDER-TEST',
  status: 'routed',
  patient_code: 'BN-TEST',
  patient_name: 'Bệnh nhân kiểm thử',
  encounter_id: 'TM-TEST',
  doctor_name: 'BS. Kiểm thử',
  doctor_room_code: 'PK-305',
  created_at: '2026-07-18T04:00:00Z',
  items: [
    {
      service_code: 'LAB-IMMUNO',
      service_name: 'Miễn dịch / Nội tiết',
      room_service_type: 'blood_test',
      fasting_policy: 'conditional',
      fasting_hours_min: null,
      fasting_hours_max: null,
      notes: 'Ưu tiên sớm vì thời gian đợi kết quả dài.',
      configured_room_locations: ['113 K1'],
      matched_rooms: [],
    },
  ],
  route_proposal: {
    id: 'PROPOSAL-TEST',
    encounter_id: 'TM-TEST',
    algorithm_version: 'deterministic-routing-v1',
    updated_at: '2026-07-18T04:00:00Z',
    expires_at: '2026-07-18T04:03:00Z',
    warnings: [],
    options: [
      {
        id: 'OPTION-TEST',
        label: 'recommended',
        duration_minutes_min: 30,
        duration_minutes_max: 40,
        distance_meters: 120,
        floor_changes: 0,
        total_wait_minutes: 10,
        reason: 'Cân bằng thời gian chờ và quãng đường.',
        steps: [
          {
            id: 'STEP-IMMUNO',
            order: 1,
            service_code: 'blood_test',
            service_name: 'Miễn dịch / Nội tiết',
            room_code: 'XN-113',
            room_name: 'Phòng xét nghiệm 113',
            floor: 'Tầng 1',
            wait_minutes_min: 2,
            wait_minutes_max: 5,
            service_minutes: 5,
            travel_minutes: 3,
            arrival_minutes: 3,
            complete_minutes: 10,
            result_ready_minutes: 100,
            is_locked: true,
            lock_reason: 'Ưu tiên lấy mẫu sớm.',
          },
          {
            id: 'STEP-URINE',
            order: 2,
            service_code: 'urine_test',
            service_name: 'Tổng phân tích nước tiểu',
            room_code: 'NT-104',
            room_name: 'Phòng nước tiểu 104',
            floor: 'Tầng 1',
            wait_minutes_min: 2,
            wait_minutes_max: 5,
            service_minutes: 10,
            travel_minutes: 2,
            arrival_minutes: 12,
            complete_minutes: 27,
            result_ready_minutes: 60,
            is_locked: false,
            lock_reason: null,
          },
        ],
      },
    ],
  },
}

describe('DashboardScreen', () => {
  it('hiển thị hoạt động thật và không hiển thị timeline giả cũ', () => {
    const onOpenNotifications = vi.fn()

    render(
      <DashboardScreen
        order={order}
        activities={[
          {
            id: 'ACT-001',
            patient_code: 'BN-00847',
            encounter_id: 'TM-2026-00847',
            activity_type: 'clinical_order_dispatched',
            title: 'Đã nhận 2 chỉ định mới',
            description: 'BS. Trần Văn Hùng đã gửi xét nghiệm máu và X-quang.',
            occurred_at: '2026-07-18T03:00:00Z',
            room_code: 'PK-305',
            clinical_order_id: 'SIM-ORDER-001',
            reservation_id: null,
          },
        ]}
        isActivitiesLoading={false}
        hasActivitiesError={false}
        onRetryActivities={() => undefined}
        scheduleStrategy="balanced"
        currentStep={0}
        onRegenerateJourney={() => undefined}
        onCompleteCurrentService={() => undefined}
        onViewMap={() => undefined}
        onOpenNotifications={onOpenNotifications}
      />,
    )

    expect(screen.getByText('Hoạt động hôm nay')).toBeInTheDocument()
    expect(screen.getByText('Đã nhận 2 chỉ định mới')).toBeInTheDocument()
    expect(screen.queryByText('Đăng ký khám')).not.toBeInTheDocument()
    expect(screen.queryByText('Đo huyết áp & sinh hiệu')).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Thông báo và hoạt động' }))
    expect(onOpenNotifications).toHaveBeenCalledOnce()
  })

  it('đổi ưu tiên mới tạo lại lộ trình và nút hoàn thành chuyển bước sau xác nhận', () => {
    const onRegenerateJourney = vi.fn()
    const onCompleteCurrentService = vi.fn()

    const { rerender } = render(
      <DashboardScreen
        order={order}
        activities={[]}
        isActivitiesLoading={false}
        hasActivitiesError={false}
        onRetryActivities={() => undefined}
        scheduleStrategy="balanced"
        currentStep={0}
        routeOptionId="OPTION-TEST"
        onRegenerateJourney={onRegenerateJourney}
        onCompleteCurrentService={onCompleteCurrentService}
        onViewMap={() => undefined}
        onOpenNotifications={() => undefined}
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Lịch trình' }))

    expect(screen.queryByText('Xem hành trình xét nghiệm')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Xem đường đi' })).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Tôi đã hoàn thành dịch vụ này' }))
    expect(onCompleteCurrentService).not.toHaveBeenCalled()

    fireEvent.click(screen.getByRole('button', { name: 'Xác nhận đã khám xong' }))
    expect(onCompleteCurrentService).toHaveBeenCalledOnce()

    rerender(
      <DashboardScreen
        order={order}
        activities={[]}
        isActivitiesLoading={false}
        hasActivitiesError={false}
        onRetryActivities={() => undefined}
        scheduleStrategy="balanced"
        currentStep={1}
        routeOptionId="OPTION-TEST"
        onRegenerateJourney={onRegenerateJourney}
        onCompleteCurrentService={onCompleteCurrentService}
        onViewMap={() => undefined}
        onOpenNotifications={() => undefined}
      />,
    )

    const nextServiceCard = screen.getByText('Tổng phân tích nước tiểu').closest<HTMLElement>('div.flex-1.bg-card')
    expect(nextServiceCard).not.toBeNull()
    expect(within(nextServiceCard!).getByText('Đang thực hiện')).toBeInTheDocument()

    fireEvent.click(screen.getByText('Đang ưu tiên').closest('button')!)
    fireEvent.click(screen.getByRole('button', { name: /Ưu tiên thời gian vào khám/ }))

    expect(onRegenerateJourney).toHaveBeenCalledWith('finish_early')
  })
})
