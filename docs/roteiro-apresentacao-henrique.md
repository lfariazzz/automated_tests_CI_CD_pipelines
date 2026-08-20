# Roteiro da apresentação — parte do Henrique (H1 e H2)

Rascunho da fala das tasks H1 e H2, pra plugar no roteiro geral coordenado pelo David
(issue #13). Apoia-se nas evidências em
[`evidencias-henrique.md`](evidencias-henrique.md).

## H1 — Cache de build e convenção de tags (~1-2 min)

**Contexto:** eficiência da pipeline e organização dos artefatos publicados —
complementa diretamente o que o Levi consome no CD.

**O que mostrar:**
1. Abrir `.github/workflows/ci-backend.yml` e apontar o `cache-from`/`cache-to:
   type=gha` no step de build da imagem Docker.
2. Explicar o efeito: camadas que não mudaram (ex: instalação de dependências) não
   são reconstruídas a cada execução — só a camada `COPY . .` quando só o código da
   aplicação muda.
3. Mostrar `docs/convencao-tags-imagens.md`: por que existem 3 tags (`sha-<hash>`
   pra rastreabilidade exata, `vX.Y.Z` pra release legível, `stable` como ponteiro
   pro rollback do Levi) e por que `latest` foi deliberadamente descartada
   (ambígua sobre qual código está rodando).
4. Fechar amarrando com o CD: essa convenção foi alinhada com o Levi antes dele
   implementar `cd-staging.yml`, é o contrato que os workflows de deploy consomem.

**Frase de fechamento sugerida:** "cache e convenção de tags não são só otimização —
são o que torna o CD do Levi determinístico e rastreável."

## H2 — Testes de integração da API + frete/imposto (~1-2 min)

**Contexto:** validar a API como um todo (não só as regras isoladas), incluindo as 2
regras que faltavam cobrir (frete e imposto).

**O que mostrar:**
1. Rodar (ou mostrar print de) `pytest --cov=app` localmente: 32 testes, 98,6% de
   cobertura.
2. Abrir `backend/tests/test_api.py` e destacar 2-3 casos representativos:
   - sucesso (`POST /pedidos` calculando subtotal/desconto/frete/imposto/total
     corretamente);
   - erro de validação (quantidade fora do intervalo 1-10 retornando 422 no formato
     padrão do FastAPI);
   - 404 na busca por id inexistente.
3. Abrir `backend/tests/test_domain.py` e destacar o caso de borda do frete
   (R$299,99 → taxa fixa; R$300,00 → grátis) — mesmo padrão de teste de limite que o
   David usou pra desconto/limite de itens.
4. Mencionar que os endpoints (`/pedidos`) tiveram que ser implementados nessa task
   porque ainda não existiam — eram só o contrato no README — e que o frontend já
   estava pronto pra consumi-los.

**Frase de fechamento sugerida:** "sem esses testes de integração, a gente só sabia
que as regras isoladas funcionavam — não que a API como um todo respeitava o
contrato que o frontend depende."

---

**TODO (Henrique):** ajustar tempos e cortar/expandir conforme o tempo total que o
David definir pra fala de cada task; substituir os prints/exemplos por capturas reais
antes da apresentação.
