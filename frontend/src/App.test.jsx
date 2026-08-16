/* @vitest-environment jsdom */

import { render, screen } from '@testing-library/react'
import { expect, test } from 'vitest'

import App from './App.jsx'

test('renderiza o titulo do walking skeleton', () => {
  render(<App />)

  expect(screen.getByRole('heading', { level: 1 }).textContent).toBe(
    'Carrinho de Compras - CI/CD Demo',
  )
})
