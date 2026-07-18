import { apiRequest } from '../../../shared/api/http-client'
import {
  simulationSnapshotSchema,
  type CreateSimulationRoomPayload,
  type SimulationSnapshot,
} from '../model/simulation.schemas'

export function getSimulationSnapshot(): Promise<SimulationSnapshot> {
  return apiRequest('/simulation/snapshot', simulationSnapshotSchema)
}

export function advanceSimulation(minutes = 5): Promise<SimulationSnapshot> {
  return apiRequest('/simulation/advance', simulationSnapshotSchema, {
    method: 'POST',
    body: JSON.stringify({ minutes }),
  })
}

export function resetSimulation(): Promise<SimulationSnapshot> {
  return apiRequest('/simulation/reset', simulationSnapshotSchema, {
    method: 'POST',
  })
}

export function updateRoomOperation(
  roomCode: string,
  operational: boolean,
): Promise<SimulationSnapshot> {
  return apiRequest(
    `/simulation/rooms/${encodeURIComponent(roomCode)}`,
    simulationSnapshotSchema,
    {
      method: 'PATCH',
      body: JSON.stringify({
        operational,
        reason: operational ? null : 'Giả lập sự cố thiết bị từ màn hình demo.',
      }),
    },
  )
}

export function createSimulationRoom(
  payload: CreateSimulationRoomPayload,
): Promise<SimulationSnapshot> {
  return apiRequest('/simulation/rooms', simulationSnapshotSchema, {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function adjustRoomQueue(
  roomCode: string,
  delta: number,
): Promise<SimulationSnapshot> {
  return apiRequest(
    `/simulation/rooms/${encodeURIComponent(roomCode)}/queue`,
    simulationSnapshotSchema,
    {
      method: 'PATCH',
      body: JSON.stringify({ delta }),
    },
  )
}
