import pytest

from app.domain import calcular_desconto, calcular_frete, calcular_imposto, validar_limite_itens


@pytest.mark.parametrize(
    ("subtotal", "desconto_esperado"),
    [
        (199.99, 0.0),
        (200.0, 20.0),
        (499.99, 49.999),
        (500.0, 100.0),
    ],
)
def test_desconto_respeita_limites_das_faixas(subtotal, desconto_esperado):
    assert calcular_desconto(subtotal) == pytest.approx(desconto_esperado)


def test_frete_gratis():
    assert calcular_frete(299.99) == 15.0
    assert calcular_frete(300.0) == 0.0


@pytest.mark.parametrize(
    ("quantidade", "resultado_esperado"),
    [
        (0, False),
        (1, True),
        (10, True),
        (11, False),
    ],
)
def test_limite_itens_inclui_valores_minimo_e_maximo(quantidade, resultado_esperado):
    assert validar_limite_itens(quantidade) is resultado_esperado


def test_imposto():
    assert calcular_imposto(100.0) == 5.0
