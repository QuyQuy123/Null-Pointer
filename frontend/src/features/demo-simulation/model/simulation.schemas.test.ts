import { describe, expect, it } from 'vitest'
import { simulationSnapshotSchema } from './simulation.schemas'

describe('dữ liệu mô phỏng', () => {
  it('chấp nhận ảnh chụp trạng thái hợp lệ từ backend', () => {
    const parsed = simulationSnapshotSchema.parse({
      scenario_id: 'hospital-day-demo-v1',
      is_demo: true,
      data_notice: 'Dữ liệu giả lập.',
      tick: 0,
      simulation_time: '2026-07-18T08:00:00Z',
      updated_at: '2026-07-18T08:00:00Z',
      summary: {
        total_rooms: 1,
        available_rooms: 1,
        serving_rooms: 0,
        overloaded_rooms: 0,
        paused_rooms: 0,
        waiting_patients: 0,
        in_service_patients: 0,
        completed_patients: 0,
        average_wait_minutes: 0,
        longest_wait_minutes: 0,
      },
      rooms: [
        {
          code: 'XN-101',
          name: 'Phòng lấy máu 01',
          department: 'Xét nghiệm',
          floor: 'Tầng 1',
          service_type: 'blood_test',
          status: 'available',
          equipment_status: 'operational',
          waiting_patients: 0,
          waiting_patient_codes: [],
          current_patient_code: null,
          average_service_minutes: 8,
          estimated_wait_minutes: 0,
          status_reason: null,
          updated_at: '2026-07-18T08:00:00Z',
        },
      ],
      patients: [],
      recent_events: [],
    })

    expect(parsed.rooms[0].status).toBe('available')
    expect(parsed.is_demo).toBe(true)
  })
})
