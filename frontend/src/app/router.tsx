import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { PatientLayout } from './layouts/PatientLayout'
import { SimulationPage } from '../features/demo-simulation/pages/SimulationPage'
import PatientFlowPage from '../features/patient-flow/pages/PatientFlowPage'

const router = createBrowserRouter([
  {
    path: '/demo',
    element: <PatientLayout />,
    children: [
      { path: 'simulation', element: <SimulationPage /> },
    ],
  },
  { path: '*', element: <PatientFlowPage /> },
])

export function AppRouter() {
  return <RouterProvider router={router} />
}
