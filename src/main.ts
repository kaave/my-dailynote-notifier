import path from 'path';
import { BrowserWindow, app } from 'electron';

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

app.whenReady().then(() => {
  // createWindow();
  console.log('run');
});

// // すべてのウィンドウが閉じられたらアプリを終了する
// app.once('window-all-closed', () => app.quit());
