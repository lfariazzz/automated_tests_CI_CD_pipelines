from app.domain import calcular_desconto, calcular_frete, calcular_imposto, validar_limite_itens


def test_desconto_faixas():
    assert calcular_desconto(100.0) == 0.0
    assert calcular_desconto(200.0) == 20.0  # Limite exato (>= 200)
    assert calcular_desconto(500.0) == 100.0  # Limite exato (>= 500)


def test_frete_gratis():
    assert calcular_frete(299.99) == 15.0
    assert calcular_frete(300.0) == 0.0


def test_limite_itens():
    assert validar_limite_itens(5) is True
    assert validar_limite_itens(11) is False


def test_imposto():
    assert calcular_imposto(100.0) == 5.0