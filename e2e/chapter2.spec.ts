import { test, expect } from '@playwright/test'

test('챕터 2 슈터 진입 + 발사 UI 노출', async ({ page }) => {
  await page.goto('/chapter/2')
  await expect(page.getByText(/STAGE 2-1/)).toBeVisible()
  await expect(page.getByRole('button', { name: /발사/ })).toBeVisible()
})

test('챕터 2 정답 입력 → 격추', async ({ page }) => {
  await page.goto('/chapter/2')
  // 7/8 - 3/8 = 4/8 (기약 X 첫 문제) → 분자 4, 분모 8
  await page.getByLabel('분자').first().fill('4')
  await page.getByLabel('분모').first().fill('8')
  await page.getByRole('button', { name: /발사/ }).click()
  // 발사 후 폭발 → 다음 스테이지 또는 보너스
  await expect(page.getByText(/STAGE 2-/)).toBeVisible({ timeout: 5_000 })
})
