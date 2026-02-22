const { app, BrowserWindow, Menu, shell } = require('electron');
const path = require('path');

let win;

function createWindow() {
  win = new BrowserWindow({
    width: 1440,
    height: 920,
    minWidth: 1024,
    minHeight: 640,
    icon: path.join(__dirname, 'assets', 'icon.ico'),
    title: 'Candlescope FinanceBoard',
    backgroundColor: '#0b0d14',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
    titleBarStyle: 'default',
    show: false,
  });

  win.loadFile('index.html');
  win.once('ready-to-show', () => win.show());

  win.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });
}

// ── MENÜ ──────────────────────────────
const menuTemplate = [
  {
    label: 'Candlescope',
    submenu: [
      { label: 'Über FinanceBoard', role: 'about' },
      { type: 'separator' },
      { label: 'Beenden', role: 'quit', accelerator: 'CmdOrCtrl+Q' },
    ],
  },
  {
    label: 'Bearbeiten',
    submenu: [
      { label: 'Rückgängig',      role: 'undo' },
      { label: 'Wiederholen',     role: 'redo' },
      { type: 'separator' },
      { label: 'Ausschneiden',    role: 'cut' },
      { label: 'Kopieren',        role: 'copy' },
      { label: 'Einfügen',        role: 'paste' },
      { label: 'Alles auswählen', role: 'selectAll' },
    ],
  },
  {
    label: 'Ansicht',
    submenu: [
      { label: 'Neu laden',   accelerator: 'F5',  click: () => win?.reload() },
      { label: 'Vollbild',    accelerator: 'F11', click: () => win?.setFullScreen(!win.isFullScreen()) },
      { type: 'separator' },
      { label: 'Vergrößern',  role: 'zoomIn',    accelerator: 'CmdOrCtrl+=' },
      { label: 'Verkleinern', role: 'zoomOut',   accelerator: 'CmdOrCtrl+-' },
      { label: 'Zurücksetzen',role: 'resetZoom', accelerator: 'CmdOrCtrl+0' },
      { type: 'separator' },
      { label: 'DevTools', accelerator: 'F12', click: () => win?.webContents.toggleDevTools() },
    ],
  },
];

Menu.setApplicationMenu(Menu.buildFromTemplate(menuTemplate));

app.whenReady().then(createWindow);
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });