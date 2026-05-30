import { Menu, MessageLoop } from 'gui';
import { navigator } from '#/app';
import { t } from '#/data/i18n';
import {
  setSelectedDbPath,
  setUnlockedDbIndex,
  unlockedDbIndex
} from '#/data/shared-state';
import type { ToggleableWindow } from '#/views/windows/main';

function TrayMenu(props: { win: ToggleableWindow }) {
  const menu = Menu.create([
    {
      label: t('toggleWindow'),
      onClick: () => {
        if (props.win.isMinimized()) props.win.toggleVisibility(true);
        else props.win.toggleVisibility(false);
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
