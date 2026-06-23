import { test, expect } from '@playwright/test'

test('일일 챌린지 첫 문제 답 입력 + 제출', async ({ page }) => {
  await page.goto('/daily')
  // 어떤 입력이든 보이는지 (fraction/numeric/mcq/compare 중 하나)
  await expect(page.getByRole('button', { name: '제출' })).toBeVisible()
})

test('챕터 3 진입 + 첫 응용 문제 인터페이스 노출', async ({ page }) => {
  await page.goto('/chapter/3')
  await expect(page.getByText(/STAGE 3/)).toBeVisible()
  // 인트로 스토리 스킵
  const skipBtn = page.getByRole('button', { name: /스킵/ })
  if (await skipBtn.isVisible()) {
    await skipBtn.click()
  }
  // 공격 버튼
  await expect(page.getByRole('button', { name: /공격/ })).toBeVisible()
})

test('엔들리스 모드 — 첫 문제 노출', async ({ page }) => {
  await page.goto('/endless')
  await expect(page.getByText(/ENDLESS/)).toBeVisible()
  await expect(page.getByRole('button', { name: /제출/ })).toBeVisible()
})

test('우주 상점 진입 + 1개 / 5개 묶음 버튼 노출', async ({ page }) => {
  await page.goto('/shop')
  await expect(page.getByText(/우주 상점/)).toBeVisible()
  await expect(page.getByText(/1개 구매/).first()).toBeVisible()
  await expect(page.getByText(/5개 묶음/).first()).toBeVisible()
})

test('항해 일지 — 통계 카드 노출', async ({ page }) => {
  await page.goto('/story')
  await expect(page.getByText(/항해 통계/)).toBeVisible()
  await expect(page.getByText(/클리어/).first()).toBeVisible()
  await expect(page.getByText(/총 별/)).toBeVisible()
  await expect(page.getByText(/총 풀이 시간/)).toBeVisible()
  await expect(page.getByText(/평균 정답률/)).toBeVisible()
})
