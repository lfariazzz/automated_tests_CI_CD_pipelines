from fastapi import FastAPI

app = FastAPI(title="Carrinho & Checkout API")


@app.get("/health")
def health_check():
    return {"status": "ok"}