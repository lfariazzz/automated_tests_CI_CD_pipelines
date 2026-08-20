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


@pytest.mark.parametrize(
    ("subtotal", "frete_esperado"),
    [
        (0.0, 15.0),
        (299.99, 15.0),
        (300.0, 0.0),
        (300.01, 0.0),
    ],
)
def test_frete_respeita_limite_do_valor_minimo(subtotal, frete_esperado):
    assert calcular_frete(subtotal) == pytest.approx(frete_esperado)


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


@pytest.mark.parametrize(
    ("subtotal", "imposto_esperado"),
    [
        (0.0, 0.0),
        (100.0, 5.0),
        (500.0, 25.0),
    ],
)
def test_imposto_incide_sobre_o_subtotal(subtotal, imposto_esperado):
    assert calcular_imposto(subtotal) == pytest.approx(imposto_esperado)


def test_imposto_rejeita_subtotal_negativo():
    with pytest.raises(ValueError, match="Subtotal não pode ser negativo"):
        calcular_imposto(-0.01)
