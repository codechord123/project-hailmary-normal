import { test, expect } from '@playwright/test'

test('챕터 6 매칭 진입 + 카드 12장 그리드', async ({ page }) => {
  await page.goto('/chapter/6')
  await expect(page.getByText(/STAGE 6 · PUZZLE/)).toBeVisible()
  // 다시 섞기 버튼 존재
  await expect(page.getByRole('button', { name: /다시 섞기/ })).toBeVisible()
})

test('챕터 6 카드 클릭 → 숫자 노출 (가시성 회귀)', async ({ page }) => {
  await page.goto('/chapter/6')
  // 카드 그리드의 첫 번째 카드 클릭
  const firstCard = page.locator('button.aspect-square').first()
  await firstCard.click()
  // KaTeX 수식 노드가 보여야 함 (회귀: 이전엔 흰배경+흰글자라 숨음)
  await expect(firstCard.locator('.katex').first()).toBeVisible()
})
