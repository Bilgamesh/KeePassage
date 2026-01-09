import { DATABASE_EXTENSION, PAGE_INDEXES } from '@/data/constants';
import {
  addNewEntry,
  copyPassword,
  copyUrl,
  copyUsername,
  deleteEntry,
  editEntry,
  openDatabase,
  showQrCode
} from '@/data/db-orchestrator';
import {
  appSettings,
  copyingEnabled,
  mainPageIndex,
  selectedDbPath,
  selectedEntry,
  setMainPageIndex,
  setSelectedDbPath,
  setUnlockedDbIndex,
  unlockedDbIndex
} from '@/data/shared-state';
import { DatabaseCreationPage } from '@/pages/database-creation-page';
import { openPasswordGenerator } from '@/pages/pw-generator-page';
import { openSettingsPage } from '@/pages/settings-page';
import { render } from '@/renderer';
import { MenuItemOptions } from '@/renderer/types';
import { updateSettings } from '@/service/config-service';
import { open } from '@/utils/url-util';
import { getDatabaseWindow } from '@/windows/database-window';
import { FileOpenDialog, Menu, MenuBar, MenuItem, MessageLoop, Window } from 'gui';

const rules = () => [
  {
    labels: ['Recent Databases'],
    enabled:
      appSettings().recent.length > 0 &&
      (mainPageIndex() === PAGE_INDEXES.WELCOME || mainPageIndex() === PAGE_INDEXES.DB_INDEX)
  },
  {
    labels: ['New Database...', 'Open Database...'],
    enabled: mainPageIndex() === PAGE_INDEXES.WELCOME || mainPageIndex() === PAGE_INDEXES.DB_INDEX
  },
  {
    labels: ['Lock Database'],
    enabled: unlockedDbIndex() !== null && mainPageIndex() === PAGE_INDEXES.DB_INDEX
  },
  {
    labels: ['Entries', 'New Entry'],
    enabled: mainPageIndex() === PAGE_INDEXES.DB_INDEX
  },
  {
    labels: [
      'Edit Entry',
      'Delete Entry',
      'Copy Username',
      'Copy Password',
      'Show QR Code',
      'Copy URL'
    ],
    enabled: mainPageIndex() === PAGE_INDEXES.DB_INDEX && selectedEntry() !== null
  },
  {
    labels: ['Password Generator', 'Settings'],
    enabled: mainPageIndex() === PAGE_INDEXES.WELCOME || mainPageIndex() === PAGE_INDEXES.DB_INDEX
  }
];

function updateStatus(item: MenuItem) {
  const rule = rules().find((rule) => rule.labels.includes(item.getLabel()));
  if (rule) {
    item.setEnabled(rule.enabled);
  }
}

function updateStatuses(menu: Menu | MenuBar) {
  for (let i = 0; i < menu.itemCount(); i++) {
    const item = menu.itemAt(i);
    updateStatus(item);
    const submenu = item.getSubmenu();
    if (submenu) {
      updateStatuses(submenu);
    }
  }
}

