import pytest
from fastapi.testclient import TestClient

from app import main


@pytest.fixture(autouse=True)
def reset_pedidos():
    main._pedidos.clear()
    main._proximo_id = 1


@pytest.fixture
def client():
    return TestClient(main.app)


def test_health_check(client):
    response = client.get("/health")

    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_cria_pedido_com_calculos_do_contrato(client):
    response = client.post(
        "/pedidos",
        json={
            "cliente": "Maria",
            "item": "Teclado",
            "preco_unitario": 250,
            "quantidade": 2,
        },
    )

    assert response.status_code == 201
    assert response.json() == {
        "id": 1,
        "cliente": "Maria",
        "item": "Teclado",
        "preco_unitario": 250.0,
        "quantidade": 2,
        "subtotal": 500.0,
        "desconto": 100.0,
        "frete": 0.0,
        "imposto": 25.0,
        "total": 425.0,
    }


def test_lista_e_busca_pedido_criado(client):
    client.post(
        "/pedidos",
        json={
            "cliente": "Maria",
            "item": "Teclado",
            "preco_unitario": 250,
            "quantidade": 2,
        },
    )

    lista = client.get("/pedidos")
    busca = client.get("/pedidos/1")

    assert lista.status_code == 200
    assert len(lista.json()) == 1
    assert busca.status_code == 200
    assert busca.json()["id"] == 1


def test_retorna_404_para_pedido_inexistente(client):
    response = client.get("/pedidos/999")

    assert response.status_code == 404
    assert response.json() == {"detail": "Pedido não encontrado"}


@pytest.mark.parametrize(
    "payload",
    [
        {
            "cliente": "Maria",
            "item": "Teclado",
            "preco_unitario": 0,
            "quantidade": 1,
        },
        {
            "cliente": "Maria",
            "item": "Teclado",
            "preco_unitario": 100,
            "quantidade": 11,
        },
        {
            "cliente": "",
            "item": "Teclado",
            "preco_unitario": 100,
            "quantidade": 1,
        },
    ],
)
def test_rejeita_payload_invalido(client, payload):
    response = client.post("/pedidos", json=payload)

    assert response.status_code == 422
