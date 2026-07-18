import type { ScheduleStrategy } from '../../../entities/care-route/model/care-route.types'

export type { ScheduleStrategy }

export type RouteId = 'recommended' | 'lessWalk' | 'lessCrowd'

export type Priority =
  | 'system'
  | 'fastest'
  | 'lessWalk'
  | 'lessCrowd'
  | 'accessible'

export interface PatientRouteStep {
  id: string
  serviceCode: string
  serviceName: string
  roomCode: string
  roomName: string
  floor: string
  waitMinutesMin: number
  waitMinutesMax: number
  serviceMinutes: number
  travelMinutes: number
  isLocked: boolean
  lockReason?: string
}

export interface Route {
  id: RouteId
  proposalId: string
  backendOptionId: string
  encounterId: string
  label: string
  badge: 'KHUYẾN NGHỊ' | 'ÍT ĐI BỘ' | 'ÍT ĐÔNG'
  badgeColor: string
  duration: string
  steps: string[]
  stepDetails: PatientRouteStep[]
  distance: number
  floorChanges: number
  reason: string
  updatedAt: string
  expiresAt: string
  waitTimes: string[]
}

export interface RouteReservation {
  id: string
  encounterId: string
  routeProposalId: string
  routeOptionId: string
  status: 'held' | 'confirmed' | 'expired' | 'released'
  expiresAt: string
  journeyId?: string
  extensionCount: number
  patientCode?: string
  clinicalOrderId?: string
  currentStep: number
  journeyStatus: 'not_started' | 'active' | 'completed'
}
