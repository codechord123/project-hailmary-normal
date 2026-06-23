import { test, expect } from '@playwright/test'

test('일일 챌린지 진입 + 첫 문제 노출', async ({ page }) => {
  await page.goto('/daily')
  await expect(page.getByText(/오늘의 챌린지/)).toBeVisible()
  await expect(page.getByRole('button', { name: /제출/ })).toBeVisible()
  // 1/10 진행도 표시
  await expect(page.getByText(/1\/10/)).toBeVisible()
})

test('일일 챌린지에서 메인 메뉴 돌아가기', async ({ page }) => {
  await page.goto('/daily')
  await page.getByRole('link', { name: /← 메인/ }).click()
  await expect(page).toHaveURL('/')
})

test('메인 메뉴에서 일일 챌린지 진입점 노출', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('link', { name: /오늘의 챌린지/ })).toBeVisible()
})
