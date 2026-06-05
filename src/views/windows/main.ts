import { Container, type Window } from 'gui';
import { createRoot } from 'solid-js';
import {
  APP_NAME,
  MAX_SIZE,
  MIN_SIZE,
  WINDOWS_APP_BACKGROUND_COLOR
} from '#/data/constants';
import { createWindow, getWindow } from '#/utils/ui';

type Toggleable = { toggleVisibility: (show: boolean) => void };
type ToggleableWindow = Window & Toggleable;

function MainWindow() {
  const existing = getWindow<ToggleableWindow>(APP_NAME);
  if (existing) return existing;
  let win: ToggleableWindow;
  createRoot(() => {
    win = createWindow(APP_NAME) as ToggleableWindow;
    const contentView = Container.create();
    contentView.setStyle({ flex: 1 });
    win.setContentView(contentView);
    if (process.platform === 'win32')
      win.setBackgroundColor(WINDOWS_APP_BACKGROUND_COLOR);

    win.setContentSizeConstraints(MIN_SIZE, MAX_SIZE);
    win.setContentSize(MIN_SIZE);

    win.toggleVisibility = (show: boolean) => {
      if (show) {
        win.restore();
        win.setSkipTaskbar(false);
        win.activate();
      } else {
        win.minimize();
        win.setSkipTaskbar(true);
      }
    };

    win.center();
  });
  return win!;
}

export { MainWindow, type ToggleableWindow };
