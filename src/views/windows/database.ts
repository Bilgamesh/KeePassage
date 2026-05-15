import { Container, type Window } from 'gui';
import { createEffect } from 'solid-js';
import { MAX_SIZE, SUBWINDOW_MIN_SIZE } from '#/data/constants';
import { t } from '#/data/i18n';
import { createWindow, deleteWindow } from '#/utils/ui';

const title = () => t('createNewKeePassageDb');

let win: Window | null = null;

function DatabaseWindow(create?: boolean) {
  if (win || !create) return win;
  win = createWindow(title());
  const contentView = Container.create();
  contentView.setStyle({ flex: 1 });
  win.setContentView(contentView);
  win.setContentSize(SUBWINDOW_MIN_SIZE);
  win.center();
  if (process.platform === 'win32') win.setBackgroundColor('#f5f5f5');

  win.setContentSizeConstraints(SUBWINDOW_MIN_SIZE, MAX_SIZE);

  win.onClose.connect(() => {
    deleteWindow(title());
    win = null;
  });

  createEffect(() => {
    win?.setTitle(title());
  });

  return win;
}

export { DatabaseWindow };
