import { Menu, MessageLoop, type Window } from 'gui';
import { t } from '#/data/i18n';
import * as navigator from '#/data/navigator';
import {
  setSelectedDbPath,
  setUnlockedDbIndex,
  unlockedDbIndex
} from '#/data/shared-state';

function TrayMenu(props: {
  win: Window;
  toggleVisibility: (win: Window, show: boolean) => void;
}) {
  const menu = Menu.create([
    {
      label: t('toggleWindow'),
      onClick: () => {
        if (props.win.isMinimized()) {
          props.toggleVisibility(props.win, true);
        } else {
          props.toggleVisibility(props.win, false);
        }
      }
    },
    {
      label: t('lockDb'),
      onClick: () => {
        setUnlockedDbIndex(null);
        setSelectedDbPath('');
        navigator.replace({ to: (pages) => pages.WELCOME });
      }
    },
    {
      label: t('quit'),
      onClick: () => {
        MessageLoop.quit();
        process.exit(0);
      }
    }
  ]);
  menu
    .itemAt(1)
    .setEnabled(
      unlockedDbIndex() !== null &&
        navigator.isCurrentPage((pages) => pages.DB_INDEX)
    );
  return menu;
}

export { TrayMenu };
