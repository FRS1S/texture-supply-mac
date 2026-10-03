// Gera app/index.html a partir de src/app.html, trocando recursos online por arquivos locais.
const fs = require('fs');
const path = require('path');

const root = __dirname;
const out = path.join(root, 'app');
const fontsOut = path.join(out, 'fonts');
fs.mkdirSync(fontsOut, { recursive: true });

const FONTS = [
  ['Anton', 'anton', 400],
  ['IBM Plex Mono', 'ibm-plex-mono', 400],
  ['IBM Plex Mono', 'ibm-plex-mono', 500],
  ['IBM Plex Sans', 'ibm-plex-sans', 400],
  ['IBM Plex Sans', 'ibm-plex-sans', 500],
  ['IBM Plex Sans', 'ibm-plex-sans', 600],
  ['Sora', 'sora', 700],
  ['Sora', 'sora', 800],
  ['VT323', 'vt323', 400],
];

let css = '';
for (const [family, pkg, weight] of FONTS) {
  // O subconjunto "latin" já cobre os acentos do português (ã, ç, ô…).
  for (const subset of ['latin']) {
    const file = `${pkg}-${subset}-${weight}-normal.woff2`;
    const src = path.join(root, 'node_modules', '@fontsource', pkg, 'files', file);
    if (!fs.existsSync(src)) continue;
    fs.copyFileSync(src, path.join(fontsOut, file));
    css += `@font-face{font-family:"${family}";font-style:normal;font-weight:${weight};font-display:swap;src:url("fonts/${file}") format("woff2");}\n`;
  }
}
fs.writeFileSync(path.join(out, 'fonts.css'), css);
fs.copyFileSync(path.join(root, 'node_modules', 'jszip', 'dist', 'jszip.min.js'), path.join(out, 'jszip.min.js'));
fs.copyFileSync(path.join(root, 'build', 'icon.png'), path.join(out, 'icon.png'));
// Abertura (vídeo piraru*): o vídeo vai junto e o trecho intro.html entra no topo da página.
fs.copyFileSync(path.join(root, 'splash', 'abertura.mp4'), path.join(out, 'abertura.mp4'));
const intro = fs.readFileSync(path.join(root, 'splash', 'intro.html'), 'utf8');

// src/app.html é a mesma página do app de Windows (atualize com `npm run sync`).
let html = fs.readFileSync(path.join(root, 'src', 'app.html'), 'utf8');
html = html
  .replace(/<link rel="preconnect"[^>]*>\s*/g, '')
  .replace(/<link rel="stylesheet" href="https:\/\/fonts\.googleapis\.com[^>]*>/, '<link rel="stylesheet" href="fonts.css">')
  .replace(/<script src="https:\/\/cdnjs\.cloudflare\.com\/ajax\/libs\/jszip\/[^"]*"><\/script>/, '<script src="jszip.min.js"></script>');

if (/https:\/\/(fonts\.googleapis|cdnjs)/.test(html)) throw new Error('Ainda há recursos online no HTML.');

const doc = `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self' 'unsafe-inline' blob:; worker-src 'self' blob:; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self'">
</head>
<body style="margin:0">
${intro}
${html}
</body>
</html>
`;
fs.writeFileSync(path.join(out, 'index.html'), doc);
console.log('app/index.html gerado (' + Math.round(doc.length / 1024) + ' KB)');
