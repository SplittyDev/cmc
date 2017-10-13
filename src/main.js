/* eslint-disable no-console */

// eslint-disable-next-line import/no-extraneous-dependencies
const electron = require('electron');

const {
  // Module to control application life.
  app,
  // Module to create native browser window.
  BrowserWindow,
} = electron;

// CMC API
const cmcApi = require('./content/js/coinmarketcap.api');

// Node
const path = require('path');
const url = require('url');

// Set global state variable
global.cmcstate = {
  currency: 'USD',
};

if ((process.env.NODE_ENV || 'production') === 'development') {
  // Live reload
  // eslint-disable-next-line import/no-extraneous-dependencies, global-require
  require('electron-reload')(__dirname, {
    ignored: /node_modules|content\/sass|[/\\]\./,
  });
  // eslint-disable-next-line import/no-extraneous-dependencies, global-require
  const chokidar = require('chokidar');
  const sassWatcher = chokidar.watch(path.join(__dirname, 'content/sass/*.sass'));
  let rebuilding = false;
  sassWatcher.on('change', () => {
    if (rebuilding) {
      console.log('Still rebuilding.. Please wait.');
      return;
    }
    rebuilding = true;
    console.log('Rebuilding files...');
    // eslint-disable-next-line global-require
    require('../build')();
    console.log('Finished rebuilding files!');
    rebuilding = false;
  });
}

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;

function createWindow() {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 600,
    height: 800,
    icon: path.join(__dirname, 'icon/icon.png'),
  });

  // Menu template
  const menuTemplate = [
    {
      label: 'App',
      submenu: [
        { role: 'quit' },
      ],
    },
    { role: 'editMenu' },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { type: 'separator' },
        { role: 'resetzoom' },
        { role: 'zoomin' },
        { role: 'zoomout' },
        { type: 'separator' },
        { role: 'togglefullscreen' },
      ],
    },
    { role: 'windowMenu' },
    {
      label: 'Options',
      submenu: [
        {
          label: 'Convert Currency',
          submenu: cmcApi.SupportedCurrencies.map(val => ({
            label: val,
            click() { global.cmcstate.currency = val; },
          })),
        },
      ],
    },
    {
      label: 'Help',
      submenu: [
        {
          label: 'Report a bug (requires GitHub account)',
          // eslint-disable-next-line global-require
          click() { require('opn')('https://github.com/SplittyDev/cmc/issues/new'); },
        },
      ],
    },
  ];
  if ((process.env.NODE_ENV || 'production') === 'development') {
    menuTemplate.push({
      label: 'Developer Tools',
      submenu: [
        { role: 'reload' },
        { role: 'forcereload' },
        { role: 'toggledevtools' },
      ],
    });
  }
  const menu = electron.Menu.buildFromTemplate(menuTemplate);
  electron.Menu.setApplicationMenu(menu);

  // and load the index.html of the app.
  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'content/html/index.html'),
    protocol: 'file:',
    slashes: true,
  }));

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()

  // Emitted when the window is closed.
  mainWindow.on('closed', () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  });
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
