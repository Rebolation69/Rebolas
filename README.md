# ATLAS Financial Terminal

Terminal financeiro pessoal, com interface escura inspirada em ferramentas profissionais e otimizada para Android. Esta primeira versão é um **MVP funcional**, não uma réplica do Bloomberg Terminal.

## O que funciona nesta versão

- Interface responsiva para desktop e Android.
- PWA básica, com service worker para cache de recursos estáticos em produção.
- Navegação entre Overview, Markets, Macro, Watchlist, Portfolio, Calculator e News.
- Pesquisa de tickers em um cadastro inicial de instrumentos.
- Barra de comandos: `HELP`, `HOME`, `SEARCH PETR4`, `QUOTE AAPL`, `WATCHLIST`, `PORTFOLIO`, `MACRO BR`, `CALCULATOR`.
- Watchlist persistida no `localStorage`.
- Registro local de posições e custo de aquisição.
- Calculadora simplificada de juros compostos.
- Integração frontend com séries históricas públicas do SGS/BCB para Selic meta (432), IPCA mensal (433) e câmbio USD venda (1), com indicação da fonte.
- Estados vazios explícitos para cotações de ações/ETFs/índices/cripto e notícias que ainda não têm provedor integrado.
- Nenhum preço de mercado inventado.

## Requisitos

- Node.js LTS e npm.
- Conexão com internet para consultar as séries do Banco Central.
- Navegador moderno.

## Rodar localmente

```bash
npm install
npm run dev
```

Abra a URL exibida pelo Vite. Para acessar de outro dispositivo na mesma rede, use o endereço de rede mostrado pelo Vite, se a rede permitir.

## Build de produção

```bash
npm run build
npm run preview
```

O service worker é registrado apenas em build de produção. Para instalar como PWA, sirva a build por HTTPS ou `localhost` e use a opção de instalação do navegador Android quando disponível.

## Dados e limitações

- O endpoint SGS do BCB é consultado diretamente pelo navegador. A disponibilidade depende de internet, disponibilidade da API e políticas de CORS.
- Séries macroeconômicas têm periodicidades diferentes. Selic meta é uma taxa anualizada, IPCA é variação mensal e USD/BRL é uma série diária de referência; não compare diretamente os valores.
- As cotações de ações, ETFs, índices, futuros e cripto ainda não estão conectadas a um provedor. O cadastro de tickers serve para navegação, não garante que o ativo tenha feed.
- Notícias e calendário econômico ainda não estão conectados.
- A carteira é apenas um registro local de quantidade e custo. Não representa valor de mercado.
- Os dados salvos no `localStorage` pertencem ao navegador/dispositivo e podem ser apagados se os dados do navegador forem limpos.
- O cálculo de juros usa uma aproximação de taxa mensal igual à taxa anual dividida por 12; não inclui impostos, inflação, taxas ou aportes.
- Não é aconselhamento financeiro.

## Fontes consultadas

- Banco Central do Brasil — Dados Abertos: https://www.bcb.gov.br/acessoinformacao/dadosabertos
- Portal de Dados Abertos do BCB: https://dadosabertos.bcb.gov.br/
- Vite PWA documentation: https://vite-pwa-org.netlify.app/
- React: https://react.dev/
- Vite: https://vite.dev/

## Próximas etapas técnicas

1. Criar backend para proteger chaves e normalizar dados.
2. Adicionar fonte de preços com cobertura, limites e licenças confirmados.
3. Implementar histórico OHLCV e gráficos financeiros.
4. Criar testes automatizados de fórmulas e integrações.
5. Implementar calendário e notícias a partir de fontes permitidas.
6. Revisar a política de cache, licenças e redistribuição antes de publicar.
