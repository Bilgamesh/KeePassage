import { Menu, type Window } from 'gui';
import { getTranslator } from '#/data/i18n';
import { useAppContext } from '#/data/shared-state';
import type { MenuItemOptions } from '#/renderer/types';
import {
  addNewEntry,
  copyPassword,
  copyUrl,
  copyUsername,
  deleteEntry,
  editEntry,
  showQrCode
} from '#/service/database';

function DatabaseIndexContextMenu(props: { window: Window }) {
  const state = useAppContext();
  const t = getTranslator(state);
  const { selectedEntry } = state;
  if (!selectedEntry())
    return Menu.create([
      {
        label: t('newEntry...'),
        onClick: (_self) => {
          addNewEntry(state);
        }
      }
    ] as MenuItemOptions[]);
  else
    return Menu.create([
      {
        label: t('copyUsername'),
        onClick: () => {
          copyUsername(state);
        }
      },
      {
        label: t('copyPassword'),
        onClick: () => {
          copyPassword(props.window, state);
        }
      },
      {
        label: t('showQrCode'),
        onClick: () => {
          showQrCode(props.window, state);
        }
      },
      {
        label: t('copyUrl'),
        onClick: () => {
          copyUrl(state);
        }
      },
      { type: 'separator' },
      {
        label: t('editEntry'),
        onClick: () => {
          editEntry(props.window, state);
        }
      },
      {
        label: t('deleteEntry'),
        onClick: () => {
          deleteEntry(props.window, state);
        }
      },
      {
        label: t('newEntry'),
        onClick: () => {
          addNewEntry(state);
        }
      }
    ] as MenuItemOptions[]);
}

export { DatabaseIndexContextMenu };
