import { test, expect } from '@playwright/test'

test('진도판 진입 + 학생 이름 입력', async ({ page }) => {
  await page.goto('/dashboard')
  await expect(page.getByText(/항해 진도판/)).toBeVisible()
  const nameInput = page.getByPlaceholder('이름 입력')
  await nameInput.fill('태양이')
  await nameInput.blur()
  await expect(page.getByText('학생 빠른 전환')).toBeVisible()
})

test('진도판에 챕터 7개 표시', async ({ page }) => {
  await page.goto('/dashboard')
  await expect(page.getByText(/1\. 깨어남/)).toBeVisible()
  await expect(page.getByText(/7\. 귀환/)).toBeVisible()
})

test('BGM 음량 슬라이더 조정', async ({ page }) => {
  await page.goto('/dashboard')
  const slider = page.getByRole('slider').first()
  await slider.fill('70')
  await expect(page.getByText(/BGM 음량 70%/)).toBeVisible()
})
