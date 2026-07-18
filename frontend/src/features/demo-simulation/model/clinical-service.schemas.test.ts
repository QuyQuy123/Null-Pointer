import { describe, expect, it } from 'vitest'
import { clinicalServiceFeedSchema } from './clinical-service.schemas'

describe('hợp đồng dữ liệu cận lâm sàng giả lập', () => {
  it('đọc được phản hồi đúng phiên bản hợp đồng', () => {
    const result = clinicalServiceFeedSchema.parse({
      contract_version: 'clinical-service-feed.v1',
      source_system: 'hospital-simulator',
      is_simulation: true,
      generated_at: '2026-07-18T03:00:00Z',
      total: 1,
      services: [
        {
          code: 'LAB-HEMA',
          name: 'Huyết học',
          service_group: 'laboratory',
          room_service_type: 'blood_test',
          description: 'Tổng phân tích tế bào máu',
          execution_minutes_min: 3,
          execution_minutes_max: 5,
          turnaround_minutes_min: 45,
          turnaround_minutes_max: 60,
          fasting_policy: 'not_required',
          fasting_hours_min: null,
          fasting_hours_max: null,
          scheduling_priority: 'flow_start',
          notes: null,
          room_locations: ['101 K1'],
          active: true,
          version: 1,
          created_at: '2026-07-18T03:00:00Z',
          updated_at: '2026-07-18T03:00:00Z',
        },
      ],
    })

    expect(result.services[0].code).toBe('LAB-HEMA')
    expect(result.services[0].turnaround_minutes_max).toBe(60)
  })
})
