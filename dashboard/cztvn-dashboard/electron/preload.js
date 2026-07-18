const { contextBridge, ipcRenderer } = require('electron');

// Secure bridge: the renderer never touches keys or the filesystem directly.
contextBridge.exposeInMainWorld('cztvn', {
  getConfig:      ()                    => ipcRenderer.invoke('get-config'),
  getIncidents:   (state)               => ipcRenderer.invoke('get-incidents', state),
  getCongestion:  (state)               => ipcRenderer.invoke('get-congestion', state),
  generateCard:   (state, destinations) => ipcRenderer.invoke('generate-card', state, destinations),
  onFeaturedCard: (cb) => ipcRenderer.on('featured-card', (_e, payload) => cb(payload)),
  // Live Board
  getBoard:       ()                    => ipcRenderer.invoke('get-board'),
  openLiveBoard:  ()                    => ipcRenderer.send('open-live-board'),
  // Daily Minutes
  getEvents:      (date)                => ipcRenderer.invoke('get-events', date),
  getEventDates:  ()                    => ipcRenderer.invoke('get-event-dates'),
  openDaily:      ()                    => ipcRenderer.send('open-daily')
});
