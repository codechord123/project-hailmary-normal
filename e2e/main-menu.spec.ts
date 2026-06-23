import { test, expect } from '@playwright/test'

test('메인 메뉴 로드 + 기본 진입점 노출', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByText('헤일메리 분수 미션')).toBeVisible()
  await expect(page.getByRole('link', { name: /항해 시작/ })).toBeVisible()
  await expect(page.getByRole('link', { name: /끝없는 항해/ })).toBeVisible()
  await expect(page.getByRole('link', { name: /내 캐비닛/ })).toBeVisible()
  await expect(page.getByRole('link', { name: /진도판/ })).toBeVisible()
  await expect(page.getByRole('link', { name: /학급 리더보드/ })).toBeVisible()
})

test('항해 시작 클릭 → 챕터 선택 화면', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('link', { name: /항해 시작/ }).click()
  await expect(page).toHaveURL(/\/chapters/)
  await expect(page.getByText('Chapter 1. 깨어남')).toBeVisible()
  // 챕터 7까지 모두 열려있음
  await expect(page.getByText('Chapter 7. 귀환 미션')).toBeVisible()
})

test('엔들리스 모드 진입', async ({ page }) => {
  await page.goto('/endless')
  await expect(page.getByText(/ENDLESS/)).toBeVisible()
})
