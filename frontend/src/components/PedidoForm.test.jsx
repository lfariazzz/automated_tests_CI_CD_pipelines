/* @vitest-environment jsdom */

import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, test, vi } from 'vitest'

import PedidoForm from './PedidoForm.jsx'

afterEach(cleanup)

describe('PedidoForm', () => {
  test('renderiza campos acessíveis com os limites do contrato', () => {
    render(<PedidoForm carregando={false} erro="" onSubmit={vi.fn()} />)

    expect(screen.getByLabelText('Cliente').required).toBe(true)
    expect(screen.getByLabelText('Item').required).toBe(true)
    expect(screen.getByLabelText('Preço unitário').min).toBe('0.01')

    const quantidade = screen.getByLabelText('Quantidade')
    expect(quantidade.min).toBe('1')
    expect(quantidade.max).toBe('10')
    expect(screen.getByTestId('pedido-submit').textContent).toContain(
      'Calcular pedido',
    )
  })

  test('normaliza os valores e envia o payload do contrato oficial', () => {
    const onSubmit = vi.fn()
    render(<PedidoForm carregando={false} erro="" onSubmit={onSubmit} />)

    fireEvent.change(screen.getByLabelText('Cliente'), {
      target: { value: '  Maria  ' },
    })
    fireEvent.change(screen.getByLabelText('Item'), {
      target: { value: '  Teclado  ' },
    })
    fireEvent.change(screen.getByLabelText('Preço unitário'), {
      target: { value: '250.50' },
    })
    fireEvent.change(screen.getByLabelText('Quantidade'), {
      target: { value: '2' },
    })
    fireEvent.submit(screen.getByTestId('pedido-form'))

    expect(onSubmit).toHaveBeenCalledOnce()
    expect(onSubmit).toHaveBeenCalledWith({
      cliente: 'Maria',
      item: 'Teclado',
      preco_unitario: 250.5,
      quantidade: 2,
    })
  })

  test('bloqueia os campos e informa o envio em andamento', () => {
    render(<PedidoForm carregando erro="" onSubmit={vi.fn()} />)

    expect(screen.getByLabelText('Cliente').disabled).toBe(true)
    expect(screen.getByLabelText('Item').disabled).toBe(true)
    expect(screen.getByLabelText('Preço unitário').disabled).toBe(true)
    expect(screen.getByLabelText('Quantidade').disabled).toBe(true)
    expect(
      screen.getByRole('button', { name: /Calculando pedido/i }).disabled,
    ).toBe(true)
  })
})
