import { describe, expect, it } from 'vitest'
import type { ClinicalOrderDispatch } from '../../../entities/clinical-order/model/clinical-order.schemas'
import { mapClinicalOrderRoutes } from './patient-flow-api'

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
      service_code: 'LAB-BIOCHEM',
      service_name: 'Sinh hóa máu cơ bản',
      room_service_type: 'blood_test',
      fasting_policy: 'required',
      fasting_hours_min: 6,
      fasting_hours_max: 10,
      notes: 'Lấy mẫu trước khi ăn.',
      configured_room_locations: ['103 K1'],
      matched_rooms: [
        {
          code: 'XN-103',
          location_code: '103 K1',
          name: 'Phòng lấy máu 03',
          floor: 'Tầng 1',
          status: 'available',
          waiting_patients: 0,
          estimated_wait_minutes: 0,
        },
      ],
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
        duration_minutes_min: 70,
        duration_minutes_max: 80,
        distance_meters: 120,
        floor_changes: 2,
        total_wait_minutes: 10,
        reason: 'Phòng đang trống.',
        steps: [
          {
            id: 'STEP-LAB',
            order: 1,
            service_code: 'blood_test',
            service_name: 'Sinh hóa máu cơ bản',
            room_code: 'XN-103',
            room_name: 'Phòng lấy máu 03',
            floor: 'Tầng 1',
            wait_minutes_min: 0,
            wait_minutes_max: 2,
            service_minutes: 9,
            travel_minutes: 4,
            arrival_minutes: 4,
            complete_minutes: 15,
            result_ready_minutes: 70,
            is_locked: true,
            lock_reason: 'Cần lấy mẫu trước.',
          },
          {
            id: 'STEP-DOCTOR',
            order: 2,
            service_code: 'doctor_return',
            service_name: 'Quay lại bác sĩ',
            room_code: 'PK-305',
            room_name: 'Phòng khám Tim mạch 05',
            floor: 'Tầng 3',
            wait_minutes_min: 20,
            wait_minutes_max: 30,
            service_minutes: 12,
            travel_minutes: 4,
            arrival_minutes: 19,
            complete_minutes: 80,
            result_ready_minutes: 80,
            is_locked: true,
            lock_reason: 'Chờ đủ kết quả.',
          },
        ],
      },
    ],
  },
}

describe('mapClinicalOrderRoutes', () => {
  it('giữ nguyên phòng từ chỉ định đã lưu khi tạo dữ liệu giao diện', () => {
    const routes = mapClinicalOrderRoutes(order)

    expect(routes).toHaveLength(1)
    expect(routes[0].steps).toEqual(['Phòng lấy máu 03 — Tầng 1'])
    expect(routes[0].stepDetails).toHaveLength(2)
    expect(routes[0].stepDetails[1].roomCode).toBe('PK-305')
  })
})
