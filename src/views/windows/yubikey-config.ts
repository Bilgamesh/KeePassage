import { Container, type Window } from 'gui';
import { createEffect, createRoot } from 'solid-js';
import {
  MAX_SIZE,
  SUBWINDOW_MIN_SIZE,
  WINDOWS_APP_BACKGROUND_COLOR
} from '#/data/constants';
import { t } from '#/data/i18n';
import { createWindow, getWindow } from '#/utils/ui';

const title = () => t('configureYubikey');

function YubiKeyConfigWindow(create?: boolean) {
  const existing = getWindow(title());
  if (existing || !create) return existing;
  let win: Window;
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

    createEffect(() => {
      win?.setTitle(title());
    });
  });

  return win!;
}

export { YubiKeyConfigWindow };
