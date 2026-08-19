from pydantic import BaseModel, Field


class PedidoEntrada(BaseModel):
    cliente: str = Field(min_length=1)
    item: str = Field(min_length=1)
    preco_unitario: float = Field(gt=0)
    quantidade: int = Field(ge=1, le=10)


class PedidoResumo(PedidoEntrada):
    id: int
    subtotal: float
    desconto: float
    frete: float
    imposto: float
    total: float
