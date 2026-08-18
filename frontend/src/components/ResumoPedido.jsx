const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
})

function formatCurrency(value) {
  return currencyFormatter.format(value)
}

export default function ResumoPedido({ carregando, resumo }) {
  return (
    <article
      aria-busy={carregando}
      aria-live="polite"
      className="panel summary-panel"
      data-testid="pedido-resumo"
    >
      <div className="panel__header">
        <div>
          <p className="section-label">Resposta da API</p>
          <h2>Resumo do pedido</h2>
        </div>
        <span className="panel__index" aria-hidden="true">
          02
        </span>
      </div>

      {carregando ? (
        <div className="summary-state" data-testid="resumo-loading">
          <span className="loader" aria-hidden="true" />
          <strong>Conferindo as regras</strong>
          <p>Desconto, frete e imposto estão sendo calculados.</p>
        </div>
      ) : resumo ? (
        <div className="receipt" key={resumo.total}>
          <div className="receipt__stamp">
            <span aria-hidden="true">✓</span>
            <div>
              <strong>Pedido calculado</strong>
              <span>valores retornados pelo backend</span>
            </div>
          </div>

          <dl className="summary-list">
            <div>
              <dt>Subtotal</dt>
              <dd data-testid="resumo-subtotal">
                {formatCurrency(resumo.subtotal)}
              </dd>
            </div>
            <div className="summary-list__discount">
              <dt>Desconto</dt>
              <dd data-testid="resumo-desconto">
                − {formatCurrency(resumo.desconto)}
              </dd>
            </div>
            <div>
              <dt>Frete</dt>
              <dd data-testid="resumo-frete">
                {formatCurrency(resumo.frete)}
              </dd>
            </div>
            <div>
              <dt>Imposto</dt>
              <dd data-testid="resumo-imposto">
                {formatCurrency(resumo.imposto)}
              </dd>
            </div>
          </dl>

          <div className="summary-total">
            <span>Total</span>
            <strong data-testid="resumo-total">
              {formatCurrency(resumo.total)}
            </strong>
          </div>
        </div>
      ) : (
        <div className="summary-state summary-state--empty">
          <div className="empty-receipt" aria-hidden="true">
            <i />
            <i />
            <i />
          </div>
          <strong>O recibo começa vazio</strong>
          <p>Preencha o formulário para visualizar todos os valores.</p>
        </div>
      )}
    </article>
  )
}
