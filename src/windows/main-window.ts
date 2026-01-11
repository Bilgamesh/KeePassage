import { MainMenuBar } from '@/components/main-menu-bar';
import { TrayMenu } from '@/components/tray-menu';
import { WINDOWS_APP_BACKGROUND_COLOR, APP_NAME, MAX_SIZE, MIN_SIZE } from '@/data/constants';
import { killPcscDaemon } from '@/data/pcsc-orchestrator';
import { appSettings } from '@/data/shared-state';
import { createWindow, deleteWindow, getWindow } from '@/data/window-manager';
import { AppIcon } from '@/styles';
import { Container, MessageLoop, Tray, Window } from 'gui';
import { createEffect } from 'solid-js';

let tray: Tray | null = null;

function toggleVisibility(window: Window, show: boolean) {
  if (show) {
    window.restore();
    window.setSkipTaskbar(false);
    window.activate();
  } else {
    window.minimize();
    window.setSkipTaskbar(true);
  }
}

function getMainWindow() {
  return getWindow(APP_NAME);
}

function createMainWindow() {
  const win = createWindow(APP_NAME);
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
    if (appSettings().showTrayIcon && !tray) {
      tray = Tray.createWithImage(AppIcon);
    }
    if (!appSettings().showTrayIcon && tray) {
      tray.remove();
      tray = null;
    }
    if (tray) {
      tray.setMenu(TrayMenu({ win, toggleVisibility }));
      tray.onClick = () => {
        toggleVisibility(win, true);
        win.activate();
      };
    }
  });

  // Kill program when main window is closed
  win.onClose.connect(() => {
    if (tray && appSettings().minimiseInsteadOfExit) {
      deleteWindow(APP_NAME);
    } else {
      killPcscDaemon();
      deleteWindow(APP_NAME);
      MessageLoop.quit();
      process.exit(0);
    }
  });

  win.shouldClose = () => {
    if (appSettings().minimiseInsteadOfExit) {
      if (tray) {
        toggleVisibility(win, false);
      } else {
        win.minimize();
      }
      return false;
    }
    return true;
  };

  createEffect(() => {
    win.setAlwaysOnTop(appSettings().alwaysOnTop);
  });

  win.center();

  return win;
}

export { createMainWindow, getMainWindow };
