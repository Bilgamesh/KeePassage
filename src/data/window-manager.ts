import { Window } from 'gui';
import { AppIcon } from '@/components/app-icon';

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

function getWindow(name: string) {
  return global.windowMap.get(name);
}

function deleteWindow(name: string) {
  global.windowMap.delete(name);
}

export { createWindow, deleteWindow, getWindow };
