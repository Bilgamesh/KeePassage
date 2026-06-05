import { app, MessageLoop } from 'gui';
import { App } from '#/app';
import { APP_ID, APP_NAME } from '#/data/constants';
import { render } from '#/renderer';
import { SingleInstance } from '#/utils/single-instance';
import { MainWindow } from '#/views/windows/main';
import { AppProvider } from './data/shared-state';

async function main() {
  app.setName(APP_NAME);
  app.setID(APP_ID);

  const window = MainWindow();

  render(
    () => (
      <AppProvider>
        <App window={window} />
      </AppProvider>
    ),
    window
  );

  window.activate();

  if (!process.versions.yode) {
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
  MainWindow().restore();
  MainWindow().setSkipTaskbar(false);
});
