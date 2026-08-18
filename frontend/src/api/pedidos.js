const API_BASE_URL = (import.meta.env.VITE_API_URL ?? '/api').replace(/\/$/, '')

function extrairMensagemErro(payload, status) {
  if (Array.isArray(payload?.detail)) {
    const detalhes = payload.detail
      .map((item) => item?.msg)
      .filter(Boolean)
      .join('; ')

    if (detalhes) {
      return `Revise os dados do pedido: ${detalhes}`
    }
  }

  const mensagem =
    payload?.detail ?? payload?.message ?? payload?.erro ?? payload?.error

  if (typeof mensagem === 'string' && mensagem.trim()) {
    return mensagem
  }

  if (status === 422) {
    return 'Revise os campos informados e tente novamente.'
  }

  return 'A API não conseguiu calcular o pedido. Tente novamente.'
}

function normalizarResumo(payload) {
  const dados = payload?.resumo ?? payload
  const campos = ['subtotal', 'desconto', 'frete', 'imposto', 'total']
  const resumo = Object.fromEntries(
    campos.map((campo) => [campo, Number(dados?.[campo])]),
  )

  if (campos.some((campo) => !Number.isFinite(resumo[campo]))) {
    throw new Error('A API retornou um resumo de pedido incompleto.')
  }

  return resumo
}

export async function criarPedido(pedido) {
  let response

  try {
    response = await fetch(`${API_BASE_URL}/pedidos`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(pedido),
    })
  } catch {
    throw new Error(
      'Não foi possível acessar a API. Confirme se o backend está disponível.',
    )
  }

  const payload = await response.json().catch(() => null)

  if (!response.ok) {
    throw new Error(extrairMensagemErro(payload, response.status))
  }

  return normalizarResumo(payload)
}
