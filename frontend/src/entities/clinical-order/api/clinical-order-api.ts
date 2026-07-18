import { apiRequest } from '../../../shared/api/http-client'
import {
  clinicalOrderDispatchSchema,
  type ClinicalOrderDispatch,
  type DispatchClinicalOrderPayload,
} from '../model/clinical-order.schemas'

export function dispatchClinicalOrder(
  payload: DispatchClinicalOrderPayload,
): Promise<ClinicalOrderDispatch> {
  return apiRequest('/simulation/clinical-orders', clinicalOrderDispatchSchema, {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function getLatestPatientOrder(
  patientCode: string,
): Promise<ClinicalOrderDispatch> {
  return apiRequest(
    `/simulation/patients/${encodeURIComponent(patientCode)}/clinical-orders/latest`,
    clinicalOrderDispatchSchema,
  )
}
