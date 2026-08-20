import pytest
from fastapi.testclient import TestClient

from app.main import app


@pytest.fixture
def client():
    from app import main as main_module

    main_module._pedidos.clear()
    main_module._proximo_id = 1
    return TestClient(app)


def pedido_valido(**overrides):
    payload = {
        "cliente": "Maria",
        "item": "Teclado",
        "preco_unitario": 250.0,
        "quantidade": 2,
    }
    payload.update(overrides)
    return payload


def test_health_check(client):
    response = client.get("/health")

    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_criar_pedido_calcula_resumo_corretamente(client):
    response = client.post("/pedidos", json=pedido_valido())

    assert response.status_code == 201
    corpo = response.json()
    assert corpo["id"] == 1
    assert corpo["subtotal"] == 500.0
    assert corpo["desconto"] == 100.0
    assert corpo["frete"] == 0.0
    assert corpo["imposto"] == 25.0
    assert corpo["total"] == 425.0


@pytest.mark.parametrize(
    "campos_removidos",
    [
        ["cliente"],
        ["item"],
        ["preco_unitario"],
        ["quantidade"],
    ],
)
def test_criar_pedido_falha_quando_campo_obrigatorio_ausente(client, campos_removidos):
    payload = pedido_valido()
    for campo in campos_removidos:
        del payload[campo]

    response = client.post("/pedidos", json=payload)

    assert response.status_code == 422


@pytest.mark.parametrize("preco_unitario", [0, -10.0])
def test_criar_pedido_falha_com_preco_nao_positivo(client, preco_unitario):
    response = client.post("/pedidos", json=pedido_valido(preco_unitario=preco_unitario))

    assert response.status_code == 422


@pytest.mark.parametrize("quantidade", [0, 11])
def test_criar_pedido_falha_com_quantidade_fora_do_intervalo(client, quantidade):
    response = client.post("/pedidos", json=pedido_valido(quantidade=quantidade))

    assert response.status_code == 422


@pytest.mark.parametrize("quantidade", [1, 10])
def test_criar_pedido_aceita_quantidade_nos_limites(client, quantidade):
    response = client.post("/pedidos", json=pedido_valido(quantidade=quantidade))

    assert response.status_code == 201


def test_listar_pedidos_vazio(client):
    response = client.get("/pedidos")

    assert response.status_code == 200
    assert response.json() == []


def test_listar_pedidos_retorna_pedidos_criados(client):
    client.post("/pedidos", json=pedido_valido())
    client.post("/pedidos", json=pedido_valido(cliente="João"))

    response = client.get("/pedidos")

    assert response.status_code == 200
    corpo = response.json()
    assert len(corpo) == 2
    assert [p["cliente"] for p in corpo] == ["Maria", "João"]


def test_buscar_pedido_por_id_existente(client):
    criado = client.post("/pedidos", json=pedido_valido()).json()

    response = client.get(f"/pedidos/{criado['id']}")

    assert response.status_code == 200
    assert response.json() == criado


def test_buscar_pedido_por_id_inexistente(client):
    response = client.get("/pedidos/999")

    assert response.status_code == 404
    assert response.json() == {"detail": "Pedido não encontrado"}
