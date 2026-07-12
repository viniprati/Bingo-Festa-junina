# Bingo Festa Junina

Site de bingo tradicional com tema de Festa Junina. O projeto sorteia números de 1 a 75 nas colunas B, I, N, G e O, marca o painel completo e mantém a rodada salva no navegador.

## Recursos

- Sorteio aleatório sem repetição.
- Bola principal com letra e número atual.
- Histórico das seis últimas prendas sorteadas.
- Painel completo B-I-N-G-O com números marcados.
- Salvamento automático no `localStorage`.
- Reinício da rodada com confirmação.
- Modal responsivo com regras para quatro cantos, quina e cartela cheia.
- Atalho por Espaço ou Enter quando o modal estiver fechado.
- Visual junino com bandeirinhas em CSS, cores de arraial e animações leves.
- Suporte a `prefers-reduced-motion`.

## Como abrir localmente

Abra o arquivo `index.html` diretamente no navegador.

## Usando Live Server

1. Abra a pasta do projeto no VS Code.
2. Instale a extensão Live Server, se ainda não tiver.
3. Clique com o botão direito em `index.html`.
4. Escolha `Open with Live Server`.

## Usando Python

Execute o comando na raiz do projeto:

```bash
python -m http.server 5500
```

Depois acesse:

```text
http://localhost:5500
```

## Arquivos

- `index.html`: estrutura da página, modal e painel do bingo.
- `style.css`: identidade visual, responsividade e animações.
- `script.js`: lógica de sorteio, histórico, persistência e eventos.
- `README.md`: instruções e descrição do projeto.
