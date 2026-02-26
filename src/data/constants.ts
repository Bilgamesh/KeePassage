import { Font } from 'gui';
import type { Style } from '@/renderer/types';
import type { Settings } from '@/schemas/settings-schema';

export const APP_NAME = 'KeePassage';
export const APP_ID = 'keepassage';
export const VERSION = '0.9.2';
export const DISABLED_COLOR = '#777777';
export const DARK_MODE_FONT_COLOR = '#FFFFFF';
export const WINDOWS_APP_BACKGROUND_COLOR = '#f5f5f5';
export const MIN_SIZE = { width: 800, height: 600 } as const;
export const SUBWINDOW_MIN_SIZE = { width: 800, height: 500 } as const;
export const MAX_SIZE = { width: 0, height: 0 } as const;
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
export const SMALL_BUTTON_STYLE: Style = {
  height: 30,
  width: 80
};
export const LARGE_BUTTON_STYLE: Style = {
  height: 30,
  width: 140
};
export const ENTRY_BUTTON_STYLE: Style = {
  height: 25,
  width: 25
};
export const SMALL_ENTRY_STYLE: Style = {
  height: 20
};
export const LARGE_ENTRY_STYLE: Style = {
  height: 25
};
export const PASSWORD_FONT = Font.create('Consolas', 18, 'normal', 'normal');
export const TITLE_FONT = Font.create('Arial', 18, 'bold', 'normal');
export const PREVIEW_LABEL_FONT = Font.create('Arial', 12, 'bold', 'normal');

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
  dbMinimiseLock: false,
  language: 'en'
};
