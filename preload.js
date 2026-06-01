// Secure Preload Script - AI Supreme
const { contextBridge, ipcRenderer } = require('electron');

// 1. Whitelist strict channels for communication
const VALID_RECEIVE_CHANNELS = ['trigger-project-zero'];
const VALID_SEND_CHANNELS = ['dashboard-status'];

// 2. Expose protected methods to the window object
contextBridge.exposeInMainWorld('sovereignAPI', {
    // Receive messages from Main process
    onNuclearPurge: (callback) => {
        ipcRenderer.on('trigger-project-zero', (_event, ...args) => {
            callback(...args);
        });
    },
    // Send validated messages to Main process
    sendStatus: (status) => {
        if (VALID_SEND_CHANNELS.includes('dashboard-status')) {
            ipcRenderer.send('dashboard-status', status);
        }
    }
});
