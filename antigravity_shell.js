// Sovereign Shell - Electron Wrapper for AI Supreme Dashboard
import { app, BrowserWindow, Tray, Menu, nativeImage } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
let mainWindow;
let tray = null;
let isQuitting = false;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1440,
        height: 900,
        backgroundColor: '#0a0a0f',
        title: 'AI Supreme // Sovereign Shell',
        icon: path.join(__dirname, 'icon.png'), // Add an icon if available
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true
        }
    });

    // We load the hidden dashboard path
    mainWindow.loadURL('http://localhost:3002/api/sovereign/access');

    // Intercept Close: Minimize to tray instead
    mainWindow.on('close', (event) => {
        if (!isQuitting) {
            event.preventDefault();
            mainWindow.hide();
        }
        return false;
    });

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

function createTray() {
    // For now, use a blank icon or a dot if icon.png is missing
    const icon = nativeImage.createEmpty(); 
    tray = new Tray(icon);
    
    const contextMenu = Menu.buildFromTemplate([
        { label: 'Open Dashboard', click: () => mainWindow.show() },
        { type: 'separator' },
        { label: 'Sovereign Heartbeat: Active', enabled: false },
        { label: 'Project-Zero: Armed', enabled: false },
        { type: 'separator' },
        { label: 'Panic: Nuclear Purge', click: () => {
            // Trigger Project-Zero via IPC or WebRequest
            mainWindow.webContents.executeJavaScript('triggerProjectZero()');
        }},
        { type: 'separator' },
        { label: 'Exit Sovereign Shell', click: () => {
            isQuitting = true;
            app.quit();
        }}
    ]);

    tray.setToolTip('AI Supreme Sovereignty Mesh');
    tray.setContextMenu(contextMenu);
    
    tray.on('double-click', () => {
        mainWindow.show();
    });
}

app.whenReady().then(() => {
    createWindow();
    createTray();
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        // App stays alive in tray
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});
