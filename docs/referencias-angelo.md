# Referências — Angelo (A1 e A2)

Documentação oficial utilizada como base para as tasks A1 (formulário e resumo do
pedido) e A2 (testes unitários/de componente do frontend). Este conteúdo deve ser
incorporado ao `docs/referencias.md` consolidado quando Malaquias organizar o arquivo
final da issue #12.

## A1 — Formulário de pedido e exibição do resumo

- **React `useState`** — gerenciamento dos dados do formulário e dos estados de
  carregamento, erro e sucesso:
  <https://react.dev/reference/react/useState>
- **React `<input>`** — campos controlados, `value`, `onChange`, `required`, `min`,
  `max` e associação com labels:
  <https://react.dev/reference/react-dom/components/input>
- **Fetch API** — envio do `POST /pedidos`, corpo JSON e tratamento da resposta HTTP:
  <https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch>
- **Vite `server.proxy`** — proxy de `/api` para o backend no desenvolvimento local e
  no Docker Compose:
  <https://vite.dev/config/server-options.html#server-proxy>
- **`Intl.NumberFormat`** — formatação de subtotal, desconto, frete, imposto e total
  como moeda brasileira:
  <https://developer.mozilla.org/pt-BR/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat>
- **HTML `<label>`** — associação acessível entre rótulos e controles do formulário:
  <https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/label>
- **`prefers-reduced-motion`** — redução de animações conforme a preferência de
  acessibilidade do sistema operacional:
  <https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion>

## A2 — Testes unitários e de componente

- **Vitest — guia inicial** — runner utilizado pelo script `npm test`:
  <https://vitest.dev/guide/>
- **Vitest — escrita de testes** — organização com `describe`, `test` e `expect`:
  <https://vitest.dev/guide/learn/writing-tests>
- **Vitest — mocks** — simulação da Fetch API e de respostas HTTP para testar sucesso
  e falhas de maneira determinística:
  <https://vitest.dev/guide/mocking.html>
- **React Testing Library** — renderização dos componentes e testes orientados ao
  comportamento observável pelo usuário:
  <https://testing-library.com/docs/react-testing-library/intro/>
- **Testing Library `ByLabelText`** — localização dos campos pela associação entre
  `label` e `input`, reforçando a acessibilidade do formulário:
  <https://testing-library.com/docs/queries/bylabeltext/>
- **jsdom** — ambiente DOM usado pelo Vitest para executar os testes de componentes:
  <https://github.com/jsdom/jsdom#readme>
