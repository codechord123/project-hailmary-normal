import { test, expect } from '@playwright/test'

test('리더보드 진입 + 탭 전환', async ({ page }) => {
  await page.goto('/leaderboard')
  await expect(page.getByText(/학급 리더보드/)).toBeVisible()
  await expect(page.getByRole('button', { name: /총 별 순위/ })).toBeVisible()
  await page.getByRole('button', { name: /엔들리스/ }).click()
  await expect(page.getByRole('button', { name: /엔들리스/ })).toHaveClass(/text-pink-300/)
})

test('학급 코드 필터 입력', async ({ page }) => {
  await page.goto('/leaderboard')
  const codeInput = page.getByPlaceholder(/학급 코드 필터/)
  await codeInput.fill('5-3')
  await expect(codeInput).toHaveValue('5-3')
})
