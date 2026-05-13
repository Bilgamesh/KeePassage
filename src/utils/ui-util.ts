import type { View } from 'gui';

function blur(view: View) {
  view.setEnabled(false);
  setImmediate(() => view.setEnabled(true));
}

export { blur };
