import { Container, MessageLoop, Tray, type Window } from 'gui';
import { createEffect } from 'solid-js';
import {
  APP_NAME,
  MAX_SIZE,
  MIN_SIZE,
  WINDOWS_APP_BACKGROUND_COLOR
} from '#/data/constants';
import { appSettings } from '#/data/shared-state';
import { createWindow, deleteWindow } from '#/utils/ui';
import { AppIcon } from '#/views/components/app-icon';
import { MainMenuBar } from '#/views/components/main-menu-bar';
import { TrayMenu } from '#/views/components/tray-menu';

type ToggleableWindow = Window & { toggleVisibility: (show: boolean) => void };

let tray: Tray | null = null;
let win: ToggleableWindow;

function MainWindow() {
  if (win) return win;
  win = createWindow(APP_NAME) as ToggleableWindow;
  const contentView = Container.create();
  contentView.setStyle({ flex: 1 });
  win.setContentView(contentView);
  if (process.platform === 'win32') {
    win.setBackgroundColor(WINDOWS_APP_BACKGROUND_COLOR);
  }

  createEffect(() => {
    const menuBar = MainMenuBar({ window: win });
    if (appSettings().showMenuBar) {
      win.setMenuBar(menuBar);
    }
    win.setMenuBarVisible(appSettings().showMenuBar);
  });

  win.setContentSizeConstraints(MIN_SIZE, MAX_SIZE);
  win.setContentSize(MIN_SIZE);

  createEffect(() => {
    if (appSettings().showTrayIcon && !tray)
      tray = Tray.createWithImage(AppIcon());

    if (!appSettings().showTrayIcon && tray) {
      tray.remove();
      tray = null;
    }

    if (tray) {
      tray.setMenu(TrayMenu({ win }));
      tray.onClick = () => {
        win.toggleVisibility(true);
        win.activate();
      };
    }
  });

  // Kill program when main window is closed
  win.onClose.connect(() => {
    if (tray && appSettings().minimiseInsteadOfExit) {
      // Don't close
    } else {
      deleteWindow(APP_NAME);
      MessageLoop.quit();
      process.exit(0);
    }
  });

  win.shouldClose = () => {
    if (appSettings().minimiseInsteadOfExit) {
      if (tray) win.toggleVisibility(false);
      else win.minimize();
      return false;
    }
    return true;
  };

  createEffect(() => {
    win.setAlwaysOnTop(appSettings().alwaysOnTop);
  });

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

  return win;
}

export { MainWindow, type ToggleableWindow };
