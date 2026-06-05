import { type View, Window } from 'gui';
import { AppIcon } from '#/views/components/app-icon';

declare global {
  var windowMap: Map<string, Window>;
}

global.windowMap = new Map();

function createWindow(name: string) {
  const win = Window.create({});
  win.setIcon(AppIcon());
  win.setTitle(name);
  global.windowMap.set(name, win);
  win.onClose.connect(() => deleteWindow(name));
  return win;
}

function deleteWindow(name: string) {
  global.windowMap.delete(name);
}

function getWindow<T = Window>(name: string) {
  return global.windowMap.get(name) as T | undefined;
}

function blur(view: View) {
  view.setEnabled(false);
  setImmediate(() => view.setEnabled(true));
}

export { blur, createWindow, deleteWindow, getWindow };
