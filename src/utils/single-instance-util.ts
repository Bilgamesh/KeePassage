import { EventEmitter } from 'events';
import { unlinkSync } from 'fs';
import { connect, createServer, type Server } from 'net';
import { tmpdir } from 'os';
import { join } from 'path';

class SingleInstance extends EventEmitter {
  private socketPath: string;
  private server: Server | null;

  constructor(appName: string, options?: { socketPath?: string }) {
    super();

    const defaultSocketPath =
      process.platform == 'win32'
        ? `\\\\.\\pipe\\${appName}-sock`
        : join(tmpdir(), `${appName}.sock`);

    this.socketPath = options?.socketPath || defaultSocketPath;
    this.server = null;
  }

  lock() {
    return new Promise((resolve, reject) => {
      const client = connect({ path: this.socketPath }, () => {
        client.write('connectionAttempt', () => {
          reject('An application is already running');
        });
      });

      client.on('error', (err) => {
        try {
          unlinkSync(this.socketPath);
        } catch (err) {
          if ((err as any).code !== 'ENOENT') {
            throw err;
          }
        }
        this.server = createServer((connection) => {
          connection.on('data', () => {
            this.emit('connection-attempt');
          });
        });
        resolve(true);
        this.server.listen(this.socketPath);
        this.server.on('error', (err) => {
          reject(err);
        });
      });
    });
  }

  unlock() {
    return new Promise((resolve, reject) => {
      if (this.server) {
        this.server.close((err) => {
          if (err) {
            reject(err);
          } else {
            resolve(true);
          }
        });
      } else {
        resolve(true);
      }
    });
  }
}

export { SingleInstance };
