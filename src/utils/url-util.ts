import { spawn } from 'child_process';

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
    throw new Error('Unsupported platform: ' + process.platform);
}

function open(url: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const child = spawn(command, [url]);
    let errorText = '';
    child.stderr.setEncoding('utf8');
    child.stderr.on('data', function (data) {
      errorText += data;
    });
    child.stderr.on('end', function () {
      if (errorText.length > 0) {
        var error = new Error(errorText);
        reject(error);
      } else {
        resolve();
      }
    });
  });
}

export { open };
