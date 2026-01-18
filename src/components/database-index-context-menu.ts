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
import { selectedEntry } from '@/data/shared-state';
import type { MenuItemOptions } from '@/renderer/types';

function DatabaseIndexContextMenu(props: { window: Window }) {
  if (!selectedEntry()) {
    return Menu.create([
      {
        label: 'New Entry...',
        onClick: (self) => {
          addNewEntry();
        }
      }
    ] as MenuItemOptions[]);
  } else {
    return Menu.create([
      {
        label: 'Copy Username',
        onClick: () => {
          copyUsername();
        }
      },
      {
        label: 'Copy Password',
        onClick: () => {
          copyPassword(props.window);
        }
      },
      {
        label: 'Show QR Code',
        onClick: () => {
          showQrCode(props.window);
        }
      },
      {
        label: 'Copy URL',
        onClick: () => {
          copyUrl();
        }
      },
      { type: 'separator' },
      {
        label: 'Edit Entry',
        onClick: () => {
          editEntry(props.window);
        }
      },
      {
        label: 'Delete Entry',
        onClick: () => {
          deleteEntry(props.window);
        }
      },
      {
        label: 'New Entry',
        onClick: () => {
          addNewEntry();
        }
      }
    ] as MenuItemOptions[]);
  }
}

export { DatabaseIndexContextMenu };
