import { apiRequest } from '../../../shared/api/http-client'
import {
  clinicalServiceFeedSchema,
  clinicalServiceSchema,
  type ClinicalService,
  type ClinicalServiceFeed,
  type CreateClinicalServicePayload,
  type UpdateClinicalServicePayload,
} from '../model/clinical-service.schemas'

const catalogPath = '/simulation/clinical-services'

export function getClinicalServices(): Promise<ClinicalServiceFeed> {
  return apiRequest(`${catalogPath}?include_inactive=true`, clinicalServiceFeedSchema)
}

export function createClinicalService(
  payload: CreateClinicalServicePayload,
): Promise<ClinicalService> {
  return apiRequest(catalogPath, clinicalServiceSchema, {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function updateClinicalService(
  code: string,
  payload: UpdateClinicalServicePayload,
): Promise<ClinicalService> {
  return apiRequest(
    `${catalogPath}/${encodeURIComponent(code)}`,
    clinicalServiceSchema,
    {
      method: 'PUT',
      body: JSON.stringify(payload),
    },
  )
}

export function deactivateClinicalService(
  code: string,
  expectedVersion: number,
): Promise<ClinicalService> {
  return apiRequest(
    `${catalogPath}/${encodeURIComponent(code)}?expected_version=${expectedVersion}`,
    clinicalServiceSchema,
    { method: 'DELETE' },
  )
}
