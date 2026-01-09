import { APP_NAME, MAX_SIZE, SUBWINDOW_MIN_SIZE } from '@/data/constants';
import { createWindow, deleteWindow, getWindow } from '@/data/window-manager';
import { Container } from 'gui';

const title = `Create a new ${APP_NAME} database`;

function createDatabaseWindow() {
  const win = createWindow(title);
  const contentView = Container.create();
  contentView.setStyle({ flex: 1 });
  win.setContentView(contentView);
  win.setContentSize(SUBWINDOW_MIN_SIZE);
  win.center();
  win.setBackgroundColor('#f5f5f5');
  win.setContentSizeConstraints(SUBWINDOW_MIN_SIZE, MAX_SIZE);

  win.onClose.connect(() => {
    deleteWindow(title);
  });

  return win;
}

function hasDatabaseWindow() {
  return !!getWindow(title);
}

function getDatabaseWindow() {
  const win = getWindow(title);
  if (win) {
    return win;
  }
  return createDatabaseWindow();
}

export { getDatabaseWindow, hasDatabaseWindow };
