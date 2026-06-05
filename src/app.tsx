import { appearance, MessageLoop, Tray } from 'gui';
import { createEffect } from 'solid-js';
import { useAppContext } from '#/data/shared-state';
import { MainMenuBar } from '#/views/components/main-menu-bar';
import { Navigator, Router } from '#/views/components/router';
import { Toolbar } from '#/views/components/toolbar';
import { DatabaseIndexPage } from '#/views/pages/database-index';
import { EntryPage } from '#/views/pages/entry';
import { PinentryPage } from '#/views/pages/pinentry';
import { PwGeneratorPage } from '#/views/pages/pw-generator';
import { SettingsPage } from '#/views/pages/settings';
import { TouchPage } from '#/views/pages/touch';
import { WelcomePage } from '#/views/pages/welcome';
import { initConfigFile } from './service/config';
import { refreshDbLock } from './service/database';
import { AppIcon } from './views/components/app-icon';
import { TrayMenu } from './views/components/tray-menu';
import type { ToggleableWindow } from './views/windows/main';

const navigator = new Navigator({
  WELCOME: 0,
  PINTENTRY: 1,
  TOUCH: 2,
  DB_INDEX: 3,
  ENTRY: 4,
  SETTINGS: 5,
  GENERATOR: 6
});

let tray: Tray | null = null;

function App(props: { window: ToggleableWindow }) {
  const state = useAppContext();
  const { appSettings, setDark } = state;

  initConfigFile(state);

  createEffect(() => {
    props.window.setAlwaysOnTop(appSettings().alwaysOnTop);
  });

  createEffect(() => {
    const menuBar = MainMenuBar({ window: props.window });
    if (appSettings().showMenuBar) props.window.setMenuBar(menuBar);
    props.window.setMenuBarVisible(appSettings().showMenuBar);
  });

  createEffect(() => {
    if (appSettings().showTrayIcon && !tray)
      tray = Tray.createWithImage(AppIcon());

    if (!appSettings().showTrayIcon && tray) {
      tray.remove();
      tray = null;
    }

    if (tray) {
      tray.setMenu(TrayMenu({ win: props.window }));
      tray.onClick = () => {
        props.window.toggleVisibility(true);
        props.window.activate();
      };
    }
  });

  // Kill program when main window is closed
  props.window.onClose.connect(() => {
    if (!tray || !appSettings().minimiseInsteadOfExit) {
      MessageLoop.quit();
      process.exit(0);
    }
  });

  props.window.shouldClose = () => {
    if (appSettings().minimiseInsteadOfExit) {
      if (tray) props.window.toggleVisibility(false);
      else props.window.minimize();
      return false;
    }
    return true;
  };

  setInterval(() => refreshDbLock(state), 1000);

  appearance.onColorSchemeChange.connect(() =>
    setDark(appearance.isDarkScheme())
  );
  return (
    <>
      <Toolbar window={props.window} />
      <Router navigator={navigator}>
        <WelcomePage window={props.window} />
        <PinentryPage navigator={navigator} />
        <TouchPage />
        <DatabaseIndexPage window={props.window} />
        <EntryPage />
        <SettingsPage window={props.window} />
        <PwGeneratorPage />
      </Router>
    </>
  );
}

export { App, navigator };
