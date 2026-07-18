import { z } from 'zod'
import { apiRequest } from '../../../shared/api/http-client'
import type {
  Route,
  RouteId,
  RouteReservation,
  ScheduleStrategy,
  Priority,
} from '../model/patient-flow.types'

const routeStepSchema = z.object({
  id: z.string(),
  service_code: z.string(),
  service_name: z.string(),
  room_code: z.string(),
  room_name: z.string(),
  floor: z.string(),
  wait_minutes_min: z.number(),
  wait_minutes_max: z.number(),
  service_minutes: z.number(),
  travel_minutes: z.number(),
  is_locked: z.boolean(),
  lock_reason: z.string().nullable(),
})

const routeOptionSchema = z.object({
  id: z.string(),
  label: z.enum(['recommended', 'less_walk', 'less_crowd']),
  duration_minutes_min: z.number(),
  duration_minutes_max: z.number(),
  distance_meters: z.number(),
  floor_changes: z.number(),
  reason: z.string(),
  steps: z.array(routeStepSchema),
})

const routeProposalSchema = z.object({
  id: z.string(),
  encounter_id: z.string(),
  updated_at: z.string(),
  expires_at: z.string(),
  options: z.array(routeOptionSchema),
})

const reservationSchema = z.object({
  id: z.string(),
  encounter_id: z.string(),
  route_proposal_id: z.string(),
  route_option_id: z.string(),
  status: z.enum(['held', 'confirmed', 'expired', 'released']),
  expires_at: z.string(),
  journey_id: z.string().nullable(),
  extension_count: z.number(),
})

const supportResponseSchema = z.object({
  id: z.string(),
  status: z.string(),
  estimated_response_minutes_min: z.number(),
  estimated_response_minutes_max: z.number(),
})

const priorityMap: Record<Priority, string> = {
  system: 'system',
  fastest: 'fastest',
  lessWalk: 'less_walk',
  lessCrowd: 'less_crowd',
  accessible: 'accessible',
}

const labelConfig = {
  recommended: {
    id: 'recommended',
    label: 'Khuyến nghị',
    badge: 'KHUYẾN NGHỊ',
    badgeColor: 'bg-primary text-primary-foreground',
  },
  less_walk: {
    id: 'lessWalk',
    label: 'Ít đi bộ',
    badge: 'ÍT ĐI BỘ',
    badgeColor: 'bg-emerald-600 text-white',
  },
  less_crowd: {
    id: 'lessCrowd',
    label: 'Ít đông',
    badge: 'ÍT ĐÔNG',
    badgeColor: 'bg-violet-600 text-white',
  },
} as const

export async function createRouteProposal(
  priority: Priority,
  scheduleStrategy: ScheduleStrategy,
): Promise<Route[]> {
  const proposal = await apiRequest(
    '/encounters/TM-2026-00847/route-proposals',
    routeProposalSchema,
    {
      method: 'POST',
      body: JSON.stringify({
        priority: priorityMap[priority],
        schedule_strategy: scheduleStrategy,
      }),
    },
  )

  return proposal.options.map((option) => {
    const display = labelConfig[option.label]
    const visibleSteps = option.steps.filter(
      (step) => step.service_code !== 'doctor_return',
    )
    return {
      id: display.id as RouteId,
      proposalId: proposal.id,
      backendOptionId: option.id,
      encounterId: proposal.encounter_id,
      label: display.label,
      badge: display.badge,
      badgeColor: display.badgeColor,
      duration: `${option.duration_minutes_min}–${option.duration_minutes_max} phút`,
      steps: visibleSteps.map(
        (step) => `${step.room_name} — ${step.floor}`,
      ),
      stepDetails: option.steps.map((step) => ({
        id: step.id,
        serviceCode: step.service_code,
        serviceName: step.service_name,
        roomCode: step.room_code,
        roomName: step.room_name,
        floor: step.floor,
        waitMinutesMin: step.wait_minutes_min,
        waitMinutesMax: step.wait_minutes_max,
        serviceMinutes: step.service_minutes,
        travelMinutes: step.travel_minutes,
        isLocked: step.is_locked,
        lockReason: step.lock_reason ?? undefined,
      })),
      distance: option.distance_meters,
      floorChanges: option.floor_changes,
      reason: option.reason,
      updatedAt: 'vừa xong',
      expiresAt: proposal.expires_at,
      waitTimes: visibleSteps.map(
        (step) => `${step.wait_minutes_min}–${step.wait_minutes_max} phút`,
      ),
    }
  })
}

function mapReservation(
  value: z.infer<typeof reservationSchema>,
): RouteReservation {
  return {
    id: value.id,
    encounterId: value.encounter_id,
    routeProposalId: value.route_proposal_id,
    routeOptionId: value.route_option_id,
    status: value.status,
    expiresAt: value.expires_at,
    journeyId: value.journey_id ?? undefined,
    extensionCount: value.extension_count,
  }
}

export async function createRouteReservation(
  route: Route,
): Promise<RouteReservation> {
  const response = await apiRequest('/route-reservations', reservationSchema, {
    method: 'POST',
    body: JSON.stringify({
      encounter_id: route.encounterId,
      route_proposal_id: route.proposalId,
      route_option_id: route.backendOptionId,
      idempotency_key: `${route.encounterId}-${route.proposalId}-${route.backendOptionId}`,
    }),
  })
  return mapReservation(response)
}

export async function confirmRouteReservation(
  reservationId: string,
): Promise<RouteReservation> {
  const response = await apiRequest(
    `/route-reservations/${reservationId}/confirm`,
    reservationSchema,
    { method: 'POST', body: '{}' },
  )
  return mapReservation(response)
}

export async function extendRouteReservation(
  reservationId: string,
): Promise<RouteReservation> {
  const response = await apiRequest(
    `/route-reservations/${reservationId}/extend`,
    reservationSchema,
    { method: 'POST', body: '{}' },
  )
  return mapReservation(response)
}

export type SupportType =
  | 'staff'
  | 'wheelchair'
  | 'directions'
  | 'visual_assistance'

export async function createSupportRequest(type: SupportType) {
  return apiRequest('/support-requests', supportResponseSchema, {
    method: 'POST',
    body: JSON.stringify({
      encounter_id: 'TM-2026-00847',
      support_type: type,
      location: 'Tầng 2, khu A',
    }),
  })
}
