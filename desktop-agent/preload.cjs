const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("cipherAgent", {
  setPassword: (plain) => ipcRenderer.invoke("auth:setPassword", plain),
  verifyPassword: (plain) => ipcRenderer.invoke("auth:verifyPassword", plain),
  onVerified: () => ipcRenderer.send("auth:verified"),
  getVerifyAction: () => "quit", // main sets this via a global before opening window
});
