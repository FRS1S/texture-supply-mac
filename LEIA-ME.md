# Texture Supply by piraru* for Mac

Versão de macOS do app. É o mesmo app do Windows (`src/app.html` é cópia de `../tinta-e-grao/app.html`),
com menus, atalhos e ícone no padrão do Mac. Gera um `.dmg` **universal**: roda em Macs com chip Apple (M1–M4) e com Intel.

> O `.dmg` só pode ser gerado em um macOS (regra da Apple e do electron-builder). Há dois caminhos.

---

## Caminho A: sem Mac, pelo GitHub (recomendado)

O GitHub empresta um Mac na nuvem e gera o `.dmg` sozinho, usando `.github/workflows/build-mac.yml`.

1. Crie uma conta grátis em https://github.com (se ainda não tiver).
2. Instale o **GitHub Desktop**: https://desktop.github.com e entre com a conta.
3. No GitHub Desktop: **File › Add local repository…** › escolha a pasta `C:\Users\User\ClaudeCode\texture-supply-mac`.
   Ele vai avisar que a pasta ainda não é um repositório: clique em **create a repository** › **Create repository**.
4. Clique em **Publish repository**. Pode deixar **Keep this code private** marcado.
5. No site do GitHub, abra o repositório › aba **Actions**. A execução "Gerar versão para Mac" começa sozinha
   (leva uns 10 minutos). Se não começar, clique nela › **Run workflow**.
6. Quando ficar verde, abra a execução e baixe **Texture-Supply-mac** em *Artifacts*. Dentro do .zip está o `.dmg`.

Depois disso, a cada mudança: atualize a página (`npm run sync`), aumente `"version"` no `package.json`,
e no GitHub Desktop clique em **Commit to main** e **Push origin**. Um `.dmg` novo é gerado sozinho.

Repositórios privados têm uma cota mensal grátis de minutos de Mac; para um build por versão ela costuma sobrar.

## Caminho B: num Mac (emprestado de um amigo, por exemplo)

1. No Mac, instale o **Node.js LTS**: https://nodejs.org (baixe o instalador `.pkg` e avance até o fim).
2. Copie esta pasta para o Mac (pendrive, AirDrop, Google Drive…), **sem** as pastas `node_modules`, `dist` e `app`.
3. Abra o **Terminal** (⌘ + espaço, digite "Terminal") e rode, um de cada vez:

   ```
   cd ~/Desktop/texture-supply-mac
   npm install
   npm run dist:mac
   ```

   (troque `~/Desktop/texture-supply-mac` pelo lugar onde a pasta ficou; dá para digitar `cd ` e arrastar a pasta para o Terminal).
4. O instalador fica em `dist/Texture-Supply-by-piraru-1.0.0-mac.dmg`.
   Para testar sem gerar o .dmg: `npm start`.

---

## Instalar e abrir no Mac (para você e seus amigos)

1. Abra o `.dmg` e arraste **Texture Supply by piraru** para a pasta **Aplicativos**.
2. **Na primeira vez**, o Mac bloqueia porque o app não tem certificado da Apple:
   - clique com o **botão direito** no app (em Aplicativos) › **Abrir** › **Abrir**; ou
   - vá em **Ajustes do Sistema › Privacidade e Segurança**, role até o aviso do Texture Supply e clique em **Abrir Mesmo Assim**.
3. Se aparecer *"está danificado e não pode ser aberto"* (acontece com arquivos baixados da internet), abra o Terminal e rode:

   ```
   xattr -cr "/Applications/Texture Supply by piraru.app"
   ```

   Depois abra normalmente. Isso só remove a marca de "baixado da internet"; não altera o app.

Para o app abrir sem nenhum aviso é preciso o **Apple Developer Program** (US$ 99/ano), que permite assinar
e notarizar o app. Com a conta, dá para ligar isso no `build-mac.yml` (certificado em *Secrets* do GitHub).

---

## Diferenças em relação ao Windows

- Menu com o nome do app: Sobre, **Ajustes (⌘,)**, Ocultar, Sair; menu **Janela**.
- Fechar a janela mantém o app no Dock (clique no ícone para abrir de novo); ⌘Q encerra.
- Atalhos com ⌘: ⌘Z / ⇧⌘Z desfazer e refazer, ⌘O abrir, ⌘S exportar, ⌘1 tamanho real.
- Zoom: **Option (⌥) + rolagem** ou pinça no trackpad; espaço + arrastar para mover.
- Configurações ficam em `~/Library/Application Support/Texture Supply by piraru/configuracoes.json`.

## Comandos

- `npm run sync`: copia a página atual do projeto de Windows (`../tinta-e-grao/app.html`) para `src/app.html`
- `npm start`: abre o app para testar
- `npm run dist:mac`: gera o `.dmg` e o `.zip` em `dist/` (só funciona no macOS)
- `python make-icon.py`: recria `build/icon.png` (1024 px, grid de ícones do macOS)
