import type { Button } from 'gui';

function autoUnfocus(button: Button, callback: () => void) {
  button.setEnabled(false);
  callback();
  setImmediate(() => button.setEnabled(true));
}

export { autoUnfocus };
