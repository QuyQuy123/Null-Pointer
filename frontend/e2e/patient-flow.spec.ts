import { expect, test } from '@playwright/test'

test.describe('Hành trình bệnh nhân', () => {
  test('hiển thị trang chủ và mở danh sách chỉ định', async ({ page }) => {
    await page.goto('/')

    await expect(page.getByText('Bệnh viện Đa khoa TW')).toBeVisible()
    await page.getByRole('button', { name: 'Xem chỉ định' }).click()
    await expect(page.getByText('3 chỉ định mới', { exact: true })).toBeVisible()
  })
})
