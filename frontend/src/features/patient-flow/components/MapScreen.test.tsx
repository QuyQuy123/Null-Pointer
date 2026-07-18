/* @vitest-environment jsdom */

import '@testing-library/jest-dom/vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { MapScreen } from './MapScreen'

describe('MapScreen', () => {
  it('yêu cầu xác nhận trước khi chuyển sang điểm tiếp theo', () => {
    const onServiceCompleted = vi.fn()

    render(
      <MapScreen
        destination="Phòng X-quang 201"
        floor="Tầng 2"
        travelMinutes={4}
        onServiceCompleted={onServiceCompleted}
        onBack={() => undefined}
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Tôi đã khám xong' }))

    expect(onServiceCompleted).not.toHaveBeenCalled()
    expect(screen.getByRole('dialog', { name: 'Xác nhận đã khám xong?' })).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Xác nhận đã khám xong' }))

    expect(onServiceCompleted).toHaveBeenCalledOnce()
  })
})
