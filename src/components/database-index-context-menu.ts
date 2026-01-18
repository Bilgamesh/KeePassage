import { Menu, Window } from 'gui';

import {
  addNewEntry,
  copyPassword,
  copyUrl,
  copyUsername,
  deleteEntry,
  editEntry,
  showQrCode
} from '@/data/db-orchestrator';
import { t } from '@/data/i18n';
import { selectedEntry } from '@/data/shared-state';
import type { MenuItemOptions } from '@/renderer/types';

function DatabaseIndexContextMenu(props: { window: Window }) {
  if (!selectedEntry()) {
    return Menu.create([
      {
        label: t('newEntry...'),
        onClick: (self) => {
          addNewEntry();
        }
      }
    ] as MenuItemOptions[]);
  } else {
    return Menu.create([
      {
        label: t('copyUsername'),
        onClick: () => {
          copyUsername();
        }
      },
      {
        label: t('copyPassword'),
        onClick: () => {
          copyPassword(props.window);
        }
      },
      {
        label: t('showQrCode'),
        onClick: () => {
          showQrCode(props.window);
        }
      },
      {
        label: t('copyUrl'),
        onClick: () => {
          copyUrl();
        }
      },
      { type: 'separator' },
      {
        label: t('editEntry'),
        onClick: () => {
          editEntry(props.window);
        }
      },
      {
        label: t('deleteEntry'),
        onClick: () => {
          deleteEntry(props.window);
        }
      },
      {
        label: t('newEntry'),
        onClick: () => {
          addNewEntry();
        }
      }
    ] as MenuItemOptions[]);
  }
}

export { DatabaseIndexContextMenu };
