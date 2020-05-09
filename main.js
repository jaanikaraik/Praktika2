// Modules to control application life and create native browser window
const { app, BrowserWindow } = require('electron')
const path = require('path')
const fs = require('fs')
const { readdir, stat } = require("fs").promises
const { join } = require('path')
const { platform } = require('process');

let currentPath = "";
function logHelper(name, value) {
  console.log(`${name}, type=${typeof (value)}, value=${value}`);
  if(typeof(value) === "object" && value !== null){
      // get properties of object
      console.log(`||||, properties: ${Object.getOwnPropertyNames(value)}`)
  }
}
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
  let allowedRootFolders = ["database_people", "predicted_raw_collection"];
  ipcMain.on('requestFolderPictures', async (event, pictureSubfolderAbsolutePath, rootFolder) => {
    console.log("requestFolderPictures message arrived, processing started");
    logHelper("pictureSubfolderAbsolutePath", pictureSubfolderAbsolutePath);
    logHelper("rootFolder", rootFolder);
    if (!allowedRootFolders.includes(rootFolder)) {
      throw "Client requesting wrong folder, security check.";
    }
    let folderRelativePath = path.join(rootFolder, path.parse(pictureSubfolderAbsolutePath).base);
    logHelper("folderRelativePath", folderRelativePath);
    await fs.readdir(path.join(pictureSubfolderAbsolutePath, "..", "..", rootFolder, path.parse(pictureSubfolderAbsolutePath).base), async function (err, files) {
      if (err) {
        console.error(err);
      }
      let pictures = files.filter(file => file.endsWith("jpg"))
      .map(file => path.join(folderRelativePath, file));
      logHelper("files[0]",files[0]);
      //kontrollitakse, mis platformiga on tegu ja kohandatakse vastavalt sellele kindlast kaustast algav kataloogitee
      var isWin = process.platform === "win32";
      if (isWin) {
        pictures = pictures.map(picture => ".\\" + picture.replace("\\\\","\\"));
      } else {
        pictures = pictures.map(picture => "./" + picture);
      }
      let transferJSON = JSON.stringify({transferArray: pictures});
      console.log("requestFolderPictures message parsed, sending reply");
      event.reply('sendFolderPictures', transferJSON);
    })
  });

  ipcMain.on('requestFolder', async (event, arg) => {
    await fs.readdir(path.join(__dirname, "database_people"), function (err, files) {
      if (err) {
        console.error(err);
        return;
      }
      files.forEach(element => {
        fileArray.push(element);
      });
      var arrayObject = { "files": fileArray };
      var reply = JSON.stringify(arrayObject);
      event.reply('requestFolderResponse', reply);
    })
  });

  let databasePeoplePath = path.join(__dirname, "database_people");
  //uus
  let databasePeoplePathRaw = path.join(__dirname, "predicted_raw_collection");

  ipcMain.on('getAllFolders', async (event, arg) => {
    const dirs = async (path) => {
      let dirs = []
      for (const file of await readdir(path)) {
        let fileLocation = join(path, file);
        if ((await stat(fileLocation)).isDirectory()) {
          dirs = [...dirs, fileLocation]
        }
      }
      return dirs
    }
    let directories = await dirs(databasePeoplePath);
    let directoriesRaw = await dirs(databasePeoplePathRaw);
    if(directories.length < 1){
      console.error("No directories were found.");
    } else {
      console.log(`${directories.length} directories were found.`)
    }
    let arrayObject = { files: directories, filesRaw: directoriesRaw };
    let reply = JSON.stringify(arrayObject);
    console.log(reply.substring(0,200).replace("C:\\Users\\jaanikaraik\\projects\\", ""));
    event.reply('getAllFoldersResult', reply);
    console.log(`Directories sent.`)

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
