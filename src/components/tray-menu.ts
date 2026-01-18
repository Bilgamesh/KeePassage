import { Menu, MessageLoop, Window } from 'gui';

import { PAGE_INDEXES } from '@/data/constants';
import { t } from '@/data/i18n';
import {
  mainPageIndex,
  setMainPageIndex,
  setSelectedDbPath,
  setUnlockedDbIndex,
  unlockedDbIndex
} from '@/data/shared-state';

function TrayMenu(props: { win: Window; toggleVisibility: (win: Window, show: boolean) => void }) {
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
        setMainPageIndex(PAGE_INDEXES.WELCOME);
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
    .setEnabled(unlockedDbIndex() !== null && mainPageIndex() === PAGE_INDEXES.DB_INDEX);
  return menu;
}

export { TrayMenu };
