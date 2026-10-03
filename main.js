const { app, BrowserWindow, Menu, shell, dialog, ipcMain, session } = require('electron');
const path = require('path');
const fs = require('fs');

let win = null;
const APP_NAME = 'Texture Supply by piraru*';
const isMac = process.platform === 'darwin';
const BG = { dark: '#0A0A0A', light: '#F2F3EF' };

// Configurações (tema e idioma) ficam em ~/Library/Application Support/Texture Supply by piraru/configuracoes.json (Mac),
// para voltarem iguais quando o app for aberto de novo.
const settingsFile = () => path.join(app.getPath('userData'), 'configuracoes.json');
let saved = {};
try { saved = JSON.parse(fs.readFileSync(settingsFile(), 'utf8')) || {}; } catch (e) { saved = {}; }
function saveSetting(key, value) {
  if (saved[key] === value) return;
  saved[key] = value;
  try { fs.mkdirSync(path.dirname(settingsFile()), { recursive: true }); fs.writeFileSync(settingsFile(), JSON.stringify(saved, null, 2)); } catch (e) {}
}
let lang = ['pt', 'en', 'es'].includes(saved.lang) ? saved.lang : 'pt';

// Textos dos menus nos três idiomas das Configurações.
const MENU = {
  pt: { file: 'Arquivo', open: 'Abrir imagem…', exportPng: 'Exportar PNG…', seps: 'Exportar separações (.zip)…', settings: 'Configurações…', quit: 'Sair',
        edit: 'Editar', undo: 'Desfazer', redo: 'Refazer', paste: 'Colar imagem', surprise: 'Surpreenda-me',
        view: 'Exibir', zoom: 'Tamanho real / Ajustar', zoomIn: 'Aumentar interface', zoomOut: 'Diminuir interface', zoomReset: 'Interface no tamanho padrão',
        full: 'Tela cheia', reload: 'Recarregar', dev: 'Ferramentas de desenvolvedor',
        help: 'Ajuda', about: 'Sobre o Texture Supply', aboutTitle: 'Sobre', window: 'Janela', prefs: 'Ajustes…',
        aboutText: 'Estúdio de retícula para fotos: halftones, riso, xerox, serigrafia, CMYK e texturas de impressão.\n\nArraste uma imagem para a janela, cole com Ctrl+V ou use Arquivo › Abrir imagem.' },
  en: { file: 'File', open: 'Open image…', exportPng: 'Export PNG…', seps: 'Export separations (.zip)…', settings: 'Settings…', quit: 'Quit',
        edit: 'Edit', undo: 'Undo', redo: 'Redo', paste: 'Paste image', surprise: 'Surprise me',
        view: 'View', zoom: 'Actual size / Fit', zoomIn: 'Zoom in interface', zoomOut: 'Zoom out interface', zoomReset: 'Default interface size',
        full: 'Full screen', reload: 'Reload', dev: 'Developer tools',
        help: 'Help', about: 'About Texture Supply', aboutTitle: 'About', window: 'Window', prefs: 'Settings…',
        aboutText: 'Halftone studio for photos: halftones, riso, xerox, screenprint, CMYK and print textures.\n\nDrag an image into the window, paste with Ctrl+V or use File › Open image.' },
  es: { file: 'Archivo', open: 'Abrir imagen…', exportPng: 'Exportar PNG…', seps: 'Exportar separaciones (.zip)…', settings: 'Ajustes…', quit: 'Salir',
        edit: 'Editar', undo: 'Deshacer', redo: 'Rehacer', paste: 'Pegar imagen', surprise: 'Sorpréndeme',
        view: 'Ver', zoom: 'Tamaño real / Ajustar', zoomIn: 'Ampliar interfaz', zoomOut: 'Reducir interfaz', zoomReset: 'Interfaz en tamaño predeterminado',
        full: 'Pantalla completa', reload: 'Recargar', dev: 'Herramientas de desarrollo',
        help: 'Ayuda', about: 'Acerca de Texture Supply', aboutTitle: 'Acerca de', window: 'Ventana', prefs: 'Ajustes…',
        aboutText: 'Estudio de tramas para fotos: halftones, riso, xerox, serigrafía, CMYK y texturas de impresión.\n\nArrastra una imagen a la ventana, pega con Ctrl+V o usa Archivo › Abrir imagen.' },
};

if (!app.requestSingleInstanceLock()) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (win) { if (win.isMinimized()) win.restore(); win.focus(); }
  });
}

const runInPage = code => win && win.webContents.executeJavaScript(code, true);
const clickInPage = id => win && win.webContents.executeJavaScript(`document.getElementById('${id}')?.click()`, true);

function showAbout() {
  const m = MENU[lang] || MENU.pt;
  dialog.showMessageBox(win, { type: 'info', title: m.aboutTitle, message: APP_NAME + ' ' + app.getVersion(), detail: m.aboutText });
}

