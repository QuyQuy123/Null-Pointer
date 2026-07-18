import { lazy, Suspense } from 'react'
import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom'
import PatientFlowPage from '../features/patient-flow/pages/PatientFlowPage'

const SimulationPage = lazy(() =>
  import('../features/demo-simulation/pages/SimulationPage').then((module) => ({
    default: module.SimulationPage,
  })),
)

const ClinicalServiceCatalogPage = lazy(() =>
  import('../features/demo-simulation/pages/ClinicalServiceCatalogPage').then(
    (module) => ({ default: module.ClinicalServiceCatalogPage }),
  ),
)

const router = createBrowserRouter([
  {
    path: '/demo/order-dispatch',
    element: <Navigate to="/demo/simulator?tab=orders" replace />,
  },
  {
    path: '/demo/simulation',
    element: <Navigate to="/demo/simulator" replace />,
  },
  {
    path: '/demo/simulator',
    element: (
      <Suspense fallback={<p className="standalone-error">Đang tải hệ thống giả lập…</p>}>
        <SimulationPage />
      </Suspense>
    ),
  },
  {
    path: '/demo/patient/:patientCode',
    element: <PatientFlowPage />,
  },
  {
    path: '/demo/hospital-data',
    element: (
      <Suspense fallback={<p className="standalone-error">Đang tải trang nhập dữ liệu…</p>}>
        <ClinicalServiceCatalogPage />
      </Suspense>
    ),
  },
  { path: '*', element: <PatientFlowPage /> },
])

export function AppRouter() {
  return <RouterProvider router={router} />
}
