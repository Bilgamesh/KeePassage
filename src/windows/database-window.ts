import { Container } from 'gui';
import { createEffect } from 'solid-js';

import { MAX_SIZE, SUBWINDOW_MIN_SIZE } from '@/data/constants';
import { t } from '@/data/i18n';
import { createWindow, deleteWindow, getWindow } from '@/data/window-manager';

const title = () => t('createNewKeePassageDb');

function createDatabaseWindow() {
  let isClosed = false;
  const win = createWindow(title());
  const contentView = Container.create();
  contentView.setStyle({ flex: 1 });
  win.setContentView(contentView);
  win.setContentSize(SUBWINDOW_MIN_SIZE);
  win.center();
  if (process.platform === 'win32') {
    win.setBackgroundColor('#f5f5f5');
  }
  win.setContentSizeConstraints(SUBWINDOW_MIN_SIZE, MAX_SIZE);

  win.onClose.connect(() => {
    deleteWindow(title());
    isClosed = true;
  });

  createEffect(() => {
    if (!isClosed) {
      win.setTitle(title());
    }
  });

  return win;
}

function hasDatabaseWindow() {
  return !!getWindow(title());
}

function getDatabaseWindow() {
  const win = getWindow(title());
  if (win) {
    return win;
  }
  return createDatabaseWindow();
}

export { getDatabaseWindow, hasDatabaseWindow };
