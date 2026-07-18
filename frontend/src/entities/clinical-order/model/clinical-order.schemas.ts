import { z } from 'zod'

const roomServiceTypeSchema = z.enum([
  'blood_test',
  'urine_test',
  'xray',
  'ultrasound',
  'ct_scan',
])

const fastingPolicySchema = z.enum([
  'not_required',
  'required',
  'conditional',
])

const matchedRoomSchema = z.object({
  code: z.string(),
  location_code: z.string(),
  name: z.string(),
  floor: z.string(),
  status: z.string(),
  waiting_patients: z.number().int().nonnegative(),
  estimated_wait_minutes: z.number().int().nonnegative(),
})

const dispatchedOrderItemSchema = z.object({
  service_code: z.string(),
  service_name: z.string(),
  room_service_type: roomServiceTypeSchema,
  fasting_policy: fastingPolicySchema,
  fasting_hours_min: z.number().int().nonnegative().nullable(),
  fasting_hours_max: z.number().int().nonnegative().nullable(),
  notes: z.string().nullable(),
  configured_room_locations: z.array(z.string()),
  matched_rooms: z.array(matchedRoomSchema),
})

const routeStepSchema = z.object({
  id: z.string(),
  order: z.number().int().positive(),
  service_code: z.string(),
  service_name: z.string(),
  room_code: z.string(),
  room_name: z.string(),
  floor: z.string(),
  wait_minutes_min: z.number().int().nonnegative(),
  wait_minutes_max: z.number().int().nonnegative(),
  service_minutes: z.number().int().positive(),
  travel_minutes: z.number().int().nonnegative(),
  arrival_minutes: z.number().int().nonnegative(),
  complete_minutes: z.number().int().nonnegative(),
  result_ready_minutes: z.number().int().nonnegative(),
  is_locked: z.boolean(),
  lock_reason: z.string().nullable(),
})

const routeOptionSchema = z.object({
  id: z.string(),
  label: z.enum(['recommended', 'less_walk', 'less_crowd']),
  duration_minutes_min: z.number().int().nonnegative(),
  duration_minutes_max: z.number().int().nonnegative(),
  distance_meters: z.number().int().nonnegative(),
  floor_changes: z.number().int().nonnegative(),
  total_wait_minutes: z.number().int().nonnegative(),
  reason: z.string(),
  steps: z.array(routeStepSchema),
})

const routeProposalSchema = z.object({
  id: z.string(),
  encounter_id: z.string(),
  algorithm_version: z.string(),
  updated_at: z.string(),
  expires_at: z.string(),
  warnings: z.array(z.string()),
  options: z.array(routeOptionSchema),
})

export const clinicalOrderDispatchSchema = z.object({
  id: z.string(),
  status: z.literal('routed'),
  patient_code: z.string(),
  patient_name: z.string(),
  encounter_id: z.string(),
  doctor_name: z.string(),
  doctor_room_code: z.string(),
  created_at: z.string(),
  items: z.array(dispatchedOrderItemSchema),
  route_proposal: routeProposalSchema,
})

export type ClinicalOrderDispatch = z.infer<typeof clinicalOrderDispatchSchema>
export type ClinicalOrderItem = ClinicalOrderDispatch['items'][number]

export interface DispatchClinicalOrderPayload {
  patient_code: string
  patient_name: string
  encounter_id: string
  doctor_name: string
  doctor_room_code: string
  clinical_service_codes: string[]
  priority: 'system' | 'fastest' | 'less_walk' | 'less_crowd' | 'accessible'
  schedule_strategy: 'balanced' | 'finish_early' | 'leave_fast'
}
