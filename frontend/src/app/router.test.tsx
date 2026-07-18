import '@testing-library/jest-dom/vitest'
import { render, screen } from '@testing-library/react'
import { RouterProvider, createMemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { DashboardPage } from '../features/patient-home/pages/DashboardPage'

describe('bộ định tuyến ứng dụng', () => {
  it('hiển thị trang Hành trình hôm nay và đường dẫn mô phỏng', () => {
    const testRouter = createMemoryRouter([
      { path: '/', element: <DashboardPage /> },
    ])

    render(<RouterProvider router={testRouter} />)

    expect(screen.getByRole('heading', { name: 'Hành trình hôm nay' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Mở hệ thống mô phỏng' })).toHaveAttribute(
      'href',
      '/demo/simulation',
    )
  })
})
