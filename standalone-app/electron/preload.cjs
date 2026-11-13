const { contextBridge } = require('electron');

contextBridge.exposeInMainWorld('s2rDesktop', {
  isElectron: true,
  platform: process.platform,
  appName: 'S2RFilm Studio Desktop',
  version: '1.0.0'
});
