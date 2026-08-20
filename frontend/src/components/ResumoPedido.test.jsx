/* @vitest-environment jsdom */

import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, test } from 'vitest'

import ResumoPedido from './ResumoPedido.jsx'

afterEach(cleanup)

describe('ResumoPedido', () => {
  test('orienta o usuário quando ainda não existe um resumo', () => {
    render(<ResumoPedido carregando={false} resumo={null} />)

    expect(screen.getByText('O recibo começa vazio')).toBeTruthy()
    expect(
      screen.getByText(
        'Preencha o formulário para visualizar todos os valores.',
      ),
    ).toBeTruthy()
  })

  test('anuncia o estado de carregamento', () => {
    render(<ResumoPedido carregando resumo={null} />)

    expect(screen.getByTestId('pedido-resumo').getAttribute('aria-busy')).toBe(
      'true',
    )
    expect(screen.getByTestId('resumo-loading')).toBeTruthy()
    expect(screen.getByText('Conferindo as regras')).toBeTruthy()
  })

  test('formata e exibe todos os valores calculados', () => {
    render(
      <ResumoPedido
        carregando={false}
        resumo={{
          subtotal: 500,
          desconto: 100,
          frete: 0,
          imposto: 25,
          total: 425,
        }}
      />,
    )

    expect(screen.getByText('Pedido calculado')).toBeTruthy()
    expect(screen.getByTestId('resumo-subtotal').textContent).toContain(
      '500,00',
    )
    expect(screen.getByTestId('resumo-desconto').textContent).toContain(
      '100,00',
    )
    expect(screen.getByTestId('resumo-frete').textContent).toContain('0,00')
    expect(screen.getByTestId('resumo-imposto').textContent).toContain('25,00')
    expect(screen.getByTestId('resumo-total').textContent).toContain('425,00')
  })
})
