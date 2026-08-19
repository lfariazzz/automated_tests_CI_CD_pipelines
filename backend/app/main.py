from fastapi import FastAPI, HTTPException, status

from .domain import calcular_desconto, calcular_frete, calcular_imposto
from .schemas import PedidoEntrada, PedidoResumo

app = FastAPI(title="Carrinho & Checkout API")
_pedidos: dict[int, PedidoResumo] = {}
_proximo_id = 1


@app.get("/health")
def health_check():
    return {"status": "ok"}


def _calcular_pedido(pedido: PedidoEntrada, pedido_id: int) -> PedidoResumo:
    subtotal = pedido.preco_unitario * pedido.quantidade
    desconto = calcular_desconto(subtotal)
    frete = calcular_frete(subtotal)
    imposto = calcular_imposto(subtotal)

    return PedidoResumo(
        id=pedido_id,
        cliente=pedido.cliente,
        item=pedido.item,
        preco_unitario=pedido.preco_unitario,
        quantidade=pedido.quantidade,
        subtotal=subtotal,
        desconto=desconto,
        frete=frete,
        imposto=imposto,
        total=subtotal - desconto + frete + imposto,
    )


@app.post(
    "/pedidos",
    response_model=PedidoResumo,
    status_code=status.HTTP_201_CREATED,
)
def criar_pedido(pedido: PedidoEntrada):
    global _proximo_id

    resumo = _calcular_pedido(pedido, _proximo_id)
    _pedidos[_proximo_id] = resumo
    _proximo_id += 1
    return resumo


@app.get("/pedidos", response_model=list[PedidoResumo])
def listar_pedidos():
    return list(_pedidos.values())


@app.get("/pedidos/{pedido_id}", response_model=PedidoResumo)
def buscar_pedido(pedido_id: int):
    pedido = _pedidos.get(pedido_id)
    if pedido is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Pedido não encontrado",
        )
    return pedido
