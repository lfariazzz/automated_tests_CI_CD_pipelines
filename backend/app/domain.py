def calcular_desconto(subtotal: float) -> float:
    """Aplica desconto progressivo com base na faixa do subtotal."""
    if subtotal >= 500.0:
        return subtotal * 0.20
    if subtotal >= 200.0:
        return subtotal * 0.10
    return 0.0


def calcular_frete(subtotal: float, taxa_fixa: float = 15.0, subtotal_minimo_frete_gratis: float = 300.0) -> float:
    """Calcula frete grátis se o subtotal atingir o valor mínimo."""
    if subtotal >= subtotal_minimo_frete_gratis:
        return 0.0
    return taxa_fixa


def validar_limite_itens(quantidade: int, limite_maximo: int = 10) -> bool:
    """Valida se a quantidade de um item ultrapassa o limite permitido."""
    return 1 <= quantidade <= limite_maximo


def calcular_imposto(subtotal: float, aliquota: float = 0.05) -> float:
    """Calcula o imposto aplicado sobre o subtotal (antes do desconto)."""
    if subtotal < 0:
        raise ValueError("Subtotal não pode ser negativo")
    return subtotal * aliquota