const {
    contextBridge,
    ipcRenderer
} = require("electron");

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld(
    "api", {
        receiveOnce: (channel, func) => {
            let validChannels = ["backfiles", "getAllFoldersResult", "sendFolderPictures"];
            if (validChannels.includes(channel)) {
                // Deliberately strip event as it includes `sender` 
                ipcRenderer.once(channel, (event, ...args) => func(...args)); // :)
            }
        },
        send: (channel, ...args) => {
            // whitelist channels
            let validChannels = ["files","getAllFolders", "requestFolderPictures", "sendFolderPictures"];
            if (validChannels.includes(channel)) {
                ipcRenderer.send(channel, ...args);
            }
        },
        receive: (channel, func) => {
            let validChannels = ["backfiles", "getAllFoldersResult", "sendFolderPictures"];
            if (validChannels.includes(channel)) {
                // Deliberately strip event as it includes `sender` 
                ipcRenderer.on(channel, (event, ...args) => func(...args));
            }
        }
    }
);