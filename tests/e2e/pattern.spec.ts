import { test, expect } from '@playwright/test'
import { readFile } from 'node:fs/promises'
test('functional motif renderers react to controls and recipe edits persist', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'Garden sprigs' }).click()
  await expect(page.locator('[data-ui~="fabric-stage"] [data-motif="sprig"]')).toHaveCount(12)
  await page.getByLabel('Pattern name').fill('A saved garden')
  await page.getByRole('button', { name: 'Quiet coast' }).click()
  await page.reload()
  await expect(page.getByLabel('Pattern name')).toHaveValue('A saved garden')
  await expect(page.getByLabel('Paper', { exact: true })).toHaveValue('#e9f0ec')
  const ids = await page.locator('pattern').evaluateAll((nodes) => nodes.map((node) => node.id))
  expect(new Set(ids).size).toBe(ids.length)
  await page.getByLabel('Stagger every other row').uncheck()
  await expect(page.locator('[data-ui~="fabric-stage"] pattern')).toHaveAttribute('height', '100')
})
test('exports contain standalone SVG artwork and a complete two-row repeat tile', async ({
  page,
}) => {
  await page.goto('/')
  await page.getByLabel('Show tile edges').check()
  await page.getByRole('button', { name: 'Export', exact: true }).click()
  await page.getByLabel('Artwork width').fill('640')
  await page.getByLabel('Artwork height').fill('480')
  const download = page.waitForEvent('download')
  await page.getByRole('button', { name: 'Download fabric SVG' }).click()
  const svg = await readFile((await (await download).path())!, 'utf8')
  const result = await page.evaluate((source) => {
    const doc = new DOMParser().parseFromString(source, 'image/svg+xml')
    return {
      errors: doc.querySelectorAll('parsererror').length,
      width: doc.documentElement.getAttribute('width'),
      height: doc.documentElement.getAttribute('height'),
      guides: doc.querySelectorAll('line').length,
      metadata: JSON.parse(doc.querySelector('metadata')!.textContent!),
    }
  }, svg)
  expect(result.errors).toBe(0)
  expect(result.width).toBe('640')
  expect(result.height).toBe('480')
  expect(result.guides).toBe(0)
  expect(result.metadata.project).toBe('vue-svg-pattern-loom')
  const tileDownload = page.waitForEvent('download')
  await page.getByRole('button', { name: 'Download repeat tile' }).click()
  const tile = await readFile((await (await tileDownload).path())!, 'utf8')
  expect(tile).toContain('width="100" height="200" viewBox="0 0 100 200"')
})
test('malformed imports and invalid export dimensions preserve the active recipe', async ({
  page,
}) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'Import', exact: true }).click()
  await page.getByLabel('Or paste PL/1 JSON').fill('{"format":"PL/2"}')
  await page.getByRole('button', { name: 'Import recipe', exact: true }).click()
  await expect(page.getByRole('alert')).toContainText('PL/1')
  await page.keyboard.press('Escape')
  await expect(page.getByLabel('Pattern name')).toHaveValue('A little wildflower')
  await page.getByRole('button', { name: 'Export', exact: true }).click()
  await page.getByLabel('Artwork width').fill('0')
  await expect(page.getByRole('button', { name: 'Download fabric SVG' })).toBeDisabled()
  await expect(page.getByRole('button', { name: 'Download repeat tile' })).toBeEnabled()
})
test('tile and fabric modes reserve equal space on mobile', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 850 })
  await page.goto('/')
  const before = await page.locator('[data-ui~="fabric-stage"]').boundingBox()
  await page.getByRole('button', { name: 'Repeat tile', exact: true }).click()
  expect((await page.locator('[data-ui~="fabric-stage"]').boundingBox())?.height).toBe(
    before?.height,
  )
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(320)
})
