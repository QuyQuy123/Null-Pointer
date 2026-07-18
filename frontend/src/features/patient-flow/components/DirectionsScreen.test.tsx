/* @vitest-environment jsdom */

import '@testing-library/jest-dom/vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { DirectionsScreen } from './DirectionsScreen'


describe('DirectionsScreen', () => {
  it('chỉ hoàn thành dịch vụ sau khi bệnh nhân xác nhận', () => {
    const onServiceCompleted = vi.fn()

    render(
      <DirectionsScreen
        origin="Phòng xét nghiệm máu 113"
        destination="Phòng X-quang 201"
        roomCode="XQ-201"
        floor="Tầng 2"
        distance="Di chuyển dự kiến 4 phút"
        onServiceCompleted={onServiceCompleted}
        onBack={() => undefined}
      />,
    )

    expect(screen.getAllByRole('button', { name: 'Tôi đã khám xong' })).toHaveLength(2)
    expect(screen.queryByRole('button', { name: 'Tôi đã đến' })).not.toBeInTheDocument()
    expect(screen.getAllByText('Phòng xét nghiệm máu 113').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Phòng X-quang 201').length).toBeGreaterThan(0)

    fireEvent.click(screen.getAllByRole('button', { name: 'Tôi đã khám xong' })[1])

    expect(onServiceCompleted).not.toHaveBeenCalled()
    expect(screen.getByRole('dialog', { name: 'Xác nhận đã khám xong?' })).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Xác nhận đã khám xong' }))

    expect(onServiceCompleted).toHaveBeenCalledOnce()
  })
})
