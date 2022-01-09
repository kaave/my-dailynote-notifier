import path from 'path';
import { app, Tray, Menu, nativeImage } from 'electron';

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

// ガベコレで消されないようにGlobalへ配置
let tray;
app.whenReady().then(() => {
  // createWindow();
  console.log('run');

  const icon = nativeImage.createFromPath(path.resolve(__dirname, 'assets', 'icon.png'))
  // create tray
  tray = new Tray(icon);
  const contextMenu = Menu.buildFromTemplate([
    { label: 'Item1', type: 'radio', click: () => console.log('clicked Item1') },
    { label: 'Item2', type: 'radio', click: () => console.log('clicked Item2') },
    { label: 'Item3', type: 'radio', click: () => console.log('clicked Item3'), checked: true },
    { label: 'Item4', type: 'radio', click: () => console.log('clicked Item4') },
    { type: 'separator'},
    { label: 'Close', role: 'quit' }
  ]);

  tray.setContextMenu(contextMenu);

  // tray title
  // tray.setTitle('This is my title');
});

// // すべてのウィンドウが閉じられたらアプリを終了する
// app.once('window-all-closed', () => app.quit());
