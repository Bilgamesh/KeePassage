import { app, MessageLoop } from 'gui';

import { App } from '@/app';
import { APP_ID, APP_NAME } from '@/data/constants';
import { killPcscDaemon, spawnPcscDaemon } from '@/data/pcsc-orchestrator';
import { render } from '@/renderer';
import { initConfigFile } from '@/service/config-service';
import { SingleInstance } from '@/utils/single-instance-util';
import { createMainWindow, getMainWindow } from '@/windows/main-window';

async function main() {
  app.setName(APP_NAME);
  app.setID(APP_ID);

  await initConfigFile();

  const window = createMainWindow();

  render(() => <App window={window} />, window);

  window.activate();

  spawnPcscDaemon({ respawnOnDeath: true });
  process.on('exit', killPcscDaemon);

  if (!process.versions['yode']) {
    MessageLoop.run();
    process.exit(0);
  }
}

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
