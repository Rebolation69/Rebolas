# Data sources — ATLAS v0.1.0

## Integrada

### Banco Central do Brasil — SGS
- Portal: https://www.bcb.gov.br/acessoinformacao/dadosabertos
- API utilizada: `https://api.bcb.gov.br/dados/serie/bcdata.sgs.{CODIGO}/dados?formato=json&dataInicial=DD/MM/AAAA`
- Séries no app: 432 (Selic meta), 433 (IPCA mensal), 1 (USD venda diária).
- Tipo: séries históricas oficiais; não são feeds intradiários.
- Requisito: conexão com internet.
- Status: chamada implementada; a resposta depende da disponibilidade da API e do CORS no navegador.

## Ainda não integradas

### Ações, ETFs e índices
Nenhum feed conectado nesta versão. A integração requer uma fonte com cobertura dos mercados desejados, limites verificados e condições de uso compatíveis. Não assumir que dados gratuitos podem ser redistribuídos.

### Criptomoedas
Nenhum feed conectado nesta versão. Uma possível integração futura é a CoinGecko API. Verificar plano, chave, rate limits e atribuição atualizados antes de implementar:
- https://docs.coingecko.com/
- https://www.coingecko.com/en/api

### Notícias e calendário
Ainda sem agregador implementado. Integrar apenas RSS/APIs cuja utilização seja permitida, mantendo link para a fonte original.

## Princípio de integridade
A aplicação não apresenta preços de mercado inventados. Se não houver fonte, o dado aparece como indisponível.
