/* @vitest-environment jsdom */

import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'

import App from './App.jsx'

function preencherFormulario({ quantidade = '2' } = {}) {
  fireEvent.change(screen.getByLabelText('Cliente'), {
    target: { value: 'Maria' },
  })
  fireEvent.change(screen.getByLabelText('Item'), {
    target: { value: 'Teclado' },
  })
  fireEvent.change(screen.getByLabelText('Preço unitário'), {
    target: { value: '250' },
  })
  fireEvent.change(screen.getByLabelText('Quantidade'), {
    target: { value: quantidade },
  })
}

describe('App', () => {
  let fetchMock

  beforeEach(() => {
    fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)
  })

  afterEach(() => {
    cleanup()
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  test('renderiza o formulário e o resumo inicial vazio', () => {
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

  test('envia o contrato oficial e exibe o resumo retornado pela API', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 201,
      json: vi.fn().mockResolvedValue({
        id: 1,
        cliente: 'Maria',
        item: 'Teclado',
        preco_unitario: 250,
        quantidade: 2,
        subtotal: 500,
        desconto: 100,
        frete: 0,
        imposto: 25,
        total: 425,
      }),
    })

    render(<App />)
    preencherFormulario()
    fireEvent.submit(screen.getByTestId('pedido-form'))

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1))

    const [url, options] = fetchMock.mock.calls[0]
    expect(url).toBe('/api/pedidos')
    expect(options.method).toBe('POST')
    expect(options.headers).toEqual({ 'Content-Type': 'application/json' })
    expect(JSON.parse(options.body)).toEqual({
      cliente: 'Maria',
      item: 'Teclado',
      preco_unitario: 250,
      quantidade: 2,
    })

    await waitFor(() =>
      expect(screen.getByText('Pedido calculado')).toBeTruthy(),
    )
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

  test('exibe o erro de validação 422 retornado pelo FastAPI', async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      status: 422,
      json: vi.fn().mockResolvedValue({
        detail: [
          {
            loc: ['body', 'quantidade'],
            msg: 'A quantidade deve estar entre 1 e 10',
            type: 'value_error',
          },
        ],
      }),
    })

    render(<App />)
    preencherFormulario()
    fireEvent.submit(screen.getByTestId('pedido-form'))

    const alert = await screen.findByRole('alert')
    expect(alert.textContent).toContain(
      'Revise os dados do pedido: A quantidade deve estar entre 1 e 10',
    )
    expect(screen.getByText('O recibo começa vazio')).toBeTruthy()
    expect(screen.queryByText('Pedido calculado')).toBeNull()
  })

  test('orienta o usuário quando não consegue acessar a API', async () => {
    fetchMock.mockRejectedValue(new TypeError('Failed to fetch'))

    render(<App />)
    preencherFormulario()
    fireEvent.submit(screen.getByTestId('pedido-form'))

    const alert = await screen.findByRole('alert')
    expect(alert.textContent).toContain(
      'Não foi possível acessar a API. Confirme se o backend está disponível.',
    )
    expect(screen.getByText('O recibo começa vazio')).toBeTruthy()
  })
})
