import { test, expect } from '@playwright/test'

test('챕터 1 진입 + 첫 문제 표시', async ({ page }) => {
  await page.goto('/chapter/1')
  await expect(page.getByText(/Chapter 1\. 깨어남/)).toBeVisible()
  // 산소 탱크 테마 — 손가락으로 옮기기 안내
  await expect(page.getByText(/셀을 옮겨 합쳐봐/)).toBeVisible()
})

test('정답 입력 후 제출 → 정답 피드백', async ({ page }) => {
  await page.goto('/chapter/1')
  // 3/8 + 2/8 = 5/8: 분자에 5, 분모에 8 입력
  const numerator = page.getByLabel('분자').first()
  const denominator = page.getByLabel('분모').first()
  await numerator.fill('5')
  await denominator.fill('8')
  await page.getByRole('button', { name: '제출' }).click()
  await expect(page.getByText(/정답/)).toBeVisible({ timeout: 5_000 })
})
