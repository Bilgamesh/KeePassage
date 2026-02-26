import {
  FileOpenDialog,
  type Menu,
  MenuBar,
  type MenuItem,
  MessageLoop,
  type Window,
} from 'gui';
import { DATABASE_EXTENSION, PAGE_INDEXES } from '@/data/constants';
import {
  addNewEntry,
  copyPassword,
  copyUrl,
  copyUsername,
  deleteEntry,
  editEntry,
  openDatabase,
  showQrCode,
} from '@/data/db-orchestrator';
import { t } from '@/data/i18n';
import {
  appSettings,
  copyingEnabled,
  mainPageIndex,
  selectedDbPath,
  selectedEntry,
  setMainPageIndex,
  setSelectedDbPath,
  setUnlockedDbIndex,
  unlockedDbIndex,
} from '@/data/shared-state';
import { DatabaseCreationPage } from '@/pages/database-creation-page';
import { openPasswordGenerator } from '@/pages/pw-generator-page';
import { openSettingsPage } from '@/pages/settings-page';
import { render } from '@/renderer';
import type { MenuItemOptions } from '@/renderer/types';
import { updateSettings } from '@/service/config-service';
import { open } from '@/utils/url-util';
import { getDatabaseWindow } from '@/windows/database-window';

const rules = () => [
  {
    labels: [t('recentDatabases')],
    enabled:
      appSettings().recent.length > 0 &&
      (mainPageIndex() === PAGE_INDEXES.WELCOME ||
        mainPageIndex() === PAGE_INDEXES.DB_INDEX),
  },
  {
    labels: [t('newDb...'), t('openDb...')],
    enabled:
      mainPageIndex() === PAGE_INDEXES.WELCOME ||
      mainPageIndex() === PAGE_INDEXES.DB_INDEX,
  },
  {
    labels: [t('lockDb')],
    enabled:
      unlockedDbIndex() !== null && mainPageIndex() === PAGE_INDEXES.DB_INDEX,
  },
  {
    labels: [t('entries'), t('newEntry')],
    enabled: mainPageIndex() === PAGE_INDEXES.DB_INDEX,
  },
  {
    labels: [
      t('editEntry'),
      t('deleteEntry'),
      t('copyUsername'),
      t('copyPassword'),
      t('showQrCode'),
      t('copyUrl'),
    ],
    enabled:
      mainPageIndex() === PAGE_INDEXES.DB_INDEX && selectedEntry() !== null,
  },
  {
    labels: [t('passwordGenerator'), t('settings')],
    enabled:
      mainPageIndex() === PAGE_INDEXES.WELCOME ||
      mainPageIndex() === PAGE_INDEXES.DB_INDEX,
  },
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
      label: t('db'),
      submenu: [
        {
          label: t('newDb...'),
          accelerator: 'CmdOrCtrl+Shift+N',
          onClick: async () => {
            if (
              mainPageIndex() === PAGE_INDEXES.WELCOME ||
              mainPageIndex() === PAGE_INDEXES.DB_INDEX
            ) {
              const win = getDatabaseWindow();
              render(
                () =>
                  DatabaseCreationPage({
                    window: win,
                    mainWindow: props.window,
                  }),
                win,
              );
              win.activate();
            }
          },
        },
        {
          label: t('openDb...'),
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
                  extensions: [DATABASE_EXTENSION],
                },
              ]);
              if (dialog.runForWindow(props.window)) {
                const path = dialog.getResult();
                openDatabase(props.window, path);
              }
            }
          },
        },
        {
          label: t('recentDatabases'),
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
              },
            })),
            { type: 'separator' },
            {
              label: t('clearHistory'),
              onClick: async () => {
                updateSettings((settings) => {
                  settings.recent.length = 0;
                  return settings;
                });
              },
            },
          ],
        },
        {
          label: t('lockDb'),
          accelerator: 'CmdOrCtrl+L',
          onClick: async () => {
            if (unlockedDbIndex() !== null) {
              setUnlockedDbIndex(null);
              setSelectedDbPath('');
              setMainPageIndex(PAGE_INDEXES.WELCOME);
            }
          },
        },
        {
          type: 'separator',
        },
        {
          label: t('quit'),
          accelerator: 'CmdOrCtrl+Q',
          onClick: async (_self) => {
            MessageLoop.quit();
            process.exit(0);
          },
        },
      ],
    },
    {
      label: t('entries'),
      submenu: [
        {
          label: t('newEntry'),
          accelerator: 'CmdOrCtrl+N',
          onClick: async () => {
            if (mainPageIndex() === PAGE_INDEXES.DB_INDEX) {
              addNewEntry();
            }
          },
        },
        {
          label: t('editEntry'),
          accelerator: 'CmdOrCtrl+E',
          onClick: async () => {
            if (
              mainPageIndex() === PAGE_INDEXES.DB_INDEX &&
              selectedEntry() !== null
            ) {
              editEntry(props.window);
            }
          },
        },
        {
          label: t('deleteEntry'),
          accelerator: 'Delete',
          onClick: async () => {
            if (
              mainPageIndex() === PAGE_INDEXES.DB_INDEX &&
              selectedEntry() !== null
            ) {
              deleteEntry(props.window);
            }
          },
        },
        { type: 'separator' },
        {
          label: t('copyUsername'),
          accelerator: 'CmdOrCtrl+B',
          onClick: async () => {
            if (
              mainPageIndex() === PAGE_INDEXES.DB_INDEX &&
              selectedEntry() !== null
            ) {
              copyUsername();
            }
          },
        },
        {
          label: t('copyPassword'),
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
          },
        },
        {
          label: t('showQrCode'),
          onClick: async () => {
            if (
              mainPageIndex() === PAGE_INDEXES.DB_INDEX &&
              selectedEntry() !== null
            ) {
              showQrCode(props.window);
            }
          },
        },
        {
          label: t('copyUrl'),
          accelerator: 'CmdOrCtrl+U',
          onClick: async () => {
            if (
              mainPageIndex() === PAGE_INDEXES.DB_INDEX &&
              selectedEntry() !== null
            ) {
              copyUrl();
            }
          },
        },
      ],
    },
    {
      label: t('tools'),
      submenu: [
        {
          label: t('passwordGenerator'),
          onClick: () => {
            if (
              mainPageIndex() === PAGE_INDEXES.WELCOME ||
              mainPageIndex() === PAGE_INDEXES.DB_INDEX
            ) {
              openPasswordGenerator();
            }
          },
        },
        {
          label: t('settings'),
          accelerator: 'CmdOrCtrl+,',
          onClick: () => {
            if (
              mainPageIndex() === PAGE_INDEXES.WELCOME ||
              mainPageIndex() === PAGE_INDEXES.DB_INDEX
            ) {
              openSettingsPage();
            }
          },
        },
      ],
    },
    {
      label: t('window'),
      submenu: [
        { label: t('minimize'), role: 'minimize' },
        { label: t('maximize'), role: 'maximize' },
      ],
    },
    {
      label: t('view'),
      submenu: [
        {
          label: t('alwaysOnTop'),
          type: 'checkbox',
          accelerator: 'CmdOrCtrl+Shift+A',
          checked: appSettings().alwaysOnTop,
          onClick: async () => {
            updateSettings((settings) => {
              settings.alwaysOnTop = !settings.alwaysOnTop;
              return settings;
            });
          },
        },
        {
          label: t('showPreviewPanel'),
          type: 'checkbox',
          checked: appSettings().showPreview,
          onClick: async () => {
            updateSettings((settings) => {
              settings.showPreview = !settings.showPreview;
              return settings;
            });
          },
        },
        {
          label: t('showMenubar'),
          type: 'checkbox',
          checked: appSettings().showMenuBar,
          onClick: async () => {
            updateSettings((settings) => {
              settings.showMenuBar = !settings.showMenuBar;
              return settings;
            });
          },
        },
        {
          label: t('showToolbar'),
          type: 'checkbox',
          checked: appSettings().showToolbar,
          onClick: async () => {
            updateSettings((settings) => {
              settings.showToolbar = !settings.showToolbar;
              return settings;
            });
          },
        },
        {
          label: t('hideUserNames'),
          type: 'checkbox',
          checked: appSettings().hideUserNames,
          accelerator: 'CmdOrCtrl+Shift+B',
          onClick: async () => {
            updateSettings((settings) => {
              settings.hideUserNames = !settings.hideUserNames;
              return settings;
            });
          },
        },
      ],
    },
    {
      label: t('help'),
      submenu: [
        // { label: 'Check for Updates' },
        {
          label: t('reportBug'),
          onClick: () => {
            open('https://github.com/Bilgamesh/KeePassage/issues');
          },
        },
        {
          label: t('about'),
          onClick: () => {
            open('https://github.com/Bilgamesh/KeePassage');
          },
        },
      ],
    },
  ] as MenuItemOptions[]);
  updateStatuses(menu);
  return menu;
}

export { MainMenuBar };
