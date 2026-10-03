// Copia a página do app de Windows (../tinta-e-grao/app.html) para src/app.html,
// para a versão de Mac ganhar os mesmos efeitos e correções.
const fs = require('fs');
const path = require('path');

const from = path.join(__dirname, '..', 'tinta-e-grao', 'app.html');
const to = path.join(__dirname, 'src', 'app.html');
if (!fs.existsSync(from)) {
  console.error('Não encontrei ' + from + '. Esse comando só funciona no computador que tem o projeto de Windows ao lado desta pasta.');
  process.exit(1);
}
fs.copyFileSync(from, to);
console.log('src/app.html atualizado a partir do projeto de Windows.');