function MainMenuBar(props: { window: Window }) {
  const menu = MenuBar.create([
    {
      label: 'Database',
      submenu: [
        {
          label: 'New Database...',
          accelerator: 'CmdOrCtrl+Shift+N',
          onClick: async () => {
            if (
              mainPageIndex() === PAGE_INDEXES.WELCOME ||
              mainPageIndex() === PAGE_INDEXES.DB_INDEX
            ) {
              const win = getDatabaseWindow();
              render(() => DatabaseCreationPage({ window: win, mainWindow: props.window }), win);
              win.activate();
            }
          }
        },
        {
          label: 'Open Database...',
          accelerator: 'CmdOrCtrl+O',
          onClick: async () => {
            if (
              mainPageIndex() === PAGE_INDEXES.WELCOME ||
              mainPageIndex() === PAGE_INDEXES.DB_INDEX
            ) {
              const dialog = FileOpenDialog.create();
              dialog.setFilters([
                {
                  description: 'KeePassage Database',
                  extensions: [DATABASE_EXTENSION]
                }
              ]);
              if (dialog.runForWindow(props.window)) {
                const path = dialog.getResult();
                openDatabase(props.window, path);
              }
            }
          }
        },
        {
          label: 'Recent Databases',
          submenu: [
            ...appSettings().recent.map((path) => ({
              label: path,
              onClick: async () => {
                if (
                  selectedDbPath() !== path &&
                  (mainPageIndex() === PAGE_INDEXES.WELCOME ||
                    mainPageIndex() === PAGE_INDEXES.DB_INDEX)
                ) {
                  openDatabase(props.window, path);
                }
              }
            })),
            { type: 'separator' },
            {
              label: 'Clear history',
              onClick: async () => {
                updateSettings((settings) => {
                  settings.recent.length = 0;
                  return settings;
                });
              }
            }
          ]
        },
        {
          label: 'Lock Database',
          accelerator: 'CmdOrCtrl+L',
          onClick: async () => {
            if (unlockedDbIndex() !== null) {
              setUnlockedDbIndex(null);
              setSelectedDbPath('');
              setMainPageIndex(PAGE_INDEXES.WELCOME);
            }
          }
        },
        {
          type: 'separator'
        },
        {
          label: 'Quit',
          accelerator: 'CmdOrCtrl+Q',
          onClick: async (self) => {
            MessageLoop.quit();
            process.exit(0);
          }
        }
      ]
    },
    {
      label: 'Entries',
      submenu: [
        {
          label: 'New Entry',
          accelerator: 'CmdOrCtrl+N',
          onClick: async () => {
            if (mainPageIndex() === PAGE_INDEXES.DB_INDEX) {
              addNewEntry();
            }
          }
        },
        {
          label: 'Edit Entry',
          accelerator: 'CmdOrCtrl+E',
          onClick: async () => {
            if (mainPageIndex() === PAGE_INDEXES.DB_INDEX && selectedEntry() !== null) {
              editEntry(props.window);
            }
          }
        },
        {
          label: 'Delete Entry',
          accelerator: 'Delete',
          onClick: async () => {
            if (mainPageIndex() === PAGE_INDEXES.DB_INDEX && selectedEntry() !== null) {
              deleteEntry(props.window);
            }
          }
        },
        { type: 'separator' },
        {
          label: 'Copy Username',
          accelerator: 'CmdOrCtrl+B',
          onClick: async () => {
            if (mainPageIndex() === PAGE_INDEXES.DB_INDEX && selectedEntry() !== null) {
              copyUsername();
            }
          }
        },
        {
          label: 'Copy Password',
          accelerator:
            mainPageIndex() === PAGE_INDEXES.DB_INDEX &&
            selectedEntry() !== null &&
            copyingEnabled()
              ? 'CmdOrCtrl+C'
              : null,
          onClick: async () => {
            if (
              mainPageIndex() === PAGE_INDEXES.DB_INDEX &&
              selectedEntry() !== null &&
              copyingEnabled()
            ) {
              copyPassword(props.window);
            }
          }
        },
        {
          label: 'Show QR Code',
          onClick: async () => {
            if (mainPageIndex() === PAGE_INDEXES.DB_INDEX && selectedEntry() !== null) {
              showQrCode(props.window);
            }
          }
        },
        {
          label: 'Copy URL',
          accelerator: 'CmdOrCtrl+U',
          onClick: async () => {
            if (mainPageIndex() === PAGE_INDEXES.DB_INDEX && selectedEntry() !== null) {
              copyUrl();
            }
          }
        }
      ]
    },
    {
      label: 'Tools',
      submenu: [
        {
          label: 'Password Generator',
          onClick: () => {
            if (
              mainPageIndex() === PAGE_INDEXES.WELCOME ||
              mainPageIndex() === PAGE_INDEXES.DB_INDEX
            ) {
              openPasswordGenerator();
            }
          }
        },
        {
          label: 'Settings',
          accelerator: 'CmdOrCtrl+,',
          onClick: () => {
            if (
              mainPageIndex() === PAGE_INDEXES.WELCOME ||
              mainPageIndex() === PAGE_INDEXES.DB_INDEX
            ) {
              openSettingsPage();
            }
          }
        }
      ]
    },
    {
      label: 'Window',
      submenu: [{ role: 'minimize' }, { role: 'maximize' }]
    },
    {
      label: 'View',
      submenu: [
        {
          label: 'Always on Top',
          type: 'checkbox',
          accelerator: 'CmdOrCtrl+Shift+A',
          checked: appSettings().alwaysOnTop,
          onClick: async () => {
            updateSettings((settings) => {
              settings.alwaysOnTop = !settings.alwaysOnTop;
              return settings;
            });
          }
        },
        {
          label: 'Show Preview Panel',
          type: 'checkbox',
          checked: appSettings().showPreview,
          onClick: async () => {
            updateSettings((settings) => {
              settings.showPreview = !settings.showPreview;
              return settings;
            });
          }
        },
        {
          label: 'Show Menu Bar',
          type: 'checkbox',
          checked: appSettings().showMenuBar,
          onClick: async () => {
            updateSettings((settings) => {
              settings.showMenuBar = !settings.showMenuBar;
              return settings;
            });
          }
        },
        {
          label: 'Show Toolbar',
          type: 'checkbox',
          checked: appSettings().showToolbar,
          onClick: async () => {
            updateSettings((settings) => {
              settings.showToolbar = !settings.showToolbar;
              return settings;
            });
          }
        },
        {
          label: 'Hide Usernames',
          type: 'checkbox',
          checked: appSettings().hideUserNames,
          accelerator: 'CmdOrCtrl+Shift+B',
          onClick: async () => {
            updateSettings((settings) => {
              settings.hideUserNames = !settings.hideUserNames;
              return settings;
            });
          }
        }
      ]
    },
    {
      label: 'Help',
      submenu: [
        // { label: 'Check for Updates' },
        {
          label: 'Report a Bug',
          onClick: () => {
            open('https://github.com/Bilgamesh/KeePassage/issues');
          }
        },
        {
          label: 'About',
          onClick: () => {
            open('https://github.com/Bilgamesh/KeePassage');
          }
        }
      ]
    }
  ] as MenuItemOptions[]);
  updateStatuses(menu);
  return menu;
}

export { MainMenuBar };
