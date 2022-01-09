import path from 'path';
import { app, Tray, Menu, nativeImage } from 'electron';
import * as SendToSlack from './sendToSlack';
import type { FSWatcher } from 'chokidar';

const isDev = process.env.NODE_ENV === 'development';

if (isDev) {
  const execPath =
    process.platform === 'win32'
      ? '../node_modules/electron/dist/electron.exe'
      : '../node_modules/.bin/electron';

  // activate hot reload
  const electronReload = require('electron-reload');
  electronReload(__dirname, {
    electron: path.resolve(__dirname, execPath),
    forceHardReset: true,
    hardResetMethod: 'exit',
  });
}

// const createWindow = () => {
//   const mainWindow = new BrowserWindow({
//     webPreferences: {
//       preload: path.resolve(__dirname, 'preload.js'),
//     },
//   });

//   if (isDev) {
//     mainWindow.webContents.openDevTools({ mode: 'detach' });
//   }

//   mainWindow.loadFile('dist/index.html');
// };

let watcher: FSWatcher | null = null;
function startWatch() {
  if (!watcher) {
    console.info('Already watched.');
    return;
  }

  watcher = SendToSlack.watch();
  console.info('Start watch');
}

function stopWatch() {
  if (watcher) {
    SendToSlack.unwatch(watcher);
    console.info('Stop watch');
    watcher = null;
  }
}

// ガベコレで消されないようにGlobalへ配置
let tray;
app.whenReady().then(() => {
  // createWindow();
  console.log('run');

  /*
   * tray
   */
  const icon = nativeImage.createFromPath(path.resolve(__dirname, 'assets', 'icon.png'))
  // create tray
  tray = new Tray(icon);
  const contextMenu = Menu.buildFromTemplate([
    { label: 'Start', type: 'normal', click: () => startWatch() },
    { label: 'Stop', type: 'normal', click: () => stopWatch() },
    { type: 'separator'},
    { label: 'Close', role: 'quit' }
  ]);

  tray.setContextMenu(contextMenu);

  // tray title
  // tray.setTitle('This is my title');

  app.requestSingleInstanceLock();
  app.dock.hide();
});

// // すべてのウィンドウが閉じられたらアプリを終了する
// app.once('window-all-closed', () => app.quit());
