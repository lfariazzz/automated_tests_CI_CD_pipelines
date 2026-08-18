import { useState } from 'react'

const INITIAL_VALUES = {
  cliente: '',
  item: '',
  preco: '',
  quantidade: '1',
}

export default function PedidoForm({ carregando, erro, onSubmit }) {
  const [values, setValues] = useState(INITIAL_VALUES)

  function handleChange(event) {
    const { name, value } = event.target
    setValues((current) => ({ ...current, [name]: value }))
  }

  function handleSubmit(event) {
    event.preventDefault()

    onSubmit({
      cliente: values.cliente.trim(),
      item: values.item.trim(),
      preco_unitario: Number(values.preco),
      quantidade: Number(values.quantidade),
    })
  }

  return (
    <article className="panel order-form-panel">
      <div className="panel__header">
        <div>
          <p className="section-label">Dados de entrada</p>
          <h2>Novo pedido</h2>
        </div>
        <span className="panel__index" aria-hidden="true">
          01
        </span>
      </div>

      <form data-testid="pedido-form" onSubmit={handleSubmit}>
        {erro && (
          <div
            className="form-error"
            data-testid="pedido-error"
            role="alert"
          >
            <span aria-hidden="true">!</span>
            <p>{erro}</p>
          </div>
        )}

        <div className="field field--wide">
          <label htmlFor="cliente">Cliente</label>
          <input
            autoComplete="name"
            data-testid="cliente-input"
            disabled={carregando}
            id="cliente"
            name="cliente"
            onChange={handleChange}
            placeholder="Ex.: Ana Souza"
            required
            type="text"
            value={values.cliente}
          />
        </div>

        <div className="field field--wide">
          <label htmlFor="item">Item</label>
          <input
            data-testid="item-input"
            disabled={carregando}
            id="item"
            name="item"
            onChange={handleChange}
            placeholder="Ex.: Teclado mecânico"
            required
            type="text"
            value={values.item}
          />
        </div>

        <div className="field-row">
          <div className="field">
            <label htmlFor="preco">Preço unitário</label>
            <div className="input-with-prefix">
              <span aria-hidden="true">R$</span>
              <input
                aria-describedby="preco-hint"
                data-testid="preco-input"
                disabled={carregando}
                id="preco"
                min="0.01"
                name="preco"
                onChange={handleChange}
                placeholder="0,00"
                required
                step="0.01"
                type="number"
                value={values.preco}
              />
            </div>
            <small id="preco-hint">Use um valor maior que zero.</small>
          </div>

          <div className="field">
            <label htmlFor="quantidade">Quantidade</label>
            <input
              aria-describedby="quantidade-hint"
              data-testid="quantidade-input"
              disabled={carregando}
              id="quantidade"
              min="1"
              name="quantidade"
              onChange={handleChange}
              required
              step="1"
              type="number"
              value={values.quantidade}
            />
            <small id="quantidade-hint">O limite é validado pela API.</small>
          </div>
        </div>

        <button
          className="submit-button"
          data-testid="pedido-submit"
          disabled={carregando}
          type="submit"
        >
          <span>{carregando ? 'Calculando pedido…' : 'Calcular pedido'}</span>
          <span aria-hidden="true">→</span>
        </button>
      </form>
    </article>
  )
}
