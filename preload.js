// Ponte mínima entre a página e o processo principal: a página avisa quando
// o usuário troca idioma ou tema nas Configurações.
const { contextBridge, ipcRenderer } = require('electron');

let savedSettings = {};
try { savedSettings = ipcRenderer.sendSync('ts:get-settings') || {}; } catch (e) {}
let savedPresets = null;
try { savedPresets = ipcRenderer.sendSync('ts:get-presets'); } catch (e) {}

contextBridge.exposeInMainWorld('desktop', {
  savedSettings,
  savedPresets,
  savePresets: list => ipcRenderer.send('ts:save-presets', list),
  setLanguage: lang => ipcRenderer.send('ts:lang', lang),
  setTheme: theme => ipcRenderer.send('ts:theme', theme),
});
