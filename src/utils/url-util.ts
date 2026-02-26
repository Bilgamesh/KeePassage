import { spawn } from 'node:child_process';

let command: string;

switch (process.platform) {
  case 'darwin':
    command = 'open';
    break;
  case 'win32':
    command = 'explorer.exe';
    break;
  case 'linux':
    command = 'xdg-open';
    break;
  default:
    throw new Error(`Unsupported platform: ${process.platform}`);
}

function open(url: string): Promise<void> {
  return new Promise((resolve, _reject) => {
    try {
      const child = spawn(command, [url]);
      let errorText = '';
      child.stderr.setEncoding('utf8');
      child.stderr.on('data', (data) => {
        errorText += data;
      });
      child.stderr.on('end', () => {
        if (errorText.length > 0) {
          console.error(errorText);
          resolve();
        } else {
          resolve();
        }
      });
    } catch (err) {
      console.error(err);
      resolve();
    }
  });
}

export { open };
