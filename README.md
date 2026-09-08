# ACE Academy - site

Site estático (HTML + CSS + JS puro, sem build) da ACE Academy, escola de
treino canino em Portugal. Feito para publicar no GitHub Pages.

## Estrutura

```
index.html
css/style.css
js/main.js
assets/img/       imagens otimizadas/derivadas, usadas pelo site
assets/brand/      ficheiros de marca originais (logo .ai/.svg, fotos) - não são carregados pelo site
```

Os favicons, o ícone da Apple, a imagem Open Graph e os dois SVGs do logo em
`assets/img/` (`logo-icon.svg`, `logo-icon-cream.svg`) foram recortados e
gerados a partir de `assets/brand/Logo R03.svg`. Se o logo for atualizado,
estes ficheiros têm de ser regenerados manualmente (não há script incluído
no repositório, para manter o projeto sem dependências de build).

## Testar localmente

Não há build nem dependências. Basta abrir `index.html` num servidor local
(abrir o ficheiro diretamente também funciona, mas alguns browsers bloqueiam
`fetch`/formulários em `file://`). Duas opções simples:

```bash
# Python
python -m http.server 8000

# Node
npx serve .
```

Depois visita `http://localhost:8000`.

## Deploy no GitHub Pages

**Opção recomendada - Deploy from branch** (mais simples; não há passo de
build a executar):

1. Cria o repositório no GitHub e faz push do conteúdo desta pasta para o
   branch `main`.
2. No repositório: **Settings → Pages**.
3. Em **Source**, escolhe **Deploy from a branch**.
4. Em **Branch**, escolhe `main` e a pasta `/ (root)`.
5. Guarda. Ao fim de 1-2 minutos o site fica disponível em
   `https://<utilizador>.github.io/<repositório>/`.

**Alternativa - GitHub Actions**: só compensa se mais tarde adicionares um
passo de build (minificação, etc.). Para um site 100% estático como este,
"Deploy from branch" é suficiente e mais simples de manter.

### Domínio próprio (aceacademy.pt)

O repositório já inclui um ficheiro `CNAME` na raiz com `aceacademy.pt`.
Para ativar o domínio próprio:

1. No teu fornecedor de domínio, cria os registos DNS que o GitHub indica
   para Pages (atualmente um registo `A`/`ALIAS`/`ANAME` para o apex a
   apontar para os IPs do GitHub Pages, ou um `CNAME` para
   `<utilizador>.github.io` se usares um subdomínio como `www`).
   Instruções atualizadas: https://docs.github.com/pages/configuring-a-custom-domain-for-your-github-pages-site
2. Em **Settings → Pages → Custom domain**, confirma `aceacademy.pt` e
   ativa **Enforce HTTPS** assim que o certificado ficar disponível.
3. Se não quiseres ativar o domínio já, podes simplesmente apagar o
   ficheiro `CNAME` - o site continua a funcionar no domínio
   `github.io` normalmente.

## Formulário de contacto

O GitHub Pages não tem backend, por isso o formulário em `#contacto` usa o
[Web3Forms](https://web3forms.com) (grátis até 250 submissões/mês), gerido
por `js/main.js`:

- **Envio normal:** ao submeter, o `fetch` envia os dados para
  `https://api.web3forms.com/submit` com a *access key* configurada em
  `js/main.js` (constante `WEB3FORMS_ACCESS_KEY`). O destino do email
  (`info@aceacademy.pt`) está configurado do lado do Web3Forms, associado a
  essa key - não é definido neste código. Para o alterar, entra na conta
  Web3Forms e muda o email associado à key, ou cria uma key nova.
- **Fallback (só se o pedido falhar - rede em baixo, key inválida, etc.):**
  abre o cliente de email do visitante com a mensagem pré-preenchida
  (`mailto:`), usando o endereço em `data-mailto-fallback` no `<form>`
  (`index.html`). Também serve de destino no atributo `action` do
  `<form>`, para visitantes com JavaScript desativado.

A *access key* está no ficheiro JS (não na marcação HTML) para não ser a
primeira coisa que um scraper de página encontra, mas não é um segredo real
- num site estático, sem servidor, qualquer chave usada do lado do cliente
fica sempre visível a quem inspecionar os pedidos de rede (aba Network do
browser). A proteção contra abuso é feita pelo próprio Web3Forms (limite de
submissões, deteção de spam), não pela chave estar escondida.

Para trocar de serviço (ex: Formspree, Getform), ajusta o endpoint e a
lógica de `fetch`/resposta no bloco "Contact form" de `js/main.js`.

## Conteúdo por confirmar

O texto fixo (Método, citação), o texto sobre o João Lopes/Ace, os preços de
serviços e os dois testemunhos já usam conteúdo real. Ainda falta:

- [ ] Confirmar no painel do Web3Forms que a key em `js/main.js` está
      mesmo associada a `info@aceacademy.pt`.
- [ ] URLs absolutos de `og:image`/`og:url`/`canonical` em `index.html`
      assumem `https://aceacademy.pt/`. Se publicares primeiro só em
      `github.io` (sem domínio próprio ativo), atualiza esses URLs para o
      endereço `github.io` correspondente, para as pré-visualizações em
      redes sociais funcionarem.

## Tipografia e cores

- Títulos: **Anton** (maiúsculas, condensada)
- Números e citações: **Playfair Display**, itálico
- Corpo de texto: **Inter**

Carregadas via Google Fonts (`index.html`), sem instalação local.

Paleta (`css/style.css`, `:root`): laranja `#FF741F`, creme `#FFF5E0`,
castanho/bordô `#64332F`, coral `#E86B59`, branco `#FFFFFF`. O coral é usado
apenas como acento decorativo (bordas, sublinhados, fundos de badges) e não
como cor de texto corrido - sobre o laranja e sobre o creme o coral não
cumpre o contraste AA exigido; para texto usa-se sempre castanho/bordô ou
creme, conforme o fundo for claro ou escuro.
