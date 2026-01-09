import { TableColumn } from '@/renderer/types';
import { Settings } from '@/schemas/settings-schema';

export const APP_NAME = 'KeePassage';
export const APP_ID = 'keepassage';
export const VERSION = '0.9.0';
export const MIN_SIZE = { width: 800, height: 600 } as const;
export const SUBWINDOW_MIN_SIZE = { width: 800, height: 500 } as const;
export const MAX_SIZE = { width: 0, height: 0 } as const;
export const APP_BACKGROUND_COLOR = '#f5f5f5';
export const DATABASE_EXTENSION = 'kpgdb';
export const PAGE_INDEXES = {
  WELCOME: 0,
  PINTENTRY: 1,
  TOUCH: 2,
  DB_INDEX: 3,
  ENTRY: 4,
  SETTINGS: 5,
  GENERATOR: 6
} as const;

export const DATABASE_COLUMNS: TableColumn[] = [
  {
    label: 'Title',
    options: {
      type: 'text',
      width: 150
    }
  },
  {
    label: 'Username',
    options: {
      type: 'text',
      width: 150
    }
  },
  {
    label: 'URL',
    options: {
      type: 'text',
      width: 150
    }
  },
  {
    label: 'Notes',
    options: {
      type: 'text',
      width: 150
    }
  },
  {
    label: 'Modified',
    options: {
      type: 'text',
      width: 140
    }
  }
] as const;
export const DEFAULT_SETTINGS: Settings = {
  recent: [],
  alwaysOnTop: false,
  hideUserNames: false,
  showMenuBar: true,
  showPreview: true,
  showToolbar: true,
  showTrayIcon: false,
  minimiseInsteadOfExit: false,
  clipboardTimout: 10,
  dbTimeout: 900,
  dbMinimiseLock: false
};
