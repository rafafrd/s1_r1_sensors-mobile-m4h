# Documentação de Arquitetura

Documentação técnica do app **Sensores** (`s1-r1-sensores-1`) — um app Expo/React Native que expõe quatro sensores/APIs nativas do dispositivo através de telas independentes.

Para instalação, scripts e visão geral rápida, veja o [`README.md`](../README.md) na raiz do projeto. Os documentos aqui aprofundam **como o app é organizado por dentro**.

## Índice

| Documento | Conteúdo |
|---|---|
| [`01-visao-geral.md`](./01-visao-geral.md) | Camadas do app, diagrama de arquitetura, decisões de design e convenções visuais |
| [`02-navegacao.md`](./02-navegacao.md) | Estrutura de rotas, tipagem do `RootStackParamList` e configuração do Stack Navigator |
| [`03-telas.md`](./03-telas.md) | Responsabilidade e estado interno de cada tela, com diagramas de fluxo/sequência |
| [`04-padroes-de-estado.md`](./04-padroes-de-estado.md) | Padrões repetidos entre telas (carregamento/erro/sucesso, assinatura de sensores) |
| [`05-permissoes-e-plataforma.md`](./05-permissoes-e-plataforma.md) | Permissões nativas exigidas, diferenças Android/iOS/Web e limitações do Expo Go |

## Leitura recomendada

Se você é novo no projeto, siga nessa ordem: **visão geral → navegação → telas → padrões de estado → permissões**. Cada documento assume o anterior como contexto.
