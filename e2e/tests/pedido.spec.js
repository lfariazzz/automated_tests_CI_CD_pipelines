import { expect, test } from '@playwright/test'

test('calcula um pedido pelo fluxo completo da interface', async ({ page }) => {
  await page.goto('/')

  await page.getByLabel('Cliente').fill('Maria')
  await page.getByLabel('Item').fill('Teclado')
  await page.getByLabel('Preço unitário').fill('250')
  await page.getByLabel('Quantidade').fill('2')
  await page.getByTestId('pedido-submit').click()

  await expect(page.getByText('Pedido calculado')).toBeVisible()
  await expect(page.getByTestId('resumo-subtotal')).toContainText('500,00')
  await expect(page.getByTestId('resumo-desconto')).toContainText('100,00')
  await expect(page.getByTestId('resumo-frete')).toContainText('0,00')
  await expect(page.getByTestId('resumo-imposto')).toContainText('25,00')
  await expect(page.getByTestId('resumo-total')).toContainText('425,00')
  await expect(page.getByText('O recibo começa vazio')).toHaveCount(0)
})
