import { DaemonMessage, DaemonResponse } from '@/schemas/daemon-message-schema';
import { YubiKey } from '@/schemas/yubikey-schema';
import {
  checkIfPacked,
  getBinExecPath,
  getResourcePath,
  getRootDirname
} from '@/utils/folder-util';
import { createLineReader, createListeners } from '@/utils/listen-util';
import { sleep } from '@/utils/time-util';
import { spawn, type ChildProcessWithoutNullStreams } from 'child_process';
import { randomUUID } from 'crypto';
import { join } from 'path';

const pcscDaemonFilePath = checkIfPacked()
  ? getResourcePath('pcsc-daemon.cjs')
  : join(getRootDirname(), 'build', 'pcsc-daemon.cjs');

const nodePath = checkIfPacked() ? getBinExecPath('node') : 'node';

const pcscListeners = createListeners<DaemonResponse>();

let daemon: ChildProcessWithoutNullStreams | null = null;
let isShuttingDown = false;

function spawnPcscDaemon(config?: { respawnOnDeath?: boolean; logErrors?: boolean }) {
  console.log('Spawning PCSC Daemon');
  daemon = spawn(nodePath, [pcscDaemonFilePath], {
    stdio: ['pipe', 'pipe', 'pipe']
  });

  daemon.stdout.setEncoding('utf8');

  daemon.stderr.on('data', (error) => {
    console.error(`PCSC Daemon error: ${error}`);
  });

  daemon.stdout.on(
    'data',
    createLineReader((data) => {
      try {
        const messages = `${data}`.trim().split('\n');
        for (const msg of messages) {
          const payload = DaemonResponse.parse(JSON.parse(msg));
          pcscListeners.notifyListeners(payload);
        }
      } catch (err) {
        console.error(`Failed to parse PCSC Daemon response: ${err}`);
      }
    })
  );

  if (config?.respawnOnDeath) {
    daemon.on('exit', async (code, signal) => {
      if (code !== 0 && !isShuttingDown) {
        await sleep(2000);
        spawnPcscDaemon();
      }
    });
  }

  if (config?.logErrors && !pcscListeners.hasListener(logErrors)) {
    listenToPcscDaemon(logErrors);
  }

  return daemon;
}

function killPcscDaemon() {
  daemon?.kill();
  daemon = null;
}

function sendToPcscDaemon(msg: DaemonMessage) {
  daemon?.stdin.write(JSON.stringify(msg) + '\n');
}

function sendAndWait(
  msg: DaemonMessage,
  options?: {
    timeoutMs?: number | undefined;
    signal?: AbortSignal | undefined;
  }
) {
  sendToPcscDaemon(msg);
  return pcscListeners.waitForValue({
    condition: (resp) => {
      return resp.id === msg.id;
    },
    timeoutMs: options?.timeoutMs,
    signal: options?.signal
  });
}

function listenToPcscDaemon(listener: (msg: DaemonResponse) => void) {
  pcscListeners.addListener(listener);
  const cleanup = () => pcscListeners.removeListener(listener);
  return cleanup;
}

function removeListener(listener: (msg: DaemonResponse) => void) {
  pcscListeners.removeListener(listener);
}

function logErrors(msg: DaemonResponse) {
  if (msg.status.endsWith('_ERROR')) {
    console.error(`Error in the PCSC Daemon: ${(msg as any).error}`);
  }
}

function monitorYubiKeys(
  onYubiKey: (key: YubiKey) => void,
  options?: { immediate?: boolean; intervalMs?: number }
) {
  const listenerCleanup = listenToPcscDaemon((msg) => {
    if (msg.status === 'DETECT_YUBIKEYS_SUCCESS') {
      onYubiKey({ paired: false, publicKey: msg.publicKey, serial: msg.serial, slot: msg.slot });
    }
  });
  const detectionInterval = setInterval(() => {
    sendToPcscDaemon({
      id: randomUUID(),
      command: 'DETECT_YUBIKEYS'
    });
  }, options?.intervalMs || 3000);
  const cleanup = () => {
    listenerCleanup();
    clearInterval(detectionInterval);
  };
  if (options?.immediate) {
    sendToPcscDaemon({
      id: randomUUID(),
      command: 'DETECT_YUBIKEYS'
    });
  }
  return cleanup;
}

export {
  killPcscDaemon,
  listenToPcscDaemon,
  monitorYubiKeys,
  removeListener,
  sendAndWait,
  sendToPcscDaemon,
  spawnPcscDaemon
};
