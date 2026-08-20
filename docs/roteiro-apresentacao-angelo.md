# Roteiro da apresentação — parte do Angelo (A1 e A2)

Roteiro das tasks A1 e A2 para integração à apresentação geral coordenada por David
na issue #13. A participação de Angelo será apresentada em **dois slides** e se apoia
nas evidências registradas em
[`evidencias-angelo.md`](evidencias-angelo.md).

## Objetivo da participação

Mostrar como o frontend transforma o contrato da API em um fluxo utilizável e como os
testes automatizados protegem os principais estados da interface. A fala deve deixar
claro que os cálculos são feitos pelo backend: o frontend envia os dados e apresenta
o resumo recebido.

## Slide 1 — Parte técnica

**Título sugerido:** Frontend do pedido e testes automatizados

### Texto do slide

**A1 — Formulário e resumo**

- React + Vite com formulário acessível;
- `POST /pedidos`: cliente, item, preço e quantidade;
- resumo com subtotal, desconto, frete, imposto e total;
- estados vazio, carregando, sucesso, erro `422` e API indisponível;
- labels e `data-testid` preparados para automação E2E.

**A2 — Testes de componente**

- Vitest + React Testing Library;
- 3 testes do formulário;
- 3 testes do resumo;
- 4 testes do fluxo da aplicação;
- **10 testes em 3 arquivos**.

### Visual sugerido

Usar um fluxo horizontal simples no centro ou na parte inferior:

```text
Formulário React  →  POST /pedidos  →  Resumo retornado pela API
```

O slide deve conter somente esses pontos. Não é necessário colocar trechos grandes de
código, porque a arquitetura e os números da suíte comunicam melhor a contribuição no
tempo disponível.

### Fala sugerida — aproximadamente 1 minuto

> Minhas duas tasks foram implementar o frontend do pedido e criar seus testes
> automatizados. Na A1, substituí o esqueleto inicial por um formulário acessível que
> recebe cliente, item, preço e quantidade e envia esses dados para o endpoint
> `POST /pedidos`.
>
> O frontend não replica as regras de negócio. O backend calcula subtotal, desconto,
> frete, imposto e total, e a interface apresenta a resposta. Também tratei os estados
> vazio, carregando, sucesso, erro de validação 422 e indisponibilidade da API, além de
> preparar labels e seletores estáveis para os testes E2E.
>
> Na A2, escrevi 10 testes em três arquivos. Eles cobrem os campos e o payload do
> formulário, os estados do resumo e o comportamento completo da aplicação em casos
> de sucesso e falha.

## Slide 2 — Evidências

**Título sugerido:** Evidências das tasks A1 e A2

Este slide deve usar as três capturas, com pouco texto adicional.

### Organização visual recomendada

- **Lado esquerdo, ocupando aproximadamente 60% do slide:** imagem da aplicação
  funcionando (`A1-02-formulario-resumo-funcionando.png`). Ela é a evidência
  principal e precisa permanecer legível.
- **Canto superior direito:** recorte do topo do PR #38
  (`A1-01-pr38-mergeado.png`), mostrando título, autor, status `Merged` e branch
  `develop`.
- **Canto inferior direito:** terminal com o Vitest
  (`A2-01-testes-frontend-aprovados.png`), preservando as linhas `3 passed` e
  `10 passed`.

Legendas curtas abaixo de cada imagem:

```text
Fluxo real: formulário → API → resumo
PR #38 mergeado na develop
3 arquivos e 10 testes aprovados
```

O print completo do PR é muito alto para um slide. Deve ser recortado para mostrar
somente o cabeçalho com `Merged`, o título e a autoria. A versão integral continua
guardada no repositório como evidência documental.

### Fala sugerida — aproximadamente 40 segundos

> Aqui estão as evidências. O PR #38 foi revisado e mergeado na `develop`. Na imagem
> principal, o sistema está rodando com o backend real: um pedido de duas unidades a
> R$ 250,00 gera subtotal de R$ 500,00 e total de R$ 425,00, com todos os valores
> retornados pela API exibidos no recibo.
>
> A última captura mostra a suíte local concluída com os três arquivos e os 10 testes
> aprovados. Assim, as evidências cobrem autoria, funcionamento integrado e validação
> automatizada.

## Respostas rápidas para possíveis perguntas

**Por que o frontend não calcula desconto, frete e imposto?**

Para manter uma única fonte de verdade. As regras ficam no backend; o frontend envia
o pedido e apresenta a resposta, evitando resultados diferentes entre as camadas.

**Por que usar labels e `data-testid` ao mesmo tempo?**

As labels tornam os campos acessíveis e permitem testes próximos da forma como o
usuário encontra os controles. Os `data-testid` oferecem seletores estáveis para
valores sem rótulo interativo e para a automação E2E.

**Por que simular o `fetch` nos testes de componente?**

Para testar sucesso, erro `422` e falha de rede de forma rápida e reproduzível, sem
depender de um servidor ativo. A integração com o servidor real pertence à camada E2E.

**O que acontece quando a API está indisponível?**

A interface mostra uma mensagem orientando a confirmar o backend, remove qualquer
resumo anterior e libera novamente o formulário depois que a requisição termina.

**Como a quantidade é limitada?**

O campo HTML usa mínimo 1 e máximo 10, e o backend repete a validação. A validação no
navegador melhora a experiência, mas não substitui a validação da API.

## Plano de contingência

- Manter as duas imagens principais também abertas fora dos slides para ampliar se
  alguém pedir detalhes.
- Se o Docker estiver indisponível, usar o print do fluxo completo já preservado em
  `docs/evidencias/Angelo/`.
- Se pedirem o código dos testes, abrir `App.test.jsx` e mostrar o cenário de sucesso
  ou de erro `422`.
