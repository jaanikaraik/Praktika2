// Modules to control application life and create native browser window
const { app, BrowserWindow } = require('electron')
const path = require('path')
const fs = require('fs')
const { readdir, stat } = require("fs").promises
const { join } = require('path')
const { platform } = require('process');
function createWindow() {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 1303,
    height: 768,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true, // protect against prototype pollution
      enableRemoteModule: false, // turn off remote
      preload: path.join(__dirname, "preload.js")
    }
  })

  // and load the index.html of the app.
  mainWindow.loadFile('lihtsam.html');
  mainWindow.openDevTools();
  const { ipcMain } = require('electron');
  var fileArray = [];
  ipcMain.on('requestFolderPictures', async (event, folderPath) => {
    let folderPath1 = path.parse(folderPath);
    console.log(`tere, ${folderPath}`)
    let folderName = path.join("database_people", folderPath1.base);
    await fs.readdir(folderPath, async function (err, files) {
      if (err) {
        console.err(err);
      }
      console.log(`töötas ${files[0]}`);
      let pictures = files.filter(file => file.endsWith("jpg"));
      let pictures2 = pictures.map(file => path.join(folderName, file));
      var isWin = process.platform === "win32";
      let pictures3;
      if (isWin) {
        pictures3 = pictures2.map(file => ".\\" + file.replace("\\\\","\\"));
      } else {
        pictures3 = pictures2.map(file => "./" + file);
      }
      let transferObject = {};
      transferObject["transferArray"] = pictures3;
      let transferJSON = JSON.stringify(transferObject);
      event.reply('sendFolderPictures', transferJSON);
    })
  });

  ipcMain.on('requestFolder', async (event, arg) => {
    await fs.readdir(path.join(__dirname, "database_people"), function (err, files) {
      if (err) {
        console.err(err);
      }
      //console.log(files);
      files.forEach(element => {
        fileArray.push(element);
      });
      var arrayObject = { "files": fileArray };
      var reply = JSON.stringify(arrayObject);
      //console.log(reply);
      event.reply('requestFolderResponse', reply);
    })
  });

  let databasePeoplePath = path.join(__dirname, "database_people");

  ipcMain.on('getAllFolders', async (event, arg) => {
    const dirs = async path => {
      let dirs = []
      for (const file of await readdir(databasePeoplePath)) {
        let fileLocation = join(databasePeoplePath, file);
        if ((await stat(fileLocation)).isDirectory()) {
          dirs = [...dirs, fileLocation]
        }
      }
      return dirs
    }
    var arrayObject = { "files": await dirs() };
    var reply = JSON.stringify(arrayObject);
    //console.log(reply);
    event.reply('getAllFoldersResult', reply);

  });

  // Open the DevTools.
  mainWindow.webContents.openDevTools()
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') app.quit()
})

app.on('activate', function () {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
