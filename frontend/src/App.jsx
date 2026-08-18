import { useState } from 'react'

import { criarPedido } from './api/pedidos.js'
import PedidoForm from './components/PedidoForm.jsx'
import ResumoPedido from './components/ResumoPedido.jsx'

export default function App() {
  const [resumo, setResumo] = useState(null)
  const [erro, setErro] = useState('')
  const [carregando, setCarregando] = useState(false)

  async function handleCriarPedido(pedido) {
    setCarregando(true)
    setErro('')
    setResumo(null)

    try {
      const novoResumo = await criarPedido(pedido)
      setResumo(novoResumo)
    } catch (error) {
      setErro(
        error instanceof Error
          ? error.message
          : 'Não foi possível calcular o pedido.',
      )
    } finally {
      setCarregando(false)
    }
  }

  return (
    <main className="app-shell">
      <header className="hero">
        <div className="hero__copy">
          <p className="eyebrow">
            <span aria-hidden="true" />
            Checkout em validação
          </p>
          <h1>
            Monte o pedido.
            <span>Confira cada cálculo.</span>
          </h1>
          <p className="hero__description">
            Preencha um item e envie para a API. O recibo mostra exatamente o
            que foi calculado no backend.
          </p>
        </div>

        <div className="hero__status" aria-label="Estado da integração">
          <span className="status-light" aria-hidden="true" />
          <div>
            <strong>Interface pronta</strong>
            <span>aguardando um pedido</span>
          </div>
        </div>
      </header>

      <section className="order-workspace" aria-label="Criar e revisar pedido">
        <PedidoForm
          erro={erro}
          carregando={carregando}
          onSubmit={handleCriarPedido}
        />

        <div className="pipeline-rail" aria-hidden="true">
          <span>entrada</span>
          <i />
          <b>API</b>
          <i />
          <span>resumo</span>
        </div>

        <ResumoPedido carregando={carregando} resumo={resumo} />
      </section>

      <footer className="page-footer">
        <span>Carrinho &amp; Checkout</span>
        <span>Projeto de testes automatizados em CI/CD</span>
      </footer>
    </main>
  )
}
