import { z } from 'zod'

export const clinicalServiceGroupSchema = z.enum([
  'laboratory',
  'imaging',
  'functional_diagnostics',
  'other',
])

export const fastingPolicySchema = z.enum([
  'not_required',
  'required',
  'conditional',
])

export const schedulingPrioritySchema = z.enum([
  'flow_start',
  'morning',
  'long_turnaround',
  'flexible',
])

export const roomServiceTypeSchema = z.enum([
  'blood_test',
  'urine_test',
  'xray',
  'ultrasound',
  'ct_scan',
])

export const clinicalServiceSchema = z.object({
  code: z.string(),
  name: z.string(),
  service_group: clinicalServiceGroupSchema,
  room_service_type: roomServiceTypeSchema,
  description: z.string().nullable(),
  execution_minutes_min: z.number().int().positive(),
  execution_minutes_max: z.number().int().positive(),
  turnaround_minutes_min: z.number().int().nonnegative(),
  turnaround_minutes_max: z.number().int().nonnegative(),
  fasting_policy: fastingPolicySchema,
  fasting_hours_min: z.number().int().nonnegative().nullable(),
  fasting_hours_max: z.number().int().nonnegative().nullable(),
  scheduling_priority: schedulingPrioritySchema,
  notes: z.string().nullable(),
  room_locations: z.array(z.string()),
  active: z.boolean(),
  version: z.number().int().positive(),
  created_at: z.string(),
  updated_at: z.string(),
})

export const clinicalServiceFeedSchema = z.object({
  contract_version: z.literal('clinical-service-feed.v1'),
  source_system: z.string(),
  is_simulation: z.boolean(),
  generated_at: z.string(),
  total: z.number().int().nonnegative(),
  services: z.array(clinicalServiceSchema),
})

export type ClinicalService = z.infer<typeof clinicalServiceSchema>
export type ClinicalServiceFeed = z.infer<typeof clinicalServiceFeedSchema>
export type ClinicalServiceGroup = z.infer<typeof clinicalServiceGroupSchema>
export type FastingPolicy = z.infer<typeof fastingPolicySchema>
export type SchedulingPriority = z.infer<typeof schedulingPrioritySchema>
export type RoomServiceType = z.infer<typeof roomServiceTypeSchema>

export interface ClinicalServicePayload {
  name: string
  service_group: ClinicalServiceGroup
  room_service_type: RoomServiceType
  description: string | null
  execution_minutes_min: number
  execution_minutes_max: number
  turnaround_minutes_min: number
  turnaround_minutes_max: number
  fasting_policy: FastingPolicy
  fasting_hours_min: number | null
  fasting_hours_max: number | null
  scheduling_priority: SchedulingPriority
  notes: string | null
  room_locations: string[]
  active: boolean
}

export interface CreateClinicalServicePayload extends ClinicalServicePayload {
  code: string
}

export interface UpdateClinicalServicePayload extends ClinicalServicePayload {
  expected_version: number
}
