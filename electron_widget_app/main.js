const { app, Tray, Menu, nativeImage, Notification, shell, BrowserWindow, ipcMain } = require('electron');
const Store = require('electron-store');
const path = require('path');
const http = require('http');

const store = new Store();

let tray = null;
let status = '...';
let currentIcon = '';
let lastStatus = null;
let notifyOnceWhenFree = false;

let apiIp = store.get('apiIp') || '127.0.0.1';
let apiUrl = `http://${apiIp}:5000/api/status`;
let webUrl = `http://${apiIp}:5000/`;

function updateApiUrl() {
  apiUrl = `http://${apiIp}:5000/api/status`;
  webUrl = `http://${apiIp}:5000/`;
}

function getIconPathByStatus(status) {
  switch (status) {
    case 'OK': return 'ok.png';
    case 'NONE': return 'none.png';
    case 'DISCONNECTED': return 'offline.png';
    default: return 'offline.png';
  }
}

function translateStatus(status) {
  switch (status) {
    case 'OK': return 'Detected';
    case 'NONE': return 'Undetected';
    case 'DISCONNECTED': return 'Disconnected';
    default: return 'Inconnu';
  }
}

function sendDesktopNotification(title, body) {
  new Notification({ title, body }).show();
}

function updateTrayIcon(status) {
  const iconName = getIconPathByStatus(status);
  if (iconName !== currentIcon) {
    const icon = nativeImage
      .createFromPath(path.join(__dirname, 'icons', iconName))
      .resize({ width: 16, height: 16 });
    tray.setImage(icon);
    currentIcon = iconName;
  }
}

function openIpConfigWindow() {
  const win = new BrowserWindow({
    width: 400,
    height: 300,
    resizable: false,
    title: 'IP Configuration',
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
	  disableHardwareAcceleration: true
    }
  });

  win.loadFile(path.join(__dirname, 'config.html'));
}

function updateTrayMenu(status) {
  const contextMenu = Menu.buildFromTemplate([
    { label: `Status : ${translateStatus(status)}`, enabled: false },
    { label: `Server IP : ${apiIp}`, enabled: false },
    { type: 'separator' },
	{
	  label: notifyOnceWhenFree
		? '✅ Notify me when free (enabled)'
		: (status === 'OK' ? '🔔 Notify me when free' : '🔕 Notify me when free (disabled)'),
	  enabled: status === 'OK' && !notifyOnceWhenFree,
	  click: () => {
		if (status === 'OK') {
		  notifyOnceWhenFree = true;
		  updateTrayMenu(status);
		}
	  }
	},
    {
      label: '🌐 Open webpage',
      click: () => {
        shell.openExternal(webUrl);
      }
    },
    {
      label: '⚙️ Configure IP address',
      click: () => {
        openIpConfigWindow();
      }
    },
    { type: 'separator' },
    { label: '❌ Quit', click: () => app.quit() }
  ]);

  tray.setContextMenu(contextMenu);
  tray.setToolTip(`Sensor : ${translateStatus(status)} | IP : ${apiIp}`);
}

function handleDisconnected() {
  status = 'DISCONNECTED';
  updateTrayIcon(status);
  updateTrayMenu(status);
}

function fetchStatus() {
  http.get(apiUrl, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      try {
        const json = JSON.parse(data);
        const newStatus = json.status || 'DISCONNECTED';

		if (lastStatus === 'OK' && newStatus === 'NONE' && notifyOnceWhenFree) {
		  sendDesktopNotification('📣 Room status', 'The room is now free.');
		  notifyOnceWhenFree = false;
		}

        status = newStatus;
        lastStatus = newStatus;

        updateTrayIcon(status);
        updateTrayMenu(status);
      } catch (err) {
        handleDisconnected();
      }
    });
  }).on('error', handleDisconnected);
}

ipcMain.handle('getCurrentIp', () => {
  return apiIp;
});

ipcMain.on('saveIp', (event, newIp) => {
  if (newIp && newIp.trim()) {
    apiIp = newIp.trim();
    store.set('apiIp', apiIp);
    updateApiUrl();
    fetchStatus();
    updateTrayMenu(status);
  }
});

app.whenReady().then(() => {
  const icon = nativeImage
    .createFromPath(path.join(__dirname, 'icons', 'offline.png'))
    .resize({ width: 16, height: 16 });
  
  tray = new Tray(icon);
  updateApiUrl();
  updateTrayMenu(status);
  fetchStatus();
  setInterval(fetchStatus, 2000);
});

app.on('window-all-closed', (e) => {
  e.preventDefault();
});