from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field

from app.domain import calcular_desconto, calcular_frete, calcular_imposto

app = FastAPI(title="Carrinho & Checkout API")

_pedidos: list[dict] = []
_proximo_id = 1


class PedidoCreate(BaseModel):
    cliente: str = Field(min_length=1)
    item: str = Field(min_length=1)
    preco_unitario: float = Field(gt=0)
    quantidade: int = Field(ge=1, le=10)


class PedidoOut(BaseModel):
    id: int
    cliente: str
    item: str
    preco_unitario: float
    quantidade: int
    subtotal: float
    desconto: float
    frete: float
    imposto: float
    total: float


@app.get("/health")
def health_check():
    return {"status": "ok"}


@app.post("/pedidos", response_model=PedidoOut, status_code=201)
def criar_pedido(pedido: PedidoCreate):
    global _proximo_id

    subtotal = pedido.preco_unitario * pedido.quantidade
    desconto = calcular_desconto(subtotal)
    frete = calcular_frete(subtotal)
    imposto = calcular_imposto(subtotal)
    total = subtotal - desconto + frete + imposto

    registro = {
        "id": _proximo_id,
        "cliente": pedido.cliente,
        "item": pedido.item,
        "preco_unitario": pedido.preco_unitario,
        "quantidade": pedido.quantidade,
        "subtotal": subtotal,
        "desconto": desconto,
        "frete": frete,
        "imposto": imposto,
        "total": total,
    }
    _pedidos.append(registro)
    _proximo_id += 1

    return registro


@app.get("/pedidos", response_model=list[PedidoOut])
def listar_pedidos():
    return _pedidos


@app.get("/pedidos/{pedido_id}", response_model=PedidoOut)
def buscar_pedido(pedido_id: int):
    for registro in _pedidos:
        if registro["id"] == pedido_id:
            return registro
    raise HTTPException(status_code=404, detail="Pedido não encontrado")
