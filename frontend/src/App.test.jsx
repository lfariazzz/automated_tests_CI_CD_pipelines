/* @vitest-environment jsdom */

import { render, screen } from '@testing-library/react'
import { expect, test } from 'vitest'

import App from './App.jsx'

test('renderiza o formulário e o resumo inicial do pedido', () => {
  render(<App />)

  expect(
    screen.getByRole('heading', { name: /Monte o pedido/i }),
  ).toBeTruthy()
  expect(screen.getByLabelText('Cliente')).toBeTruthy()
  expect(screen.getByLabelText('Item')).toBeTruthy()
  expect(screen.getByLabelText('Preço unitário')).toBeTruthy()
  expect(screen.getByLabelText('Quantidade')).toBeTruthy()
  expect(screen.getByText('O recibo começa vazio')).toBeTruthy()
})
