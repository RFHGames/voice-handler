// Modules to control application life and create native browser window
const { app, BrowserWindow, dialog, ipcMain } = require("electron");
const path = require("node:path");

function createWindow() {
    // Create the browser window.
    const mainWindow = new BrowserWindow({
        width: 1024,
        height: 768,
        webPreferences: {
            preload: path.join(__dirname, "preload.js"),
            nodeIntegration: true,
            contextIsolation: false,
        },
    });

    // and load the index.html of the app.
    mainWindow.loadFile("index.html");

    // Open the DevTools.
    //mainWindow.webContents.openDevTools();
}

async function handleFileSave(_, title, filename) {
    const out = await dialog.showSaveDialog({
        properties: [],
        title,
        defaultPath: path.resolve(`./out/${filename}`),
        filters: [
            {
                name: "Audio",
                extensions: ["wav", "mp3"],
            },
            {
                name: "All Files",
                extensions: ["*"],
            },
        ],
    });

    if (out.canceled) return "";

    return out.filePath;
}

async function handleFileOpen(_, title) {
    const out = await dialog.showOpenDialog({
        properties: [],
        title,
        defaultPath: path.resolve(`./in`),
        filters: [
            {
                name: "Audio",
                extensions: ["wav", "mp3"],
            },
            {
                name: "All Files",
                extensions: ["*"],
            },
        ],
    });

    if (out.canceled) return "";

    return out.filePaths[0];
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
    ipcMain.handle("dialog:saveFile", handleFileSave);
    ipcMain.handle("dialog:openFile", handleFileOpen);

    createWindow();

    app.on("activate", function () {
        // On macOS it's common to re-create a window in the app when the
        // dock icon is clicked and there are no other windows open.
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", function () {
    if (process.platform !== "darwin") app.quit();
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
