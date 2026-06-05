import { Container, type Window } from 'gui';
import { createEffect, createRoot, onCleanup } from 'solid-js';
import {
  MAX_SIZE,
  SUBWINDOW_MIN_SIZE,
  WINDOWS_APP_BACKGROUND_COLOR
} from '#/data/constants';
import { t } from '#/data/i18n';
import { createWindow } from '#/utils/ui';

const title = () => t('createNewKeePassageDb');

let win: Window | null = null;

function DatabaseWindow(create?: boolean) {
  if (win || !create) return win;
  createRoot((dispose) => {
    win = createWindow(title());
    const contentView = Container.create();
    contentView.setStyle({ flex: 1 });
    win.setContentView(contentView);
    win.setContentSize(SUBWINDOW_MIN_SIZE);
    win.center();
    if (process.platform === 'win32')
      win.setBackgroundColor(WINDOWS_APP_BACKGROUND_COLOR);

    win.setContentSizeConstraints(SUBWINDOW_MIN_SIZE, MAX_SIZE);

    win.onClose.connect(() => {
      dispose();
    });

    onCleanup(() => {
      win = null;
    });

    createEffect(() => {
      win?.setTitle(title());
    });
  });
  return win;
}

export { DatabaseWindow };
