import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { PriorityScreen } from './PriorityScreen'

describe('PriorityScreen', () => {
  it('chỉ hiển thị ba chiến lược sắp lịch trình và trả về lựa chọn hiện tại', () => {
    const onContinue = vi.fn()
    const { container } = render(
      <PriorityScreen
        onBack={vi.fn()}
        scheduleStrategy="balanced"
        onContinue={onContinue}
      />,
    )

    expect(container.querySelectorAll('button[aria-pressed]')).toHaveLength(3)
    expect(screen.getByText('Cân bằng')).toBeTruthy()
    expect(screen.getByText('Ưu tiên thời gian vào khám')).toBeTruthy()
    expect(screen.getByText('Ưu tiên kết quả đến tay bác sĩ')).toBeTruthy()
    expect(screen.queryByText('Ít đi bộ')).toBeNull()
    expect(screen.queryByText('Khu chờ ít đông')).toBeNull()
    expect(screen.queryByText('Hỗ trợ di chuyển')).toBeNull()

    fireEvent.click(screen.getByText('Ưu tiên thời gian vào khám'))
    const createButtons = screen.getAllByRole('button', { name: /Tạo phương án/ })
    fireEvent.click(createButtons.at(-1)!)

    expect(onContinue).toHaveBeenCalledWith('finish_early')
  })
})
