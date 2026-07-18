import { z } from 'zod'

export const roomStatusSchema = z.enum([
  'available',
  'serving',
  'overloaded',
  'paused',
])

const equipmentStatusSchema = z.enum(['operational', 'maintenance'])
const patientStatusSchema = z.enum(['waiting', 'in_service', 'completed'])
const demoPrioritySchema = z.enum(['normal', 'priority'])

const roomSnapshotSchema = z.object({
  code: z.string(),
  name: z.string(),
  department: z.string(),
  floor: z.string(),
  service_type: z.string(),
  status: roomStatusSchema,
  equipment_status: equipmentStatusSchema,
  waiting_patients: z.number().int().nonnegative(),
  waiting_patient_codes: z.array(z.string()),
  current_patient_code: z.string().nullable(),
  average_service_minutes: z.number().int().positive(),
  estimated_wait_minutes: z.number().int().nonnegative(),
  status_reason: z.string().nullable(),
  updated_at: z.string(),
})

const patientSnapshotSchema = z.object({
  code: z.string(),
  priority: demoPrioritySchema,
  status: patientStatusSchema,
  current_room_code: z.string().nullable(),
  current_step: z.number().int().nonnegative(),
  total_steps: z.number().int().positive(),
  route_room_codes: z.array(z.string()),
  queued_at: z.string().nullable(),
})

const eventSchema = z.object({
  id: z.string(),
  type: z.string(),
  message: z.string(),
  occurred_at: z.string(),
  room_code: z.string().nullable(),
  patient_code: z.string().nullable(),
})

export const simulationSnapshotSchema = z.object({
  scenario_id: z.string(),
  is_demo: z.literal(true),
  data_notice: z.string(),
  tick: z.number().int().nonnegative(),
  simulation_time: z.string(),
  updated_at: z.string(),
  summary: z.object({
    total_rooms: z.number().int().nonnegative(),
    available_rooms: z.number().int().nonnegative(),
    serving_rooms: z.number().int().nonnegative(),
    overloaded_rooms: z.number().int().nonnegative(),
    paused_rooms: z.number().int().nonnegative(),
    waiting_patients: z.number().int().nonnegative(),
    in_service_patients: z.number().int().nonnegative(),
    completed_patients: z.number().int().nonnegative(),
    average_wait_minutes: z.number().int().nonnegative(),
    longest_wait_minutes: z.number().int().nonnegative(),
  }),
  rooms: z.array(roomSnapshotSchema),
  patients: z.array(patientSnapshotSchema),
  recent_events: z.array(eventSchema),
})

export type RoomStatus = z.infer<typeof roomStatusSchema>
export type SimulationSnapshot = z.infer<typeof simulationSnapshotSchema>
