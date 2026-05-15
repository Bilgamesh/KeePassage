import { app, MessageLoop } from 'gui';
import { App } from '#/app';
import { APP_ID, APP_NAME } from '#/data/constants';
import { render } from '#/renderer';
import { initConfigFile } from '#/service/config';
import { SingleInstance } from '#/utils/single-instance-util';
import { createMainWindow, getMainWindow } from '#/windows/main-window';

async function main() {
  app.setName(APP_NAME);
  app.setID(APP_ID);

  await initConfigFile();

  const window = createMainWindow();

  render(() => <App window={window} />, window);

  window.activate();

  if (!(process as { versions: { yode?: string } }).versions.yode) {
    MessageLoop.run();
    process.exit(0);
  }
}

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled Rejection:', reason);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});

const locker = new SingleInstance(APP_NAME);
locker
  .lock()
  .then(main)
  .catch(() => {
    // An application is already running
    process.exit(0);
  });

locker.on('connection-attempt', () => {
  getMainWindow()?.restore();
  getMainWindow()?.setSkipTaskbar(false);
});