// No Mac, o primeiro menu leva o nome do app (Sobre, Ajustes ⌘, , Ocultar, Sair);
// "Arquivo" fica só com abrir e exportar, e existe o menu Janela.
function buildMenu() {
  const m = MENU[lang] || MENU.pt;
  const fileItems = [
    { label: m.open, accelerator: 'CmdOrCtrl+O', click: () => clickInPage('btn-open') },
    { label: m.exportPng, accelerator: 'CmdOrCtrl+S', click: () => clickInPage('btn-export') },
    { label: m.seps, accelerator: 'CmdOrCtrl+Shift+S', click: () => clickInPage('btn-seps') },
  ];
  if (!isMac) fileItems.push(
    { type: 'separator' },
    { label: m.settings, accelerator: 'CmdOrCtrl+,', click: () => clickInPage('btn-settings') },
    { type: 'separator' },
    { label: m.quit, role: 'quit' },
  );
  const template = [];
  if (isMac) template.push({
    label: app.name,
    submenu: [
      { label: m.about, click: showAbout },
      { type: 'separator' },
      { label: m.prefs, accelerator: 'Cmd+,', click: () => clickInPage('btn-settings') },
      { type: 'separator' },
      { role: 'services' },
      { type: 'separator' },
      { role: 'hide' },
      { role: 'hideOthers' },
      { role: 'unhide' },
      { type: 'separator' },
      { role: 'quit' },
    ],
  });
  template.push(
    { label: m.file, submenu: fileItems },
    {
      label: m.edit,
      submenu: [
        { label: m.undo, accelerator: 'CmdOrCtrl+Z', click: () => runInPage('undoCommand()') },
        { label: m.redo, accelerator: 'CmdOrCtrl+Shift+Z', click: () => runInPage('redoCommand()') },
        { label: m.redo, accelerator: 'CmdOrCtrl+Y', visible: false, acceleratorWorksWhenHidden: true, click: () => runInPage('redoCommand()') },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { label: m.paste, role: 'paste' },
        { role: 'selectAll' },
        { type: 'separator' },
        { label: m.surprise, accelerator: 'CmdOrCtrl+R', click: () => clickInPage('btn-rand') },
      ],
    },
    {
      label: m.view,
      submenu: [
        { label: m.zoom, accelerator: 'CmdOrCtrl+1', click: () => clickInPage('btn-zoom') },
        { type: 'separator' },
        { label: m.zoomIn, role: 'zoomIn' },
        { label: m.zoomOut, role: 'zoomOut' },
        { label: m.zoomReset, role: 'resetZoom' },
        { type: 'separator' },
        { label: m.full, role: 'togglefullscreen' },
        { label: m.reload, accelerator: isMac ? 'Cmd+Shift+R' : 'F5', role: 'reload' },
        { label: m.dev, role: 'toggleDevTools' },
      ],
    },
  );
  if (isMac) template.push({ label: m.window, role: 'windowMenu' });
  template.push({ label: m.help, role: 'help', submenu: [{ label: m.about, click: showAbout }] });
  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

ipcMain.on('ts:get-settings', e => { e.returnValue = saved; });
ipcMain.on('ts:lang', (_e, l) => { if (!MENU[l]) return; saveSetting('lang', l); if (l !== lang) { lang = l; buildMenu(); } });
ipcMain.on('ts:theme', (_e, theme) => { if (!BG[theme]) return; saveSetting('theme', theme); if (win) win.setBackgroundColor(BG[theme]); });

function createWindow() {
  win = new BrowserWindow({
    width: 1440,
    height: 920,
    minWidth: 900,
    minHeight: 600,
    show: false,
    backgroundColor: '#B6FF00', // mesma cor do fundo do vídeo de abertura
    title: APP_NAME,
    icon: path.join(__dirname, 'app', 'icon.png'),
    webPreferences: { contextIsolation: true, sandbox: true, preload: path.join(__dirname, 'preload.js'), autoplayPolicy: 'no-user-gesture-required' },
  });
  win.on('page-title-updated', e => e.preventDefault());
  // A abertura toca dentro desta mesma janela (ver splash/intro.html).
  win.once('ready-to-show', () => { win.maximize(); win.show(); });
  win.on('closed', () => { win = null; });

  // Exportações: pergunta onde salvar, começando na pasta Imagens.
  win.webContents.session.on('will-download', (_e, item) => {
    const name = item.getFilename();
    item.setSaveDialogOptions({
      title: 'Salvar arquivo',
      defaultPath: path.join(app.getPath('pictures'), name),
      filters: name.endsWith('.zip')
        ? [{ name: 'Arquivo ZIP', extensions: ['zip'] }]
        : [{ name: 'Imagem PNG', extensions: ['png'] }],
    });
  });

  // Alt + rolagem é zoom na prancheta: o Alt sozinho não deve abrir a barra de menus.
  // (só no Windows: lá o Alt ativa a barra de menus; no Mac a tecla Option não tem esse efeito)
  if (!isMac) win.webContents.on('before-input-event', (e, input) => {
    if (input.key === 'Alt' && !input.control && !input.shift && !input.meta) e.preventDefault();
  });
  // A pinça do touchpad vira zoom da prancheta, não da interface.
  win.webContents.setVisualZoomLevelLimits(1, 1);

  // Links externos abrem no navegador padrão.
  win.webContents.setWindowOpenHandler(({ url }) => { shell.openExternal(url); return { action: 'deny' }; });
  win.webContents.on('will-navigate', (e, url) => { if (!url.startsWith('file:')) { e.preventDefault(); shell.openExternal(url); } });

  win.loadFile(path.join(__dirname, 'app', 'index.html'));
}

app.whenReady().then(() => { buildMenu(); createWindow(); });
// Garante que o que a página guardou (prancheta, último ajuste) seja gravado antes de fechar.
app.on('before-quit', () => { try { session.defaultSession.flushStorageData(); } catch (e) {} });
// Mac: fechar a janela mantém o app no Dock; clicar no ícone abre a janela de novo.
app.on('window-all-closed', () => { if (!isMac) app.quit(); });
app.on('activate', () => { if (!win) createWindow(); });
