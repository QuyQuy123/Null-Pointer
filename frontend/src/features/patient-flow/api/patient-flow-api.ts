import { z } from 'zod'
import { apiRequest } from '../../../shared/api/http-client'
import type {
  Route,
  RouteId,
  RouteReservation,
} from '../model/patient-flow.types'
import type { ClinicalOrderDispatch } from '../../../entities/clinical-order/model/clinical-order.schemas'

const reservationSchema = z.object({
  id: z.string(),
  encounter_id: z.string(),
  route_proposal_id: z.string(),
  route_option_id: z.string(),
  status: z.enum(['held', 'confirmed', 'expired', 'released']),
  expires_at: z.string(),
  journey_id: z.string().nullable(),
  extension_count: z.number(),
  patient_code: z.string().nullable(),
  clinical_order_id: z.string().nullable(),
  current_step: z.number().int().nonnegative(),
  journey_status: z.enum(['not_started', 'active', 'completed']),
})

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

const routeUpdateTimeFormatter = new Intl.DateTimeFormat('vi-VN', {
  hour: '2-digit',
  minute: '2-digit',
})

export function mapClinicalOrderRoutes(order: ClinicalOrderDispatch): Route[] {
  const proposal = order.route_proposal

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
      updatedAt: routeUpdateTimeFormatter.format(new Date(proposal.updated_at)),
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
    patientCode: value.patient_code ?? undefined,
    clinicalOrderId: value.clinical_order_id ?? undefined,
    currentStep: value.current_step,
    journeyStatus: value.journey_status,
  }
}

export async function createRouteReservation(
  route: Route,
  patientCode: string,
  clinicalOrderId: string,
): Promise<RouteReservation> {
  const response = await apiRequest('/route-reservations', reservationSchema, {
    method: 'POST',
    body: JSON.stringify({
      encounter_id: route.encounterId,
      route_proposal_id: route.proposalId,
      route_option_id: route.backendOptionId,
      idempotency_key: `${route.encounterId}-${route.proposalId}-${route.backendOptionId}`,
      patient_code: patientCode,
      clinical_order_id: clinicalOrderId,
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

export async function getLatestPatientReservation(
  patientCode: string,
): Promise<RouteReservation> {
  const response = await apiRequest(
    `/route-reservations/patients/${encodeURIComponent(patientCode)}/latest`,
    reservationSchema,
  )
  return mapReservation(response)
}

export async function updateJourneyProgress(
  reservationId: string,
  currentStep: number,
  journeyStatus: RouteReservation['journeyStatus'],
): Promise<RouteReservation> {
  const response = await apiRequest(
    `/route-reservations/${encodeURIComponent(reservationId)}/progress`,
    reservationSchema,
    {
      method: 'PATCH',
      body: JSON.stringify({
        current_step: currentStep,
        journey_status: journeyStatus,
      }),
    },
  )
  return mapReservation(response)
}
