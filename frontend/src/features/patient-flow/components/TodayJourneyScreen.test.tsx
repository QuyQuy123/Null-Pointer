/* @vitest-environment jsdom */

import '@testing-library/jest-dom/vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import type { Route } from '../model/patient-flow.types'
import { TodayJourneyScreen } from './TodayJourneyScreen'

const route: Route = {
  id: 'recommended',
  proposalId: 'proposal-1',
  backendOptionId: 'option-1',
  encounterId: 'encounter-1',
  label: 'Lộ trình cân bằng',
  badge: 'KHUYẾN NGHỊ',
  badgeColor: '#0B6E6E',
  duration: '30 phút',
  steps: ['Xét nghiệm máu'],
  stepDetails: [
    {
      id: 'step-1',
      serviceCode: 'blood_test',
      serviceName: 'Xét nghiệm máu',
      roomCode: 'XN-113',
      roomName: 'Phòng xét nghiệm máu 113',
      floor: 'Tầng 1',
      waitMinutesMin: 5,
      waitMinutesMax: 10,
      serviceMinutes: 5,
      travelMinutes: 3,
      isLocked: false,
    },
  ],
  distance: 80,
  floorChanges: 0,
  reason: 'Thời gian chờ phù hợp',
  updatedAt: '2026-07-18T08:00:00Z',
  expiresAt: '2026-07-18T08:05:00Z',
  waitTimes: ['5–10 phút'],
}

describe('TodayJourneyScreen', () => {
  it('chỉ chuyển bước lịch trình sau khi bệnh nhân xác nhận', () => {
    const onStepDone = vi.fn()

    render(
      <TodayJourneyScreen
        route={route}
        currentStep={0}
        onShowDirections={() => undefined}
        onStepDone={onStepDone}
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Tôi đã khám xong' }))

    expect(onStepDone).not.toHaveBeenCalled()
    expect(screen.getAllByText('Phòng xét nghiệm máu 113', { exact: false })).toHaveLength(2)

    fireEvent.click(screen.getByRole('button', { name: 'Xác nhận đã khám xong' }))

    expect(onStepDone).toHaveBeenCalledOnce()
  })
})
